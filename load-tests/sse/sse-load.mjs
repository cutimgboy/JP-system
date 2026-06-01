#!/usr/bin/env node

const BASE_URL = (process.env.BASE_URL || 'http://8.134.77.172').replace(/\/$/, '');
const API_PREFIX = normalizePrefix(process.env.API_PREFIX || '/api');
const CONNECTIONS = Number(process.env.CONNECTIONS || 50);
const DURATION_SECONDS = Number(process.env.DURATION_SECONDS || 180);
const RAMP_SECONDS = Number(process.env.RAMP_SECONDS || 30);
const REPORT_INTERVAL_SECONDS = Number(process.env.REPORT_INTERVAL_SECONDS || 10);
const CONNECT_TIMEOUT_MS = Number(process.env.CONNECT_TIMEOUT_MS || 10000);
const CODES = (process.env.CODES || 'BTC,ETH,AAPL,NVDA,TSLA')
  .split(',')
  .map((code) => code.trim())
  .filter(Boolean);

const startedAt = Date.now();
const stopAt = startedAt + DURATION_SECONDS * 1000;
const abortControllers = [];
const firstEventLatencies = [];
const firstTickLatencies = [];
const eventGaps = [];
let eventGapMaxMs = 0;
let stopRequested = false;
let resolveStopSignal;
const stopSignal = new Promise((resolve) => {
  resolveStopSignal = resolve;
});

const metrics = {
  requested: CONNECTIONS,
  opened: 0,
  connected: 0,
  active: 0,
  closed: 0,
  connectErrors: 0,
  streamErrors: 0,
  badStatus: 0,
  bytes: 0,
  events: 0,
  connectedEvents: 0,
  ticks: 0,
  heartbeats: 0,
  malformedEvents: 0,
};

if (CODES.length === 0) {
  console.error('CODES must contain at least one product code.');
  process.exit(1);
}

console.log(JSON.stringify({
  target: `${BASE_URL}${API_PREFIX}/api/quote/stream/:code`,
  connections: CONNECTIONS,
  durationSeconds: DURATION_SECONDS,
  rampSeconds: RAMP_SECONDS,
  codes: CODES,
}, null, 2));

process.on('SIGINT', requestStop);
process.on('SIGTERM', requestStop);

function requestStop() {
  stopRequested = true;
  stopAll();
  resolveStopSignal();
}

const reporter = setInterval(reportProgress, REPORT_INTERVAL_SECONDS * 1000);
reporter.unref?.();

await run();
clearInterval(reporter);
reportProgress(true);

const hasFailure = metrics.badStatus > 0 || metrics.connectErrors > 0 || metrics.streamErrors > 0;
process.exit(stopRequested ? 130 : hasFailure ? 1 : 0);

async function run() {
  const rampDelayMs = CONNECTIONS > 1 && RAMP_SECONDS > 0
    ? (RAMP_SECONDS * 1000) / CONNECTIONS
    : 0;
  const tasks = [];

  for (let index = 0; index < CONNECTIONS; index += 1) {
    if (stopRequested || Date.now() >= stopAt) {
      break;
    }

    const code = CODES[index % CODES.length];
    tasks.push(openSseConnection(index + 1, code));

    if (rampDelayMs > 0) {
      await waitForStopOrTimeout(rampDelayMs);
    }
  }

  const remainingMs = Math.max(stopAt - Date.now(), 0);
  await waitForStopOrTimeout(remainingMs);
  stopAll();
  await Promise.allSettled(tasks);
}

async function openSseConnection(id, code) {
  const url = `${BASE_URL}${API_PREFIX}/api/quote/stream/${encodeURIComponent(code)}`;
  const controller = new AbortController();
  abortControllers.push(controller);
  const connectStartedAt = Date.now();
  let firstEventSeen = false;
  let firstTickSeen = false;
  let lastEventAt = 0;
  let active = false;

  const timeout = setTimeout(() => {
    controller.abort(new Error('connect timeout'));
  }, CONNECT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        'User-Agent': 'JP-system-sse-load-test/1.0',
      },
    });
    clearTimeout(timeout);

    metrics.opened += 1;
    if (response.status !== 200) {
      metrics.badStatus += 1;
      return;
    }

    metrics.connected += 1;
    metrics.active += 1;
    active = true;

    const reader = response.body?.getReader();
    if (!reader) {
      metrics.streamErrors += 1;
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (!controller.signal.aborted && Date.now() < stopAt) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      metrics.bytes += value.byteLength;
      buffer += decoder.decode(value, { stream: true });

      const events = splitSseEvents(buffer);
      buffer = events.remainder;

      for (const rawEvent of events.complete) {
        const now = Date.now();
        metrics.events += 1;

        if (!firstEventSeen) {
          firstEventSeen = true;
          firstEventLatencies.push(now - connectStartedAt);
        }

        if (lastEventAt > 0) {
          const eventGap = now - lastEventAt;
          eventGaps.push(eventGap);
          if (eventGap > eventGapMaxMs) {
            eventGapMaxMs = eventGap;
          }
        }
        lastEventAt = now;

        const parsed = parseSseData(rawEvent);
        if (!parsed) {
          metrics.malformedEvents += 1;
          continue;
        }

        if (parsed.type === 'connected') {
          metrics.connectedEvents += 1;
        } else if (parsed.type === 'heartbeat') {
          metrics.heartbeats += 1;
        } else if (parsed.type === 'tick') {
          metrics.ticks += 1;
          if (!firstTickSeen) {
            firstTickSeen = true;
            firstTickLatencies.push(now - connectStartedAt);
          }
        }
      }
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      metrics.connectErrors += 1;
      console.error(`[conn ${id}] ${code} ${error.message}`);
    }
  } finally {
    clearTimeout(timeout);
    if (active && metrics.active > 0) {
      metrics.active -= 1;
    }
    metrics.closed += 1;
  }
}

function splitSseEvents(buffer) {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');
  return {
    complete: parts.slice(0, -1),
    remainder: parts[parts.length - 1],
  };
}

function parseSseData(rawEvent) {
  const dataLines = rawEvent
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) {
    return null;
  }

  const data = dataLines.join('\n');
  try {
    const parsed = JSON.parse(data);
    return parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
  } catch (_) {
    return null;
  }
}

function reportProgress(final = false) {
  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  const eventRate = elapsedSeconds > 0 ? metrics.events / elapsedSeconds : 0;
  const tickRate = elapsedSeconds > 0 ? metrics.ticks / elapsedSeconds : 0;
  const mbReceived = metrics.bytes / 1024 / 1024;

  const summary = {
    phase: final ? 'final' : 'progress',
    elapsedSeconds: round(elapsedSeconds),
    requested: metrics.requested,
    opened: metrics.opened,
    active: metrics.active,
    connectedEvents: metrics.connectedEvents,
    ticks: metrics.ticks,
    heartbeats: metrics.heartbeats,
    eventsPerSecond: round(eventRate),
    ticksPerSecond: round(tickRate),
    mbReceived: round(mbReceived),
    connectErrors: metrics.connectErrors,
    streamErrors: metrics.streamErrors,
    badStatus: metrics.badStatus,
    malformedEvents: metrics.malformedEvents,
    firstEventP95Ms: percentile(firstEventLatencies, 95),
    firstTickP95Ms: percentile(firstTickLatencies, 95),
    eventGapP95Ms: percentile(eventGaps, 95),
    eventGapMaxMs,
  };

  console.log(JSON.stringify(summary));
}

function stopAll() {
  for (const controller of abortControllers) {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForStopOrTimeout(ms) {
  if (ms <= 0 || stopRequested) {
    return Promise.resolve();
  }
  return Promise.race([sleep(ms), stopSignal]);
}

function normalizePrefix(prefix) {
  if (!prefix || prefix === '/') {
    return '';
  }
  return prefix.startsWith('/') ? prefix.replace(/\/$/, '') : `/${prefix.replace(/\/$/, '')}`;
}

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, Math.min(index, sorted.length - 1))]);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

const VND_LOCALE = 'en-US';

interface FormatVndOptions {
  showCode?: boolean;
  signed?: boolean;
}

export function formatVndAmount(value: number | string | null | undefined, options: FormatVndOptions = {}) {
  const { showCode = true, signed = false } = options;
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const sign = safeValue < 0 ? '-' : signed && safeValue > 0 ? '+' : '';
  const formatted = Math.abs(Math.trunc(safeValue)).toLocaleString(VND_LOCALE);

  return `${sign}${formatted}${showCode ? ' VND' : ''}`;
}

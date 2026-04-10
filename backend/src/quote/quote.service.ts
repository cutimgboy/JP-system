import { Injectable, OnModuleInit, OnModuleDestroy, Logger, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import WebSocket from 'ws';
import { RedisService } from '../redis/redis.service';
import {
  StockTickData,
  TickPushMessage,
  SubscribeResponse,
  HeartbeatResponse,
  MessageCommandId,
} from './entities/stock-tick.entity';
import { StockRealtimePriceEntity } from './entities/stock-realtime-price.entity';
import { StockPriceChangeEntity } from './entities/stock-price-change.entity';
import { TradingSettingsEntity } from '../cfd/entities/trading-settings.entity';
import { ProductEntity } from '../cfd/entities/product.entity';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * 行情订阅服务
 * 负责连接外部行情数据源 (alltick.co)
 */
@Injectable()
export class QuoteService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuoteService.name);
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private mockDataTimer: NodeJS.Timeout | null = null;
  private dbFlushTimer: NodeJS.Timeout | null = null;
  private allQuotesRefreshTimer: NodeJS.Timeout | null = null;
  private readonly reconnectInterval = 5000; // 5秒重连
  private readonly heartbeatInterval = 10000; // 10秒心跳（按照API要求）
  private readonly allQuotesRefreshInterval = 1000;
  private readonly dbFlushInterval = 1000;
  private readonly dbBatchSize = 200;
  private readonly maxBufferedDbRows = 5000;
  private dbFlushInProgress = false;
  private droppedDbRows = 0;
  private lastDroppedRowsWarnAt = 0;

  // 订阅的股票列表 - 从数据库动态获取
  private subscribedSymbols: Set<string> = new Set();

  // 模拟数据相关 - 当前价格
  private mockPrices: Map<string, number> = new Map();

  // 产品列表缓存
  private productsCache: ProductEntity[] = [];
  private tradingSettingsCache: Map<string, TradingSettingsEntity> = new Map();
  private latestQuoteCache: Map<string, any> = new Map();

  private maskSecret(secret: string | undefined): string {
    if (!secret) {
      return '[empty]';
    }

    if (secret.length <= 8) {
      return `${secret.slice(0, 2)}***${secret.slice(-1)}`;
    }

    return `${secret.slice(0, 4)}***${secret.slice(-4)}`;
  }

  /**
   * 获取目标股票列表（从数据库）
   */
  private async getTargetSymbols(): Promise<string[]> {
    if (this.productsCache.length === 0) {
      await this.loadProductsFromDatabase();
    }
    return this.productsCache.map(p => p.code);
  }
  
  // 序列号计数器
  private sequenceId: number = 1;
  
  // 用于去重的最近收到的Tick数据缓存
  private recentTickCache: Map<string, number> = new Map();
  private readonly cacheExpiryTime = 1000; // 1秒内的重复数据将被过滤
  private pendingTicks: Map<string, StockTickData> = new Map();
  private processingTickCodes: Set<string> = new Set();
  private realtimePriceBuffer: Array<Partial<StockRealtimePriceEntity>> = [];
  private priceChangeBuffer: Array<Partial<StockPriceChangeEntity>> = [];

  // SSE 推送主题
  private tickSubject = new Subject<{ code: string; data: any }>();

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    @InjectRepository(StockRealtimePriceEntity)
    private stockRealtimePriceRepository: Repository<StockRealtimePriceEntity>,
    @InjectRepository(StockPriceChangeEntity)
    private stockPriceChangeRepository: Repository<StockPriceChangeEntity>,
    @InjectRepository(TradingSettingsEntity)
    private tradingSettingsRepository: Repository<TradingSettingsEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * 从数据库加载产品列表
   */
  private async loadProductsFromDatabase(): Promise<void> {
    try {
      this.productsCache = await this.productRepository.find({
        where: { isActive: true },
      });
      this.logger.log(`从数据库加载了 ${this.productsCache.length} 个产品`);
    } catch (error) {
      this.logger.error('加载产品列表失败:', error);
      this.productsCache = [];
    }
  }

  private async loadTradingSettingsCache(): Promise<void> {
    try {
      const settings = await this.tradingSettingsRepository.find();
      this.tradingSettingsCache = new Map(
        settings.map((item) => [item.code, item]),
      );
      this.logger.log(`加载了 ${this.tradingSettingsCache.size} 条交易配置`);
    } catch (error) {
      this.logger.error('加载交易配置失败:', error);
      this.tradingSettingsCache.clear();
    }
  }

  async onModuleInit() {
    this.logger.log('QuoteService 初始化...');

    const disableQuoteInit =
      this.configService.get('DISABLE_QUOTE_INIT', 'false') === 'true';

    if (disableQuoteInit) {
      this.logger.warn('QuoteService 自动初始化已禁用');
      return;
    }

    await this.loadTradingSettingsCache();
    this.startDbFlushWorker();

    // 检查是否启用模拟模式
    const mockMode = this.configService.get('MOCK_QUOTE_DATA', 'false') === 'true';

    if (mockMode) {
      this.logger.warn('⚠️  模拟数据模式已启用');
      this.startMockDataGeneration();
    } else {
      // 模块启动时自动连接真实数据源
      await this.connect();
    }
  }

  async onModuleDestroy() {
    this.logger.log('QuoteService 销毁，断开连接...');
    this.disconnect();
    this.stopMockDataGeneration();
    this.stopDbFlushWorker();
    if (this.allQuotesRefreshTimer) {
      clearTimeout(this.allQuotesRefreshTimer);
      this.allQuotesRefreshTimer = null;
    }
    await this.flushDatabaseBuffers(true);
  }

  /**
   * 连接到外部行情数据源
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.logger.warn('WebSocket 已经连接');
      return;
    }

    const token = this.configService.get('QUOTE_WS_TOKEN', 'testtoken');
    this.logger.log(`使用 Token: ${this.maskSecret(token)}`);
    // 股票 API 地址 - 使用正确的 alltick.co 股票 WebSocket API
    const url = `wss://quote.alltick.co/quote-stock-b-ws-api?token=${token}`;
    
    this.logger.log('正在连接到行情服务器: wss://quote.alltick.co/quote-stock-b-ws-api');

    this.ws = new WebSocket(url);

    if (this.ws) {
      this.ws.on('open', () => this.onOpen());
      this.ws.on('message', (data: WebSocket.Data) => this.onMessage(data));
      this.ws.on('error', (error: Error) => this.onError(error));
      this.ws.on('close', (code: number, reason: Buffer) => this.onClose(code, reason));
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 连接打开回调
   */
  private async onOpen(): Promise<void> {
    this.logger.log('✅ WebSocket 连接成功！');

    // 启动心跳机制
    this.startHeartbeat();
    this.logger.log('心跳机制已启动');

    // 订阅数据库中的股票
    const targetSymbols = await this.getTargetSymbols();
    this.subscribe(targetSymbols);
    this.logger.log(`已订阅目标股票: ${targetSymbols.join(', ')}`);
  }

  /**
   * 接收消息回调
   */
  private onMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      // 根据命令ID处理不同类型的消息
      switch (message.cmd_id) {
        case MessageCommandId.TICK_PUSH:
          this.handleTickData(message as TickPushMessage);
          break;
        case MessageCommandId.SUBSCRIBE_RESPONSE:
          this.handleSubscribeResponse(message as SubscribeResponse);
          break;
        case MessageCommandId.HEARTBEAT_RESPONSE:
          this.handleHeartbeatResponse(message as HeartbeatResponse);
          break;
        default:
          this.logger.debug(`收到未处理的消息类型: ${message.cmd_id}`);
          this.logger.debug(`完整消息内容:`, message);
      }
    } catch (error) {
      this.logger.error('解析消息失败:', error);
    }
  }

  /**
   * 处理 Tick 数据推送
   */
  private handleTickData(message: TickPushMessage): void {
    const tickData = message.data;
    
    // 创建唯一键：股票代码 + 价格 + 时间戳
    const uniqueKey = `${tickData.code}-${tickData.price}-${tickData.tick_time}`;
    const now = Date.now();
    
    // 检查是否为重复数据
    const cached = this.recentTickCache.get(uniqueKey);
    if (cached && (now - cached) < this.cacheExpiryTime) {
      // 重复数据，跳过处理
      return;
    }
    
    // 缓存新的Tick数据
    this.recentTickCache.set(uniqueKey, now);
    
    // 清理内存中的过期缓存数据
    this.cleanMemoryCache();
    
    // 同一股票代码仅保留最新一条待处理 tick，避免异步任务堆积
    this.pendingTicks.set(tickData.code, tickData);
    if (!this.processingTickCodes.has(tickData.code)) {
      void this.processPendingTicks(tickData.code);
    }
  }

  private async processPendingTicks(code: string): Promise<void> {
    if (this.processingTickCodes.has(code)) {
      return;
    }

    this.processingTickCodes.add(code);

    try {
      while (true) {
        const tickData = this.pendingTicks.get(code);
        if (!tickData) {
          break;
        }

        this.pendingTicks.delete(code);
        await this.processPriceChange(tickData);
      }
    } finally {
      this.processingTickCodes.delete(code);
      if (this.pendingTicks.has(code)) {
        void this.processPendingTicks(code);
      }
    }
  }

  /**
   * 清理内存中的过期缓存数据
   */
  private cleanMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.recentTickCache.entries()) {
      if (now - value > this.cacheExpiryTime) {
        this.recentTickCache.delete(key);
      }
    }
  }

  /**
   * 处理订阅响应
   */
  private handleSubscribeResponse(message: SubscribeResponse): void {
    if (message.ret === 200) {
      this.logger.log(`订阅成功: ${message.msg}`);
      this.logger.debug(`订阅响应 - 序列号: ${message.seq_id}, 跟踪号: ${message.trace}`);
    } else {
      this.logger.error(`订阅失败: ${message.msg}`);
      this.logger.error(`订阅响应详情 - 返回码: ${message.ret}, 序列号: ${message.seq_id}, 跟踪号: ${message.trace}`);
    }
  }

  /**
   * 处理心跳响应
   */
  private handleHeartbeatResponse(message: HeartbeatResponse): void {
    this.logger.log('收到心跳响应:', JSON.stringify(message, null, 2));
  }


  /**
   * 错误回调
   */
  private onError(error: Error): void {
    this.logger.error('WebSocket 错误:', error.message);
  }

  /**
   * 连接关闭回调
   */
  private onClose(code: number, reason: Buffer): void {
    this.logger.warn(`WebSocket 连接关闭 [${code}]: ${reason.toString()}`);

    // 停止心跳
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // 自动重连
    this.scheduleReconnect();
  }

  /**
   * 定时重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.logger.log(`将在 ${this.reconnectInterval}ms 后重连...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 生成 UUID-时间戳格式的trace
        const uuid = '3baaa938-f92c-4a74-a228-fd49d5e2f8bc';
        const timestamp = Date.now();
        const heartbeat = {
          cmd_id: 22000,
          seq_id: 6666,
          trace: `${uuid}-${timestamp}`,
          data: {},
        };
        this.send(heartbeat);
      }
    }, this.heartbeatInterval);
  }

  /**
   * 发送消息
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.logger.warn('WebSocket 未连接，无法发送消息');
    }
  }

  /**
   * 订阅股票行情 - 使用最新成交价批量订阅接口
   * @param symbols 股票代码列表，如 ['700.HK', 'AAPL.US']
   */
  subscribe(symbols: string[]): void {
    if (!symbols || symbols.length === 0) {
      return;
    }

    // 记录订阅
    symbols.forEach(symbol => this.subscribedSymbols.add(symbol));

    const subscribeMessage = {
      cmd_id: 22004, // 最新成交价批量订阅命令ID
      seq_id: this.sequenceId++,
      trace: `subscribe-${Date.now()}`,
      data: {
        symbol_list: symbols.map(code => ({
          code,
        })),
      },
    };

    this.logger.log(`订阅股票: ${symbols.join(', ')}`);
    this.logger.debug('订阅消息内容:', JSON.stringify(subscribeMessage, null, 2));
    this.send(subscribeMessage);
  }

  /**
   * 取消订阅
   * @param symbols 股票代码列表
   */
  unsubscribe(symbols: string[]): void {
    if (!symbols || symbols.length === 0) {
      return;
    }

    // 移除订阅记录
    symbols.forEach(symbol => this.subscribedSymbols.delete(symbol));

    const unsubscribeMessage = {
      cmd_id: 22004, // 最新成交价批量订阅命令ID（覆盖式订阅）
      seq_id: this.sequenceId++,
      trace: `unsubscribe-${Date.now()}`,
      data: {
        symbol_list: [], // 发送空列表表示取消所有订阅
      },
    };

    this.logger.log(`取消订阅股票: ${symbols.join(', ')}`);
    this.send(unsubscribeMessage);
  }

  /**
   * 重新订阅所有股票
   */
  private async resubscribe(): Promise<void> {
    if (this.subscribedSymbols.size > 0) {
      const symbols = Array.from(this.subscribedSymbols);
      this.subscribe(symbols);
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): string {
    if (!this.ws) {
      return 'CLOSED';
    }
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * 获取已订阅股票列表
   * 如果 WebSocket 未连接或订阅列表为空，返回目标股票列表
   */
  async getSubscribedSymbols(): Promise<string[]> {
    const subscribed = Array.from(this.subscribedSymbols);
    return subscribed.length > 0 ? subscribed : await this.getTargetSymbols();
  }

  /**
   * 处理价格变化和缓存更新
   */
  private async processPriceChange(tickData: StockTickData): Promise<void> {
    try {
      const code = tickData.code;
      const newPrice = parseFloat(tickData.price);
      const cachedQuote = await this.getCachedQuote(code);
      const cachedPrice =
        typeof cachedQuote?.realtime_price === 'number'
          ? cachedQuote.realtime_price
          : cachedQuote?.realtime_price
            ? parseFloat(cachedQuote.realtime_price)
            : null;

      // 检查价格是否真的变化了
      if (cachedPrice !== null && Math.abs(cachedPrice - newPrice) < 0.0001) {
        // 价格没有变化，跳过处理
        return;
      }

      // 获取价差设置
      const tradingSettings = await this.getTradingSettings(code);
      
      // 计算买卖价格
      const bidSpread = parseFloat(tradingSettings?.bidSpread?.toString() || '0');
      const askSpread = parseFloat(tradingSettings?.askSpread?.toString() || '0');
      const buyPrice = newPrice + bidSpread;
      const salePrice = newPrice - askSpread;

      // 更新Redis缓存
      const quoteData = {
        code,
        realtime_price: newPrice,
        buy_price: buyPrice,
        sale_price: salePrice,
        bidSpread: bidSpread,
        askSpread: askSpread,
        volume: parseInt(tickData.volume),
        tick_time: tickData.tick_time,
        updated_at: new Date().toISOString(),
      };

      await this.cacheQuoteData(code, quoteData, {
        bidSpread: tradingSettings?.bidSpread || 0,
        askSpread: tradingSettings?.askSpread || 0,
      });
      this.scheduleDatabaseWrite(tickData, cachedPrice);
      this.scheduleAllQuotesCacheRefresh();

      // 推送 SSE 事件
      this.tickSubject.next({
        code,
        data: {
          time: Math.floor(parseInt(tickData.tick_time) / 1000),
          price: newPrice,
          volume: parseInt(tickData.volume),
        },
      });

    } catch (error) {
      this.logger.error('处理价格变化失败:', error);
    }
  }

  /**
   * 获取交易设置
   */
  private async getTradingSettings(code: string): Promise<TradingSettingsEntity | null> {
    const cached = this.tradingSettingsCache.get(code);
    if (cached) {
      return cached;
    }

    try {
      const settings = await this.tradingSettingsRepository.findOne({
        where: { code },
      });
      if (settings) {
        this.tradingSettingsCache.set(code, settings);
      }
      return settings;
    } catch (error) {
      this.logger.error(`获取 ${code} 交易设置失败:`, error);
      return null;
    }
  }

  private async getCachedQuote(code: string): Promise<any | null> {
    const inMemory = this.latestQuoteCache.get(code);
    if (inMemory) {
      return inMemory;
    }

    const cachedQuote = await this.redisService.getStockQuote(code);
    if (cachedQuote) {
      this.latestQuoteCache.set(code, cachedQuote);
    }

    return cachedQuote;
  }

  private async cacheQuoteData(
    code: string,
    quoteData: any,
    spreadData: { bidSpread: number; askSpread: number },
  ): Promise<void> {
    this.latestQuoteCache.set(code, quoteData);

    await this.redisService.batchSet([
      {
        key: `stock:quote:${code}`,
        value: JSON.stringify(quoteData),
        ttl: 60,
      },
      {
        key: `stock:price:${code}`,
        value: quoteData.realtime_price.toString(),
        ttl: 60,
      },
      {
        key: `stock:spread:${code}`,
        value: JSON.stringify(spreadData),
        ttl: 300,
      },
    ]);
  }

  /**
   * 将 tick 数据加入缓冲区，批量落库避免高频写入撑爆事件循环
   */
  private scheduleDatabaseWrite(
    tickData: StockTickData,
    oldPrice: number | null,
  ): void {
    const newPrice = parseFloat(tickData.price);
    const tickTime = this.parseTickTime(tickData.tick_time);
    const volume = parseInt(tickData.volume) || 0;
    const turnover = parseFloat(tickData.turnover) || 0;

    this.realtimePriceBuffer.push({
      code: tickData.code,
      price: newPrice,
      volume,
      turnover,
      tick_time: tickTime,
    });

    if (oldPrice !== null && Math.abs(oldPrice - newPrice) >= 0.0001) {
      this.priceChangeBuffer.push({
        code: tickData.code,
        old_price: oldPrice,
        new_price: newPrice,
        price_change: newPrice - oldPrice,
        change_rate: oldPrice !== 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0,
        volume,
        tick_time: tickTime,
      });
    }

    this.trimDatabaseBuffers();
  }

  private parseTickTime(tickTimeRaw: string): Date {
    try {
      const tickTime = new Date(tickTimeRaw);
      if (isNaN(tickTime.getTime())) {
        return new Date();
      }
      return tickTime;
    } catch {
      return new Date();
    }
  }

  private trimDatabaseBuffers(): void {
    const overflowRealtime = this.realtimePriceBuffer.length - this.maxBufferedDbRows;
    if (overflowRealtime > 0) {
      this.realtimePriceBuffer.splice(0, overflowRealtime);
      this.droppedDbRows += overflowRealtime;
    }

    const overflowChanges = this.priceChangeBuffer.length - this.maxBufferedDbRows;
    if (overflowChanges > 0) {
      this.priceChangeBuffer.splice(0, overflowChanges);
      this.droppedDbRows += overflowChanges;
    }

    const now = Date.now();
    if (this.droppedDbRows > 0 && now - this.lastDroppedRowsWarnAt >= 60000) {
      this.logger.warn(`数据库写入缓冲区已满，累计丢弃 ${this.droppedDbRows} 条历史行情数据`);
      this.droppedDbRows = 0;
      this.lastDroppedRowsWarnAt = now;
    }
  }

  private startDbFlushWorker(): void {
    if (this.dbFlushTimer) {
      return;
    }

    this.dbFlushTimer = setInterval(() => {
      void this.flushDatabaseBuffers();
    }, this.dbFlushInterval);
  }

  private stopDbFlushWorker(): void {
    if (this.dbFlushTimer) {
      clearInterval(this.dbFlushTimer);
      this.dbFlushTimer = null;
    }
  }

  private async flushDatabaseBuffers(force: boolean = false): Promise<void> {
    if (this.dbFlushInProgress) {
      return;
    }

    if (this.realtimePriceBuffer.length === 0 && this.priceChangeBuffer.length === 0) {
      return;
    }

    this.dbFlushInProgress = true;

    try {
      do {
        const realtimeBatch = this.realtimePriceBuffer.splice(0, this.dbBatchSize);
        if (realtimeBatch.length > 0) {
          await this.stockRealtimePriceRepository.insert(realtimeBatch);
        }

        const changeBatch = this.priceChangeBuffer.splice(0, this.dbBatchSize);
        if (changeBatch.length > 0) {
          await this.stockPriceChangeRepository.insert(changeBatch);
        }
      } while (
        force &&
        (this.realtimePriceBuffer.length > 0 || this.priceChangeBuffer.length > 0)
      );
    } catch (error) {
      this.logger.error('批量保存行情数据失败:', error);
    } finally {
      this.dbFlushInProgress = false;
    }
  }

  /**
   * 节流更新所有股票汇总缓存，避免每条 tick 都全量扫描
   */
  private scheduleAllQuotesCacheRefresh(): void {
    if (this.allQuotesRefreshTimer) {
      return;
    }

    this.allQuotesRefreshTimer = setTimeout(() => {
      this.allQuotesRefreshTimer = null;
      void this.refreshAllQuotesCache();
    }, this.allQuotesRefreshInterval);
  }

  private async refreshAllQuotesCache(): Promise<void> {
    try {
      const targetSymbols = await this.getTargetSymbols();
      const quotes = targetSymbols
        .map((code) => {
          const quote = this.latestQuoteCache.get(code);
          if (!quote) {
            return null;
          }

          return {
            code: quote.code,
            buy_price: quote.buy_price,
            sale_price: quote.sale_price,
          };
        })
        .filter((quote): quote is { code: string; buy_price: number; sale_price: number } => Boolean(quote));

      const allQuotesData = {
        codeList: quotes,
        updated_at: new Date().toISOString(),
      };

      await this.redisService.setAllQuotes(allQuotesData);
      this.logger.debug('已更新所有股票汇总缓存');
    } catch (error) {
      this.logger.error('更新所有股票汇总缓存失败:', error);
    }
  }

  /**
   * 获取所有股票实时行情（供Controller调用）
   */
  async getAllRealtimeQuotes(): Promise<any> {
    try {
      const cachedData = await this.redisService.getAllQuotes();
      
      if (cachedData) {
        return cachedData;
      }

      if (this.latestQuoteCache.size > 0) {
        const codeList = Array.from(this.latestQuoteCache.values()).map((quote) => ({
          code: quote.code,
          buy_price: quote.buy_price,
          sale_price: quote.sale_price,
        }));

        return {
          codeList,
          updated_at: new Date().toISOString(),
        };
      }
      
      // 如果缓存不存在，返回空数据
      return {
        codeList: [],
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('获取所有股票实时行情失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个股票实时行情（供Controller调用）
   */
  async getRealtimeQuote(code: string): Promise<any> {
    try {
      const cachedData = await this.getCachedQuote(code);
      
      if (cachedData) {
        return {
          code: cachedData.code,
          buy_price: cachedData.buy_price,
          sale_price: cachedData.sale_price,
        };
      }
      
      // 如果缓存不存在，返回空数据
      return {
        code,
        buy_price: 0,
        sale_price: 0,
      };
    } catch (error) {
      this.logger.error(`获取 ${code} 实时行情失败:`, error);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息（用于监控）
   */
  async getCacheStats(): Promise<any> {
    try {
      return await this.redisService.getCacheStats('stock:*');
    } catch (error) {
      this.logger.error('获取缓存统计信息失败:', error);
      return null;
    }
  }

  /**
   * 清理过期缓存（用于维护）
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      return await this.redisService.cleanExpiredCache('stock:*');
    } catch (error) {
      this.logger.error('清理过期缓存失败:', error);
      return 0;
    }
  }

  /**
   * 测试价格计算逻辑（用于调试）
   */
  async testPriceCalculation(code: string, price: number): Promise<any> {
    try {
      const tradingSettings = await this.getTradingSettings(code);
      const bidSpread = parseFloat(tradingSettings?.bidSpread?.toString() || '0');
      const askSpread = parseFloat(tradingSettings?.askSpread?.toString() || '0');
      const buyPrice = price + bidSpread;
      const salePrice = price - askSpread;
      const spread = buyPrice - salePrice;

      return {
        code,
        realtime_price: price,
        bidSpread,
        askSpread,
        buy_price: buyPrice,
        sale_price: salePrice,
        spread: spread
      };
    } catch (error) {
      this.logger.error(`测试价格计算失败:`, error);
      throw error;
    }
  }

  /**
   * 启动模拟数据生成
   */
  private async startMockDataGeneration(): Promise<void> {
    this.logger.log('🎲 启动模拟数据生成器...');

    // 从数据库加载产品
    await this.loadProductsFromDatabase();

    // 初始化所有产品的缓存和价格
    const targetSymbols = await this.getTargetSymbols();
    for (const code of targetSymbols) {
      const product = this.productsCache.find(p => p.code === code);
      // 根据产品类型设置不同的初始价格
      let initialPrice = 100;
      if (product) {
        switch (product.type) {
          case '指数':
            initialPrice = Math.random() * 10000 + 5000; // 5000-15000
            break;
          case '股票':
            initialPrice = Math.random() * 500 + 50; // 50-550
            break;
          case '商品':
            initialPrice = Math.random() * 2000 + 500; // 500-2500
            break;
          case 'Crypto':
            initialPrice = Math.random() * 50000 + 10000; // 10000-60000
            break;
          case '外汇':
            initialPrice = Math.random() * 2 + 0.5; // 0.5-2.5
            break;
        }
      }
      this.mockPrices.set(code, initialPrice);
      await this.updateMockQuoteCache(code, initialPrice);
    }

    this.scheduleAllQuotesCacheRefresh();
    this.logger.log(`已初始化 ${targetSymbols.length} 个产品的模拟数据`);

    // 每秒生成一次模拟数据
    this.mockDataTimer = setInterval(() => {
      this.generateMockData();
    }, 1000);
  }

  /**
   * 停止模拟数据生成
   */
  private stopMockDataGeneration(): void {
    if (this.mockDataTimer) {
      clearInterval(this.mockDataTimer);
      this.mockDataTimer = null;
      this.logger.log('🛑 模拟数据生成器已停止');
    }
  }

  /**
   * 生成模拟数据
   */
  private async generateMockData(): Promise<void> {
    const targetSymbols = await this.getTargetSymbols();

    for (const code of targetSymbols) {
      const currentPrice = this.mockPrices.get(code) || 100;

      // 生成随机价格波动 (-0.5% 到 +0.5%)
      const changePercent = (Math.random() - 0.5) * 0.01;
      const newPrice = parseFloat((currentPrice * (1 + changePercent)).toFixed(2));

      // 更新价格
      this.mockPrices.set(code, newPrice);

      // 生成随机成交量
      const volume = Math.floor(Math.random() * 500) + 100;

      // 当前时间戳（毫秒）
      const tickTime = Date.now();

      this.logger.debug(`模拟数据: ${code} - ${newPrice} (${changePercent > 0 ? '+' : ''}${(changePercent * 100).toFixed(2)}%)`);

      // 更新缓存
      await this.updateMockQuoteCache(code, newPrice, volume, tickTime);

      // 推送 SSE 事件
      this.tickSubject.next({
        code,
        data: {
          time: Math.floor(tickTime / 1000),
          price: newPrice,
          volume: volume,
        },
      });
    }

    this.scheduleAllQuotesCacheRefresh();
  }

  /**
   * 更新模拟数据的缓存
   */
  private async updateMockQuoteCache(code: string, price: number, volume: number = 100, tickTime: number = Date.now()): Promise<void> {
    try {
      // 获取价差设置
      const tradingSettings = await this.getTradingSettings(code);

      // 计算买卖价格
      const bidSpread = parseFloat(tradingSettings?.bidSpread?.toString() || '0');
      const askSpread = parseFloat(tradingSettings?.askSpread?.toString() || '0');
      const buyPrice = price + bidSpread;
      const salePrice = price - askSpread;

      // 更新Redis缓存
      const quoteData = {
        code,
        realtime_price: price,
        buy_price: buyPrice,
        sale_price: salePrice,
        bidSpread: bidSpread,
        askSpread: askSpread,
        volume: volume,
        tick_time: tickTime.toString(),
        updated_at: new Date().toISOString(),
      };

      await this.cacheQuoteData(code, quoteData, {
        bidSpread: tradingSettings?.bidSpread || 0,
        askSpread: tradingSettings?.askSpread || 0,
      });
    } catch (error) {
      this.logger.error(`更新模拟数据缓存失败 ${code}:`, error);
    }
  }

  /**
   * SSE 流式推送实时行情
   */
  streamQuote(code: string): Observable<MessageEvent> {
    this.logger.log(`客户端订阅 SSE 流: ${code}`);

    return new Observable<MessageEvent>((observer) => {
      // 发送初始连接消息
      observer.next({
        data: { type: 'connected', code, timestamp: new Date().toISOString() },
      } as any);

      // 订阅 tick 数据流
      const subscription = this.tickSubject
        .pipe(
          filter((tick) => tick.code === code),
          map((tick) => ({
            data: {
              type: 'tick',
              ...tick.data,
            },
          } as any))
        )
        .subscribe({
          next: (event) => observer.next(event),
          error: (err) => {
            this.logger.error(`SSE 流错误 (${code}):`, err);
            observer.error(err);
          },
        });

      // 定期发送心跳（每30秒）
      const heartbeatInterval = setInterval(() => {
        if (observer.closed) {
          return;
        }
        observer.next({
          data: { type: 'heartbeat', timestamp: new Date().toISOString() },
        } as any);
      }, 30000);

      // 清理函数
      return () => {
        this.logger.log(`客户端断开 SSE 流: ${code}`);
        subscription.unsubscribe();
        clearInterval(heartbeatInterval);
      };
    });
  }
}

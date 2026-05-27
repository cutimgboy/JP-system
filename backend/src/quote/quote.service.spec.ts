import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteService } from './quote.service';
import { RedisService } from '../redis/redis.service';
import { StockKlineEntity } from './entities/stock-kline.entity';
import { TradingSettingsEntity } from '../cfd/entities/trading-settings.entity';
import { ProductEntity } from '../cfd/entities/product.entity';
import { StockTickData, StockTickEntity } from './entities/stock-tick.entity';

describe('QuoteService', () => {
  let service: QuoteService;
  let tradingSettingsRepository: Repository<TradingSettingsEntity>;

  const mockRedisService = {
    getStockQuote: jest.fn(),
    getAllQuotes: jest.fn(),
    batchSet: jest.fn(),
    setAllQuotes: jest.fn(),
    getCacheStats: jest.fn(),
    cleanExpiredCache: jest.fn(),
  };

  const mockTradingSettingsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockStockTickRepository = {
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
  };

  const mockStockKlineRepository = {
    find: jest.fn(),
    query: jest.fn(),
  };

  const mockProductRepository = {
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockTickData: StockTickData = {
    code: 'NVDA.US',
    price: '145.67',
    volume: '1000000',
    turnover: '145670000',
    tick_time: '2024-01-01T10:30:00.123Z',
    seq: '12345',
    trade_direction: 1,
  };

  const mockProducts = [
    {
      code: 'NVDA',
      tradeCode: 'NVDA.US',
      type: '股票',
      isActive: true,
    },
    {
      code: 'BTC',
      tradeCode: 'BTCUSDT',
      type: 'Crypto',
      isActive: true,
    },
  ] as ProductEntity[];

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation(
      (_key: string, defaultValue?: string) => defaultValue,
    );
    mockTradingSettingsRepository.find.mockResolvedValue([]);
    mockProductRepository.find.mockResolvedValue(mockProducts);
    mockStockKlineRepository.find.mockResolvedValue([]);
    mockStockKlineRepository.query.mockResolvedValue(undefined);
    mockStockTickRepository.query.mockResolvedValue({ affectedRows: 0 });
    mockStockTickRepository.createQueryBuilder.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: getRepositoryToken(TradingSettingsEntity),
          useValue: mockTradingSettingsRepository,
        },
        {
          provide: getRepositoryToken(StockTickEntity),
          useValue: mockStockTickRepository,
        },
        {
          provide: getRepositoryToken(StockKlineEntity),
          useValue: mockStockKlineRepository,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
    tradingSettingsRepository = module.get<Repository<TradingSettingsEntity>>(
      getRepositoryToken(TradingSettingsEntity),
    );
  });

  describe('K线快照测试', () => {
    it('应该优先读取K线聚合表', async () => {
      mockStockKlineRepository.find.mockResolvedValue([
        {
          bucket_time: new Date('2024-01-01T10:30:01.000Z'),
          open: '145.500000',
          high: '146.000000',
          low: '145.200000',
          close: '145.800000',
          volume: '200',
          turnover: '29160',
          trade_count: 2,
        },
        {
          bucket_time: new Date('2024-01-01T10:30:00.000Z'),
          open: '145.100000',
          high: '145.900000',
          low: '145.000000',
          close: '145.670000',
          volume: '300',
          turnover: '43701',
          trade_count: 3,
        },
      ]);

      const result = await service.getKlineSnapshot('NVDA.US', '1s', '300');

      expect(result).toEqual({
        code: 'NVDA.US',
        interval: '1s',
        data: [
          {
            time: 1704105000,
            open: 145.1,
            high: 145.9,
            low: 145,
            close: 145.67,
            price: 145.67,
            volume: 300,
            turnover: 43701,
            trade_count: 3,
          },
          {
            time: 1704105001,
            open: 145.5,
            high: 146,
            low: 145.2,
            close: 145.8,
            price: 145.8,
            volume: 200,
            turnover: 29160,
            trade_count: 2,
          },
        ],
      });
      expect(mockStockKlineRepository.find).toHaveBeenCalledWith({
        where: { code: 'NVDA', interval_sec: 1 },
        order: { bucket_time: 'DESC' },
        take: 300,
      });
    });

    it('应该在没有K线历史时返回缓存价格作为快照', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA',
        realtime_price: 145.67,
        volume: 100,
        turnover: 14567,
      });

      const result = await service.getKlineSnapshot('NVDA.US', '5m', '300');

      expect(result.code).toBe('NVDA.US');
      expect(result.interval).toBe('300s');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBe(145.67);
      expect(result.data[0].turnover).toBe(14567);
      expect(mockRedisService.getStockQuote).toHaveBeenCalledWith('NVDA');
    });

    it('应该兼容 tradeCode 请求并读取内部 code 的K线数据', async () => {
      mockStockKlineRepository.find.mockResolvedValue([
        {
          bucket_time: new Date('2024-01-01T10:30:00.000Z'),
          open: '145.100000',
          high: '145.900000',
          low: '145.000000',
          close: '145.670000',
          volume: '300',
          turnover: '43701',
          trade_count: 3,
        },
      ]);

      const result = await service.getKlineSnapshot('NVDA.US', '1s', '300');

      expect(result.code).toBe('NVDA.US');
      expect(result.data).toHaveLength(1);
      expect(mockStockKlineRepository.find).toHaveBeenCalledWith({
        where: { code: 'NVDA', interval_sec: 1 },
        order: { bucket_time: 'DESC' },
        take: 300,
      });
    });
  });

  afterEach(() => {
    const timers = [
      'allQuotesRefreshTimer',
      'dbFlushTimer',
      'heartbeatTimer',
      'mockDataTimer',
      'reconnectTimer',
    ] as const;

    timers.forEach((timerKey) => {
      const timer = (service as any)[timerKey];
      if (timer) {
        clearTimeout(timer);
        clearInterval(timer);
        (service as any)[timerKey] = null;
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('开启原始tick写入时应该保留短期调试流水', async () => {
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string) =>
        key === 'QUOTE_WRITE_RAW_TICKS' ? 'true' : defaultValue,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: getRepositoryToken(TradingSettingsEntity),
          useValue: mockTradingSettingsRepository,
        },
        {
          provide: getRepositoryToken(StockTickEntity),
          useValue: mockStockTickRepository,
        },
        {
          provide: getRepositoryToken(StockKlineEntity),
          useValue: mockStockKlineRepository,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
      ],
    }).compile();
    const serviceWithRawTicks = module.get<QuoteService>(QuoteService);

    mockRedisService.getStockQuote.mockResolvedValue({
      code: 'NVDA',
      realtime_price: 145.67,
    });

    await (serviceWithRawTicks as any).processPriceChange(mockTickData);
    await (serviceWithRawTicks as any).flushDatabaseBuffers(true);

    const queryBuilder =
      mockStockTickRepository.createQueryBuilder.mock.results[0].value;

    expect(queryBuilder.values).toHaveBeenCalledWith([
      expect.objectContaining({
        code: 'NVDA',
        seq: '12345',
        price: 145.67,
      }),
    ]);
  });

  describe('价格计算逻辑测试', () => {
    it('应该正确计算买入价格和卖出价格', async () => {
      mockRedisService.getStockQuote.mockResolvedValue(null);
      mockTradingSettingsRepository.findOne.mockResolvedValue({
        code: 'NVDA',
        bidSpread: 0.2,
        askSpread: 0.2,
      } as TradingSettingsEntity);

      await (service as any).processPriceChange(mockTickData);

      const quoteOperation = mockRedisService.batchSet.mock.calls[0][0].find(
        (operation: { key: string }) => operation.key === 'stock:quote:NVDA',
      );
      const payload = JSON.parse(quoteOperation.value);

      expect(payload.code).toBe('NVDA');
      expect(payload.buy_price).toBeCloseTo(145.87, 2);
      expect(payload.sale_price).toBeCloseTo(145.47, 2);
    });

    it('应该在价格没有变化时跳过处理', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA',
        realtime_price: 145.67,
      });

      await (service as any).processPriceChange(mockTickData);

      expect(mockRedisService.batchSet).not.toHaveBeenCalled();
    });

    it('默认不写原始tick，但仍更新K线缓冲', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA',
        realtime_price: 145.67,
      });

      await (service as any).processPriceChange(mockTickData);
      await (service as any).flushDatabaseBuffers(true);

      expect(mockStockTickRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(mockStockKlineRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO stock_klines'),
        expect.arrayContaining(['NVDA', 1, expect.any(Date), 145.67]),
      );
    });

    it('应该正确解析ISO、秒级和毫秒级tick时间', () => {
      expect(
        (service as any)
          .parseTickTime('2024-01-01T10:30:00.123Z')
          .toISOString(),
      ).toBe('2024-01-01T10:30:00.123Z');
      expect((service as any).parseTickTime('1704105000').toISOString()).toBe(
        '2024-01-01T10:30:00.000Z',
      );
      expect(
        (service as any).parseTickTime('1704105000123').toISOString(),
      ).toBe('2024-01-01T10:30:00.123Z');
    });

    it('应该在没有价差设置时使用默认值', async () => {
      mockRedisService.getStockQuote.mockResolvedValue(null);
      mockTradingSettingsRepository.findOne.mockResolvedValue(null);

      await (service as any).processPriceChange(mockTickData);

      const quoteOperation = mockRedisService.batchSet.mock.calls[0][0].find(
        (operation: { key: string }) => operation.key === 'stock:quote:NVDA',
      );
      const payload = JSON.parse(quoteOperation.value);

      expect(payload.code).toBe('NVDA');
      expect(payload.buy_price).toBe(145.67);
      expect(payload.sale_price).toBe(145.67);
    });
  });

  describe('获取实时行情测试', () => {
    it('应该返回所有股票的实时行情', async () => {
      const mockRedisData = {
        codeList: [
          { code: 'NVDA.US', buy_price: 145.87, sale_price: 145.47 },
          { code: 'MSFT.US', buy_price: 378.15, sale_price: 377.85 },
        ],
        updated_at: '2024-01-01T10:30:00.123Z',
      };

      mockRedisService.getAllQuotes.mockResolvedValue(mockRedisData);

      const result = await service.getAllRealtimeQuotes();

      expect(result).toEqual(mockRedisData);
      expect(mockRedisService.getAllQuotes).toHaveBeenCalled();
    });

    it('应该返回单个股票的实时行情', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA',
        realtime_price: 145.67,
        buy_price: 145.87,
        sale_price: 145.47,
      });

      const result = await service.getRealtimeQuote('NVDA.US');

      expect(result).toEqual({
        code: 'NVDA.US',
        buy_price: 145.87,
        sale_price: 145.47,
      });
      expect(mockRedisService.getStockQuote).toHaveBeenCalledWith('NVDA');
    });

    it('应该用 tradeCode 入参读取内部 code 的实时行情缓存', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA',
        realtime_price: 145.67,
        buy_price: 145.87,
        sale_price: 145.47,
      });

      const result = await service.getRealtimeQuote('NVDA.US');

      expect(result).toEqual({
        code: 'NVDA.US',
        buy_price: 145.87,
        sale_price: 145.47,
      });
      expect(mockRedisService.getStockQuote).toHaveBeenCalledWith('NVDA');
    });

    it('应该在缓存不存在时返回默认值', async () => {
      mockRedisService.getStockQuote.mockResolvedValue(null);

      const result = await service.getRealtimeQuote('NVDA.US');

      expect(result).toEqual({
        code: 'NVDA.US',
        buy_price: 0,
        sale_price: 0,
      });
    });
  });

  it('应该缓存查询到的交易设置', async () => {
    mockTradingSettingsRepository.findOne.mockResolvedValue({
      code: 'NVDA',
      bidSpread: 0.3,
      askSpread: 0.1,
    } as TradingSettingsEntity);

    const firstResult = await (service as any).getTradingSettings('NVDA.US');
    const secondResult = await (service as any).getTradingSettings('NVDA.US');

    expect(firstResult).toEqual(secondResult);
    expect(tradingSettingsRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('订阅真实行情源时应该使用 tradeCode', async () => {
    const symbols = await (service as any).getSubscriptionSymbols();

    expect(symbols).toEqual(['NVDA.US', 'BTCUSDT']);
  });
});

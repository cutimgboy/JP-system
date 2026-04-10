import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteService } from './quote.service';
import { RedisService } from '../redis/redis.service';
import { StockRealtimePriceEntity } from './entities/stock-realtime-price.entity';
import { StockPriceChangeEntity } from './entities/stock-price-change.entity';
import { TradingSettingsEntity } from '../cfd/entities/trading-settings.entity';
import { ProductEntity } from '../cfd/entities/product.entity';
import { StockTickData } from './entities/stock-tick.entity';

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

  const mockStockRealtimePriceRepository = {
    insert: jest.fn(),
  };

  const mockStockPriceChangeRepository = {
    insert: jest.fn(),
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

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((_key: string, defaultValue?: string) => defaultValue);
    mockTradingSettingsRepository.find.mockResolvedValue([]);
    mockProductRepository.find.mockResolvedValue([]);

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
          provide: getRepositoryToken(StockRealtimePriceEntity),
          useValue: mockStockRealtimePriceRepository,
        },
        {
          provide: getRepositoryToken(StockPriceChangeEntity),
          useValue: mockStockPriceChangeRepository,
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

  describe('价格计算逻辑测试', () => {
    it('应该正确计算买入价格和卖出价格', async () => {
      mockRedisService.getStockQuote.mockResolvedValue(null);
      mockTradingSettingsRepository.findOne.mockResolvedValue({
        code: 'NVDA.US',
        bidSpread: 0.2,
        askSpread: 0.2,
      } as TradingSettingsEntity);

      await (service as any).processPriceChange(mockTickData);

      const quoteOperation = mockRedisService.batchSet.mock.calls[0][0].find(
        (operation: { key: string }) => operation.key === 'stock:quote:NVDA.US',
      );
      const payload = JSON.parse(quoteOperation.value);

      expect(payload.buy_price).toBeCloseTo(145.87, 2);
      expect(payload.sale_price).toBeCloseTo(145.47, 2);
    });

    it('应该在价格没有变化时跳过处理', async () => {
      mockRedisService.getStockQuote.mockResolvedValue({
        code: 'NVDA.US',
        realtime_price: 145.67,
      });

      await (service as any).processPriceChange(mockTickData);

      expect(mockRedisService.batchSet).not.toHaveBeenCalled();
    });

    it('应该在没有价差设置时使用默认值', async () => {
      mockRedisService.getStockQuote.mockResolvedValue(null);
      mockTradingSettingsRepository.findOne.mockResolvedValue(null);

      await (service as any).processPriceChange(mockTickData);

      const quoteOperation = mockRedisService.batchSet.mock.calls[0][0].find(
        (operation: { key: string }) => operation.key === 'stock:quote:NVDA.US',
      );
      const payload = JSON.parse(quoteOperation.value);

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
        code: 'NVDA.US',
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
      expect(mockRedisService.getStockQuote).toHaveBeenCalledWith('NVDA.US');
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
      code: 'NVDA.US',
      bidSpread: 0.3,
      askSpread: 0.1,
    } as TradingSettingsEntity);

    const firstResult = await (service as any).getTradingSettings('NVDA.US');
    const secondResult = await (service as any).getTradingSettings('NVDA.US');

    expect(firstResult).toEqual(secondResult);
    expect(tradingSettingsRepository.findOne).toHaveBeenCalledTimes(1);
  });
});

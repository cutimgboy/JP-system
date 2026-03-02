import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../cfd/entities/product.entity';

/**
 * Mock 行情数据服务
 * 用于生成模拟的实时行情数据
 */
@Injectable()
export class MockQuoteService implements OnModuleInit {
  // 存储每个产品的基础价格和当前价格
  private priceCache: Map<string, { basePrice: number; currentPrice: number; lastUpdate: number }> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * 模块初始化时调用
   */
  async onModuleInit() {
    await this.initializePrices();
    console.log(`✅ MockQuoteService 已初始化，共 ${this.priceCache.size} 个产品`);
  }

  /**
   * 初始化产品价格
   */
  private async initializePrices() {
    const products = await this.productRepository.find({ where: { isActive: true } });

    for (const product of products) {
      // 根据产品类型设置不同的基础价格
      let basePrice = 100;

      switch (product.type) {
        case '指数':
          basePrice = Math.random() * 10000 + 5000; // 5000-15000
          break;
        case '股票':
          basePrice = Math.random() * 500 + 50; // 50-550
          break;
        case '商品':
          basePrice = Math.random() * 2000 + 500; // 500-2500
          break;
        case 'Crypto':
          basePrice = Math.random() * 50000 + 10000; // 10000-60000
          break;
        case '外汇':
          basePrice = Math.random() * 2 + 0.5; // 0.5-2.5
          break;
      }

      this.priceCache.set(product.tradeCode, {
        basePrice,
        currentPrice: basePrice,
        lastUpdate: Date.now(),
      });
    }

    // 启动价格更新定时器（每秒更新一次）
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updatePrices(), 1000);
    }
  }

  /**
   * 模块销毁时清理定时器
   */
  onModuleDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * 更新所有产品价格（模拟价格波动）
   */
  private updatePrices() {
    for (const [tradeCode, priceData] of this.priceCache.entries()) {
      // 随机波动 -0.5% 到 +0.5%
      const changePercent = (Math.random() - 0.5) * 0.01;
      const newPrice = priceData.currentPrice * (1 + changePercent);

      this.priceCache.set(tradeCode, {
        ...priceData,
        currentPrice: newPrice,
        lastUpdate: Date.now(),
      });
    }
  }

  /**
   * 获取单个产品的实时行情
   */
  async getRealtimeQuote(tradeCode: string) {
    const priceData = this.priceCache.get(tradeCode);

    if (!priceData) {
      return null;
    }

    const product = await this.productRepository.findOne({
      where: { tradeCode, isActive: true }
    });

    if (!product) {
      return null;
    }

    const currentPrice = priceData.currentPrice;
    const basePrice = priceData.basePrice;
    const change = currentPrice - basePrice;
    const changePercent = (change / basePrice) * 100;

    // 计算买价和卖价（加上价差）
    const bidPrice = currentPrice - (Number(product.bidSpread) || 0);
    const askPrice = currentPrice + (Number(product.askSpread) || 0);

    return {
      code: product.code,
      tradeCode: product.tradeCode,
      name: product.nameEn,
      nameCn: product.nameCn,
      nameVn: product.nameVn,
      type: product.type,
      price: Number(currentPrice.toFixed(2)),
      bidPrice: Number(bidPrice.toFixed(2)),
      askPrice: Number(askPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number((basePrice * 1.02).toFixed(2)),
      low: Number((basePrice * 0.98).toFixed(2)),
      open: Number(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      timestamp: priceData.lastUpdate,
    };
  }

  /**
   * 获取多个产品的实时行情
   */
  async getRealtimeQuotes(tradeCodes?: string[]) {
    let products: ProductEntity[];

    if (tradeCodes && tradeCodes.length > 0) {
      products = await this.productRepository.find({
        where: tradeCodes.map(code => ({ tradeCode: code, isActive: true })),
      });
    } else {
      products = await this.productRepository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC' },
      });
    }

    const quotes: any[] = [];
    for (const product of products) {
      const quote = await this.getRealtimeQuote(product.tradeCode);
      if (quote) {
        quotes.push(quote);
      }
    }

    return quotes;
  }

  /**
   * 按类型获取产品行情
   */
  async getQuotesByType(type: string) {
    const products = await this.productRepository.find({
      where: { type, isActive: true },
      order: { sortOrder: 'ASC' },
    });

    const quotes: any[] = [];
    for (const product of products) {
      const quote = await this.getRealtimeQuote(product.tradeCode);
      if (quote) {
        quotes.push(quote);
      }
    }

    return quotes;
  }

  /**
   * 获取所有产品类型
   */
  async getProductTypes() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.type', 'type')
      .where('product.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(r => r.type);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { RedisService } from '../../redis/redis.service';

const PRODUCT_CACHE_PREFIX = 'public:products';
const PRODUCT_LIST_TTL_SECONDS = 300;
const PRODUCT_DETAIL_TTL_SECONDS = 600;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 获取所有产品
   */
  async findAll(type?: string) {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}:list:${type || 'all'}`;
    const cached = await this.redisService.getJson<ProductEntity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    const products = await this.productRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
    await this.redisService.setJson(cacheKey, products, PRODUCT_LIST_TTL_SECONDS);
    return products;
  }

  /**
   * 根据代码获取产品
   */
  async findByCode(code: string) {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}:detail:${code}`;
    const cached = await this.redisService.getJson<ProductEntity>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const product = await this.productRepository.findOne({
      where: { code, isActive: true },
    });
    if (product) {
      await this.redisService.setJson(cacheKey, product, PRODUCT_DETAIL_TTL_SECONDS);
    }
    return product;
  }

  /**
   * 根据交易代码获取产品
   */
  async findByTradeCode(tradeCode: string) {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}:trade-code:${tradeCode}`;
    const cached = await this.redisService.getJson<ProductEntity>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const product = await this.productRepository.findOne({
      where: { tradeCode, isActive: true },
    });
    if (product) {
      await this.redisService.setJson(cacheKey, product, PRODUCT_DETAIL_TTL_SECONDS);
    }
    return product;
  }

  /**
   * 获取所有产品类型
   */
  async getTypes() {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}:types`;
    const cached = await this.redisService.getJson<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.type', 'type')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.type', 'ASC')
      .getRawMany();

    const types = result.map(r => r.type);
    await this.redisService.setJson(cacheKey, types, PRODUCT_LIST_TTL_SECONDS);
    return types;
  }

  /**
   * 按类型获取产品数量
   */
  async getCountByType() {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}:stats`;
    const cached = await this.redisService.getJson<Array<{ type: string; count: string }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('product.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.type')
      .getRawMany();

    await this.redisService.setJson(cacheKey, result, PRODUCT_LIST_TTL_SECONDS);
    return result;
  }

  async invalidatePublicCache() {
    await this.redisService.delByPattern(`${PRODUCT_CACHE_PREFIX}:*`);
  }
}

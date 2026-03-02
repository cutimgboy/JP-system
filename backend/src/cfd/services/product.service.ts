import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * 获取所有产品
   */
  async findAll(type?: string) {
    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    return await this.productRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * 根据代码获取产品
   */
  async findByCode(code: string) {
    return await this.productRepository.findOne({
      where: { code, isActive: true },
    });
  }

  /**
   * 根据交易代码获取产品
   */
  async findByTradeCode(tradeCode: string) {
    return await this.productRepository.findOne({
      where: { tradeCode, isActive: true },
    });
  }

  /**
   * 获取所有产品类型
   */
  async getTypes() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.type', 'type')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.type', 'ASC')
      .getRawMany();

    return result.map(r => r.type);
  }

  /**
   * 按类型获取产品数量
   */
  async getCountByType() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('product.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.type')
      .getRawMany();

    return result;
  }
}

import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { MockQuoteService } from '../../quote/services/mock-quote.service';

@Controller('api/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly mockQuoteService: MockQuoteService,
  ) {}

  /**
   * 获取所有产品
   * GET /api/products
   * Query: type (可选) - 产品类型
   */
  @Get()
  async getProducts(@Query('type') type?: string) {
    const products = await this.productService.findAll(type);
    return {
      code: 0,
      msg: '请求成功',
      data: products,
    };
  }

  /**
   * 获取产品类型列表
   * GET /api/products/types
   */
  @Get('types')
  async getTypes() {
    const types = await this.productService.getTypes();
    return {
      code: 0,
      msg: '请求成功',
      data: types,
    };
  }

  /**
   * 获取产品类型统计
   * GET /api/products/stats
   */
  @Get('stats')
  async getStats() {
    const stats = await this.productService.getCountByType();
    return {
      code: 0,
      msg: '请求成功',
      data: stats,
    };
  }

  /**
   * 获取产品实时行情
   * GET /api/products/quotes
   * Query: type (可选) - 产品类型
   * Query: codes (可选) - 产品代码列表，逗号分隔
   */
  @Get('quotes')
  async getQuotes(
    @Query('type') type?: string,
    @Query('codes') codes?: string,
  ) {
    let quotes;

    if (codes) {
      const codeList = codes.split(',');
      quotes = await this.mockQuoteService.getRealtimeQuotes(codeList);
    } else if (type) {
      quotes = await this.mockQuoteService.getQuotesByType(type);
    } else {
      quotes = await this.mockQuoteService.getRealtimeQuotes();
    }

    return {
      code: 0,
      msg: '请求成功',
      data: quotes,
    };
  }

  /**
   * 获取单个产品行情
   * GET /api/products/:code/quote
   */
  @Get(':code/quote')
  async getQuote(@Query('code') code: string) {
    const product = await this.productService.findByCode(code);
    if (!product) {
      return {
        code: 404,
        msg: '产品不存在',
        data: null,
      };
    }

    const quote = await this.mockQuoteService.getRealtimeQuote(product.tradeCode);
    return {
      code: 0,
      msg: '请求成功',
      data: quote,
    };
  }

  /**
   * 获取单个产品详情（包含基础信息）
   * GET /api/products/:code
   */
  @Get(':code')
  async getProduct(@Param('code') code: string) {
    const product = await this.productService.findByCode(code);
    if (!product) {
      return {
        code: 404,
        msg: '产品不存在',
        data: null,
      };
    }

    return {
      code: 0,
      msg: '请求成功',
      data: product,
    };
  }
}

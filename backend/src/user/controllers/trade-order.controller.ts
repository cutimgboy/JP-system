import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TradeOrderService, CreateOrderDto } from '../services/trade-order.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OrderStatus } from '../entities/trade-order.entity';
import { AccountType } from '../entities/user-account.entity';

/**
 * 交易订单控制器
 */
@Controller('trade')
@UseGuards(JwtAuthGuard)
export class TradeOrderController {
  constructor(private readonly tradeOrderService: TradeOrderService) {}

  /**
   * 创建交易订单（开仓）
   */
  @Post('order')
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.id;
    const order = await this.tradeOrderService.createOrder(userId, dto);
    return {
      data: order,
      code: 0,
      msg: '订单创建成功',
    };
  }

  /**
   * 平仓订单
   */
  @Post('order/:id/close')
  async closeOrder(@Request() req, @Param('id') orderId: number) {
    const order = await this.tradeOrderService.closeOrder(orderId);
    return {
      data: order,
      code: 0,
      msg: '订单平仓成功',
    };
  }

  /**
   * 获取用户订单列表
   */
  @Get('orders')
  async getUserOrders(
    @Request() req,
    @Query('status') status?: OrderStatus,
    @Query('limit') limit?: number,
    @Query('accountType') accountType?: string,
  ) {
    const userId = req.user.id;
    const type = accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    const orders = await this.tradeOrderService.getUserOrders(
      userId,
      status,
      limit ? parseInt(limit.toString()) : 50,
      type,
    );
    return {
      data: orders,
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 获取用户当前持仓
   */
  @Get('orders/open')
  async getUserOpenOrders(@Request() req, @Query('accountType') accountType?: string) {
    const userId = req.user.id;
    const type = accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    const orders = await this.tradeOrderService.getUserOpenOrders(userId, type);
    return {
      data: orders,
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 获取订单详情
   */
  @Get('order/:id')
  async getOrderById(@Request() req, @Param('id') orderId: number) {
    const userId = req.user.id;
    const order = await this.tradeOrderService.getOrderById(orderId, userId);
    return {
      data: order,
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 获取用户交易统计
   */
  @Get('stats')
  async getUserStats(@Request() req, @Query('accountType') accountType?: string) {
    const userId = req.user.id;
    const type = accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    const stats = await this.tradeOrderService.getUserStats(userId, type);
    return {
      data: stats,
      code: 0,
      msg: '请求成功',
    };
  }
}

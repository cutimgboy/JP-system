import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { TradeOrderService } from '../user/services/trade-order.service';
import { OrderStatus } from '../user/entities/trade-order.entity';
import { AccountType } from '../user/entities/user-account.entity';

/**
 * 管理员订单控制器
 */
@Controller('admin/orders')
@UseGuards(JwtAuthGuard)
export class AdminOrderController {
  constructor(private readonly tradeOrderService: TradeOrderService) {}

  /**
   * 获取所有订单列表（分页）
   */
  @Get()
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('accountType') accountType?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page.toString()) : 1;
    const pageSize = limit ? parseInt(limit.toString()) : 20;
    const type = accountType === 'demo' ? AccountType.DEMO : AccountType.REAL;

    const result = await this.tradeOrderService.getAllOrdersWithPagination(
      pageNum,
      pageSize,
      status,
      type,
      search,
    );

    return {
      data: result,
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 获取订单统计信息
   */
  @Get('stats')
  async getOrderStats(@Query('accountType') accountType?: string) {
    const type = accountType === 'demo' ? AccountType.DEMO : AccountType.REAL;
    const stats = await this.tradeOrderService.getGlobalStats(type);
    return {
      data: stats,
      code: 0,
      msg: '请求成功',
    };
  }
}

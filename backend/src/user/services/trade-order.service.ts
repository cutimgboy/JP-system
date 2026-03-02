import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  TradeOrderEntity,
  TradeType,
  OrderStatus,
  OrderResult,
  AccountType,
} from '../entities/trade-order.entity';
import { AccountService } from './account.service';
import { RedisService } from '../../redis/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * 创建订单DTO
 */
export class CreateOrderDto {
  stockCode: string;
  stockName?: string;
  tradeType: TradeType;
  investmentAmount: number;
  durationSeconds: number;
  profitRate?: number;
  accountType?: AccountType;
}

/**
 * 交易订单服务
 */
@Injectable()
export class TradeOrderService {
  private readonly logger = new Logger(TradeOrderService.name);

  constructor(
    @InjectRepository(TradeOrderEntity)
    private orderRepository: Repository<TradeOrderEntity>,
    private accountService: AccountService,
    private redisService: RedisService,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建交易订单（开仓）
   */
  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<TradeOrderEntity> {
    // 验证投资金额
    if (dto.investmentAmount <= 0) {
      throw new BadRequestException('投资金额必须大于0');
    }

    // 验证交易时长
    if (dto.durationSeconds < 30 || dto.durationSeconds > 300) {
      throw new BadRequestException('交易时长必须在30秒到300秒之间');
    }

    const accountType = dto.accountType || AccountType.DEMO;

    // 获取当前价格
    const currentPrice = await this.getCurrentPrice(dto.stockCode);
    if (!currentPrice) {
      throw new BadRequestException('无法获取当前价格');
    }

    // 冻结资金
    await this.accountService.freezeBalance(userId, dto.investmentAmount, accountType);

    // 创建订单
    const order = new TradeOrderEntity();
    order.userId = userId;
    order.accountType = accountType;
    order.stockCode = dto.stockCode;
    order.stockName = dto.stockName || dto.stockCode;
    order.tradeType = dto.tradeType;
    order.status = OrderStatus.OPEN;
    order.result = OrderResult.PENDING;
    order.investmentAmount = dto.investmentAmount;
    order.profitRate = dto.profitRate || 92;
    order.openPrice = currentPrice;
    order.profitLoss = 0;
    order.durationSeconds = dto.durationSeconds;
    order.openTime = new Date();
    order.expectedCloseTime = new Date(Date.now() + dto.durationSeconds * 1000);

    const savedOrder = await this.orderRepository.save(order);

    this.logger.log(
      `订单创建成功: ID=${savedOrder.id}, 用户=${userId}, 账户类型=${accountType}, 股票=${dto.stockCode}, 类型=${dto.tradeType}, 金额=${dto.investmentAmount}`,
    );

    return savedOrder;
  }

  /**
   * 平仓订单
   */
  async closeOrder(orderId: number): Promise<TradeOrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException('订单状态不正确');
    }

    // 获取平仓价格
    const closePrice = await this.getCurrentPrice(order.stockCode);
    if (!closePrice) {
      throw new BadRequestException('无法获取平仓价格');
    }

    return await this.dataSource.transaction(async (manager) => {
      // 更新订单信息
      order.closePrice = closePrice;
      order.closeTime = new Date();
      order.status = OrderStatus.CLOSED;

      // 判断盈亏
      const isDraw = order.isDraw();
      const isWin = order.isWin();

      if (isDraw) {
        order.result = OrderResult.DRAW;
      } else if (isWin) {
        order.result = OrderResult.WIN;
      } else {
        order.result = OrderResult.LOSS;
      }

      order.profitLoss = order.calculateProfitLoss();

      // 结算资金
      if (isDraw) {
        // 持平：返还本金
        await this.accountService.settleDrawOrder(
          order.userId,
          Number(order.investmentAmount),
          order.accountType,
        );
      } else if (isWin) {
        // 盈利：返还本金 + 利润
        await this.accountService.settleProfitOrder(
          order.userId,
          Number(order.investmentAmount),
          order.getExpectedProfit(),
          order.accountType,
        );
      } else {
        // 亏损：扣除本金
        await this.accountService.settleLossOrder(
          order.userId,
          Number(order.investmentAmount),
          order.accountType,
        );
      }

      const savedOrder = await manager.save(order);

      this.logger.log(
        `订单平仓: ID=${orderId}, 结果=${order.result}, 盈亏=${order.profitLoss}`,
      );

      return savedOrder;
    });
  }

  /**
   * 获取用户订单列表
   */
  async getUserOrders(
    userId: number,
    status?: OrderStatus,
    limit: number = 50,
    accountType: AccountType = AccountType.DEMO,
  ): Promise<TradeOrderEntity[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.accountType = :accountType', { accountType })
      .orderBy('order.createdAt', 'DESC')
      .take(limit);

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    return await query.getMany();
  }

  /**
   * 获取用户当前持仓
   */
  async getUserOpenOrders(userId: number, accountType: AccountType = AccountType.DEMO): Promise<TradeOrderEntity[]> {
    return await this.orderRepository.find({
      where: {
        userId,
        accountType,
        status: OrderStatus.OPEN,
      },
      order: {
        openTime: 'DESC',
      },
    });
  }

  /**
   * 获取订单详情
   */
  async getOrderById(orderId: number, userId: number): Promise<TradeOrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 获取用户交易统计
   */
  async getUserStats(userId: number, accountType: AccountType = AccountType.DEMO): Promise<{
    totalOrders: number;
    openOrders: number;
    closedOrders: number;
    winOrders: number;
    lossOrders: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    todayProfitLoss: number;
  }> {
    const orders = await this.orderRepository.find({
      where: { userId, accountType },
    });

    const totalOrders = orders.length;
    const openOrders = orders.filter((o) => o.status === OrderStatus.OPEN).length;
    const closedOrders = orders.filter((o) => o.status === OrderStatus.CLOSED).length;
    const winOrders = orders.filter((o) => o.result === OrderResult.WIN).length;
    const lossOrders = orders.filter((o) => o.result === OrderResult.LOSS).length;
    const winRate = closedOrders > 0 ? (winOrders / closedOrders) * 100 : 0;

    const totalProfit = orders
      .filter((o) => o.result === OrderResult.WIN)
      .reduce((sum, o) => sum + Number(o.profitLoss), 0);

    const totalLoss = Math.abs(
      orders
        .filter((o) => o.result === OrderResult.LOSS)
        .reduce((sum, o) => sum + Number(o.profitLoss), 0),
    );

    const netProfit = totalProfit - totalLoss;

    // 计算今日盈亏
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayProfitLoss = orders
      .filter((o) => o.status === OrderStatus.CLOSED && new Date(o.closeTime) >= today)
      .reduce((sum, o) => sum + Number(o.profitLoss), 0);

    return {
      totalOrders,
      openOrders,
      closedOrders,
      winOrders,
      lossOrders,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit,
      totalLoss,
      netProfit,
      todayProfitLoss,
    };
  }

  /**
   * 定时任务：自动平仓到期订单
   * 每秒执行一次
   */
  @Cron(CronExpression.EVERY_SECOND)
  async autoCloseExpiredOrders(): Promise<void> {
    const now = new Date();

    // 查找所有到期的订单
    const expiredOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.OPEN })
      .andWhere('order.expectedCloseTime <= :now', { now })
      .getMany();

    if (expiredOrders.length === 0) {
      return;
    }

    this.logger.log(`发现 ${expiredOrders.length} 个到期订单，开始自动平仓`);

    // 逐个平仓
    for (const order of expiredOrders) {
      try {
        await this.closeOrder(order.id);
      } catch (error) {
        this.logger.error(
          `自动平仓失败: 订单ID=${order.id}, 错误=${error.message}`,
        );
      }
    }
  }

  /**
   * 管理员：获取所有订单（分页）
   */
  async getAllOrdersWithPagination(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
    accountType?: AccountType,
    search?: string,
  ): Promise<{
    orders: TradeOrderEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');

    // 只查询真实账户的订单
    if (accountType) {
      query.andWhere('order.accountType = :accountType', { accountType });
    } else {
      query.andWhere('order.accountType = :accountType', { accountType: AccountType.REAL });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(order.id = :orderId OR order.userId = :userId OR order.stockCode LIKE :search)',
        {
          orderId: isNaN(Number(search)) ? 0 : Number(search),
          userId: isNaN(Number(search)) ? 0 : Number(search),
          search: `%${search}%`,
        },
      );
    }

    const total = await query.getCount();
    const orders = await query
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 管理员：获取全局统计
   */
  async getGlobalStats(accountType: AccountType = AccountType.REAL): Promise<{
    totalOrders: number;
    openOrders: number;
    winOrders: number;
    lossOrders: number;
    totalProfit: number;
    totalLoss: number;
  }> {
    const orders = await this.orderRepository.find({
      where: { accountType },
    });

    const totalOrders = orders.length;
    const openOrders = orders.filter((o) => o.status === OrderStatus.OPEN).length;
    const winOrders = orders.filter((o) => o.result === OrderResult.WIN).length;
    const lossOrders = orders.filter((o) => o.result === OrderResult.LOSS).length;

    const totalProfit = orders
      .filter((o) => o.result === OrderResult.WIN)
      .reduce((sum, o) => sum + Number(o.profitLoss), 0);

    const totalLoss = Math.abs(
      orders
        .filter((o) => o.result === OrderResult.LOSS)
        .reduce((sum, o) => sum + Number(o.profitLoss), 0),
    );

    return {
      totalOrders,
      openOrders,
      winOrders,
      lossOrders,
      totalProfit,
      totalLoss,
    };
  }

  /**
   * 从Redis获取当前价格
   */
  private async getCurrentPrice(stockCode: string): Promise<number | null> {
    try {
      const cacheKey = `stock:quote:${stockCode}`;
      const data = await this.redisService.get(cacheKey);

      if (data) {
        const quote = JSON.parse(data);
        // 使用买入价作为开仓价格
        return quote.buy_price || quote.sale_price || null;
      }

      return null;
    } catch (error) {
      this.logger.error(`获取价格失败: ${stockCode}, ${error.message}`);
      return null;
    }
  }
}

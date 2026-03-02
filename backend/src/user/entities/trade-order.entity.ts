import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * 账户类型
 */
export enum AccountType {
  DEMO = 'demo', // 模拟账户
  REAL = 'real', // 真实账户
}

/**
 * 交易订单类型
 */
export enum TradeType {
  BULL = 'bull', // 看涨
  BEAR = 'bear', // 看跌
}

/**
 * 订单状态
 */
export enum OrderStatus {
  PENDING = 'pending', // 待开仓
  OPEN = 'open', // 已开仓（交易中）
  CLOSED = 'closed', // 已平仓
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 订单结果
 */
export enum OrderResult {
  PENDING = 'pending', // 待结算
  WIN = 'win', // 盈利
  LOSS = 'loss', // 亏损
  DRAW = 'draw', // 平局
}

/**
 * 交易订单实体
 */
@Entity('trade_orders')
@Index(['userId', 'accountType', 'status'])
@Index(['userId', 'accountType', 'createdAt'])
@Index(['stockCode', 'status'])
export class TradeOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', comment: '用户ID' })
  userId: number;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
    default: AccountType.DEMO,
    comment: '账户类型：demo=模拟账户，real=真实账户',
  })
  accountType: AccountType;

  @Column({
    name: 'stock_code',
    type: 'varchar',
    length: 20,
    comment: '股票代码',
  })
  stockCode: string;

  @Column({
    name: 'stock_name',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '股票名称',
  })
  stockName: string;

  @Column({
    name: 'trade_type',
    type: 'enum',
    enum: TradeType,
    comment: '交易类型：bull=看涨，bear=看跌',
  })
  tradeType: TradeType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderResult,
    default: OrderResult.PENDING,
    comment: '订单结果',
  })
  result: OrderResult;

  @Column({
    name: 'investment_amount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    comment: '投资金额',
  })
  investmentAmount: number;

  @Column({
    name: 'profit_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 92,
    comment: '盈利率（%）',
  })
  profitRate: number;

  @Column({
    name: 'open_price',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: '开仓价格',
  })
  openPrice: number;

  @Column({
    name: 'close_price',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: '平仓价格',
  })
  closePrice: number;

  @Column({
    name: 'profit_loss',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '盈亏金额',
  })
  profitLoss: number;

  @Column({
    name: 'duration_seconds',
    type: 'int',
    comment: '交易时长（秒）',
  })
  durationSeconds: number;

  @Column({
    name: 'open_time',
    type: 'timestamp',
    nullable: true,
    comment: '开仓时间',
  })
  openTime: Date;

  @Column({
    name: 'close_time',
    type: 'timestamp',
    nullable: true,
    comment: '平仓时间',
  })
  closeTime: Date;

  @Column({
    name: 'expected_close_time',
    type: 'timestamp',
    nullable: true,
    comment: '预期平仓时间',
  })
  expectedCloseTime: Date;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 计算预期收益
   */
  getExpectedProfit(): number {
    return Number(this.investmentAmount) * (Number(this.profitRate) / 100);
  }

  /**
   * 计算预期总收益（本金+利润）
   */
  getExpectedTotalReturn(): number {
    return Number(this.investmentAmount) + this.getExpectedProfit();
  }

  /**
   * 判断是否持平
   */
  isDraw(): boolean {
    if (!this.openPrice || !this.closePrice) return false;
    return Number(this.closePrice) === Number(this.openPrice);
  }

  /**
   * 判断是否盈利
   */
  isWin(): boolean {
    if (!this.openPrice || !this.closePrice) return false;

    const priceChange = Number(this.closePrice) - Number(this.openPrice);

    if (this.tradeType === TradeType.BULL) {
      return priceChange > 0;
    } else {
      return priceChange < 0;
    }
  }

  /**
   * 计算实际盈亏
   */
  calculateProfitLoss(): number {
    if (this.isDraw()) {
      // 持平：不盈利也不亏损
      return 0;
    } else if (this.isWin()) {
      // 盈利：返还利润（92%）
      return this.getExpectedProfit();
    } else {
      // 亏损：损失本金
      return -Number(this.investmentAmount);
    }
  }
}

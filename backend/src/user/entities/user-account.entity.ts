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
 * 用户账户实体
 * 管理用户的账户余额和资金变动
 */
@Entity('user_accounts')
@Index(['userId', 'accountType'], { unique: true })
export class UserAccountEntity {
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
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '账户余额',
  })
  balance: number;

  @Column({
    name: 'frozen_balance',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '冻结金额（交易中）',
  })
  frozenBalance: number;

  @Column({
    name: 'total_deposit',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '累计充值',
  })
  totalDeposit: number;

  @Column({
    name: 'total_withdrawal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '累计提现',
  })
  totalWithdrawal: number;

  @Column({
    name: 'total_profit',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '累计盈利',
  })
  totalProfit: number;

  @Column({
    name: 'total_loss',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
    comment: '累计亏损',
  })
  totalLoss: number;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'VND',
    comment: '货币类型',
  })
  currency: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联用户（多对一关系，一个用户可以有多个账户）
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 获取可用余额
   */
  getAvailableBalance(): number {
    return Number(this.balance) - Number(this.frozenBalance);
  }

  /**
   * 获取总资产
   */
  getTotalAssets(): number {
    return Number(this.balance);
  }

  /**
   * 获取净盈亏
   */
  getNetProfit(): number {
    return Number(this.totalProfit) - Number(this.totalLoss);
  }
}

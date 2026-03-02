import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 奖励领取记录实体
 */
@Entity('reward_claims')
@Index(['userId', 'accountType'], { unique: true })
export class RewardClaimEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', comment: '用户ID' })
  userId: number;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: ['demo', 'real'],
    comment: '账户类型：demo=模拟账户，real=真实账户',
  })
  accountType: 'demo' | 'real';

  @Column({
    name: 'reward_amount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    comment: '领取的奖励金额',
  })
  rewardAmount: number;

  @CreateDateColumn({ name: 'claimed_at', comment: '领取时间' })
  claimedAt: Date;
}

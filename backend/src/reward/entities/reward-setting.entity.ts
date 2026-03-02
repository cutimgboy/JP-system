import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 奖励设置实体
 */
@Entity('reward_settings')
export class RewardSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
    default: 0,
    comment: '奖励金额',
  })
  rewardAmount: number;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    comment: '是否启用：1=启用，0=禁用',
  })
  isActive: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}

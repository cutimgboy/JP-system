import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 社区排行榜实体
 */
@Entity('leaderboard')
export class LeaderboardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'username', comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'avatar', comment: '头像' })
  avatar: string;

  @Column({ type: 'int', name: 'trades', comment: '交易笔数' })
  trades: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'win_rate', comment: '胜率(%)' })
  winRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'profit', comment: '收益金额' })
  profit: number;

  @Column({ type: 'int', name: 'rank', comment: '排名' })
  rank: number;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序顺序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}

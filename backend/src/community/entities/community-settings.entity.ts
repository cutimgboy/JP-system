import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 社区设置实体
 */
@Entity('community_settings')
export class CommunitySettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'key', comment: '设置键' })
  key: string;

  @Column({ type: 'text', name: 'value', comment: '设置值' })
  value: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'description', comment: '描述' })
  description: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}

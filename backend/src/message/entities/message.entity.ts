import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 消息实体
 */
@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'icon', comment: '图标' })
  icon: string;

  @Column({ type: 'varchar', length: 200, name: 'title', comment: '标题' })
  title: string;

  @Column({ type: 'text', name: 'content', comment: '内容' })
  content: string;

  @Column({ type: 'varchar', length: 100, name: 'action_text', comment: '操作按钮文字' })
  actionText: string;

  @Column({
    type: 'enum',
    enum: ['success', 'warning', 'info', 'celebration'],
    default: 'info',
    name: 'type',
    comment: '消息类型'
  })
  type: string;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序顺序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}

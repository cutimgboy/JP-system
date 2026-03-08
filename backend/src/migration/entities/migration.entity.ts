import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('migrations')
export class MigrationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, comment: '迁移文件名' })
  name: string;

  @CreateDateColumn({ type: 'timestamp', comment: '执行时间' })
  executedAt: Date;
}

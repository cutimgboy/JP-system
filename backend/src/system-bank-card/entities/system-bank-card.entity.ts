import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_bank_cards')
export class SystemBankCardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '银行名称' })
  bankName: string;

  @Column({ type: 'varchar', length: 100, comment: '账户名称' })
  accountName: string;

  @Column({ type: 'varchar', length: 50, comment: '账户号码' })
  accountNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'SWIFT代码' })
  swiftCode: string | null;

  @Column({ type: 'tinyint', default: 0, comment: '是否启用：1-启用，0-禁用' })
  isActive: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-正常，0-删除' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}

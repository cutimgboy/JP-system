import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('deposit_records')
export class DepositRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'decimal', precision: 15, scale: 2, comment: '存入金额' })
  amount: number;

  @Column({ type: 'varchar', length: 100, comment: '用户银行名称' })
  userBankName: string;

  @Column({ type: 'varchar', length: 100, comment: '用户账户名称' })
  userAccountName: string;

  @Column({ type: 'varchar', length: 50, comment: '用户账户号码' })
  userAccountNumber: string;

  @Column({ type: 'varchar', length: 100, comment: '系统收款银行名称' })
  systemBankName: string;

  @Column({ type: 'varchar', length: 100, comment: '系统收款账户名称' })
  systemAccountName: string;

  @Column({ type: 'varchar', length: 50, comment: '系统收款账户号码' })
  systemAccountNumber: string;

  @Column({ type: 'text', nullable: true, comment: '转账凭证图片URLs，JSON数组' })
  receiptImages: string | null;

  @Column({ type: 'tinyint', default: 0, comment: '审核状态：0-待审核，1-审核通过，2-审核拒绝' })
  status: number;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '审核备注' })
  remark: string | null;

  @Column({ type: 'int', nullable: true, comment: '审核人ID' })
  reviewerId: number | null;

  @Column({ type: 'timestamp', nullable: true, comment: '审核时间' })
  reviewTime: Date | null;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}

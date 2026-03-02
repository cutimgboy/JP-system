import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('bank_cards')
export class BankCardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100, comment: '银行名称' })
  bankName: string;

  @Column({ type: 'varchar', length: 100, comment: '账户名称' })
  accountName: string;

  @Column({ type: 'varchar', length: 50, comment: '账户号码' })
  accountNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'SWIFT代码' })
  swiftCode: string | null;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-正常，0-禁用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}

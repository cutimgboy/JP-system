import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_identities')
@Index(['userId', 'createTime'])
@Index(['status', 'createTime'])
export class UserIdentityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100, comment: '真实姓名' })
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'id_number', comment: '证件号码' })
  idNumber: string;

  @Column({ type: 'longtext', name: 'id_front_image', comment: '证件正面图片' })
  idFrontImage: string;

  @Column({ type: 'longtext', name: 'id_back_image', comment: '证件反面图片' })
  idBackImage: string;

  @Column({ type: 'longtext', name: 'selfie_image', comment: '手持证件自拍照' })
  selfieImage: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态：0-待审核，1-已通过，2-已拒绝' })
  status: number;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DepositRecordEntity } from '../entities/deposit-record.entity';
import { UserAccountEntity, AccountType } from '../../user/entities/user-account.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(DepositRecordEntity)
    private readonly depositRepository: Repository<DepositRecordEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建入金记录
   */
  async create(data: {
    userId: number;
    amount: number;
    userBankName: string;
    userAccountName: string;
    userAccountNumber: string;
    systemBankName: string;
    systemAccountName: string;
    systemAccountNumber: string;
    receiptImages?: string[];
  }): Promise<DepositRecordEntity> {
    const deposit = this.depositRepository.create({
      userId: data.userId,
      amount: data.amount,
      userBankName: data.userBankName,
      userAccountName: data.userAccountName,
      userAccountNumber: data.userAccountNumber,
      systemBankName: data.systemBankName,
      systemAccountName: data.systemAccountName,
      systemAccountNumber: data.systemAccountNumber,
      receiptImages: data.receiptImages ? JSON.stringify(data.receiptImages) : null,
      status: 0, // 待审核
    });
    return await this.depositRepository.save(deposit);
  }

  /**
   * 获取所有入金记录（后台管理）
   */
  async findAll(
    status?: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    records: DepositRecordEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const where: any = {};
    if (status !== undefined) {
      where.status = Number(status);
    }

    const [records, total] = await this.depositRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createTime: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      records,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    };
  }

  /**
   * 获取用户的入金记录
   */
  async findByUserId(userId: number): Promise<DepositRecordEntity[]> {
    return await this.depositRepository.find({
      where: { userId },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据ID获取入金记录
   */
  async findById(id: number): Promise<DepositRecordEntity | null> {
    return await this.depositRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * 审核入金记录
   */
  async review(id: number, data: {
    status: number;
    remark?: string;
    reviewerId: number;
  }): Promise<DepositRecordEntity | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取入金记录
      const deposit = await queryRunner.manager.findOne(DepositRecordEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!deposit) {
        throw new NotFoundException('入金记录不存在');
      }

      if (![1, 2].includes(data.status)) {
        throw new BadRequestException('审核状态不正确');
      }

      if (deposit.status !== 0) {
        throw new BadRequestException('该入金记录已审核，不能重复处理');
      }

      // 更新入金记录状态
      await queryRunner.manager.update(DepositRecordEntity, id, {
        status: data.status,
        remark: data.remark || null,
        reviewerId: data.reviewerId,
        reviewTime: new Date(),
      });

      // 如果审核通过（status = 1），更新用户真实账户余额
      if (data.status === 1) {
        const realAccount = await queryRunner.manager.findOne(UserAccountEntity, {
          where: {
            userId: deposit.userId,
            accountType: AccountType.REAL,
          },
        });

        if (realAccount) {
          await queryRunner.manager.update(
            UserAccountEntity,
            { id: realAccount.id },
            {
              balance: () => `balance + ${deposit.amount}`,
              totalDeposit: () => `totalDeposit + ${deposit.amount}`,
            },
          );
        }
      }

      await queryRunner.commitTransaction();
      return await this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

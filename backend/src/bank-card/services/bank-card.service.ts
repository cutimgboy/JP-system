import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankCardEntity } from '../entities/bank-card.entity';

@Injectable()
export class BankCardService {
  constructor(
    @InjectRepository(BankCardEntity)
    private readonly bankCardRepository: Repository<BankCardEntity>,
  ) {}

  /**
   * 获取用户的所有银行卡
   */
  async findByUserId(userId: number): Promise<BankCardEntity[]> {
    return await this.bankCardRepository.find({
      where: { userId, status: 1 },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据ID获取银行卡
   */
  async findById(id: number): Promise<BankCardEntity | null> {
    return await this.bankCardRepository.findOne({ where: { id } });
  }

  /**
   * 创建银行卡
   */
  async create(data: {
    userId: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
  }): Promise<BankCardEntity> {
    const bankCard = this.bankCardRepository.create({
      userId: data.userId,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      swiftCode: data.swiftCode || null,
      status: 1,
    });
    return await this.bankCardRepository.save(bankCard);
  }

  /**
   * 更新银行卡
   */
  async update(id: number, data: Partial<BankCardEntity>): Promise<BankCardEntity | null> {
    await this.bankCardRepository.update(id, data);
    return await this.findById(id);
  }

  /**
   * 删除银行卡（软删除）
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.bankCardRepository.update(id, { status: 0 });
    return (result.affected ?? 0) > 0;
  }
}

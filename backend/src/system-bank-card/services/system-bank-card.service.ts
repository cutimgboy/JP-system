import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemBankCardEntity } from '../entities/system-bank-card.entity';

@Injectable()
export class SystemBankCardService {
  constructor(
    @InjectRepository(SystemBankCardEntity)
    private readonly systemBankCardRepository: Repository<SystemBankCardEntity>,
  ) {}

  /**
   * 获取所有系统银行卡
   */
  async findAll(): Promise<SystemBankCardEntity[]> {
    return await this.systemBankCardRepository.find({
      where: { status: 1 },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 获取当前启用的银行卡
   */
  async findActive(): Promise<SystemBankCardEntity | null> {
    return await this.systemBankCardRepository.findOne({
      where: { status: 1, isActive: 1 },
    });
  }

  /**
   * 根据ID获取银行卡
   */
  async findById(id: number): Promise<SystemBankCardEntity | null> {
    return await this.systemBankCardRepository.findOne({ where: { id } });
  }

  /**
   * 创建系统银行卡
   */
  async create(data: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
  }): Promise<SystemBankCardEntity> {
    const bankCard = this.systemBankCardRepository.create({
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      swiftCode: data.swiftCode || null,
      isActive: 0,
      status: 1,
    });
    return await this.systemBankCardRepository.save(bankCard);
  }

  /**
   * 更新系统银行卡
   */
  async update(id: number, data: Partial<SystemBankCardEntity>): Promise<SystemBankCardEntity | null> {
    await this.systemBankCardRepository.update(id, data);
    return await this.findById(id);
  }

  /**
   * 启用银行卡（同时禁用其他所有银行卡）
   */
  async activate(id: number): Promise<boolean> {
    // 先禁用所有银行卡
    await this.systemBankCardRepository.update({ status: 1 }, { isActive: 0 });

    // 启用指定银行卡
    const result = await this.systemBankCardRepository.update(id, { isActive: 1 });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 删除银行卡（软删除）
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.systemBankCardRepository.update(id, { status: 0, isActive: 0 });
    return (result.affected ?? 0) > 0;
  }
}

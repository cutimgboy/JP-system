import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RewardSettingEntity } from '../entities/reward-setting.entity';
import { RewardClaimEntity } from '../entities/reward-claim.entity';
import { UserAccountEntity, AccountType } from '../../user/entities/user-account.entity';

@Injectable()
export class RewardSettingService {
  constructor(
    @InjectRepository(RewardSettingEntity)
    private readonly rewardSettingRepository: Repository<RewardSettingEntity>,
    @InjectRepository(RewardClaimEntity)
    private readonly rewardClaimRepository: Repository<RewardClaimEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取指定账户类型的奖励设置
   */
  async getByAccountType(accountType: 'demo' | 'real'): Promise<RewardSettingEntity | null> {
    return await this.rewardSettingRepository.findOne({
      where: { accountType, isActive: 1 },
    });
  }

  /**
   * 获取所有奖励设置
   */
  async findAll(): Promise<RewardSettingEntity[]> {
    return await this.rewardSettingRepository.find({
      order: { accountType: 'ASC' },
    });
  }

  /**
   * 更新奖励设置
   */
  async update(id: number, data: { rewardAmount?: number; isActive?: number }): Promise<boolean> {
    const result = await this.rewardSettingRepository.update(id, data);
    return (result.affected ?? 0) > 0;
  }

  /**
   * 创建奖励设置
   */
  async create(data: { accountType: 'demo' | 'real'; rewardAmount: number }): Promise<RewardSettingEntity> {
    const setting = this.rewardSettingRepository.create(data);
    return await this.rewardSettingRepository.save(setting);
  }

  /**
   * 领取奖励
   */
  async claimReward(userId: number, accountType: 'demo' | 'real'): Promise<{ success: boolean; message: string; amount?: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查是否已经领取过
      const existingClaim = await queryRunner.manager.findOne(RewardClaimEntity, {
        where: { userId, accountType },
      });

      if (existingClaim) {
        await queryRunner.rollbackTransaction();
        return { success: false, message: '您已经领取过该奖励' };
      }

      // 获取奖励设置
      const rewardSetting = await queryRunner.manager.findOne(RewardSettingEntity, {
        where: { accountType, isActive: 1 },
      });

      if (!rewardSetting || rewardSetting.rewardAmount <= 0) {
        await queryRunner.rollbackTransaction();
        return { success: false, message: '当前没有可领取的奖励' };
      }

      // 获取用户账户
      const userAccount = await queryRunner.manager.findOne(UserAccountEntity, {
        where: { userId, accountType: accountType as AccountType },
      });

      if (!userAccount) {
        await queryRunner.rollbackTransaction();
        return { success: false, message: '账户不存在' };
      }

      // 增加余额
      userAccount.balance = Number(userAccount.balance) + Number(rewardSetting.rewardAmount);
      await queryRunner.manager.save(userAccount);

      // 记录领取
      const claim = queryRunner.manager.create(RewardClaimEntity, {
        userId,
        accountType,
        rewardAmount: rewardSetting.rewardAmount,
      });
      await queryRunner.manager.save(claim);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: '领取成功',
        amount: Number(rewardSetting.rewardAmount),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查用户是否已领取奖励
   */
  async hasClaimedReward(userId: number, accountType: 'demo' | 'real'): Promise<boolean> {
    const claim = await this.rewardClaimRepository.findOne({
      where: { userId, accountType },
    });
    return !!claim;
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserAccountEntity, AccountType } from '../entities/user-account.entity';

/**
 * 账户余额管理服务
 */
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(UserAccountEntity)
    private accountRepository: Repository<UserAccountEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取用户所有账户列表
   */
  async getUserAccounts(userId: number): Promise<UserAccountEntity[]> {
    // 确保用户至少有 demo 和 real 两个账户
    await this.getOrCreateAccount(userId, AccountType.DEMO);
    await this.getOrCreateAccount(userId, AccountType.REAL);

    // 返回用户的所有账户
    return await this.accountRepository.find({
      where: { userId },
      order: { accountType: 'ASC' }, // demo 在前，real 在后
    });
  }

  /**
   * 获取用户账户信息
   * 如果不存在则自动创建
   */
  async getOrCreateAccount(userId: number, accountType: AccountType = AccountType.DEMO): Promise<UserAccountEntity> {
    let account = await this.accountRepository.findOne({
      where: { userId, accountType },
    });

    if (!account) {
      // 自动创建账户
      // 模拟账户初始余额为 1,000,000 VND（用于测试）
      // 真实账户初始余额为 0
      const initialBalance = accountType === AccountType.DEMO ? 1000000 : 0;

      account = this.accountRepository.create({
        userId,
        accountType,
        balance: initialBalance,
        frozenBalance: 0,
        totalDeposit: initialBalance, // 记录为初始充值（仅模拟账户）
        totalWithdrawal: 0,
        totalProfit: 0,
        totalLoss: 0,
        currency: 'VND',
      });
      await this.accountRepository.save(account);
    }

    return account;
  }

  /**
   * 获取账户余额
   */
  async getBalance(userId: number, accountType: AccountType = AccountType.DEMO): Promise<{
    balance: number;
    frozenBalance: number;
    availableBalance: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
  }> {
    const account = await this.getOrCreateAccount(userId, accountType);

    return {
      balance: Number(account.balance),
      frozenBalance: Number(account.frozenBalance),
      availableBalance: account.getAvailableBalance(),
      totalProfit: Number(account.totalProfit),
      totalLoss: Number(account.totalLoss),
      netProfit: account.getNetProfit(),
    };
  }

  /**
   * 冻结资金（开仓时）
   */
  async freezeBalance(userId: number, amount: number, accountType: AccountType = AccountType.DEMO): Promise<void> {
    const account = await this.getOrCreateAccount(userId, accountType);

    if (account.getAvailableBalance() < amount) {
      throw new BadRequestException('账户余额不足');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.increment(
        UserAccountEntity,
        { userId, accountType },
        'frozenBalance',
        amount,
      );
    });
  }

  /**
   * 解冻资金（取消订单时）
   */
  async unfreezeBalance(userId: number, amount: number, accountType: AccountType = AccountType.DEMO): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.decrement(
        UserAccountEntity,
        { userId, accountType },
        'frozenBalance',
        amount,
      );
    });
  }

  /**
   * 结算盈利（平仓盈利时）
   * @param userId 用户ID
   * @param frozenAmount 冻结的本金
   * @param profit 盈利金额
   * @param accountType 账户类型
   */
  async settleProfitOrder(
    userId: number,
    frozenAmount: number,
    profit: number,
    accountType: AccountType = AccountType.DEMO,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(UserAccountEntity, {
        where: { userId, accountType },
      });

      if (!account) {
        throw new NotFoundException('账户不存在');
      }

      // 解冻本金
      account.frozenBalance = Number(account.frozenBalance) - frozenAmount;
      // 增加余额（本金已在账户中，只需加上利润）
      account.balance = Number(account.balance) + profit;
      // 累计盈利
      account.totalProfit = Number(account.totalProfit) + profit;

      await manager.save(account);
    });
  }

  /**
   * 结算亏损（平仓亏损时）
   * @param userId 用户ID
   * @param frozenAmount 冻结的本金（将被扣除）
   * @param accountType 账户类型
   */
  async settleLossOrder(
    userId: number,
    frozenAmount: number,
    accountType: AccountType = AccountType.DEMO,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(UserAccountEntity, {
        where: { userId, accountType },
      });

      if (!account) {
        throw new NotFoundException('账户不存在');
      }

      // 解冻本金
      account.frozenBalance = Number(account.frozenBalance) - frozenAmount;
      // 扣除余额（亏损本金）
      account.balance = Number(account.balance) - frozenAmount;
      // 累计亏损
      account.totalLoss = Number(account.totalLoss) + frozenAmount;

      await manager.save(account);
    });
  }

  /**
   * 结算持平（平仓持平时）
   * @param userId 用户ID
   * @param frozenAmount 冻结的本金（将被返还）
   * @param accountType 账户类型
   */
  async settleDrawOrder(
    userId: number,
    frozenAmount: number,
    accountType: AccountType = AccountType.DEMO,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(UserAccountEntity, {
        where: { userId, accountType },
      });

      if (!account) {
        throw new NotFoundException('账户不存在');
      }

      // 解冻本金（余额不变，只是解冻）
      account.frozenBalance = Number(account.frozenBalance) - frozenAmount;

      await manager.save(account);
    });
  }

  /**
   * 充值
   */
  async deposit(userId: number, amount: number, accountType: AccountType = AccountType.DEMO): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.increment(UserAccountEntity, { userId, accountType }, 'balance', amount);
      await manager.increment(
        UserAccountEntity,
        { userId, accountType },
        'totalDeposit',
        amount,
      );
    });
  }

  /**
   * 提现
   */
  async withdraw(userId: number, amount: number, accountType: AccountType = AccountType.DEMO): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('提现金额必须大于0');
    }

    const account = await this.getOrCreateAccount(userId, accountType);

    if (account.getAvailableBalance() < amount) {
      throw new BadRequestException('可用余额不足');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.decrement(UserAccountEntity, { userId, accountType }, 'balance', amount);
      await manager.increment(
        UserAccountEntity,
        { userId, accountType },
        'totalWithdrawal',
        amount,
      );
    });
  }
}

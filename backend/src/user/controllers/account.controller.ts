import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AccountType } from '../entities/user-account.entity';

/**
 * 账户管理控制器
 */
@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * 获取用户所有账户列表
   */
  @Get('list')
  async getAccountList(@Request() req) {
    const userId = req.user.id;
    const accounts = await this.accountService.getUserAccounts(userId);
    return {
      data: accounts,
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 获取账户余额
   */
  @Get('balance')
  async getBalance(@Request() req, @Query('accountType') accountType?: string) {
    const userId = req.user.id;
    const type = accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    return {
      data: await this.accountService.getBalance(userId, type),
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 充值（测试用）
   */
  @Post('deposit')
  async deposit(
    @Request() req,
    @Body() body: { amount: number; accountType?: string },
  ) {
    const userId = req.user.id;
    const type = body.accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    await this.accountService.deposit(userId, body.amount, type);
    return {
      data: { message: '充值成功' },
      code: 0,
      msg: '请求成功',
    };
  }

  /**
   * 提现（测试用）
   */
  @Post('withdraw')
  async withdraw(
    @Request() req,
    @Body() body: { amount: number; accountType?: string },
  ) {
    const userId = req.user.id;
    const type = body.accountType === 'real' ? AccountType.REAL : AccountType.DEMO;
    await this.accountService.withdraw(userId, body.amount, type);
    return {
      data: { message: '提现成功' },
      code: 0,
      msg: '请求成功',
    };
  }
}

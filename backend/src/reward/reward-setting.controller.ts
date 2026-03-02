import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { RewardSettingService } from './services/reward-setting.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

/**
 * 奖励设置控制器
 */
@Controller('reward')
@UseGuards(JwtAuthGuard)
export class RewardSettingController {
  constructor(private readonly rewardSettingService: RewardSettingService) {}

  /**
   * 获取指定账户类型的奖励金额（用户端）
   */
  @Get('amount')
  async getRewardAmount(@Query('accountType') accountType: 'demo' | 'real') {
    const setting = await this.rewardSettingService.getByAccountType(accountType);
    return {
      data: {
        rewardAmount: setting?.rewardAmount || 0,
        isActive: setting?.isActive || 0,
      },
      code: 0,
      msg: '获取成功',
    };
  }

  /**
   * 获取所有奖励设置（管理端）
   */
  @Get('settings')
  async getAllSettings() {
    const settings = await this.rewardSettingService.findAll();
    return {
      data: settings,
      code: 0,
      msg: '获取成功',
    };
  }

  /**
   * 更新奖励设置（管理端）
   */
  @Put('settings/:id')
  async updateSetting(
    @Param('id') id: number,
    @Body() data: { rewardAmount?: number; isActive?: number },
  ) {
    const success = await this.rewardSettingService.update(id, data);
    if (success) {
      return {
        data: null,
        code: 0,
        msg: '更新成功',
      };
    }
    return {
      data: null,
      code: 1,
      msg: '更新失败',
    };
  }

  /**
   * 领取奖励（用户端）
   */
  @Post('claim')
  async claimReward(
    @Request() req,
    @Body() body: { accountType: 'demo' | 'real' },
  ) {
    const userId = req.user.id;
    const result = await this.rewardSettingService.claimReward(userId, body.accountType);

    if (result.success) {
      return {
        data: { amount: result.amount },
        code: 0,
        msg: result.message,
      };
    }

    return {
      data: null,
      code: 1,
      msg: result.message,
    };
  }
}

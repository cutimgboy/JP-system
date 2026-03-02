import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './services/leaderboard.service';
import { CommunitySettingsService } from './services/community-settings.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

@Controller('api/community')
export class CommunityController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly settingsService: CommunitySettingsService,
  ) {}

  /**
   * 获取排行榜数据（公开接口）
   */
  @Get('leaderboard')
  async getLeaderboard() {
    return await this.leaderboardService.findAll();
  }

  /**
   * 获取社区设置（公开接口）
   */
  @Get('settings')
  async getSettings() {
    return await this.settingsService.getAll();
  }
}

@Controller('api/admin/community')
@UseGuards(JwtAuthGuard)
export class AdminCommunityController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly settingsService: CommunitySettingsService,
  ) {}

  /**
   * 获取所有排行榜数据
   */
  @Get('leaderboard')
  async getAllLeaderboard() {
    return await this.leaderboardService.findAll();
  }

  /**
   * 创建排行榜记录
   */
  @Post('leaderboard')
  async createLeaderboard(@Body() createDto: CreateLeaderboardDto) {
    return await this.leaderboardService.create(createDto);
  }

  /**
   * 更新排行榜记录
   */
  @Put('leaderboard/:id')
  async updateLeaderboard(
    @Param('id') id: string,
    @Body() updateDto: UpdateLeaderboardDto,
  ) {
    return await this.leaderboardService.update(+id, updateDto);
  }

  /**
   * 删除排行榜记录
   */
  @Delete('leaderboard/:id')
  async deleteLeaderboard(@Param('id') id: string) {
    await this.leaderboardService.remove(+id);
    return { success: true };
  }

  /**
   * 批量更新排序
   */
  @Put('leaderboard/sort-order')
  async updateSortOrder(@Body() items: { id: number; sortOrder: number }[]) {
    await this.leaderboardService.updateSortOrder(items);
    return { success: true };
  }

  /**
   * 更新社区设置
   */
  @Put('settings')
  async updateSettings(@Body() settings: { date: string; participants: number }) {
    return await this.settingsService.updateSettings(settings);
  }
}

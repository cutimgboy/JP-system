import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepositService } from './services/deposit.service';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { ReviewDepositDto } from './dto/review-deposit.dto';

@ApiTags('入金记录')
@Controller('deposit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  @ApiOperation({ summary: '创建入金记录' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createDeposit(
    @CurrentUser() user,
    @Body() data: CreateDepositDto,
  ) {
    try {
      const deposit = await this.depositService.create({
        userId: user.id,
        ...data,
      });
      return {
        data: deposit,
        code: 0,
        msg: '提交成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '提交失败',
      };
    }
  }

  @Get('list')
  @ApiOperation({ summary: '获取用户的入金记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserDeposits(@CurrentUser() user) {
    try {
      const deposits = await this.depositService.findByUserId(user.id);
      return {
        data: deposits,
        code: 0,
        msg: '获取成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '获取失败',
      };
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '获取所有入金记录（后台管理）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAllDeposits(
    @Query('status') status?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const deposits = await this.depositService.findAll(status, page, limit);
      return {
        data: deposits,
        code: 0,
        msg: '获取成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '获取失败',
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取入金记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDeposit(@Param('id') id: number, @CurrentUser() user) {
    try {
      const deposit = await this.depositService.findById(id);
      if (!deposit || (user.role !== 'admin' && deposit.userId !== user.id)) {
        return {
          data: null,
          code: 1,
          msg: '记录不存在',
        };
      }
      return {
        data: deposit,
        code: 0,
        msg: '获取成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '获取失败',
      };
    }
  }

  @Put(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '审核入金记录' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async reviewDeposit(
    @Param('id') id: number,
    @CurrentUser() user,
    @Body() data: ReviewDepositDto,
  ) {
    try {
      const deposit = await this.depositService.findById(id);
      if (!deposit) {
        return {
          data: null,
          code: 1,
          msg: '记录不存在',
        };
      }
      const updatedDeposit = await this.depositService.review(id, {
        status: data.status,
        remark: data.remark,
        reviewerId: user.id,
      });
      return {
        data: updatedDeposit,
        code: 0,
        msg: '审核成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '审核失败',
      };
    }
  }
}

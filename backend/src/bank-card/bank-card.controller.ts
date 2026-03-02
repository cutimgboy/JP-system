import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankCardService } from './services/bank-card.service';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

@ApiTags('银行卡')
@Controller('bank-card')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BankCardController {
  constructor(private readonly bankCardService: BankCardService) {}

  @Get('list')
  @ApiOperation({ summary: '获取用户的银行卡列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getBankCards(@CurrentUser() user) {
    try {
      const bankCards = await this.bankCardService.findByUserId(user.id);
      return {
        data: bankCards,
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
  @ApiOperation({ summary: '获取银行卡详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getBankCard(@Param('id') id: number, @CurrentUser() user) {
    try {
      const bankCard = await this.bankCardService.findById(id);
      if (!bankCard || bankCard.userId !== user.id) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      return {
        data: bankCard,
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

  @Post()
  @ApiOperation({ summary: '添加银行卡' })
  @ApiResponse({ status: 200, description: '添加成功' })
  async createBankCard(
    @CurrentUser() user,
    @Body() data: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      swiftCode?: string;
    },
  ) {
    try {
      const bankCard = await this.bankCardService.create({
        userId: user.id,
        ...data,
      });
      return {
        data: bankCard,
        code: 0,
        msg: '添加成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '添加失败',
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新银行卡' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateBankCard(
    @Param('id') id: number,
    @CurrentUser() user,
    @Body() data: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      swiftCode?: string;
    },
  ) {
    try {
      const bankCard = await this.bankCardService.findById(id);
      if (!bankCard || bankCard.userId !== user.id) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      const updatedBankCard = await this.bankCardService.update(id, data);
      return {
        data: updatedBankCard,
        code: 0,
        msg: '更新成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '更新失败',
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除银行卡' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteBankCard(@Param('id') id: number, @CurrentUser() user) {
    try {
      const bankCard = await this.bankCardService.findById(id);
      if (!bankCard || bankCard.userId !== user.id) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      await this.bankCardService.delete(id);
      return {
        data: null,
        code: 0,
        msg: '删除成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '删除失败',
      };
    }
  }
}

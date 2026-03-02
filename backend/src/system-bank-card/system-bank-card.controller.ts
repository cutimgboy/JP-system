import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemBankCardService } from './services/system-bank-card.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';

@ApiTags('系统收款银行卡')
@Controller('system-bank-card')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SystemBankCardController {
  constructor(private readonly systemBankCardService: SystemBankCardService) {}

  @Get('list')
  @ApiOperation({ summary: '获取所有系统银行卡' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemBankCards() {
    try {
      const bankCards = await this.systemBankCardService.findAll();
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

  @Get('active')
  @ApiOperation({ summary: '获取当前启用的系统银行卡' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getActiveBankCard() {
    try {
      const bankCard = await this.systemBankCardService.findActive();
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

  @Get(':id')
  @ApiOperation({ summary: '获取系统银行卡详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemBankCard(@Param('id') id: number) {
    try {
      const bankCard = await this.systemBankCardService.findById(id);
      if (!bankCard) {
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
  @ApiOperation({ summary: '添加系统银行卡' })
  @ApiResponse({ status: 200, description: '添加成功' })
  async createSystemBankCard(
    @Body() data: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      swiftCode?: string;
    },
  ) {
    try {
      const bankCard = await this.systemBankCardService.create(data);
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
  @ApiOperation({ summary: '更新系统银行卡' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateSystemBankCard(
    @Param('id') id: number,
    @Body() data: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      swiftCode?: string;
    },
  ) {
    try {
      const bankCard = await this.systemBankCardService.findById(id);
      if (!bankCard) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      const updatedBankCard = await this.systemBankCardService.update(id, data);
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

  @Put(':id/activate')
  @ApiOperation({ summary: '启用系统银行卡' })
  @ApiResponse({ status: 200, description: '启用成功' })
  async activateSystemBankCard(@Param('id') id: number) {
    try {
      const bankCard = await this.systemBankCardService.findById(id);
      if (!bankCard) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      await this.systemBankCardService.activate(id);
      return {
        data: null,
        code: 0,
        msg: '启用成功',
      };
    } catch (error) {
      return {
        data: null,
        code: 1,
        msg: '启用失败',
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除系统银行卡' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteSystemBankCard(@Param('id') id: number) {
    try {
      const bankCard = await this.systemBankCardService.findById(id);
      if (!bankCard) {
        return {
          data: null,
          code: 1,
          msg: '银行卡不存在',
        };
      }
      await this.systemBankCardService.delete(id);
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

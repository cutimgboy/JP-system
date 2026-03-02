import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('用户')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserInfo(@CurrentUser() user) {
    return {
      data: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        status: user.status,
      },
      code: 0,
      msg: '请求成功',
    };
  }

  @Put('info')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUserInfo(
    @CurrentUser() user,
    @Body() updateData: { phone?: string; email?: string; nickname?: string; avatar?: string },
  ) {
    try {
      const updatedUser = await this.userService.update(user.id, updateData);
      if (!updatedUser) {
        return {
          data: null,
          code: 1,
          msg: '用户不存在',
        };
      }
      return {
        data: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
        },
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
}

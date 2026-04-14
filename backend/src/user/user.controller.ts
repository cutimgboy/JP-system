import { Controller, Get, Put, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
        hasPassword: Boolean(user.password),
        requiresPasswordSetup: !user.password,
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
          hasPassword: Boolean(updatedUser.password),
          requiresPasswordSetup: !updatedUser.password,
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

  @Put('password/setup')
  @ApiOperation({ summary: '首次设置登录密码' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setupPassword(@CurrentUser() user, @Body() body: SetupPasswordDto) {
    if (user.password) {
      throw new BadRequestException('您已设置登录密码，无需重复设置');
    }

    const updatedUser = await this.userService.setupPassword(user.id, body.password);
    if (!updatedUser) {
      throw new BadRequestException('用户不存在');
    }

    return {
      data: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        hasPassword: true,
        requiresPasswordSetup: false,
      },
      code: 0,
      msg: '密码设置成功',
    };
  }

  @Put('password/change')
  @ApiOperation({ summary: '修改登录密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(@CurrentUser() user, @Body() body: ChangePasswordDto) {
    if (!user.password) {
      throw new BadRequestException('当前账户尚未设置登录密码，请先完成首次密码设置');
    }

    const isCurrentPasswordValid = await this.userService.verifyPassword(user, body.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('旧密码错误');
    }

    const isSamePassword = await this.userService.verifyPassword(user, body.newPassword);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与旧密码相同');
    }

    const updatedUser = await this.userService.changePassword(user.id, body.newPassword);
    if (!updatedUser) {
      throw new BadRequestException('用户不存在');
    }

    return {
      data: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        hasPassword: true,
        requiresPasswordSetup: false,
      },
      code: 0,
      msg: '密码修改成功',
    };
  }
}

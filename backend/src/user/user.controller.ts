import { Controller, Get, Put, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('用户')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  private toUserInfo(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status,
      createTime: user.createTime,
      hasPassword: Boolean(user.password),
      requiresPasswordSetup: !user.password,
    };
  }

  @Get('info')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserInfo(@CurrentUser() user) {
    return {
      data: this.toUserInfo(user),
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
      const updatedUser = await this.userService.update(user.id, {
        nickname: updateData.nickname,
        avatar: updateData.avatar,
      });
      if (!updatedUser) {
        return {
          data: null,
          code: 1,
          msg: '用户不存在',
        };
      }
      return {
        data: this.toUserInfo(updatedUser),
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

  @Post('phone/bind')
  @ApiOperation({ summary: '绑定或更换手机号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  async bindPhone(
    @CurrentUser() user,
    @Body()
    body: {
      currentPhoneCode?: string;
      currentEmailCode?: string;
      newPhone: string;
      newPhoneCode: string;
    },
  ) {
    if (!body.newPhone || !/^1[3-9]\d{9}$/.test(body.newPhone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    if (!body.newPhoneCode) {
      throw new BadRequestException('请输入新手机号验证码');
    }

    if (await this.userService.isPhoneTaken(body.newPhone, user.id)) {
      throw new BadRequestException('该手机号已被绑定');
    }

    if (user.phone) {
      if (!body.currentPhoneCode) {
        throw new BadRequestException('请输入当前手机号验证码');
      }
      await this.smsService.verifySms(user.phone, body.currentPhoneCode);
    } else {
      if (!user.email) {
        throw new BadRequestException('当前账户未绑定邮箱，无法完成手机号绑定校验');
      }
      if (!body.currentEmailCode) {
        throw new BadRequestException('请输入当前邮箱验证码');
      }
      await this.emailService.verifyEmail(user.email, body.currentEmailCode);
    }

    await this.smsService.verifySms(body.newPhone, body.newPhoneCode);
    const updatedUser = await this.userService.update(user.id, { phone: body.newPhone });

    return {
      data: this.toUserInfo(updatedUser),
      code: 0,
      msg: user.phone ? '手机号更换成功' : '手机号绑定成功',
    };
  }

  @Post('phone/verify-current')
  @ApiOperation({ summary: '校验当前手机号或邮箱验证码' })
  @ApiResponse({ status: 200, description: '校验成功' })
  async verifyCurrentForPhoneBind(
    @CurrentUser() user,
    @Body() body: { currentPhoneCode?: string; currentEmailCode?: string },
  ) {
    if (user.phone) {
      if (!body.currentPhoneCode) {
        throw new BadRequestException('请输入当前手机号验证码');
      }
      await this.smsService.assertSmsCode(user.phone, body.currentPhoneCode);
    } else {
      if (!user.email) {
        throw new BadRequestException('当前账户未绑定邮箱，无法完成手机号绑定校验');
      }
      if (!body.currentEmailCode) {
        throw new BadRequestException('请输入当前邮箱验证码');
      }
      await this.emailService.assertEmailCode(user.email, body.currentEmailCode);
    }

    return {
      data: { verified: true },
      code: 0,
      msg: '校验成功',
    };
  }

  @Post('email/bind')
  @ApiOperation({ summary: '绑定或更换邮箱' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  async bindEmail(
    @CurrentUser() user,
    @Body()
    body: {
      currentEmailCode?: string;
      currentPhoneCode?: string;
      newEmail: string;
      newEmailCode: string;
    },
  ) {
    if (!body.newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.newEmail)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    if (!body.newEmailCode) {
      throw new BadRequestException('请输入新邮箱验证码');
    }

    if (await this.userService.isEmailTaken(body.newEmail, user.id)) {
      throw new BadRequestException('该邮箱已被绑定');
    }

    if (user.email) {
      if (!body.currentEmailCode) {
        throw new BadRequestException('请输入当前邮箱验证码');
      }
      await this.emailService.verifyEmail(user.email, body.currentEmailCode);
    } else {
      if (!user.phone) {
        throw new BadRequestException('当前账户未绑定手机号，无法完成邮箱绑定校验');
      }
      if (!body.currentPhoneCode) {
        throw new BadRequestException('请输入当前手机号验证码');
      }
      await this.smsService.verifySms(user.phone, body.currentPhoneCode);
    }

    await this.emailService.verifyEmail(body.newEmail, body.newEmailCode);
    const updatedUser = await this.userService.update(user.id, { email: body.newEmail });

    return {
      data: this.toUserInfo(updatedUser),
      code: 0,
      msg: user.email ? '邮箱更换成功' : '邮箱绑定成功',
    };
  }

  @Post('email/verify-current')
  @ApiOperation({ summary: '校验当前邮箱或手机号验证码' })
  @ApiResponse({ status: 200, description: '校验成功' })
  async verifyCurrentForEmailBind(
    @CurrentUser() user,
    @Body() body: { currentEmailCode?: string; currentPhoneCode?: string },
  ) {
    if (user.email) {
      if (!body.currentEmailCode) {
        throw new BadRequestException('请输入当前邮箱验证码');
      }
      await this.emailService.assertEmailCode(user.email, body.currentEmailCode);
    } else {
      if (!user.phone) {
        throw new BadRequestException('当前账户未绑定手机号，无法完成邮箱绑定校验');
      }
      if (!body.currentPhoneCode) {
        throw new BadRequestException('请输入当前手机号验证码');
      }
      await this.smsService.assertSmsCode(user.phone, body.currentPhoneCode);
    }

    return {
      data: { verified: true },
      code: 0,
      msg: '校验成功',
    };
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
      data: this.toUserInfo(updatedUser),
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
      data: this.toUserInfo(updatedUser),
      code: 0,
      msg: '密码修改成功',
    };
  }
}

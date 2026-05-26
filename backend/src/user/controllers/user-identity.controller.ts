import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserIdentityService } from '../services/user-identity.service';

@Controller('user/identity')
@UseGuards(JwtAuthGuard)
export class UserIdentityController {
  constructor(private readonly identityService: UserIdentityService) {}

  @Post()
  async create(
    @CurrentUser() user,
    @Body()
    body: {
      name: string;
      idNumber: string;
      idFrontImage: string;
      idBackImage: string;
      selfieImage: string;
    },
  ) {
    if (!body.name?.trim() || !body.idNumber?.trim()) {
      throw new BadRequestException('请填写完整身份信息');
    }

    if (!body.idFrontImage || !body.idBackImage || !body.selfieImage) {
      throw new BadRequestException('请上传完整证件照片');
    }

    const record = await this.identityService.create({
      userId: user.id,
      name: body.name.trim(),
      idNumber: body.idNumber.trim(),
      idFrontImage: body.idFrontImage,
      idBackImage: body.idBackImage,
      selfieImage: body.selfieImage,
    });

    return {
      data: record,
      code: 0,
      msg: '提交成功',
    };
  }

  @Get('list')
  async list(@CurrentUser() user) {
    const records = await this.identityService.findByUserId(user.id);
    return {
      data: records,
      code: 0,
      msg: '请求成功',
    };
  }
}

@Controller('admin/user-identities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUserIdentityController {
  constructor(private readonly identityService: UserIdentityService) {}

  @Get()
  async list(
    @Query('status') status?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const records = await this.identityService.findAll(status, page, limit);
    return {
      data: records,
      code: 0,
      msg: '请求成功',
    };
  }
}

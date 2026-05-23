import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../../user/entities/user-account.entity';

export class UpdateRewardSettingDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '奖励金额必须为数字' })
  @Min(0)
  rewardAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  isActive?: number;
}

export class ClaimRewardDto {
  @IsEnum(AccountType, { message: '账户类型不正确' })
  accountType: AccountType;
}

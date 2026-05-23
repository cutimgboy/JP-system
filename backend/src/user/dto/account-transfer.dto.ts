import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../entities/user-account.entity';

export class AccountTransferDto {
  @Type(() => Number)
  @IsNumber({}, { message: '金额必须为数字' })
  @Min(0.01, { message: '金额必须大于0' })
  amount: number;

  @IsOptional()
  @IsEnum(AccountType, { message: '账户类型不正确' })
  accountType?: AccountType;
}

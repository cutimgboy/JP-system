import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepositDto {
  @Type(() => Number)
  @IsNumber({}, { message: '金额必须为数字' })
  @Min(0.01, { message: '金额必须大于0' })
  amount: number;

  @IsString()
  @MaxLength(100)
  userBankName: string;

  @IsString()
  @MaxLength(100)
  userAccountName: string;

  @IsString()
  @MaxLength(50)
  userAccountNumber: string;

  @IsString()
  @MaxLength(100)
  systemBankName: string;

  @IsString()
  @MaxLength(100)
  systemAccountName: string;

  @IsString()
  @MaxLength(50)
  systemAccountNumber: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  receiptImages?: string[];
}

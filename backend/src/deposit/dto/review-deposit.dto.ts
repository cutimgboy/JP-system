import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewDepositDto {
  @Type(() => Number)
  @IsIn([1, 2], { message: '审核状态只能是通过或拒绝' })
  status: 1 | 2;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

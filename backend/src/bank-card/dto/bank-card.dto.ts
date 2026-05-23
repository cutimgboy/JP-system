import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBankCardDto {
  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @MaxLength(100)
  accountName: string;

  @IsString()
  @MaxLength(50)
  accountNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  swiftCode?: string;
}

export class UpdateBankCardDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  swiftCode?: string;
}

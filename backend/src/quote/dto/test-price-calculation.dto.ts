import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class TestPriceCalculationDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

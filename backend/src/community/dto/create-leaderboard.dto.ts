import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateLeaderboardDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNumber()
  @Min(0)
  trades: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  winRate: number;

  @IsNumber()
  profit: number;

  @IsNumber()
  @Min(1)
  rank: number;
}

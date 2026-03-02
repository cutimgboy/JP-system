import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  icon: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  actionText: string;

  @IsEnum(['success', 'warning', 'info', 'celebration'])
  type: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

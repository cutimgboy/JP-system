import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SetupPasswordDto {
  @ApiProperty({
    description: '新密码，至少8位，且字母/数字/特殊字符中至少包含2种',
    example: 'Passw0rd!',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @Matches(/^(?=.{8,20}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d])|(?=.*\d)(?=.*[^A-Za-z\d]))\S+$/, {
    message: '密码至少8位，且需包含字母、数字、特殊字符中的至少2种',
  })
  password: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRoleEnum } from './update-role.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'user@vleague.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRoleEnum, example: 'TEAM_MANAGER' })
  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  name?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@vleague.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@12345' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Remember me for 30 days',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

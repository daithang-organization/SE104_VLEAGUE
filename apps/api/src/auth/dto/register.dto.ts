import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng ký' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Mật khẩu (8-72 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)',
  })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự' }) // bcrypt limit
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password: string;
}

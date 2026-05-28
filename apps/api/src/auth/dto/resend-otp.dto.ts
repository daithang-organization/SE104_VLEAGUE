import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email cần gửi lại OTP',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;
}

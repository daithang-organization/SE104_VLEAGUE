import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCoachDto {
  @ApiProperty({ description: 'Họ tên HLV', example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Quốc tịch' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh', example: '1975-03-15' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ description: 'Loại bằng HLV', example: 'AFC Pro' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'ID đội bóng', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

export class UpdateCoachDto {
  @ApiPropertyOptional({ description: 'Họ tên HLV' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Quốc tịch' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ description: 'Loại bằng HLV' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'ID đội bóng', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teamId?: string | null;
}

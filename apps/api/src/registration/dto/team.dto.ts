import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Tên đội bóng',
    example: 'Hoàng Anh Gia Lai',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Tên viết tắt',
    example: 'HAGL',
  })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({
    description: 'Thành phố',
    example: 'Pleiku',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'ID sân nhà',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  stadiumId?: string;

  @ApiPropertyOptional({
    description: 'URL logo đội',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Tên huấn luyện viên trưởng',
    example: 'L. Enrique',
  })
  @IsOptional()
  @IsString()
  coachName?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái đội bóng',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({
    description: 'Tên đội bóng',
    example: 'Hoàng Anh Gia Lai FC',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tên viết tắt',
    example: 'HAGL',
  })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({
    description: 'Thành phố',
    example: 'Pleiku',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'ID sân nhà',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  stadiumId?: string;

  @ApiPropertyOptional({
    description: 'URL logo đội',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Tên huấn luyện viên trưởng',
    example: 'L. Enrique',
  })
  @IsOptional()
  @IsString()
  coachName?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái đội bóng',
    enum: TeamStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}

export class TeamResponseDto {
  @ApiProperty({ description: 'ID đội bóng', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Tên đội bóng', example: 'Hoàng Anh Gia Lai' })
  name: string;

  @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'HAGL' })
  shortName?: string;

  @ApiPropertyOptional({ description: 'Thành phố', example: 'Pleiku' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Tên huấn luyện viên trưởng',
    example: 'L. Enrique',
  })
  coachName?: string;

  @ApiProperty({ description: 'Trạng thái', enum: TeamStatus })
  status: TeamStatus;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum PlayerPosition {
  GK = 'GK', // Goalkeeper
  DF = 'DF', // Defender
  MF = 'MF', // Midfielder
  FW = 'FW', // Forward
}

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Họ và tên cầu thủ',
    example: 'Nguyễn Quang Hải',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Ngày sinh (ISO 8601)',
    example: '1997-04-12',
  })
  @IsDateString()
  dob: string;

  @ApiProperty({
    description: 'Quốc tịch',
    example: 'Vietnam',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    description: 'Vị trí thi đấu',
    enum: PlayerPosition,
    example: 'MF',
  })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiPropertyOptional({
    description: 'ID đội bóng (nếu có)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

export class UpdatePlayerDto {
  @ApiPropertyOptional({
    description: 'Họ và tên cầu thủ',
    example: 'Nguyễn Quang Hải',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh (ISO 8601)',
    example: '1997-04-12',
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({
    description: 'Quốc tịch',
    example: 'Vietnam',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Vị trí thi đấu',
    enum: PlayerPosition,
    example: 'MF',
  })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @ApiPropertyOptional({
    description: 'ID đội bóng',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

export class PlayerResponseDto {
  @ApiProperty({ description: 'ID cầu thủ', format: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Họ và tên',
    example: 'Nguyễn Quang Hải',
  })
  fullName: string;

  @ApiProperty({ description: 'Ngày sinh' })
  dob: Date;

  @ApiProperty({ description: 'Quốc tịch', example: 'Vietnam' })
  nationality: string;

  @ApiProperty({ description: 'Vị trí', enum: PlayerPosition })
  position: PlayerPosition;

  @ApiPropertyOptional({ description: 'ID đội bóng', format: 'uuid' })
  teamId?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;
}

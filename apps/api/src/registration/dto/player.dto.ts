import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export enum PlayerPosition {
  GK = 'GK', // Goalkeeper
  DF = 'DF', // Defender
  MF = 'MF', // Midfielder
  FW = 'FW', // Forward
}

export enum PlayerType {
  DOMESTIC = 'DOMESTIC',
  FOREIGN = 'FOREIGN',
}

export enum PlayerSortBy {
  FULL_NAME = 'fullName',
  DOB = 'dob',
  HEIGHT_CM = 'heightCm',
  WEIGHT_KG = 'weightKg',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Họ và tên cầu thủ',
    example: 'Nguyễn Quang Hải',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Ngày sinh (ISO 8601)',
    example: '1997-04-12',
  })
  @IsDateString()
  dob!: string;

  @ApiProperty({
    description: 'Quốc tịch',
    example: 'Vietnam',
  })
  @IsString()
  @IsNotEmpty()
  nationality!: string;

  @ApiProperty({
    description: 'Vị trí thi đấu',
    enum: PlayerPosition,
    example: 'MF',
  })
  @IsEnum(PlayerPosition)
  position!: PlayerPosition;

  @ApiPropertyOptional({
    description: 'Loại cầu thủ',
    enum: PlayerType,
    default: PlayerType.DOMESTIC,
    example: 'DOMESTIC',
  })
  @IsOptional()
  @IsEnum(PlayerType)
  playerType?: PlayerType;

  @ApiPropertyOptional({
    description: 'Nơi sinh',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({
    description: 'Chiều cao (cm)',
    example: 168,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({
    description: 'Cân nặng (kg)',
    example: 65,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(200)
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'ID đội bóng (nếu có)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'ID mùa giải (dùng để áp dụng quy định tuổi theo mùa)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  seasonId?: string;
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
    description: 'Loại cầu thủ',
    enum: PlayerType,
    example: 'DOMESTIC',
  })
  @IsOptional()
  @IsEnum(PlayerType)
  playerType?: PlayerType;

  @ApiPropertyOptional({
    description: 'Nơi sinh',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({
    description: 'Chiều cao (cm)',
    example: 168,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({
    description: 'Cân nặng (kg)',
    example: 65,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(200)
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'ID đội bóng',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

export class ListPlayersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo vị trí', enum: PlayerPosition })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @ApiPropertyOptional({ description: 'Lọc theo quốc tịch' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Lọc theo đội bóng', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo loại cầu thủ',
    enum: PlayerType,
  })
  @IsOptional()
  @IsEnum(PlayerType)
  playerType?: PlayerType;

  @ApiPropertyOptional({ description: 'Tuổi tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({ description: 'Tuổi tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAge?: number;

  @ApiPropertyOptional({
    description: 'Player sort field',
    enum: PlayerSortBy,
    default: PlayerSortBy.FULL_NAME,
  })
  @IsOptional()
  @IsIn(Object.values(PlayerSortBy))
  sortBy?: PlayerSortBy;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsIn(Object.values(SortOrder))
  sortOrder?: SortOrder;
}

export class PlayerResponseDto {
  @ApiProperty({ description: 'ID cầu thủ', format: 'uuid' })
  id!: string;

  @ApiProperty({
    description: 'Họ và tên',
    example: 'Nguyễn Quang Hải',
  })
  fullName!: string;

  @ApiProperty({ description: 'Ngày sinh' })
  dob!: Date;

  @ApiProperty({ description: 'Quốc tịch', example: 'Vietnam' })
  nationality!: string;

  @ApiProperty({ description: 'Vị trí', enum: PlayerPosition })
  position!: PlayerPosition;

  @ApiProperty({ description: 'Loại cầu thủ', enum: PlayerType })
  playerType!: PlayerType;

  @ApiPropertyOptional({ description: 'Nơi sinh' })
  birthPlace?: string;

  @ApiPropertyOptional({ description: 'Chiều cao (cm)' })
  heightCm?: number;

  @ApiPropertyOptional({ description: 'Cân nặng (kg)' })
  weightKg?: number;

  @ApiPropertyOptional({ description: 'ID đội bóng', format: 'uuid' })
  teamId?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt!: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSeasonDto {
  @ApiProperty({
    description: 'Tên mùa giải',
    example: 'VLeague 2025',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Năm của mùa giải',
    example: 2025,
    minimum: 2020,
  })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiPropertyOptional({
    description: 'Trạng thái mùa giải',
    enum: SeasonStatus,
    default: 'UPCOMING',
  })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu',
    example: '2025-01-15T00:00:00Z',
  })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc',
    example: '2025-12-15T00:00:00Z',
  })
  @IsOptional()
  endDate?: Date;
}

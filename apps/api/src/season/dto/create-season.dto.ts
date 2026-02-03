import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Define locally to avoid Prisma type issues
export type SeasonStatus =
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

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
    enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING',
  })
  @IsOptional()
  @IsEnum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
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

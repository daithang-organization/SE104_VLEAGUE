import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AddPlayerToRosterDto {
  @ApiProperty({
    description: 'ID cầu thủ',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  playerId!: string;

  @ApiPropertyOptional({
    description: 'Số áo cầu thủ',
    example: 10,
    minimum: 1,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  jerseyNumber?: number;

  @ApiPropertyOptional({
    description: 'ID mùa giải (dùng để áp dụng quy định roster theo mùa)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  seasonId?: string;
}

export class UpdateRosterPlayerDto {
  @ApiPropertyOptional({
    description: 'Số áo cầu thủ',
    example: 10,
    minimum: 1,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  jerseyNumber?: number;

  @ApiPropertyOptional({
    description: 'Ngày rời khỏi đội',
    example: '2025-06-30T00:00:00Z',
  })
  @IsOptional()
  leftAt?: Date;
}

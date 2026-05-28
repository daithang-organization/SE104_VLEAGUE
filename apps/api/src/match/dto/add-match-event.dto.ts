import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

// Define locally to avoid Prisma type issues
export type EventType =
  | 'GOAL'
  | 'OWN_GOAL'
  | 'PENALTY'
  | 'PENALTY_MISS'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION';

export class AddMatchEventDto {
  @ApiProperty({
    description: 'Phút xảy ra sự kiện (0-120+)',
    example: 45,
    minimum: 0,
    maximum: 150,
  })
  @IsInt()
  @Min(0)
  @Max(150)
  minute!: number;

  @ApiProperty({
    description: 'Loại sự kiện',
    enum: [
      'GOAL',
      'OWN_GOAL',
      'PENALTY',
      'PENALTY_MISS',
      'YELLOW_CARD',
      'RED_CARD',
      'SUBSTITUTION',
    ],
    example: 'GOAL',
  })
  @IsEnum([
    'GOAL',
    'OWN_GOAL',
    'PENALTY',
    'PENALTY_MISS',
    'YELLOW_CARD',
    'RED_CARD',
    'SUBSTITUTION',
  ])
  @IsNotEmpty()
  type!: EventType;

  @ApiPropertyOptional({
    description: 'ID cầu thủ liên quan',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  playerId?: string;

  @ApiProperty({
    description: 'ID đội bóng liên quan',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  teamId!: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm',
    example: 'Sút phạt đền',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Loại bàn thắng',
    enum: ['NORMAL', 'HEADER', 'FREE_KICK', 'PENALTY_KICK', 'LONG_RANGE'],
    example: 'NORMAL',
  })
  @IsOptional()
  @IsString()
  goalType?: string;

  @ApiPropertyOptional({
    description: 'ID cầu thủ liên quan (kiến tạo / bị thay thế)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  relatedPlayerId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type MatchStatus = 'DRAFT' | 'PUBLISHED' | 'LOCKED';

export class MatchEventResponseDto {
  @ApiProperty({ description: 'ID sự kiện', example: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Phút xảy ra sự kiện', example: 45 })
  minute!: number;

  @ApiProperty({
    description:
      'Loại sự kiện (GOAL, OWN_GOAL, PENALTY, YELLOW_CARD, RED_CARD)',
    example: 'GOAL',
  })
  type!: string;

  @ApiPropertyOptional({ description: 'ID cầu thủ' })
  playerId?: string;

  @ApiPropertyOptional({ description: 'ID đội bóng' })
  teamId?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  note?: string;
}

export class MatchResponseDto {
  @ApiProperty({ description: 'ID trận đấu' })
  id!: string;

  @ApiPropertyOptional({ description: 'Vòng đấu', example: 1 })
  roundNo!: number | null;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu',
    example: '2026-03-15T19:00:00Z',
  })
  kickoffAt!: string | null;

  @ApiProperty({
    description: 'Trạng thái trận đấu',
    enum: ['DRAFT', 'PUBLISHED', 'LOCKED'],
    example: 'DRAFT',
  })
  status!: MatchStatus;

  @ApiPropertyOptional({ description: 'ID đội nhà' })
  homeTeamId!: string | null;

  @ApiPropertyOptional({ description: 'ID đội khách' })
  awayTeamId!: string | null;

  @ApiPropertyOptional({ description: 'Tỉ số đội nhà', example: 2 })
  homeScore!: number | null;

  @ApiPropertyOptional({ description: 'Tỉ số đội khách', example: 1 })
  awayScore!: number | null;

  @ApiProperty({
    description: 'Danh sách sự kiện',
    type: [MatchEventResponseDto],
  })
  events!: MatchEventResponseDto[];
}

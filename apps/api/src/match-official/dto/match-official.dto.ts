import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const MATCH_OFFICIAL_ROLES = [
  'MAIN_REFEREE',
  'ASSISTANT_REFEREE',
  'FOURTH_OFFICIAL',
  'SUPERVISOR',
] as const;

const EVENT_TYPES = [
  'GOAL',
  'OWN_GOAL',
  'PENALTY',
  'PENALTY_MISS',
  'YELLOW_CARD',
  'RED_CARD',
  'SUBSTITUTION',
] as const;

export type MatchOfficialRoleDto = (typeof MATCH_OFFICIAL_ROLES)[number];
export type MatchReportEventTypeDto = (typeof EVENT_TYPES)[number];

export class CreateOfficialDto {
  @ApiProperty({ description: 'Họ tên trọng tài/giám sát viên' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({ description: 'Email liên hệ' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class AssignOfficialDto {
  @ApiProperty({ description: 'ID trọng tài/giám sát viên' })
  @IsUUID()
  officialId!: string;

  @ApiProperty({ enum: MATCH_OFFICIAL_ROLES })
  @IsIn(MATCH_OFFICIAL_ROLES)
  role!: MatchOfficialRoleDto;

  @ApiPropertyOptional({ description: 'Ghi chú phân công' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class MatchReportEventDto {
  @ApiProperty({ minimum: 0, maximum: 150 })
  @IsInt()
  @Min(0)
  @Max(150)
  minute!: number;

  @ApiProperty({ enum: EVENT_TYPES })
  @IsIn(EVENT_TYPES)
  type!: MatchReportEventTypeDto;

  @ApiProperty({ description: 'ID đội liên quan' })
  @IsUUID()
  teamId!: string;

  @ApiPropertyOptional({ description: 'ID cầu thủ liên quan' })
  @IsOptional()
  @IsUUID()
  playerId?: string;

  @ApiPropertyOptional({ description: 'ID cầu thủ liên quan khác' })
  @IsOptional()
  @IsUUID()
  relatedPlayerId?: string;

  @ApiPropertyOptional({ description: 'Loại bàn thắng' })
  @IsOptional()
  @IsString()
  goalType?: string;

  @ApiPropertyOptional({ description: 'Ghi chú sự kiện' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class SubmitMatchReportDto {
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  homeScore!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  awayScore!: number;

  @ApiPropertyOptional({ description: 'Cầu thủ xuất sắc nhất trận' })
  @IsOptional()
  @IsUUID()
  bestPlayerId?: string;

  @ApiPropertyOptional({ description: 'Thông số chuyên môn dạng JSON' })
  @IsOptional()
  @IsObject()
  technicalStats?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Ghi chú của trọng tài bàn' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ type: [MatchReportEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchReportEventDto)
  events?: MatchReportEventDto[];
}

export class SubmitDisciplineReportDto {
  @ApiProperty({ description: 'ID giám sát viên' })
  @IsUUID()
  supervisorId!: string;

  @ApiProperty({ description: 'Đánh giá công tác tổ chức' })
  @IsString()
  @IsNotEmpty()
  organizationRating!: string;

  @ApiPropertyOptional({ description: 'Sai sót từ trọng tài nếu có' })
  @IsOptional()
  @IsString()
  refereeIssues?: string;

  @ApiPropertyOptional({ description: 'Sai sót từ cầu thủ nếu có' })
  @IsOptional()
  @IsString()
  playerIssues?: string;

  @ApiPropertyOptional({ description: 'Sai sót từ BTC sân nếu có' })
  @IsOptional()
  @IsString()
  organizerIssues?: string;

  @ApiPropertyOptional({ description: 'Ghi chú tổng hợp' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu chuyển báo cáo sang BTC kỷ luật',
  })
  @IsOptional()
  @IsBoolean()
  sendToDisciplinary?: boolean;
}

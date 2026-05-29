import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  PromotionCandidateStatus,
  PromotionQualificationType,
  TeamInvitationSourceType,
  TeamInvitationStatus,
} from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SendTeamInvitationDto {
  @ApiProperty({ description: 'ID CLB được mời' })
  @IsUUID()
  teamId!: string;

  @ApiProperty({
    enum: TeamInvitationSourceType,
    description: 'Nguồn mời: top 8 mùa trước, thăng hạng, hoặc thay thế',
  })
  @IsEnum(TeamInvitationSourceType)
  sourceType!: TeamInvitationSourceType;

  @ApiPropertyOptional({
    description:
      'Ghi chú thăng hạng (VD: "Vô địch V.League 2 2024"). Chỉ dùng khi sourceType = PROMOTED.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotionNote?: string;
}

export class RespondTeamInvitationDto {
  @ApiProperty({
    enum: [TeamInvitationStatus.ACCEPTED, TeamInvitationStatus.DECLINED],
    description: 'Phản hồi của manager CLB',
  })
  @IsIn([TeamInvitationStatus.ACCEPTED, TeamInvitationStatus.DECLINED])
  responseStatus!: 'ACCEPTED' | 'DECLINED';

  @ApiPropertyOptional({ description: 'Lý do từ chối hoặc ghi chú phản hồi' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  responseReason?: string;
}

export class UpsertPromotionCandidateDto {
  @ApiProperty({ description: 'ID CLB được xác nhận thăng hạng/dự phòng' })
  @IsUUID()
  teamId!: string;

  @ApiProperty({ description: 'Thứ hạng tại nguồn thăng hạng, 1 là cao nhất' })
  @IsInt()
  @Min(1)
  rank!: number;

  @ApiProperty({
    description: 'Tên giải nguồn, ví dụ "V.League 2 2025"',
  })
  @IsString()
  @MaxLength(120)
  sourceCompetition!: string;

  @ApiPropertyOptional({
    enum: PromotionQualificationType,
    description: 'Cách CLB giành suất thăng hạng',
  })
  @IsOptional()
  @IsEnum(PromotionQualificationType)
  qualificationType?: PromotionQualificationType;

  @ApiPropertyOptional({
    enum: PromotionCandidateStatus,
    description: 'Trạng thái ứng viên thăng hạng trong mùa đích',
  })
  @IsOptional()
  @IsEnum(PromotionCandidateStatus)
  status?: PromotionCandidateStatus;

  @ApiPropertyOptional({ description: 'Ghi chú nguồn thăng hạng' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ImportPromotionCandidateRowDto {
  @ApiProperty({ description: 'Thứ hạng tại nguồn thăng hạng, 1 là cao nhất' })
  @IsInt()
  @Min(1)
  rank!: number;

  @ApiPropertyOptional({ description: 'ID CLB, ưu tiên dùng khi có sẵn' })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Tên hoặc shortName CLB để hệ thống tự dò trong danh mục CLB',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  teamName?: string;

  @ApiPropertyOptional({
    description:
      'Tên giải nguồn, ví dụ "V.League 2 2025". Nếu bỏ trống sẽ dùng sourceCompetition cấp import.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceCompetition?: string;

  @ApiPropertyOptional({
    enum: PromotionQualificationType,
    description: 'Cách CLB giành suất thăng hạng',
  })
  @IsOptional()
  @IsEnum(PromotionQualificationType)
  qualificationType?: PromotionQualificationType;

  @ApiPropertyOptional({
    enum: PromotionCandidateStatus,
    description: 'Trạng thái ứng viên thăng hạng trong mùa đích',
  })
  @IsOptional()
  @IsEnum(PromotionCandidateStatus)
  status?: PromotionCandidateStatus;

  @ApiPropertyOptional({ description: 'Ghi chú nguồn thăng hạng' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ImportPromotionCandidatesDto {
  @ApiPropertyOptional({
    description: 'Tên giải nguồn mặc định cho các dòng import',
    example: 'V.League 2 2025',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceCompetition?: string;

  @ApiPropertyOptional({
    description:
      'Xóa snapshot thăng hạng hiện tại của mùa này trước khi import',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;

  @ApiProperty({ type: [ImportPromotionCandidateRowDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportPromotionCandidateRowDto)
  rows!: ImportPromotionCandidateRowDto[];
}

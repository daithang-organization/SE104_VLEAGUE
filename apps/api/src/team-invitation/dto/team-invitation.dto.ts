import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PromotionCandidateStatus,
  PromotionQualificationType,
  TeamInvitationSourceType,
  TeamInvitationStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
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

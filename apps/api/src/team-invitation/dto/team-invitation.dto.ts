import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamInvitationSourceType, TeamInvitationStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTeamManagerAssignmentDto {
  @IsUUID()
  seasonId!: string;

  @IsUUID()
  teamId!: string;
}

export class UpdateManagedTeamDto {
  @ApiPropertyOptional({ description: 'Tên huấn luyện viên trưởng' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  coachName?: string;
}

export class SubmitTeamApplicationDto {
  @ApiProperty({ description: 'ID mùa giải' })
  @IsUUID()
  seasonId!: string;

  @ApiProperty({ description: 'Cơ quan/công ty chủ quản CLB' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ownerName!: string;

  @ApiProperty({ description: 'Quốc gia đặt trụ sở cơ quan chủ quản' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ownerCountry!: string;

  @ApiPropertyOptional({ description: 'Địa chỉ cơ quan chủ quản' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ownerAddress?: string;

  @ApiProperty({ description: 'Thông tin tự giới thiệu đội bóng' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  teamIntroduction!: string;

  @ApiProperty({ description: 'Mô tả áo đấu chính thức' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  primaryKit!: string;

  @ApiProperty({ description: 'Mô tả áo đấu dự bị' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  backupKit!: string;

  @ApiProperty({ description: 'Đã nộp lệ phí tham dự' })
  @IsBoolean()
  participationFeePaid!: boolean;

  @ApiPropertyOptional({ description: 'Mã biên lai hoặc ghi chú thanh toán' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  feeReceiptCode?: string;

  @ApiPropertyOptional({ description: 'URL chứng từ nộp lệ phí tham dự' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feeReceiptUrl?: string;

  @ApiProperty({ description: 'Lịch giải khác đã/đang tham gia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  externalCompetitionSchedule!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ManagerPlayerRequestType,
  ManagerRequestStatus,
  ManagerStadiumRequestType,
  PlayerPosition,
  PlayerType,
  TeamManagerRequestStatus,
  TeamManagerRequestType,
} from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeamManagerAssignmentDto {
  @IsUUID()
  seasonId!: string;

  @IsUUID()
  teamId!: string;
}

export class CreateTeamManagerRequestDto {
  @ApiProperty({
    enum: TeamManagerRequestType,
    example: TeamManagerRequestType.CLAIM_EXISTING_TEAM,
  })
  @IsEnum(TeamManagerRequestType)
  requestType!: TeamManagerRequestType;

  @ApiPropertyOptional({
    description: 'CLB có sẵn muốn nhận quản lý',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({ description: 'Tên CLB đề xuất tạo mới' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  proposedTeamName?: string;

  @ApiPropertyOptional({ description: 'Tên viết tắt CLB đề xuất' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  proposedTeamShortName?: string;

  @ApiPropertyOptional({ description: 'Thành phố của CLB đề xuất' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  proposedTeamCity?: string;

  @ApiPropertyOptional({ description: 'Logo URL của CLB đề xuất' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  proposedTeamLogoUrl?: string;

  @ApiPropertyOptional({
    description: 'Sân nhà của CLB đề xuất',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  proposedStadiumId?: string;

  @ApiPropertyOptional({ description: 'Ghi chú Manager gửi Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestNote?: string;
}

export class ReviewTeamManagerRequestDto {
  @ApiProperty({
    enum: [
      TeamManagerRequestStatus.APPROVED,
      TeamManagerRequestStatus.REJECTED,
    ],
    example: TeamManagerRequestStatus.APPROVED,
  })
  @IsIn([TeamManagerRequestStatus.APPROVED, TeamManagerRequestStatus.REJECTED])
  status!: TeamManagerRequestStatus;

  @ApiPropertyOptional({ description: 'Ghi chú xét duyệt của Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}

export class CreateManagerPlayerRequestDto {
  @ApiProperty({
    enum: ManagerPlayerRequestType,
    example: ManagerPlayerRequestType.ADD_PLAYER,
  })
  @IsEnum(ManagerPlayerRequestType)
  requestType!: ManagerPlayerRequestType;

  @ApiPropertyOptional({
    description: 'ID cầu thủ cần sửa/gỡ khỏi CLB',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  playerId?: string;

  @ApiPropertyOptional({ description: 'Họ và tên cầu thủ' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh ISO 8601' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ description: 'Quốc tịch' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ enum: PlayerPosition })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @ApiPropertyOptional({ enum: PlayerType })
  @IsOptional()
  @IsEnum(PlayerType)
  playerType?: PlayerType;

  @ApiPropertyOptional({ description: 'Nơi sinh' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  birthPlace?: string;

  @ApiPropertyOptional({ description: 'Chiều cao (cm)' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ description: 'Cân nặng (kg)' })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(200)
  weightKg?: number;

  @ApiPropertyOptional({ description: 'Tóm tắt tiểu sử chơi bóng' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  careerSummary?: string;

  @ApiPropertyOptional({ description: 'Ghi chú Manager gửi Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestNote?: string;
}

export class CreateManagerStadiumRequestDto {
  @ApiProperty({
    enum: ManagerStadiumRequestType,
    example: ManagerStadiumRequestType.CREATE_HOME_STADIUM,
  })
  @IsEnum(ManagerStadiumRequestType)
  requestType!: ManagerStadiumRequestType;

  @ApiPropertyOptional({ description: 'ID sân nhà hiện tại', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  stadiumId?: string;

  @ApiPropertyOptional({ description: 'Tên sân vận động' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Thành phố' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @ApiPropertyOptional({ description: 'Quốc gia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Sức chứa' })
  @IsOptional()
  @IsInt()
  @Min(10000)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Số sao FIFA' })
  @IsOptional()
  @IsInt()
  @Min(2)
  fifaStars?: number;

  @ApiPropertyOptional({ description: 'Ghi chú Manager gửi Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestNote?: string;
}

export class ReviewManagerChangeRequestDto {
  @ApiProperty({
    enum: [ManagerRequestStatus.APPROVED, ManagerRequestStatus.REJECTED],
    example: ManagerRequestStatus.APPROVED,
  })
  @IsIn([ManagerRequestStatus.APPROVED, ManagerRequestStatus.REJECTED])
  status!: ManagerRequestStatus;

  @ApiPropertyOptional({ description: 'Ghi chú xét duyệt của Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
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

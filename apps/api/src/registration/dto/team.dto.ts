import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Tên đội bóng',
    example: 'Hoàng Anh Gia Lai',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Trạng thái đội bóng',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({
    description: 'Tên đội bóng',
    example: 'Hoàng Anh Gia Lai FC',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái đội bóng',
    enum: TeamStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}

export class TeamResponseDto {
  @ApiProperty({ description: 'ID đội bóng', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Tên đội bóng', example: 'Hoàng Anh Gia Lai' })
  name: string;

  @ApiProperty({ description: 'Trạng thái', enum: TeamStatus })
  status: TeamStatus;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;
}

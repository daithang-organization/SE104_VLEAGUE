import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MatchLineupPlayerDto {
  @ApiProperty({ description: 'ID cầu thủ' })
  @IsUUID()
  playerId!: string;

  @ApiProperty({ enum: ['STARTER', 'SUBSTITUTE'] })
  @IsIn(['STARTER', 'SUBSTITUTE'])
  role!: 'STARTER' | 'SUBSTITUTE';

  @ApiPropertyOptional({ enum: ['GK', 'DF', 'MF', 'FW'] })
  @IsOptional()
  @IsIn(['GK', 'DF', 'MF', 'FW'])
  position?: 'GK' | 'DF' | 'MF' | 'FW';

  @ApiPropertyOptional({ minimum: 1, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber?: number;
}

export class SubmitMatchLineupDto {
  @ApiProperty({ description: 'ID đội đăng ký đội hình' })
  @IsUUID()
  teamId!: string;

  @ApiProperty({ enum: ['PRIMARY', 'BACKUP'] })
  @IsIn(['PRIMARY', 'BACKUP'])
  kitType!: 'PRIMARY' | 'BACKUP';

  @ApiProperty({ example: '4-4-2' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d-\d-\d(?:-\d)?$/, {
    message: 'Sơ đồ thi đấu phải có định dạng như 4-4-2 hoặc 4-2-3-1',
  })
  formation!: string;

  @ApiProperty({ type: [MatchLineupPlayerDto], minItems: 16, maxItems: 16 })
  @IsArray()
  @ArrayMinSize(16)
  @ArrayMaxSize(16)
  @ValidateNested({ each: true })
  @Type(() => MatchLineupPlayerDto)
  players!: MatchLineupPlayerDto[];
}

export class ReviewMatchLineupDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Ghi chú xét duyệt' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

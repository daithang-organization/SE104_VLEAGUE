import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class LineupPlayerDto {
  @ApiProperty({ description: 'ID cầu thủ', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({
    description: 'Vai trò',
    enum: ['STARTING', 'SUBSTITUTE'],
    default: 'STARTING',
  })
  @IsEnum(['STARTING', 'SUBSTITUTE'])
  role: 'STARTING' | 'SUBSTITUTE';

  @ApiPropertyOptional({ description: 'Vị trí trên sân', example: 'GK' })
  @IsOptional()
  @IsString()
  position?: string;
}

export class SetLineupDto {
  @ApiProperty({ description: 'ID đội bóng', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ description: 'Danh sách cầu thủ', type: [LineupPlayerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => LineupPlayerDto)
  players: LineupPlayerDto[];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class FindAllMatchesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID mùa giải', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  seasonId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo vòng đấu' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID đội bóng', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Từ ngày (ISO date)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (ISO date)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên đội' })
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateStadiumDto {
  @ApiPropertyOptional({
    description: 'Tên sân vận động',
    example: 'Sân Mỹ Đình',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Thành phố',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Sức chứa',
    example: 40000,
    minimum: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  capacity?: number;
}

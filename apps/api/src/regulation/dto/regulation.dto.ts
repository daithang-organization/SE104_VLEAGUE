import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRegulationDto {
  @ApiProperty({ description: 'Khóa quy định', example: 'MAX_FOREIGN_PLAYERS' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Giá trị quy định', example: '3' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({
    description: 'Kiểu dữ liệu (number, string, boolean)',
    example: 'number',
    default: 'string',
  })
  @IsOptional()
  @IsString()
  valueType?: string;
}

export class UpdateRegulationDto {
  @ApiProperty({ description: 'Giá trị quy định', example: '3' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({
    description: 'Kiểu dữ liệu',
    example: 'number',
  })
  @IsOptional()
  @IsString()
  valueType?: string;
}

export class RegulationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  seasonId!: string;

  @ApiProperty({ example: 'MAX_FOREIGN_PLAYERS' })
  key!: string;

  @ApiProperty({ example: '3' })
  value!: string;

  @ApiProperty({ example: 'number' })
  valueType!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

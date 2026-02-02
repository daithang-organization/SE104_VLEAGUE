import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateStadiumDto {
  @ApiProperty({
    description: 'Tên sân vận động',
    example: 'Sân Mỹ Đình',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Thành phố',
    example: 'Hà Nội',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

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

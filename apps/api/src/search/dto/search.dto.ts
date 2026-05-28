import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class SearchDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tối thiểu 2 ký tự)',
    minLength: 2,
    example: 'Hà Nội',
  })
  @IsString()
  @MinLength(2, { message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' })
  @Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  q!: string;

  @ApiPropertyOptional({
    description: 'Giới hạn kết quả (1-50, mặc định: 10)',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1)
  @Max(50)
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  limit?: number;
}

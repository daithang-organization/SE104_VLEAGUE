import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateStadiumDto {
  @ApiProperty({
    description: 'Tên sân vận động',
    example: 'Sân Mỹ Đình',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Thành phố',
    example: 'Hà Nội',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ',
    example: 'Đường Lê Đức Thọ, Nam Từ Liêm',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Quốc gia nơi sân vận động đặt trụ sở',
    example: 'Việt Nam',
    default: 'Việt Nam',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Sức chứa',
    example: 40000,
    minimum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(10000)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Số sao tiêu chuẩn FIFA',
    example: 2,
    minimum: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  fifaStars?: number;

  @ApiPropertyOptional({
    description: 'ID đội bóng sử dụng sân này làm sân nhà',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}

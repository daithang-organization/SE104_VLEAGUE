import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
  REFEREE = 'REFEREE',
  SUPERVISOR = 'SUPERVISOR',
  PUBLIC = 'PUBLIC',
}

export class UpdateRoleDto {
  @ApiProperty({ enum: UserRoleEnum, example: 'TEAM_MANAGER' })
  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

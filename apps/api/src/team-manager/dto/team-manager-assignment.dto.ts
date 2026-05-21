import { IsUUID } from 'class-validator';

export class CreateTeamManagerAssignmentDto {
  @IsUUID()
  seasonId!: string;

  @IsUUID()
  teamId!: string;
}

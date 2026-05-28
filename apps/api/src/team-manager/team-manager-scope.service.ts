import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type TeamScopeActor = {
  id: string;
  role: string;
};

@Injectable()
export class TeamManagerScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveManagedTeamId(actor: TeamScopeActor) {
    if (actor.role !== UserRole.TEAM_MANAGER) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: { role: true, managedTeamId: true },
    });

    if (!user || user.role !== UserRole.TEAM_MANAGER || !user.managedTeamId) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    return user.managedTeamId;
  }

  async assertCanManageTeam(actor: TeamScopeActor, teamId: string) {
    const managedTeamId = await this.resolveManagedTeamId(actor);
    if (!managedTeamId) return;

    if (managedTeamId !== teamId) {
      throw new ForbiddenException(
        'Tài khoản này chỉ được thao tác với CLB đã được admin gắn.',
      );
    }
  }
}

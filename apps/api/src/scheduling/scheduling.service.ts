import { Injectable } from '@nestjs/common';
import type { Match } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async getSchedule(): Promise<{ ok: boolean; matches: Match[] }> {
    // Sprint 0: trả danh sách matches (nếu có seed)

    const matches: Match[] = await this.prisma.match.findMany({
      orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
    });

    return { ok: true, matches };
  }

  generateStub() {
    // Sprint 0: stub
    return { ok: true, message: 'schedule generation stub' };
  }

  publishStub() {
    // Sprint 0: stub
    return { ok: true, message: 'schedule publish stub' };
  }
}

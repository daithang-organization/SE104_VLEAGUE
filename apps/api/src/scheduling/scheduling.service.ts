import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async getSchedule() {
    // Sprint 0: trả danh sách matches (nếu có seed)
    const matches = await this.prisma.match.findMany({
      orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
    });

    return { ok: true, matches };
  }

  async generateStub() {
    // Sprint 0: stub
    return { ok: true, message: 'schedule generation stub' };
  }

  async publishStub() {
    // Sprint 0: stub
    return { ok: true, message: 'schedule publish stub' };
  }
}

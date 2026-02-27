import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  type: 'team' | 'player' | 'match' | 'stadium' | 'season' | 'coach';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 10): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];

    // Search teams
    const teams = await this.prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortName: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, city: true },
      take: limit,
    });
    for (const t of teams) {
      results.push({
        type: 'team',
        id: t.id,
        title: t.name,
        subtitle: t.city ?? undefined,
        url: `/teams/${t.id}`,
      });
    }

    // Search players
    const players = await this.prisma.player.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { nationality: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, fullName: true, position: true, nationality: true },
      take: limit,
    });
    for (const p of players) {
      results.push({
        type: 'player',
        id: p.id,
        title: p.fullName,
        subtitle: `${p.position} · ${p.nationality}`,
        url: `/players/${p.id}`,
      });
    }

    // Search stadiums
    const stadiums = await this.prisma.stadium.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, city: true },
      take: limit,
    });
    for (const s of stadiums) {
      results.push({
        type: 'stadium',
        id: s.id,
        title: s.name,
        subtitle: s.city,
        url: `/stadiums/${s.id}`,
      });
    }

    // Search seasons
    const seasons = await this.prisma.season.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { id: true, name: true, year: true, status: true },
      take: limit,
    });
    for (const s of seasons) {
      results.push({
        type: 'season',
        id: s.id,
        title: s.name,
        subtitle: `${s.year} · ${s.status}`,
        url: `/seasons`,
      });
    }

    // Search coaches
    const coaches = await this.prisma.coach.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { nationality: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, fullName: true, nationality: true },
      take: limit,
    });
    for (const c of coaches) {
      results.push({
        type: 'coach',
        id: c.id,
        title: c.fullName,
        subtitle: c.nationality ?? undefined,
        url: `/coaches/${c.id}`,
      });
    }

    return results.slice(0, limit * 2);
  }
}

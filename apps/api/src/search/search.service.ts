import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  type: 'team' | 'player' | 'match' | 'stadium' | 'season';
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

    // Run all searches in parallel for better performance
    const [teams, players, stadiums, seasons, matches] = await Promise.all([
      this.prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { shortName: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, city: true },
        take: limit,
      }),
      this.prisma.player.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { nationality: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, fullName: true, position: true, nationality: true },
        take: limit,
      }),
      this.prisma.stadium.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, city: true },
        take: limit,
      }),
      this.prisma.season.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true, year: true, status: true },
        take: limit,
      }),
      this.prisma.match.findMany({
        where: {
          OR: [
            { homeTeam: { name: { contains: query, mode: 'insensitive' } } },
            { awayTeam: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          roundNo: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          homeScore: true,
          awayScore: true,
          status: true,
        },
        take: limit,
        orderBy: { kickoffAt: 'desc' },
      }),
    ]);

    const results: SearchResult[] = [];

    for (const t of teams) {
      results.push({
        type: 'team',
        id: t.id,
        title: t.name,
        subtitle: t.city ?? undefined,
        url: `/teams/${t.id}`,
      });
    }

    for (const p of players) {
      results.push({
        type: 'player',
        id: p.id,
        title: p.fullName,
        subtitle: `${p.position} · ${p.nationality}`,
        url: `/players/${p.id}`,
      });
    }

    for (const s of stadiums) {
      results.push({
        type: 'stadium',
        id: s.id,
        title: s.name,
        subtitle: s.city,
        url: `/stadiums/${s.id}`,
      });
    }

    for (const s of seasons) {
      results.push({
        type: 'season',
        id: s.id,
        title: s.name,
        subtitle: `${s.year} · ${s.status}`,
        url: `/seasons`,
      });
    }

    for (const m of matches) {
      const score =
        m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : m.status;
      results.push({
        type: 'match',
        id: m.id,
        title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        subtitle: `V${m.roundNo} · ${score}`,
        url: `/matches/${m.id}`,
      });
    }

    return results.slice(0, limit * 2);
  }
}

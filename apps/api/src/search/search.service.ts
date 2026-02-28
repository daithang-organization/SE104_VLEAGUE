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
    const q = query?.trim();
    if (!q || q.length < 2) return [];
    const perEntity = Math.max(3, Math.ceil(limit / 3));

    // Run all searches in parallel for better performance
    const [teams, players, stadiums, seasons, matches] = await Promise.all([
      this.prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortName: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, city: true },
        take: perEntity,
      }),
      this.prisma.player.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { nationality: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, fullName: true, position: true, nationality: true },
        take: perEntity,
      }),
      this.prisma.stadium.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, city: true },
        take: perEntity,
      }),
      this.prisma.season.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, year: true, status: true },
        take: perEntity,
      }),
      this.prisma.match.findMany({
        where: {
          OR: [
            { homeTeam: { name: { contains: q, mode: 'insensitive' } } },
            { awayTeam: { name: { contains: q, mode: 'insensitive' } } },
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
        take: perEntity,
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

    return results.slice(0, limit);
  }
}

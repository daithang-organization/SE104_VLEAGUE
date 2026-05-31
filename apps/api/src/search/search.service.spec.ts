import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: {
            team: { findMany: jest.fn().mockResolvedValue([]) },
            player: { findMany: jest.fn().mockResolvedValue([]) },
            stadium: { findMany: jest.fn().mockResolvedValue([]) },
            season: { findMany: jest.fn().mockResolvedValue([]) },
            match: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should return empty array for empty query', async () => {
      const result = await service.globalSearch('', 10);
      expect(result).toEqual([]);
    });

    it('should return empty array for query shorter than 2 chars', async () => {
      const result = await service.globalSearch('a', 10);
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await service.globalSearch('   ', 10);
      expect(result).toEqual([]);
    });

    it('should search all entities in parallel', async () => {
      jest
        .spyOn(prisma.team, 'findMany')
        .mockResolvedValue([
          { id: 't1', name: 'Hà Nội FC', city: 'Hà Nội' } as any,
        ]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([
        {
          id: 'p1',
          fullName: 'Nguyễn Văn A',
          position: 'FW',
          nationality: 'Việt Nam',
        } as any,
      ]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.globalSearch('Hà Nội', 10);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'team',
        id: 't1',
        title: 'Hà Nội FC',
        subtitle: 'Hà Nội',
        url: '/teams/t1',
      });
      expect(result[1]).toEqual({
        type: 'player',
        id: 'p1',
        title: 'Nguyễn Văn A',
        subtitle: 'FW · Việt Nam',
        url: '/players/p1',
      });
    });

    it('should include stadium results', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.stadium, 'findMany')
        .mockResolvedValue([
          { id: 's1', name: 'Sân Mỹ Đình', city: 'Hà Nội' } as any,
        ]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.globalSearch('Mỹ Đình', 10);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('stadium');
      expect(result[0].url).toBe('/stadiums/s1');
    });

    it('should include season results', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([
        {
          id: 'se1',
          name: 'V-League 2026',
          year: 2026,
          status: 'IN_PROGRESS',
        } as any,
      ]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.globalSearch('V-League', 10);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('season');
      expect(result[0].subtitle).toBe('2026 · IN_PROGRESS');
    });

    it('should include match results with scores', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([
        {
          id: 'm1',
          roundNo: 1,
          homeTeam: { name: 'Hà Nội FC' },
          awayTeam: { name: 'HAGL' },
          homeScore: 2,
          awayScore: 1,
          scoreSource: 'ADMIN',
          status: 'FINISHED',
        } as any,
      ]);

      const result = await service.globalSearch('Hà Nội', 10);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('match');
      expect(result[0].title).toBe('Hà Nội FC vs HAGL');
      expect(result[0].subtitle).toBe('V1 · 2-1');
    });

    it('should not show legacy match scores without a score source', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([
        {
          id: 'm1',
          roundNo: 17,
          homeTeam: { name: 'HÃ  Ná»™i FC' },
          awayTeam: { name: 'Háº£i PhÃ²ng FC' },
          homeScore: 3,
          awayScore: 0,
          scoreSource: null,
          status: 'FINISHED',
        } as any,
      ]);

      const result = await service.globalSearch('HÃ  Ná»™i', 10);

      expect(result[0].subtitle).toContain('FINISHED');
      expect(result[0].subtitle).not.toContain('3-0');
    });

    it('should show status when match has no score', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([
        {
          id: 'm2',
          roundNo: 5,
          homeTeam: { name: 'SLNA' },
          awayTeam: { name: 'Thanh Hóa' },
          homeScore: null,
          awayScore: null,
          status: 'SCHEDULED',
        } as any,
      ]);

      const result = await service.globalSearch('SLNA', 10);

      expect(result[0].subtitle).toBe('V5 · SCHEDULED');
    });

    it('should respect limit parameter', async () => {
      const manyTeams = Array.from({ length: 20 }, (_, i) => ({
        id: `t${i}`,
        name: `Team ${i}`,
        city: 'City',
      }));
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(manyTeams as any);
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.globalSearch('Team', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });
});

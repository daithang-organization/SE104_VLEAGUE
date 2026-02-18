import { Injectable, NotFoundException } from '@nestjs/common';
import { Regulation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegulationDto, UpdateRegulationDto } from './dto/regulation.dto';

/** Default regulations seeded for each new season */
export const DEFAULT_REGULATIONS: {
  key: string;
  value: string;
  valueType: string;
}[] = [
  { key: 'MIN_AGE', value: '16', valueType: 'number' },
  { key: 'MAX_AGE', value: '40', valueType: 'number' },
  { key: 'MIN_ROSTER', value: '15', valueType: 'number' },
  { key: 'MAX_ROSTER', value: '22', valueType: 'number' },
  { key: 'MAX_FOREIGN_PLAYERS', value: '3', valueType: 'number' },
  { key: 'WIN_POINTS', value: '3', valueType: 'number' },
  { key: 'DRAW_POINTS', value: '1', valueType: 'number' },
  { key: 'LOSS_POINTS', value: '0', valueType: 'number' },
  { key: 'MAX_GOAL_TIME', value: '96', valueType: 'number' },
];

@Injectable()
export class RegulationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all regulations for a season
   */
  async findAll(seasonId: string): Promise<Regulation[]> {
    // Verify season exists
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${seasonId} not found`);
    }

    return this.prisma.regulation.findMany({
      where: { seasonId },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Get a single regulation by season + key
   */
  async findByKey(seasonId: string, key: string): Promise<Regulation> {
    const regulation = await this.prisma.regulation.findUnique({
      where: { seasonId_key: { seasonId, key } },
    });

    if (!regulation) {
      throw new NotFoundException(
        `Regulation "${key}" not found for this season`,
      );
    }

    return regulation;
  }

  /**
   * Create or update a regulation (upsert by season + key)
   */
  async upsert(
    seasonId: string,
    dto: CreateRegulationDto,
  ): Promise<Regulation> {
    // Verify season exists
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${seasonId} not found`);
    }

    return this.prisma.regulation.upsert({
      where: { seasonId_key: { seasonId, key: dto.key } },
      create: {
        seasonId,
        key: dto.key,
        value: dto.value,
        valueType: dto.valueType ?? 'string',
      },
      update: {
        value: dto.value,
        valueType: dto.valueType ?? undefined,
      },
    });
  }

  /**
   * Update a single regulation by key
   */
  async update(
    seasonId: string,
    key: string,
    dto: UpdateRegulationDto,
  ): Promise<Regulation> {
    const regulation = await this.prisma.regulation.findUnique({
      where: { seasonId_key: { seasonId, key } },
    });

    if (!regulation) {
      throw new NotFoundException(
        `Regulation "${key}" not found for this season`,
      );
    }

    return this.prisma.regulation.update({
      where: { id: regulation.id },
      data: {
        value: dto.value,
        valueType: dto.valueType ?? undefined,
      },
    });
  }

  /**
   * Delete a regulation by key
   */
  async delete(seasonId: string, key: string): Promise<{ success: boolean }> {
    const regulation = await this.prisma.regulation.findUnique({
      where: { seasonId_key: { seasonId, key } },
    });

    if (!regulation) {
      throw new NotFoundException(
        `Regulation "${key}" not found for this season`,
      );
    }

    await this.prisma.regulation.delete({
      where: { id: regulation.id },
    });

    return { success: true };
  }

  /**
   * Seed default regulations for a season
   */
  async seedDefaults(seasonId: string): Promise<Regulation[]> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${seasonId} not found`);
    }

    const results: Regulation[] = [];
    for (const reg of DEFAULT_REGULATIONS) {
      const result = await this.prisma.regulation.upsert({
        where: { seasonId_key: { seasonId, key: reg.key } },
        create: { seasonId, ...reg },
        update: {},
      });
      results.push(result);
    }

    return results;
  }
}

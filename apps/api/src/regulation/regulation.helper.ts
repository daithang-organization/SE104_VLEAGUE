import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_REGULATIONS } from './regulation.service';

/**
 * Lightweight helper to query regulation values for a season.
 * Returns parsed numeric values with fallback defaults.
 */
@Injectable()
export class RegulationHelper {
  constructor(private prisma: PrismaService) {}

  /**
   * Get a numeric regulation value for a given season.
   * Falls back to DEFAULT_REGULATIONS or the provided fallback.
   */
  async getNumericValue(
    seasonId: string | undefined | null,
    key: string,
    fallback: number,
  ): Promise<number> {
    if (!seasonId) {
      return this.getDefaultValue(key, fallback);
    }

    try {
      const regulation = await this.prisma.regulation.findUnique({
        where: { seasonId_key: { seasonId, key } },
      });

      if (regulation) {
        const parsed = Number(regulation.value);
        return isNaN(parsed) ? fallback : parsed;
      }
    } catch {
      // If query fails, use fallback
    }

    return this.getDefaultValue(key, fallback);
  }

  /**
   * Get the default value from DEFAULT_REGULATIONS constant.
   */
  private getDefaultValue(key: string, fallback: number): number {
    const def = DEFAULT_REGULATIONS.find((r) => r.key === key);
    if (def) {
      const parsed = Number(def.value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }
}

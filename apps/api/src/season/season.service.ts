import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Season } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';

// Valid season status transitions
const SEASON_STATUS_TRANSITIONS: Record<string, string[]> = {
  UPCOMING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Season[]> {
    return this.prisma.season.findMany({
      orderBy: { year: 'desc' },
    });
  }

  async findOne(id: string): Promise<Season> {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        matches: {
          take: 10,
          orderBy: { roundNo: 'asc' },
        },
      },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    return season;
  }

  findCurrent(): Promise<Season | null> {
    return this.prisma.season.findFirst({
      where: { status: 'IN_PROGRESS' },
    });
  }

  async create(dto: CreateSeasonDto): Promise<Season> {
    try {
      return await this.prisma.season.create({
        data: {
          name: dto.name,
          year: dto.year,
          status: (dto.status ?? 'UPCOMING') as never,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Season with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSeasonDto): Promise<Season> {
    // Check exists
    await this.findOne(id);

    try {
      return await this.prisma.season.update({
        where: { id },
        data: dto as never,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Season with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);

    await this.prisma.season.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Update season status with state machine enforcement.
   * Only one season can be IN_PROGRESS at a time.
   */
  async updateStatus(id: string, newStatus: string): Promise<Season> {
    const season = await this.prisma.season.findUnique({ where: { id } });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    const currentStatus = season.status;
    const allowedTransitions = SEASON_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}. ` +
          `Trạng thái hợp lệ: ${allowedTransitions.length ? allowedTransitions.join(', ') : 'không có'}`,
      );
    }

    // Ensure only one season can be IN_PROGRESS at a time
    if (newStatus === 'IN_PROGRESS') {
      const activeSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });

      if (activeSeason) {
        throw new BadRequestException(
          `Mùa giải "${activeSeason.name}" đang diễn ra. Chỉ được phép một mùa giải IN_PROGRESS.`,
        );
      }
    }

    return this.prisma.season.update({
      where: { id },
      data: { status: newStatus as never },
    });
  }
}

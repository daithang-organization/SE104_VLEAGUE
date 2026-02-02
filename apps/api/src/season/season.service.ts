import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Season } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Season[]> {
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

  async findCurrent(): Promise<Season | null> {
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
          status: dto.status ?? 'UPCOMING',
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
        data: dto,
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
}

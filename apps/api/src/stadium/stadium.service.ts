import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Stadium } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStadiumDto, UpdateStadiumDto } from './dto';

@Injectable()
export class StadiumService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Stadium[]> {
    return this.prisma.stadium.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const stadium = await this.prisma.stadium.findUnique({
      where: { id },
      include: {
        teams: {
          select: { id: true, name: true },
        },
        matches: {
          select: {
            id: true,
            roundNo: true,
            leg: true,
            homeScore: true,
            awayScore: true,
            kickoffAt: true,
            status: true,
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            season: { select: { id: true, name: true } },
          },
          orderBy: { kickoffAt: 'desc' },
        },
      },
    });

    if (!stadium) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }

    return stadium;
  }

  async create(dto: CreateStadiumDto): Promise<Stadium> {
    try {
      return await this.prisma.stadium.create({
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Stadium with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateStadiumDto): Promise<Stadium> {
    await this.findOne(id);

    try {
      return await this.prisma.stadium.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Stadium with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);

    await this.prisma.stadium.delete({
      where: { id },
    });

    return { success: true };
  }
}

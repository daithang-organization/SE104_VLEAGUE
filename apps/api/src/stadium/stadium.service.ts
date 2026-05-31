import {
  BadRequestException,
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
    this.assertEligibleStadium(dto);
    const { teamId, ...stadiumDto } = dto;
    const data = {
      ...stadiumDto,
      country: stadiumDto.country ?? 'Việt Nam',
    };

    try {
      if (!teamId) {
        return await this.prisma.stadium.create({
          data: data as never,
        });
      }

      return await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.findUnique({
          where: { id: teamId },
          select: { id: true },
        });

        if (!team) {
          throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const stadium = await tx.stadium.create({
          data: data as never,
        });

        await tx.team.update({
          where: { id: teamId },
          data: { stadiumId: stadium.id },
        });

        return stadium;
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
    this.assertEligibleStadium(dto);
    const { teamId, ...stadiumDto } = dto;

    try {
      if (!teamId) {
        return await this.prisma.stadium.update({
          where: { id },
          data: stadiumDto as never,
        });
      }

      return await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.findUnique({
          where: { id: teamId },
          select: { id: true },
        });

        if (!team) {
          throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const stadium = await tx.stadium.update({
          where: { id },
          data: stadiumDto as never,
        });

        await tx.team.update({
          where: { id: teamId },
          data: { stadiumId: stadium.id },
        });

        return stadium;
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

  private assertEligibleStadium(dto: CreateStadiumDto | UpdateStadiumDto) {
    if (dto.capacity !== undefined && dto.capacity < 10000) {
      throw new BadRequestException(
        'Sân nhà phải có sức chứa tối thiểu 10.000 chỗ',
      );
    }

    if (dto.country !== undefined && !this.isVietnam(dto.country)) {
      throw new BadRequestException('Sân nhà phải nằm tại Việt Nam');
    }

    if (dto.fifaStars !== undefined && dto.fifaStars < 2) {
      throw new BadRequestException(
        'Sân nhà phải đạt tiêu chuẩn ít nhất 2 sao FIFA',
      );
    }
  }

  private isVietnam(country: string) {
    const normalized = country
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    return normalized === 'viet nam' || normalized === 'vietnam';
  }
}

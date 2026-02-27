import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoachDto, UpdateCoachDto } from './dto/coach.dto';

@Injectable()
export class CoachService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination?: {
    page?: number;
    limit?: number;
    search?: string;
    teamId?: string;
  }) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (pagination?.search) {
      where.OR = [
        { fullName: { contains: pagination.search, mode: 'insensitive' } },
        { nationality: { contains: pagination.search, mode: 'insensitive' } },
      ];
    }
    if (pagination?.teamId) where.teamId = pagination.teamId;

    const [data, total] = await Promise.all([
      this.prisma.coach.findMany({
        where,
        include: { team: { select: { id: true, name: true } } },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.coach.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: { team: { select: { id: true, name: true, logoUrl: true } } },
    });
    if (!coach) throw new NotFoundException(`Coach with ID ${id} not found`);
    return coach;
  }

  async create(dto: CreateCoachDto) {
    return this.prisma.coach.create({
      data: {
        fullName: dto.fullName,
        nationality: dto.nationality,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        licenseType: dto.licenseType,
        avatarUrl: dto.avatarUrl,
        teamId: dto.teamId,
      },
      include: { team: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateCoachDto) {
    const existing = await this.prisma.coach.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Coach with ID ${id} not found`);

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.dob !== undefined) data.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.licenseType !== undefined) data.licenseType = dto.licenseType;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.teamId !== undefined) data.teamId = dto.teamId;

    return this.prisma.coach.update({
      where: { id },
      data,
      include: { team: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.coach.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Coach with ID ${id} not found`);
    await this.prisma.coach.delete({ where: { id } });
    return { success: true };
  }
}

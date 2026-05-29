import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    emailVerified: true,
    avatarUrl: true,
    managedTeamId: true,
    managedTeam: {
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        city: true,
        status: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  private readonly userListSelect = {
    ...this.userSelect,
    googleId: true,
    facebookId: true,
  };

  async listUsers() {
    return this.prisma.user.findMany({
      select: this.userListSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);

    if (role === UserRole.TEAM_MANAGER && !user.managedTeamId) {
      throw new BadRequestException(
        'Tài khoản TEAM_MANAGER phải được gắn với một CLB cố định.',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role,
        managedTeamId:
          role === UserRole.TEAM_MANAGER ? user.managedTeamId : null,
      },
      select: this.userSelect,
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`Email "${dto.email}" đã tồn tại`);
    }

    const role = dto.role as unknown as UserRole;
    await this.assertManagedTeamForRole(role, dto.managedTeamId);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role,
        name: dto.name,
        managedTeamId:
          role === UserRole.TEAM_MANAGER ? dto.managedTeamId : null,
        emailVerified: true, // Admin-created accounts are pre-verified
      },
      select: this.userSelect,
    });
  }

  async deleteUser(id: string) {
    await this.findOne(id);

    // Delete related records first
    await this.prisma.otpCode.deleteMany({ where: { userId: id } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });

    return { success: true };
  }

  private async assertManagedTeamForRole(
    role: UserRole,
    managedTeamId?: string,
  ) {
    if (role !== UserRole.TEAM_MANAGER) {
      if (managedTeamId) {
        throw new BadRequestException(
          'Chỉ tài khoản TEAM_MANAGER được gắn CLB cố định.',
        );
      }
      return;
    }

    if (!managedTeamId) {
      throw new BadRequestException(
        'Vui lòng chọn CLB cố định cho tài khoản TEAM_MANAGER.',
      );
    }

    const team = await this.prisma.team.findUnique({
      where: { id: managedTeamId },
    });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB được chọn.');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type { TeamRoleValue } from './teams.types.js';

export interface TeamCreateRecord {
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

export interface TeamUpdateRecord {
  name?: string;
  slug?: string;
  description?: string | null;
}

@Injectable()
export class TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TeamCreateRecord) {
    return this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: data.ownerId,
          role: 'OWNER',
        },
      });

      return team;
    });
  }

  async findManyForUser(userId: string) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: true, _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(teamId: string) {
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, _count: { select: { members: true } } },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.team.findUnique({ where: { slug } });
  }

  async update(teamId: string, data: TeamUpdateRecord) {
    return this.prisma.team.update({
      where: { id: teamId },
      data,
      include: { members: true, _count: { select: { members: true } } },
    });
  }

  async delete(teamId: string) {
    return this.prisma.team.delete({ where: { id: teamId } });
  }

  async findMember(teamId: string, userId: string) {
    return this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async findMembers(teamId: string) {
    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async addMember(
    teamId: string,
    userId: string,
    role: TeamRoleValue,
    title?: string,
  ) {
    return this.prisma.teamMember.create({
      data: { teamId, userId, role, title },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
          },
        },
      },
    });
  }

  async updateMember(
    memberId: string,
    data: { role?: TeamRoleValue; title?: string | null },
  ) {
    return this.prisma.teamMember.update({
      where: { id: memberId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
          },
        },
      },
    });
  }

  async removeMember(memberId: string) {
    return this.prisma.teamMember.delete({ where: { id: memberId } });
  }
}

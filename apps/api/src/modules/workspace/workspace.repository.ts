import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserWorkspace(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMemberships: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        displayName: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        emailVerifiedAt: true,
                        lastLoginAt: true,
                        passwordChangedAt: true,
                      },
                    },
                  },
                  orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
                },
                projects: {
                  orderBy: { createdAt: 'desc' },
                },
                _count: { select: { members: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type { UserStatusValue, UserWithSecret } from './users.types.js';

export interface CreateUserRecord {
  email: string;
  displayName: string;
  passwordHash?: string;
  status?: UserStatusValue;
}

export interface UpdateUserRecord {
  email?: string;
  displayName?: string;
  passwordHash?: string;
  status?: UserStatusValue;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserRecord): Promise<UserWithSecret> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        passwordHash: data.passwordHash,
        status: data.status ?? 'ACTIVE',
        passwordChangedAt: data.passwordHash ? new Date() : null,
      },
    });
  }

  async findMany(search?: string): Promise<UserWithSecret[]> {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: UpdateUserRecord): Promise<UserWithSecret> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async disable(id: string): Promise<UserWithSecret> {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'DISABLED' },
    });
  }
}

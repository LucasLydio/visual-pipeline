import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type {
  ProjectStatusValue,
  SourceProviderValue,
} from './projects.types.js';

export interface ProjectCreateRecord {
  teamId: string;
  name: string;
  slug: string;
  provider: SourceProviderValue;
  repositoryUrl: string;
  repositoryId?: string;
  defaultBranch: string;
}

export interface ProjectUpdateRecord {
  name?: string;
  slug?: string;
  provider?: SourceProviderValue;
  repositoryUrl?: string;
  repositoryId?: string | null;
  defaultBranch?: string;
  status?: ProjectStatusValue;
}

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ProjectCreateRecord) {
    return this.prisma.project.create({ data });
  }

  async findManyByTeam(teamId: string, search?: string) {
    return this.prisma.project.findMany({
      where: {
        teamId,
        status: { not: 'ARCHIVED' },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { slug: { contains: search, mode: 'insensitive' as const } },
                {
                  repositoryUrl: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(projectId: string) {
    return this.prisma.project.findUnique({ where: { id: projectId } });
  }

  async findByTeamSlug(teamId: string, slug: string) {
    return this.prisma.project.findUnique({
      where: { teamId_slug: { teamId, slug } },
    });
  }

  async findByRepository(provider: SourceProviderValue, repositoryId: string) {
    return this.prisma.project.findUnique({
      where: { provider_repositoryId: { provider, repositoryId } },
    });
  }

  async update(projectId: string, data: ProjectUpdateRecord) {
    return this.prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  async archive(projectId: string) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'ARCHIVED' },
    });
  }
}

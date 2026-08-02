import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

@Injectable()
export class WebhooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDelivery(deliveryId: string) {
    return this.prisma.webhookDelivery.findUnique({
      where: { provider_deliveryId: { provider: 'GITHUB', deliveryId } },
    });
  }

  async createDelivery(deliveryId: string, event: string) {
    return this.prisma.webhookDelivery.create({
      data: { provider: 'GITHUB', deliveryId, event },
    });
  }

  async updateDelivery(
    deliveryId: string,
    data: {
      status: 'PROCESSED' | 'IGNORED' | 'FAILED';
      message: string;
      projectId?: string;
      pipelineRunId?: string;
    },
  ) {
    return this.prisma.webhookDelivery.update({
      where: { provider_deliveryId: { provider: 'GITHUB', deliveryId } },
      data: { ...data, processedAt: new Date() },
    });
  }

  async findGitHubProject(
    repositoryId: string | null,
    repositoryUrls: string[],
  ) {
    return this.prisma.project.findFirst({
      where: {
        provider: 'GITHUB',
        status: 'ACTIVE',
        OR: [
          ...(repositoryId ? [{ repositoryId }] : []),
          ...repositoryUrls.map((repositoryUrl) => ({ repositoryUrl })),
        ],
      },
      include: {
        pipelines: {
          where: { status: 'ACTIVE', steps: { some: { isEnabled: true } } },
          include: {
            steps: { where: { isEnabled: true }, orderBy: { order: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

export interface PipelineRunCreateRecord {
  pipelineId: string;
  triggeredById?: string | null;
  trigger?:
    'MANUAL' | 'GITHUB_WEBHOOK' | 'GITHUB_ACTIONS' | 'AGENT' | 'SCHEDULED';
  branch: string;
  commitSha?: string;
  steps: Array<{
    pipelineStepId: string;
    name: string;
    order: number;
    command?: string | null;
    isRequired: boolean;
  }>;
}

@Injectable()
export class PipelineRunsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPipelineById(pipelineId: string) {
    return this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        project: true,
        steps: { where: { isEnabled: true }, orderBy: { order: 'asc' } },
      },
    });
  }

  async createRun(data: PipelineRunCreateRecord) {
    return this.prisma.pipelineRun.create({
      data: {
        pipelineId: data.pipelineId,
        triggeredById: data.triggeredById,
        trigger: data.trigger,
        branch: data.branch,
        commitSha: data.commitSha,
        steps: {
          create: data.steps.map((step) => ({
            pipelineStepId: step.pipelineStepId,
            name: step.name,
            order: step.order,
            command: step.command,
            isRequired: step.isRequired,
          })),
        },
      },
      include: this.runInclude(),
    });
  }

  async findRunsByPipeline(pipelineId: string) {
    return this.prisma.pipelineRun.findMany({
      where: { pipelineId },
      include: this.runInclude(),
      orderBy: { queuedAt: 'desc' },
      take: 25,
    });
  }

  async findRunById(runId: string) {
    return this.prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: {
        ...this.runInclude(),
        pipeline: { include: { project: true } },
      },
    });
  }

  async cancelRun(runId: string) {
    const finishedAt = new Date();

    return this.prisma.$transaction(async (prisma) => {
      await prisma.pipelineStepRun.updateMany({
        where: {
          pipelineRunId: runId,
          status: { in: ['QUEUED', 'RUNNING'] },
        },
        data: { status: 'CANCELED', finishedAt },
      });

      return prisma.pipelineRun.update({
        where: { id: runId },
        data: {
          status: 'CANCELED',
          finishedAt,
          failureReason: 'Canceled manually.',
        },
        include: this.runInclude(),
      });
    });
  }

  private runInclude() {
    return {
      steps: { orderBy: { order: 'asc' as const } },
      triggeredBy: {
        select: { id: true, email: true, displayName: true },
      },
    };
  }
}

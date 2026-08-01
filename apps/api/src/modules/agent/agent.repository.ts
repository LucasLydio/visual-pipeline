import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type {
  AgentJobFinalStatus,
  AgentStepFinalStatus,
} from './agent.types.js';

@Injectable()
export class AgentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async claimNextQueuedRun() {
    return this.prisma.$transaction(async (prisma) => {
      const candidate = await prisma.pipelineRun.findFirst({
        where: { status: 'QUEUED' },
        orderBy: { queuedAt: 'asc' },
      });

      if (!candidate) return null;

      const claimed = await prisma.pipelineRun.updateMany({
        where: { id: candidate.id, status: 'QUEUED' },
        data: { status: 'RUNNING', startedAt: new Date() },
      });

      if (!claimed.count) return null;
      return prisma.pipelineRun.findUnique({
        where: { id: candidate.id },
        include: this.jobInclude(),
      });
    });
  }

  async findRunById(runId: string) {
    return this.prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: this.jobInclude(),
    });
  }

  async startStep(runId: string, stepRunId: string) {
    return this.prisma.pipelineStepRun.update({
      where: { id: stepRunId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });
  }

  async completeStep(
    runId: string,
    stepRunId: string,
    status: AgentStepFinalStatus,
    logsSummary?: string | null,
  ) {
    return this.prisma.pipelineStepRun.update({
      where: { id: stepRunId },
      data: {
        status,
        logsSummary,
        finishedAt: new Date(),
      },
    });
  }

  async skipQueuedSteps(runId: string) {
    return this.prisma.pipelineStepRun.updateMany({
      where: { pipelineRunId: runId, status: 'QUEUED' },
      data: { status: 'SKIPPED', finishedAt: new Date() },
    });
  }

  async completeRun(
    runId: string,
    status: AgentJobFinalStatus,
    failureReason?: string | null,
  ) {
    return this.prisma.pipelineRun.update({
      where: { id: runId },
      data: { status, failureReason, finishedAt: new Date() },
      include: this.jobInclude(),
    });
  }

  private jobInclude() {
    return {
      steps: { orderBy: { order: 'asc' as const } },
      pipeline: {
        include: {
          project: true,
        },
      },
      triggeredBy: {
        select: { id: true, email: true, displayName: true },
      },
    };
  }
}

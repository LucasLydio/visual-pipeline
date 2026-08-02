import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type {
  WorkflowRunFinalStatus,
  WorkflowStepFinalStatus,
} from './workflows.types.js';

@Injectable()
export class WorkflowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProjectForSetup(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: this.projectInclude(),
    });
  }

  async enableWorkflow(projectId: string, workflowTokenHash: string) {
    const now = new Date();

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        workflowTokenHash,
        workflowEnabledAt: now,
        workflowRotatedAt: now,
      },
      include: this.projectInclude(),
    });
  }

  async findProjectById(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: this.projectInclude(),
    });
  }

  async createGitHubActionsRun(data: {
    pipelineId: string;
    branch: string;
    commitSha?: string;
    externalRunId?: string | null;
    externalRunUrl?: string | null;
    runnerName?: string | null;
    steps: Array<{
      pipelineStepId: string;
      name: string;
      order: number;
      command?: string | null;
      isRequired: boolean;
    }>;
  }) {
    const now = new Date();

    return this.prisma.pipelineRun.create({
      data: {
        pipelineId: data.pipelineId,
        trigger: 'GITHUB_ACTIONS',
        status: 'RUNNING',
        branch: data.branch,
        commitSha: data.commitSha,
        externalRunId: data.externalRunId,
        externalRunUrl: data.externalRunUrl,
        runnerName: data.runnerName,
        startedAt: now,
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

  async findRunById(runId: string) {
    return this.prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: this.runInclude(),
    });
  }

  async startStep(runId: string, order: number) {
    return this.prisma.pipelineStepRun.update({
      where: { pipelineRunId_order: { pipelineRunId: runId, order } },
      data: { status: 'RUNNING', startedAt: new Date() },
    });
  }

  async completeStep(
    runId: string,
    order: number,
    status: WorkflowStepFinalStatus,
    logsSummary?: string | null,
  ) {
    return this.prisma.pipelineStepRun.update({
      where: { pipelineRunId_order: { pipelineRunId: runId, order } },
      data: { status, logsSummary, finishedAt: new Date() },
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
    status: WorkflowRunFinalStatus,
    failureReason?: string | null,
  ) {
    return this.prisma.pipelineRun.update({
      where: { id: runId },
      data: { status, failureReason, finishedAt: new Date() },
      include: this.runInclude(),
    });
  }

  private projectInclude() {
    return {
      pipelines: {
        where: {
          status: 'ACTIVE' as const,
          steps: { some: { isEnabled: true } },
        },
        include: {
          steps: {
            where: { isEnabled: true },
            orderBy: { order: 'asc' as const },
          },
        },
        orderBy: { createdAt: 'desc' as const },
        take: 1,
      },
    };
  }

  private runInclude() {
    return {
      steps: { orderBy: { order: 'asc' as const } },
      pipeline: { include: { project: true } },
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompleteAgentJobDto } from './dto/complete-agent-job.dto.js';
import { CompleteAgentStepDto } from './dto/complete-agent-step.dto.js';
import { UpdateAgentStepLogsDto } from './dto/update-agent-step-logs.dto.js';
import { AgentRepository } from './agent.repository.js';
import {
  AGENT_JOB_FINAL_STATUSES,
  AGENT_STEP_FINAL_STATUSES,
  AgentJobFinalStatus,
  AgentStepFinalStatus,
} from './agent.types.js';

@Injectable()
export class AgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async claimNextJob() {
    return this.agentRepository.claimNextQueuedRun();
  }

  async startStep(runId: string, stepRunId: string) {
    const run = await this.getRunningRunOrThrow(runId);
    const step = run.steps.find((candidate) => candidate.id === stepRunId);

    if (!step) throw new NotFoundException('Pipeline step run not found.');
    if (step.status !== 'QUEUED') {
      throw new BadRequestException('Only queued steps can be started.');
    }

    return this.agentRepository.startStep(runId, stepRunId);
  }

  async completeStep(
    runId: string,
    stepRunId: string,
    dto: CompleteAgentStepDto,
  ) {
    const run = await this.getRunningRunOrThrow(runId);
    const step = run.steps.find((candidate) => candidate.id === stepRunId);
    const status = this.normalizeStepStatus(dto.status);

    if (!step) throw new NotFoundException('Pipeline step run not found.');
    if (!['QUEUED', 'RUNNING'].includes(step.status)) {
      throw new BadRequestException('Step is already finished.');
    }

    const completed = await this.agentRepository.completeStep(
      runId,
      stepRunId,
      status,
      this.normalizeLogsSummary(dto.logsSummary),
    );

    if (status === 'FAILED' && step.isRequired) {
      await this.agentRepository.skipQueuedSteps(runId);
      await this.agentRepository.completeRun(
        runId,
        'FAILED',
        `Required step failed: ${step.name}`,
      );
    }

    return completed;
  }

  async updateStepLogs(
    runId: string,
    stepRunId: string,
    dto: UpdateAgentStepLogsDto,
  ) {
    const run = await this.getRunningRunOrThrow(runId);
    const step = run.steps.find((candidate) => candidate.id === stepRunId);

    if (!step) throw new NotFoundException('Pipeline step run not found.');
    if (step.status !== 'RUNNING') {
      throw new BadRequestException(
        'Only running steps can receive live logs.',
      );
    }

    return this.agentRepository.updateStepLogs(
      stepRunId,
      this.normalizeLogsSummary(dto.logsSummary),
    );
  }

  async completeJob(runId: string, dto: CompleteAgentJobDto) {
    await this.getRunningRunOrThrow(runId);
    const status = this.normalizeJobStatus(dto.status);

    return this.agentRepository.completeRun(
      runId,
      status,
      this.normalizeFailureReason(dto.failureReason),
    );
  }

  private async getRunningRunOrThrow(runId: string) {
    const run = await this.agentRepository.findRunById(runId);
    if (!run) throw new NotFoundException('Pipeline run not found.');
    if (run.status !== 'RUNNING') {
      throw new BadRequestException('Pipeline run is not running.');
    }

    return run;
  }

  private normalizeJobStatus(
    status?: AgentJobFinalStatus,
  ): AgentJobFinalStatus {
    if (!status || !AGENT_JOB_FINAL_STATUSES.has(status)) {
      throw new BadRequestException('Invalid final job status.');
    }

    return status;
  }

  private normalizeStepStatus(
    status?: AgentStepFinalStatus,
  ): AgentStepFinalStatus {
    if (!status || !AGENT_STEP_FINAL_STATUSES.has(status)) {
      throw new BadRequestException('Invalid final step status.');
    }

    return status;
  }

  private normalizeFailureReason(value?: string): string | null {
    const normalized = value?.trim();
    if (!normalized) return null;
    if (normalized.length > 240) {
      throw new BadRequestException(
        'Failure reason must have at most 240 characters.',
      );
    }

    return normalized;
  }

  private normalizeLogsSummary(value?: string): string | null {
    const normalized = value?.trim();
    return normalized || null;
  }
}

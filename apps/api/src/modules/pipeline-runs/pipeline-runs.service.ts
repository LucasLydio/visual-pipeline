import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamsService } from '../teams/teams.service.js';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto.js';
import { PipelineRunsRepository } from './pipeline-runs.repository.js';

@Injectable()
export class PipelineRunsService {
  constructor(
    private readonly runsRepository: PipelineRunsRepository,
    private readonly teamsService: TeamsService,
  ) {}

  async triggerManualRun(
    pipelineId: string,
    userId: string,
    dto: CreatePipelineRunDto,
  ) {
    const pipeline = await this.getPipelineOrThrow(pipelineId, true);
    await this.assertProjectOwner(
      pipeline.project.teamId,
      pipeline.project.ownerId,
      userId,
    );

    const enabledSteps = pipeline.steps.filter((step) => step.isEnabled);
    if (!enabledSteps.length) {
      throw new BadRequestException('Pipeline has no enabled steps to run.');
    }
    if (pipeline.project.executionMode === 'GITHUB_ACTIONS') {
      throw new BadRequestException(
        'GitHub Actions projects run through the generated workflow.',
      );
    }

    return this.runsRepository.createRun({
      pipelineId: pipeline.id,
      triggeredById: userId,
      trigger:
        pipeline.project.executionMode === 'LOCAL_AGENT' ? 'AGENT' : 'MANUAL',
      branch: this.normalizeBranch(
        dto.branch ?? pipeline.project.defaultBranch,
      ),
      commitSha: this.normalizeCommitSha(dto.commitSha),
      steps: enabledSteps.map((step) => ({
        pipelineStepId: step.id,
        name: step.name,
        order: step.order,
        command: step.command,
        isRequired: step.isRequired,
      })),
    });
  }

  async findRunsByPipeline(pipelineId: string, userId: string) {
    const pipeline = await this.getPipelineOrThrow(pipelineId);
    await this.teamsService.assertTeamMember(pipeline.project.teamId, userId);

    return this.runsRepository.findRunsByPipeline(pipeline.id);
  }

  async findRunById(runId: string, userId: string) {
    const run = await this.runsRepository.findRunById(runId);
    if (!run) throw new NotFoundException('Pipeline run not found.');

    await this.teamsService.assertTeamMember(
      run.pipeline.project.teamId,
      userId,
    );
    return run;
  }

  async findRunStatusById(runId: string, userId: string) {
    const run = await this.runsRepository.findRunStatusById(runId);
    if (!run) throw new NotFoundException('Pipeline run not found.');

    await this.teamsService.assertTeamMember(
      run.pipeline.project.teamId,
      userId,
    );

    return {
      id: run.id,
      pipelineId: run.pipelineId,
      status: run.status,
      failureReason: run.failureReason,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      updatedAt: run.updatedAt,
      steps: run.steps,
    };
  }

  async cancelRun(runId: string, userId: string) {
    const run = await this.runsRepository.findRunById(runId);
    if (!run) throw new NotFoundException('Pipeline run not found.');

    await this.assertProjectOwner(
      run.pipeline.project.teamId,
      run.pipeline.project.ownerId,
      userId,
    );

    if (!['QUEUED', 'RUNNING'].includes(run.status)) {
      throw new BadRequestException(
        'Only queued or running pipeline runs can be canceled.',
      );
    }

    return this.runsRepository.cancelRun(run.id);
  }

  private async getPipelineOrThrow(pipelineId: string, requireActive = false) {
    const pipeline = await this.runsRepository.findPipelineById(pipelineId);
    if (!pipeline) throw new NotFoundException('Pipeline not found.');
    if (requireActive && pipeline.status !== 'ACTIVE') {
      throw new BadRequestException('Only active pipelines can be run.');
    }

    return pipeline;
  }

  private async assertProjectOwner(
    teamId: string,
    ownerId: string | null,
    userId: string,
  ): Promise<void> {
    if (ownerId === userId) return;

    if (!ownerId) {
      await this.teamsService.assertTeamManager(teamId, userId);
      return;
    }

    throw new ForbiddenException(
      'Only the project owner can run this pipeline.',
    );
  }

  private normalizeBranch(branch: string): string {
    const normalized = branch.trim();
    if (!normalized || normalized.length > 120) {
      throw new BadRequestException(
        'Branch must be between 1 and 120 characters.',
      );
    }

    return normalized;
  }

  private normalizeCommitSha(commitSha?: string): string | undefined {
    const normalized = commitSha?.trim();
    if (!normalized) return undefined;
    if (!/^[a-f0-9]{7,64}$/i.test(normalized)) {
      throw new BadRequestException(
        'Commit SHA must be a valid short or full SHA.',
      );
    }

    return normalized;
  }
}

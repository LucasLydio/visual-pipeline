import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TeamsService } from '../teams/teams.service.js';
import { CompleteWorkflowRunDto } from './dto/complete-workflow-run.dto.js';
import { CompleteWorkflowStepDto } from './dto/complete-workflow-step.dto.js';
import { StartWorkflowRunDto } from './dto/start-workflow-run.dto.js';
import { WorkflowTokenService } from './workflow-token.service.js';
import { WorkflowYamlService } from './workflow-yaml.service.js';
import { WorkflowsRepository } from './workflows.repository.js';
import {
  WORKFLOW_RUN_FINAL_STATUSES,
  WORKFLOW_STEP_FINAL_STATUSES,
  WorkflowRunFinalStatus,
  WorkflowSetupResponse,
  WorkflowStepFinalStatus,
} from './workflows.types.js';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly repository: WorkflowsRepository,
    private readonly tokenService: WorkflowTokenService,
    private readonly yamlService: WorkflowYamlService,
    private readonly teamsService: TeamsService,
  ) {}

  async getSetup(
    projectId: string,
    userId: string,
  ): Promise<WorkflowSetupResponse> {
    const project = await this.getProjectForUser(projectId, userId);
    this.assertGitHubProject(project);
    this.assertRunnablePipeline(project);

    return this.toSetupResponse(project);
  }

  async rotateToken(
    projectId: string,
    userId: string,
  ): Promise<WorkflowSetupResponse> {
    const project = await this.getProjectForUser(projectId, userId);
    await this.assertProjectManager(project, userId);
    this.assertGitHubProject(project);
    this.assertRunnablePipeline(project);

    const token = this.tokenService.generateToken();
    const updated = await this.repository.enableWorkflow(
      project.id,
      this.tokenService.hashToken(token),
    );

    return { ...this.toSetupResponse(updated), workflowToken: token };
  }

  async startGitHubRun(
    projectId: string | undefined,
    token: string | undefined,
    dto: StartWorkflowRunDto,
  ) {
    const project = await this.getProjectForWorkflow(projectId, token);
    const pipeline = this.assertRunnablePipeline(project);

    const run = await this.repository.createGitHubActionsRun({
      pipelineId: pipeline.id,
      branch: this.normalizeBranch(dto.branch ?? project.defaultBranch),
      commitSha: this.normalizeCommitSha(dto.commitSha),
      externalRunId: this.normalizeOptional(dto.externalRunId, 120),
      externalRunUrl: this.normalizeOptional(dto.externalRunUrl, 2048),
      runnerName: this.normalizeOptional(dto.runnerName, 120),
      steps: pipeline.steps.map((step) => ({
        pipelineStepId: step.id,
        name: step.name,
        order: step.order,
        command: step.command,
        isRequired: step.isRequired,
      })),
    });

    return { runId: run.id, message: 'Workflow run started.' };
  }

  async startStep(
    runId: string,
    order: string,
    projectId?: string,
    token?: string,
  ) {
    const run = await this.getWorkflowRun(runId, projectId, token);
    const step = this.findStep(run, this.normalizeOrder(order));

    if (step.status !== 'QUEUED') {
      throw new BadRequestException(
        'Only queued workflow steps can be started.',
      );
    }

    return this.repository.startStep(run.id, step.order);
  }

  async completeStep(
    runId: string,
    order: string,
    projectId: string | undefined,
    token: string | undefined,
    dto: CompleteWorkflowStepDto,
  ) {
    const run = await this.getWorkflowRun(runId, projectId, token);
    const step = this.findStep(run, this.normalizeOrder(order));
    const status = this.normalizeStepStatus(dto.status);

    if (!['QUEUED', 'RUNNING'].includes(step.status)) {
      throw new BadRequestException('Workflow step is already finished.');
    }

    const completed = await this.repository.completeStep(
      run.id,
      step.order,
      status,
      this.normalizeLogsSummary(dto.logsSummary),
    );

    if (status === 'FAILED' && step.isRequired) {
      await this.repository.skipQueuedSteps(run.id);
      await this.repository.completeRun(
        run.id,
        'FAILED',
        `Required step failed: ${step.name}`,
      );
    }

    return completed;
  }

  async completeRun(
    runId: string,
    projectId: string | undefined,
    token: string | undefined,
    dto: CompleteWorkflowRunDto,
  ) {
    const run = await this.getWorkflowRun(runId, projectId, token, false);
    const status = this.normalizeRunStatus(dto.status);

    if (!['RUNNING', 'FAILED'].includes(run.status)) {
      throw new BadRequestException('Workflow run is already finished.');
    }

    return this.repository.completeRun(
      run.id,
      status,
      this.normalizeFailureReason(dto.failureReason),
    );
  }

  private async getProjectForUser(projectId: string, userId: string) {
    const project = await this.repository.findProjectForSetup(projectId);
    if (!project) throw new NotFoundException('Project not found.');

    await this.teamsService.assertTeamMember(project.teamId, userId);
    return project;
  }

  private async assertProjectManager(
    project: { teamId: string; ownerId: string | null },
    userId: string,
  ): Promise<void> {
    if (project.ownerId === userId) return;
    await this.teamsService.assertTeamManager(project.teamId, userId);
  }

  private async getProjectForWorkflow(projectId?: string, token?: string) {
    const normalizedProjectId = projectId?.trim();
    const normalizedToken = token?.trim();

    if (!normalizedProjectId || !normalizedToken) {
      throw new UnauthorizedException('Workflow token is required.');
    }

    const project = await this.repository.findProjectById(normalizedProjectId);
    if (!project) throw new UnauthorizedException('Invalid workflow token.');
    if (
      !this.tokenService.matches(normalizedToken, project.workflowTokenHash)
    ) {
      throw new UnauthorizedException('Invalid workflow token.');
    }

    this.assertGitHubProject(project);
    return project;
  }

  private async getWorkflowRun(
    runId: string,
    projectId?: string,
    token?: string,
    requireRunning = true,
  ) {
    const project = await this.getProjectForWorkflow(projectId, token);
    const run = await this.repository.findRunById(runId);

    if (!run) throw new NotFoundException('Workflow run not found.');
    if (run.pipeline.projectId !== project.id) {
      throw new ForbiddenException('Workflow run does not belong to project.');
    }
    if (run.trigger !== 'GITHUB_ACTIONS') {
      throw new BadRequestException('Run was not started by GitHub Actions.');
    }
    if (requireRunning && run.status !== 'RUNNING') {
      throw new BadRequestException('Workflow run is not running.');
    }

    return run;
  }

  private assertGitHubProject(project: {
    provider: string;
    status: string;
  }): void {
    if (project.provider !== 'GITHUB') {
      throw new BadRequestException(
        'Hybrid workflow setup is available for GitHub projects.',
      );
    }
    if (project.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Only active projects can use workflow setup.',
      );
    }
  }

  private assertRunnablePipeline(project: {
    pipelines: ReadonlyArray<{
      id: string;
      steps: ReadonlyArray<{
        id: string;
        name: string;
        order: number;
        command: string | null;
        isRequired: boolean;
      }>;
    }>;
  }) {
    const pipeline = project.pipelines[0];

    if (!pipeline || pipeline.steps.length === 0) {
      throw new BadRequestException(
        'Project has no active pipeline with enabled steps.',
      );
    }

    return pipeline;
  }

  private toSetupResponse(project: {
    id: string;
    workflowTokenHash: string | null;
    pipelines: ReadonlyArray<{
      name: string;
      steps: ReadonlyArray<{
        name: string;
        order: number;
        command: string | null;
        isRequired: boolean;
      }>;
    }>;
    name: string;
    defaultBranch: string;
  }): WorkflowSetupResponse {
    return {
      projectId: project.id,
      enabled: Boolean(project.workflowTokenHash),
      secretName: this.yamlService.secretName,
      workflowPath: this.yamlService.workflowPath,
      apiBaseUrl: this.yamlService.apiBaseUrl(),
      workflowYaml: this.yamlService.build(project),
    };
  }

  private findStep(
    run: {
      steps: ReadonlyArray<{
        order: number;
        name: string;
        status: string;
        isRequired: boolean;
      }>;
    },
    order: number,
  ) {
    const step = run.steps.find((candidate) => candidate.order === order);
    if (!step) throw new NotFoundException('Workflow step not found.');

    return step;
  }

  private normalizeRunStatus(
    status?: WorkflowRunFinalStatus,
  ): WorkflowRunFinalStatus {
    if (!status || !WORKFLOW_RUN_FINAL_STATUSES.has(status)) {
      throw new BadRequestException('Invalid workflow run status.');
    }

    return status;
  }

  private normalizeStepStatus(
    status?: WorkflowStepFinalStatus,
  ): WorkflowStepFinalStatus {
    if (!status || !WORKFLOW_STEP_FINAL_STATUSES.has(status)) {
      throw new BadRequestException('Invalid workflow step status.');
    }

    return status;
  }

  private normalizeOrder(order: string): number {
    const parsed = Number(order);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Workflow step order is invalid.');
    }

    return parsed;
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

  private normalizeOptional(
    value: string | undefined,
    max: number,
  ): string | null {
    const normalized = value?.trim();
    if (!normalized) return null;
    if (normalized.length > max) {
      throw new BadRequestException(
        `Value must have at most ${max} characters.`,
      );
    }

    return normalized;
  }
}

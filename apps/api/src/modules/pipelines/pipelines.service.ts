import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamsService } from '../teams/teams.service.js';
import { CreatePipelineDto } from './dto/create-pipeline.dto.js';
import type { CreatePipelineStepDto } from './dto/create-pipeline-step.dto.js';
import { CreatePipelineTemplateDto } from './dto/create-pipeline-template.dto.js';
import type { CreatePipelineTemplateStepDto } from './dto/create-pipeline-template-step.dto.js';
import { UpdatePipelineDto } from './dto/update-pipeline.dto.js';
import type { UpdatePipelineStepDto } from './dto/update-pipeline-step.dto.js';
import { UpdatePipelineTemplateDto } from './dto/update-pipeline-template.dto.js';
import type { UpdatePipelineTemplateStepDto } from './dto/update-pipeline-template-step.dto.js';
import { PipelineStepsPolicy } from './pipeline-steps.policy.js';
import { PipelinesRepository } from './pipelines.repository.js';
import type { PipelineStatusValue } from './pipelines.types.js';

const VALID_STATUSES = new Set<PipelineStatusValue>([
  'ACTIVE',
  'PAUSED',
  'ARCHIVED',
]);

@Injectable()
export class PipelinesService {
  constructor(
    private readonly pipelinesRepository: PipelinesRepository,
    private readonly teamsService: TeamsService,
    private readonly pipelineStepsPolicy: PipelineStepsPolicy,
  ) {}

  async findTemplates(teamId: string, userId: string, includeInactive = false) {
    await this.teamsService.assertTeamMember(teamId, userId);
    return this.pipelinesRepository.findTemplatesByTeam(
      teamId,
      includeInactive,
    );
  }

  async findTemplateById(templateId: string, userId: string) {
    const template = await this.getTemplateOrThrow(templateId);
    await this.teamsService.assertTeamMember(template.teamId, userId);
    return template;
  }

  async createTemplate(
    teamId: string,
    userId: string,
    dto: CreatePipelineTemplateDto,
  ) {
    await this.teamsService.assertTeamManager(teamId, userId);
    const name = this.normalizeName(dto.name, 'Template name');
    await this.ensureTemplateNameAvailable(teamId, name);

    return this.pipelinesRepository.createTemplate({
      teamId,
      createdById: userId,
      name,
      description: this.normalizeDescription(dto.description),
      steps: this.pipelineStepsPolicy.normalizeTemplateSteps(dto.steps),
    });
  }

  async updateTemplate(
    templateId: string,
    userId: string,
    dto: UpdatePipelineTemplateDto,
  ) {
    const template = await this.getTemplateOrThrow(templateId);
    await this.teamsService.assertTeamManager(template.teamId, userId);
    const data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};

    if (dto.name !== undefined) {
      data.name = this.normalizeName(dto.name, 'Template name');
      await this.ensureTemplateNameAvailable(
        template.teamId,
        data.name,
        template.id,
      );
    }
    if (dto.description !== undefined) {
      data.description = this.normalizeNullableDescription(dto.description);
    }
    if (dto.isActive !== undefined) data.isActive = Boolean(dto.isActive);

    return this.pipelinesRepository.updateTemplate(templateId, data);
  }

  async createTemplateStep(
    templateId: string,
    userId: string,
    dto: CreatePipelineTemplateStepDto,
  ) {
    const template = await this.getTemplateOrThrow(templateId);
    await this.teamsService.assertTeamManager(template.teamId, userId);
    const data = this.pipelineStepsPolicy.normalizeTemplateStep(
      dto,
      template.steps.length + 1,
    );
    this.pipelineStepsPolicy.ensureStepOrderAvailable(
      template.steps,
      data.order,
    );

    return this.pipelinesRepository.createTemplateStep(templateId, data);
  }

  async updateTemplateStep(
    stepId: string,
    userId: string,
    dto: UpdatePipelineTemplateStepDto,
  ) {
    const step = await this.getTemplateStepOrThrow(stepId);
    await this.teamsService.assertTeamManager(step.template.teamId, userId);
    const data = this.pipelineStepsPolicy.normalizeTemplateStepUpdate(dto);
    if (data.order !== undefined) {
      this.pipelineStepsPolicy.ensureStepOrderAvailable(
        step.template.steps,
        data.order,
        step.id,
      );
    }

    return this.pipelinesRepository.updateTemplateStep(stepId, data);
  }

  async deleteTemplateStep(stepId: string, userId: string) {
    const step = await this.getTemplateStepOrThrow(stepId);
    await this.teamsService.assertTeamManager(step.template.teamId, userId);
    await this.pipelinesRepository.deleteTemplateStep(stepId);
    return { message: 'Template step deleted.' };
  }

  async findPipelines(projectId: string, userId: string) {
    const project = await this.assertProjectMember(projectId, userId);
    return this.pipelinesRepository.findPipelinesByProject(project.id);
  }

  async findPipelineById(pipelineId: string, userId: string) {
    const pipeline = await this.getPipelineOrThrow(pipelineId);
    await this.teamsService.assertTeamMember(pipeline.project.teamId, userId);
    return pipeline;
  }

  async createPipeline(
    projectId: string,
    userId: string,
    dto: CreatePipelineDto,
  ) {
    const project = await this.assertProjectOwner(projectId, userId);
    const template = dto.templateId
      ? await this.getTemplateOrThrow(dto.templateId)
      : null;

    if (template && template.teamId !== project.teamId) {
      throw new ForbiddenException(
        'Template does not belong to this project team.',
      );
    }

    const steps = template
      ? template.steps.map((step) =>
          this.pipelineStepsPolicy.templateStepToPipelineStep(step),
        )
      : this.pipelineStepsPolicy.normalizePipelineSteps(dto.steps);

    return this.pipelinesRepository.createPipeline({
      projectId,
      templateId: template?.id,
      name: this.normalizeName(dto.name ?? template?.name, 'Pipeline name'),
      description: this.normalizeDescription(
        dto.description ?? template?.description ?? undefined,
      ),
      steps,
    });
  }

  async updatePipeline(
    pipelineId: string,
    userId: string,
    dto: UpdatePipelineDto,
  ) {
    const pipeline = await this.getPipelineOrThrow(pipelineId);
    await this.assertProjectOwner(pipeline.projectId, userId);
    const data: {
      name?: string;
      description?: string | null;
      status?: PipelineStatusValue;
    } = {};

    if (dto.name !== undefined)
      data.name = this.normalizeName(dto.name, 'Pipeline name');
    if (dto.description !== undefined) {
      data.description = this.normalizeNullableDescription(dto.description);
    }
    if (dto.status !== undefined)
      data.status = this.normalizeStatus(dto.status);

    return this.pipelinesRepository.updatePipeline(pipelineId, data);
  }

  async archivePipeline(pipelineId: string, userId: string) {
    return this.updatePipeline(pipelineId, userId, { status: 'ARCHIVED' });
  }

  async createPipelineStep(
    pipelineId: string,
    userId: string,
    dto: CreatePipelineStepDto,
  ) {
    const pipeline = await this.getPipelineOrThrow(pipelineId);
    await this.assertProjectOwner(pipeline.projectId, userId);
    const data = this.pipelineStepsPolicy.normalizePipelineStep(
      dto,
      pipeline.steps.length + 1,
    );
    this.pipelineStepsPolicy.ensureStepOrderAvailable(
      pipeline.steps,
      data.order,
    );

    return this.pipelinesRepository.createPipelineStep(pipelineId, data);
  }

  async updatePipelineStep(
    stepId: string,
    userId: string,
    dto: UpdatePipelineStepDto,
  ) {
    const step = await this.getPipelineStepOrThrow(stepId);
    await this.assertProjectOwner(step.pipeline.projectId, userId);
    const data = this.pipelineStepsPolicy.normalizePipelineStepUpdate(dto);
    if (data.order !== undefined) {
      this.pipelineStepsPolicy.ensureStepOrderAvailable(
        step.pipeline.steps,
        data.order,
        step.id,
      );
    }

    return this.pipelinesRepository.updatePipelineStep(stepId, data);
  }

  async deletePipelineStep(stepId: string, userId: string) {
    const step = await this.getPipelineStepOrThrow(stepId);
    await this.assertProjectOwner(step.pipeline.projectId, userId);
    await this.pipelinesRepository.deletePipelineStep(stepId);
    return { message: 'Pipeline step deleted.' };
  }

  private async assertProjectMember(projectId: string, userId: string) {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamMember(project.teamId, userId);
    return project;
  }

  private async assertProjectOwner(projectId: string, userId: string) {
    const project = await this.getProjectOrThrow(projectId);

    if (project.ownerId === userId) return project;

    if (!project.ownerId) {
      await this.teamsService.assertTeamManager(project.teamId, userId);
      return project;
    }

    throw new ForbiddenException(
      'Only the project owner can manage pipelines.',
    );
  }

  private async getProjectOrThrow(projectId: string) {
    const project = await this.pipelinesRepository.findProjectById(projectId);
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  private async getTemplateOrThrow(templateId: string) {
    const template =
      await this.pipelinesRepository.findTemplateById(templateId);
    if (!template) throw new NotFoundException('Pipeline template not found.');
    return template;
  }

  private async getTemplateStepOrThrow(stepId: string) {
    const step = await this.pipelinesRepository.findTemplateStepById(stepId);
    if (!step) throw new NotFoundException('Template step not found.');
    return step;
  }

  private async getPipelineOrThrow(pipelineId: string) {
    const pipeline =
      await this.pipelinesRepository.findPipelineById(pipelineId);
    if (!pipeline) throw new NotFoundException('Pipeline not found.');
    return pipeline;
  }

  private async getPipelineStepOrThrow(stepId: string) {
    const step = await this.pipelinesRepository.findPipelineStepById(stepId);
    if (!step) throw new NotFoundException('Pipeline step not found.');
    return step;
  }

  private async ensureTemplateNameAvailable(
    teamId: string,
    name: string,
    ignoreTemplateId?: string,
  ): Promise<void> {
    const existing = (
      await this.pipelinesRepository.findTemplatesByTeam(teamId, true)
    ).find((template) => template.name.toLowerCase() === name.toLowerCase());

    if (existing && existing.id !== ignoreTemplateId) {
      throw new ConflictException('Pipeline template name is already in use.');
    }
  }

  private normalizeName(
    value: string | undefined,
    label: string,
    max = 140,
  ): string {
    const normalized = value?.trim();
    if (!normalized || normalized.length < 2 || normalized.length > max) {
      throw new BadRequestException(
        `${label} must be between 2 and ${max} characters.`,
      );
    }
    return normalized;
  }

  private normalizeDescription(value?: string): string | undefined {
    return this.normalizeNullableDescription(value) ?? undefined;
  }

  private normalizeNullableDescription(value?: string | null): string | null {
    const normalized = value?.trim();
    if (!normalized) return null;
    if (normalized.length > 240) {
      throw new BadRequestException(
        'Description must have at most 240 characters.',
      );
    }
    return normalized;
  }

  private normalizeStatus(status: PipelineStatusValue): PipelineStatusValue {
    if (!VALID_STATUSES.has(status)) {
      throw new BadRequestException('Invalid pipeline status.');
    }
    return status;
  }

  private cleanUndefined<T extends Record<string, unknown>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as T;
  }
}

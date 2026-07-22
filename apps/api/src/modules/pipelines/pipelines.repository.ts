import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type { PipelineStatusValue } from './pipelines.types.js';

export interface TemplateStepRecord {
  name: string;
  description?: string | null;
  order: number;
  command?: string | null;
  isRequired: boolean;
  isEnabled: boolean;
}

export interface PipelineStepRecord {
  name: string;
  order: number;
  command?: string | null;
  isRequired: boolean;
  isEnabled: boolean;
}

@Injectable()
export class PipelinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProjectById(projectId: string) {
    return this.prisma.project.findUnique({ where: { id: projectId } });
  }

  async findTemplatesByTeam(teamId: string, includeInactive = false) {
    return this.prisma.pipelineTemplate.findMany({
      where: { teamId, ...(includeInactive ? {} : { isActive: true }) },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(templateId: string) {
    return this.prisma.pipelineTemplate.findUnique({
      where: { id: templateId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async findTemplateStepById(stepId: string) {
    return this.prisma.pipelineTemplateStep.findUnique({
      where: { id: stepId },
      include: { template: true },
    });
  }

  async createTemplate(data: {
    teamId: string;
    createdById: string;
    name: string;
    description?: string;
    steps: TemplateStepRecord[];
  }) {
    return this.prisma.pipelineTemplate.create({
      data: {
        teamId: data.teamId,
        createdById: data.createdById,
        name: data.name,
        description: data.description,
        steps: { create: data.steps },
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async updateTemplate(
    templateId: string,
    data: { name?: string; description?: string | null; isActive?: boolean },
  ) {
    return this.prisma.pipelineTemplate.update({
      where: { id: templateId },
      data,
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async createTemplateStep(templateId: string, data: TemplateStepRecord) {
    return this.prisma.pipelineTemplateStep.create({
      data: { templateId, ...data },
    });
  }

  async updateTemplateStep(stepId: string, data: Partial<TemplateStepRecord>) {
    return this.prisma.pipelineTemplateStep.update({
      where: { id: stepId },
      data,
    });
  }

  async deleteTemplateStep(stepId: string) {
    return this.prisma.pipelineTemplateStep.delete({ where: { id: stepId } });
  }

  async findPipelinesByProject(projectId: string) {
    return this.prisma.pipeline.findMany({
      where: { projectId },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPipelineById(pipelineId: string) {
    return this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { project: true, steps: { orderBy: { order: 'asc' } } },
    });
  }

  async findPipelineStepById(stepId: string) {
    return this.prisma.pipelineStep.findUnique({
      where: { id: stepId },
      include: { pipeline: { include: { project: true } } },
    });
  }

  async createPipeline(data: {
    projectId: string;
    templateId?: string;
    name: string;
    description?: string;
    steps: PipelineStepRecord[];
  }) {
    return this.prisma.pipeline.create({
      data: {
        projectId: data.projectId,
        templateId: data.templateId,
        name: data.name,
        description: data.description,
        steps: { create: data.steps },
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async updatePipeline(
    pipelineId: string,
    data: {
      name?: string;
      description?: string | null;
      status?: PipelineStatusValue;
    },
  ) {
    return this.prisma.pipeline.update({
      where: { id: pipelineId },
      data,
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async createPipelineStep(pipelineId: string, data: PipelineStepRecord) {
    return this.prisma.pipelineStep.create({ data: { pipelineId, ...data } });
  }

  async updatePipelineStep(stepId: string, data: Partial<PipelineStepRecord>) {
    return this.prisma.pipelineStep.update({ where: { id: stepId }, data });
  }

  async deletePipelineStep(stepId: string) {
    return this.prisma.pipelineStep.delete({ where: { id: stepId } });
  }
}

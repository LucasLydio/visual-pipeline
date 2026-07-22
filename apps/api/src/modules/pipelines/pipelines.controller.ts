import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { CreatePipelineDto } from './dto/create-pipeline.dto.js';
import { CreatePipelineStepDto } from './dto/create-pipeline-step.dto.js';
import { CreatePipelineTemplateDto } from './dto/create-pipeline-template.dto.js';
import { CreatePipelineTemplateStepDto } from './dto/create-pipeline-template-step.dto.js';
import { UpdatePipelineDto } from './dto/update-pipeline.dto.js';
import { UpdatePipelineStepDto } from './dto/update-pipeline-step.dto.js';
import { UpdatePipelineTemplateDto } from './dto/update-pipeline-template.dto.js';
import { UpdatePipelineTemplateStepDto } from './dto/update-pipeline-template-step.dto.js';
import { PipelinesService } from './pipelines.service.js';

@UseGuards(SessionAuthGuard)
@Controller()
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get('teams/:teamId/pipeline-templates')
  findTemplates(
    @Param('teamId') teamId: string,
    @Query('includeInactive') includeInactive: string | undefined,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.findTemplates(
      teamId,
      request.user!.id,
      includeInactive === 'true',
    );
  }

  @Post('teams/:teamId/pipeline-templates')
  createTemplate(
    @Param('teamId') teamId: string,
    @Body() dto: CreatePipelineTemplateDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.createTemplate(teamId, request.user!.id, dto);
  }

  @Get('pipeline-templates/:templateId')
  findTemplate(
    @Param('templateId') templateId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.findTemplateById(templateId, request.user!.id);
  }

  @Patch('pipeline-templates/:templateId')
  updateTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdatePipelineTemplateDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.updateTemplate(
      templateId,
      request.user!.id,
      dto,
    );
  }

  @Delete('pipeline-templates/:templateId')
  archiveTemplate(
    @Param('templateId') templateId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.updateTemplate(templateId, request.user!.id, {
      isActive: false,
    });
  }

  @Post('pipeline-templates/:templateId/steps')
  createTemplateStep(
    @Param('templateId') templateId: string,
    @Body() dto: CreatePipelineTemplateStepDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.createTemplateStep(
      templateId,
      request.user!.id,
      dto,
    );
  }

  @Patch('pipeline-template-steps/:stepId')
  updateTemplateStep(
    @Param('stepId') stepId: string,
    @Body() dto: UpdatePipelineTemplateStepDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.updateTemplateStep(
      stepId,
      request.user!.id,
      dto,
    );
  }

  @Delete('pipeline-template-steps/:stepId')
  deleteTemplateStep(
    @Param('stepId') stepId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.deleteTemplateStep(stepId, request.user!.id);
  }

  @Get('projects/:projectId/pipelines')
  findPipelines(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.findPipelines(projectId, request.user!.id);
  }

  @Post('projects/:projectId/pipelines')
  createPipeline(
    @Param('projectId') projectId: string,
    @Body() dto: CreatePipelineDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.createPipeline(
      projectId,
      request.user!.id,
      dto,
    );
  }

  @Get('pipelines/:pipelineId')
  findPipeline(
    @Param('pipelineId') pipelineId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.findPipelineById(pipelineId, request.user!.id);
  }

  @Patch('pipelines/:pipelineId')
  updatePipeline(
    @Param('pipelineId') pipelineId: string,
    @Body() dto: UpdatePipelineDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.updatePipeline(
      pipelineId,
      request.user!.id,
      dto,
    );
  }

  @Delete('pipelines/:pipelineId')
  archivePipeline(
    @Param('pipelineId') pipelineId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.archivePipeline(pipelineId, request.user!.id);
  }

  @Post('pipelines/:pipelineId/steps')
  createPipelineStep(
    @Param('pipelineId') pipelineId: string,
    @Body() dto: CreatePipelineStepDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.createPipelineStep(
      pipelineId,
      request.user!.id,
      dto,
    );
  }

  @Patch('pipeline-steps/:stepId')
  updatePipelineStep(
    @Param('stepId') stepId: string,
    @Body() dto: UpdatePipelineStepDto,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.updatePipelineStep(
      stepId,
      request.user!.id,
      dto,
    );
  }

  @Delete('pipeline-steps/:stepId')
  deletePipelineStep(
    @Param('stepId') stepId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.pipelinesService.deletePipelineStep(stepId, request.user!.id);
  }
}

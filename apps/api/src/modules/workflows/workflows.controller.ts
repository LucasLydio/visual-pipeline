import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { CompleteWorkflowRunDto } from './dto/complete-workflow-run.dto.js';
import { CompleteWorkflowStepDto } from './dto/complete-workflow-step.dto.js';
import { StartWorkflowRunDto } from './dto/start-workflow-run.dto.js';
import { WorkflowsService } from './workflows.service.js';

@Controller()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @UseGuards(SessionAuthGuard)
  @Get('projects/:projectId/workflow-setup')
  getSetup(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.workflowsService.getSetup(projectId, request.user!.id);
  }

  @UseGuards(SessionAuthGuard)
  @Post('projects/:projectId/workflow-setup/token')
  rotateToken(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.workflowsService.rotateToken(projectId, request.user!.id);
  }

  @Post('workflow-runs/github/start')
  startGitHubRun(
    @Headers('x-visual-pipeline-project-id') projectId: string | undefined,
    @Headers('x-visual-pipeline-token') token: string | undefined,
    @Body() dto: StartWorkflowRunDto,
  ) {
    return this.workflowsService.startGitHubRun(projectId, token, dto);
  }

  @Patch('workflow-runs/:runId/steps/:order/start')
  startStep(
    @Param('runId') runId: string,
    @Param('order') order: string,
    @Headers('x-visual-pipeline-project-id') projectId: string | undefined,
    @Headers('x-visual-pipeline-token') token: string | undefined,
  ) {
    return this.workflowsService.startStep(runId, order, projectId, token);
  }

  @Patch('workflow-runs/:runId/steps/:order/complete')
  completeStep(
    @Param('runId') runId: string,
    @Param('order') order: string,
    @Headers('x-visual-pipeline-project-id') projectId: string | undefined,
    @Headers('x-visual-pipeline-token') token: string | undefined,
    @Body() dto: CompleteWorkflowStepDto,
  ) {
    return this.workflowsService.completeStep(
      runId,
      order,
      projectId,
      token,
      dto,
    );
  }

  @Patch('workflow-runs/:runId/complete')
  completeRun(
    @Param('runId') runId: string,
    @Headers('x-visual-pipeline-project-id') projectId: string | undefined,
    @Headers('x-visual-pipeline-token') token: string | undefined,
    @Body() dto: CompleteWorkflowRunDto,
  ) {
    return this.workflowsService.completeRun(runId, projectId, token, dto);
  }
}

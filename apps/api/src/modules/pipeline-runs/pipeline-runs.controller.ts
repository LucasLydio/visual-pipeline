import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto.js';
import { PipelineRunsService } from './pipeline-runs.service.js';

@UseGuards(SessionAuthGuard)
@Controller()
export class PipelineRunsController {
  constructor(private readonly runsService: PipelineRunsService) {}

  @Post('pipelines/:pipelineId/runs')
  triggerManualRun(
    @Param('pipelineId') pipelineId: string,
    @Body() dto: CreatePipelineRunDto,
    @Req() request: RequestWithUser,
  ) {
    return this.runsService.triggerManualRun(pipelineId, request.user!.id, dto);
  }

  @Get('pipelines/:pipelineId/runs')
  findRunsByPipeline(
    @Param('pipelineId') pipelineId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.runsService.findRunsByPipeline(pipelineId, request.user!.id);
  }

  @Get('pipeline-runs/:runId')
  findRunById(@Param('runId') runId: string, @Req() request: RequestWithUser) {
    return this.runsService.findRunById(runId, request.user!.id);
  }

  @Get('pipeline-runs/:runId/status')
  findRunStatusById(
    @Param('runId') runId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.runsService.findRunStatusById(runId, request.user!.id);
  }

  @Patch('pipeline-runs/:runId/cancel')
  cancelRun(@Param('runId') runId: string, @Req() request: RequestWithUser) {
    return this.runsService.cancelRun(runId, request.user!.id);
  }
}

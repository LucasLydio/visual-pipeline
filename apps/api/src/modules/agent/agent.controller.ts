import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AgentTokenGuard } from './guards/agent-token.guard.js';
import { AgentService } from './agent.service.js';
import { CompleteAgentJobDto } from './dto/complete-agent-job.dto.js';
import { CompleteAgentStepDto } from './dto/complete-agent-step.dto.js';

@UseGuards(AgentTokenGuard)
@Controller('agent/jobs')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('claim')
  claimNextJob() {
    return this.agentService.claimNextJob();
  }

  @Patch(':runId/steps/:stepRunId/start')
  startStep(
    @Param('runId') runId: string,
    @Param('stepRunId') stepRunId: string,
  ) {
    return this.agentService.startStep(runId, stepRunId);
  }

  @Patch(':runId/steps/:stepRunId/complete')
  completeStep(
    @Param('runId') runId: string,
    @Param('stepRunId') stepRunId: string,
    @Body() dto: CompleteAgentStepDto,
  ) {
    return this.agentService.completeStep(runId, stepRunId, dto);
  }

  @Patch(':runId/complete')
  completeJob(@Param('runId') runId: string, @Body() dto: CompleteAgentJobDto) {
    return this.agentService.completeJob(runId, dto);
  }
}

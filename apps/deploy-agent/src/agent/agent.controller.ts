import { Controller, Get, Post } from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { AgentRunnerService } from './agent-runner.service';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly config: AgentConfigService,
    private readonly runner: AgentRunnerService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      apiBaseUrl: this.config.apiBaseUrl,
      configured: this.config.isConfigured,
    };
  }

  @Post('jobs/process-next')
  processNextJob() {
    return this.runner.processNextJob();
  }
}

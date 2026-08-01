import { Module } from '@nestjs/common';
import { AgentApiClientService } from './agent-api-client.service';
import { AgentConfigService } from './agent-config.service';
import { AgentController } from './agent.controller';
import { AgentRunnerService } from './agent-runner.service';

@Module({
  controllers: [AgentController],
  providers: [AgentApiClientService, AgentConfigService, AgentRunnerService],
})
export class AgentModule {}

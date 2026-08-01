import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller.js';
import { AgentRepository } from './agent.repository.js';
import { AgentService } from './agent.service.js';
import { AgentTokenGuard } from './guards/agent-token.guard.js';

@Module({
  controllers: [AgentController],
  providers: [AgentRepository, AgentService, AgentTokenGuard],
})
export class AgentModule {}

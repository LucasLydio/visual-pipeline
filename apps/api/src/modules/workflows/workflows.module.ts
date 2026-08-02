import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TeamsModule } from '../teams/teams.module.js';
import { WorkflowTokenService } from './workflow-token.service.js';
import { WorkflowYamlService } from './workflow-yaml.service.js';
import { WorkflowsController } from './workflows.controller.js';
import { WorkflowsRepository } from './workflows.repository.js';
import { WorkflowsService } from './workflows.service.js';

@Module({
  imports: [AuthModule, TeamsModule],
  controllers: [WorkflowsController],
  providers: [
    WorkflowTokenService,
    WorkflowYamlService,
    WorkflowsRepository,
    WorkflowsService,
  ],
})
export class WorkflowsModule {}

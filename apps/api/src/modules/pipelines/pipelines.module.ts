import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TeamsModule } from '../teams/teams.module.js';
import { PipelineStepsPolicy } from './pipeline-steps.policy.js';
import { PipelinesController } from './pipelines.controller.js';
import { PipelinesRepository } from './pipelines.repository.js';
import { PipelinesService } from './pipelines.service.js';

@Module({
  imports: [AuthModule, TeamsModule],
  controllers: [PipelinesController],
  providers: [PipelineStepsPolicy, PipelinesRepository, PipelinesService],
  exports: [PipelinesRepository, PipelinesService],
})
export class PipelinesModule {}

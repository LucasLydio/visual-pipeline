import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TeamsModule } from '../teams/teams.module.js';
import { PipelineRunsController } from './pipeline-runs.controller.js';
import { PipelineRunsRepository } from './pipeline-runs.repository.js';
import { PipelineRunsService } from './pipeline-runs.service.js';

@Module({
  imports: [AuthModule, TeamsModule],
  controllers: [PipelineRunsController],
  providers: [PipelineRunsRepository, PipelineRunsService],
  exports: [PipelineRunsService],
})
export class PipelineRunsModule {}

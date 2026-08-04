import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SourceControlController } from './source-control.controller.js';
import { SourceControlRepository } from './source-control.repository.js';
import { SourceControlService } from './source-control.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SourceControlController],
  providers: [SourceControlRepository, SourceControlService],
})
export class SourceControlModule {}

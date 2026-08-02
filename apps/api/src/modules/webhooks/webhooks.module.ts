import { Module } from '@nestjs/common';
import { PipelineRunsModule } from '../pipeline-runs/pipeline-runs.module.js';
import { GithubSignatureService } from './github-signature.service.js';
import { GithubWebhookService } from './github-webhook.service.js';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksRepository } from './webhooks.repository.js';

@Module({
  imports: [PipelineRunsModule],
  controllers: [WebhooksController],
  providers: [GithubSignatureService, GithubWebhookService, WebhooksRepository],
})
export class WebhooksModule {}

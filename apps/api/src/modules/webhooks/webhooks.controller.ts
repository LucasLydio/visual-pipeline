import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { GithubWebhookService } from './github-webhook.service.js';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly githubWebhookService: GithubWebhookService) {}

  @Post('github')
  handleGithubWebhook(
    @Headers('x-github-event') event: string | undefined,
    @Headers('x-github-delivery') deliveryId: string | undefined,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() payload: unknown,
    @Req() request: RawBodyRequest,
  ) {
    return this.githubWebhookService.handleWebhook({
      event,
      deliveryId,
      signature,
      rawBody: request.rawBody,
      payload,
    });
  }
}

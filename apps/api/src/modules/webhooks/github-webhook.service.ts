import { BadRequestException, Injectable } from '@nestjs/common';
import { PipelineRunsRepository } from '../pipeline-runs/pipeline-runs.repository.js';
import { GithubSignatureService } from './github-signature.service.js';
import { WebhooksRepository } from './webhooks.repository.js';
import type { GitHubPushPayload, WebhookResult } from './webhooks.types.js';

@Injectable()
export class GithubWebhookService {
  constructor(
    private readonly signatureService: GithubSignatureService,
    private readonly webhooksRepository: WebhooksRepository,
    private readonly runsRepository: PipelineRunsRepository,
  ) {}

  async handleWebhook(input: {
    event?: string;
    deliveryId?: string;
    signature?: string;
    rawBody?: Buffer;
    payload: unknown;
  }): Promise<WebhookResult> {
    this.signatureService.assertValid(input.rawBody, input.signature);
    const event = this.requiredHeader(input.event, 'GitHub event');
    const deliveryId = this.requiredHeader(
      input.deliveryId,
      'GitHub delivery id',
    );

    const existingDelivery =
      await this.webhooksRepository.findDelivery(deliveryId);
    if (existingDelivery) {
      return {
        status: 'ignored',
        message: 'Duplicate GitHub delivery ignored.',
      };
    }

    await this.webhooksRepository.createDelivery(deliveryId, event);

    try {
      return await this.processDelivery(deliveryId, event, input.payload);
    } catch (error) {
      await this.webhooksRepository.updateDelivery(deliveryId, {
        status: 'FAILED',
        message:
          error instanceof Error ? error.message : 'Webhook processing failed.',
      });
      throw error;
    }
  }

  private async processDelivery(
    deliveryId: string,
    event: string,
    payload: unknown,
  ): Promise<WebhookResult> {
    if (event !== 'push') {
      return this.ignore(deliveryId, `Unsupported GitHub event: ${event}.`);
    }

    const pushPayload = payload as GitHubPushPayload;
    const branch = this.branchFromRef(pushPayload.ref);
    const commitSha = this.commitSha(pushPayload.after);
    const repository = pushPayload.repository;

    if (!repository)
      return this.ignore(deliveryId, 'GitHub repository payload missing.');
    if (!commitSha)
      return this.ignore(
        deliveryId,
        'Push deleted a branch or has no commit SHA.',
      );

    const repositoryId =
      repository.id === undefined ? null : String(repository.id);
    const repositoryUrls = this.repositoryUrls(repository);

    if (!repositoryId && repositoryUrls.length === 0) {
      return this.ignore(
        deliveryId,
        'GitHub repository identity payload missing.',
      );
    }

    const project = await this.webhooksRepository.findGitHubProject(
      repositoryId,
      repositoryUrls,
    );

    if (!project)
      return this.ignore(
        deliveryId,
        'No active synced project matched the webhook.',
      );

    const pipeline = project.pipelines[0];
    if (!pipeline)
      return this.ignore(deliveryId, 'Matched project has no active pipeline.');

    const run = await this.runsRepository.createRun({
      pipelineId: pipeline.id,
      triggeredById: null,
      trigger: 'GITHUB_WEBHOOK',
      branch,
      commitSha,
      steps: pipeline.steps.map((step) => ({
        pipelineStepId: step.id,
        name: step.name,
        order: step.order,
        command: step.command,
        isRequired: step.isRequired,
      })),
    });

    await this.webhooksRepository.updateDelivery(deliveryId, {
      status: 'PROCESSED',
      message: 'Pipeline run queued from GitHub push.',
      projectId: project.id,
      pipelineRunId: run.id,
    });

    return {
      status: 'processed',
      message: 'Pipeline run queued.',
      runId: run.id,
    };
  }

  private async ignore(
    deliveryId: string,
    message: string,
  ): Promise<WebhookResult> {
    await this.webhooksRepository.updateDelivery(deliveryId, {
      status: 'IGNORED',
      message,
    });
    return { status: 'ignored', message };
  }

  private requiredHeader(value: string | undefined, label: string): string {
    const normalized = value?.trim();
    if (!normalized) throw new BadRequestException(`${label} is required.`);
    return normalized;
  }

  private branchFromRef(ref?: string): string {
    const branch = ref?.startsWith('refs/heads/')
      ? ref.slice('refs/heads/'.length)
      : ref;
    if (!branch || branch.length > 120) {
      throw new BadRequestException('GitHub push branch is invalid.');
    }

    return branch;
  }

  private commitSha(after?: string): string | undefined {
    const normalized = after?.trim();
    if (!normalized || /^0+$/.test(normalized)) return undefined;
    if (!/^[a-f0-9]{7,64}$/i.test(normalized)) {
      throw new BadRequestException('GitHub commit SHA is invalid.');
    }

    return normalized;
  }

  private repositoryUrls(
    repository: NonNullable<GitHubPushPayload['repository']>,
  ): string[] {
    return [
      repository.html_url,
      repository.clone_url,
      repository.ssh_url,
    ].filter((value): value is string => Boolean(value));
  }
}

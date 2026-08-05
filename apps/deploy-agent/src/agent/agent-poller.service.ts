import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { AgentRunnerService } from './agent-runner.service';

@Injectable()
export class AgentPollerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentPollerService.name);
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private readonly config: AgentConfigService,
    private readonly runner: AgentRunnerService,
  ) {}

  onModuleInit(): void {
    if (!this.config.pollEnabled) {
      this.logger.log('Agent polling is disabled.');
      return;
    }

    if (!this.config.isConfigured) {
      this.logger.warn(
        'Agent polling is disabled because AGENT_SHARED_TOKEN is missing.',
      );
      return;
    }

    this.logger.log(`Agent polling every ${this.config.pollIntervalMs}ms.`);
    this.timer = setInterval(
      () => void this.tick(),
      this.config.pollIntervalMs,
    );
    void this.tick();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const result = await this.runner.processNextJob();
      if (result.processed) this.logger.log(result.message);
    } catch (error) {
      this.logger.error(
        'Agent polling failed.',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.processing = false;
    }
  }
}

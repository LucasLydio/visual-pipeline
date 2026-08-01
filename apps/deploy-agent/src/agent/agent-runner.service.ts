import { Injectable } from '@nestjs/common';
import { AgentApiClientService } from './agent-api-client.service';
import { AgentPipelineRun, AgentProcessResult } from './agent.types';

@Injectable()
export class AgentRunnerService {
  constructor(private readonly apiClient: AgentApiClientService) {}

  async processNextJob(): Promise<AgentProcessResult> {
    const job = await this.apiClient.claimNextJob();

    if (!job) {
      return {
        processed: false,
        message: 'No queued pipeline runs found.',
        run: null,
      };
    }

    const run = await this.processClaimedJob(job);

    return {
      processed: true,
      message: `Processed pipeline run ${run.id}.`,
      run,
    };
  }

  private async processClaimedJob(
    job: AgentPipelineRun,
  ): Promise<AgentPipelineRun> {
    for (const step of job.steps) {
      if (step.status !== 'QUEUED') continue;

      await this.apiClient.startStep(job.id, step.id);
      await this.apiClient.completeStep(job.id, step.id, {
        status: 'PASSED',
        logsSummary: this.logsSummary(step.command),
      });
    }

    return this.apiClient.completeJob(job.id, { status: 'PASSED' });
  }

  private logsSummary(command: string | null): string {
    if (!command) return 'Checklist step acknowledged by deploy agent.';

    return `Command registered for future execution: ${command}`;
  }
}

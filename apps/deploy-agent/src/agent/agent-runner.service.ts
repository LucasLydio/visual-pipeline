import { Injectable } from '@nestjs/common';
import { AgentApiClientService } from './agent-api-client.service';
import { AgentConfigService } from './agent-config.service';
import { LocalCommandExecutorService } from './local-command-executor.service';
import { AgentPipelineRun, AgentProcessResult } from './agent.types';

@Injectable()
export class AgentRunnerService {
  constructor(
    private readonly apiClient: AgentApiClientService,
    private readonly config: AgentConfigService,
    private readonly commandExecutor: LocalCommandExecutorService,
  ) {}

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
    if (!this.config.canExecuteLocalProjects) {
      return this.apiClient.completeJob(job.id, {
        status: 'FAILED',
        failureReason: 'LOCAL_AGENT_WORKSPACE_ROOT is not configured.',
      });
    }

    for (const step of job.steps) {
      if (step.status !== 'QUEUED') continue;

      await this.apiClient.startStep(job.id, step.id);
      if (!step.command) {
        await this.apiClient.completeStep(job.id, step.id, {
          status: 'PASSED',
          logsSummary: 'Checklist step acknowledged by local agent.',
        });
        continue;
      }

      const result = await this.commandExecutor.execute(
        step.command,
        job.pipeline.project.slug,
        (logsSummary) => {
          void this.apiClient
            .updateStepLogs(job.id, step.id, logsSummary)
            .catch(() => undefined);
        },
      );
      await this.apiClient.completeStep(job.id, step.id, {
        status: result.status,
        logsSummary: result.logsSummary,
      });

      if (result.status === 'FAILED' && step.isRequired) {
        return { ...job, status: 'FAILED' };
      }
    }

    return this.apiClient.completeJob(job.id, { status: 'PASSED' });
  }
}

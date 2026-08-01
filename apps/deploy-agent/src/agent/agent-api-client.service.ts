import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { AgentPipelineRun } from './agent.types';

type JsonBody = Record<string, unknown>;

@Injectable()
export class AgentApiClientService {
  constructor(private readonly config: AgentConfigService) {}

  claimNextJob(): Promise<AgentPipelineRun | null> {
    return this.request<AgentPipelineRun | null>('/agent/jobs/claim', {
      method: 'POST',
    });
  }

  startStep(runId: string, stepRunId: string): Promise<unknown> {
    return this.request(`/agent/jobs/${runId}/steps/${stepRunId}/start`, {
      method: 'PATCH',
    });
  }

  completeStep(
    runId: string,
    stepRunId: string,
    body: JsonBody,
  ): Promise<unknown> {
    return this.request(`/agent/jobs/${runId}/steps/${stepRunId}/complete`, {
      method: 'PATCH',
      body,
    });
  }

  completeJob(runId: string, body: JsonBody): Promise<AgentPipelineRun> {
    return this.request<AgentPipelineRun>(`/agent/jobs/${runId}/complete`, {
      method: 'PATCH',
      body,
    });
  }

  private async request<T>(
    path: string,
    options: { method: string; body?: JsonBody },
  ): Promise<T> {
    if (!this.config.isConfigured) {
      throw new ServiceUnavailableException(
        'AGENT_SHARED_TOKEN is not configured.',
      );
    }

    const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
      method: options.method,
      headers: {
        'content-type': 'application/json',
        'x-agent-token': this.config.sharedToken,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(await this.errorMessage(response));
    }

    return (await response.json()) as T;
  }

  private async errorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { message?: string | string[] };
      const message = body.message;

      return Array.isArray(message)
        ? message.join(', ')
        : (message ?? response.statusText);
    } catch {
      return response.statusText;
    }
  }
}

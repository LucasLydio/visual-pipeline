import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentConfigService {
  readonly apiBaseUrl = this.read(
    'VISUAL_PIPELINE_API_URL',
    'http://localhost:3000',
  );
  readonly sharedToken = this.read('AGENT_SHARED_TOKEN', '');
  readonly workspaceRoot = this.read('LOCAL_AGENT_WORKSPACE_ROOT', '');
  readonly stepTimeoutMs = this.readPositiveInteger(
    'LOCAL_AGENT_STEP_TIMEOUT_MS',
    10 * 60 * 1000,
  );
  readonly pollEnabled = this.readBoolean('AGENT_POLL_ENABLED', false);
  readonly pollIntervalMs = this.readPositiveInteger(
    'AGENT_POLL_INTERVAL_MS',
    5_000,
  );

  get isConfigured(): boolean {
    return Boolean(this.sharedToken);
  }

  get canExecuteLocalProjects(): boolean {
    return Boolean(this.workspaceRoot);
  }

  private read(key: string, fallback: string): string {
    return process.env[key]?.trim() || fallback;
  }

  private readPositiveInteger(key: string, fallback: number): number {
    const value = Number(process.env[key]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  private readBoolean(key: string, fallback: boolean): boolean {
    const value = process.env[key]?.trim().toLowerCase();
    if (value === undefined) return fallback;

    return ['1', 'true', 'yes', 'on'].includes(value);
  }
}

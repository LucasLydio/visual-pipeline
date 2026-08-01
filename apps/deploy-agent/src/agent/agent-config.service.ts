import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentConfigService {
  readonly apiBaseUrl = this.read(
    'VISUAL_PIPELINE_API_URL',
    'http://localhost:3000',
  );
  readonly sharedToken = this.read('AGENT_SHARED_TOKEN', '');

  get isConfigured(): boolean {
    return Boolean(this.sharedToken);
  }

  private read(key: string, fallback: string): string {
    return process.env[key]?.trim() || fallback;
  }
}

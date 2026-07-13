import type { PipelineStatus } from './pipeline-status';

export interface PipelineEvent {
  pipelineId: string;
  stepId: string;
  stepName: string;
  status: PipelineStatus;
  message?: string;
  occurredAt: string;
}

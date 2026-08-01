export type PipelineRunStatusValue =
  'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

export type PipelineRunTriggerValue =
  'MANUAL' | 'GITHUB_WEBHOOK' | 'AGENT' | 'SCHEDULED';

export type PipelineStepRunStatusValue =
  'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

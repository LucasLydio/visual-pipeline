export type AgentJobFinalStatus = 'PASSED' | 'FAILED' | 'CANCELED';
export type AgentStepFinalStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

export const AGENT_JOB_FINAL_STATUSES = new Set<AgentJobFinalStatus>([
  'PASSED',
  'FAILED',
  'CANCELED',
]);

export const AGENT_STEP_FINAL_STATUSES = new Set<AgentStepFinalStatus>([
  'PASSED',
  'FAILED',
  'SKIPPED',
  'CANCELED',
]);

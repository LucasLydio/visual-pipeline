export const WORKFLOW_RUN_FINAL_STATUSES = new Set([
  'PASSED',
  'FAILED',
  'CANCELED',
] as const);

export const WORKFLOW_STEP_FINAL_STATUSES = new Set([
  'PASSED',
  'FAILED',
  'SKIPPED',
  'CANCELED',
] as const);

export type WorkflowRunFinalStatus =
  typeof WORKFLOW_RUN_FINAL_STATUSES extends Set<infer T> ? T : never;

export type WorkflowStepFinalStatus =
  typeof WORKFLOW_STEP_FINAL_STATUSES extends Set<infer T> ? T : never;

export interface WorkflowSetupResponse {
  readonly projectId: string;
  readonly enabled: boolean;
  readonly secretName: string;
  readonly workflowPath: string;
  readonly apiBaseUrl: string;
  readonly workflowYaml: string;
  readonly workflowToken?: string;
}

export interface WorkflowRunStartResponse {
  readonly runId: string;
  readonly message: string;
}

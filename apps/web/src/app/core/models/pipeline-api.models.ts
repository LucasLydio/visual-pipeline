export type PipelineStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type PipelineRunStatus = 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';
export type PipelineRunTrigger =
  'MANUAL' | 'GITHUB_WEBHOOK' | 'GITHUB_ACTIONS' | 'AGENT' | 'SCHEDULED';
export type PipelineStepRunStatus =
  'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

export interface PipelineTemplateStep {
  readonly id: string;
  readonly templateId: string;
  readonly name: string;
  readonly description: string | null;
  readonly order: number;
  readonly command: string | null;
  readonly isRequired: boolean;
  readonly isEnabled: boolean;
}

export interface PipelineTemplate {
  readonly id: string;
  readonly teamId: string;
  readonly createdById: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly steps: readonly PipelineTemplateStep[];
}

export interface PipelineStep {
  readonly id: string;
  readonly pipelineId: string;
  readonly name: string;
  readonly order: number;
  readonly command: string | null;
  readonly isRequired: boolean;
  readonly isEnabled: boolean;
}

export interface ProjectPipeline {
  readonly id: string;
  readonly projectId: string;
  readonly templateId: string | null;
  readonly name: string;
  readonly description: string | null;
  readonly status: PipelineStatus;
  readonly steps: readonly PipelineStep[];
}

export interface PipelineRunActor {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
}

export interface PipelineStepRun {
  readonly id: string;
  readonly pipelineRunId: string;
  readonly pipelineStepId: string | null;
  readonly name: string;
  readonly order: number;
  readonly command: string | null;
  readonly isRequired: boolean;
  readonly status: PipelineStepRunStatus;
  readonly logsSummary: string | null;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PipelineRun {
  readonly id: string;
  readonly pipelineId: string;
  readonly triggeredById: string | null;
  readonly status: PipelineRunStatus;
  readonly trigger: PipelineRunTrigger;
  readonly branch: string;
  readonly commitSha: string | null;
  readonly externalRunId: string | null;
  readonly externalRunUrl: string | null;
  readonly runnerName: string | null;
  readonly failureReason: string | null;
  readonly queuedAt: string;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly triggeredBy: PipelineRunActor | null;
  readonly steps: readonly PipelineStepRun[];
}

export interface PipelineRunStepStatusSnapshot {
  readonly id: string;
  readonly status: PipelineStepRunStatus;
  readonly logsSummary: string | null;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly updatedAt: string;
}

export interface PipelineRunStatusSnapshot {
  readonly id: string;
  readonly pipelineId: string;
  readonly status: PipelineRunStatus;
  readonly failureReason: string | null;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly updatedAt: string;
  readonly steps: readonly PipelineRunStepStatusSnapshot[];
}

export interface CreatePipelineRunRequest {
  readonly branch?: string;
  readonly commitSha?: string;
}

export interface PipelineTemplateStepRequest {
  readonly name: string;
  readonly description?: string | null;
  readonly order?: number;
  readonly command?: string | null;
  readonly isRequired?: boolean;
  readonly isEnabled?: boolean;
}

export interface PipelineStepRequest {
  readonly name: string;
  readonly order?: number;
  readonly command?: string | null;
  readonly isRequired?: boolean;
  readonly isEnabled?: boolean;
}

export interface CreatePipelineTemplateRequest {
  readonly name: string;
  readonly description?: string | null;
  readonly steps?: readonly PipelineTemplateStepRequest[];
}

export interface UpdatePipelineTemplateRequest {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}

export interface CreatePipelineRequest {
  readonly templateId?: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly steps?: readonly PipelineStepRequest[];
}

export interface UpdatePipelineRequest {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: PipelineStatus;
}

export interface WorkflowSetup {
  readonly projectId: string;
  readonly enabled: boolean;
  readonly secretName: string;
  readonly workflowPath: string;
  readonly apiBaseUrl: string;
  readonly workflowYaml: string;
  readonly workflowToken?: string;
}

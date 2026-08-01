export type PipelineRunStatus =
  'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

export type PipelineStepRunStatus =
  'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'CANCELED';

export interface AgentPipelineStepRun {
  id: string;
  name: string;
  order: number;
  command: string | null;
  isRequired: boolean;
  status: PipelineStepRunStatus;
}

export interface AgentPipelineRun {
  id: string;
  status: PipelineRunStatus;
  branch: string;
  commitSha: string | null;
  steps: AgentPipelineStepRun[];
  pipeline: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
    };
  };
}

export interface AgentProcessResult {
  processed: boolean;
  message: string;
  run: AgentPipelineRun | null;
}

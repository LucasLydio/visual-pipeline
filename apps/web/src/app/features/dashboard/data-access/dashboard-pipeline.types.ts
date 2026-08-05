import {
  PipelineRun,
  PipelineStep,
  PipelineTemplate,
  PipelineTemplateStep,
  ProjectPipeline,
  WorkflowSetup,
} from '../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../core/models/team.models';

export interface PipelineContext {
  readonly project: WorkspaceProject | null;
  readonly teamId: string | null;
}

export interface PipelineState {
  readonly loading: boolean;
  readonly templates: readonly PipelineTemplate[];
  readonly pipelines: readonly ProjectPipeline[];
  readonly error: string | null;
}

export interface PipelineRunsState {
  readonly loading: boolean;
  readonly runs: readonly PipelineRun[];
  readonly error: string | null;
}

export interface WorkflowSetupState {
  readonly loading: boolean;
  readonly setup: WorkflowSetup | null;
  readonly error: string | null;
}

export type PipelineStepTarget =
  | { readonly type: 'pipeline'; readonly pipelineId: string; readonly step?: PipelineStep }
  | {
      readonly type: 'template';
      readonly templateId: string;
      readonly step?: PipelineTemplateStep;
    };

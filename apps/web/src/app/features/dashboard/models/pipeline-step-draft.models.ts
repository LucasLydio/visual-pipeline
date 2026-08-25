import {
  CreatePipelineRequest,
  UpdatePipelineRequest,
} from '../../../core/models/pipeline-api.models';

export interface PipelineStepDraft {
  readonly clientId: string;
  readonly stepId?: string;
  readonly name: string;
  readonly command: string;
  readonly order: number;
  readonly isRequired: boolean;
  readonly isEnabled: boolean;
}

export interface PipelineDialogSave {
  readonly pipeline: CreatePipelineRequest | UpdatePipelineRequest;
  readonly steps?: readonly PipelineStepDraft[];
}

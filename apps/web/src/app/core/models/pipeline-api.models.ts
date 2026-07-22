export type PipelineStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

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

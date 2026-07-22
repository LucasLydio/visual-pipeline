export type PipelineStatusValue = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface PublicPipelineTemplateStep {
  id: string;
  templateId: string;
  name: string;
  description: string | null;
  order: number;
  command: string | null;
  isRequired: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicPipelineTemplate {
  id: string;
  teamId: string;
  createdById: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  steps: PublicPipelineTemplateStep[];
}

export interface PublicPipelineStep {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  command: string | null;
  isRequired: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicPipeline {
  id: string;
  projectId: string;
  templateId: string | null;
  name: string;
  description: string | null;
  status: PipelineStatusValue;
  createdAt: Date;
  updatedAt: Date;
  steps: PublicPipelineStep[];
}

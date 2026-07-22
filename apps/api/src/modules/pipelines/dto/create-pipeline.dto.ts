import { CreatePipelineStepDto } from './create-pipeline-step.dto.js';

export class CreatePipelineDto {
  templateId?: string;
  name?: string;
  description?: string;
  steps?: CreatePipelineStepDto[];
}

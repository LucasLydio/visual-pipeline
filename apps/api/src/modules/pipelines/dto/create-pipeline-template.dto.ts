import { CreatePipelineTemplateStepDto } from './create-pipeline-template-step.dto.js';

export class CreatePipelineTemplateDto {
  name?: string;
  description?: string;
  steps?: CreatePipelineTemplateStepDto[];
}

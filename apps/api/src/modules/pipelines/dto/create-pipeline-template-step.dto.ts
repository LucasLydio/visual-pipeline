export class CreatePipelineTemplateStepDto {
  name?: string;
  description?: string;
  order?: number;
  command?: string;
  isRequired?: boolean;
  isEnabled?: boolean;
}

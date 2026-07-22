export class UpdatePipelineTemplateStepDto {
  name?: string;
  description?: string | null;
  order?: number;
  command?: string | null;
  isRequired?: boolean;
  isEnabled?: boolean;
}

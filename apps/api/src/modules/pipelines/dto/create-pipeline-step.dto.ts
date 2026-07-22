export class CreatePipelineStepDto {
  name?: string;
  order?: number;
  command?: string;
  isRequired?: boolean;
  isEnabled?: boolean;
}

export class UpdatePipelineStepDto {
  name?: string;
  order?: number;
  command?: string | null;
  isRequired?: boolean;
  isEnabled?: boolean;
}

import type { PipelineStatusValue } from '../pipelines.types.js';

export class UpdatePipelineDto {
  name?: string;
  description?: string | null;
  status?: PipelineStatusValue;
}

import type {
  ProjectExecutionModeValue,
  ProjectStatusValue,
  SourceProviderValue,
} from '../projects.types.js';

export class UpdateProjectDto {
  name?: string;
  slug?: string;
  provider?: SourceProviderValue;
  repositoryUrl?: string;
  repositoryId?: string | null;
  defaultBranch?: string;
  executionMode?: ProjectExecutionModeValue;
  status?: ProjectStatusValue;
}

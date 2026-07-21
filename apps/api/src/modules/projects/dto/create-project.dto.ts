import type { SourceProviderValue } from '../projects.types.js';

export class CreateProjectDto {
  name!: string;
  slug?: string;
  provider!: SourceProviderValue;
  repositoryUrl!: string;
  repositoryId?: string;
  defaultBranch?: string;
}

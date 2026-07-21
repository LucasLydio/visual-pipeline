export type SourceProviderValue = 'GITHUB' | 'GITLAB' | 'BITBUCKET';
export type ProjectStatusValue = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface PublicProject {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  provider: SourceProviderValue;
  repositoryUrl: string;
  repositoryId: string | null;
  defaultBranch: string;
  status: ProjectStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

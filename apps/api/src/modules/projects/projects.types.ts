export type SourceProviderValue = 'GITHUB' | 'GITLAB' | 'BITBUCKET';
export type ProjectStatusValue = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type ProjectExecutionModeValue =
  'GITHUB_ACTIONS' | 'LOCAL_AGENT' | 'MANUAL';

export interface PublicProject {
  id: string;
  teamId: string;
  ownerId: string | null;
  name: string;
  slug: string;
  provider: SourceProviderValue;
  repositoryUrl: string;
  repositoryId: string | null;
  defaultBranch: string;
  executionMode: ProjectExecutionModeValue;
  status: ProjectStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

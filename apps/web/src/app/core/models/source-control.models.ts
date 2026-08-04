export interface GitHubRepositoryOption {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly repositoryUrl: string;
  readonly cloneUrl: string;
  readonly sshUrl: string;
  readonly defaultBranch: string;
  readonly updatedAt: string;
}

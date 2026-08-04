import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuthTokenVaultService } from '../auth/oauth-token-vault.service.js';
import { SourceControlRepository } from './source-control.repository.js';
import type { GitHubRepositoryOption } from './source-control.types.js';

interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  updated_at: string;
}

@Injectable()
export class SourceControlService {
  constructor(
    private readonly repository: SourceControlRepository,
    private readonly oauthTokenVault: OAuthTokenVaultService,
  ) {}

  async listGitHubRepositories(
    userId: string,
  ): Promise<GitHubRepositoryOption[]> {
    const account = await this.repository.findGitHubAccount(userId);

    if (!account?.accessTokenSecret) {
      throw new UnauthorizedException(
        'Reconnect GitHub to select repositories.',
      );
    }

    const accessToken = this.oauthTokenVault.decrypt(account.accessTokenSecret);
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'visual-pipeline-api',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedException(
        'Reconnect GitHub to refresh repository access.',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Could not load GitHub repositories.',
      );
    }

    const repositories = (await response.json()) as GitHubRepositoryResponse[];

    return repositories.map((repository) => ({
      id: String(repository.id),
      name: repository.name,
      fullName: repository.full_name,
      private: repository.private,
      repositoryUrl: repository.html_url,
      cloneUrl: repository.clone_url,
      sshUrl: repository.ssh_url,
      defaultBranch: repository.default_branch,
      updatedAt: repository.updated_at,
    }));
  }
}

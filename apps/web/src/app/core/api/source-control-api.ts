import { Observable } from 'rxjs';
import { GitHubRepositoryOption } from '../models/source-control.models';

export abstract class SourceControlApi {
  abstract listGitHubRepositories(): Observable<readonly GitHubRepositoryOption[]>;
}

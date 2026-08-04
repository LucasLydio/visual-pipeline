import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GitHubRepositoryOption } from '../models/source-control.models';
import { AuthSessionService } from '../services/auth-session.service';
import { SourceControlApi } from './source-control-api';

@Injectable()
export class HttpSourceControlApiService implements SourceControlApi {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);
  private readonly baseUrl = environment.apiBaseUrl;

  listGitHubRepositories(): Observable<readonly GitHubRepositoryOption[]> {
    return this.http.get<readonly GitHubRepositoryOption[]>(
      `${this.baseUrl}/source-control/github/repositories`,
      { headers: this.authHeaders() },
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.authSession.getSession()?.accessToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  AddTeamMemberRequest,
  CreateProjectRequest,
  CreateTeamRequest,
  UpdateTeamMemberRequest,
  WorkspaceMember,
  WorkspaceOverview,
  WorkspaceProject,
  WorkspaceTeam,
} from '../models/team.models';
import { AuthSessionService } from '../services/auth-session.service';
import { TeamApi } from './team-api';
import { environment } from '../../../environments/environment';

interface ApiWorkspaceMember extends Omit<WorkspaceMember, 'name' | 'email'> {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

interface ApiWorkspaceOverview extends Omit<WorkspaceOverview, 'members'> {
  members: readonly ApiWorkspaceMember[];
}

@Injectable()
export class HttpTeamApiService implements TeamApi {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);
  private readonly baseUrl = environment.apiBaseUrl;

  getWorkspaceOverview(teamId?: string): Observable<WorkspaceOverview> {
    const params = teamId ? new HttpParams().set('teamId', teamId) : undefined;

    return this.http
      .get<ApiWorkspaceOverview>(`${this.baseUrl}/workspace/dashboard`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(map((overview) => this.toWorkspaceOverview(overview)));
  }

  createTeam(dto: CreateTeamRequest): Observable<WorkspaceTeam> {
    return this.http.post<WorkspaceTeam>(`${this.baseUrl}/teams`, dto, {
      headers: this.authHeaders(),
    });
  }

  addMember(teamId: string, dto: AddTeamMemberRequest): Observable<WorkspaceMember> {
    return this.http
      .post<ApiWorkspaceMember>(`${this.baseUrl}/teams/${teamId}/members`, dto, {
        headers: this.authHeaders(),
      })
      .pipe(map((member) => this.toWorkspaceMember(member)));
  }

  updateMember(
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberRequest,
  ): Observable<WorkspaceMember> {
    return this.http
      .patch<ApiWorkspaceMember>(`${this.baseUrl}/teams/${teamId}/members/${memberId}`, dto, {
        headers: this.authHeaders(),
      })
      .pipe(map((member) => this.toWorkspaceMember(member)));
  }

  removeMember(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teams/${teamId}/members/${memberId}`, {
      headers: this.authHeaders(),
    });
  }

  createProject(teamId: string, dto: CreateProjectRequest): Observable<WorkspaceProject> {
    return this.http.post<WorkspaceProject>(`${this.baseUrl}/teams/${teamId}/projects`, dto, {
      headers: this.authHeaders(),
    });
  }

  archiveProject(projectId: string): Observable<WorkspaceProject> {
    return this.http.delete<WorkspaceProject>(`${this.baseUrl}/projects/${projectId}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authSession.getSession()?.accessToken;

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private toWorkspaceOverview(overview: ApiWorkspaceOverview): WorkspaceOverview {
    return {
      ...overview,
      members: overview.members.map((member) => this.toWorkspaceMember(member)),
    };
  }

  private toWorkspaceMember(member: ApiWorkspaceMember): WorkspaceMember {
    return {
      id: member.id,
      teamId: member.teamId,
      userId: member.userId,
      role: member.role,
      title: member.title,
      name: member.user.displayName,
      email: member.user.email,
    };
  }
}

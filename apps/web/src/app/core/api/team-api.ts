import { Observable } from 'rxjs';

import {
  AddTeamMemberRequest,
  CreateProjectRequest,
  CreateTeamRequest,
  UpdateProjectRequest,
  UpdateTeamMemberRequest,
  WorkspaceMember,
  WorkspaceOverview,
  WorkspaceProject,
  WorkspaceTeam,
} from '../models/team.models';

export abstract class TeamApi {
  abstract getWorkspaceOverview(teamId?: string): Observable<WorkspaceOverview>;
  abstract createTeam(dto: CreateTeamRequest): Observable<WorkspaceTeam>;
  abstract addMember(teamId: string, dto: AddTeamMemberRequest): Observable<WorkspaceMember>;
  abstract updateMember(
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberRequest,
  ): Observable<WorkspaceMember>;
  abstract removeMember(teamId: string, memberId: string): Observable<void>;
  abstract createProject(teamId: string, dto: CreateProjectRequest): Observable<WorkspaceProject>;
  abstract updateProject(
    projectId: string,
    dto: UpdateProjectRequest,
  ): Observable<WorkspaceProject>;
  abstract archiveProject(projectId: string): Observable<WorkspaceProject>;
  abstract unarchiveProject(projectId: string): Observable<WorkspaceProject>;
  abstract unsyncProject(projectId: string): Observable<WorkspaceProject>;
}

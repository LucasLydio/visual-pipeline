import { Observable } from 'rxjs';

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
  abstract archiveProject(projectId: string): Observable<WorkspaceProject>;
}

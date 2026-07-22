export type TeamRole = 'OWNER' | 'ADMIN' | 'MAINTAINER' | 'DEVELOPER' | 'VIEWER';
export type SourceProvider = 'GITHUB' | 'GITLAB' | 'BITBUCKET';
export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface WorkspaceTeam {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly memberCount: number;
  readonly currentUserRole: TeamRole;
}

export interface WorkspaceMember {
  readonly id: string;
  readonly teamId: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly role: TeamRole;
  readonly title: string | null;
}

export interface WorkspaceProject {
  readonly id: string;
  readonly teamId: string;
  readonly name: string;
  readonly slug: string;
  readonly provider: SourceProvider;
  readonly repositoryUrl: string;
  readonly repositoryId: string | null;
  readonly defaultBranch: string;
  readonly status: ProjectStatus;
}

export interface WorkspaceOverview {
  readonly currentUser: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
  };
  readonly activeTeam: WorkspaceTeam | null;
  readonly teams: readonly WorkspaceTeam[];
  readonly members: readonly WorkspaceMember[];
  readonly projects: readonly WorkspaceProject[];
}

export interface CreateTeamRequest {
  readonly name: string;
  readonly slug?: string;
  readonly description?: string;
}

export interface AddTeamMemberRequest {
  readonly email: string;
  readonly role: TeamRole;
  readonly title?: string;
}

export interface UpdateTeamMemberRequest {
  readonly role?: TeamRole;
  readonly title?: string | null;
}

export interface CreateProjectRequest {
  readonly name: string;
  readonly slug?: string;
  readonly provider: SourceProvider;
  readonly repositoryUrl: string;
  readonly repositoryId?: string | null;
  readonly defaultBranch?: string;
}

export interface UpdateProjectRequest {
  readonly name?: string;
  readonly slug?: string;
  readonly provider?: SourceProvider;
  readonly repositoryUrl?: string;
  readonly repositoryId?: string | null;
  readonly defaultBranch?: string;
  readonly status?: ProjectStatus;
}

import type {
  ProjectStatusValue,
  SourceProviderValue,
} from '../projects/projects.types.js';
import type { TeamRoleValue } from '../teams/teams.types.js';
import type { PublicUser } from '../users/users.types.js';

export interface WorkspaceTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  currentUserRole: TeamRoleValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRoleValue;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<PublicUser, 'id' | 'email' | 'displayName' | 'status'>;
}

export interface WorkspaceProject {
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

export interface WorkspaceDashboard {
  currentUser: Pick<PublicUser, 'id' | 'email' | 'displayName'>;
  activeTeam: WorkspaceTeam | null;
  teams: WorkspaceTeam[];
  members: WorkspaceMember[];
  projects: WorkspaceProject[];
}

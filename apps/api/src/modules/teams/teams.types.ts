export type TeamRoleValue =
  'OWNER' | 'ADMIN' | 'MAINTAINER' | 'DEVELOPER' | 'VIEWER';

export interface PublicTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  currentUserRole?: TeamRoleValue;
}

export interface PublicTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRoleValue;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    displayName: string;
    status: string;
  };
}

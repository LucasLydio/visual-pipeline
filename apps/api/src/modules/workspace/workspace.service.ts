import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository.js';
import type { WorkspaceDashboard, WorkspaceTeam } from './workspace.types.js';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async getDashboard(
    userId: string,
    requestedTeamId?: string,
  ): Promise<WorkspaceDashboard> {
    const user = await this.workspaceRepository.findUserWorkspace(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const memberships = user.teamMemberships;
    const selectedMembership = requestedTeamId
      ? memberships.find((membership) => membership.teamId === requestedTeamId)
      : memberships[0];

    if (requestedTeamId && !selectedMembership) {
      throw new ForbiddenException('You are not a member of this team.');
    }

    return {
      currentUser: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      activeTeam: selectedMembership
        ? this.toWorkspaceTeam(selectedMembership.team, selectedMembership.role)
        : null,
      teams: memberships.map((membership) =>
        this.toWorkspaceTeam(membership.team, membership.role),
      ),
      members:
        selectedMembership?.team.members.map((member) => ({
          id: member.id,
          teamId: member.teamId,
          userId: member.userId,
          role: member.role,
          title: member.title,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          user: {
            id: member.user.id,
            email: member.user.email,
            displayName: member.user.displayName,
            status: member.user.status,
          },
        })) ?? [],
      projects: selectedMembership?.team.projects ?? [],
    };
  }

  private toWorkspaceTeam(
    team: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      _count: { members: number };
    },
    currentUserRole: WorkspaceTeam['currentUserRole'],
  ): WorkspaceTeam {
    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      memberCount: team._count.members,
      currentUserRole,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}

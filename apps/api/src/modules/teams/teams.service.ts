import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TeamsRepository } from './teams.repository.js';
import type {
  PublicTeam,
  PublicTeamMember,
  TeamRoleValue,
} from './teams.types.js';

const VALID_ROLES = new Set<TeamRoleValue>([
  'OWNER',
  'ADMIN',
  'MAINTAINER',
  'DEVELOPER',
  'VIEWER',
]);
const MANAGER_ROLES = new Set<TeamRoleValue>(['OWNER', 'ADMIN', 'MAINTAINER']);

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamsRepository: TeamsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(ownerId: string, dto: CreateTeamDto): Promise<PublicTeam> {
    const name = this.normalizeName(dto.name);
    const slug = this.normalizeSlug(dto.slug ?? name);
    const existingTeam = await this.teamsRepository.findBySlug(slug);

    if (existingTeam) {
      throw new ConflictException('Team slug is already in use.');
    }

    const team = await this.teamsRepository.create({
      name,
      slug,
      description: this.normalizeDescription(dto.description),
      ownerId,
    });

    return { ...team, memberCount: 1, currentUserRole: 'OWNER' };
  }

  async findMany(userId: string): Promise<PublicTeam[]> {
    const teams = await this.teamsRepository.findManyForUser(userId);

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: team._count.members,
      currentUserRole: team.members.find((member) => member.userId === userId)
        ?.role,
    }));
  }

  async findById(teamId: string, userId: string): Promise<PublicTeam> {
    const team = await this.getTeamOrThrow(teamId);
    const member = await this.assertTeamMember(teamId, userId);

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: team._count.members,
      currentUserRole: member.role,
    };
  }

  async update(
    teamId: string,
    userId: string,
    dto: UpdateTeamDto,
  ): Promise<PublicTeam> {
    await this.assertTeamManager(teamId, userId);
    const data: { name?: string; slug?: string; description?: string | null } =
      {};

    if (dto.name !== undefined) {
      data.name = this.normalizeName(dto.name);
    }

    if (dto.slug !== undefined) {
      data.slug = this.normalizeSlug(dto.slug);
      const existingTeam = await this.teamsRepository.findBySlug(data.slug);

      if (existingTeam && existingTeam.id !== teamId) {
        throw new ConflictException('Team slug is already in use.');
      }
    }

    if (dto.description !== undefined) {
      data.description = this.normalizeDescription(
        dto.description ?? undefined,
      );
    }

    const team = await this.teamsRepository.update(teamId, data);
    const member = await this.assertTeamMember(teamId, userId);

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: team._count.members,
      currentUserRole: member.role,
    };
  }

  async delete(teamId: string, userId: string): Promise<{ message: string }> {
    await this.assertTeamOwner(teamId, userId);
    await this.teamsRepository.delete(teamId);

    return { message: 'Team deleted.' };
  }

  async findMembers(
    teamId: string,
    userId: string,
  ): Promise<PublicTeamMember[]> {
    await this.assertTeamMember(teamId, userId);
    return this.teamsRepository.findMembers(teamId);
  }

  async addMember(
    teamId: string,
    currentUserId: string,
    dto: AddTeamMemberDto,
  ): Promise<PublicTeamMember> {
    await this.assertTeamManager(teamId, currentUserId);
    const targetUser = await this.findTargetUser(dto);
    const existingMember = await this.teamsRepository.findMember(
      teamId,
      targetUser.id,
    );

    if (existingMember) {
      throw new ConflictException('User is already a team member.');
    }

    return this.teamsRepository.addMember(
      teamId,
      targetUser.id,
      this.normalizeRole(dto.role ?? 'DEVELOPER'),
      this.normalizeTitle(dto.title),
    );
  }

  async updateMember(
    teamId: string,
    memberId: string,
    currentUserId: string,
    dto: UpdateTeamMemberDto,
  ): Promise<PublicTeamMember> {
    await this.assertTeamManager(teamId, currentUserId);
    const member = (await this.teamsRepository.findMembers(teamId)).find(
      (teamMember) => teamMember.id === memberId,
    );

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    return this.teamsRepository.updateMember(memberId, {
      role: dto.role ? this.normalizeRole(dto.role) : undefined,
      title:
        dto.title === undefined
          ? undefined
          : (this.normalizeTitle(dto.title ?? undefined) ?? null),
    });
  }

  async removeMember(
    teamId: string,
    memberId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    await this.assertTeamManager(teamId, currentUserId);
    const member = (await this.teamsRepository.findMembers(teamId)).find(
      (teamMember) => teamMember.id === memberId,
    );

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Owner members cannot be removed.');
    }

    await this.teamsRepository.removeMember(memberId);
    return { message: 'Team member removed.' };
  }

  async assertTeamMember(teamId: string, userId: string) {
    const member = await this.teamsRepository.findMember(teamId, userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this team.');
    }

    return member;
  }

  async assertTeamManager(teamId: string, userId: string) {
    const member = await this.assertTeamMember(teamId, userId);

    if (!MANAGER_ROLES.has(member.role)) {
      throw new ForbiddenException('You cannot manage this team.');
    }

    return member;
  }

  private async assertTeamOwner(teamId: string, userId: string) {
    const member = await this.assertTeamMember(teamId, userId);

    if (member.role !== 'OWNER') {
      throw new ForbiddenException('Only team owners can delete a team.');
    }

    return member;
  }

  private async getTeamOrThrow(teamId: string) {
    const team = await this.teamsRepository.findById(teamId);

    if (!team) {
      throw new NotFoundException('Team not found.');
    }

    return team;
  }

  private async findTargetUser(dto: AddTeamMemberDto) {
    if (dto.userId) {
      const user = await this.usersService.findSecretById(dto.userId);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    }

    if (dto.email) {
      const user = await this.usersService.findSecretByEmail(dto.email);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    }

    throw new BadRequestException('User id or email is required.');
  }

  private normalizeName(name?: string): string {
    const normalizedName = name?.trim();

    if (
      !normalizedName ||
      normalizedName.length < 2 ||
      normalizedName.length > 120
    ) {
      throw new BadRequestException(
        'Team name must be between 2 and 120 characters.',
      );
    }

    return normalizedName;
  }

  private normalizeSlug(value?: string): string {
    const slug = value
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug || slug.length < 2 || slug.length > 80) {
      throw new BadRequestException(
        'Team slug must be between 2 and 80 characters.',
      );
    }

    return slug;
  }

  private normalizeDescription(description?: string): string | undefined {
    const normalizedDescription = description?.trim();

    if (!normalizedDescription) {
      return undefined;
    }

    if (normalizedDescription.length > 240) {
      throw new BadRequestException(
        'Description must have at most 240 characters.',
      );
    }

    return normalizedDescription;
  }

  private normalizeRole(role?: TeamRoleValue): TeamRoleValue {
    if (!role || !VALID_ROLES.has(role)) {
      throw new BadRequestException('Invalid team role.');
    }

    return role;
  }

  private normalizeTitle(title?: string): string | undefined {
    const normalizedTitle = title?.trim();

    if (!normalizedTitle) {
      return undefined;
    }

    if (normalizedTitle.length > 80) {
      throw new BadRequestException(
        'Member title must have at most 80 characters.',
      );
    }

    return normalizedTitle;
  }
}

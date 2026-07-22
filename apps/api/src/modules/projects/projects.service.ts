import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamsService } from '../teams/teams.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsRepository } from './projects.repository.js';
import type {
  ProjectStatusValue,
  PublicProject,
  SourceProviderValue,
} from './projects.types.js';

const VALID_PROVIDERS = new Set<SourceProviderValue>([
  'GITHUB',
  'GITLAB',
  'BITBUCKET',
]);
const VALID_STATUSES = new Set<ProjectStatusValue>([
  'ACTIVE',
  'PAUSED',
  'ARCHIVED',
]);

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly teamsService: TeamsService,
  ) {}

  async create(
    teamId: string,
    userId: string,
    dto: CreateProjectDto,
  ): Promise<PublicProject> {
    await this.teamsService.assertTeamManager(teamId, userId);
    const provider = this.normalizeProvider(dto.provider);
    const repositoryId = this.normalizeOptional(dto.repositoryId, 255);
    const slug = this.normalizeSlug(dto.slug ?? dto.name);

    await this.ensureProjectSlugAvailable(teamId, slug);
    await this.ensureRepositoryAvailable(provider, repositoryId);

    return this.projectsRepository.create({
      teamId,
      name: this.normalizeName(dto.name),
      slug,
      provider,
      repositoryUrl: this.normalizeRepositoryUrl(dto.repositoryUrl),
      repositoryId,
      defaultBranch: this.normalizeBranch(dto.defaultBranch),
    });
  }

  async findMany(
    teamId: string,
    userId: string,
    search?: string,
  ): Promise<PublicProject[]> {
    await this.teamsService.assertTeamMember(teamId, userId);
    return this.projectsRepository.findManyByTeam(teamId, search?.trim());
  }

  async findById(projectId: string, userId: string): Promise<PublicProject> {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamMember(project.teamId, userId);

    return project;
  }

  async update(
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<PublicProject> {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamManager(project.teamId, userId);
    const data: {
      name?: string;
      slug?: string;
      provider?: SourceProviderValue;
      repositoryUrl?: string;
      repositoryId?: string | null;
      defaultBranch?: string;
      status?: ProjectStatusValue;
    } = {};

    if (dto.name !== undefined) data.name = this.normalizeName(dto.name);
    if (dto.provider !== undefined)
      data.provider = this.normalizeProvider(dto.provider);
    if (dto.repositoryUrl !== undefined) {
      data.repositoryUrl = this.normalizeRepositoryUrl(dto.repositoryUrl);
    }
    if (dto.defaultBranch !== undefined) {
      data.defaultBranch = this.normalizeBranch(dto.defaultBranch);
    }
    if (dto.status !== undefined)
      data.status = this.normalizeStatus(dto.status);
    if (dto.slug !== undefined) {
      data.slug = this.normalizeSlug(dto.slug);
      await this.ensureProjectSlugAvailable(
        project.teamId,
        data.slug,
        project.id,
      );
    }
    if (dto.repositoryId !== undefined) {
      data.repositoryId =
        this.normalizeOptional(dto.repositoryId ?? undefined, 255) ?? null;
      if (data.repositoryId) {
        await this.ensureRepositoryAvailable(
          data.provider ?? project.provider,
          data.repositoryId,
          project.id,
        );
      }
    }

    return this.projectsRepository.update(projectId, data);
  }

  async archive(projectId: string, userId: string): Promise<PublicProject> {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamManager(project.teamId, userId);

    return this.projectsRepository.archive(projectId);
  }

  async unarchive(projectId: string, userId: string): Promise<PublicProject> {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamManager(project.teamId, userId);

    return this.projectsRepository.unarchive(projectId);
  }

  async unsync(projectId: string, userId: string): Promise<PublicProject> {
    const project = await this.getProjectOrThrow(projectId);
    await this.teamsService.assertTeamManager(project.teamId, userId);

    return this.projectsRepository.delete(projectId);
  }

  private async getProjectOrThrow(projectId: string) {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  private async ensureProjectSlugAvailable(
    teamId: string,
    slug: string,
    ignoreProjectId?: string,
  ): Promise<void> {
    const existingProject = await this.projectsRepository.findByTeamSlug(
      teamId,
      slug,
    );

    if (existingProject && existingProject.id !== ignoreProjectId) {
      throw new ConflictException(
        'Project slug is already in use for this team.',
      );
    }
  }

  private async ensureRepositoryAvailable(
    provider: SourceProviderValue,
    repositoryId?: string,
    ignoreProjectId?: string,
  ): Promise<void> {
    if (!repositoryId) return;
    const existingProject = await this.projectsRepository.findByRepository(
      provider,
      repositoryId,
    );

    if (existingProject && existingProject.id !== ignoreProjectId) {
      throw new ConflictException('Repository is already connected.');
    }
  }

  private normalizeName(name?: string): string {
    const normalizedName = name?.trim();

    if (
      !normalizedName ||
      normalizedName.length < 2 ||
      normalizedName.length > 140
    ) {
      throw new BadRequestException(
        'Project name must be between 2 and 140 characters.',
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

    if (!slug || slug.length < 2 || slug.length > 100) {
      throw new BadRequestException(
        'Project slug must be between 2 and 100 characters.',
      );
    }

    return slug;
  }

  private normalizeProvider(
    provider?: SourceProviderValue,
  ): SourceProviderValue {
    if (!provider || !VALID_PROVIDERS.has(provider)) {
      throw new BadRequestException('Invalid source provider.');
    }

    return provider;
  }

  private normalizeStatus(status?: ProjectStatusValue): ProjectStatusValue {
    if (!status || !VALID_STATUSES.has(status)) {
      throw new BadRequestException('Invalid project status.');
    }

    return status;
  }

  private normalizeRepositoryUrl(repositoryUrl?: string): string {
    const normalizedUrl = repositoryUrl?.trim();

    if (!normalizedUrl || normalizedUrl.length > 2048) {
      throw new BadRequestException('A valid repository URL is required.');
    }

    return normalizedUrl;
  }

  private normalizeBranch(branch = 'main'): string {
    const normalizedBranch = branch.trim();

    if (!normalizedBranch || normalizedBranch.length > 120) {
      throw new BadRequestException(
        'Default branch must be between 1 and 120 characters.',
      );
    }

    return normalizedBranch;
  }

  private normalizeOptional(
    value: string | undefined,
    max: number,
  ): string | undefined {
    const normalizedValue = value?.trim();

    if (!normalizedValue) return undefined;
    if (normalizedValue.length > max) {
      throw new BadRequestException(
        `Value must have at most ${max} characters.`,
      );
    }

    return normalizedValue;
  }
}

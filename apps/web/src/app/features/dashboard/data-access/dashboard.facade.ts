import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { TeamApi } from '../../../core/api/team-api';
import { SessionRefreshRequiredError } from '../../../core/errors/session-refresh-required.error';
import {
  AddTeamMemberRequest,
  CreateProjectRequest,
  CreateTeamRequest,
  UpdateProjectRequest,
  UpdateTeamMemberRequest,
  WorkspaceProject,
} from '../../../core/models/team.models';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';

@Injectable()
export class DashboardFacade {
  private readonly api = inject(TeamApi);
  private readonly workspaceContext = inject(WorkspaceContextService);

  readonly selectedProject = signal<WorkspaceProject | null>(null);
  readonly projectSearch = signal('');
  readonly actionError = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.workspaceContext.isAuthenticated());
  readonly state = this.workspaceContext.state;

  readonly filteredProjects = computed(() => {
    const projects = this.state().overview?.projects ?? [];
    const query = this.projectSearch().trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) =>
      [project.name, project.provider, project.repositoryUrl, project.defaultBranch, project.status]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  selectTeam(teamId: string): void {
    this.selectedProject.set(null);
    this.workspaceContext.selectTeam(teamId);
  }

  refresh(): void {
    this.workspaceContext.refresh();
  }

  createTeam(dto: CreateTeamRequest): Observable<unknown> {
    return this.run(this.api.createTeam(dto).pipe(tap((team) => this.selectTeam(team.id))));
  }

  addMember(dto: AddTeamMemberRequest): Observable<unknown> {
    return this.runForActiveTeam((teamId) => this.api.addMember(teamId, dto));
  }

  updateMember(memberId: string, dto: UpdateTeamMemberRequest): Observable<unknown> {
    return this.runForActiveTeam((teamId) => this.api.updateMember(teamId, memberId, dto));
  }

  removeMember(memberId: string): Observable<unknown> {
    return this.runForActiveTeam((teamId) => this.api.removeMember(teamId, memberId));
  }

  createProject(dto: CreateProjectRequest): Observable<unknown> {
    return this.runForActiveTeam((teamId) => this.api.createProject(teamId, dto));
  }

  updateProject(projectId: string, dto: UpdateProjectRequest): Observable<unknown> {
    return this.run(
      this.api.updateProject(projectId, dto).pipe(
        tap((project) => {
          this.selectedProject.set(project);
          this.refresh();
        }),
      ),
    );
  }

  archiveProject(projectId: string): Observable<unknown> {
    return this.run(
      this.api.archiveProject(projectId).pipe(
        tap((project) => {
          this.selectedProject.set(project);
          this.refresh();
        }),
      ),
    );
  }

  unarchiveProject(projectId: string): Observable<unknown> {
    return this.run(
      this.api.unarchiveProject(projectId).pipe(
        tap((project) => {
          this.selectedProject.set(project);
          this.refresh();
        }),
      ),
    );
  }

  unsyncProject(projectId: string): Observable<unknown> {
    return this.run(
      this.api.unsyncProject(projectId).pipe(
        tap(() => {
          this.selectedProject.set(null);
          this.refresh();
        }),
      ),
    );
  }

  private runForActiveTeam(action: (teamId: string) => Observable<unknown>): Observable<unknown> {
    const teamId = this.state().overview?.activeTeam?.id;

    if (!teamId) {
      this.actionError.set('Create or select a team first.');
      return of(null);
    }

    return this.run(action(teamId).pipe(tap(() => this.refresh())));
  }

  private run(action$: Observable<unknown>): Observable<unknown> {
    this.actionError.set(null);

    return action$.pipe(
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) {
          this.actionError.set(null);
          return of(null);
        }

        this.actionError.set(this.errorMessage(error, 'Action failed.'));
        return of(null);
      }),
    );
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error && 'error' in error) {
      const apiError = error as { error?: { message?: string } };
      return apiError.error?.message ?? fallback;
    }

    return fallback;
  }
}

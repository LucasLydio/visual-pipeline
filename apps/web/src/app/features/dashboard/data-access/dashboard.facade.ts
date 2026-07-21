import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { TeamApi } from '../../../core/api/team-api';
import {
  AddTeamMemberRequest,
  CreateProjectRequest,
  CreateTeamRequest,
  UpdateTeamMemberRequest,
  WorkspaceOverview,
  WorkspaceProject,
} from '../../../core/models/team.models';
import { AuthSessionService } from '../../../core/services/auth-session.service';

interface DashboardState {
  readonly loading: boolean;
  readonly overview: WorkspaceOverview | null;
  readonly error: string | null;
}

@Injectable()
export class DashboardFacade {
  private readonly api = inject(TeamApi);
  private readonly authSession = inject(AuthSessionService);
  private readonly selectedTeam$ = new BehaviorSubject<string | undefined>(undefined);

  readonly selectedProject = signal<WorkspaceProject | null>(null);
  readonly projectSearch = signal('');
  readonly actionError = signal<string | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.authSession.session()));

  readonly state = toSignal(
    this.selectedTeam$.pipe(
      switchMap((teamId) =>
        this.api.getWorkspaceOverview(teamId).pipe(
          map((overview): DashboardState => ({ loading: false, overview, error: null })),
          startWith({ loading: true, overview: null, error: null } satisfies DashboardState),
          catchError((error: unknown) =>
            of({
              loading: false,
              overview: null,
              error: this.errorMessage(error, 'Unable to load workspace.'),
            } satisfies DashboardState),
          ),
        ),
      ),
    ),
    { initialValue: { loading: true, overview: null, error: null } },
  );

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
    this.selectedTeam$.next(teamId);
  }

  refresh(): void {
    this.selectedTeam$.next(this.state().overview?.activeTeam?.id);
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

  archiveProject(projectId: string): Observable<unknown> {
    return this.run(this.api.archiveProject(projectId).pipe(tap(() => this.refresh())));
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

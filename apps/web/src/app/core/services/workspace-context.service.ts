import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { TeamApi } from '../api/team-api';
import { SessionRefreshRequiredError } from '../errors/session-refresh-required.error';
import { WorkspaceOverview } from '../models/team.models';
import { AuthSessionService } from './auth-session.service';

export interface WorkspaceContextState {
  readonly loading: boolean;
  readonly overview: WorkspaceOverview | null;
  readonly error: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceContextService {
  private readonly api = inject(TeamApi);
  private readonly authSession = inject(AuthSessionService);
  private readonly selectedTeam$ = new BehaviorSubject<string | undefined>(undefined);

  readonly isAuthenticated = computed(() => Boolean(this.authSession.session()));

  readonly state = toSignal(
    this.selectedTeam$.pipe(
      switchMap((teamId) => {
        if (!this.authSession.getSession()) {
          return of({
            loading: false,
            overview: null,
            error: null,
          } satisfies WorkspaceContextState);
        }

        return this.api.getWorkspaceOverview(teamId).pipe(
          map((overview): WorkspaceContextState => ({ loading: false, overview, error: null })),
          startWith({ loading: true, overview: null, error: null } satisfies WorkspaceContextState),
          catchError((error: unknown) =>
            of({
              loading: false,
              overview: null,
              error:
                error instanceof SessionRefreshRequiredError
                  ? null
                  : this.errorMessage(error, 'Unable to load workspace.'),
            } satisfies WorkspaceContextState),
          ),
        );
      }),
    ),
    { initialValue: { loading: true, overview: null, error: null } },
  );

  selectTeam(teamId: string): void {
    this.selectedTeam$.next(teamId);
  }

  refresh(): void {
    this.selectedTeam$.next(this.state().overview?.activeTeam?.id);
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

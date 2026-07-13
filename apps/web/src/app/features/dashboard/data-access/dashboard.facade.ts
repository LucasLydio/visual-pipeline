import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { PipelineApi } from '../../../core/api/pipeline-api';
import { DashboardSnapshot, MockScenario, PipelineRun } from '../../../core/models/pipeline.models';
import { MOCK_SCENARIOS } from '../../../core/testing/mock-dashboard.data';

interface DashboardState {
  readonly loading: boolean;
  readonly snapshot: DashboardSnapshot | null;
  readonly error: string | null;
}

@Injectable()
export class DashboardFacade {
  private readonly api = inject(PipelineApi);
  private readonly request$ = new BehaviorSubject<MockScenario>('healthy');

  readonly scenario = signal<MockScenario>('healthy');
  readonly searchQuery = signal('');
  readonly scenarios = MOCK_SCENARIOS;

  readonly state = toSignal(
    this.request$.pipe(
      switchMap((scenario) =>
        this.api.getDashboard(scenario).pipe(
          map((snapshot): DashboardState => ({ loading: false, snapshot, error: null })),
          startWith({ loading: true, snapshot: null, error: null } satisfies DashboardState),
          catchError((error: unknown) =>
            of({
              loading: false,
              snapshot: null,
              error: error instanceof Error ? error.message : 'Unable to load pipeline data.',
            } satisfies DashboardState),
          ),
        ),
      ),
    ),
    { initialValue: { loading: true, snapshot: null, error: null } },
  );

  readonly filteredRuns = computed<readonly PipelineRun[]>(() => {
    const runs = this.state().snapshot?.runs ?? [];
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return runs;
    }

    return runs.filter((run) =>
      [run.id, run.service, run.branch, run.author, run.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  selectScenario(scenario: MockScenario): void {
    this.scenario.set(scenario);
    this.searchQuery.set('');
    this.request$.next(scenario);
  }

  refresh(): void {
    this.request$.next(this.scenario());
  }
}

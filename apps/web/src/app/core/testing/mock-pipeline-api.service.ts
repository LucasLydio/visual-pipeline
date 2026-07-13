import { Injectable } from '@angular/core';
import { Observable, mergeMap, of, throwError, timer } from 'rxjs';

import { PipelineApi } from '../api/pipeline-api';
import { DashboardSnapshot, MockScenario } from '../models/pipeline.models';
import { MOCK_DASHBOARDS } from './mock-dashboard.data';

@Injectable()
export class MockPipelineApiService implements PipelineApi {
  getDashboard(scenario: MockScenario): Observable<DashboardSnapshot> {
    return timer(450).pipe(
      mergeMap(() => {
        if (scenario === 'offline') {
          return throwError(() => new Error('The mock pipeline API is unavailable.'));
        }

        return of(MOCK_DASHBOARDS[scenario]);
      }),
    );
  }
}

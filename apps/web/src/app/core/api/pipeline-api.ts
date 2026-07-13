import { Observable } from 'rxjs';

import { DashboardSnapshot, MockScenario } from '../models/pipeline.models';

export abstract class PipelineApi {
  abstract getDashboard(scenario: MockScenario): Observable<DashboardSnapshot>;
}

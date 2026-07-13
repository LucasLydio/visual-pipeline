import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MockScenario } from '../../../../core/models/pipeline.models';
import { ActivePipelineComponent } from '../../components/active-pipeline/active-pipeline.component';
import { DeploymentStatusComponent } from '../../components/deployment-status/deployment-status.component';
import { MetricsStripComponent } from '../../components/metrics-strip/metrics-strip.component';
import { RunHistoryComponent } from '../../components/run-history/run-history.component';
import { DashboardFacade } from '../../data-access/dashboard.facade';

@Component({
  selector: 'vp-dashboard-page',
  imports: [
    ActivePipelineComponent,
    DeploymentStatusComponent,
    MetricsStripComponent,
    RunHistoryComponent,
  ],
  providers: [DashboardFacade],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly facade = inject(DashboardFacade);

  protected selectScenario(event: Event): void {
    this.facade.selectScenario((event.target as HTMLSelectElement).value as MockScenario);
  }
}

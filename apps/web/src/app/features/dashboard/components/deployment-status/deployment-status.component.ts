import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  AgentRegion,
  DeploymentQueueItem,
  PipelineStatus,
  ReleaseReadiness,
} from '../../../../core/models/pipeline.models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'vp-deployment-status',
  imports: [StatusBadgeComponent],
  templateUrl: './deployment-status.component.html',
  styleUrl: './deployment-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentStatusComponent {
  readonly readiness = input.required<ReleaseReadiness>();
  readonly queue = input.required<readonly DeploymentQueueItem[]>();
  readonly regions = input.required<readonly AgentRegion[]>();
  readonly environmentStatus = input.required<PipelineStatus>();

  protected fleetStatus(): PipelineStatus {
    const regions = this.regions();

    if (regions.length === 0) {
      return 'queued';
    }

    return regions.some((region) => region.utilization === 0 || region.utilization >= 90)
      ? 'warning'
      : 'success';
  }
}

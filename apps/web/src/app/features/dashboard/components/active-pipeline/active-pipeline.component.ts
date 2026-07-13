import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ActivePipeline } from '../../../../core/models/pipeline.models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'vp-active-pipeline',
  imports: [StatusBadgeComponent],
  templateUrl: './active-pipeline.component.html',
  styleUrl: './active-pipeline.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivePipelineComponent {
  readonly pipeline = input.required<ActivePipeline | null>();
}

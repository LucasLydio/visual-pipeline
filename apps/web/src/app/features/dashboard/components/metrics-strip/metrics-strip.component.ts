import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Metric } from '../../../../core/models/pipeline.models';

@Component({
  selector: 'vp-metrics-strip',
  templateUrl: './metrics-strip.component.html',
  styleUrl: './metrics-strip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsStripComponent {
  readonly metrics = input.required<readonly Metric[]>();
}

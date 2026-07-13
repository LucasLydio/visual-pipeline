import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PipelineRun } from '../../../../core/models/pipeline.models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'vp-run-history',
  imports: [StatusBadgeComponent],
  templateUrl: './run-history.component.html',
  styleUrl: './run-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunHistoryComponent {
  readonly runs = input.required<readonly PipelineRun[]>();
  readonly query = input.required<string>();
  readonly queryChange = output<string>();

  protected updateQuery(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}

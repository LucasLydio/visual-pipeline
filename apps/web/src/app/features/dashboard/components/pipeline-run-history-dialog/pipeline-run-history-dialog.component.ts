import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock3, lucideGitBranch, lucideX } from '@ng-icons/lucide';

import { PipelineRun, ProjectPipeline } from '../../../../core/models/pipeline-api.models';

@Component({
  selector: 'vp-pipeline-run-history-dialog',
  imports: [NgIcon],
  providers: [provideIcons({ lucideClock3, lucideGitBranch, lucideX })],
  templateUrl: './pipeline-run-history-dialog.component.html',
  styleUrl: './pipeline-run-history-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineRunHistoryDialogComponent {
  @Input() pipeline: ProjectPipeline | null = null;
  @Input() runs: readonly PipelineRun[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() closed = new EventEmitter<void>();

  protected statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideKeyRound, lucideRefreshCw, lucideX } from '@ng-icons/lucide';

import { WorkflowSetup } from '../../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-workflow-setup-dialog',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideCopy,
      lucideKeyRound,
      lucideRefreshCw,
      lucideX,
    }),
  ],
  templateUrl: './workflow-setup-dialog.component.html',
  styleUrl: './workflow-setup-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowSetupDialogComponent {
  @Input() project: WorkspaceProject | null = null;
  @Input() setup: WorkflowSetup | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() tokenRequested = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  protected readonly copied = signal<string | null>(null);

  protected copy(value: string | undefined, label: string): void {
    if (!value) return;

    void navigator.clipboard.writeText(value).then(() => {
      this.copied.set(label);
      window.setTimeout(() => this.copied.set(null), 1800);
    });
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucidePencil,
  lucideTerminal,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';

import { PipelineRun, PipelineStepRun } from '../../../../core/models/pipeline-api.models';
import { PipelineStepTarget } from '../../data-access/dashboard-pipeline.types';

@Component({
  selector: 'vp-pipeline-step-status-dialog',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideActivity,
      lucidePencil,
      lucideTerminal,
      lucideTrash2,
      lucideX,
    }),
  ],
  templateUrl: './pipeline-step-status-dialog.component.html',
  styleUrl: './pipeline-step-status-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineStepStatusDialogComponent {
  @Input() target: PipelineStepTarget | null = null;
  @Input() latestRun: PipelineRun | null = null;
  @Input() statusChanges: ReadonlySet<string> = new Set();

  @Output() editStep = new EventEmitter<PipelineStepTarget>();
  @Output() deleteStep = new EventEmitter<PipelineStepTarget>();
  @Output() closed = new EventEmitter<void>();

  protected runStep(): PipelineStepRun | null {
    const step = this.target?.step;
    if (!step || this.target?.type !== 'pipeline') return null;

    return this.latestRun?.steps.find((candidate) => candidate.pipelineStepId === step.id) ?? null;
  }

  protected statusLabel(): string {
    return this.runStep()?.status ?? (this.target?.step?.isEnabled ? 'READY' : 'DISABLED');
  }

  protected statusClass(): string {
    return `status-${this.statusLabel().toLowerCase()}`;
  }

  protected logs(): string {
    return this.runStep()?.logsSummary ?? 'No logs captured for this step yet.';
  }

  protected isRunning(): boolean {
    return this.runStep()?.status === 'RUNNING';
  }

  protected isLiveChange(): boolean {
    const runStep = this.runStep();
    return Boolean(runStep && this.statusChanges.has(runStep.id));
  }

  protected edit(): void {
    if (this.target) this.editStep.emit(this.target);
  }

  protected remove(): void {
    if (this.target) this.deleteStep.emit(this.target);
  }
}

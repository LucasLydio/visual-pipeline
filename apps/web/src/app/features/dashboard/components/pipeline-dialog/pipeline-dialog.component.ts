import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CreatePipelineRequest,
  PipelineStep,
  PipelineStatus,
  PipelineTemplate,
  ProjectPipeline,
  UpdatePipelineRequest,
} from '../../../../core/models/pipeline-api.models';
import { PipelineDialogSave, PipelineStepDraft } from '../../models/pipeline-step-draft.models';
import { PipelineStepEditorComponent } from '../pipeline-step-editor/pipeline-step-editor.component';

@Component({
  selector: 'vp-pipeline-dialog',
  imports: [ReactiveFormsModule, PipelineStepEditorComponent],
  templateUrl: './pipeline-dialog.component.html',
  styleUrl: './pipeline-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineDialogComponent {
  @Input() templates: readonly PipelineTemplate[] = [];
  @Output() saved = new EventEmitter<PipelineDialogSave>();
  @Output() closed = new EventEmitter<void>();
  protected editing = false;
  protected readonly statuses: readonly PipelineStatus[] = ['ACTIVE', 'PAUSED', 'ARCHIVED'];
  protected readonly stepDrafts = signal<readonly PipelineStepDraft[]>([]);

  protected readonly form = new FormBuilder().nonNullable.group({
    templateId: [''],
    name: ['', [Validators.minLength(2)]],
    description: [''],
    status: ['ACTIVE' as PipelineStatus],
  });

  @Input() set pipeline(pipeline: ProjectPipeline | null) {
    this.editing = Boolean(pipeline);
    this.form.reset({
      templateId: pipeline?.templateId ?? '',
      name: pipeline?.name ?? '',
      description: pipeline?.description ?? '',
      status: pipeline?.status ?? 'ACTIVE',
    });
    this.stepDrafts.set(this.toStepDrafts(pipeline?.steps ?? []));
  }

  protected submit(): void {
    const value = this.form.getRawValue();
    if (!this.editing && !value.templateId && !value.name.trim()) {
      this.form.controls.name.setErrors({ required: true });
      return;
    }

    if (this.form.invalid) return;

    if (this.editing && this.hasInvalidStepDrafts()) return;

    this.saved.emit({
      pipeline: this.editing
        ? {
            name: value.name || undefined,
            description: value.description || null,
            status: value.status,
          }
        : {
            templateId: value.templateId || undefined,
            name: value.name || undefined,
            description: value.description || null,
          },
      steps: this.editing ? this.stepDrafts() : undefined,
    });
  }

  protected updateStepDrafts(drafts: readonly PipelineStepDraft[]): void {
    this.stepDrafts.set(drafts);
  }

  protected hasInvalidStepDrafts(): boolean {
    return this.stepDrafts().some((draft) => draft.name.trim().length < 2);
  }

  private toStepDrafts(steps: readonly PipelineStep[]): readonly PipelineStepDraft[] {
    return [...steps]
      .sort((left, right) => left.order - right.order)
      .map((step, index) => ({
        clientId: step.id,
        stepId: step.id,
        name: step.name,
        command: step.command ?? '',
        order: index + 1,
        isRequired: step.isRequired,
        isEnabled: step.isEnabled,
      }));
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CreatePipelineRequest,
  PipelineStatus,
  PipelineTemplate,
  ProjectPipeline,
  UpdatePipelineRequest,
} from '../../../../core/models/pipeline-api.models';

@Component({
  selector: 'vp-pipeline-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './pipeline-dialog.component.html',
  styleUrl: './pipeline-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineDialogComponent {
  @Input() templates: readonly PipelineTemplate[] = [];
  @Output() saved = new EventEmitter<CreatePipelineRequest | UpdatePipelineRequest>();
  @Output() closed = new EventEmitter<void>();
  protected editing = false;
  protected readonly statuses: readonly PipelineStatus[] = ['ACTIVE', 'PAUSED', 'ARCHIVED'];

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
  }

  protected submit(): void {
    const value = this.form.getRawValue();
    if (!this.editing && !value.templateId && !value.name.trim()) {
      this.form.controls.name.setErrors({ required: true });
      return;
    }

    if (this.form.invalid) return;

    this.saved.emit(
      this.editing
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
    );
  }
}

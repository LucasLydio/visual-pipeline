import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CreatePipelineTemplateRequest,
  PipelineTemplate,
  UpdatePipelineTemplateRequest,
} from '../../../../core/models/pipeline-api.models';

@Component({
  selector: 'vp-pipeline-template-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './pipeline-template-dialog.component.html',
  styleUrl: './pipeline-template-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineTemplateDialogComponent {
  @Output() saved = new EventEmitter<
    CreatePipelineTemplateRequest | UpdatePipelineTemplateRequest
  >();
  @Output() closed = new EventEmitter<void>();
  protected editing = false;

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isActive: [true],
  });

  @Input() set template(template: PipelineTemplate | null) {
    this.editing = Boolean(template);
    this.form.reset({
      name: template?.name ?? '',
      description: template?.description ?? '',
      isActive: template?.isActive ?? true,
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saved.emit({
      name: value.name,
      description: value.description || null,
      isActive: this.editing ? value.isActive : undefined,
    });
  }
}

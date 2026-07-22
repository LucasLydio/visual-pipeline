import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  PipelineStep,
  PipelineStepRequest,
  PipelineTemplateStep,
  PipelineTemplateStepRequest,
} from '../../../../core/models/pipeline-api.models';

type StepFormValue = PipelineStepRequest & PipelineTemplateStepRequest;

@Component({
  selector: 'vp-pipeline-step-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './pipeline-step-dialog.component.html',
  styleUrl: './pipeline-step-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineStepDialogComponent {
  @Input() includeDescription = false;
  @Output() saved = new EventEmitter<StepFormValue>();
  @Output() closed = new EventEmitter<void>();
  protected editing = false;

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    order: [1, [Validators.required, Validators.min(1)]],
    command: [''],
    isRequired: [true],
    isEnabled: [true],
  });

  @Input() set step(step: PipelineStep | PipelineTemplateStep | null) {
    this.editing = Boolean(step);
    this.form.reset({
      name: step?.name ?? '',
      description:
        'description' in (step ?? {}) ? ((step as PipelineTemplateStep).description ?? '') : '',
      order: step?.order ?? 1,
      command: step?.command ?? '',
      isRequired: step?.isRequired ?? true,
      isEnabled: step?.isEnabled ?? true,
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saved.emit({
      name: value.name,
      description: this.includeDescription ? value.description || null : undefined,
      order: value.order,
      command: value.command || null,
      isRequired: value.isRequired,
      isEnabled: value.isEnabled,
    });
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

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
  private currentStep: PipelineStep | PipelineTemplateStep | null = null;
  private existingOrderValues: readonly number[] = [];
  private suggestedOrderValue = 1;

  private readonly uniqueOrderValidator = (
    control: AbstractControl<number>,
  ): ValidationErrors | null => {
    const order = Number(control.value);
    if (!Number.isInteger(order)) return null;
    if (this.currentStep?.order === order) return null;

    return this.existingOrderValues.includes(order) ? { orderTaken: true } : null;
  };

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    order: [1, [Validators.required, Validators.min(1), this.uniqueOrderValidator]],
    command: [''],
    isRequired: [true],
    isEnabled: [true],
  });

  @Input() set existingOrders(orders: readonly number[] | null) {
    this.existingOrderValues = orders ?? [];
    this.form.controls.order.updateValueAndValidity({ emitEvent: false });
  }

  @Input() set suggestedOrder(order: number | null) {
    this.suggestedOrderValue = order && order > 0 ? order : 1;
    if (!this.editing) {
      this.form.controls.order.setValue(this.suggestedOrderValue);
      this.form.controls.order.updateValueAndValidity({ emitEvent: false });
    }
  }

  @Input() set step(step: PipelineStep | PipelineTemplateStep | null) {
    this.currentStep = step;
    this.editing = Boolean(step);
    this.form.reset({
      name: step?.name ?? '',
      description:
        'description' in (step ?? {}) ? ((step as PipelineTemplateStep).description ?? '') : '',
      order: step?.order ?? this.suggestedOrderValue,
      command: step?.command ?? '',
      isRequired: step?.isRequired ?? true,
      isEnabled: step?.isEnabled ?? true,
    });
    this.form.controls.order.updateValueAndValidity({ emitEvent: false });
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

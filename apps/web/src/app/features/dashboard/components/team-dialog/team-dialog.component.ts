import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTeamRequest } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-team-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './team-dialog.component.html',
  styleUrl: './team-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDialogComponent {
  @Output() saved = new EventEmitter<CreateTeamRequest>();
  @Output() closed = new EventEmitter<void>();

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: [''],
    description: [''],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue());
  }
}

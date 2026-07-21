import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateProjectRequest, SourceProvider } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-project-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDialogComponent {
  @Output() saved = new EventEmitter<CreateProjectRequest>();
  @Output() closed = new EventEmitter<void>();
  protected readonly providers: readonly SourceProvider[] = ['GITHUB', 'GITLAB', 'BITBUCKET'];

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    provider: ['GITHUB' as SourceProvider, Validators.required],
    repositoryUrl: ['', Validators.required],
    defaultBranch: ['main', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue());
  }
}

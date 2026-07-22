import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SourceProvider,
  UpdateProjectRequest,
  WorkspaceProject,
} from '../../../../core/models/team.models';

@Component({
  selector: 'vp-project-detail-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './project-detail-dialog.component.html',
  styleUrl: './project-detail-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly providers: readonly SourceProvider[] = ['GITHUB', 'GITLAB', 'BITBUCKET'];
  protected selectedProject: WorkspaceProject | null = null;
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: [''],
    provider: ['GITHUB' as SourceProvider, Validators.required],
    repositoryUrl: ['', Validators.required],
    repositoryId: [''],
    defaultBranch: ['main', Validators.required],
  });

  @Input() set project(project: WorkspaceProject | null) {
    this.selectedProject = project;

    if (!project) return;

    this.form.reset({
      name: project.name,
      slug: project.slug,
      provider: project.provider,
      repositoryUrl: project.repositoryUrl,
      repositoryId: project.repositoryId ?? '',
      defaultBranch: project.defaultBranch,
    });
  }

  @Output() saved = new EventEmitter<UpdateProjectRequest>();
  @Output() archiveProject = new EventEmitter<WorkspaceProject>();
  @Output() unarchiveProject = new EventEmitter<WorkspaceProject>();
  @Output() unsyncProject = new EventEmitter<WorkspaceProject>();
  @Output() closed = new EventEmitter<void>();

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    this.saved.emit({
      name: value.name,
      slug: value.slug || undefined,
      provider: value.provider,
      repositoryUrl: value.repositoryUrl,
      repositoryId: value.repositoryId || null,
      defaultBranch: value.defaultBranch,
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { SourceControlApi } from '../../../../core/api/source-control-api';
import { GitHubRepositoryOption } from '../../../../core/models/source-control.models';
import {
  CreateProjectRequest,
  ProjectExecutionMode,
  SourceProvider,
} from '../../../../core/models/team.models';

@Component({
  selector: 'vp-project-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDialogComponent implements OnInit {
  @Output() saved = new EventEmitter<CreateProjectRequest>();
  @Output() closed = new EventEmitter<void>();
  private readonly sourceControlApi = inject(SourceControlApi);
  protected readonly providers: readonly SourceProvider[] = ['GITHUB', 'GITLAB', 'BITBUCKET'];
  protected readonly executionModes: readonly ProjectExecutionMode[] = [
    'GITHUB_ACTIONS',
    'LOCAL_AGENT',
    'MANUAL',
  ];
  protected readonly repositories = signal<readonly GitHubRepositoryOption[]>([]);
  protected readonly repositoriesLoading = signal(false);
  protected readonly repositoriesError = signal<string | null>(null);

  protected readonly form = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    provider: ['GITHUB' as SourceProvider, Validators.required],
    repositoryId: [''],
    repositoryUrl: ['', Validators.required],
    defaultBranch: ['main', Validators.required],
    executionMode: ['GITHUB_ACTIONS' as ProjectExecutionMode, Validators.required],
  });

  ngOnInit(): void {
    this.loadGitHubRepositories();
  }

  protected selectRepository(repositoryId: string): void {
    const repository = this.repositories().find((candidate) => candidate.id === repositoryId);
    if (!repository) return;

    this.form.patchValue({
      name: repository.name,
      provider: 'GITHUB',
      repositoryId: repository.id,
      repositoryUrl: repository.repositoryUrl,
      defaultBranch: repository.defaultBranch,
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue());
  }

  private loadGitHubRepositories(): void {
    this.repositoriesLoading.set(true);
    this.repositoriesError.set(null);
    this.sourceControlApi
      .listGitHubRepositories()
      .pipe(
        catchError((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Could not load GitHub repos.';
          this.repositoriesError.set(message);
          return of([]);
        }),
      )
      .subscribe((repositories) => {
        this.repositories.set(repositories);
        this.repositoriesLoading.set(false);
      });
  }
}

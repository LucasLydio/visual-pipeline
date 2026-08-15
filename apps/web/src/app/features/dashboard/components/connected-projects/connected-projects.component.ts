import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFolderGit2, lucideSearch, lucideSettings, lucideX } from '@ng-icons/lucide';
import { WorkspaceProject } from '../../../../core/models/team.models';
import { simpleBitbucket, simpleDocker, simpleGithub, simpleGitlab } from '@ng-icons/simple-icons';

@Component({
  selector: 'vp-connected-projects',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideFolderGit2,
      lucideSearch,
      lucideSettings,
      lucideX,
      simpleBitbucket,
      simpleDocker,
      simpleGithub,
      simpleGitlab,
    }),
  ],
  templateUrl: './connected-projects.component.html',
  styleUrl: './connected-projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectedProjectsComponent {
  @Input({ required: true }) projects: readonly WorkspaceProject[] = [];
  @Input() query = '';
  @Input() selectedProject: WorkspaceProject | null = null;
  @Output() queryChange = new EventEmitter<string>();
  @Output() projectFocused = new EventEmitter<WorkspaceProject>();
  @Output() projectManaged = new EventEmitter<WorkspaceProject>();
  protected readonly dialogOpen = signal(false);

  readonly providerIconMap: Record<string, string> = {
    GITHUB: 'simpleGithub',
    GITLAB: 'simpleGitlab',
    BITBUCKET: 'simpleBitbucket',
    DOCKER: 'simpleDocker',
  };
  readonly statusClassMap: Record<string, string> = {
    ACTIVE: 'dot-green',
    PAUSED: 'dot-red',
    ARCHIVED: 'dot-gray',
    ARCHIEVED: 'dot-gray',
  };

  protected focus(project: WorkspaceProject): void {
    this.projectFocused.emit(project);
    this.dialogOpen.set(false);
  }

  protected manage(project: WorkspaceProject): void {
    this.dialogOpen.set(false);
    this.projectManaged.emit(project);
  }
}

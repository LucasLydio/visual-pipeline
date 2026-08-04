import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideSettings, lucideGithub } from '@ng-icons/lucide';
import { WorkspaceProject } from '../../../../core/models/team.models';
import { simpleBitbucket, simpleDocker, simpleGithub, simpleGitlab } from '@ng-icons/simple-icons';

@Component({
  selector: 'vp-connected-projects',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideSearch,
      lucideSettings,
      lucideGithub,
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
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock3, lucideGitBranch, lucideUsers } from '@ng-icons/lucide';
import { simpleBitbucket, simpleGithub, simpleGitlab } from '@ng-icons/simple-icons';

import { QueuedProject, SourceProvider } from '../../../../core/models/pipeline.models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'vp-project-queue',
  imports: [NgIcon, StatusBadgeComponent],
  providers: [
    provideIcons({
      lucideClock3,
      lucideGitBranch,
      lucideUsers,
      simpleBitbucket,
      simpleGithub,
      simpleGitlab,
    }),
  ],
  templateUrl: './project-queue.component.html',
  styleUrl: './project-queue.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectQueueComponent {
  readonly projects = input.required<readonly QueuedProject[]>();
  readonly membersSelected = output<QueuedProject>();

  protected providerIcon(provider: SourceProvider): string {
    return {
      GitHub: 'simpleGithub',
      GitLab: 'simpleGitlab',
      Bitbucket: 'simpleBitbucket',
    }[provider];
  }
}

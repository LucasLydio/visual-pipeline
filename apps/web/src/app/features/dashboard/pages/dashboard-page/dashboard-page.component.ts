import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw } from '@ng-icons/lucide';

import { MockScenario, QueuedProject } from '../../../../core/models/pipeline.models';
import { DeploymentHistoryComponent } from '../../components/deployment-history/deployment-history.component';
import { ProjectQueueComponent } from '../../components/project-queue/project-queue.component';
import { TeamMembersDialogComponent } from '../../components/team-members-dialog/team-members-dialog.component';
import { DashboardFacade } from '../../data-access/dashboard.facade';

@Component({
  selector: 'vp-dashboard-page',
  imports: [NgIcon, DeploymentHistoryComponent, ProjectQueueComponent, TeamMembersDialogComponent],
  providers: [DashboardFacade],
  viewProviders: [provideIcons({ lucideRefreshCw })],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly facade = inject(DashboardFacade);
  protected readonly selectedProject = signal<QueuedProject | null>(null);

  protected selectScenario(event: Event): void {
    this.selectedProject.set(null);
    this.facade.selectScenario((event.target as HTMLSelectElement).value as MockScenario);
  }
}

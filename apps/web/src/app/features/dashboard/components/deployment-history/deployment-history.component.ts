import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGitBranch, lucideHistory, lucideSearch } from '@ng-icons/lucide';

import { DeploymentRecord } from '../../../../core/models/pipeline.models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'vp-deployment-history',
  imports: [NgIcon, StatusBadgeComponent],
  providers: [provideIcons({ lucideGitBranch, lucideHistory, lucideSearch })],
  templateUrl: './deployment-history.component.html',
  styleUrl: './deployment-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentHistoryComponent {
  readonly deployments = input.required<readonly DeploymentRecord[]>();
  readonly query = input.required<string>();
  readonly queryChange = output<string>();

  protected updateQuery(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}

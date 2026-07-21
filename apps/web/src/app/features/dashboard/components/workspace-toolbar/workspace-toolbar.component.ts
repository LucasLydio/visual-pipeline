import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideRefreshCw, lucideUserPlus } from '@ng-icons/lucide';
import { WorkspaceOverview } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-workspace-toolbar',
  imports: [NgIcon],
  providers: [provideIcons({ lucidePlus, lucideRefreshCw, lucideUserPlus })],
  templateUrl: './workspace-toolbar.component.html',
  styleUrl: './workspace-toolbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceToolbarComponent {
  @Input({ required: true }) overview!: WorkspaceOverview;
  @Input() loading = false;
  @Output() teamSelected = new EventEmitter<string>();
  @Output() createTeam = new EventEmitter<void>();
  @Output() syncProject = new EventEmitter<void>();
  @Output() addMember = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideSettings } from '@ng-icons/lucide';
import { WorkspaceProject } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-connected-projects',
  imports: [NgIcon],
  providers: [provideIcons({ lucideSearch, lucideSettings })],
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
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideSearch } from '@ng-icons/lucide';
import { WorkspaceProject } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-connected-projects',
  imports: [NgIcon],
  providers: [provideIcons({ lucideArchive, lucideSearch })],
  templateUrl: './connected-projects.component.html',
  styleUrl: './connected-projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectedProjectsComponent {
  @Input({ required: true }) projects: readonly WorkspaceProject[] = [];
  @Input() query = '';
  @Input() selectedProject: WorkspaceProject | null = null;
  @Output() queryChange = new EventEmitter<string>();
  @Output() projectSelected = new EventEmitter<WorkspaceProject>();
  @Output() archiveProject = new EventEmitter<WorkspaceProject>();
}

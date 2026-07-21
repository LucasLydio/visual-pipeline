import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkspaceProject } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-project-detail-dialog',
  templateUrl: './project-detail-dialog.component.html',
  styleUrl: './project-detail-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailDialogComponent {
  @Input() project: WorkspaceProject | null = null;
  @Output() closed = new EventEmitter<void>();
}

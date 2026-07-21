import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { WorkspaceMember } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-member-roster',
  imports: [NgIcon],
  providers: [provideIcons({ lucidePencil, lucideTrash2 })],
  templateUrl: './member-roster.component.html',
  styleUrl: './member-roster.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberRosterComponent {
  @Input({ required: true }) members: readonly WorkspaceMember[] = [];
  @Output() editMember = new EventEmitter<WorkspaceMember>();
  @Output() removeMember = new EventEmitter<WorkspaceMember>();
}

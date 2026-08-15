import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2, lucideUsers, lucideX } from '@ng-icons/lucide';
import { WorkspaceMember } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-member-roster',
  imports: [NgIcon],
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideUsers, lucideX })],
  templateUrl: './member-roster.component.html',
  styleUrl: './member-roster.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberRosterComponent {
  @Input({ required: true }) members: readonly WorkspaceMember[] = [];
  @Output() editMember = new EventEmitter<WorkspaceMember>();
  @Output() removeMember = new EventEmitter<WorkspaceMember>();

  protected readonly dialogOpen = signal(false);

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);

    return initials.toUpperCase();
  }

  protected canRemove(member: WorkspaceMember): boolean {
    return member.role !== 'OWNER' && member.role !== 'ADMIN';
  }

  protected edit(member: WorkspaceMember): void {
    this.dialogOpen.set(false);
    this.editMember.emit(member);
  }

  protected remove(member: WorkspaceMember): void {
    this.dialogOpen.set(false);
    this.removeMember.emit(member);
  }
}

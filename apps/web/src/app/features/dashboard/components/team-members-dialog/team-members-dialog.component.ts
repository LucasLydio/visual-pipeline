import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideX } from '@ng-icons/lucide';

import { QueuedProject } from '../../../../core/models/pipeline.models';

interface RoleCount {
  readonly role: string;
  readonly count: number;
}

@Component({
  selector: 'vp-team-members-dialog',
  imports: [NgIcon],
  providers: [provideIcons({ lucideUsers, lucideX })],
  templateUrl: './team-members-dialog.component.html',
  styleUrl: './team-members-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMembersDialogComponent {
  readonly project = input.required<QueuedProject | null>();
  readonly closed = output<void>();

  protected readonly roleCounts = computed<readonly RoleCount[]>(() => {
    const roles = new Map<string, number>();

    for (const member of this.project()?.members ?? []) {
      roles.set(member.role, (roles.get(member.role) ?? 0) + 1);
    }

    return [...roles].map(([role, count]) => ({ role, count }));
  });

  protected closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}

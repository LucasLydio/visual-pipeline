import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AddTeamMemberRequest,
  TeamRole,
  UpdateTeamMemberRequest,
  WorkspaceMember,
} from '../../../../core/models/team.models';

@Component({
  selector: 'vp-member-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './member-dialog.component.html',
  styleUrl: './member-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDialogComponent {
  @Output() saved = new EventEmitter<AddTeamMemberRequest | UpdateTeamMemberRequest>();
  @Output() closed = new EventEmitter<void>();
  protected readonly roles: readonly TeamRole[] = ['ADMIN', 'MAINTAINER', 'DEVELOPER', 'VIEWER'];

  protected readonly form = new FormBuilder().nonNullable.group({
    email: ['', [Validators.email]],
    role: ['DEVELOPER' as TeamRole, Validators.required],
    title: [''],
  });
  protected editing = false;

  @Input() set member(member: WorkspaceMember | null) {
    this.editing = Boolean(member);
    this.form.patchValue({
      email: member?.email ?? '',
      role: member?.role === 'OWNER' ? 'ADMIN' : (member?.role ?? 'DEVELOPER'),
      title: member?.title ?? '',
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saved.emit(
      this.editing
        ? { role: value.role, title: value.title || null }
        : { email: value.email, role: value.role, title: value.title || undefined },
    );
  }
}

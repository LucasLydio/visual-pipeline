import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AddTeamMemberRequest,
  CreateProjectRequest,
  CreateTeamRequest,
  UpdateProjectRequest,
  UpdateTeamMemberRequest,
  WorkspaceMember,
  WorkspaceProject,
} from '../../../../core/models/team.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ConnectedProjectsComponent } from '../../components/connected-projects/connected-projects.component';
import { LoginGuideComponent } from '../../components/login-guide/login-guide.component';
import { MemberDialogComponent } from '../../components/member-dialog/member-dialog.component';
import { MemberRosterComponent } from '../../components/member-roster/member-roster.component';
import { ProjectDetailDialogComponent } from '../../components/project-detail-dialog/project-detail-dialog.component';
import { ProjectDialogComponent } from '../../components/project-dialog/project-dialog.component';
import { TeamDialogComponent } from '../../components/team-dialog/team-dialog.component';
import { WorkspaceToolbarComponent } from '../../components/workspace-toolbar/workspace-toolbar.component';
import { DashboardFacade } from '../../data-access/dashboard.facade';

@Component({
  selector: 'vp-dashboard-page',
  imports: [
    ConfirmDialogComponent,
    ConnectedProjectsComponent,
    LoginGuideComponent,
    MemberDialogComponent,
    MemberRosterComponent,
    ProjectDetailDialogComponent,
    ProjectDialogComponent,
    TeamDialogComponent,
    WorkspaceToolbarComponent,
  ],
  providers: [DashboardFacade],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly facade = inject(DashboardFacade);
  protected readonly showTeamDialog = signal(false);
  protected readonly showProjectDialog = signal(false);
  protected readonly editingMember = signal<WorkspaceMember | null>(null);
  protected readonly showMemberDialog = signal(false);
  protected readonly memberToRemove = signal<WorkspaceMember | null>(null);
  protected readonly projectToArchive = signal<WorkspaceProject | null>(null);
  protected readonly projectToUnarchive = signal<WorkspaceProject | null>(null);
  protected readonly projectToUnsync = signal<WorkspaceProject | null>(null);

  protected createTeam(dto: CreateTeamRequest): void {
    this.facade.createTeam(dto).subscribe(() => this.showTeamDialog.set(false));
  }

  protected saveMember(dto: AddTeamMemberRequest | UpdateTeamMemberRequest): void {
    const member = this.editingMember();
    const request$ = member
      ? this.facade.updateMember(member.id, dto as UpdateTeamMemberRequest)
      : this.facade.addMember(dto as AddTeamMemberRequest);

    request$.subscribe(() => {
      this.editingMember.set(null);
      this.showMemberDialog.set(false);
    });
  }

  protected createProject(dto: CreateProjectRequest): void {
    this.facade.createProject(dto).subscribe(() => this.showProjectDialog.set(false));
  }

  protected updateProject(dto: UpdateProjectRequest): void {
    const project = this.facade.selectedProject();
    if (!project) return;

    this.facade.updateProject(project.id, dto).subscribe();
  }

  protected openMemberDialog(member?: WorkspaceMember): void {
    this.editingMember.set(member ?? null);
    this.showMemberDialog.set(true);
  }

  protected closeMemberDialog(): void {
    this.editingMember.set(null);
    this.showMemberDialog.set(false);
  }

  protected confirmRemoveMember(): void {
    const member = this.memberToRemove();
    if (!member) return;

    this.facade.removeMember(member.id).subscribe(() => this.memberToRemove.set(null));
  }

  protected confirmArchiveProject(): void {
    const project = this.projectToArchive();
    if (!project) return;

    this.facade.archiveProject(project.id).subscribe(() => this.projectToArchive.set(null));
  }

  protected confirmUnarchiveProject(): void {
    const project = this.projectToUnarchive();
    if (!project) return;

    this.facade.unarchiveProject(project.id).subscribe(() => this.projectToUnarchive.set(null));
  }

  protected confirmUnsyncProject(): void {
    const project = this.projectToUnsync();
    if (!project) return;

    this.facade.unsyncProject(project.id).subscribe(() => this.projectToUnsync.set(null));
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CreatePipelineRequest,
  CreatePipelineTemplateRequest,
  PipelineStep,
  PipelineStepRequest,
  PipelineTemplate,
  PipelineTemplateStep,
  PipelineTemplateStepRequest,
  ProjectPipeline,
  UpdatePipelineRequest,
  UpdatePipelineTemplateRequest,
} from '../../../../core/models/pipeline-api.models';
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
import { PipelineDialogComponent } from '../../components/pipeline-dialog/pipeline-dialog.component';
import { PipelineManagerComponent } from '../../components/pipeline-manager/pipeline-manager.component';
import { PipelineStepDialogComponent } from '../../components/pipeline-step-dialog/pipeline-step-dialog.component';
import { PipelineTemplateDialogComponent } from '../../components/pipeline-template-dialog/pipeline-template-dialog.component';
import { ProjectDetailDialogComponent } from '../../components/project-detail-dialog/project-detail-dialog.component';
import { ProjectDialogComponent } from '../../components/project-dialog/project-dialog.component';
import { TeamDialogComponent } from '../../components/team-dialog/team-dialog.component';
import { WorkspaceToolbarComponent } from '../../components/workspace-toolbar/workspace-toolbar.component';
import {
  DashboardPipelineFacade,
  PipelineStepTarget,
} from '../../data-access/dashboard-pipeline.facade';
import { DashboardFacade } from '../../data-access/dashboard.facade';
import { ToastViewportComponent } from '../../../../shared/ui/toast-viewport/toast-viewport.component';

@Component({
  selector: 'vp-dashboard-page',
  imports: [
    ConfirmDialogComponent,
    ConnectedProjectsComponent,
    LoginGuideComponent,
    MemberDialogComponent,
    MemberRosterComponent,
    PipelineDialogComponent,
    PipelineManagerComponent,
    PipelineStepDialogComponent,
    PipelineTemplateDialogComponent,
    ProjectDetailDialogComponent,
    ProjectDialogComponent,
    TeamDialogComponent,
    ToastViewportComponent,
    WorkspaceToolbarComponent,
  ],
  providers: [DashboardFacade, DashboardPipelineFacade],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly facade = inject(DashboardFacade);
  protected readonly pipelineFacade = inject(DashboardPipelineFacade);
  protected readonly showTeamDialog = signal(false);
  protected readonly showProjectDialog = signal(false);
  protected readonly showTemplateDialog = signal(false);
  protected readonly showPipelineDialog = signal(false);
  protected readonly editingTemplate = signal<PipelineTemplate | null>(null);
  protected readonly editingPipeline = signal<ProjectPipeline | null>(null);
  protected readonly stepTarget = signal<PipelineStepTarget | null>(null);
  protected readonly editingMember = signal<WorkspaceMember | null>(null);
  protected readonly showMemberDialog = signal(false);
  protected readonly memberToRemove = signal<WorkspaceMember | null>(null);
  protected readonly projectToArchive = signal<WorkspaceProject | null>(null);
  protected readonly projectToUnarchive = signal<WorkspaceProject | null>(null);
  protected readonly projectToUnsync = signal<WorkspaceProject | null>(null);
  protected readonly templateToArchive = signal<PipelineTemplate | null>(null);
  protected readonly pipelineToArchive = signal<ProjectPipeline | null>(null);
  protected readonly stepToDelete = signal<PipelineStepTarget | null>(null);

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

  protected focusProject(project: WorkspaceProject): void {
    const teamId = this.facade.state().overview?.activeTeam?.id ?? null;
    this.pipelineFacade.focusProject(project, teamId);
  }

  protected openProjectManagement(project: WorkspaceProject): void {
    this.facade.selectedProject.set(project);
  }

  protected openTemplateDialog(template?: PipelineTemplate): void {
    this.editingTemplate.set(template ?? null);
    this.showTemplateDialog.set(true);
  }

  protected saveTemplate(dto: CreatePipelineTemplateRequest | UpdatePipelineTemplateRequest): void {
    const template = this.editingTemplate();
    const teamId = this.facade.state().overview?.activeTeam?.id;
    const request$ = template
      ? this.pipelineFacade.updateTemplate(template.id, dto as UpdatePipelineTemplateRequest)
      : teamId
        ? this.pipelineFacade.createTemplate(teamId, dto as CreatePipelineTemplateRequest)
        : null;

    request$?.subscribe((ok) => {
      if (!ok) return;
      this.editingTemplate.set(null);
      this.showTemplateDialog.set(false);
    });
  }

  protected openPipelineDialog(pipeline?: ProjectPipeline): void {
    this.editingPipeline.set(pipeline ?? null);
    this.showPipelineDialog.set(true);
  }

  protected savePipeline(dto: CreatePipelineRequest | UpdatePipelineRequest): void {
    const pipeline = this.editingPipeline();
    const project = this.pipelineFacade.focusedProject();
    const request$ = pipeline
      ? this.pipelineFacade.updatePipeline(pipeline.id, dto as UpdatePipelineRequest)
      : project
        ? this.pipelineFacade.createPipeline(project.id, dto as CreatePipelineRequest)
        : null;

    request$?.subscribe((ok) => {
      if (!ok) return;
      this.editingPipeline.set(null);
      this.showPipelineDialog.set(false);
    });
  }

  protected addTemplateStep(template: PipelineTemplate): void {
    this.stepTarget.set({ type: 'template', templateId: template.id });
  }

  protected editTemplateStep(step: PipelineTemplateStep): void {
    this.stepTarget.set({ type: 'template', templateId: step.templateId, step });
  }

  protected addPipelineStep(pipeline: ProjectPipeline): void {
    this.stepTarget.set({ type: 'pipeline', pipelineId: pipeline.id });
  }

  protected editPipelineStep(step: PipelineStep): void {
    this.stepTarget.set({ type: 'pipeline', pipelineId: step.pipelineId, step });
  }

  protected saveStep(dto: PipelineStepRequest | PipelineTemplateStepRequest): void {
    const target = this.stepTarget();
    if (!target) return;

    const request$ =
      target.type === 'template'
        ? target.step
          ? this.pipelineFacade.updateTemplateStep(target.step.id, dto)
          : this.pipelineFacade.createTemplateStep(
              target.templateId,
              dto as PipelineTemplateStepRequest,
            )
        : target.step
          ? this.pipelineFacade.updatePipelineStep(target.step.id, dto)
          : this.pipelineFacade.createPipelineStep(target.pipelineId, dto as PipelineStepRequest);

    request$.subscribe((ok) => {
      if (ok) this.stepTarget.set(null);
    });
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

  protected confirmArchiveTemplate(): void {
    const template = this.templateToArchive();
    if (!template) return;

    this.pipelineFacade.archiveTemplate(template.id).subscribe((ok) => {
      if (ok) this.templateToArchive.set(null);
    });
  }

  protected confirmArchivePipeline(): void {
    const pipeline = this.pipelineToArchive();
    if (!pipeline) return;

    this.pipelineFacade.archivePipeline(pipeline.id).subscribe((ok) => {
      if (ok) this.pipelineToArchive.set(null);
    });
  }

  protected confirmDeleteStep(): void {
    const target = this.stepToDelete();
    if (!target?.step) return;

    const request$ =
      target.type === 'template'
        ? this.pipelineFacade.deleteTemplateStep(target.step.id)
        : this.pipelineFacade.deletePipelineStep(target.step.id);

    request$.subscribe((ok) => {
      if (ok) this.stepToDelete.set(null);
    });
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideCode2,
  lucideFilePlus2,
  lucideGitBranch,
  lucideHistory,
  lucideListPlus,
  lucidePencil,
  lucidePlay,
  lucidePlus,
  lucideTerminal,
  lucideTrash2,
  lucideWorkflow,
  lucideSettings2,
  lucideGitlab,
  lucideCircleCheck,
  lucideStopCircle,
  lucideTimer,
  lucideMessageCircleWarning,
  lucideHourglass,
  lucidePackagePlus,
} from '@ng-icons/lucide';

import {
  PipelineRun,
  PipelineStep,
  PipelineStepRunStatus,
  PipelineTemplate,
  PipelineTemplateStep,
  ProjectPipeline,
} from '../../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../../core/models/team.models';
import { simpleBitbucket, simpleDocker, simpleGithub, simpleGitlab } from '@ng-icons/simple-icons';

@Component({
  selector: 'vp-pipeline-manager',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideArchive,
      lucideCode2,
      lucideFilePlus2,
      lucideGitBranch,
      lucideHistory,
      lucideListPlus,
      lucidePencil,
      lucidePlay,
      lucidePlus,
      lucideTerminal,
      lucideTrash2,
      lucideWorkflow,
      lucideSettings2,
      lucideGitlab,
      simpleBitbucket,
      simpleDocker,
      simpleGithub,
      simpleGitlab,
      lucideCircleCheck,
      lucideStopCircle,
      lucideTimer,
      lucideMessageCircleWarning,
      lucideHourglass,
      lucidePackagePlus,
    }),
  ],
  templateUrl: './pipeline-manager.component.html',
  styleUrls: ['./pipeline-manager.component.css', './pipeline-manager-canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineManagerComponent {
  @Input() project: WorkspaceProject | null = null;
  @Input() loading = false;
  @Input() templates: readonly PipelineTemplate[] = [];
  @Input() pipelines: readonly ProjectPipeline[] = [];
  @Input() error: string | null = null;
  @Input() selectedPipeline: ProjectPipeline | null = null;
  @Input() selectedTemplate: PipelineTemplate | null = null;
  @Input() latestRun: PipelineRun | null = null;
  @Input() statusChanges: ReadonlySet<string> = new Set();

  @Output() createTemplate = new EventEmitter<void>();
  @Output() editTemplate = new EventEmitter<PipelineTemplate>();
  @Output() archiveTemplate = new EventEmitter<PipelineTemplate>();
  @Output() addTemplateStep = new EventEmitter<PipelineTemplate>();
  @Output() importTemplateSteps = new EventEmitter<PipelineTemplate>();
  @Output() editTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() inspectTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() deleteTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() createPipeline = new EventEmitter<void>();
  @Output() editPipeline = new EventEmitter<ProjectPipeline>();
  @Output() archivePipeline = new EventEmitter<ProjectPipeline>();
  @Output() addPipelineStep = new EventEmitter<ProjectPipeline>();
  @Output() importPipelineSteps = new EventEmitter<ProjectPipeline>();
  @Output() editPipelineStep = new EventEmitter<PipelineStep>();
  @Output() inspectPipelineStep = new EventEmitter<PipelineStep>();
  @Output() deletePipelineStep = new EventEmitter<PipelineStep>();
  @Output() pipelineSelected = new EventEmitter<ProjectPipeline>();
  @Output() templateSelected = new EventEmitter<PipelineTemplate>();
  @Output() runPipeline = new EventEmitter<ProjectPipeline>();
  @Output() viewRuns = new EventEmitter<ProjectPipeline>();
  @Output() setupWorkflow = new EventEmitter<WorkspaceProject>();
  protected isCanvasDragging = false;
  private canvasDragStartX = 0;
  private canvasDragScrollLeft = 0;
  private canvasMovedDuringDrag = false;

  readonly statusClassMap: Record<string, string> = {
    ACTIVE: 'dot-green',
    PAUSED: 'dot-red',
    ARCHIVED: 'dot-gray',
    ARCHIEVED: 'dot-gray',
  };

  readonly providerIconMap: Record<string, string> = {
    GITHUB: 'simpleGithub',
    GITLAB: 'simpleGitlab',
    BITBUCKET: 'simpleBitbucket',
    DOCKER: 'simpleDocker',
  };

  readonly pipelineStatus: Record<string, string> = {
    PASSED: 'lucideCircleCheck',
    FAILED: 'lucideMessageCircleWarning',
    CANCELLED: 'lucideStopCircle',
    RUNNING: 'lucideTimer',
    QUEUED: 'lucideHourglass',
  };

  protected selectTemplate(template: PipelineTemplate): void {
    this.templateSelected.emit(template);
  }

  protected orderedTemplateSteps(template: PipelineTemplate): readonly PipelineTemplateStep[] {
    return [...template.steps].sort((left, right) => left.order - right.order);
  }

  protected orderedPipelineSteps(pipeline: ProjectPipeline): readonly PipelineStep[] {
    return [...pipeline.steps].sort((left, right) => left.order - right.order);
  }

  protected stepRunStatus(step: PipelineStep): PipelineStepRunStatus | null {
    return (
      this.latestRun?.steps.find((runStep) => runStep.pipelineStepId === step.id)?.status ?? null
    );
  }

  protected stepRunClass(step: PipelineStep): string {
    const status = this.stepRunStatus(step);

    return status ? `run-${status.toLowerCase()}` : '';
  }

  protected selectedPipelineSteps(): readonly PipelineStep[] {
    return this.selectedPipeline ? this.orderedPipelineSteps(this.selectedPipeline) : [];
  }

  protected activeTemplateSteps(): readonly PipelineTemplateStep[] {
    const template =
      this.selectedTemplate ?? this.templates.find((candidate) => candidate.isActive);
    return template ? this.orderedTemplateSteps(template) : [];
  }

  protected nodeIcon(step: PipelineStep | PipelineTemplateStep): string {
    return step.command ? 'lucideTerminal' : 'lucideCode2';
  }

  protected isLatestRunChanged(): boolean {
    return Boolean(this.latestRun && this.statusChanges.has(this.latestRun.id));
  }

  protected isStepStatusChanged(step: PipelineStep): boolean {
    const runStep = this.latestRun?.steps.find((candidate) => candidate.pipelineStepId === step.id);

    return Boolean(runStep && this.statusChanges.has(runStep.id));
  }

  protected startCanvasDrag(event: PointerEvent, board: HTMLElement): void {
    if (event.button !== 0) return;

    this.isCanvasDragging = true;
    this.canvasMovedDuringDrag = false;
    this.canvasDragStartX = event.clientX;
    this.canvasDragScrollLeft = board.scrollLeft;
    board.setPointerCapture(event.pointerId);
  }

  protected dragCanvas(event: PointerEvent, board: HTMLElement): void {
    if (!this.isCanvasDragging) return;

    const distance = event.clientX - this.canvasDragStartX;
    if (Math.abs(distance) > 3) this.canvasMovedDuringDrag = true;
    board.scrollLeft = this.canvasDragScrollLeft - distance;
  }

  protected stopCanvasDrag(event: PointerEvent, board: HTMLElement): void {
    if (!this.isCanvasDragging) return;

    this.isCanvasDragging = false;
    if (board.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
  }

  protected inspectPipelineStepFromCanvas(step: PipelineStep): void {
    if (this.consumeCanvasDragClick()) return;
    this.inspectPipelineStep.emit(step);
  }

  protected createPipelineStepFromCanvas(pipeline: ProjectPipeline): void {
    if (this.consumeCanvasDragClick()) return;
    this.addPipelineStep.emit(pipeline);
  }

  protected createPipelineFromCanvas(): void {
    if (this.consumeCanvasDragClick()) return;
    this.createPipeline.emit();
  }

  private consumeCanvasDragClick(): boolean {
    if (!this.canvasMovedDuringDrag) return false;

    this.canvasMovedDuringDrag = false;
    return true;
  }
}

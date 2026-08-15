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
  lucideGitlab
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
    }),
  ],
  templateUrl: './pipeline-manager.component.html',
  styleUrl: './pipeline-manager.component.css',
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
  @Output() editTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() inspectTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() deleteTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() createPipeline = new EventEmitter<void>();
  @Output() editPipeline = new EventEmitter<ProjectPipeline>();
  @Output() archivePipeline = new EventEmitter<ProjectPipeline>();
  @Output() addPipelineStep = new EventEmitter<ProjectPipeline>();
  @Output() editPipelineStep = new EventEmitter<PipelineStep>();
  @Output() inspectPipelineStep = new EventEmitter<PipelineStep>();
  @Output() deletePipelineStep = new EventEmitter<PipelineStep>();
  @Output() pipelineSelected = new EventEmitter<ProjectPipeline>();
  @Output() templateSelected = new EventEmitter<PipelineTemplate>();
  @Output() runPipeline = new EventEmitter<ProjectPipeline>();
  @Output() viewRuns = new EventEmitter<ProjectPipeline>();
  @Output() setupWorkflow = new EventEmitter<WorkspaceProject>();

  templateButton: PipelineTemplate | null = null;

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

  protected selectTemplate(template: PipelineTemplate) {
    this.templateButton = template;
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
}

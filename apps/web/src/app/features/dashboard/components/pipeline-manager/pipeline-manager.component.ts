import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideFilePlus2,
  lucideListPlus,
  lucidePencil,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';

import {
  PipelineStep,
  PipelineTemplate,
  PipelineTemplateStep,
  ProjectPipeline,
} from '../../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../../core/models/team.models';

@Component({
  selector: 'vp-pipeline-manager',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideArchive,
      lucideFilePlus2,
      lucideListPlus,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
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

  @Output() createTemplate = new EventEmitter<void>();
  @Output() editTemplate = new EventEmitter<PipelineTemplate>();
  @Output() archiveTemplate = new EventEmitter<PipelineTemplate>();
  @Output() addTemplateStep = new EventEmitter<PipelineTemplate>();
  @Output() editTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() deleteTemplateStep = new EventEmitter<PipelineTemplateStep>();
  @Output() createPipeline = new EventEmitter<void>();
  @Output() editPipeline = new EventEmitter<ProjectPipeline>();
  @Output() archivePipeline = new EventEmitter<ProjectPipeline>();
  @Output() addPipelineStep = new EventEmitter<ProjectPipeline>();
  @Output() editPipelineStep = new EventEmitter<PipelineStep>();
  @Output() deletePipelineStep = new EventEmitter<PipelineStep>();
  @Output() pipelineSelected = new EventEmitter<ProjectPipeline>();
  @Output() templateSelected = new EventEmitter<PipelineTemplate>();

  protected orderedTemplateSteps(template: PipelineTemplate): readonly PipelineTemplateStep[] {
    return [...template.steps].sort((left, right) => left.order - right.order);
  }

  protected orderedPipelineSteps(pipeline: ProjectPipeline): readonly PipelineStep[] {
    return [...pipeline.steps].sort((left, right) => left.order - right.order);
  }
}

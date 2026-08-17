import { Injectable, inject, signal } from '@angular/core';

import {
  PipelineStepRequest,
  PipelineTemplate,
  PipelineTemplateStepRequest,
  ProjectPipeline,
} from '../../../core/models/pipeline-api.models';
import { PackageImportTarget, PackageScriptImportStep } from '../models/package-json-import.models';
import { DashboardPipelineFacade } from './dashboard-pipeline.facade';
import { PipelineStepTarget } from './dashboard-pipeline.types';

@Injectable()
export class DashboardPackageImportFacade {
  private readonly pipelineFacade = inject(DashboardPipelineFacade);
  readonly target = signal<PackageImportTarget | null>(null);

  openTemplate(template: PipelineTemplate): void {
    this.target.set({
      type: 'template',
      templateId: template.id,
      label: `template ${template.name}`,
    });
  }

  openPipeline(pipeline: ProjectPipeline): void {
    this.target.set({
      type: 'pipeline',
      pipelineId: pipeline.id,
      label: `pipeline ${pipeline.name}`,
    });
  }

  close(): void {
    this.target.set(null);
  }

  existingOrders(target: PackageImportTarget): readonly number[] {
    const stepTarget: PipelineStepTarget =
      target.type === 'template'
        ? { type: 'template', templateId: target.templateId }
        : { type: 'pipeline', pipelineId: target.pipelineId };

    return this.targetSteps(stepTarget).map((step) => step.order);
  }

  importScripts(steps: readonly PackageScriptImportStep[]): void {
    const target = this.target();
    if (!target) return;

    const request$ =
      target.type === 'template'
        ? this.pipelineFacade.createTemplateSteps(
            target.templateId,
            steps.map((step) => this.toTemplateStepRequest(step)),
          )
        : this.pipelineFacade.createPipelineSteps(
            target.pipelineId,
            steps.map((step) => this.toPipelineStepRequest(step)),
          );

    request$.subscribe((ok) => {
      if (ok) this.close();
    });
  }

  private targetSteps(target: PipelineStepTarget) {
    if (target.type === 'template') {
      return (
        this.pipelineFacade.state().templates.find((template) => template.id === target.templateId)
          ?.steps ?? []
      );
    }

    return (
      this.pipelineFacade.state().pipelines.find((pipeline) => pipeline.id === target.pipelineId)
        ?.steps ?? []
    );
  }

  private toTemplateStepRequest(step: PackageScriptImportStep): PipelineTemplateStepRequest {
    return {
      name: step.name,
      description: 'Imported from package.json scripts.',
      order: step.order,
      command: step.command,
      isRequired: true,
      isEnabled: true,
    };
  }

  private toPipelineStepRequest(step: PackageScriptImportStep): PipelineStepRequest {
    return {
      name: step.name,
      order: step.order,
      command: step.command,
      isRequired: true,
      isEnabled: true,
    };
  }
}

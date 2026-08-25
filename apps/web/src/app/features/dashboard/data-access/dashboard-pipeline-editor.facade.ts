import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';

import {
  CreatePipelineRequest,
  ProjectPipeline,
  UpdatePipelineRequest,
} from '../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../core/models/team.models';
import { PipelineDialogSave } from '../models/pipeline-step-draft.models';
import { DashboardPipelineFacade } from './dashboard-pipeline.facade';
import { PipelineStepDraftSyncService } from './pipeline-step-draft-sync.service';

@Injectable()
export class DashboardPipelineEditorFacade {
  private readonly pipelineFacade = inject(DashboardPipelineFacade);
  private readonly stepSync = inject(PipelineStepDraftSyncService);

  save(
    pipeline: ProjectPipeline | null,
    project: WorkspaceProject | null,
    payload: PipelineDialogSave,
  ): Observable<boolean> {
    if (!pipeline) {
      return project
        ? this.pipelineFacade.createPipeline(project.id, payload.pipeline as CreatePipelineRequest)
        : of(false);
    }

    return this.pipelineFacade
      .updatePipeline(pipeline.id, payload.pipeline as UpdatePipelineRequest)
      .pipe(
        switchMap((ok) => (ok ? this.stepSync.sync(pipeline, payload.steps ?? []) : of(false))),
        tap((ok) => ok && this.pipelineFacade.refresh()),
      );
  }
}

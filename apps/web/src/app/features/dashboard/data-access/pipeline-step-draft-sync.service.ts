import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, from, map, of, tap, toArray } from 'rxjs';

import { PipelineApi } from '../../../core/api/pipeline-api';
import { SessionRefreshRequiredError } from '../../../core/errors/session-refresh-required.error';
import { PipelineStepRequest, ProjectPipeline } from '../../../core/models/pipeline-api.models';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import { PipelineStepDraft } from '../models/pipeline-step-draft.models';
import { dashboardErrorMessage } from './dashboard-error-message';

@Injectable({ providedIn: 'root' })
export class PipelineStepDraftSyncService {
  private readonly api = inject(PipelineApi);
  private readonly toast = inject(ToastNotificationService);

  sync(pipeline: ProjectPipeline, drafts: readonly PipelineStepDraft[]): Observable<boolean> {
    const operations = this.createOperations(pipeline, drafts);
    if (operations.length === 0) return of(true);

    return from(operations).pipe(
      concatMap((operation) => operation()),
      toArray(),
      tap(() => this.toast.success('Pipeline steps updated.')),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) return of(false);

        this.toast.error(dashboardErrorMessage(error, 'Could not update pipeline steps.'));
        return of(false);
      }),
    );
  }

  private createOperations(
    pipeline: ProjectPipeline,
    drafts: readonly PipelineStepDraft[],
  ): readonly (() => Observable<unknown>)[] {
    const normalizedDrafts = drafts.map((draft, index) => ({
      ...draft,
      name: draft.name.trim(),
      command: draft.command.trim(),
      order: index + 1,
    }));
    const draftStepIds = new Set(normalizedDrafts.flatMap((draft) => draft.stepId ?? []));
    const originalById = new Map(pipeline.steps.map((step) => [step.id, step]));
    const deletedSteps = pipeline.steps.filter((step) => !draftStepIds.has(step.id));
    const existingDrafts = normalizedDrafts.filter((draft) => draft.stepId);
    const createdDrafts = normalizedDrafts.filter((draft) => !draft.stepId);
    const maxOrder = Math.max(
      0,
      ...pipeline.steps.map((step) => step.order),
      normalizedDrafts.length,
    );
    const tempBase = maxOrder + normalizedDrafts.length + 1000;
    const reorderedDrafts = existingDrafts.filter((draft) => {
      const original = originalById.get(draft.stepId ?? '');
      return original && original.order !== draft.order;
    });

    return [
      ...deletedSteps.map((step) => () => this.api.deletePipelineStep(step.id)),
      ...reorderedDrafts.map(
        (draft, index) => () =>
          this.api.updatePipelineStep(draft.stepId ?? '', { order: tempBase + index }),
      ),
      ...existingDrafts
        .filter((draft) => this.hasChanges(originalById.get(draft.stepId ?? ''), draft))
        .map(
          (draft) => () =>
            this.api.updatePipelineStep(draft.stepId ?? '', this.toStepRequest(draft)),
        ),
      ...createdDrafts.map(
        (draft) => () => this.api.createPipelineStep(pipeline.id, this.toStepRequest(draft)),
      ),
    ];
  }

  private hasChanges(
    original: ProjectPipeline['steps'][number] | undefined,
    draft: PipelineStepDraft,
  ): boolean {
    if (!original) return false;
    return (
      original.name !== draft.name ||
      (original.command ?? '') !== draft.command ||
      original.order !== draft.order ||
      original.isRequired !== draft.isRequired ||
      original.isEnabled !== draft.isEnabled
    );
  }

  private toStepRequest(draft: PipelineStepDraft): PipelineStepRequest {
    return {
      name: draft.name,
      command: draft.command || null,
      order: draft.order,
      isRequired: draft.isRequired,
      isEnabled: draft.isEnabled,
    };
  }
}

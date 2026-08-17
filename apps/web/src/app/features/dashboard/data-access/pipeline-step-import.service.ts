import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, from, map, of, tap, toArray } from 'rxjs';

import { PipelineApi } from '../../../core/api/pipeline-api';
import { SessionRefreshRequiredError } from '../../../core/errors/session-refresh-required.error';
import {
  PipelineStepRequest,
  PipelineTemplateStepRequest,
} from '../../../core/models/pipeline-api.models';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import { dashboardErrorMessage } from './dashboard-error-message';

@Injectable({ providedIn: 'root' })
export class PipelineStepImportService {
  private readonly api = inject(PipelineApi);
  private readonly toast = inject(ToastNotificationService);

  createTemplateSteps(
    templateId: string,
    steps: readonly PipelineTemplateStepRequest[],
  ): Observable<boolean> {
    return this.run(
      steps,
      (step) => this.api.createTemplateStep(templateId, step),
      `${steps.length} template steps imported.`,
    );
  }

  createPipelineSteps(
    pipelineId: string,
    steps: readonly PipelineStepRequest[],
  ): Observable<boolean> {
    return this.run(
      steps,
      (step) => this.api.createPipelineStep(pipelineId, step),
      `${steps.length} pipeline steps imported.`,
    );
  }

  private run<T>(
    items: readonly T[],
    action: (item: T) => Observable<unknown>,
    successMessage: string,
  ): Observable<boolean> {
    if (items.length === 0) return of(false);

    return from(items).pipe(
      concatMap((item) => action(item)),
      toArray(),
      tap(() => this.toast.success(successMessage)),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) return of(false);

        this.toast.error(dashboardErrorMessage(error, 'Import failed.'));
        return of(false);
      }),
    );
  }
}

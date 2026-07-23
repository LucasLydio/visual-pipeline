import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { PipelineApi } from '../../../core/api/pipeline-api';
import { SessionRefreshRequiredError } from '../../../core/errors/session-refresh-required.error';
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
} from '../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../core/models/team.models';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

interface PipelineContext {
  readonly project: WorkspaceProject | null;
  readonly teamId: string | null;
}

interface PipelineState {
  readonly loading: boolean;
  readonly templates: readonly PipelineTemplate[];
  readonly pipelines: readonly ProjectPipeline[];
  readonly error: string | null;
}

@Injectable()
export class DashboardPipelineFacade {
  private readonly api = inject(PipelineApi);
  private readonly toast = inject(ToastNotificationService);
  private readonly context$ = new BehaviorSubject<PipelineContext>({
    project: null,
    teamId: null,
  });

  readonly selectedPipeline = signal<ProjectPipeline | null>(null);
  readonly selectedTemplate = signal<PipelineTemplate | null>(null);
  readonly focusedProject = signal<WorkspaceProject | null>(null);

  readonly state = toSignal(
    this.context$.pipe(
      switchMap(({ project, teamId }) => {
        if (!project || !teamId) {
          return of(this.emptyState(false));
        }

        return forkJoin({
          templates: this.api.listTemplates(teamId, true),
          pipelines: this.api.listPipelines(project.id),
        }).pipe(
          map(({ templates, pipelines }): PipelineState => ({
            loading: false,
            templates,
            pipelines,
            error: null,
          })),
          startWith(this.emptyState(true)),
          catchError((error: unknown) => {
            if (error instanceof SessionRefreshRequiredError) {
              return of(this.emptyState(false));
            }

            const message = this.errorMessage(error, 'Unable to load pipelines.');
            this.toast.error(message);
            return of({
              ...this.emptyState(false),
              error: message,
            });
          }),
        );
      }),
    ),
    { initialValue: this.emptyState(false) },
  );

  readonly activeTemplates = computed(() =>
    this.state().templates.filter((template) => template.isActive),
  );

  focusProject(project: WorkspaceProject | null, teamId: string | null): void {
    this.focusedProject.set(project);
    this.selectedPipeline.set(null);
    this.selectedTemplate.set(null);
    this.context$.next({ project, teamId });
  }

  refresh(): void {
    this.context$.next(this.context$.value);
  }

  createTemplate(teamId: string, dto: CreatePipelineTemplateRequest): Observable<boolean> {
    return this.run(this.api.createTemplate(teamId, dto), 'Pipeline template created.');
  }

  updateTemplate(templateId: string, dto: UpdatePipelineTemplateRequest): Observable<boolean> {
    return this.run(this.api.updateTemplate(templateId, dto), 'Pipeline template updated.');
  }

  archiveTemplate(templateId: string): Observable<boolean> {
    return this.run(this.api.archiveTemplate(templateId), 'Pipeline template archived.');
  }

  createTemplateStep(templateId: string, dto: PipelineTemplateStepRequest): Observable<boolean> {
    return this.run(this.api.createTemplateStep(templateId, dto), 'Template step added.');
  }

  updateTemplateStep(
    stepId: string,
    dto: Partial<PipelineTemplateStepRequest>,
  ): Observable<boolean> {
    return this.run(this.api.updateTemplateStep(stepId, dto), 'Template step updated.');
  }

  deleteTemplateStep(stepId: string): Observable<boolean> {
    return this.run(this.api.deleteTemplateStep(stepId), 'Template step deleted.');
  }

  createPipeline(projectId: string, dto: CreatePipelineRequest): Observable<boolean> {
    return this.run(this.api.createPipeline(projectId, dto), 'Pipeline created.');
  }

  updatePipeline(pipelineId: string, dto: UpdatePipelineRequest): Observable<boolean> {
    return this.run(this.api.updatePipeline(pipelineId, dto), 'Pipeline updated.');
  }

  archivePipeline(pipelineId: string): Observable<boolean> {
    return this.run(this.api.archivePipeline(pipelineId), 'Pipeline archived.');
  }

  createPipelineStep(pipelineId: string, dto: PipelineStepRequest): Observable<boolean> {
    return this.run(this.api.createPipelineStep(pipelineId, dto), 'Pipeline step added.');
  }

  updatePipelineStep(stepId: string, dto: Partial<PipelineStepRequest>): Observable<boolean> {
    return this.run(this.api.updatePipelineStep(stepId, dto), 'Pipeline step updated.');
  }

  deletePipelineStep(stepId: string): Observable<boolean> {
    return this.run(this.api.deletePipelineStep(stepId), 'Pipeline step deleted.');
  }

  private run(action$: Observable<unknown>, successMessage: string): Observable<boolean> {
    return action$.pipe(
      tap(() => {
        this.toast.success(successMessage);
        this.refresh();
      }),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) {
          return of(false);
        }

        this.toast.error(this.errorMessage(error, 'Action failed.'));
        return of(false);
      }),
    );
  }

  private emptyState(loading: boolean): PipelineState {
    return { loading, templates: [], pipelines: [], error: null };
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error && 'error' in error) {
      const apiError = error as { error?: { message?: string | string[] } };
      const message = apiError.error?.message;
      return Array.isArray(message) ? message.join(', ') : (message ?? fallback);
    }

    return fallback;
  }
}

export type PipelineStepTarget =
  | { readonly type: 'pipeline'; readonly pipelineId: string; readonly step?: PipelineStep }
  | {
      readonly type: 'template';
      readonly templateId: string;
      readonly step?: PipelineTemplateStep;
    };

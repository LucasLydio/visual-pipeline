import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';

import { PipelineApi } from '../../../core/api/pipeline-api';
import { SessionRefreshRequiredError } from '../../../core/errors/session-refresh-required.error';
import {
  CreatePipelineRequest,
  CreatePipelineRunRequest,
  CreatePipelineTemplateRequest,
  PipelineRun,
  PipelineRunStatusSnapshot,
  PipelineStepRequest,
  PipelineTemplate,
  PipelineTemplateStepRequest,
  ProjectPipeline,
  UpdatePipelineRequest,
  UpdatePipelineTemplateRequest,
} from '../../../core/models/pipeline-api.models';
import { WorkspaceProject } from '../../../core/models/team.models';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import {
  PipelineContext,
  PipelineRunsState,
  PipelineState,
  WorkflowSetupState,
} from './dashboard-pipeline.types';
import { dashboardErrorMessage } from './dashboard-error-message';
import { PipelineStepImportService } from './pipeline-step-import.service';

@Injectable()
export class DashboardPipelineFacade {
  private readonly api = inject(PipelineApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastNotificationService);
  private readonly stepImport = inject(PipelineStepImportService);
  private readonly context$ = new BehaviorSubject<PipelineContext>({
    project: null,
    teamId: null,
  });
  private readonly selectedPipelineId$ = new BehaviorSubject<string | null>(null);

  readonly selectedPipeline = signal<ProjectPipeline | null>(null);
  readonly selectedTemplate = signal<PipelineTemplate | null>(null);
  readonly focusedProject = signal<WorkspaceProject | null>(null);
  readonly runsState = signal<PipelineRunsState>(this.emptyRunsState(false));
  readonly statusChanges = signal<ReadonlySet<string>>(new Set());
  readonly workflowSetupState = signal<WorkflowSetupState>({
    loading: false,
    setup: null,
    error: null,
  });

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

            const message = dashboardErrorMessage(error, 'Unable to load pipelines.');
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
  readonly latestRun = computed(() => this.runsState().runs[0] ?? null);

  constructor() {
    this.bindRunPolling();
  }

  focusProject(project: WorkspaceProject | null, teamId: string | null): void {
    this.focusedProject.set(project);
    this.selectedPipeline.set(null);
    this.selectedTemplate.set(null);
    this.selectedPipelineId$.next(null);
    this.context$.next({ project, teamId });
  }

  selectPipeline(pipeline: ProjectPipeline): void {
    this.selectedPipeline.set(pipeline);
    this.selectedTemplate.set(null);
    this.selectedPipelineId$.next(pipeline.id);
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

  createTemplateSteps(
    templateId: string,
    steps: readonly PipelineTemplateStepRequest[],
  ): Observable<boolean> {
    return this.stepImport
      .createTemplateSteps(templateId, steps)
      .pipe(tap((ok) => ok && this.refresh()));
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

  createPipelineSteps(
    pipelineId: string,
    steps: readonly PipelineStepRequest[],
  ): Observable<boolean> {
    return this.stepImport
      .createPipelineSteps(pipelineId, steps)
      .pipe(tap((ok) => ok && this.refresh()));
  }

  updatePipelineStep(stepId: string, dto: Partial<PipelineStepRequest>): Observable<boolean> {
    return this.run(this.api.updatePipelineStep(stepId, dto), 'Pipeline step updated.');
  }

  deletePipelineStep(stepId: string): Observable<boolean> {
    return this.run(this.api.deletePipelineStep(stepId), 'Pipeline step deleted.');
  }

  triggerPipelineRun(
    pipeline: ProjectPipeline,
    dto: CreatePipelineRunRequest = {},
  ): Observable<boolean> {
    return this.api.triggerPipelineRun(pipeline.id, dto).pipe(
      tap(() => {
        this.toast.success('Pipeline run queued.');
        this.refreshRuns();
      }),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) return of(false);

        this.toast.error(dashboardErrorMessage(error, 'Could not queue pipeline run.'));
        return of(false);
      }),
    );
  }

  cancelPipelineRun(run: PipelineRun): Observable<boolean> {
    return this.api.cancelPipelineRun(run.id).pipe(
      tap(() => {
        this.toast.success('Pipeline run canceled.');
        this.refreshRuns();
      }),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof SessionRefreshRequiredError) return of(false);

        this.toast.error(dashboardErrorMessage(error, 'Could not cancel pipeline run.'));
        return of(false);
      }),
    );
  }

  loadWorkflowSetup(project: WorkspaceProject): void {
    this.workflowSetupState.set({ loading: true, setup: null, error: null });
    this.api
      .getWorkflowSetup(project.id)
      .pipe(
        catchError((error: unknown) => {
          if (error instanceof SessionRefreshRequiredError) {
            return of(null);
          }

          const message = dashboardErrorMessage(error, 'Could not load workflow setup.');
          this.toast.error(message);
          this.workflowSetupState.set({ loading: false, setup: null, error: message });
          return of(null);
        }),
      )
      .subscribe((setup) => {
        if (setup) this.workflowSetupState.set({ loading: false, setup, error: null });
      });
  }

  rotateWorkflowToken(project: WorkspaceProject): void {
    this.workflowSetupState.update((state) => ({ ...state, loading: true, error: null }));
    this.api
      .rotateWorkflowToken(project.id)
      .pipe(
        catchError((error: unknown) => {
          if (error instanceof SessionRefreshRequiredError) {
            return of(null);
          }

          const message = dashboardErrorMessage(error, 'Could not create workflow token.');
          this.toast.error(message);
          this.workflowSetupState.update((state) => ({
            ...state,
            loading: false,
            error: message,
          }));
          return of(null);
        }),
      )
      .subscribe((setup) => {
        if (!setup) return;
        this.workflowSetupState.set({ loading: false, setup, error: null });
        this.toast.success('Workflow token created. Add it as a GitHub secret.');
      });
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

        this.toast.error(dashboardErrorMessage(error, 'Action failed.'));
        return of(false);
      }),
    );
  }

  private emptyState(loading: boolean): PipelineState {
    return { loading, templates: [], pipelines: [], error: null };
  }

  private refreshRuns(): void {
    this.selectedPipelineId$.next(this.selectedPipelineId$.value);
  }

  private bindRunPolling(): void {
    this.selectedPipelineId$
      .pipe(
        switchMap((pipelineId) => {
          if (!pipelineId) {
            this.runsState.set(this.emptyRunsState(false));
            return EMPTY;
          }

          this.runsState.set(this.emptyRunsState(true));
          return this.api.listPipelineRuns(pipelineId).pipe(
            tap((runs) => {
              this.runsState.set({ loading: false, runs, error: null });
            }),
            switchMap((runs) => this.pollActiveRun(runs)),
            catchError((error: unknown) => {
              if (error instanceof SessionRefreshRequiredError) {
                this.runsState.set(this.emptyRunsState(false));
                return EMPTY;
              }

              const message = dashboardErrorMessage(error, 'Unable to load pipeline runs.');
              this.toast.error(message);
              this.runsState.set({ ...this.emptyRunsState(false), error: message });
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private pollActiveRun(runs: readonly PipelineRun[]): Observable<PipelineRunStatusSnapshot> {
    const activeRun = runs.find((run) => this.isRunActive(run));
    if (!activeRun) return EMPTY;

    return timer(1500, 3000).pipe(
      switchMap(() => this.api.getPipelineRunStatus(activeRun.id)),
      tap((snapshot) => this.applyRunStatusSnapshot(snapshot)),
      takeWhile((snapshot) => this.isStatusActive(snapshot.status), true),
    );
  }

  private applyRunStatusSnapshot(snapshot: PipelineRunStatusSnapshot): void {
    const previous = this.runsState().runs.find((run) => run.id === snapshot.id);
    const changedIds = new Set<string>();
    const runs = this.runsState().runs.map((run) => {
      if (run.id !== snapshot.id) return run;
      if (run.status !== snapshot.status) changedIds.add(run.id);

      return {
        ...run,
        status: snapshot.status,
        failureReason: snapshot.failureReason,
        startedAt: snapshot.startedAt,
        finishedAt: snapshot.finishedAt,
        updatedAt: snapshot.updatedAt,
        steps: run.steps.map((step) => {
          const updatedStep = snapshot.steps.find((candidate) => candidate.id === step.id);
          if (!updatedStep) return step;
          if (step.status !== updatedStep.status) changedIds.add(step.id);

          return { ...step, ...updatedStep };
        }),
      };
    });

    this.runsState.set({ loading: false, runs, error: null });
    if (previous && changedIds.size > 0) this.flashStatusChanges(changedIds);
  }

  private flashStatusChanges(ids: ReadonlySet<string>): void {
    this.statusChanges.set(ids);
    window.setTimeout(() => this.statusChanges.set(new Set()), 1400);
  }

  private isRunActive(run: PipelineRun): boolean {
    return this.isStatusActive(run.status);
  }

  private isStatusActive(status: string): boolean {
    return status === 'QUEUED' || status === 'RUNNING';
  }

  private emptyRunsState(loading: boolean): PipelineRunsState {
    return { loading, runs: [], error: null };
  }
}

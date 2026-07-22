import { Observable } from 'rxjs';

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
} from '../models/pipeline-api.models';

export abstract class PipelineApi {
  abstract listTemplates(
    teamId: string,
    includeInactive?: boolean,
  ): Observable<readonly PipelineTemplate[]>;
  abstract createTemplate(
    teamId: string,
    dto: CreatePipelineTemplateRequest,
  ): Observable<PipelineTemplate>;
  abstract updateTemplate(
    templateId: string,
    dto: UpdatePipelineTemplateRequest,
  ): Observable<PipelineTemplate>;
  abstract archiveTemplate(templateId: string): Observable<PipelineTemplate>;
  abstract createTemplateStep(
    templateId: string,
    dto: PipelineTemplateStepRequest,
  ): Observable<PipelineTemplateStep>;
  abstract updateTemplateStep(
    stepId: string,
    dto: Partial<PipelineTemplateStepRequest>,
  ): Observable<PipelineTemplateStep>;
  abstract deleteTemplateStep(stepId: string): Observable<void>;
  abstract listPipelines(projectId: string): Observable<readonly ProjectPipeline[]>;
  abstract createPipeline(
    projectId: string,
    dto: CreatePipelineRequest,
  ): Observable<ProjectPipeline>;
  abstract updatePipeline(
    pipelineId: string,
    dto: UpdatePipelineRequest,
  ): Observable<ProjectPipeline>;
  abstract archivePipeline(pipelineId: string): Observable<ProjectPipeline>;
  abstract createPipelineStep(
    pipelineId: string,
    dto: PipelineStepRequest,
  ): Observable<PipelineStep>;
  abstract updatePipelineStep(
    stepId: string,
    dto: Partial<PipelineStepRequest>,
  ): Observable<PipelineStep>;
  abstract deletePipelineStep(stepId: string): Observable<void>;
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
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
import { AuthSessionService } from '../services/auth-session.service';
import { PipelineApi } from './pipeline-api';

@Injectable()
export class HttpPipelineApiService implements PipelineApi {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);
  private readonly baseUrl = environment.apiBaseUrl;

  listTemplates(teamId: string, includeInactive = true): Observable<readonly PipelineTemplate[]> {
    const params = new HttpParams().set('includeInactive', String(includeInactive));
    return this.http.get<readonly PipelineTemplate[]>(
      `${this.baseUrl}/teams/${teamId}/pipeline-templates`,
      { headers: this.authHeaders(), params },
    );
  }

  createTemplate(teamId: string, dto: CreatePipelineTemplateRequest): Observable<PipelineTemplate> {
    return this.http.post<PipelineTemplate>(
      `${this.baseUrl}/teams/${teamId}/pipeline-templates`,
      dto,
      { headers: this.authHeaders() },
    );
  }

  updateTemplate(
    templateId: string,
    dto: UpdatePipelineTemplateRequest,
  ): Observable<PipelineTemplate> {
    return this.http.patch<PipelineTemplate>(
      `${this.baseUrl}/pipeline-templates/${templateId}`,
      dto,
      { headers: this.authHeaders() },
    );
  }

  archiveTemplate(templateId: string): Observable<PipelineTemplate> {
    return this.http.delete<PipelineTemplate>(`${this.baseUrl}/pipeline-templates/${templateId}`, {
      headers: this.authHeaders(),
    });
  }

  createTemplateStep(
    templateId: string,
    dto: PipelineTemplateStepRequest,
  ): Observable<PipelineTemplateStep> {
    return this.http.post<PipelineTemplateStep>(
      `${this.baseUrl}/pipeline-templates/${templateId}/steps`,
      dto,
      { headers: this.authHeaders() },
    );
  }

  updateTemplateStep(
    stepId: string,
    dto: Partial<PipelineTemplateStepRequest>,
  ): Observable<PipelineTemplateStep> {
    return this.http.patch<PipelineTemplateStep>(
      `${this.baseUrl}/pipeline-template-steps/${stepId}`,
      dto,
      { headers: this.authHeaders() },
    );
  }

  deleteTemplateStep(stepId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pipeline-template-steps/${stepId}`, {
      headers: this.authHeaders(),
    });
  }

  listPipelines(projectId: string): Observable<readonly ProjectPipeline[]> {
    return this.http.get<readonly ProjectPipeline[]>(
      `${this.baseUrl}/projects/${projectId}/pipelines`,
      { headers: this.authHeaders() },
    );
  }

  createPipeline(projectId: string, dto: CreatePipelineRequest): Observable<ProjectPipeline> {
    return this.http.post<ProjectPipeline>(`${this.baseUrl}/projects/${projectId}/pipelines`, dto, {
      headers: this.authHeaders(),
    });
  }

  updatePipeline(pipelineId: string, dto: UpdatePipelineRequest): Observable<ProjectPipeline> {
    return this.http.patch<ProjectPipeline>(`${this.baseUrl}/pipelines/${pipelineId}`, dto, {
      headers: this.authHeaders(),
    });
  }

  archivePipeline(pipelineId: string): Observable<ProjectPipeline> {
    return this.http.delete<ProjectPipeline>(`${this.baseUrl}/pipelines/${pipelineId}`, {
      headers: this.authHeaders(),
    });
  }

  createPipelineStep(pipelineId: string, dto: PipelineStepRequest): Observable<PipelineStep> {
    return this.http.post<PipelineStep>(`${this.baseUrl}/pipelines/${pipelineId}/steps`, dto, {
      headers: this.authHeaders(),
    });
  }

  updatePipelineStep(stepId: string, dto: Partial<PipelineStepRequest>): Observable<PipelineStep> {
    return this.http.patch<PipelineStep>(`${this.baseUrl}/pipeline-steps/${stepId}`, dto, {
      headers: this.authHeaders(),
    });
  }

  deletePipelineStep(stepId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pipeline-steps/${stepId}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authSession.getSession()?.accessToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}

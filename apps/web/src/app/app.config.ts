import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { LeadApi } from './core/api/lead-api';
import { PipelineApi } from './core/api/pipeline-api';
import { MockLeadApiService } from './core/testing/mock-lead-api.service';
import { MockPipelineApiService } from './core/testing/mock-pipeline-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: PipelineApi, useClass: MockPipelineApiService },
    { provide: LeadApi, useClass: MockLeadApiService },
  ],
};

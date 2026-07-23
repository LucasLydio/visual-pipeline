import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpPipelineApiService } from './core/api/http-pipeline-api.service';
import { HttpTeamApiService } from './core/api/http-team-api.service';
import { PipelineApi } from './core/api/pipeline-api';
import { TeamApi } from './core/api/team-api';
import { sessionExpiredInterceptor } from './core/interceptors/session-expired.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
    { provide: TeamApi, useClass: HttpTeamApiService },
    { provide: PipelineApi, useClass: HttpPipelineApiService },
  ],
};

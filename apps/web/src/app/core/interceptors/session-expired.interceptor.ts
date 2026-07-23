import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionRefreshRequiredError } from '../errors/session-refresh-required.error';
import { AuthSessionService } from '../services/auth-session.service';
import { SessionRefreshService } from '../services/session-refresh.service';

const SESSION_RETRY_ATTEMPTED = new HttpContextToken<boolean>(() => false);

export const sessionExpiredInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const sessionRefresh = inject(SessionRefreshService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!shouldRefresh(request.url, error, request.context.get(SESSION_RETRY_ATTEMPTED))) {
        return throwError(() => error);
      }

      if (!authSession.getSession()) {
        return throwError(() => new SessionRefreshRequiredError('Sign in again to continue.'));
      }

      return sessionRefresh.requestRefresh().pipe(
        switchMap((tokens) =>
          next(
            request.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
              context: request.context.set(SESSION_RETRY_ATTEMPTED, true),
            }),
          ),
        ),
        catchError((refreshError: unknown) =>
          throwError(() =>
            refreshError instanceof Error ? refreshError : new SessionRefreshRequiredError(),
          ),
        ),
      );
    }),
  );
};

function shouldRefresh(url: string, error: unknown, retryAttempted: boolean): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === 401 &&
    !retryAttempted &&
    url.startsWith(environment.apiBaseUrl) &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/login') &&
    !url.includes('/auth/register') &&
    !url.includes('/auth/github')
  );
}

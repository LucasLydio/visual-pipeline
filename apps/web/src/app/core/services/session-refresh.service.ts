import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionRefreshRequiredError } from '../errors/session-refresh-required.error';
import { AuthSessionService, AuthSessionTokens } from './auth-session.service';
import { ToastNotificationService } from './toast-notification.service';

interface RefreshResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly refreshExpiresAt: string;
}

export interface SessionRefreshState {
  readonly visible: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
}

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly toast = inject(ToastNotificationService);
  private pendingRefresh: ReplaySubject<AuthSessionTokens> | null = null;

  readonly state = signal<SessionRefreshState>({
    visible: false,
    refreshing: false,
    error: null,
  });

  requestRefresh(): Observable<AuthSessionTokens> {
    const session = this.authSession.getSession();

    if (!session?.refreshToken) {
      return throwError(() => new SessionRefreshRequiredError('Sign in again to continue.'));
    }

    if (this.pendingRefresh) {
      this.open();
      return this.pendingRefresh.asObservable();
    }

    this.pendingRefresh = new ReplaySubject<AuthSessionTokens>(1);
    this.open();

    return this.pendingRefresh.asObservable();
  }

  refreshNow(): void {
    const session = this.authSession.getSession();
    if (!session?.refreshToken || this.state().refreshing) return;

    this.state.set({ visible: true, refreshing: true, error: null });
    this.http
      .post<RefreshResponse>(`${environment.apiBaseUrl}/auth/refresh`, {
        refreshToken: session.refreshToken,
      })
      .subscribe({
        next: (tokens) => this.completeRefresh({ ...tokens, provider: session.provider }),
        error: (error: unknown) => this.failRefresh(error),
      });
  }

  signInAgain(): void {
    this.rejectPending('Sign in again to continue.');
    this.authSession.clearSession();
    this.state.set({ visible: false, refreshing: false, error: null });
    void this.router.navigateByUrl('/');
  }

  private open(): void {
    this.state.set({ visible: true, refreshing: false, error: null });
  }

  private completeRefresh(tokens: AuthSessionTokens): void {
    this.authSession.saveSession(tokens);
    this.toast.success('Session refreshed.');
    this.state.set({ visible: false, refreshing: false, error: null });
    this.pendingRefresh?.next(tokens);
    this.pendingRefresh?.complete();
    this.pendingRefresh = null;
  }

  private failRefresh(error: unknown): void {
    const message = this.errorMessage(error);
    this.toast.error(message);
    this.state.set({ visible: true, refreshing: false, error: message });
    this.rejectPending(message);
    this.authSession.clearSession();
  }

  private rejectPending(message: string): void {
    this.pendingRefresh?.error(new SessionRefreshRequiredError(message));
    this.pendingRefresh = null;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }

    return 'Could not refresh your session.';
  }
}

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export interface AuthSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  provider: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'visual-pipeline.auth-session';
  readonly session = signal<AuthSessionTokens | null>(this.readSession());

  saveSession(tokens: AuthSessionTokens): void {
    this.document.defaultView?.localStorage.setItem(this.storageKey, JSON.stringify(tokens));
    this.session.set(tokens);
  }

  getSession(): AuthSessionTokens | null {
    return this.session();
  }

  clearSession(): void {
    this.document.defaultView?.localStorage.removeItem(this.storageKey);
    this.session.set(null);
  }

  private readSession(): AuthSessionTokens | null {
    const rawSession = this.document.defaultView?.localStorage.getItem(this.storageKey) ?? null;

    return rawSession ? (JSON.parse(rawSession) as AuthSessionTokens) : null;
  }
}

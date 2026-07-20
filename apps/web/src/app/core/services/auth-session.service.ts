import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

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

  saveSession(tokens: AuthSessionTokens): void {
    this.document.defaultView?.localStorage.setItem(
      this.storageKey,
      JSON.stringify(tokens),
    );
  }

  getSession(): AuthSessionTokens | null {
    const rawSession =
      this.document.defaultView?.localStorage.getItem(this.storageKey) ?? null;

    return rawSession ? (JSON.parse(rawSession) as AuthSessionTokens) : null;
  }

  clearSession(): void {
    this.document.defaultView?.localStorage.removeItem(this.storageKey);
  }
}

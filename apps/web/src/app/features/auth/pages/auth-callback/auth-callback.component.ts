import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideLoaderCircle } from '@ng-icons/lucide';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'vp-auth-callback',
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ lucideAlertCircle, lucideLoaderCircle })],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly queryParams = new URLSearchParams(
    this.router.parseUrl(this.router.url).queryParams as Record<string, string>,
  );

  protected readonly error = this.queryParams.get('error');
  protected readonly isSuccess = computed(() => !this.error);

  constructor() {
    if (this.error) {
      return;
    }

    const accessToken = this.queryParams.get('accessToken');
    const refreshToken = this.queryParams.get('refreshToken');
    const expiresAt = this.queryParams.get('expiresAt');
    const refreshExpiresAt = this.queryParams.get('refreshExpiresAt');
    const provider = this.queryParams.get('provider') ?? 'github';
    const redirectTo = this.safeRedirect(this.queryParams.get('redirectTo'));

    if (!accessToken || !refreshToken || !expiresAt || !refreshExpiresAt) {
      return;
    }

    this.authSession.saveSession({
      accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
      provider,
    });

    void this.router.navigateByUrl(redirectTo, { replaceUrl: true });
  }

  private safeRedirect(redirectTo: string | null): string {
    if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) {
      return '/app';
    }

    return redirectTo;
  }
}

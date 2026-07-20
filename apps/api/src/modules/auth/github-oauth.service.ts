import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import type { PublicUser } from '../users/users.types.js';
import type { AuthResponse } from './auth.service.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import type { SessionMetadata } from './session.service.js';
import { SessionService } from './session.service.js';

interface GithubStatePayload {
  nonce: string;
  redirectTo: string;
  exp: number;
}

interface GithubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GithubUserResponse {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface GithubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface GithubAccessToken {
  accessToken: string;
  scopes: Set<string>;
}

interface ResolvedGithubEmail {
  email: string;
  verified: boolean;
}

@Injectable()
export class GithubOAuthService {
  private readonly authorizationUrl =
    'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userUrl = 'https://api.github.com/user';
  private readonly emailsUrl = 'https://api.github.com/user/emails';

  constructor(
    private readonly configService: ConfigService,
    private readonly githubStrategy: GithubStrategy,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {}

  buildAuthorizationUrl(redirectTo?: string): string {
    const config = this.getGithubConfig();
    const url = new URL(this.authorizationUrl);

    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('scope', 'read:user user:email');
    url.searchParams.set('state', this.createState(redirectTo));

    return url.toString();
  }

  async handleCallback(
    code: string | undefined,
    state: string | undefined,
    metadata: SessionMetadata,
  ): Promise<AuthResponse & { redirectTo: string }> {
    if (!code) {
      throw new BadRequestException('GitHub authorization code is required.');
    }

    const statePayload = this.verifyState(state);
    const githubToken = await this.exchangeCodeForToken(code);
    const githubUser = await this.fetchGithubUser(githubToken.accessToken);
    const githubEmail = await this.resolveGithubEmail(githubToken, githubUser);
    const profile = this.githubStrategy.normalizeProfile({
      providerAccountId: String(githubUser.id),
      username: githubUser.login,
      email: githubEmail.email,
      displayName: githubUser.name ?? githubUser.login,
      avatarUrl: githubUser.avatar_url ?? undefined,
    });

    if (!profile.email || !profile.displayName) {
      throw new UnauthorizedException('GitHub account email is required.');
    }

    const user = await this.findOrCreateGithubUser({
      providerAccountId: profile.providerAccountId,
      username: profile.username,
      email: profile.email,
      emailVerified: githubEmail.verified,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    });
    const session = await this.sessionService.createSession(user.id, metadata);
    await this.usersService.markLogin(user.id);

    return {
      user,
      ...session,
      redirectTo: statePayload.redirectTo,
    };
  }

  buildFrontendCallbackUrl(
    result: AuthResponse & { redirectTo: string },
  ): string {
    const callbackUrl = new URL(this.getFrontendCallbackUrl());

    callbackUrl.searchParams.set('provider', 'github');
    callbackUrl.searchParams.set('accessToken', result.accessToken);
    callbackUrl.searchParams.set('refreshToken', result.refreshToken);
    callbackUrl.searchParams.set('expiresAt', result.expiresAt.toISOString());
    callbackUrl.searchParams.set(
      'refreshExpiresAt',
      result.refreshExpiresAt.toISOString(),
    );
    callbackUrl.searchParams.set('redirectTo', result.redirectTo);

    return callbackUrl.toString();
  }

  buildFrontendErrorUrl(message: string): string {
    const callbackUrl = new URL(this.getFrontendCallbackUrl());

    callbackUrl.searchParams.set('provider', 'github');
    callbackUrl.searchParams.set('error', message);

    return callbackUrl.toString();
  }

  private async findOrCreateGithubUser(profile: {
    providerAccountId: string;
    username?: string;
    email: string;
    emailVerified: boolean;
    displayName: string;
    avatarUrl?: string;
  }): Promise<PublicUser> {
    const existingAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'GITHUB',
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      await this.prisma.authAccount.update({
        where: { id: existingAccount.id },
        data: {
          username: profile.username,
          avatarUrl: profile.avatarUrl,
        },
      });

      if (existingAccount.user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User is not active.');
      }

      return this.usersService.toPublicUser(existingAccount.user);
    }

    const existingUser = await this.usersService.findSecretByEmail(
      profile.email,
    );
    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          email: profile.email,
          displayName: profile.displayName,
          emailVerifiedAt: profile.emailVerified ? new Date() : null,
          status: 'ACTIVE',
        },
      }));

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active.');
    }

    await this.prisma.authAccount.create({
      data: {
        userId: user.id,
        provider: 'GITHUB',
        providerAccountId: profile.providerAccountId,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    });

    return this.usersService.toPublicUser(user);
  }

  private async exchangeCodeForToken(code: string): Promise<GithubAccessToken> {
    const config = this.getGithubConfig();
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
      }),
    });
    const tokenResponse = (await response.json()) as GithubTokenResponse;

    if (!response.ok || !tokenResponse.access_token) {
      throw new UnauthorizedException(
        tokenResponse.error_description ??
          tokenResponse.error ??
          'GitHub token exchange failed.',
      );
    }

    return {
      accessToken: tokenResponse.access_token,
      scopes: this.parseScopes(tokenResponse.scope),
    };
  }

  private async fetchGithubUser(
    accessToken: string,
  ): Promise<GithubUserResponse> {
    const response = await fetch(this.userUrl, {
      headers: this.githubApiHeaders(accessToken),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Could not fetch GitHub profile.');
    }

    return (await response.json()) as GithubUserResponse;
  }

  private async resolveGithubEmail(
    token: GithubAccessToken,
    user: GithubUserResponse,
  ): Promise<ResolvedGithubEmail> {
    if (user.email) {
      return {
        email: user.email.trim().toLowerCase(),
        verified: true,
      };
    }

    if (!token.scopes.has('user:email')) {
      return this.githubNoReplyEmail(user);
    }

    const response = await fetch(this.emailsUrl, {
      headers: this.githubApiHeaders(token.accessToken),
    });

    if (!response.ok) {
      return this.githubNoReplyEmail(user);
    }

    const emails = (await response.json()) as GithubEmailResponse[];
    const primaryVerifiedEmail = emails.find(
      (email) => email.primary && email.verified,
    );
    const verifiedEmail =
      primaryVerifiedEmail ?? emails.find((email) => email.verified);

    if (verifiedEmail) {
      return {
        email: verifiedEmail.email.trim().toLowerCase(),
        verified: true,
      };
    }

    return this.githubNoReplyEmail(user);
  }

  private githubNoReplyEmail(user: GithubUserResponse): ResolvedGithubEmail {
    return {
      email: `${user.id}+${user.login}@users.noreply.github.com`.toLowerCase(),
      verified: false,
    };
  }

  private parseScopes(scope?: string): Set<string> {
    return new Set(
      scope
        ?.split(/[,\s]+/)
        .map((value) => value.trim())
        .filter(Boolean) ?? [],
    );
  }

  private createState(redirectTo?: string): string {
    const payload: GithubStatePayload = {
      nonce: randomBytes(16).toString('base64url'),
      redirectTo: this.normalizeRedirectTo(redirectTo),
      exp: Date.now() + 10 * 60 * 1000,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  private verifyState(state?: string): GithubStatePayload {
    if (!state) {
      throw new BadRequestException('GitHub OAuth state is required.');
    }

    const [encodedPayload, signature] = state.split('.');

    if (
      !encodedPayload ||
      !signature ||
      !this.isValidSignature(encodedPayload, signature)
    ) {
      throw new BadRequestException('Invalid GitHub OAuth state.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as GithubStatePayload;

    if (payload.exp < Date.now()) {
      throw new BadRequestException('GitHub OAuth state expired.');
    }

    return {
      ...payload,
      redirectTo: this.normalizeRedirectTo(payload.redirectTo),
    };
  }

  private isValidSignature(encodedPayload: string, signature: string): boolean {
    const expectedSignature = this.sign(encodedPayload);
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private sign(encodedPayload: string): string {
    return createHmac('sha256', this.getStateSecret())
      .update(encodedPayload)
      .digest('base64url');
  }

  private normalizeRedirectTo(redirectTo?: string): string {
    if (!redirectTo?.startsWith('/')) {
      return '/app';
    }

    if (redirectTo.startsWith('//')) {
      return '/app';
    }

    return redirectTo;
  }

  private githubApiHeaders(accessToken: string): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'visual-pipeline-api',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private getGithubConfig(): {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  } {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackUrl = this.configService.get<string>('GITHUB_CALLBACK_URL');

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new ServiceUnavailableException('GitHub OAuth is not configured.');
    }

    return { clientId, clientSecret, callbackUrl };
  }

  private getFrontendCallbackUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_AUTH_CALLBACK_URL') ??
      'http://localhost:4200/auth/callback'
    );
  }

  private getStateSecret(): string {
    const secret =
      this.configService.get<string>('AUTH_OAUTH_STATE_SECRET') ??
      this.configService.get<string>('GITHUB_CLIENT_SECRET');

    if (!secret) {
      throw new ServiceUnavailableException(
        'OAuth state secret is not configured.',
      );
    }

    return secret;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import type { PublicUser } from '../users/users.types.js';
import { PasswordService } from './password.service.js';

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

export interface ValidatedSession {
  sessionId: string;
  user: PublicUser;
}

@Injectable()
export class SessionService {
  private readonly accessTokenMinutes: number;
  private readonly refreshTokenDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    this.accessTokenMinutes = Number(
      configService.get('AUTH_ACCESS_TOKEN_MINUTES') ?? 15,
    );
    this.refreshTokenDays = Number(
      configService.get('AUTH_REFRESH_TOKEN_DAYS') ?? 7,
    );
  }

  async createSession(
    userId: string,
    metadata: SessionMetadata,
  ): Promise<AuthSession> {
    const accessToken = this.passwordService.createOpaqueToken();
    const refreshToken = this.passwordService.createOpaqueToken();
    const expiresAt = this.addMinutes(new Date(), this.accessTokenMinutes);
    const refreshExpiresAt = this.addDays(new Date(), this.refreshTokenDays);

    await this.prisma.session.create({
      data: {
        userId,
        accessTokenHash: this.passwordService.hashToken(accessToken),
        refreshTokenHash: this.passwordService.hashToken(refreshToken),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
        refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
    };
  }

  async validateAccessToken(token: string): Promise<ValidatedSession> {
    const tokenHash = this.passwordService.hashToken(token);
    const session = await this.prisma.session.findUnique({
      where: { accessTokenHash: tokenHash },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    return {
      sessionId: session.id,
      user: this.usersService.toPublicUser(session.user),
    };
  }

  async refreshSession(
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<AuthSession> {
    const refreshTokenHash = this.passwordService.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.refreshExpiresAt.getTime() <= Date.now() ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const accessToken = this.passwordService.createOpaqueToken();
    const nextRefreshToken = this.passwordService.createOpaqueToken();
    const expiresAt = this.addMinutes(new Date(), this.accessTokenMinutes);
    const refreshExpiresAt = this.addDays(new Date(), this.refreshTokenDays);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        accessTokenHash: this.passwordService.hashToken(accessToken),
        refreshTokenHash: this.passwordService.hashToken(nextRefreshToken),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
        refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresAt,
      refreshExpiresAt,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        refreshTokenHash: this.passwordService.hashToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

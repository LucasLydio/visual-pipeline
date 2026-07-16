import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UsersService } from '../users/users.service.js';
import type { PublicUser } from '../users/users.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { SessionMetadata, SessionService } from './session.service.js';
import { PasswordService } from './password.service.js';

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
  ) {}

  async register(
    dto: RegisterDto,
    metadata: SessionMetadata,
  ): Promise<AuthResponse> {
    const user = await this.usersService.create(dto as CreateUserDto);
    const session = await this.sessionService.createSession(user.id, metadata);

    return {
      user,
      ...session,
    };
  }

  async login(dto: LoginDto, metadata: SessionMetadata): Promise<AuthResponse> {
    const user = await this.usersService.findSecretByEmail(dto.email);

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      !(await this.passwordService.verifyPassword(
        dto.password,
        user.passwordHash,
      ))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.usersService.markLogin(user.id);
    const session = await this.sessionService.createSession(user.id, metadata);

    return {
      user: this.usersService.toPublicUser(user),
      ...session,
    };
  }

  async refresh(
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<Omit<AuthResponse, 'user'>> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required.');
    }

    return this.sessionService.refreshSession(refreshToken, metadata);
  }

  async requestPasswordReset(email: string): Promise<{
    message: string;
    resetToken?: string;
  }> {
    const user = await this.usersService.findSecretByEmail(email);

    if (!user || user.status !== 'ACTIVE') {
      return {
        message: 'If the email exists, a password reset was created.',
      };
    }

    const resetToken = this.passwordService.createOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.passwordService.hashToken(resetToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return {
      message: 'If the email exists, a password reset was created.',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.passwordService.assertPasswordStrength(dto.password);
    const tokenHash = this.passwordService.hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !resetToken ||
      resetToken.status !== 'PENDING' ||
      resetToken.expiresAt.getTime() <= Date.now() ||
      resetToken.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      }),
      this.prisma.session.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password updated.' };
  }
}

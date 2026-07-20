import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GithubCallbackDto } from './dto/github-callback.dto.js';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { RefreshSessionDto } from './dto/refresh-session.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { AuthService } from './auth.service.js';
import { GithubOAuthService } from './github-oauth.service.js';
import { SessionService } from './session.service.js';
import type { RequestWithUser } from '../users/users.types.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly githubOAuthService: GithubOAuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('github')
  @Redirect()
  github(@Query('redirectTo') redirectTo?: string): { url: string } {
    return {
      url: this.githubOAuthService.buildAuthorizationUrl(redirectTo),
    };
  }

  @Get('github/callback')
  @Redirect()
  async githubCallback(
    @Query() query: GithubCallbackDto,
    @Req() request: Request,
  ): Promise<{ url: string }> {
    if (query.error) {
      return {
        url: this.githubOAuthService.buildFrontendErrorUrl(
          query.error_description ?? query.error,
        ),
      };
    }

    try {
      const result = await this.githubOAuthService.handleCallback(
        query.code,
        query.state,
        this.getSessionMetadata(request),
      );

      return {
        url: this.githubOAuthService.buildFrontendCallbackUrl(result),
      };
    } catch (error) {
      return {
        url: this.githubOAuthService.buildFrontendErrorUrl(
          error instanceof Error ? error.message : 'GitHub login failed.',
        ),
      };
    }
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.getSessionMetadata(request));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, this.getSessionMetadata(request));
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshSessionDto, @Req() request: Request) {
    return this.authService.refresh(
      dto.refreshToken,
      this.getSessionMetadata(request),
    );
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  async logout(
    @Body() dto: LogoutDto,
    @Req() request: Request & RequestWithUser,
  ): Promise<{ message: string }> {
    if (dto.refreshToken) {
      await this.sessionService.revokeRefreshToken(dto.refreshToken);
    }

    if (request.sessionId) {
      await this.sessionService.revokeSession(request.sessionId);
    }

    return { message: 'Logged out.' };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: Request & RequestWithUser) {
    return request.user;
  }

  @Post('password/forgot')
  forgotPassword(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private getSessionMetadata(request: Request) {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }
}

import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GithubOAuthService } from './github-oauth.service.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { PasswordService } from './password.service.js';
import { OAuthTokenVaultService } from './oauth-token-vault.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    GithubOAuthService,
    GithubStrategy,
    OAuthTokenVaultService,
    PasswordService,
    SessionAuthGuard,
    SessionService,
  ],
  exports: [
    OAuthTokenVaultService,
    PasswordService,
    SessionAuthGuard,
    SessionService,
  ],
})
export class AuthModule {}

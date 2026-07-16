import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { PasswordService } from './password.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    GithubStrategy,
    PasswordService,
    SessionAuthGuard,
    SessionService,
  ],
  exports: [PasswordService, SessionAuthGuard, SessionService],
})
export class AuthModule {}

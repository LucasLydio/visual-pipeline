import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '../session.service.js';
import type { RequestWithUser } from '../../users/users.types.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & RequestWithUser>();
    const token = this.extractBearerToken(request);
    const session = await this.sessionService.validateAccessToken(token);

    request.user = session.user;
    request.sessionId = session.sessionId;

    return true;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required.');
    }

    return token;
  }
}

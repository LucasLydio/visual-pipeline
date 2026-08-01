import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AgentTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedToken = this.configService.get<string>('AGENT_SHARED_TOKEN');
    const request = context.switchToHttp().getRequest<Request>();
    const receivedToken = request.header('x-agent-token');

    if (!expectedToken || receivedToken !== expectedToken) {
      throw new UnauthorizedException('Invalid agent token.');
    }

    return true;
  }
}

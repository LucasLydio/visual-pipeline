import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { SourceControlService } from './source-control.service.js';

@UseGuards(SessionAuthGuard)
@Controller('source-control')
export class SourceControlController {
  constructor(private readonly sourceControlService: SourceControlService) {}

  @Get('github/repositories')
  listGitHubRepositories(@Req() request: RequestWithUser) {
    return this.sourceControlService.listGitHubRepositories(request.user!.id);
  }
}

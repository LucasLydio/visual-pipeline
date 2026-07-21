import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { WorkspaceService } from './workspace.service.js';

@Controller('workspace')
@UseGuards(SessionAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('dashboard')
  getDashboard(
    @Query('teamId') teamId: string | undefined,
    @Req() request: RequestWithUser,
  ) {
    return this.workspaceService.getDashboard(request.user!.id, teamId);
  }
}

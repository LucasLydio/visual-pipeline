import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@UseGuards(SessionAuthGuard)
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('teams/:teamId/projects')
  create(
    @Param('teamId') teamId: string,
    @Body() dto: CreateProjectDto,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.create(teamId, request.user!.id, dto);
  }

  @Get('teams/:teamId/projects')
  findMany(
    @Param('teamId') teamId: string,
    @Query('search') search: string | undefined,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.findMany(teamId, request.user!.id, search);
  }

  @Get('projects/:projectId')
  findOne(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.findById(projectId, request.user!.id);
  }

  @Patch('projects/:projectId')
  update(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.update(projectId, request.user!.id, dto);
  }

  @Patch('projects/:projectId/archive')
  archive(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.archive(projectId, request.user!.id);
  }

  @Patch('projects/:projectId/unarchive')
  unarchive(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.unarchive(projectId, request.user!.id);
  }

  @Delete('projects/:projectId')
  unsync(
    @Param('projectId') projectId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.projectsService.unsync(projectId, request.user!.id);
  }
}

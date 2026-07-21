import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js';
import type { RequestWithUser } from '../users/users.types.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TeamsService } from './teams.service.js';

@Controller('teams')
@UseGuards(SessionAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto, @Req() request: RequestWithUser) {
    return this.teamsService.create(request.user!.id, dto);
  }

  @Get()
  findMany(@Req() request: RequestWithUser) {
    return this.teamsService.findMany(request.user!.id);
  }

  @Get(':teamId')
  findOne(@Param('teamId') teamId: string, @Req() request: RequestWithUser) {
    return this.teamsService.findById(teamId, request.user!.id);
  }

  @Patch(':teamId')
  update(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @Req() request: RequestWithUser,
  ) {
    return this.teamsService.update(teamId, request.user!.id, dto);
  }

  @Delete(':teamId')
  delete(@Param('teamId') teamId: string, @Req() request: RequestWithUser) {
    return this.teamsService.delete(teamId, request.user!.id);
  }

  @Get(':teamId/members')
  findMembers(
    @Param('teamId') teamId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.teamsService.findMembers(teamId, request.user!.id);
  }

  @Post(':teamId/members')
  addMember(
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
    @Req() request: RequestWithUser,
  ) {
    return this.teamsService.addMember(teamId, request.user!.id, dto);
  }

  @Patch(':teamId/members/:memberId')
  updateMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
    @Req() request: RequestWithUser,
  ) {
    return this.teamsService.updateMember(
      teamId,
      memberId,
      request.user!.id,
      dto,
    );
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.teamsService.removeMember(teamId, memberId, request.user!.id);
  }
}

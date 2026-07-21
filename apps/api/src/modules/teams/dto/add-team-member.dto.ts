import type { TeamRoleValue } from '../teams.types.js';

export class AddTeamMemberDto {
  userId?: string;
  email?: string;
  role?: TeamRoleValue;
  title?: string;
}

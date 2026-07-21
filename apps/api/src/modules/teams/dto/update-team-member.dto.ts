import type { TeamRoleValue } from '../teams.types.js';

export class UpdateTeamMemberDto {
  role?: TeamRoleValue;
  title?: string | null;
}

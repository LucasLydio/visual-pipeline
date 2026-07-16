export class UpdateUserDto {
  email?: string;
  displayName?: string;
  password?: string;
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}

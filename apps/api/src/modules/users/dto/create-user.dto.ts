export class CreateUserDto {
  email!: string;
  displayName!: string;
  password?: string;
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}

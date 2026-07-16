import type { UserModel } from '../../generated/prisma/models/User.js';

export type UserStatusValue = 'ACTIVE' | 'INVITED' | 'DISABLED';

export type UserWithSecret = UserModel;

export type PublicUser = Omit<UserModel, 'passwordHash'> & {
  hasPassword: boolean;
};

export type AuthenticatedUser = PublicUser;

export interface RequestWithUser {
  user?: AuthenticatedUser;
  sessionId?: string;
}

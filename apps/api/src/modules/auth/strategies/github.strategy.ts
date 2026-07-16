import { Injectable } from '@nestjs/common';

export interface GithubProfile {
  providerAccountId: string;
  username?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

@Injectable()
export class GithubStrategy {
  normalizeProfile(profile: GithubProfile): GithubProfile {
    return {
      ...profile,
      email: profile.email?.trim().toLowerCase(),
      displayName: profile.displayName?.trim() || profile.username,
    };
  }
}

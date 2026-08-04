import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

@Injectable()
export class SourceControlRepository {
  constructor(private readonly prisma: PrismaService) {}

  findGitHubAccount(userId: string) {
    return this.prisma.authAccount.findFirst({
      where: {
        userId,
        provider: 'GITHUB',
        accessTokenSecret: { not: null },
      },
      orderBy: { tokenUpdatedAt: 'desc' },
    });
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { OpenApiStaticController } from './infra/openapi/openapi-static.controller.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PipelinesModule } from './modules/pipelines/pipelines.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'apps/api/.env'],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TeamsModule,
    ProjectsModule,
    PipelinesModule,
    WorkspaceModule,
  ],
  controllers: [AppController, OpenApiStaticController],
  providers: [AppService],
})
export class AppModule {}

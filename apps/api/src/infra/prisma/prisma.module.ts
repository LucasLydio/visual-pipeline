import { Global, Module } from '@nestjs/common';
import { DatabaseInfrastructureModule } from '../database/database-infrastructure.module.js';
import { DatabaseHealthController } from './database-health.controller.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  imports: [DatabaseInfrastructureModule],
  controllers: [DatabaseHealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

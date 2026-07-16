import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

interface DatabaseHealthResponse {
  database: 'postgresql';
  source: string;
  status: 'ok';
}

@Controller('health')
export class DatabaseHealthController {
  private readonly logger = new Logger(DatabaseHealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('database')
  async checkDatabase(): Promise<DatabaseHealthResponse> {
    try {
      const connected = await this.prisma.ping();

      if (!connected) {
        throw new Error('Database ping returned an unexpected result.');
      }

      return {
        status: 'ok',
        database: 'postgresql',
        source: this.prisma.connectionSource,
      };
    } catch (error) {
      this.logger.error(
        'Database health check failed.',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Database is unavailable.');
    }
  }
}

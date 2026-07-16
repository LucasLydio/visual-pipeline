import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseConnectionAdapter,
  DatabaseConnectionOptions,
} from '../../database/database-connection.adapter.js';
import { createDatabaseConnectionOptions } from '../../database/database-connection.config.js';

@Injectable()
export class LocalPostgresAdapter implements DatabaseConnectionAdapter {
  readonly source = 'local-postgres' as const;

  constructor(private readonly config: ConfigService) {}

  getConnectionOptions(): DatabaseConnectionOptions {
    return createDatabaseConnectionOptions(
      this.config,
      this.source,
      'DATABASE_URL',
    );
  }
}

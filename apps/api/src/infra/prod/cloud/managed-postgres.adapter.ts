import { ConfigService } from '@nestjs/config';
import {
  DatabaseConnectionAdapter,
  DatabaseConnectionOptions,
  DatabaseConnectionSource,
} from '../../database/database-connection.adapter.js';
import { createDatabaseConnectionOptions } from '../../database/database-connection.config.js';

export abstract class ManagedPostgresAdapter
  implements DatabaseConnectionAdapter
{
  abstract readonly source: DatabaseConnectionSource;
  protected abstract readonly providerUrlKey: string;

  constructor(protected readonly config: ConfigService) {}

  getConnectionOptions(): DatabaseConnectionOptions {
    return createDatabaseConnectionOptions(
      this.config,
      this.source,
      this.providerUrlKey,
    );
  }
}

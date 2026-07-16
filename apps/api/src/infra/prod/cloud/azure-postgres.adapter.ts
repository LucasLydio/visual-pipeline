import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManagedPostgresAdapter } from './managed-postgres.adapter.js';

@Injectable()
export class AzurePostgresAdapter extends ManagedPostgresAdapter {
  readonly source = 'azure-postgres' as const;
  protected readonly providerUrlKey = 'AZURE_POSTGRES_DATABASE_URL';

  constructor(config: ConfigService) {
    super(config);
  }
}

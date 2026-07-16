import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManagedPostgresAdapter } from './managed-postgres.adapter.js';

@Injectable()
export class GcpCloudSqlAdapter extends ManagedPostgresAdapter {
  readonly source = 'gcp-cloud-sql' as const;
  protected readonly providerUrlKey = 'GCP_CLOUD_SQL_DATABASE_URL';

  constructor(config: ConfigService) {
    super(config);
  }
}

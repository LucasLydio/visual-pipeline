import { Injectable } from '@nestjs/common';
import { DatabaseConnectionAdapter } from '../../database/database-connection.adapter.js';
import { AwsRdsAdapter } from './aws-rds.adapter.js';
import { AzurePostgresAdapter } from './azure-postgres.adapter.js';
import { CloudProvider } from './cloud-provider.js';
import { GcpCloudSqlAdapter } from './gcp-cloud-sql.adapter.js';

@Injectable()
export class CloudDatabaseAdapterFactory {
  constructor(
    private readonly aws: AwsRdsAdapter,
    private readonly gcp: GcpCloudSqlAdapter,
    private readonly azure: AzurePostgresAdapter,
  ) {}

  create(provider: CloudProvider): DatabaseConnectionAdapter {
    const adapters: Record<CloudProvider, DatabaseConnectionAdapter> = {
      aws: this.aws,
      gcp: this.gcp,
      azure: this.azure,
    };

    return adapters[provider];
  }
}

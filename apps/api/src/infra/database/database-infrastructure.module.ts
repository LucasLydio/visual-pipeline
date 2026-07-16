import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DATABASE_CONNECTION_ADAPTER,
  DatabaseConnectionAdapter,
} from './database-connection.adapter.js';
import { LocalPostgresAdapter } from '../local/postgres/local-postgres.adapter.js';
import { AwsRdsAdapter } from '../prod/cloud/aws-rds.adapter.js';
import { AzurePostgresAdapter } from '../prod/cloud/azure-postgres.adapter.js';
import { CloudDatabaseAdapterFactory } from '../prod/cloud/cloud-database-adapter.factory.js';
import {
  isCloudProvider,
  CLOUD_PROVIDERS,
} from '../prod/cloud/cloud-provider.js';
import { GcpCloudSqlAdapter } from '../prod/cloud/gcp-cloud-sql.adapter.js';

@Module({
  providers: [
    LocalPostgresAdapter,
    AwsRdsAdapter,
    GcpCloudSqlAdapter,
    AzurePostgresAdapter,
    CloudDatabaseAdapterFactory,
    {
      provide: DATABASE_CONNECTION_ADAPTER,
      inject: [
        ConfigService,
        LocalPostgresAdapter,
        CloudDatabaseAdapterFactory,
      ],
      useFactory: (
        config: ConfigService,
        local: LocalPostgresAdapter,
        cloudFactory: CloudDatabaseAdapterFactory,
      ): DatabaseConnectionAdapter => {
        if (config.get<string>('NODE_ENV') !== 'production') {
          return local;
        }

        const provider = config.get<string>('CLOUD_PROVIDER')?.toLowerCase();

        if (!provider || !isCloudProvider(provider)) {
          throw new Error(
            `CLOUD_PROVIDER must be one of: ${CLOUD_PROVIDERS.join(', ')}.`,
          );
        }

        return cloudFactory.create(provider);
      },
    },
  ],
  exports: [DATABASE_CONNECTION_ADAPTER],
})
export class DatabaseInfrastructureModule {}

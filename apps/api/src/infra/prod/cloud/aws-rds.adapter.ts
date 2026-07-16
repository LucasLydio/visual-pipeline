import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManagedPostgresAdapter } from './managed-postgres.adapter.js';

@Injectable()
export class AwsRdsAdapter extends ManagedPostgresAdapter {
  readonly source = 'aws-rds' as const;
  protected readonly providerUrlKey = 'AWS_RDS_DATABASE_URL';

  constructor(config: ConfigService) {
    super(config);
  }
}

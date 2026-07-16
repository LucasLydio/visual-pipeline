import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import * as databaseConnectionAdapter from '../database/database-connection.adapter.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly connectionSource: databaseConnectionAdapter.DatabaseConnectionSource;

  constructor(
    @Inject(databaseConnectionAdapter.DATABASE_CONNECTION_ADAPTER)
    connectionAdapter: databaseConnectionAdapter.DatabaseConnectionAdapter,
  ) {
    const options = connectionAdapter.getConnectionOptions();
    const adapter = new PrismaPg({
      connectionString: options.connectionString,
      max: options.maxConnections,
      connectionTimeoutMillis: options.connectionTimeoutMillis,
      idleTimeoutMillis: options.idleTimeoutMillis,
    });

    super({ adapter });
    this.connectionSource = connectionAdapter.source;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async ping(): Promise<boolean> {
    const [result] = await this.$queryRaw<Array<{ connected: number }>>`
      SELECT 1::integer AS connected
    `;

    return result?.connected === 1;
  }
}

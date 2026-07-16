export const DATABASE_CONNECTION_ADAPTER = Symbol(
  'DATABASE_CONNECTION_ADAPTER',
);

export type DatabaseConnectionSource =
  'local-postgres' | 'aws-rds' | 'gcp-cloud-sql' | 'azure-postgres';

export interface DatabaseConnectionOptions {
  connectionString: string;
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  maxConnections: number;
}

export interface DatabaseConnectionAdapter {
  readonly source: DatabaseConnectionSource;
  getConnectionOptions(): DatabaseConnectionOptions;
}

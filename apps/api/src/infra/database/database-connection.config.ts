import { ConfigService } from '@nestjs/config';
import {
  DatabaseConnectionOptions,
  DatabaseConnectionSource,
} from './database-connection.adapter.js';

const DEFAULT_POOL_MAX = 10;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_IDLE_TIMEOUT_MS = 10_000;

export function createDatabaseConnectionOptions(
  config: ConfigService,
  source: DatabaseConnectionSource,
  providerUrlKey: string,
): DatabaseConnectionOptions {
  const connectionString =
    config.get<string>(providerUrlKey) ?? config.get<string>('DATABASE_URL');

  if (!connectionString) {
    throw new Error(
      `Missing database URL for ${source}. Set ${providerUrlKey} or DATABASE_URL.`,
    );
  }

  return {
    connectionString,
    maxConnections: readPositiveInteger(
      config,
      'DATABASE_POOL_MAX',
      DEFAULT_POOL_MAX,
    ),
    connectionTimeoutMillis: readPositiveInteger(
      config,
      'DATABASE_CONNECTION_TIMEOUT_MS',
      DEFAULT_CONNECTION_TIMEOUT_MS,
    ),
    idleTimeoutMillis: readPositiveInteger(
      config,
      'DATABASE_IDLE_TIMEOUT_MS',
      DEFAULT_IDLE_TIMEOUT_MS,
    ),
  };
}

function readPositiveInteger(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  const rawValue = config.get<string>(key);

  if (rawValue === undefined) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer.`);
  }

  return value;
}

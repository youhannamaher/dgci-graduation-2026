import postgres from 'postgres';

const databaseUrl = (process.env.DATABASE_URL || '').trim();

// Initialize the postgres query client only if the connection string is present
export const sql = databaseUrl
  ? postgres(databaseUrl, {
      ssl: 'require',
      max: 8,
      idle_timeout: 15,
      connect_timeout: 5
    })
  : null;

export const isSqlConfigured = !!sql;

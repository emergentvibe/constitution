import postgres from 'postgres';

// Singleton connection
let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable not set');
    }
    sql = postgres(connectionString, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

// Helper for parameterized queries (for symbiont-hub)
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const db = getDb();
  // Convert $1, $2 style params to postgres.js style
  if (params && params.length > 0) {
    const result = await db.unsafe(text, params);
    return result as T[];
  }
  const result = await db.unsafe(text);
  return result as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

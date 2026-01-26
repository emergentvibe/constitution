import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

// Lazy initialization to avoid build-time errors
const sql = connectionString
  ? postgres(connectionString, {
      ssl: "require",
    })
  : null;

export default sql;

export function getDb() {
  if (!sql) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return sql;
}

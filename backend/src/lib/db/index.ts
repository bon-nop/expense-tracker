// filepath: backend/src/lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { groups, members, expenses } from "./schema";

// Use SUPABASE_DB_URL if available
const connectionString = Bun.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("SUPABASE_DB_URL is not set!");
}

const client = postgres(connectionString || "", {
  ssl: true,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema: { groups, members, expenses } });

export { groups, members, expenses };

// filepath: backend/src/lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { groups, members, expenses } from "./schema";

// Connection string for Supabase
const connectionString = Bun.env.SUPABASE_DB_URL || 
  `postgresql://postgres:${Bun.env.SUPABASE_SERVICE_KEY}@db.hdowzeobfgeekigrdgjt.supabase.co:5432/postgres`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema: { groups, members, expenses } });

export { groups, members, expenses };

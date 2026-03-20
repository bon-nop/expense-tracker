// filepath: backend/src/scripts/check-db.ts
import postgres from "postgres";

const connectionString =
  "postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo@db.hdowzeobfgeekigrdgjt.supabase.co:6543/postgres?sslmode=require";

const client = postgres(connectionString);

async function checkTables() {
  try {
    const result = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in database:", result);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

checkTables();

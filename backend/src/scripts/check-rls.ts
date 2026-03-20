// filepath: backend/src/scripts/check-rls.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

async function checkRLS() {
  console.log("Checking RLS status via pg_tables...");

  // Try to query pg_tables to check RLS
  const tables = ["groups", "members", "expenses"];

  for (const table of tables) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/pg_tables?tablename=eq.${table}&schemaname=eq.public`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    console.log(`\n${table}:`);
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

checkRLS();

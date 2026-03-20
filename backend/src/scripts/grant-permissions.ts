// filepath: backend/src/scripts/grant-permissions.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function grantPermissions() {
  console.log("Granting permissions to service role...");

  // Try to grant permissions via RPC
  const queries = [
    "GRANT ALL ON groups TO service_role;",
    "GRANT ALL ON members TO service_role;",
    "GRANT ALL ON expenses TO service_role;",
    "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;",
  ];

  for (const query of queries) {
    const { error } = await supabase.rpc("exec_sql", { query });
    if (error) {
      console.log(`Query: ${query}`);
      console.log(`Error: ${error.message}`);
    }
  }

  // Also try to disable RLS
  const rlsQueries = [
    "ALTER TABLE groups DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE members DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;",
  ];

  console.log("\nTrying to disable RLS...");
  for (const query of rlsQueries) {
    const { error } = await supabase.rpc("exec_sql", { query });
    if (error) {
      console.log(`Query: ${query}`);
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Success: ${query}`);
    }
  }
}

grantPermissions();

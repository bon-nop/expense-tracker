// filepath: backend/src/scripts/check-tables-rest.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

async function checkTables() {
  console.log("Checking tables via REST API...");

  // Query information_schema
  const response = await fetch(
    `${supabaseUrl}/rest/v1/information_schema.tables?table_schema=eq.public&select=table_name`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  const data = await response.json();
  console.log("Tables:", data);

  // Try to query groups table
  const groupsResponse = await fetch(`${supabaseUrl}/rest/v1/groups?limit=1`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  console.log("Groups query status:", groupsResponse.status);
  const groupsData = await groupsResponse.json();
  console.log("Groups data:", groupsData);
}

checkTables();

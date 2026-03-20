// filepath: backend/src/scripts/test-create.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

async function testCreate() {
  console.log("Testing create with service role...");

  // Try to create a test table
  const createResponse = await fetch(`${supabaseUrl}/rest/v1/test_table`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ id: "test" }),
  });

  console.log("Create status:", createResponse.status);
  console.log("Create status text:", createResponse.statusText);

  const data = await createResponse.text();
  console.log("Response:", data);
}

testCreate();

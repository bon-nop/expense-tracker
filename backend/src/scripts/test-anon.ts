// filepath: backend/src/scripts/test-anon.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";

// This is the anon key (public)
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0IiwiaWF0IjoxNzczODQzMzA1LCJleHAiOjIwODk0MTkzMDV9.1khL-7F1K6B0K3eK9K3eK9K3eK9K3eK9K3eK9K3eK";

async function testAnon() {
  console.log("Testing with anon key...");

  const response = await fetch(`${supabaseUrl}/rest/v1/groups?limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testAnon();

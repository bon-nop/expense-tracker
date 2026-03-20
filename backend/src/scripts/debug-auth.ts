// filepath: backend/src/scripts/debug-auth.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";

// This is the service role key
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

async function debugAuth() {
  console.log("Testing with service role key...");
  console.log("Key starts with:", serviceKey.substring(0, 50));
  console.log(
    "Key role claim:",
    JSON.parse(atob(serviceKey.split(".")[1])).role,
  );

  // Test with service role
  const response = await fetch(`${supabaseUrl}/rest/v1/groups?limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  console.log("\nService role response:");
  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Data:", JSON.stringify(data, null, 2));

  // Check if we can access user info
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  console.log("\nUser endpoint status:", userResponse.status);
}

debugAuth();

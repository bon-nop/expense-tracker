// filepath: backend/src/scripts/test-keys.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";

// Try the key from frontend .env.local
const publishableKey = "sb_publishable_6m9izNcomw21HuddaFhPNw_si4Kfagg";

async function testKeys() {
  console.log("Testing with publishable key...");

  const response = await fetch(`${supabaseUrl}/rest/v1/groups?limit=1`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });

  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testKeys();

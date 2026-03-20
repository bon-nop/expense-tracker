// filepath: backend/src/scripts/test-rest.ts
const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

async function testREST() {
  console.log("Testing via REST API...");
  
  const response = await fetch(`${supabaseUrl}/rest/v1/groups?limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  console.log("Status:", response.status);
  console.log("Status text:", response.statusText);
  
  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testREST();
// filepath: backend/src/scripts/test-service-role.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function testServiceRole() {
  console.log("Testing service role access...");
  
  // Try to insert - service role should bypass RLS
  const { data, error } = await supabase
    .from('groups')
    .insert({ 
      name: 'Test Group', 
      created_by: '00000000-0000-0000-0000-000000000001' 
    })
    .select();
  
  if (error) {
    console.log("Error:", error.message);
    console.log("Error code:", error.code);
    
    // If table doesn't exist, we get different error
    if (error.code === '42P01') {
      console.log("\nTable does not exist! Need to create it.");
    }
  } else {
    console.log("Success! Created:", data);
  }
}

testServiceRole();

// filepath: backend/src/scripts/test-insert.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert...");
  
  // Try to insert a group
  const { data, error } = await supabase
    .from('groups')
    .insert({ 
      name: 'Test Group', 
      created_by: '00000000-0000-0000-0000-000000000001' 
    })
    .select();
  
  if (error) {
    console.log("Error inserting:", error.message);
  } else {
    console.log("Insert successful!", data);
  }
}

testInsert();

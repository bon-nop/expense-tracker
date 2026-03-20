// filepath: backend/src/scripts/test-query.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log("Testing if tables exist...");

  // Try to select from groups
  const { data, error } = await supabase.from("groups").select("*").limit(1);

  if (error) {
    console.log("Error querying groups:", error.message);
    console.log("\nThe tables need to be created in Supabase SQL Editor.");
  } else {
    console.log("Tables exist! Query result:", data);
  }
}

testQuery();

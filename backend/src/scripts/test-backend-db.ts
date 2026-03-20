// filepath: backend/src/scripts/test-backend-db.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBackend() {
  console.log("Testing via Supabase client (same as test-query.ts)...");

  const { data, error } = await supabase.from("groups").select("*").limit(1);

  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Success! Result:", data);
  }
}

testBackend();

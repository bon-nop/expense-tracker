// filepath: backend/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Bun.env.SUPABASE_URL || "";
const supabaseServiceKey = Bun.env.SUPABASE_SERVICE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

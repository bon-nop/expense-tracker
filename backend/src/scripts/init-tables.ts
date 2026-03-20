// filepath: backend/src/scripts/init-tables.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdowzeobfgeekigrdgjt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3d6ZW9iZmdlZWtpZ3JkZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0MzMwNSwiZXhwIjoyMDg5NDE5MzA1fQ.pGDu2hnAcXPxniCOrNIQofdwuehquuGeLX22_2uyYwo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  // Create groups table
  const { error: groupsError } = await supabase.rpc("exec_sql", {
    query: `
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_settled BOOLEAN DEFAULT FALSE
      );
    `,
  });

  if (groupsError) console.log("Groups table:", groupsError.message);
  else console.log("Groups table created!");

  // Create members table
  const { error: membersError } = await supabase.rpc("exec_sql", {
    query: `
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      );
    `,
  });

  if (membersError) console.log("Members table:", membersError.message);
  else console.log("Members table created!");

  // Create expenses table
  const { error: expensesError } = await supabase.rpc("exec_sql", {
    query: `
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        paid_by UUID NOT NULL,
        title TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  });

  if (expensesError) console.log("Expenses table:", expensesError.message);
  else console.log("Expenses table created!");

  // Create indexes
  await supabase.rpc("exec_sql", {
    query:
      "CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);",
  });
  await supabase.rpc("exec_sql", {
    query:
      "CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);",
  });
  await supabase.rpc("exec_sql", {
    query:
      "CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);",
  });

  console.log("Indexes created!");
}

createTables();

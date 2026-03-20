// filepath: backend/src/api/routes/settle.ts
import { Elysia } from "elysia";
import { supabase } from "../../lib/supabase-client";

export const settleRoutes = new Elysia({ prefix: "/groups/:groupId/settle" })
  // POST /groups/:groupId/settle - Mark group as settled
  .post("/", async ({ params: { groupId } }) => {
    // Check if group exists
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    
    if (!group) {
      return { error: "Group not found" };
    }

    // Check if already settled
    if (group.is_settled) {
      return { error: "Group is already settled" };
    }

    // Mark as settled
    const { data: updated, error } = await supabase
      .from("groups")
      .update({ is_settled: true })
      .eq("id", groupId)
      .select()
      .single();

    return error ? { error: error.message } : { success: true, group: updated };
  })

  // POST /groups/:groupId/settle/undo - Undo settlement
  .post("/undo", async ({ params: { groupId } }) => {
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    
    if (!group) {
      return { error: "Group not found" };
    }

    const { data: updated, error } = await supabase
      .from("groups")
      .update({ is_settled: false })
      .eq("id", groupId)
      .select()
      .single();

    return error ? { error: error.message } : { success: true, group: updated };
  });

export default settleRoutes;

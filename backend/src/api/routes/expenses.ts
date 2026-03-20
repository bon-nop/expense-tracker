// filepath: backend/src/api/routes/expenses.ts
import { Elysia, t } from "elysia";
import { supabase } from "../../lib/supabase-client";

export const expensesRoutes = new Elysia({ prefix: "/groups/:groupId/expenses" })
  // GET /groups/:groupId/expenses - List all expenses for a group
  .get("/", async ({ params: { groupId }, query }) => {
    const search = query.search as string | undefined;
    
    let queryBuilder = supabase
      .from("expenses")
      .select("*")
      .eq("group_id", groupId);
    
    if (search) {
      // Use ilike for case-insensitive search
      queryBuilder = queryBuilder.ilike("title", `%${search}%`);
    }
    
    const { data, error } = await queryBuilder.order("created_at", { ascending: false });
    return error ? { error: error.message } : data;
  })
  
  // GET /groups/:groupId/expenses/:id - Get a specific expense
  .get("/:id", async ({ params: { id, groupId } }) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .eq("group_id", groupId)
      .single();
    return error ? { error: error.message } : data;
  })
  
  // POST /groups/:groupId/expenses - Add a new expense
  .post(
    "/",
    async ({ params: { groupId }, body }) => {
      const { paidBy, title, amount } = body as { 
        paidBy: string; 
        title: string; 
        amount: number 
      };
      
      // Check if group exists and is not settled
      const { data: group } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      
      if (!group) {
        return { error: "Group not found" };
      }
      if (group.is_settled) {
        return { error: "Cannot add expenses to a settled group" };
      }
      
      // Create the expense
      const { data: expense, error } = await supabase
        .from("expenses")
        .insert({
          group_id: groupId,
          paid_by: paidBy,
          title,
          amount: amount.toString(),
        })
        .select()
        .single();
      
      return error ? { error: error.message } : expense;
    },
    {
      body: t.Object({
        paidBy: t.String(),
        title: t.String(),
        amount: t.Number(),
      }),
    }
  )
  
  // DELETE /groups/:groupId/expenses/:id - Delete an expense
  .delete("/:id", async ({ params: { id, groupId } }) => {
    // Check if group is settled
    const { data: group } = await supabase
      .from("groups")
      .select("is_settled")
      .eq("id", groupId)
      .single();
    
    if (group?.is_settled) {
      return { error: "Cannot delete expenses from a settled group" };
    }
    
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);
    
    return error ? { error: error.message } : { success: true };
  });

export default expensesRoutes;
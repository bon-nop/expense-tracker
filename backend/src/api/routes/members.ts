// filepath: backend/src/api/routes/members.ts
import { Elysia, t } from "elysia";
import { supabase } from "../../lib/supabase-client";

export const membersRoutes = new Elysia({ prefix: "/groups/:groupId/members" })
  // GET /groups/:groupId/members - List all members of a group
  .get("/", async ({ params: { groupId } }) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId);
    return error ? { error: error.message } : data;
  })

  // POST /groups/:groupId/members - Add a member to a group
  .post(
    "/",
    async ({ params: { groupId }, body }) => {
      const { userId } = body as { userId: string };

      // Check if group exists
      const { data: group } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (!group) {
        return { error: "Group not found" };
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      if (existing) {
        return { error: "User is already a member" };
      }

      // Add member
      const { data: member, error } = await supabase
        .from("members")
        .insert({ group_id: groupId, user_id: userId })
        .select()
        .single();

      return error ? { error: error.message } : member;
    },
    {
      body: t.Object({
        userId: t.String(),
      }),
    },
  )

  // DELETE /groups/:groupId/members/:userId - Remove a member
  .delete("/:userId", async ({ params: { groupId, userId } }) => {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    return error ? { error: error.message } : { success: true };
  });

export default membersRoutes;

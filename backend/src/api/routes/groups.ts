// filepath: backend/src/api/routes/groups.ts
import { Elysia, t } from "elysia";
import { supabase } from "../../lib/supabase-client";

export const groupsRoutes = new Elysia({ prefix: "/groups" })
  // GET /groups - List all groups
  .get("/", async ({ query }) => {
    const userId = query.userId as string | undefined;

    // If userId provided, filter by groups where user is a member
    if (userId) {
      const { data: memberGroups } = await supabase
        .from("members")
        .select("group_id")
        .eq("user_id", userId);

      if (!memberGroups || memberGroups.length === 0) {
        return [];
      }

      const groupIds = memberGroups.map((m) => m.group_id);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false });

      return error ? { error: error.message } : data;
    }

    // Return all groups
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });

    return error ? { error: error.message } : data;
  })

  // GET /groups/:groupId - Get a specific group
  .get("/:groupId", async ({ params: { groupId } }) => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    return error ? { error: error.message } : data;
  })

  // POST /groups - Create a new group
  .post(
    "/",
    async ({ body }) => {
      const { name, createdBy } = body as { name: string; createdBy: string };

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ name, created_by: createdBy })
        .select()
        .single();

      if (groupError) {
        return { error: groupError.message };
      }

      // Add creator as a member
      await supabase
        .from("members")
        .insert({ group_id: group.id, user_id: createdBy });

      return group;
    },
    {
      body: t.Object({
        name: t.String(),
        createdBy: t.String(),
      }),
    },
  )

  // DELETE /groups/:groupId - Delete a group
  .delete("/:groupId", async ({ params: { groupId } }) => {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    return error ? { error: error.message } : { success: true };
  });

export default groupsRoutes;

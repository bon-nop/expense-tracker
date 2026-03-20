// filepath: backend/src/api/routes/members.ts
import { Elysia, t } from "elysia";
import { db, members, groups } from "../../lib/db";
import { eq, and } from "drizzle-orm";

export const membersRoutes = new Elysia({ prefix: "/groups/:groupId/members" })
  // GET /groups/:groupId/members - List all members of a group
  .get("/", async ({ params: { groupId } }) => {
    return await db
      .select()
      .from(members)
      .where(eq(members.groupId, groupId));
  })
  
  // POST /groups/:groupId/members - Add a member to a group
  .post(
    "/",
    async ({ params: { groupId }, body }) => {
      const { userId } = body as { userId: string };
      
      // Check if group exists
      const group = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
      if (!group[0]) {
        return { error: "Group not found" };
      }
      
      // Check if already a member
      const existing = await db
        .select()
        .from(members)
        .where(and(eq(members.groupId, groupId), eq(members.userId, userId)))
        .limit(1);
      
      if (existing[0]) {
        return { error: "User is already a member" };
      }
      
      // Add member
      const [member] = await db
        .insert(members)
        .values({
          groupId,
          userId,
        })
        .returning();
      
      return member;
    },
    {
      body: t.Object({
        userId: t.String(),
      }),
    }
  )
  
  // DELETE /groups/:groupId/members/:userId - Remove a member
  .delete("/:userId", async ({ params: { groupId, userId } }) => {
    await db
      .delete(members)
      .where(and(eq(members.groupId, groupId), eq(members.userId, userId)));
    return { success: true };
  });

export default membersRoutes;
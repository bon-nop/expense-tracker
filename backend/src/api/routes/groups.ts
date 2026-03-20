// filepath: backend/src/api/routes/groups.ts
import { Elysia, t } from "elysia";
import { db, groups, members, expenses } from "../../lib/db";
import { eq, and } from "drizzle-orm";

export const groupsRoutes = new Elysia({ prefix: "/groups" })
  // GET /groups - List all groups
  .get("/", async ({ query }) => {
    const userId = query.userId as string | undefined;
    
    let queryBuilder = db.select().from(groups);
    
    // If userId provided, filter by groups where user is a member
    if (userId) {
      queryBuilder = db
        .select({ group: groups })
        .from(groups)
        .innerJoin(members, eq(groups.id, members.groupId))
        .where(eq(members.userId, userId));
      
      const userGroups = await queryBuilder;
      return userGroups.map(g => g.group);
    }
    
    return await queryBuilder.orderBy(groups.createdAt);
  })
  
  // GET /groups/:id - Get a specific group
  .get("/:id", async ({ params: { id } }) => {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0] || { error: "Group not found" };
  })
  
  // POST /groups - Create a new group
  .post(
    "/",
    async ({ body }) => {
      const { name, createdBy } = body as { name: string; createdBy: string };
      
      // Create the group
      const [group] = await db
        .insert(groups)
        .values({
          name,
          createdBy,
        })
        .returning();
      
      // Add creator as a member
      await db.insert(members).values({
        groupId: group.id,
        userId: createdBy,
      });
      
      return group;
    },
    {
      body: t.Object({
        name: t.String(),
        createdBy: t.String(),
      }),
    }
  )
  
  // DELETE /groups/:id - Delete a group
  .delete("/:id", async ({ params: { id } }) => {
    await db.delete(groups).where(eq(groups.id, id));
    return { success: true };
  });

export default groupsRoutes;
// filepath: backend/src/index.ts
import { Elysia } from "elysia";
import { groupsRoutes } from "./api/routes/groups";
import { membersRoutes } from "./api/routes/members";
import { expensesRoutes } from "./api/routes/expenses";
import { summaryRoutes } from "./api/routes/summary";
import { settleRoutes } from "./api/routes/settle";

// Health check endpoint
const app = new Elysia()
  .use(groupsRoutes)
  .use(membersRoutes)
  .use(expensesRoutes)
  .use(summaryRoutes)
  .use(settleRoutes)
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(3001);

console.log(`🦊 Backend running at http://localhost:${app.server?.port}`);

export type App = typeof app;

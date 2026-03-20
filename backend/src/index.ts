// filepath: backend/src/index.ts
import { Elysia } from "elysia";

// Health check endpoint
const app = new Elysia()
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(3001);

console.log(`🦊 Backend running at http://localhost:${app.server?.port}`);

export type App = typeof app;

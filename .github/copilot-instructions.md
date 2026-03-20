# Project: Expense Tracker Web App

## Stack

- Frontend: SvelteKit (src/routes, src/lib)
- Backend: ElysiaJS on Bun (src/api)
- DB: Supabase (PostgreSQL + real-time)
- Auth: Supabase Auth (email/password + Google OAuth)

## Features in scope (MVP)

- F-01: Add expense — name + amount, no category required
- F-02: Groups — invite via link/email, real-time shared view, 2–10 members
- F-03: Summary — net settlement, simplified debt (minimize transactions)
- F-04: History — sorted newest first, search by name, Settled/Pending status
- F-05: Mark as Settled — archives the group's expenses

## Data model

Group: id, name, created_by, created_at
Member: group_id, user_id, joined_at
Expense: id, group_id, paid_by, title, amount, created_at

## Conventions

- TypeScript everywhere
- Supabase client in src/lib/supabase.ts
- API routes under src/api/routes/
- Keep UI minimal — no category pickers, no bank linking

## Implementation Plan

### Phase 1: Database Setup

1. Apply database schema to Supabase (run schema.sql in Supabase dashboard)

### Phase 2: Backend API (ElysiaJS)

2. Groups API - create, list, invite members
3. Expenses API - add, list
4. Summary API - settlement calculation (minimize transactions)
5. Mark as Settled API

### Phase 3: Frontend (SvelteKit)

6. Dashboard - groups list
7. Add expense form (F-01)
8. Group detail with history (F-04)
9. Summary view with settlement (F-03)
10. Mark as Settled action (F-05)

### Phase 4: Testing

11. Test full flow and verify all features work

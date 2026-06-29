# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`camera247hue` is a public marketing website for a security-camera company, built with **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase**. Public pages (`/`, `/cong-trinh`) plus an `/admin` dashboard and API routes under `app/api`.

### Run / build / lint
- Dev server: `npm run dev` (Next.js, defaults to port 3000; set `PORT` to run alongside the sibling apps). Dependency install is handled by the startup update script (`npm install`).
- Build: `npm run build`; start prod: `npm start`.
- Lint: `npm run lint` runs `next lint`, but no ESLint config is committed, so it launches an **interactive setup prompt** (it will hang waiting for input in a non-TTY). Treat lint as not configured.

### Required env (non-obvious gotcha)
- `lib/supabase.ts` reads `NEXT_PUBLIC_SUPABASE_URL!` / `NEXT_PUBLIC_SUPABASE_ANON_KEY!` with non-null assertions and calls `createClient` at import time; empty values **throw and break the pages**. Create a gitignored `.env.local` (see `.env.local.example`) before running.
- Server/admin features also use `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SECRET`. Placeholder values boot the public site (DB-backed content will just be empty); supply real Supabase credentials and run `supabase-schema.sql` for working data and `/admin`.

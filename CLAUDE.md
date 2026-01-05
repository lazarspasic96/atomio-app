# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev              # Start dev server with Turbo
bun run build            # Production build
bun run check            # Lint + TypeScript check (run before committing)

# Database
bun run db:push          # Push schema changes without migration
bun run db:generate      # Generate migration
bun run db:migrate       # Deploy migrations
bun run db:studio        # Open Prisma Studio GUI

# Code Quality
bun run lint:fix         # Auto-fix ESLint issues
bun run format:write     # Format with Prettier
bun run typecheck        # TypeScript only check
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router (React 19)
- **tRPC 11** for type-safe API
- **Prisma 6** with PostgreSQL
- **Supabase** for authentication
- **shadcn/ui** + Tailwind CSS 4 for UI
- **react-hook-form** + Zod for forms

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public routes (login, register)
│   ├── (dashboard)/       # Protected routes
│   └── api/trpc/          # tRPC endpoint
├── features/              # Feature modules
│   ├── auth/              # Auth components, hooks, schemas
│   └── habits/            # Habits feature (components, hooks, schemas, utils)
├── components/ui/         # shadcn/ui components
├── server/api/            # tRPC routers and context
├── lib/supabase/          # Supabase client (client.ts, server.ts, middleware.ts)
└── trpc/                  # tRPC client setup
```

### Key Patterns

**Feature-based organization**: Each feature (auth, habits) contains its own components, hooks, schemas, and utils.

**tRPC procedures**:
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires auth, provides `ctx.user` and `ctx.dbUser`

**Optimistic updates**: Completions use optimistic updates with rollback on error (see `use-completions.ts`).

**Shared Zod schemas**: Validation schemas in `features/*/schemas/` are used by both client forms and server procedures.

### Database Schema

Three models: `User`, `Habit`, `HabitCompletion`
- User ID comes from Supabase Auth
- `activeDays` is an integer array (0=Sun, 1=Mon, etc.)
- Completions have unique constraint on `[habitId, date]`

### Authentication Flow

1. Supabase handles signup/login (JWT in cookies)
2. Middleware (`src/middleware.ts`) refreshes session
3. Protected layouts check auth and redirect if needed
4. tRPC `protectedProcedure` auto-upserts user in DB

### Path Alias

`~/` maps to `./src/` (e.g., `import { cn } from "~/lib/utils"`)

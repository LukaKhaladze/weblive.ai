# Weblive.ai (MVP)

Weblive.ai is a no-login AI website generator that produces a structured JSON website plan from a wizard, renders it with a widget library, and lets users edit and share a 7-day preview.

## Features
- Step-by-step wizard to collect business info.
- Rule-based generator with AI stub returning structured JSON only.
- Live editor with drag-and-drop section ordering and inline field edits.
- Temporary share link (`/s/[share_slug]`) that expires after 7 days.
- SEO export with per-page titles, descriptions, and recommendations.
- Supabase Postgres + Storage integration.

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (DB + Storage)
- @dnd-kit for drag-and-drop
- Zod for schema validation

## Environment Variables
Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_BASE_URL=http://localhost:3000
CRON_SECRET=your_secret_here
OPENAI_API_KEY=your_openai_key_here
```

## Supabase Schema (SQL)

```
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz not null,
  edit_token text unique not null,
  share_slug text unique not null,
  status text default 'draft',
  input jsonb not null,
  site jsonb,
  seo jsonb
);

create index if not exists projects_edit_token_idx on public.projects (edit_token);
create index if not exists projects_share_slug_idx on public.projects (share_slug);
create index if not exists projects_expires_at_idx on public.projects (expires_at);
```

### Storage
Create a bucket: `weblive-assets`.

Folder structure:
- `{project_id}/logo/*`
- `{project_id}/images/*`

Use signed URLs for access. The upload route (`/api/upload`) returns signed URLs by default.

### RLS
The app uses the service role key on server-side routes only. Do not expose the service role key to the client. Keep RLS enabled with no policies for anon.

## Local Development

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## Wizard Flow
1. Business name
2. Category
3. Short description
4. Main goal
5. Pages selection
6. Brand colors
7. Logo upload
8. Contact info
9. Review + Generate

## API Routes
- `POST /api/generate` — creates project, runs generator, returns edit/share tokens.
- `GET/PUT /api/projects/[token]` — fetch/update project by edit token.
- `GET /api/share/[slug]` — fetch project by share slug.
- `POST /api/upload` — upload images to Supabase storage and return signed URL.
- `POST /api/cleanup-expired` — delete expired projects/assets.

## Vercel Cron (Cleanup)
Add a Vercel Cron job that hits `/api/cleanup-expired` daily.

Example config (vercel.json):

```
{
  "crons": [
    {
      "path": "/api/cleanup-expired",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Set the `CRON_SECRET` in Vercel and call the endpoint with `Authorization: Bearer <CRON_SECRET>`.

## Notes
- Share and edit links expire 7 days after generation.
- AI generation must return JSON only. The stub in `lib/generator/aiStub.ts` is deterministic.
- `/api/generate` will use OpenAI (`gpt-4o-mini`) when `OPENAI_API_KEY` is set, otherwise it falls back to the stub.
- Placeholder images live in `public/placeholders`.

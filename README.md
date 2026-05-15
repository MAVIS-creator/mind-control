# MindGrid: Neural Clash

MindGrid is a polished memory-arcade MVP built with `React`, `TypeScript`, `Tailwind`, `Phaser`, and optional `Supabase` persistence.

## Scripts

- `npm install`
- `npm run dev`
- `npm run test`
- `npm run build`

## Supabase setup

1. Copy `.env.example` to `.env`.
2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply [supabase/schema.sql](./supabase/schema.sql) to your Supabase project.

If the env vars are missing, the app falls back to a local persistence mode so the full flow still works during development.

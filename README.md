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
3. Set `VITE_EMAIL_CONFIRM_REDIRECT_URL` to your deployed sign-in URL, for example `https://your-site.netlify.app/login`.
4. Set `VITE_PASSWORD_RESET_REDIRECT_URL` to your deployed reset page URL, for example `https://your-site.netlify.app/reset-password`.
5. Apply [supabase/schema.sql](./supabase/schema.sql) to your Supabase project.
6. Optionally set `VITE_ADMIN_USERNAMES=username1,username2` for admin access in the UI. For full remote admin update/delete permissions, also insert those users into `admin_users` in Supabase.

For GitHub-connected Supabase projects, keep database changes inside [`supabase/migrations`](./supabase/migrations). The GitHub integration watches committed migration files in that folder, not unpushed local edits.

If the env vars are missing, the app falls back to a local persistence mode so the full flow still works during development.

## Netlify environment

Your local `.env` is only for your machine. Netlify will not read it automatically.

Set these same variables in `Netlify -> Site configuration -> Environment variables`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EMAIL_CONFIRM_REDIRECT_URL`
- `VITE_PASSWORD_RESET_REDIRECT_URL`
- `VITE_ADMIN_USERNAMES` (optional)

Then redeploy the site so the new values are picked up by the frontend build.

## Password reset mailer

MindGrid now uses real email-backed sign-up and Supabase password reset links.

For production password reset emails:

1. Open `Supabase -> Authentication -> Email`.
2. Configure your SMTP provider.
3. Set the site URL or redirect URL so reset links return to `/reset-password`.
4. Paste the branded templates from [`supabase/email-templates`](./supabase/email-templates) into the Supabase email template editor for confirmation and reset mails.

Without SMTP configured, local fallback mode still works, but live reset emails will depend on your Supabase email setup.

If you want admin moderation from Supabase itself, also insert your admin user's UUID into `public.admin_users` after that user has registered:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

# Shared store setup

Status: source is ready; no project has been provisioned, no migrations applied, no staff accounts created, and no AI credential configured.

1. Choose the Supabase organization and review the project cost before creating the project. The connected account currently has `SoftEx Dev Org`; the provisioning tool requires the owner to choose the organization and confirm the returned cost.
2. Apply `migrations/001_catalogue.sql`, then `002_seed_devices.sql` to a new project. The seed contains every existing demo device. It never overwrites existing records.
3. In Auth, set the site URL to `https://softex-codes.github.io/deadshot-demo/` and allow `https://softex-codes.github.io/deadshot-demo/login.html` for email confirmation and password recovery. Keep email confirmation enabled. Configure suitable email delivery before onboarding real employees.
4. Put the project URL and **publishable key** in `site-config.js`, then publish to GitHub Pages. Never put a service-role key or AI key in frontend files.
5. The owner creates or approves staff users in Supabase Auth. Grant an approved user's UUID access using the owner-only SQL below. Customer signup creates no employee role. No employee may grant themselves or another user access through this website.

```sql
-- Replace the UUID with a verified, approved employee's Auth user ID.
insert into public.employees(user_id,role)
values ('APPROVED-USER-UUID'::uuid,'editor');
-- Revoke access when needed:
-- delete from public.employees where user_id='APPROVED-USER-UUID'::uuid;
```

Staff sign in at `login.html?role=employee`, then open any device in Inventory. They can edit prices, upload a photo, edit core/custom specifications, add a draft, publish it or unpublish it. A published detail page includes an Edit link for signed-in staff. Cart prices are read from the same catalogue. Concurrent edits use `updated_at` to avoid silent overwrites. Uploaded photos receive immutable filenames.

## Before enabling shared editing

Test these with separate anonymous, customer, employee and revoked-employee sessions:

- Anonymous/customer users read published devices only and cannot insert/update devices or employee roles.
- Approved employees read drafts, add and edit devices, publish/unpublish, and upload a raster image to `device-images`.
- A customer calling the API directly still cannot write prices or roles.
- A revoked employee immediately loses write access.
- Two editors opening the same record: the second stale save must report a conflict.
- Confirm email signup, password reset and sign-out work on the GitHub Pages redirect URLs.

The images bucket is public for storefront display; only staff can upload. There is no delete or overwrite capability in the UI. Clean up unused images separately when needed.

## Optional AI answers

1. Apply `003_assistant_budget.sql`.
2. Add backend secrets `OPENAI_API_KEY`, `OPENAI_MODEL` (default in source: `gpt-4.1-mini`) and `ALLOWED_ORIGINS=https://softex-codes.github.io`. Set a provider spending limit before enabling requests. Never send the key through a chat message or commit it.
3. Deploy `functions/device-assistant/index.ts` with the provided config. The handler explicitly verifies the bearer token using `auth.getUser`; disabling gateway JWT verification does not disable application authentication.
4. Set `assistantFunction: 'device-assistant'` in `site-config.js`, publish, and test from a signed-in customer account. Guests use the local catalogue guide. Requests are limited to 30/account/day and 500/day total, fail closed if the limiter fails, and time out after 18 seconds. Only published catalogue facts and the question are sent to OpenAI. No chat history is stored by this app; daily counters are removed after two days. Responses set `store:false`.
5. Test missing authentication, unknown device questions, stock/FPS referrals, provider errors and rate limits. The frontend always falls back to the local guide if the AI call fails.

The optional integration follows [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). It must be integration-tested against the provisioned backend before being described as active.

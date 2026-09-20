# MCOD GADGET STORE demo

[Open the website](https://softex-codes.github.io/deadshot-demo/)

A responsive, static GitHub Pages demo. Six linked pages: homepage, catalogue, device details, cart, customer/employee login, and employee inventory editor.

## What works now

- 32 devices across REDMAGIC, iQOO, OnePlus, Ace, Lenovo Legion, Xiaomi/REDMI and Infinix, with actual product photographs, regional specifications and clearly marked demo prices.
- Brand/category filters, search, sorting, hover lift, product details, related devices, and WhatsApp enquiries.
- A homepage-only Three.js REDMAGIC 10 Pro Shadow, using the real product's front/back photographs on a proportioned 3D body. Drag, front/back, pause and reset controls; software mesh rendering when WebGL is unavailable. Edge geometry is approximate.
- Persistent light/dark preference, cart quantities and removals, demo totals, WhatsApp cart enquiry. No payment is collected.
- An explicit **local admin preview**: open Employee login → Open admin preview. All catalogue devices are preloaded and editable; add a device, change its price/image/specifications, save a draft or publish to this browser's preview. Reset demo edits restores the initial catalogue.
- Floating chat bubble with general phone explanations, model/specification/price/budget/comparison answers and WhatsApp referral. The basic guide works without an API and is labelled honestly; OpenAI answers need backend activation.
- Slow headline phrase changes, card/image hover lift, cart feedback, animated chat opening/messages, and reduced-motion support.

## Shared employee login and publishing

Supabase is connected to the development workflow, but **no Supabase project has been created yet**. The login screen clearly states that shared accounts are awaiting setup. Local preview edits are not shared with other visitors. There are no hardcoded employee passwords or simulated authenticated accounts.

The real integration is implemented in `store.js`, `auth.js` and `admin.js`; setup instructions and SQL are in [supabase/SETUP.md](supabase/SETUP.md). All existing catalogue records are included in the seed. With that backend configured, staff edit the same published records used by the catalogue, detail pages, cart and assistant. Customer signup cannot grant staff access.

The optional AI edge function is implemented but not deployed or connected. It needs a Supabase project and a server-side OpenAI API key. Signed-in customers can then use AI answers; guests keep the local catalogue guide. API requests are bounded. The model can answer general phone and tablet questions using its technical knowledge, while shop-specific prices/configurations must be grounded in the published catalogue. Unsupported or uncertain questions go to WhatsApp.

## Files and development

Plain HTML, CSS and ES modules; no build step. Serve the repository root over HTTP for development. GitHub Pages uses `main` / repository root. `site-config.js` may contain only the Supabase public URL and publishable key. Service-role keys and AI credentials belong only in backend secrets.

`devices-data.js` is the initial/static catalogue. Once a backend is connected, database records are authoritative. A backend outage shows a catalogue error rather than stale seed stock. Images are self-hosted WebP; [credits](ASSETS.md). Supabase SDK and Three.js are pinned and self-hosted with license files.

## Validation

`node tests/core.mjs` covers all 32 product photo paths, validation of URLs/IDs/prices, unsupported assistant questions, comparisons, cart price source, preview authorization, existing-device edits, duplicate IDs, draft visibility, publishing, conflicts and reset/sign-out.

Static checks passed for local page/asset links, unique element IDs, required form controls, JavaScript/TypeScript syntax, and homepage-only 3D loading. Front/back models were rendered through the software rasterizer and inspected. Live browser checks passed for homepage 3D controls, catalogue filters, real product photos, detail links, cart persistence/quantities/totals, theme persistence, WhatsApp links, local admin edits flowing through to details/cart, draft creation, and assistant answers/referrals. Cloud Auth, RLS, uploads and AI need integration testing after project provisioning; they are not claimed as verified now.

Local SQL validation also passed on PGlite 0.5.8, using stubbed Supabase Auth and Storage schemas: all migrations and 32 seed records, anonymous/customer/staff/revoked-staff roles, image upload permissions, denied self-promotion, and service-only AI request limits. Reproduce with `npm install --ignore-scripts` then `npm run test:db`. This does not replace live Supabase Auth/email/Storage integration testing.

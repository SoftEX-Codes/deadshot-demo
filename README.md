# Deadshot Gadgets demo

A three-page responsive gaming-device catalogue, hosted on GitHub Pages. No build step is required; serve the root over HTTP.

- `index.html`: brutalist homepage, changing headline and interactive device studio.
- `devices.html`: 12 illustrative devices; category/brand filters, search and sorting.
- `device.html?id=redmagic-10-pro`: shared detail route; individual specs, demo price, matching 3D illustration and WhatsApp enquiry.
- `devices-data.js`: all demo inventory, regional configurations and manufacturer source URLs. Prices are placeholders, never live offers or stock claims.
- `device-model.js`: original Three.js mesh illustrations. Shapes/finishes are approximate and labelled on the site; they are not precision manufacturer scans.
- `phone-3d.js`: drag, keyboard, front/back, pause/reset controls; reduced-motion support and offscreen suspension.
- `vendor/phone-software-renderer.js`: depth-buffered Canvas rendering of the same Three.js geometry for browsers without WebGL2.

Three.js r170 is self-hosted under `vendor/`, with its MIT licence. No CDN or third-party 3D embeds are needed. Google Fonts is optional; system fallbacks remain usable.

Device specifications use the linked manufacturer region. Display Hz is not a guarantee of game FPS. The iQOO 13 listing uses the India 6,000mAh configuration, and Ace listings use China specifications.

## Verification

All 12 model geometries and software renders checked for finite vertices and visible pixels. Browser checks cover the published UI, model rotation, detail navigation, category/search/sort state, WhatsApp reveal and narrow layouts. GPU-disabled browsers use the software renderer rather than a static image.

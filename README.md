# Quest Log

Session notes for your tabletop RPG campaigns — Quests, Journal, NPCs, PC
Backstory, Inventory, Game Quotes, and a canvas-based Maps & Sketches
category. Unlimited custom categories, four UI themes, speech-to-text
dictation, copy-to-clipboard, and offline-capable local storage.

## Develop

```
npm install
npm run dev
```

## Build for production

```
npm run build
npm run preview   # serve the dist/ build locally to sanity-check it
```

`dist/` is a static site — deploy it as-is to Vercel, Netlify, Cloudflare
Pages, or any static host.

## Payments (Stripe)

Copy `.env.example` to `.env` and fill in three Stripe Payment Link URLs
(Dashboard → Payment Links → New — one each for Monthly/Yearly/Lifetime).
No secret keys are needed; Payment Links are public checkout pages, safe to
reference from a client-only app.

For each Payment Link, set its "After payment" redirect to this app's
deployed URL with `?upgraded=1` appended, e.g.
`https://your-quest-log-app.example.com/?upgraded=1`. On load, the app
checks for that param, flips on the local premium flag
(`questlog-premium-v1` in `localStorage`), and shows the success toast.

**Important limitation:** there's no backend, so this is an honor-system
unlock — nothing server-side verifies the Stripe session. That's an
acceptable trade for gating a client-side-only feature like PDF export, but
it is *not* sufficient if higher-value gated data or cloud features are
added later — those would need a real backend that verifies purchases via
Stripe webhooks before granting access.

## Notes

- All data is stored in the browser via `localStorage` (key
  `questlog-notes-v2`). There is no backend and no account system — data
  stays on the device it was created on.
- The app is installable (PWA) via `public/manifest.json` and
  `public/sw.js`, which caches the app shell for offline use.
- The "Upgrade" modal's paid perks: **Export to PDF is real** (client-side,
  via `jsPDF`, gated behind the premium flag above). Cloud Sync and Share
  with Your Party are still marked "Coming soon" in the UI — building those
  out needs auth, a database, and (for sharing) a backend; see the original
  `DEPLOY_NOTES.md` for that path.

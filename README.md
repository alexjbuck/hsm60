# HSM-60 Jaguars site

Public recruiting and pre-CAC onboarding site. Not an official Navy website. Keep it unclassified, with no CUI and no personal contact info.

## Stack (all free tier)

| Piece      | What                                           | Why                                                                                                                               |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Site       | Astro, static build                            | Pages are plain HTML on a CDN. Fast, nothing to patch.                                                                            |
| Hosting    | Cloudflare Pages                               | Free static hosting + serverless Functions + DB in one account.                                                                   |
| Leads DB   | Cloudflare D1 (SQLite)                         | One table. No external DB vendor or connection strings.                                                                           |
| Admin auth | Cloudflare Access (Zero Trust, free ≤50 users) | Email one-time-code login, no auth code written. The API also verifies the Access JWT itself, so a misconfiguration fails closed. |
| CMS        | [Pages CMS](https://pagescms.org)              | Hosted web editor over this git repo. Editors can be invited by email, so they don't need GitHub accounts.                        |

## Content: where to edit

- Home page copy and photos: `src/data/home.json`
- Onboarding guides: `src/content/onboarding/*.md` (`order` sets sort)
- Photos: `public/images/`. Logos: `public/images/patch.png` / `patch-192.png` (full patch), `jaguar-192.png` / `favicon-32.png` (head, used for nav and tab icon). High-res originals in `assets/`.

## Local dev

```sh
npm install
npm run dev            # site only, hot reload (form won't submit)
npm run db:init        # once: create local D1 table
npm run preview        # full stack incl. form + /admin at http://localhost:8788
npm test               # lead validation tests
```

`.dev.vars` (gitignored) sets `DEV_BYPASS_ACCESS=1` so `/admin` works locally. **Never set it in Cloudflare.**

## Deploy (one time)

1. ~~`npx wrangler d1 create hsm60`~~ (done; ID is in `wrangler.toml`). Create the table:
   `npx wrangler d1 execute hsm60 --remote --file=schema.sql`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect this GitHub repo.
   Build command `npm run build`, output `dist`. Bind D1 as `DB` if it isn't picked up from `wrangler.toml`.
3. Zero Trust → Access → Applications → Self-hosted. Add **two** paths on your domain: `/admin*` and `/api/admin*`.
   Policy: allow the recruiter emails. Copy the app's **AUD tag** and your team domain into `wrangler.toml` `[vars]`.
4. Pages CMS: sign in at pagescms.org with GitHub, open this repo, and invite editors by email under Settings → Collaborators.
5. Point a custom domain at the Pages project.

## PII handling

What's in place:

- **In transit:** HTTPS only (HSTS header). **At rest:** D1 is encrypted at rest by Cloudflare.
- **Access:** only emails on the Cloudflare Access allow-list can reach `/admin` or `/api/admin`. The API re-verifies the Access JWT and fails closed. Access keeps a login audit log.
- **Minimization:** only name, email, phone, background and an optional message are collected. The form tells people not to send their SSN or DOB.
- **Notice:** a privacy statement on the form (purpose, voluntary, not shared, 36-month retention).
- **Retention:** leads older than 36 months are deleted automatically (when `/admin` loads). Single leads can be deleted on request.
- **No caching:** lead data is served `no-store`, and `/admin` is `noindex`.

What you must do operationally:

- Turn on MFA for every Cloudflare account member, and keep the account members and Access allow-list to recruiters only.
- Treat CSV exports as PII: no personal cloud drives, and delete them when done.
- Optional: add a Cloudflare WAF rate-limiting rule on `/api/leads` (one rule is free) to slow down spam floods.
- **Policy question, not a code question:** run this past the command's Privacy Act coordinator / PAO. A DoD unit collecting PII from the public into a non-DoD system can trigger Privacy Act (SORN) and Paperwork Reduction Act questions, even on an unofficial site.

## Leads

`/admin` lists submissions, lets you set status (`new / contacted / in-process / not-a-fit`) and notes, and exports CSV.

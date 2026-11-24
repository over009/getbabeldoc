# BabelDoc

BabelDoc is a free, English-language library of browser tools at [https://getbabeldoc.com](https://getbabeldoc.com). The site is a static [Astro](https://astro.build/) project (TypeScript and Tailwind CSS) and is meant to be served as [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

The tagline is **Everyday tools, made simple.**

## Develop

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`. `npm run preview` serves that folder locally. `npm run check` runs the Astro type checker.

The GA4 measurement ID is `G-G85NF5TB16` in `src/config.ts`. Every page includes the gtag snippet from that value. It is not a build variable, so Workers Builds does not need `PUBLIC_GA_MEASUREMENT_ID`.

Copy `.env.example` to `.env` only if you set Search Console meta verification. That variable is optional:

| Variable | Effect when empty |
| --- | --- |
| `PUBLIC_GSC_VERIFICATION` | The Search Console meta tag keeps the placeholder content `GSC_VERIFICATION_PLACEHOLDER`. The live site is verified through DNS, so this stays empty. |

`PUBLIC_GSC_VERIFICATION` is read at **build time** and baked into the HTML. A Worker runtime variable will not change pages that are already built.

## Add a tool page

A new tool is one UI file plus one registry entry. You do not add a route file.

1. Create `src/tools/<slug>.astro` with the tool’s interface and its client-side script. The component should not require props. Mark experimental or sample tools with a code comment, the way `src/tools/word-counter.astro` is marked as a placeholder sample.
2. Add one object to the `tools` array in `src/data/registry.ts`.
   - `slug` is the public path: `/tools/<slug>/`. Use lowercase English and hyphens. Do not change a slug after the page is published.
   - `title` ends with ` | BabelDoc`. `description` is one or two sentences, about 150–160 characters, with a clear action.
   - `buttonLabel` must differ from `name`. It is the label on related-tool links.
   - `cardCta` is the homepage card button. Use an action phrase that differs from `name`, such as `Count Words Now →`.
   - `category` must be an id already listed in `categories`. Each category has a `name`, a short `navLabel` for the header, and a one-line `description`. The category `id` is the homepage anchor, such as `/#text-tools`. Add a category only when a real tool uses it. Empty categories are not shown.
   - `related` is a list of other slugs (aim for 3–6 once they exist). Add the new slug on those older tools too.
   - `component` is the imported `.astro` file.
3. Run `npm run build`. The page is generated from `src/pages/tools/[slug].astro`, and `@astrojs/sitemap` adds it to the sitemap.

The word counter at `/tools/word-counter/` is the placeholder sample that proves this template. It is not a chosen keyword page.

## Cloudflare Workers Builds

Connect this GitHub repository in the Cloudflare dashboard: **Workers & Pages → Create → Workers → Connect GitHub → `over009/getbabeldoc`**.

The Worker name in the dashboard must be `getbabeldoc`, matching `name` in `wrangler.jsonc`.

Build settings, from **Settings → Build**:

| Setting | Value |
| --- | --- |
| Root directory | `/` (the repository root) |
| Build command | Leave empty. Wrangler runs `npm run build` from `wrangler.jsonc`. |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |

`npm run build` must run before the assets are uploaded, because that is what creates `dist/`. `wrangler.jsonc` sets `build.command` to `npm run build`. Both `npx wrangler deploy` and `npx wrangler preview` run that command themselves before they look for `dist/`. Pull request builds only run `npx wrangler preview`, with no separate dashboard build step, so the Wrangler command is what produces the preview.

Pages are still static assets. `src/worker.ts` runs only for `/api/*` (`run_worker_first`). `POST /api/early-access` stores an optional early-bird email in the D1 database `getbabeldoc-early-access` (binding `DB`). The chart files are not part of that request. The `tool` value may be `ai-seating-chart-generator`, `ai-org-chart-generator`, `ai-funnel-chart-generator`, or `chartgen-alternative`.

The `database_id` in `wrangler.jsonc` is a placeholder until the database exists. Create it and apply the migration before relying on the form in production or in a preview:

```bash
npx wrangler d1 create getbabeldoc-early-access
```

Copy the printed `database_id` into `wrangler.jsonc`, replacing `00000000-0000-0000-0000-000000000000`. Then:

```bash
npx wrangler d1 migrations apply getbabeldoc-early-access --remote
```

Local check, which does not need the remote id:

```bash
npx wrangler d1 migrations apply getbabeldoc-early-access --local
```

`wrangler.jsonc` also sets:

- `html_handling: auto-trailing-slash`, which matches Astro’s folder `index.html` output and the site’s trailing-slash canonical URLs.
- `not_found_handling: 404-page`, which serves `dist/404.html`.

After the first successful deploy, attach the custom domain `getbabeldoc.com` to the Worker. Point `www` at the apex with a 301, use SSL **Full (strict)**, and keep HTTPS rewrites, Brotli, and HTTP/3 on. Those are dashboard and DNS settings, not part of this repository.

The GA4 measurement ID lives in `src/config.ts` (`gaMeasurementId`). Do not set it as a Workers Builds variable.

Optional build variable, same screen:

- `PUBLIC_GSC_VERIFICATION` — the Google Search Console meta verification code. Leave unset. The site is already verified through DNS, and the meta tag keeps the placeholder.

Do not put secrets in `wrangler.jsonc`. This site has none.

## Pages

| URL | Role |
| --- | --- |
| `/` | Homepage. One card per tool, grouped by category |
| `/tools/` | Directory |
| `/tools/word-counter/` | Placeholder sample tool |
| `/tools/token-counter/` | GPT, Claude, and Gemini token counter |
| `/tools/super-bowl-squares-generator/` | Printable squares sheet |
| `/tools/discord-timestamp-generator/` | Discord timestamp codes for every chat style |
| `/tools/tournament-bracket-generator/` | Single-elimination bracket |
| `/tools/ai-seating-chart-generator/` | Seating chart from a guest list |
| `/tools/ai-org-chart-generator/` | Org chart from names, titles, and managers |
| `/tools/ai-funnel-chart-generator/` | Funnel chart from a CSV or typed stages |
| `/chartgen-alternative/` | ChartGen alternative. A CSV is charted in the browser. |
| `/about/` | About |
| `/privacy/` | Privacy policy |
| `/api/early-access` | POST an early-bird email. Not a page. |
| `/terms/` | Terms of use |
| `/contact/` | Contact |
| `/robots.txt` | Allows crawling and points at the sitemap |
| `/sitemap-index.xml` | Generated by `@astrojs/sitemap` |
| `/sitemap.xml` | 301 redirect to `/sitemap-index.xml` via `public/_redirects` |

Canonical URLs, Open Graph tags, and the sitemap use `https://getbabeldoc.com`. The homepage emits `WebSite`, `Organization`, and `FAQPage` JSON-LD. Tool pages emit `WebApplication`, `FAQPage`, and `BreadcrumbList`. `public/_redirects` sends `/sitemap.xml` to `/sitemap-index.xml` with a 301. Workers static assets apply that file; `robots.txt` keeps pointing at `sitemap-index.xml`.

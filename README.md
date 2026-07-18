# Intellexi — intellexi.com

**Est. 2001 as a multimedia & communications studio. Reborn 2026 as an AI automation
and custom software studio — the technology arm of [Rockstar Consulting](https://www.rockstar.one/).**

*intellexi* — Latin, perfect tense of *intellegere*: **"I have understood."**
The original tagline, "Be Understood," is still the promise.

## What this is

A fully static, zero-dependency website. No framework, no build step, no database.
Open `index.html` in a browser or serve the repo root with any static file server:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Structure

```
index.html               Home — hero, capabilities, method, principles, heritage, contact
capabilities/index.html  What we build, engagement models
story/index.html         The brand history: Act I (2001), the interim, Act II (2026)
404.html                 Not-found page (root-absolute links; expects deployment at a domain root)
assets/
  css/main.css           The whole design system, token-driven (see below)
  js/main.js             Progressive enhancement: nav, scroll reveals, hero canvas
  fonts/                 Self-hosted IBM Plex (serif/sans/mono, latin subsets, ~135 KB total)
  img/                   SVG mark + favicon
.github/workflows/       GitHub Pages deploy on push to main
```

## Design system

Everything lives in CSS custom properties at the top of `assets/css/main.css`:

- **Heritage tints** — the four section colors of the 2001 site (blue home,
  gold profile, green expertise, coral clientele) are the accent system.
  Apply `tint-gold` / `tint-green` / `tint-coral` to a section or page `body`
  to re-accent everything inside it; blue is the default.
- **Type** — IBM Plex Serif (display), Plex Sans (text), Plex Mono (labels).
  Mono labels render inside `{ braces }` via the `.kicker` component — a nod to
  the old site's `{ © 2001.2002 Intellexi }` footer, now a code glyph.
- **Epigraphs** — the quote-led sections of the original site
  ("Engaging. Inspiring. Moving. Multimedia.") are preserved as the `.epigraph`
  component with archival citations.
- **Motion** — scroll reveals and the hero "loom" canvas are progressive
  enhancement in `assets/js/main.js`; both fully respect `prefers-reduced-motion`,
  and the site works with JavaScript disabled.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`
(enable Pages → Source: GitHub Actions in the repo settings). All in-page links
are relative, so the site also works under a subpath — except `404.html`, which
uses root-absolute links and assumes a custom domain / domain root.

## Things to confirm before launch

- **Contact email** — the site uses `info@intellexi.com` (the original 2001
  address). Update in all three pages + footers if the domain/mailbox differs.
- **Founding-era details** — Act I facts (clientele, taglines, quotes) come from
  Internet Archive snapshots of intellexi.com (2001–2004). Add or correct
  details on `story/index.html` as more of the original material is recovered.
- **Social preview image** — `og:` tags are in place but there is no raster
  `og:image` yet; add a 1200×630 PNG when brand assets are finalized.

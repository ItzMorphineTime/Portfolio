# Design & UX Review — joeloe.co.uk

**Date:** 2026-08-28 · **Method:** measured against the live local build (fresh cache) at desktop 1501×1476 and emulated mobile 375×812, plus a stylesheet/DOM audit. Numbers below are measured, not estimated. Companion to [IMPROVEMENTS_PLAN.md](IMPROVEMENTS_PLAN.md) — items adopted from here should be ticked into the plan.

> **✅ IMPLEMENTED 2026-08-28** (same day, verified): F1 grid folding (desktop 26,227→15,268 px; mobile 48,771→24,197 px), F2 compact mobile header (195→101 px, 70 px scrolled; single-row scrollable pills at 40 px tap height), F3 static meta fallback, F4 initials/NDA placeholders, F5 footer, F6 skill grouping (4 categories via a new `category` field), F8 `:focus-visible`, F9 scroll cue + `.docx` button hints + DevTools easter egg, and Part 2's GoatCounter (page views + custom events: CV downloads, gallery opens, role filters, repo clicks, show-all). **Not done (deliberate):** F6's %-to-tiers change and F9 interests copy/dates (your voice/facts), theme toggle (backlog), F7 (doc note only).

**Part 2 of this document covers the analytics investigation.**

---

## What's already strong

Worth naming, so improvements don't regress it:

- **Distinct identity** — the dark/gold theme, the role-filter concept, and the Matrix easter egg give the site a personality most portfolios lack. The role filter doubles as an elevator pitch ("I'm four people").
- **Genuinely fast** — ~0.4 MB initial load, ~2 MB full scroll, thumbnails + lazy video posters. Text contrast passes WCAG AA everywhere measured (5.4:1–10:1).
- **Real features, not veneer** — media gallery with video, live GitHub stars, client-side CV export, award badges. Reduced-motion is respected; the gallery has keyboard nav and a focus trap.
- **Single-source data model** — every improvement below can ride the existing `data.json` conventions.

---

## Findings

### 🔴 F1 — The page is very, very long

**Measured:** 26,227 px tall on desktop; **48,771 px on mobile (~60 screens of thumb-scrolling)**. The Projects section alone is **54% of the entire page** (26,203 px mobile), Skills is 6,446 px, Software 6,188 px.

A recruiter skims for ~60–90 seconds. Right now the strongest material (awards, featured work) is diluted by 47 project cards and 21 repo cards of equal visual weight, and Interests/Contact are ~45k px below the fold on a phone.

**Suggestions (in preference order):**
1. **"Show more" folding per grid** — render the first ~9 projects and ~6 repos, then a centred "Show all 47 projects" pill that expands the rest (a `hidden`-class toggle; no data changes, preserves deep-linking since sections stay in the DOM). Biggest single UX win available; cuts the default page to roughly a third.
2. **Compact rows for legacy work** — a `"compact": true` flag rendering a slim, imageless list row (title · date · tech) for the older digital-signage-era projects, keeping cards for work with imagery.
3. At minimum, reorder so nothing weak sits above something strong (ties into Phase 5 curation).

### 🔴 F2 — Mobile fixed header eats 24% of the screen

**Measured:** the header is **195 px tall on a 375×812 phone** (logo stacked above role pills, which wrap to 2–3 rows) and it's `position: fixed`, so a quarter of every screen is chrome for the whole 48k-px scroll. Role pills are also 33 px tall — under the 44 px touch-target guideline.

**Suggestions:**
1. On ≤768px, make `.role-filters` a **single horizontally-scrollable row** (`flex-wrap: nowrap; overflow-x: auto`, hidden scrollbar — same pattern as the new bottom nav), hide the "ROLES:" label, and keep the logo + pills on one or two tight lines → header ≈ 90–100 px.
2. Optionally **shrink further on scroll** (the `.scrolled` class already exists; add a mobile rule collapsing the logo row) → ~56 px while reading.
3. Bump pill tap size on mobile (`padding: 0.55rem 1rem`, min-height 40–44 px).

### 🔴 F3 — Link previews are blank when the site is shared

All `<head>` meta (Open Graph, Twitter card, title, description) is injected by `app.js` at runtime. LinkedIn, Slack, WhatsApp, iMessage and X **do not execute JavaScript** — they see the bare template, so sharing joeloe.co.uk (the thing a portfolio exists for) produces a blank/naked preview despite the nice `og-image.jpg`.

**Suggestion:** bake a **static fallback** of the identity-critical tags directly into `index.html` (`<title>`, description, `og:title/description/image/url`, `twitter:card`) with the current values; `applyMeta()` keeps overwriting them at runtime so `data.json` remains the source of truth for browsers/Google. One-time edit, ~15 lines; drifts only if name/headline change (a comment can note that). A tiny generator step (`tools/` script writing the tags from `data.json`) removes even that drift, at the cost of remembering to run it.

### 🟠 F4 — Empty placeholder cards undercut credibility

Nokia (NDA) and Unity Unite Barcelona (and any future imageless project) render a full-size card with a generic picture-frame icon — it reads as "broken image" rather than "confidential project."

**Suggestions:** style the placeholder with intent: the project's initials or a themed icon (🔒 "NDA" for confidential work) over the gradient, or a `"nda": true` flag rendering a deliberate "Under NDA" treatment. Alternatively fold imageless projects into the compact-row treatment from F1.

### 🟠 F5 — No footer; the page just stops

After Contact there's nothing — no copyright, no back-to-top, no "built with," no source link (a zero-build vanilla-JS site is itself a flex for a Software Engineer).

**Suggestion:** small footer: `© Joseph Loe · Built from a single data.json — view source on GitHub · Back to top ↑`. Ten minutes of work, closes the page properly.

### 🟠 F6 — Skills section: 24 equal bars is a wall

6,446 px on mobile of identical bars. Percentage self-scores are also a known recruiter eye-roll ("what does 25% JetBrains mean?") — the bar visual invites that reading.

**Suggestions:**
1. **Group by discipline** with sub-headings (Engineering / AI / VP & Realtime / Tooling) — the `roles` tags already on each skill can drive grouping with no new data.
2. Consider dropping the numeric % label (keep the bar as a relative visual) or switching to 3–4 word tiers ("Expert / Proficient / Working").
3. Or compact mode: chips for everything below a proficiency threshold, bars only for the headline eight.

### 🟠 F7 — Featured span-2 cards can leave grid holes — ✅ RESOLVED STRUCTURALLY (2026-08-28)

With strict DOM order (deliberate — position = data order), a `featured` card that lands at an odd grid position leaves a one-cell gap at some viewport widths.

**Resolution:** the projects grid is now **2-column on desktop** (`minmax(440px, 1fr)`) with all featured projects moved to the top of `data.json` — featured cards (span 2) therefore render as clean full-width rows and column gaps are structurally impossible at any viewport width. Featured imagery grew to 320 px tall in the bargain. (`grid-auto-flow: dense` remains rejected: it breaks the order-control promise.)

### 🟠 F8 — No branded focus styles

The stylesheet's only `outline: none` is on the modal `<video>` (fine), so keyboard users get the browser default ring — functional, but the default blue ring clashes with the theme and some custom controls (gallery tiles, thumbs) deserve a clearly visible indicator.

**Suggestion:** one global rule: `:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 2px; }` (+ green under `.matrix-mode`). Two lines, real a11y polish.

### 🟡 F9 — Smaller observations

- **Matrix mode is invisible** until someone clicks Software Engineer. A one-time subtle hint (e.g. a "</>" glyph shimmer on the pill, or a console.log easter egg for the devs who will inspect) would surface the site's best moment. Keep it subtle.
- **Section navigation labels** — the bottom/side nav is icon-only; consider text labels under icons on mobile (tab-bar convention) since tooltips are gone there.
- **Hero** — strong, but no scroll affordance; a small chevron/"scroll" cue helps on tall hero screens. CV buttons could hint the format: "Download CV (.docx)".
- **Interests** cards are long prose; 2–3 lines each would scan better (content edit, your voice).
- **Chronology** — ~14 legacy projects still undated (Phase 5); dates on cards build the career narrative the recruiter is reconstructing.
- **Theme** — dark-only is a legitimate brand choice; if a light theme ever happens (backlog), the CSS-variable architecture makes it cheap.

---

## Suggested order of attack

**Quick wins (≈ a day together):** F3 static meta fallback · F5 footer · F8 focus styles · F2.3 pill tap-size · F4 NDA placeholder styling.
**The big one:** F1 show-more folding (+ F2 mobile header compaction) — transforms the mobile experience.
**With your input:** F6 skill grouping choices, F9 content edits, Phase-5 dates/curation.

---
---

# Part 2 — Analytics investigation

**Goal:** know that visits happen, where they come from, and what gets used (CV downloads!) — without cookie banners, privacy guilt, a backend, or a build step. Constraints: GitHub Pages (static, no server code), UK/GDPR context, near-zero budget.

## The options

| Option | Cost | Cookie-banner needed? | Weight | Custom events | Notes |
|---|---|---|---|---|---|
| **GoatCounter** ⭐ | Free (personal) | **No** — no cookies, no PII, built for GDPR-no-consent | ~3.5 KB | Yes | Open source, made for exactly this use case; plain but complete dashboard (referrers, paths, screen sizes, countries); optional public dashboard |
| **Umami Cloud (Hobby)** | Free (100k events/mo, 3 sites) | **No** — cookieless | ~2 KB | Yes | Prettier dashboard than GoatCounter; hosted EU; free tier is generous for a portfolio |
| **Plausible** | **€9/mo** | No — cookieless | <1 KB | Yes | The gold standard UX, but paid; self-hosting needs a server we don't have |
| **Cloudflare Web Analytics** | Free | No | ~6 KB | No | Coarse metrics, no events (can't count CV downloads); fine as a fallback |
| **GA4** | Free | **Yes** — consent banner required in UK/EU | ~90 KB+ | Yes | Rejected: consent UX tax, heavyweight, privacy-hostile, absurd overkill here |
| **GitHub repo Insights → Traffic** | Free | n/a (server-side) | 0 KB | No | Already available today, zero code — but only 14 days of history, views/uniques only, and Pages traffic ≠ repo traffic (limited value; use as a curiosity, not the answer) |

**Ad-blocker reality check (applies to all client-side options):** 20–40% of a tech-savvy audience blocks analytics scripts; GoatCounter/Umami are blocked somewhat less than GA but not never. Treat numbers as directional. There is no server-side workaround on GitHub Pages — accept it.

## Recommendation: GoatCounter

Free forever for personal use, explicitly designed for the "no consent banner needed" case (no cookies, no persistent identifiers), ~3.5 KB, open source, and supports the custom events we actually want. Umami Cloud is the runner-up if a prettier dashboard matters — identical integration shape, so switching later is a one-line change.

## Implementation sketch (when approved)

1. **Account:** create `joeloe.goatcounter.com` (2 minutes, email only).
2. **Page views:** one static tag in `index.html` (static like the F3 meta fallback — analytics must not depend on the JS app booting):
   ```html
   <script data-goatcounter="https://joeloe.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
   ```
3. **Custom events** (small helper in `app.js`, no-op when the script is blocked/absent):
   - `cv-download-designed` / `cv-download-ats` — the number that actually matters
   - `gallery-open:<project>` — which work gets looked at
   - `role-filter:<role>` — is the site's signature feature used?
   - `repo-click:<name>` / outbound link clicks
4. **Hygiene:** GoatCounter ignores its owner via a "skip my visits" cookie/setting; localhost is excluded by default. Honour DNT (it does by default).
5. **Config-as-data (optional):** an `"analytics": { "goatcounter": "joeloe" }` field in `data.json` for template reusability — but the base tag should stay static in `index.html` regardless (see above), so this only feeds the event helper.
6. **Plan entry:** tick the Phase 6 "privacy-friendly analytics" backlog item when live; verify events fire from the deployed site, since localhost isn't counted.

**Effort:** ~1 hour including event wiring and verification. **Cost:** £0. **Consent banner:** none needed.

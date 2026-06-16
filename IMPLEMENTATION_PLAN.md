# Implementation Plan & Tracker

Living plan for acting on [IMPROVEMENTS.md](IMPROVEMENTS.md). Update the checkboxes and **Status** as work progresses. Each task notes the source item (`Ref: #n`), the files it touches, the plan, and acceptance criteria.

> **Excluded by request:** the education images work (IMPROVEMENTS #2 — phantom `images` in education entries). Not in this plan; revisit separately if ever wanted.

## How to use this file
- Tick `- [ ]` → `- [x]` as tasks complete; keep the **Status** column in the summary in sync.
- Test changes against a local server (`python -m http.server 8000`), **not** `file://` (the `fetch('./data.json')` call needs HTTP).
- Verify image/path changes against a **case-sensitive** assumption (GitHub Pages is Linux) before pushing.
- **Git is handled manually by the user** — all commits/branches/pushes are the user's responsibility. Changes are left uncommitted for the user to review and commit per phase.

## Status legend
`☐ Not started` · `◐ In progress` · `☑ Done` · `⊘ Blocked/Deferred`

---

## Summary

| Phase | Focus | Ref(s) | Status |
|-------|-------|--------|--------|
| 0 | Prep / baseline | — | ☑ |
| 1 | Fix live breakage | #1 | ☑ |
| 2 | README correction | #3, #4 | ☑ |
| 3 | Quick wins (cleanup, typos, SEO basics) | #6, #11, #12 | ☑ |
| 4 | Hardening & polish | #5, #7, #8, #9, #10 | ◐ (only 4.6 career-data + thumbnails remain — your call) |
| 5 | Refactor | #13 | ☑ (icon dedupe + template abstraction optional) |
| 6 | Feature: CV `.docx` export (ATS + Designed) | #14 | ☑ Done & verified |
| 7 | Backlog / future | Low list | ☐ |

---

## Recent fixes (post-Phase 6)
- [x] **CV designed-variant date overflow** — line-item dates wrapped their last token onto a new line. Fixed by putting each date in a fixed-width (1.8"), right-aligned **borderless table cell** (per-row helper table, not the old full-page layout table) with abbreviated months, so dates can't wrap. (`cv.js`) — confirmed by you.
- [x] **Footer-nav hover tooltips clipped** — `.footer-nav { overflow-x: auto }` makes the browser compute `overflow-y: auto` too, clipping the `::before` tooltip (positioned above the bar) inside the nav. Fixed: base nav → `overflow: visible` (tooltips escape on desktop), horizontal scroll moved to the ≤768px breakpoint (touch = no hover), tooltip `z-index: 10`. (`styles.css`) — verified in-browser: nav `overflow-y` is now `visible`, tooltip no longer clipped.
- [x] **Image-modal niceties** — added (1) **adjacent-image preloading**: on open/navigate the next & previous images are warmed via `new Image()` so paging is instant; (2) **touch swipe** on the image stage (≥50px horizontal, <40px vertical slop → next/prev; ignores vertical scroll & multi-touch); (3) **loading UX**: a CSS spinner shows while a new image decodes and the image fades in (`.is-loaded`), with cached images settled synchronously so the spinner doesn't flash; (4) **single-image polish**: nav arrows + counter auto-hide and the focus trap skips hidden controls when a project has one image. New `#modalStage`/`#modalSpinner` markup; `aria-live` on the counter. (`index.html`, `app.js`, `styles.css`) — verified: cross-file wiring + nav/swipe logic assertions all pass, `node --check app.js` clean.

---

## Phase 0 — Prep / baseline
- [ ] *(User)* Create/checkout a working branch — git is done manually by the user.
- [x] `data.json` validates as JSON and the site renders from it (already live at `joeloe.co.uk`).
- [x] Baseline captured: repo **~213 MB**; image-path audit found **6 broken refs** (2 case-mismatch + 4 nonexistent) — see Phase 1.

---

## Phase 1 — Fix live breakage 🔴

### 1.1 Case-sensitive image paths — `Ref: #1`
- [x] Fixed `EpicDirectors` references: `./EpicDirectors/epic (1).jpg` / `(2)` → `Epic` (capital) to match the actual files.
- [x] Audited **all 111** image/logo paths in `data.json` against `git ls-files` (case-sensitive). Also found & removed **4 nonexistent refs**: `WA (17)–(20)` (folder only has 16 images).
- [x] Re-validated: `data.json` parses; 0 remaining problems except the 3 intentionally-excluded education images.
- [ ] ⊘ *(Optional, deferred)* CI guardrail (GitHub Action) to fail builds on case/missing path mismatches — can add on request.
- **Files:** `data.json`
- **Done when:** every project/logo image resolves on a case-sensitive host; no broken-image placeholders in production. ✅

---

## Phase 2 — README correction 🟠  `Ref: #3, #4`
- [x] Replaced the fictional `assets/` structure diagram with the real layout (root-level assets + per-project folders) + a case-sensitivity note.
- [x] Updated all example paths to real conventions (`./Headshot-t-u.png`, `./Morphtransparent.GIF`, `./CT-Logo.svg`, `./MyProject/...`) and the example `roles` to the real set.
- [x] Documented the actual deployment: real clone URL (`ItzMorphineTime/Portfolio`) + custom domain `joeloe.co.uk` via `CNAME`.
- [ ] → folds into **Phase 5**: make the "single JSON file" claim literally true once hero/contact copy moves into `data.json`.
- [ ] → folds into **Phase 3**: refresh the favicon/SEO "tips" once they're actually implemented.
- **Files:** `README.md`
- **Done when:** a stranger could clone, follow the README, and get a working site without hitting path/structure surprises. ✅

---

## Phase 3 — Quick wins 🟡

### 3.1 Remove dead code & data — `Ref: #6`
- [x] Deleted the unused `matchesRole()` function from `index.html`.
- [x] Removed `headshotalt2` from `data.json` (never read).
- [x] Resolved the orphaned `"nDisplay Operator"` role — **dropped the tag** from the Unreal Engine skill (only one skill had it, so a dedicated filter would've been near-empty).
- **Files:** `index.html`, `data.json`

### 3.2 Fix user-visible typos — `Ref: #11`
- [x] Fixed all 7: `September`, `ghostframe`, `simultaneous`, `nDisplay`, `Virtual`, `optimising`, `Scottish`. Verified none remain via grep.
- **Files:** `data.json`

### 3.3 SEO & metadata basics — `Ref: #12`
- [x] Real `<title>` + meta description including the name ("Joseph Loe — …") + `author` + `canonical`.
- [x] Added `favicon.svg` (gold "JL" monogram matching the theme) and linked it.
- [x] Added Open Graph + Twitter Card tags (title/description/url/image, `summary_large_image`).
- [x] Added JSON-LD `Person` structured data (name, jobTitle, worksFor, sameAs, email).
- [x] Added `robots.txt`, `sitemap.xml`, and a themed `404.html`.
- [x] Refreshed the README "Tips" to match (closes the Phase 2 carry-over).
- [ ] ⊘ *(Nice-to-have)* dedicated 1200×630 OG share image — currently reusing the headshot; swap in a proper card later.
- **Files:** `index.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `404.html`, `README.md`

---

## Phase 4 — Hardening & polish 🟠🟡

### 4.1 Escape output & use event delegation — `Ref: #5` ✅
- [x] Added an `esc()` helper and applied it to **all** interpolated `data.json` values (text + attributes) across every render function.
- [x] Replaced inline `onclick="filterByRole('${role}')"` with `data-role` + a single delegated listener on the filter container (removes the apostrophe-in-role footgun).
- [x] Also escaped the `data-roles` JSON attributes and `img` `src`/`alt`/`href` interpolations.
- [x] **Verified** in-browser: filtering by role works via delegation; no console errors.
- **Files:** `index.html`

### 4.2 Image performance — `Ref: #7` ◐
- [x] Added `loading="lazy"` + `decoding="async"` to project images and company logos; `fetchpriority="high"` on the (eager) hero headshot.
- [x] Added explicit `width`/`height` to logos (50×50) and headshots (350×350) to curb layout shift.
- [ ] ⊘ Generate thumbnails / `srcset` for cards (reserve full-res for the modal) — needs an image-processing step; not yet done.
- [x] **Your call — wired orphaned folders into the JSON instead of deleting.** Added `Amazon/` to the existing "Amazon Studio VP Advert"; created 4 evidence-based entries from the photos: **Spies** (NDA VP shoot), **Queen Mary Venue Previs**, **Dear Evan Hansen**, **Workday Rising**. All verified rendering with images (30 cards). ⚠️ Wording was inferred from the photos — please review/refine and add dates if you want.
- [ ] ⊘ Stray headshot variants (`MorphWolf*`, `Headshot.jpg`, `Headshot-t.png`, `CT_NEP_portrait…`) are alternate headshots, not event content — left in place; say the word if you want any used or removed.
- **Files:** `index.html`, `data.json`

### 4.3 Matrix animation — `Ref: #8` ✅
- [x] Converted `setInterval(draw, 33)` to `requestAnimationFrame` throttled to ~30fps.
- [x] Gated the effect behind `prefers-reduced-motion` (theme still switches; heavy canvas animation is skipped).
- [x] Pauses on `visibilitychange` (hidden tab) and cleans up its listeners on stop.
- [x] **Verified:** Software Engineer toggles matrix-mode; no errors.
- **Files:** `index.html`

### 4.4 Accessibility — `Ref: #9` ✅
- [x] `aria-label` added to footer-nav icon buttons (from `data-tooltip`) + `aria-label` on the `<nav>`.
- [x] Modal is now a real dialog: `role="dialog"` + `aria-modal`, focus moves in on open, **focus trap** on Tab, focus returns to the trigger on close. Gallery is now keyboard-openable (`tabindex`/`role=button`/Enter+Space) too.
- [x] Skill bars get `role="progressbar"` + `aria-valuenow/min/max` + label.
- [x] Added a `prefers-reduced-motion: reduce` block neutralising animations/transitions/smooth-scroll.
- [x] Lightened `--text-muted` `#6b6b7b` → `#8b8ba3` for WCAG AA on the dark background.
- **Files:** `index.html`

### 4.5 Empty-section handling on filter — `Ref: #10` ✅
- [x] `updateSectionVisibility()` hides any section whose `.filterable` children are all hidden. **Verified:** "AI Consultant" hides Experience/Education/Projects; "All" restores them.
- [x] Decision: **Interests stays role-agnostic** (always shown) — it's personal/non-role content, so it has no `.filterable` items and is intentionally never hidden. Documented here.
- **Files:** `index.html`

### 4.6 Data quality / role tagging — `Ref: #11` ⊘ (needs your input — career facts)
- [ ] Tag projects more selectively (currently all share the same 3 roles). *This is your career data — I won't guess at it.*
- [ ] Correct questionable role tags (e.g. Service Desk Analyst / GreedyGull tagged `VP Supervisor`/`Technical Artist`). *Your call.*
- [ ] "ARRI & Friends" appears twice — but the two entries have **different dates** (Dec 2021 vs Aug 2023), so they may be **distinct events**, not a true duplicate. Confirm before merging.
- **Files:** `data.json`

---

## Phase 5 — Refactor 🟡  `Ref: #13`
- [x] Split inline CSS → `styles.css` (1439 lines) and JS → `app.js` (752 lines); `index.html` is now 139 lines. Still zero-build / Pages-compatible (`app.js` loaded with `defer`, keeping inline handlers working; JSON-LD left inline). **Verified:** external CSS + JS load, no console errors, all sections render.
- [x] Moved hardcoded copy into `data.json`: added `name`, `heroHeading` (with `{highlight}` syntax for the gold word), `contactTitle`, `contactSubtitle`. Renderers use them with fallbacks; the header logo now shows the name. **This makes the README "single JSON file" claim true.** ✅ Verified in-browser.
- [x] **Fully data-driven `<head>` (your follow-up):** removed ALL hardcoded identity/SEO from `index.html` (title, description, author, canonical, Open Graph, Twitter, JSON-LD). `app.js` `applyMeta()` now generates them at runtime from `data.json` (new fields: `headline`, `siteUrl`, `jobTitle`, `organization`) plus an **initials favicon** built from `name`. Also made the Matrix/alt-headshot trigger configurable via `matrixRole`, and made `404.html`/`favicon.svg` generic. **Verified reusable:** swapping in "Ada Lovelace" data updates title/OG/canonical/favicon initials/JSON-LD live. Caveat noted: JS-injected meta isn't seen by non-rendering social scrapers (`robots.txt`/`sitemap.xml`/`CNAME` remain per-deployment config).
- [ ] ⊘ *(Optional)* Extract the duplicated inline SVG icons (email/LinkedIn/GitHub/website) into one icon map/helper — not done; low risk to leave.
- [ ] ⊘ *(Optional)* Section-config/template abstraction across the seven `render*()` functions — not done.
- **Files:** `index.html` → `styles.css`, `app.js`; `data.json`

---

## Phase 6 — Feature: CV export to `.docx` (ATS + Designed) 🟢  `Ref: #14`  ✅ DONE

> **Built & verified.** Decisions taken: **D1** vendor `docx@9.7.1` (`vendor/docx.iife.js`, lazy-loaded on first click — confirmed not loaded on page load); **D2** always full CV (role filter ignored); **D3** added optional fields. New files/edits: `cv.js` (lazy loader + `buildCvModel` + `renderAtsDocx` + `renderDesignedDocx` + download), two buttons in the hero (`app.js`), button styles + matrix parity (`styles.css`), `cv.js` script tag (`index.html`), and `location` + `cvAccent` in `data.json`.
>
> **Both CVs now list all projects** (title + date only). **Designed variant reworked to single-column** (not the old full-page sidebar table): accent name header, full-width accent rules under headings, accent-coloured company/course. Dates are right-aligned inside **small borderless per-row tables with a fixed-width date column** so they can't wrap (an earlier tab-stop approach wrapped the last token, per your screenshot — fixed). Months are abbreviated in the designed dates so even the longest range fits.
>
> **Verification (in-browser):** both variants produce valid OOXML (`PK` zip magic, correct `.docx` MIME); unzipped `word/document.xml` contains the real data + all headings, including **SELECTED PROJECTS** with titles + dates; the designed variant uses fixed-width (2600 twip) right-aligned date cells (8 borderless 2-col helper tables) with abbreviated dates (e.g. `Aug 2018 – Sep 2018`) + accent `d4a853`; **reusability proven** — "Ada Lovelace" data produced an Ada CV with no "Joseph Loe"; no console errors.
>
> **Optional follow-ups (not done):** add `contact.phone` (unknown — left out); add per-item `highlights: []` to turn the long prose descriptions into punchy bullets (renderer already supports it, falls back to `description`). Manual check worth doing: open both in Word once to eyeball layout.

**Goal:** two buttons that each generate and download a real Word `.docx` built **purely from `data.json`** (no hardcoded content, reusable with anyone's data, consistent with the now fully data-driven head):
1. **ATS** — plain, single-column, maximally parseable for applicant-tracking systems.
2. **Designed** — single-column, typographic, accent-coloured (table-free), for sending to humans / general use.

### Decisions (resolved)
- **D1 — Library delivery:** ✅ vendored `docx@9.7.1` to `vendor/docx.iife.js` (IIFE build, exposes the `docx` global), **lazy-loaded on first click** — confirmed not loaded on initial page load. `DOCX_SRC` in `cv.js` is a single constant if you ever want to swap to a CDN.
- **D2 — Role scope:** ✅ **always full CV** (your choice) — the on-screen role filter is ignored; every CV includes all experience / skills / projects.
- **D3 — Optional data enrichment:** ✅ added `location` + `cvAccent`; `contact.phone` and per-item `highlights: []` are also supported by the renderer (optional, graceful fallback) — just not populated in `data.json` yet.

### Data model additions (`data.json`)
- [x] `location` (e.g. "Brighton, United Kingdom") — CV header. *(added)*
- [x] `cvAccent` — accent colour for the Designed variant (default site gold `#d4a853`). *(added)*
- [ ] `contact.phone` — renderer supports it; not added (unknown / kept off the site).
- [ ] `highlights: []` on experience items — renderer supports it (bullets, falls back to `description`); not yet populated.
- *(Reuses existing: `name`, `headline`, `jobTitle`, `organization`, `bio`, `skills`, `experience`, `projects`, `education`, `interests`, `contact`.)*

### Architecture
- [x] New module **`cv.js`** (loaded `defer`) exposing `downloadCv(variant, btn)` + `generateCvBlob(variant)` where `variant ∈ {"ats","designed"}`.
- [x] **Lazy loader** injects `vendor/docx.iife.js` on first use, caches the promise, shows a "Generating…" button state.
- [x] **`buildCvModel(data)`** — single source of truth (always full; no role filter): normalises into `{ name, headline, contacts[], summary, skills[], skillDetails[], experience[], projects[], education[], interests[] }`. Both renderers consume it (no duplicated mapping).
- [x] **`renderAtsDocx(model)`** and **`renderDesignedDocx(model, accent)`** → `docx.Document`.
- [x] Download via `Packer.toBlob(doc)` → `<a download>` + `URL.createObjectURL`; filename `‹name›-CV.docx` / `‹name›-CV-ATS.docx` (slugified).
- [x] No HTML escaping needed (the `docx` lib XML-escapes `TextRun` content); raw strings passed.

### Variant A — ATS (parser-safe)
- [x] Single column; **no tables-for-layout, no images, no text boxes, no header/footer** for content; standard font (Calibri); left-aligned.
- [x] Linear order: **Header** (name, headline, contact line) → **Summary** (`bio`) → **Skills** (comma list) → **Experience** (Title — Company, dates; `highlights` bullets or `description`) → **Projects** (title + date) → **Education** (institution, course, grade, modules) → **Interests**.
- [x] Standard heading text ("Summary", "Skills", "Experience", …); data order preserved.

### Variant B — Designed (for humans) — single-column (reworked per feedback)
- [x] Name block (large, `cvAccent`), headline, contact line, thick accent rule.
- [x] Single column with accent section headings (full-width bottom rule), accent-coloured company/course. **Dates right-aligned via small borderless per-row tables with a fixed-width date column** (abbreviated months) so they never wrap — no full-page layout table.
- [x] Sections: Profile → Skills (inline list) → Experience (bullets) → Selected Projects (title + date) → Education → Interests. Real selectable text. *(Not ATS-optimised — that's variant A's job.)*

### UI
- [x] Two buttons rendered into the hero (data-driven, after the contact links): **"Download CV"** (designed) + **"ATS CV"** — download icon, `aria-label`, gold styling, **matrix-mode green parity**.
- [x] Click → disabled "Generating…" state → lazy-load lib → build → download → restore; `alert` on failure.

### Verify
- [x] Both variants produce valid OOXML (`PK` zip, correct `.docx` MIME); unzipped `word/document.xml` checked for real content + all headings (incl. SELECTED PROJECTS).
- [x] **Reusability:** "Ada Lovelace" data produced an Ada CV (no "Joseph Loe") with zero code changes.
- [x] Lazy-load confirmed (vendored, not loaded until click); no console errors; correct per-variant filenames.
- [ ] *(Manual, recommended)* open both in Word / Google Docs / LibreOffice to eyeball layout + run a paste-as-plain-text ATS sniff test — couldn't be done from here (no Office runtime).

- **Files:** `cv.js`, `vendor/docx.iife.js`; edits to `index.html` (script tag + buttons), `app.js` (button render), `styles.css` (button styles), `data.json` (`location`, `cvAccent`), `README.md`.
- **Done when:** both buttons download correct, good-looking `.docx` files generated entirely from `data.json` — ATS-parseable (A) and design-polished (B), no hardcoded content. ✅ (pending your manual Word eyeball)

---

## Phase 7 — Backlog / future 🟢 (Low-priority list)
- [ ] Document that a local server is required (`file://` breaks `fetch`) — or add an inline-data fallback.
- [x] Modal niceties: preload adjacent images, loading spinner for large images, touch swipe. — **done** (see *Recent fixes* above).
- [ ] Light/dark theme toggle.
- [ ] Privacy-friendly analytics (e.g. Plausible).
- [ ] JSON Schema for `data.json` (editor autocomplete + validation; guards against path/role mistakes).
- [ ] Reconsider the skill-bar track color (`--skill-bar-bg: #8B2035`) — reads as an unfinished bar.

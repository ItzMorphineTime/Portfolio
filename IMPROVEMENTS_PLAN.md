# Improvements Plan

Living plan and tracker for the portfolio site ([joeloe.co.uk](https://joeloe.co.uk/)), based on a fresh audit of the repo on **2026-08-26**. Supersedes the archived [archive/IMPROVEMENTS.md](archive/IMPROVEMENTS.md) and [archive/IMPLEMENTATION_PLAN.md](archive/IMPLEMENTATION_PLAN.md) (phases 0–6.5 of the old plan are done and live; unfinished items are carried forward here).

## How to use this file
- Tick `- [ ]` → `- [x]` as tasks complete; keep the **Status** column in the summary in sync.
- Test against a local server — preferably `python tools/serve.py 8000` (sends no-cache headers so edits show up immediately; plain `python -m http.server` heuristically caches stale files for hours). Never `file://` (the `fetch('./data.json')` call needs HTTP).
- Image/logo paths in `data.json` are **case-sensitive** in production (GitHub Pages runs on Linux) — match on-disk capitalisation exactly.
- **Git is handled manually by the user** — changes are left uncommitted for review; no commits/pushes by the assistant.
- Items marked **⚑ needs your input** are career facts or judgement calls only Joseph can settle.

## Status legend
`☐ Not started` · `◐ In progress` · `☑ Done` · `⊘ Blocked / needs input`

---

## Summary

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Content update — wire new images, fix bad asset, dedupe entries | ☑ (only 1.4 QM leftovers await your call) |
| 2 | Content update — new projects & missing dates (⚑ user input) | ◐ (11 new projects added 2026-08-27; 14 legacy dates + role tags pending) |
| 3 | Gallery video support (`VolvoSafetyBTS.mp4`) | ☑ Done & verified |
| 3.5 | Wire 2nd media drop (Ulster, Brockwell, Lima, Unlimit, GhostFrame, Coldplay+, ARRI BTS) | ☑ Done & verified 2026-08-27 |
| 4 | Media & performance (thumbnails, video encodes, headshot, OG image) | ☑ Done & verified (deletions deferred) |
| 4.5 | New **Software Projects** section (21 GitHub repos, live star badges) | ☑ Done & verified 2026-08-27 |
| 4.6 | **Video posters fixed** — real frames auto-extracted per video; no-cache dev server | ☑ Done & verified 2026-08-27 |
| 4.7 | **Mobile nav UX** — bottom-centred bar on ≤768px (left bar overlapped content) | ☑ Done & verified 2026-08-28 |
| 5 | Data quality — role tagging & wording (⚑ user input) | ☐ |
| 6 | Backlog / future | ☐ |
| 7 | CV export review — awards/projects/software drift + A4/ATS polish | ☑ Implemented & verified 2026-08-27 (⚑ highlights/phone remain) |
| 8 | Design/UX deep dive + analytics → [DESIGN_UX_REVIEW.md](DESIGN_UX_REVIEW.md) | ☑ Implemented & verified 2026-08-28 (grid folding, compact mobile header, static meta, placeholders, footer, skill groups, focus styles, GoatCounter w/ events) |
| 12 | **3rd media drop wired** — Believe Me (2), Clayface (5), Rapture (7 + 2 videos) + new **Joy Awards — Riyadh** project (Oct 2025, 6 imgs + video). 3 videos web-encoded (132→4.9 MB, 53→1.1 MB, 143→15.8 MB); 2 oversized masters gitignored; 23 thumbs + 3 auto-posters generated | ☑ Done & verified 2026-08-30 |
| 11 | **PDF CV export** — each CV button is now a `.docx / .pdf` split; PDFs built by vendored `pdfmake` (lazy-loaded, A4, real text, 2 pages, hyperlinked in the designed variant; ATS + designed both mirror the docx content incl. Awards & Open Source) | ☑ Done & verified 2026-08-28 |
| 10 | **Appeal pass** — skill roster curated (28 evidence-backed tiles: +nDisplay/Photon/MoCo/Media Servers/DMX/React+TS/Perforce/Blender/WPF; −JetBrains/ByteDance/AI tools/Java/Microsoft suite; Networking & ML renames), hero **stats band**, **clients wordmark strip** (18 brands), **Speaking & Training** section via `talk` flags, `skillsNote` subheading, projects/software moved above skills | ☑ Done & verified 2026-08-28 |
| 9 | **Radial skills redesign** — ring tiles + detail modal (skills 2,420→1,216 px desktop, 6,446→1,528 px mobile); featured-first grid; bottom nav now ≤1280px (left bar overlapped content on small laptops/tablets) | ☑ Done & verified 2026-08-28 |

---

## Current state (baseline, 2026-08-26)

**What's built and live:** fully JSON-driven site (all content, `<head>` SEO/meta, favicon generated from `data.json` at runtime); role-based filtering with Matrix mode + three role-aware headshots; full-viewport gallery viewer with thumbnail strip, swipe, preloading and focus-trap; left-anchored collapsible side nav; ATS + designed `.docx` CV export (vendored `docx`, lazy-loaded); XSS-escaped rendering; a11y + reduced-motion support; `robots.txt`/`sitemap.xml`/`404.html`.

**Fresh audit findings:**
- ✅ All 130 referenced image/logo paths resolve on disk **except** the 3 phantom education images (`Reference/Poster43.png`, `BtonUni_02.png`, `Northbrook_01.png`) — those are never rendered by `renderEducation()`, so nothing breaks. *(Education images remain excluded from scope by prior request.)*
- 🆕 **Four folders contain media not yet wired into `data.json`:**
  - `Flite/FLITE-Case-Study-Header-1980x820.jpg` (205 KB) → matches **Framestore Flight VP shoot** (0 images).
  - `ScottishWhiskey/ScotWhisky_01–03.jpg` (0.3–0.7 MB each) → matches **Scottish Whiskey Exhibit VR** (0 images).
  - `Volvo/VolvoSafety.avif` (77 KB) + `Volvo/VolvoSafetyBTS.mp4` (**14.9 MB video**) → matches **Volvo AR Safety Demo** (0 images). The gallery is image-only today — the MP4 needs Phase 3.
  - `BritishArrows/arrows (1).jpg` is **not an image** — it's a 100-byte saved JSON error (`401 Unauthorized`) from the British Arrows CDN. Delete or re-download.
- 🔁 **"Brit Awards — Golden Arrow Winner" is a confirmed duplicate** (per [PROJECT_IMAGE_RESEARCH.md](PROJECT_IMAGE_RESEARCH.md)): the award is the **British Arrows 2024 Craft Gold** (Innovative Use of Realtime 3D) for **"Live Again" by The Chemical Brothers** — already in `data.json` with 6 images. Recommended: delete the stub entry, add the award credit to the Chemical Brothers entry.
- 🗓 **14 of 37 projects have no dates** (Spies, Queen Mary, Dear Evan Hansen, Workday, both Framestore shoots, APA, Deloitte, Dark X Light, Epic Directors, Doha, Media Freedom, McDonald's, VMWare, Cisco, Gartner, World Athletics).
- 🖼 `QueenMary/QM (1–3).jpg` (the `.jpg` trio, distinct from the wired `.jpeg` set) are on disk but unreferenced — add or remove.
- 🐘 `Headshot-t-u.png` (**6.7 MB**) is live as `headshot2` (Technical Artist headshot); `Headshot-t.png` (6.8 MB) is unreferenced. Repo is ~125 MB of mostly full-res photos; cards load full-res images.
- 👻 Unreferenced legacy files linger: `MorphWolf*` (6 variants), `Headshot.jpg`, `Headshot-t.png`, `CT_NEP_portrait…jpg`, and 26 of 28 `Reference/` photos.

---

## Phase 1 — Content update: wire new images & clean bad assets ◐

### 1.1 Wire the three new image folders into `data.json`
- [x] **Framestore Flight VP shoot** ← `./Flite/FLITE-Case-Study-Header-1980x820.jpg` (official FLITE case-study still).
- [x] **Scottish Whiskey Exhibit VR** ← `./ScottishWhiskey/ScotWhisky_01.jpg`, `_02`, `_03` (immersive projection room + visitor shots).
- [x] **Volvo AR Safety Demo** ← `./Volvo/VolvoSafety.avif` (AVIF renders fine in `<img>` in all modern browsers). The BTS **video** stays unwired until Phase 3.
- [x] Re-run the path audit after editing (all refs must resolve case-sensitively).
- **Files:** `data.json`
- **Done when:** all three projects show real imagery on their cards and in the gallery. ✅ verified in browser 2026-08-26.

### 1.2 Remove the broken BritishArrows download ☑
- [x] Deleted `BritishArrows/arrows (1).jpg` (a saved `401 Unauthorized` JSON response, not an image).
- [x] Downloaded real replacements from britisharrows.com: `BritishArrows/live-again-still.jpg` (official 1920×1080 still from the film page, via its signed CDN URL) and `BritishArrows/british-arrows-logo.svg` (the brand mark, used as the award-badge icon).
- **Files:** `BritishArrows/`

### 1.3 Resolve the Brit Awards / Chemical Brothers duplicate ☑
- [x] Deleted the "Brit Awards — Golden Arrow Winner" stub (0 images, generic description).
- [x] Enriched the entry (now titled **"The Chemical Brothers — Live Again"**): description carries the award credit — *British Arrows 2024 Craft Gold, "Innovative Use of Realtime 3D"*, credited to Outsider, Untold Studios, ARRI Stage London, Creative Technology and Lux Machina (wording verified against the live award page) — plus the [British Arrows link](https://www.britisharrows.com/films/british-arrows/2024/live-again-the-chemical-brothers), the official still leading the gallery, `"featured": true`, and a new data-driven `award` badge (see Phase 2/3 notes).
- **Files:** `data.json`, `BritishArrows/`

### 1.4 Queen Mary leftover images — ⚑ your call
- [ ] `QueenMary/QM (1).jpg`, `(2).jpg`, `(3).jpg` are unreferenced (different photos from the nine wired `.jpeg` files). Add them to the entry, or delete them.
- **Files:** `data.json` or `QueenMary/`

---

## Phase 2 — Content update: new projects & missing dates ⚑

*All career facts — needs Joseph's input. The structure is ready; each project takes `name`, `description`, `technologies[]`, `images[]`, `links[]`, `roles[]`, `startDate`, `endDate` (and optional `highlights[]` used by the CV export).*

- [x] **4 more added later on 2026-08-27** (no imagery yet — placeholder cards until photos land; rerun `node tools/generate-media.mjs` after adding any): **Believe Me (ITV True Crime)** (Oct 2025 — badge + CV line added: *Featured in British Cinematographer*, 'Creating a Believable World' production profile, linked; CV heading renamed 'Awards & Recognition'), **Final Pixel VP Academy**, **Batman / Clayface Feature Film**, **Rapture (TV Thriller)** (all Sep 2025).
- [x] **Add new projects** — 7 added 2026-08-27 from Joseph's notes, newest-first at the top of the grid: **Riyadh Air Inflight Safety Video** (Oct 2025), **7Dogs Feature Film — Riyadh** (Aug 2025, `featured` + 🏆 *2× Guinness World Records* award badge), **Alhisn BigTime Studios — Riyadh** (Jan–Apr 2025, `featured`), **Sir Kenneth Branagh Short Film** (May 2024), **Riyadh Promotional Video** (Jan 2024), **Mastercard Shoot** (Jan 2024), **ScreenSkills Final Pixel VP Training** (Nov 2023). All with imagery; 5 with web-encoded videos. Also wired the new photos into **ChemBros** (framed Golden Arrow trophy — note: file lives at `Coldplay/GoldenArrowAward.jpg` on disk — plus `chembro (7–9)`) and **Dark X Light** (`dl (2–3)`).
- [ ] **Fill the 14 missing project dates** (list in the audit above) — even a year alone helps ordering and the CV export. *(All 7 new projects have dates.)*
- [x] **`featured` flag + data-driven ordering** — done (2026-08-26). Cards render in exact `data.json` array order (verified; documented in the README), so position is controlled by moving entries. `"featured": true` gives a card an accent-glow border, a ★ Featured badge, and a double-width slot on grids ≥900px wide (single column on mobile is untouched). Also added a reusable `award: { "label", "icon" }` field → light-gold award chip over the card image. Initial featured set: ChemBros, Coldplay, SKY VP Demo, Doha VR — edit freely. ⚑ *Note: the strongest work still sits mid-array; reorder `data.json` when you're ready to curate the top of the grid.*
- **Files:** `data.json`, `app.js`, `styles.css`, `README.md`

---

## Phase 3 — Gallery video support 🎬 ☑ DONE & VERIFIED (2026-08-26)

*Motivation: `Volvo/VolvoSafetyBTS.mp4` (14.9 MB BTS film) couldn't be shown — cards and the modal only rendered `<img>`.*

- [x] **Media convention**: entries in a project's `images[]` may be plain strings — stills, or videos auto-detected by extension (`.mp4/.webm/.mov/.m4v/.ogv`) — or objects `{ "src", "type": "video", "poster" }`. One ordered list per gallery; `normalizeMedia()` in `app.js` resolves each entry. Volvo is wired with the AVIF still + the BTS video (poster = the AVIF).
- [x] **Modal**: new `<video controls playsinline preload="metadata">` element in the stage; swaps with the image per item; **pauses on navigate/close/thumb-click**; per-item poster support; `src` only reassigned when it changes (no reload flicker).
- [x] **Thumbnail strip**: video thumbs show the poster (or a dark tile) with a ▶ glyph overlay.
- [x] **Card face**: always a still — first image, else first poster, else a ▶ placeholder tile; counter is media-aware (e.g. "1 image · 1 video").
- [x] **Interaction safety**: `preloadAdjacent()` skips videos; swipe gestures ignore touches starting on the video (timeline scrubbing is horizontal too); arrow keys defer to the player's native seek while it's focused; focus trap includes the video; CV export unaffected (titles only).
- [x] **Bonus fix**: added a global `[hidden] { display: none !important; }` — the modal's single-item arrow/counter/thumbs hiding silently didn't work before because `display: flex` rules beat the UA's `[hidden]` style.
- [x] **Verified in-browser**: video plays (currentTime advances), pauses and restores the still on navigate, single-media galleries hide the chrome, mobile layout unaffected, zero console errors.
- [ ] ⚑ *(Open, your call)* The 14.9 MB MP4 now ships with the repo/Pages deploy. Fine for one clip; if more videos come, consider external hosting (YouTube/Vimeo unlisted) or compressed web encodes.
- **Files:** `app.js`, `styles.css`, `index.html`, `data.json`, `README.md`

---

## Phase 4 — Media & performance 🐘 ☑ DONE & VERIFIED (2026-08-27; nothing deleted, per your note)

**Measured result: a full scroll through the entire site now transfers ~2.1 MB (initial view ~0.4 MB), with zero full-resolution images loaded until a gallery is opened. Card faces alone went 13.0 MB → 1.6 MB (8.2×).**

- [x] **Thumbnail pipeline** — new [`tools/generate-media.mjs`](tools/generate-media.mjs) (requires ffmpeg on PATH; rerun after adding images: `node tools/generate-media.mjs`). Mirrors every project image referenced by `data.json` into `thumbs/<path>.webp` (max 960 px wide, q80 — sharp enough for 2× featured cards) + writes `thumbs/manifest.json`. 140 thumbs, 8.4 MB total. Incremental: only regenerates when the source is newer.
- [x] **Runtime wiring** — `app.js` fetches the manifest in parallel with `data.json` (both are `<link rel="preload">`-ed in `index.html` so they download during HTML parse). Card faces and the modal **thumbnail strip** use thumbs; the modal **stage** and adjacent-image preloading keep full-res originals. Missing manifest ⇒ graceful fallback to originals (zero-build behaviour preserved).
- [x] **Headshot fix** — `Headshot-t-u.png` (6.7 MB) re-rendered to `Headshot-t-u-web.webp` (**31 KB**, alpha preserved); `headshot2` repointed. Original kept on disk.
- [x] **Video web encodes** (masters kept, site uses `-web.mp4` H.264/faststart/AAC): Volvo 14.9 → **2.2 MB** (720p CRF23); Brockwell 49.6 → **5.1 MB** (720p30 CRF24 + light denoise, was 36 Mbps 60 fps); Unlimit 193 → **20.3 MB** (720p CRF25 + light denoise, was a 40 Mbps 1080p master — streams on demand only; `preload="metadata"` keeps it out of page load entirely).
- [x] **⚠ `Unlimit/UnlimitVis.mp4` (193 MB) added to `.gitignore`** — it exceeds GitHub's hard 100 MB push limit; committing it would make `git push` fail. The file itself is untouched on disk.
- [x] **Dedicated OG share image** — `og-image.jpg` (1200×630, 43 KB) composed with ffmpeg in the site palette (dark bg, gold name, headshot, joeloe.co.uk); wired via the existing `ogImage` field in `data.json`.
- [x] **Verified in-browser** (fresh cache): 29/29 card faces load thumbs, galleries stream thumbs in the strip + originals on stage, both new videos play, badges/featured intact, no console errors.
- [ ] ⚑ **Deletions still deferred (DO NOT DELETE, per your note).** Now-unreferenced files to revisit *when you're ready*: `Headshot-t-u.png` (6.7 MB), the `BrockwellLive/Brockwell.mp4` (49.6 MB) & `Volvo/VolvoSafetyBTS.mp4` (14.9 MB) masters (⚠ untracked — a `git add -A` today would commit ~65 MB of unused masters; consider gitignoring them too), plus the legacy `MorphWolf*` ×6, `Headshot.jpg`, `Headshot-t.png`, `CT_NEP_portrait…`, unused `Reference/` photos, `QueenMary/QM (1–3).jpg`.
- [ ] *(Considered, rejected)* `content-visibility: auto` on sections — the render-skip win is marginal for this DOM size and it would make the side-nav's `offsetTop` scroll targets unreliable. Media weight was the actual bottleneck.
- **Files:** `tools/generate-media.mjs`, `thumbs/`, `app.js`, `index.html`, `data.json`, `og-image.jpg`, `.gitignore`, `*-web.mp4`, `Headshot-t-u-web.webp`

---

## Phase 4.5 — Software Projects section ☑ DONE & VERIFIED (2026-08-27)

- [x] New `softwareProjects` array in `data.json` — **all 21 original repos** from [github.com/ItzMorphineTime](https://github.com/ItzMorphineTime), ordered strongest-first (stars/relevance blend), with descriptions distilled from each repo's README, language/tech tags, a static `stars` snapshot, and GitHub + Live-Demo links (Pages URLs verified live with HTTP 200 checks). Reorder/prune entries freely — display follows array order.
- [x] New `renderSoftwareProjects()` section (`#software`, "Open Source / Software Projects", after Featured Projects): compact repo cards — name + gold ★ badge, description, `tech-tag` pills, links labelled **GitHub** / **Live Demo**. Role-filterable like every other section; matrix-mode parity (badges/pills go green).
- [x] **Live star refresh** — optional top-level `githubUser` field; on load the site fetches the user's repos from the GitHub API once and updates the ★ badges in place. Fails silently (offline/rate-limit) leaving the static counts.
- [x] Optional `images` on a software project reuses the full media-gallery convention (`openModal` generalised to multiple collections).
- [x] New side-nav "Software" button (`</>` icon) + nav buttons now auto-hide when their section isn't rendered (template stays reusable with sparse data).
- [x] Verified in-browser: 21 cards render, grid layout, filter (AI Consultant → the two skybox repos), matrix parity, live-star fetch, zero console errors. Documented in README.
- [ ] ⚑ *(Optional follow-ups, your call)* Prune weaker/personal repos (SaraCV, BabyQuiz, Sussex Exterior Clean, Renamer) or reorder; add screenshots to the strong repos via `images`; include software projects in the CV export's projects list (`cv.js` currently lists only `projects`).
- **Files:** `data.json`, `app.js`, `index.html`, `styles.css`, `README.md`

---

## Phase 4.6 — Real video posters + no-cache dev server ☑ DONE & VERIFIED (2026-08-27)

*Problem: video thumbnails/posters reused the project's lead photo, so what you clicked bore no relation to what played.*

- [x] [`tools/generate-media.mjs`](tools/generate-media.mjs) now **extracts a representative frame from every gallery video** (`-ss 1.5` + ffmpeg's `thumbnail` filter over ~90 frames, 1280 px wide) to `<video basename>-poster.jpg`, thumbs it for the strip, and records it in the manifest (new shape: `{ "thumbs": {...}, "posters": {...} }`). Incremental like the thumbs.
- [x] `app.js` resolves a video's poster as: explicit `poster` in `data.json` → extracted frame from the manifest → none. The 8 video entries in `data.json` collapsed to plain strings (the object form remains for manual poster overrides).
- [x] All 8 videos verified: distinct, representative strip thumbnails (e.g. Alhisn's moto-test vs safari-frustum test), matching stage posters, playback intact, no broken images.
- [x] **New [`tools/serve.py`](tools/serve.py)** — threaded local dev server sending `Cache-Control: no-cache` (plain `python -m http.server` sends no caching headers, so browsers heuristically serve stale files for hours — the recurring "my changes don't show" problem). `.claude/launch.json` gained a "portfolio-fresh" config on port 8010.
- **Files:** `tools/generate-media.mjs`, `tools/serve.py`, `app.js`, `data.json`, `thumbs/manifest.json`, 8 × `*-poster.jpg`, `README.md`

---

## Phase 4.7 — Mobile navigation UX ☑ DONE & VERIFIED (2026-08-28)

*Problem: the left-anchored vertical nav overlapped page content on narrow screens.*

- [x] On **≤768px** the nav becomes a **bottom-centred horizontal pill** (the standard mobile pattern): `bottom: 0.75rem + env(safe-area-inset-bottom)` for iPhone home-indicator clearance, max-width capped, internally scrollable if ever cramped (scrollbar hidden).
- [x] The collapse **toggle is hidden on mobile** and any desktop-collapsed state is neutralised in CSS, so the bar can never arrive empty after a resize/rotation. Desktop keeps the left bar + working collapse untouched (verified).
- [x] **Tooltips disabled on mobile** (touch has no hover) — also makes the horizontal overflow safe.
- [x] `main` gets `72px + safe-area` bottom padding — measured 78 px clearance between the bar and the last contact card at full scroll.
- [x] **≤400px**: buttons shrink to 36 px so all eight fit without scrolling.
- [x] Verified at 375×812: row orientation, centred, 8 buttons, correct scroll targets on tap, desktop restore clean. (Note: in-pane smooth-scroll animation can't run while the Browser pane is hidden — compositor-driven; verified with instant scrolls + target math.)
- **Files:** `styles.css` only

---

## Phase 5 — Data quality: role tagging & wording ⚑

*Carried over from old Phase 4.6 — career data, needs Joseph.*

- [ ] Tag projects selectively — most share the identical 3-role set, so filters barely narrow the grid.
- [ ] Fix questionable tags (Service Desk Analyst & GreedyGull carry `VP Supervisor`/`Technical Artist`).
- [ ] Wording accuracy from the research pass: "Scottish Whiskey Exhibit VR" → the venue is **The Scotch Whisky Experience** ("whisky", no *e*) and the public piece is an immersive projection (the VR was previs — title/description could say so); confirm the Polestar shoot was Framestore's (public demos credit NantStudios). 
- [ ] The two **ARRI & Friends** entries are confirmed distinct events (Dec 2021 / Aug 2023) — differentiate their titles, e.g. suffix the year, so they don't read as an accidental duplicate.
- **Files:** `data.json`

---

## Phase 7 — CV export review (2026-08-27) ☑ FIXES IMPLEMENTED & VERIFIED (same day)

> **Implemented 2026-08-27:** all 🔴 and 🟠 items below plus designed-variant hyperlinks — verified by regenerating both variants through the real `cv.js` (38/38 automated checks pass: A4 in both, AWARDS section with both awards, projects capped at 12 with all 6 featured surviving in data order, OPEN SOURCE top-5 by stars, ATS still zero-tables with ASCII separators + full URLs, designed has clickable email/LinkedIn/GitHub/website/repo links, education description in both, dead code removed). In-browser generation re-checked (lazy-load path, correct MIME). Remaining ⚑ items (highlights authoring, phone, skill grouping) are yours.

*Reviewed `cv.js` by generating both variants against today's data (real code path, Node harness) and inspecting the OOXML. The Phase-6 mechanics all still hold: valid zips, ATS variant is genuinely table-free (0 tables), standard headings, designed variant's 8 borderless date-tables render with fully abbreviated dates, "2:1" and special characters survive, filenames/metadata correct. The problems are content drift — the data has doubled since the exporter was built.*

### 🔴 Content drift — high value
- [x] **Awards never reach the CV.** `award` fields exist (7Dogs: *2× Guinness World Records*; ChemBros: *British Arrows Craft Gold 2024*) but neither variant exports them — the strongest differentiators on the whole site are absent from the résumé. Add an **Awards** section (or ⭐ annotations on the matching project lines) built from `projects[].award`.
- [x] **"Selected Projects" isn't selected — it's all 44.** The list now runs 44 rows (~a full page), ~20 of them undated (blank date cells look unfinished). Filter to `featured: true` (6 today) plus dated recents, or introduce a `cvInclude`/cap (~12). Shortens both docs from ~3 pages toward the ideal 2.
- [x] **Software projects absent.** For SE applications the GitHub portfolio matters — add a compact **Open Source** section from `softwareProjects` (top ~5 by stars: name, one-liner, URL; Skybox Gallery ★15 first).

### 🟠 Robustness / consistency
- [x] **Page size is US Letter in both variants** (designed hardcodes it; ATS inherits the library default) — for a UK CV both should be **A4** (11906×16838 twips; recompute `CONTENT_W` in the designed variant).
- [x] **ATS uses decorative em-dashes** (`Title  —  Company`, 40×) — conservative ATS parsers prefer ASCII; switch separators to `-` or `|` (content em-dashes in real names like "7Dogs Feature Film — Riyadh" can stay).
- [x] **`cleanUrl` strips `https://`** — bare domains are fine to read but full URLs machine-parse better in ATS; keep full URLs there (display-clean in designed).
- [x] **Designed variant drops `education.description`** while ATS includes it — align (include in both).
- [x] Dead code: `buildCvModel().skillDetails` is computed and never used by either renderer; `buildCvModel` also runs twice per download (harmless, but trivial to fix).

### 🟡 Nice-to-have
- [x] Clickable `ExternalHyperlink`s (email/LinkedIn/GitHub) in the designed variant.
- [x] ⚑ **`highlights[]` — Fivefold entry done** (2026-08-30): 5 fact-based bullets (Pixel Brute pioneering, Alhisn build, 7Dogs records, WB/ITV volume builds, VP Academy) replace the prose paragraph on all four CV exports. **Remaining jobs (CT ×2, VIP, ASL, Ideal, GreedyGull) still export prose blobs — those bullets need Joseph's words.**
- [ ] ⚑ `contact.phone` still unset (renders on CV only, never the site).
- [ ] Group the 24-skill comma list by role headings (e.g. Engineering / AI / VP) for scannability.
- **Files:** `cv.js` (+ optionally `data.json` for highlights/phone)

---

## Phase 6 — Backlog / future 🟢

- [ ] **Client logos in the clients band** — the renderer already accepts `{ "name", "logo" }` entries; gather brand marks (monochrome/white SVG or PNG suited to the dark background — press-kit assets from each brand), drop them into a `./logos/` folder, and convert the string entries in `data.json.clients`. Rerun nothing — logos render at 26 px tall with lazy loading.

- [ ] Light/dark theme toggle (design is dark-only).
- [ ] Privacy-friendly analytics (e.g. Plausible).
- [ ] JSON Schema for `data.json` (autocomplete + validation; would catch path/role mistakes mechanically).
- [ ] CI guardrail: fail the build when a `data.json` path doesn't match `git ls-files` case-sensitively.
- [ ] Skill-bar track colour `--skill-bar-bg: #8B2035` reads as an unfinished bar — consider a neutral track.
- [ ] Extract the duplicated inline SVG icon markup (hero + contact) into one icon map.
- [ ] Section-config abstraction across the seven `render*()` functions.
- [ ] Baked-in social meta (build step or prerender) — JS-injected OG tags are invisible to non-rendering scrapers (LinkedIn/Slack link previews).
- [ ] README note that `file://` won't work (local server required), or an inline-data fallback.
- [ ] Education images (phantom refs, never rendered) — **excluded from scope by request**; revisit only if wanted.

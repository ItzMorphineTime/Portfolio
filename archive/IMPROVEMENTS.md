> **📦 ARCHIVED 2026-08-26.** This review is complete — nearly every item was actioned (see [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) in this folder for what was done). Superseded by the living plan at [../IMPROVEMENTS_PLAN.md](../IMPROVEMENTS_PLAN.md).

# Portfolio — Improvement Suggestions

A review of the dynamic, JSON-driven portfolio site (`index.html` + `data.json`, deployed via GitHub Pages to `joeloe.co.uk`). The architecture is clean and the "edit one JSON file" concept works well. The notes below are grouped by priority. Each item references the relevant file/line where possible.

> Scope note: the `Plan/` folder is a separate, unrelated site and is intentionally excluded from this review.

---

## Legend

| Priority | Meaning |
|----------|---------|
| 🔴 Critical | Broken on the live site or actively misleading |
| 🟠 High | Notable correctness, security, performance, or a11y gaps |
| 🟡 Medium | Maintainability, UX polish, data quality |
| 🟢 Low | Nice-to-haves / future enhancements |

---

## 🔴 Critical — broken or misleading right now

### 1. Broken images on the live site (case-sensitive paths)
GitHub Pages serves from Linux, which is **case-sensitive**. Your Windows machine is case-insensitive, so these work locally but **404 in production**:

- `data.json` references `./EpicDirectors/epic (1).jpg` and `./EpicDirectors/epic (2).jpg` (lowercase `epic`), but the actual files are `EpicDirectors/Epic (1).jpg` / `Epic (2).jpg` (capital `E`). → The Epic Game Directors Week project shows a broken-image placeholder live.

**Fix:** rename the references (or files) to match exactly. Then audit *all* image paths for case once — it's the kind of bug that silently recurs. A tiny CI check (compare `data.json` paths against `git ls-files`) would catch it permanently.

### 2. Education `images` are referenced but never exist *and* never render
`data.json` education entries point to `./Reference/Poster43.png`, `./BtonUni_02.png`, and `./Northbrook_01.png`. **None of these files exist in the repo**, and `renderEducation()` ([index.html:1943](index.html:1943)) never outputs an `images` block anyway — so the data is doubly dead. Either:
- add an image/gallery render to the education card (and add the files), or
- remove the `images` arrays from the education entries to avoid implying functionality that isn't there.

### 3. README documents a project structure that doesn't exist
The README's "Project Structure" shows an `assets/` folder (`assets/headshot.png`, `assets/company-logos/`, `assets/projects/`) and every example path uses `./assets/...`. **There is no `assets/` folder** — real assets live in the repo root and per-project folders (`./Headshot-t-u.png`, `./ChemBros/...`, etc.). Anyone following the README (including future-you) will wire up paths that 404. See the [README section](#-readme-accuracy-you-asked-me-to-check-this) below for the full list of doc/impl mismatches.

---

## 🟠 High

### 4. README accuracy (you asked me to check this)
The README reads as a generic, reusable template rather than documentation of *this* deployment. Concrete mismatches:

| README says | Reality | Suggested fix |
|-------------|---------|---------------|
| `assets/` folder structure with `headshot.png`, `company-logos/`, `projects/` | No `assets/` dir; files in root + named folders | Update the structure diagram to match, or actually move assets into `assets/` |
| Example paths like `./assets/headshot.png` | Actual: `./Headshot-t-u.png` (root) | Align examples with real conventions |
| "JSON-Driven Content — update your portfolio by editing a single JSON file" | The hero headline `Building Digital Experiences`, the `<h1>`, and the contact subtitle are **hardcoded** in `index.html` ([index.html:1838](index.html:1838), [index.html:2136](index.html:2136)); your **name appears nowhere** | Move these strings into `data.json` (e.g. `name`, `tagline`, `heroHeading`) so the claim holds true |
| `git clone .../yourusername/portfolio.git`, live at `yourusername.github.io/portfolio/` | Deployed to a custom domain (`joeloe.co.uk` via `CNAME`) | Document the custom-domain setup; drop the placeholder URLs |
| Tips list favicon / SEO / analytics as optional extras | All three are currently **absent** (generic `<title>`, no favicon → 404, no analytics) | See SEO section — these are worth doing, not just mentioning |
| Education example omits `images` | `data.json` education entries *have* `images` | Keep docs and data consistent once #2 is resolved |

The README also doesn't mention the `headshotalt2` field (correctly — it's unused; see #6).

### 5. XSS / HTML-injection surface via `innerHTML`
Every render function builds markup with template literals and assigns via `innerHTML`, interpolating `data.json` values **without escaping** (e.g. [index.html:1877](index.html:1877), [index.html:1918](index.html:1918), [index.html:1993](index.html:1993)). Today the data is self-authored so risk is low, but it's fragile:

- A value containing `<`, `>`, or `"` would break layout or inject markup.
- **Real, latent bug:** role names are injected into both an attribute *and* an inline handler: `onclick="filterByRole('${role}')"` and `data-roles='${JSON.stringify(...)}'` ([index.html:1615](index.html:1615), [index.html:1878](index.html:1878)). A role or value containing an apostrophe would break the handler/attribute outright.

**Fix:** escape interpolated strings (a small `esc()` helper), prefer `textContent` for plain text, and replace inline `onclick` with event delegation (`data-role` + a single click listener). This also removes the apostrophe footgun.

### 6. Dead code & dead data
- `matchesRole()` ([index.html:1759](index.html:1759)) is defined but **never called**. Remove it.
- `headshotalt2` in `data.json` ([data.json:4](data.json:4)) is never read (`renderHero` only uses `headshot` + `headshotalt`). Remove it.
- Orphaned role: the `Unreal Engine` skill lists `"nDisplay Operator"` ([data.json:110](data.json:110)), but that role is **not** in the top-level `roles` array, so there's no filter button for it — the tag renders but can never be filtered on. Either add it to `roles` or drop it.

### 7. Performance — repo weight and image delivery
The repo is **~213 MB**, dominated by full-resolution images, and the page loads them at full size into cards that display them at ~200 px tall.

- **No `loading="lazy"`** on any `<img>` — every first-image-per-project downloads on load.
- **No responsive images / thumbnails** — a 2–4 MB JPEG is fetched to fill a small card. Generate thumbnails (or use `srcset`/`sizes`) and reserve full-res for the modal.
- **No `width`/`height` (or `aspect-ratio`)** on images → cumulative layout shift as they load.
- **Unused image folders bloat the repo** and the GitHub Pages deploy: `Spies/`, `QueenMary/`, `Workday/`, `EvanHansen/`, `Amazon/`, plus several stray headshot variants (`MorphWolf*.jpg/png`, `Headshot.jpg`, `Headshot-t.png`) are not referenced by `data.json`. Either wire them into projects or remove them.

Even modest image optimization here would cut page weight by an order of magnitude.

### 8. Matrix animation is heavier than it needs to be
`startMatrixAnimation()` ([index.html:1668](index.html:1668)) runs a `setInterval(draw, 33)` with a nested per-column trail loop (columns × 20 chars) that runs continuously while "Software Engineer" is selected.

- Use `requestAnimationFrame` instead of `setInterval` (smoother, auto-throttles in background tabs).
- **Honor `prefers-reduced-motion`** — skip/disable the effect for users who request reduced motion (currently nothing on the site respects it).
- Pause when the tab is hidden (`visibilitychange`) to save battery.

---

## 🟡 Medium

### 9. Accessibility
- **Footer nav buttons have no accessible name** — they contain only an SVG ([index.html:1468](index.html:1468)+). Screen readers announce "button". Add `aria-label` (you already have `data-tooltip` text to reuse).
- **Image modal isn't accessible**: no `role="dialog"`/`aria-modal`, no focus trap, and focus isn't returned to the triggering card on close ([index.html:2147](index.html:2147)). Add focus management and label the dialog.
- **Skill bars** convey value visually only — add `role="progressbar"` with `aria-valuenow/min/max` (the numeric % is shown as text, which helps, but the bar itself is decorative to AT).
- **Reduced motion**: the section fade-in animations ([index.html:237](index.html:237)) and transitions should be gated behind `@media (prefers-reduced-motion: no-preference)`.
- **Contrast**: `--text-muted: #6b6b7b` on the dark background is below WCAG AA for small text — nudge it lighter.

### 10. Empty sections when filtering
Filtering toggles a `.hidden` class on cards, but **section headers and empty grids remain** when a filter matches nothing. Example: selecting **AI Consultant** shows skills but leaves empty "Work Experience", "Education", and "Featured Projects" sections (no experience/projects/education are tagged `AI Consultant`). 

**Fix:** after filtering, hide any section whose visible children count is 0, or show a per-section empty state. (Also worth deciding intentionally: **Interests** has no `filterable` class, so it always shows regardless of role — inconsistent with the other sections.)

### 11. Data quality in `data.json`
- **Filtering is largely a no-op for projects**: every project is tagged with the identical `["Software Engineer", "Technical Artist", "VP Supervisor"]`, so the role filter never meaningfully narrows the project list. Consider tagging projects more selectively.
- **Questionable role tags**: the *Service Desk Analyst* role at Ideal Networks ([data.json:284](data.json:284)) and *GreedyGull* are tagged `VP Supervisor`/`Technical Artist`, which doesn't match the role. Tighten these so filters tell an accurate story.
- **Duplicate project**: "ARRI & Friends" appears twice ([data.json:370](data.json:370) and [data.json:708](data.json:708)) — one without images, one with. Merge them.
- **Typos** (these are user-visible): `Septmeber` ([data.json:949](data.json:949)), `ghsotframe` & `simultanous` ([data.json:460](data.json:460)), `nDispay` ([data.json:105](data.json:105)), `Virutal` ([data.json:646](data.json:646)), `optimsing` ([data.json:524](data.json:524)), `Scotish` ([data.json:691](data.json:691)).

### 12. SEO & metadata
For a portfolio meant to be found, several basics are missing:
- **Generic `<title>` ("Professional Portfolio") and description, with no name.** Put "Joseph Loe — …" front and center (in the `<title>`, the hero `<h1>`, and the meta description).
- **No Open Graph / Twitter Card tags** → link previews (LinkedIn, messaging, etc.) render blank. Add `og:title`, `og:description`, `og:image`, `og:url`, and `twitter:card`.
- **No favicon** → a guaranteed 404 on every visit (and the README even lists adding one as a "tip").
- **No structured data** — a JSON-LD `Person` block would help search engines and is trivial given the data already exists.
- Consider `robots.txt`, a `sitemap.xml`, and a `404.html` (GitHub Pages serves it automatically).

### 13. Maintainability / architecture
- **One 2,188-line `index.html`** holds all CSS and JS. Splitting into `styles.css` and `app.js` (still zero build tooling, still works on Pages) would make it far easier to navigate and diff.
- **Duplicated SVG icon markup**: the email/LinkedIn/GitHub/website icons are hand-inlined in both `renderHero()` and `renderContact()` ([index.html:1787](index.html:1787)+, [index.html:2069](index.html:2069)+). Extract an icon map/helper to define each once.
- **Hardcoded copy** (hero heading, contact subtitle) should move into `data.json` to match the "fully JSON-driven" promise (ties into #4).
- The seven `render*()` functions share an almost identical shape — a small section-config/template abstraction would reduce repetition and make adding sections (as the README describes) genuinely one step.

---

## 🟢 Feature additions

### 14. "Download ATS-Friendly CV" button (generate a `.docx`)
Add a button (in the hero contact row, and optionally sticky) that **generates and downloads a polished `.docx` CV from the same `data.json`** — so the CV is a single source of truth and never drifts from the site.

Design principles:
- **ATS-friendly means *parseable***: single-column layout, real selectable text (no images, text boxes, or multi-column tables — these are exactly what applicant-tracking parsers mangle), standard section headings (`Summary`, `Experience`, `Education`, `Skills`), standard fonts (Calibri/Arial), and no critical text in headers/footers. Output as `.docx`.
- **Sleek *and* safe**: get the visual polish from spacing, font weight, a subtle accent color on the name/headings, and horizontal rules — not from layout tricks that defeat parsing.
- **Implementation fit (static / zero-build site)**: generate it **client-side** with the [`docx`](https://docx.js.org/) browser library (via CDN or vendored locally) and trigger a Blob download. No backend required; this keeps the "no build tools" deployment model (one runtime dependency).
- **Role-aware (nice touch)**: honor the active role filter so the CV is tailored to what the visitor is viewing (e.g. a *Software Engineer*-only CV vs the full one).
- **Data additions needed**: the CV wants a few fields the site doesn't surface yet — `name`, `title`/headline, `location`, and optional `phone`. Adding these dovetails with JSON-driving the currently-hardcoded hero copy (#4 / #13).
- The repo already has document-generation tooling available (a `docx` skill), which can scaffold the generator and a sleek template.



- **`file://` won't work**: `fetch('./data.json')` fails when opening `index.html` directly from disk (CORS). The README's "open in browser" implies it might — note that a local server is required, or inline the data as a fallback.
- **Modal niceties**: preload adjacent images, show a spinner for large images, and support swipe gestures on touch devices.
- **Theme toggle**: a light/dark switch (the design is dark-only today).
- **Analytics** (privacy-friendly, e.g. Plausible) if you want visitor insight.
- **JSON schema** for `data.json` — editor autocomplete + validation, and a guardrail against the kind of path/role mistakes noted above.
- **Skill-bar background** `--skill-bar-bg: #8B2035` (dark red) behind the gold fill reads as an unfinished bar to some users — consider a neutral track color.

---

## Suggested order of attack

1. **Fix the live breakage** — #1 (case-sensitive image paths) and #2 (phantom education images).
2. **Correct the README** — #3/#4, so the docs match reality (you flagged this directly).
3. **Quick wins** — #6 (dead code/data), #11 typos, #12 favicon + `<title>`/name + OG tags.
4. **Hardening & polish** — #5 (escaping/delegation), #7 (image optimization), #9 (a11y), #10 (empty sections).
5. **Refactor when ready** — #13 (split files, dedupe icons, JSON-drive the copy).
6. **New feature** — #14 (ATS-friendly CV download). Independent of the fixes above and can be built in parallel; benefits from the `name`/`title`/`location` fields added in #4/#13.

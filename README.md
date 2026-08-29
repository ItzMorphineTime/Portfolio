# 🎨 Professional Portfolio

A sleek, modern portfolio website built with vanilla HTML, CSS, and JavaScript. Features dynamic JSON-based content management, role-based filtering, animated Matrix background effects, and a fully responsive design.

![Portfolio Preview](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-orange)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎭 **Role-Based Filtering** | Filter portfolio content by professional role (Software Engineer, Technical Artist, etc.) |
| 🟢 **Matrix Mode** | Animated Matrix-style background activates when "Software Engineer" role is selected |
| 📊 **Animated Skill Bars** | Visual proficiency indicators with smooth animations |
| 🖼️ **Media Gallery** | Full-viewport viewer with thumbnails, keyboard/swipe navigation — plays project **videos** as well as stills |
| ⭐ **Featured Projects & Awards** | `featured` flag highlights a card (accent glow + wide slot); `award` renders a gold award chip |
| 💻 **Software Projects** | Optional GitHub repo section — compact cards with live-refreshing star badges (`githubUser`) |
| 📦 **Grid folding** | Projects/repos show 9/6 cards with a "Show all" pill (suspended while a role filter is active); counts set by `VISIBLE_PROJECTS`/`VISIBLE_REPOS` in `app.js` |
| 🧭 **Radial skills** | Skills render as compact radial-progress tiles (ring wraps the label) grouped by an optional `category` field; clicking a tile opens a detail modal with the description and role tags |
| 📈 **Analytics** | GoatCounter (cookieless, no consent banner) — page views + events: CV downloads, gallery opens, role filters, repo clicks. Tag in `index.html`; update the `data-goatcounter` URL for your own account |
| 📍 **Smart Navigation** | Floating bottom nav bar with scroll-aware section highlighting |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop viewports |
| 🎨 **Dynamic Theming** | Gold accent theme with Matrix green variant |
| ⚡ **No Build Step** | Pure HTML/CSS/JS; the CV export lazy-loads a vendored `docx` library only when used |
| 📝 **JSON-Driven Content** | Everything — page, `<head>` SEO, and CVs — is generated from a single JSON file |
| 📄 **CV Export** | One-click **ATS-friendly** or **designed** `.docx` résumé, generated from your JSON |

---

## 📁 Project Structure

```
Portfolio/
├── index.html              # Page shell (HTML only; all meta/SEO is injected by app.js)
├── styles.css              # All styles (theme variables, layout, responsive)
├── app.js                  # App logic — fetches data.json, renders the DOM + <head> meta
├── cv.js                   # CV export — builds ATS + designed .docx résumés from data.json
├── vendor/docx.iife.js     # Vendored docx library (lazy-loaded only when a CV is exported)
├── data.json               # Portfolio content (edit this!)
├── tools/generate-media.mjs   # Thumbnail generator (run after adding images; needs ffmpeg)
├── thumbs/                 # Generated WebP card/strip thumbnails + manifest.json (committed)
├── og-image.jpg            # 1200×630 social share card (referenced by data.json "ogImage")
├── README.md               # Documentation
├── PROJECT_IMAGE_RESEARCH.md  # Research notes + candidate image sources for image-less projects
├── CNAME                   # Custom domain for GitHub Pages (joeloe.co.uk)
├── Headshot-t-u.png        # Headshot — referenced by data.json (lives at repo root)
├── Morphtransparent.GIF    # Alternate headshot (shown in "Software Engineer" / Matrix mode)
├── CT-Logo.svg             # Company logos also live at the repo root
├── FiveFold.png
├── ...
└── <ProjectName>/          # One folder per project, holding that project's images
    ├── ChemBros/
    ├── Coldplay/
    ├── SkyVP/
    └── ...
```

> **There is no `assets/` folder.** Images are referenced from `data.json` by relative path — headshots and logos sit at the repo root (e.g. `./Headshot-t-u.png`, `./CT-Logo.svg`) and project screenshots live in per-project folders (e.g. `./ChemBros/chembro (1).jpg`). Paths are **case-sensitive** on GitHub Pages (Linux), so match the on-disk capitalisation exactly.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ItzMorphineTime/Portfolio.git
cd Portfolio
```

### 2. Customize Your Content

Edit `data.json` with your information (see [Content Configuration](#-content-configuration) below).

### 3. Add Your Images

Place your images in the project directory and reference them in `data.json`:
- Headshot photos
- Company logos
- Project screenshots

Then regenerate the card thumbnails (requires [ffmpeg](https://ffmpeg.org/) on PATH):

```bash
node tools/generate-media.mjs
```

This writes a ~960px WebP per project image into `thumbs/` plus `thumbs/manifest.json`. The site
uses these small files for **project cards and the gallery's thumbnail strip**, and only loads the
full-resolution originals on the gallery stage. It's incremental (only new/changed images are
re-encoded), and if the manifest is missing the site silently falls back to the originals — so
skipping this step never breaks anything, it's just slower for visitors.

The same run also **extracts a poster frame from every gallery video** (to
`<video basename>-poster.jpg`, recorded in the manifest) so video thumbnails and posters show the
actual video content. Setting an explicit `"poster"` on a video entry in `data.json` overrides the
extracted frame.

> **Videos:** keep gallery videos small — re-encode masters to a web-friendly H.264 (e.g.
> `ffmpeg -i master.mp4 -c:v libx264 -crf 24 -preset medium -vf scale=1280:-2 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k clip-web.mp4`)
> and reference the `-web` file from `data.json`. GitHub rejects files over 100 MB outright.

> **Tracking down imagery?** Some projects ship without images (`"images": []`).
> [`PROJECT_IMAGE_RESEARCH.md`](PROJECT_IMAGE_RESEARCH.md) catalogues each image-less project with
> inferred context and **candidate online sources** to review/download manually — plus licensing
> caveats and a few data-accuracy corrections (e.g. the British Arrows "Live Again" duplicate).

### 4. Test Locally

```bash
# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` in your browser.

### 5. Deploy to GitHub Pages

1. Push your changes to GitHub
2. Go to **Settings** → **Pages**
3. Select **Source**: `Deploy from a branch`
4. Select **Branch**: `main` (or `master`) and `/ (root)`
5. Click **Save**

Your portfolio will be live at `https://<your-username>.github.io/Portfolio/`.

> **Custom domain:** this repo includes a `CNAME` file pointing GitHub Pages at **[joeloe.co.uk](https://joeloe.co.uk)**. If you fork it, update or delete `CNAME` (and configure your own domain under **Settings → Pages → Custom domain**), or the deploy will try to serve from a domain you don't control.

---

## 📝 Content Configuration

All portfolio content is managed through `data.json`. Here's the complete structure:

### Basic Information

> Everything in the page `<head>` — title, description, canonical, Open Graph / Twitter Card tags, the JSON-LD `Person` block, and the favicon — is **generated at runtime by `app.js` from these fields**, so the template carries no baked-in identity and works as-is with anyone's `data.json`.

```json
{
  "name": "Joseph Loe",
  "headline": "Software Engineer, Technical Artist & Virtual Production",
  "siteUrl": "https://joeloe.co.uk/",
  "jobTitle": "Head of Technology",
  "organization": { "name": "Fivefold Studios", "url": "https://www.fivefoldstudios.co.uk/" },
  "matrixRole": "Software Engineer",
  "heroHeading": "Building {Digital} Experiences",
  "contactTitle": "Let's Connect",
  "contactSubtitle": "I'm always open to discussing new projects...",
  "bio": "Your professional summary...",
  "headshot": "./Headshot-t-u.png",
  "headshotalt": "./Morphtransparent.GIF",
  "roles": ["All", "Software Engineer", "Technical Artist", "AI Consultant", "VP Supervisor"]
}
```

| Field | Description |
|-------|-------------|
| `name` | Your name — header logo, page title, author, and JSON-LD/SEO |
| `headline` | Short professional headline — appended to the page/OG title (`Name — Headline`) |
| `siteUrl` | Canonical URL — used for canonical/OG/Twitter/JSON-LD and to absolutise the OG image |
| `jobTitle` | Current job title — JSON-LD `Person.jobTitle` |
| `organization` | `{ "name", "url" }` of your employer — JSON-LD `worksFor` |
| `matrixRole` | Role that triggers Matrix mode + the alternate headshot (default: `"Software Engineer"`) |
| `location` | Location line shown on the exported CV (optional) |
| `cvAccent` | Accent colour for the **designed** CV variant (default: site gold `#d4a853`) |
| `contact.phone` | Phone number shown on the CV only (optional; not rendered on the site) |
| `highlights` | Optional `string[]` on any experience/project item → rendered as CV bullet points (falls back to `description`) |
| `heroHeading` | Hero headline; wrap a word in `{ }` to render it in the gold accent (e.g. `Building {Digital} Experiences`) |
| `contactTitle` | Heading for the contact section (defaults to "Let's Connect") |
| `contactSubtitle` | Sub-text for the contact section |
| `bio` | Your professional summary displayed in the hero section |
| `headshot` | Primary profile photo (displayed by default) |
| `headshotalt` | Alternate photo shown when "Software Engineer" is selected (supports GIFs!) |
| `roles` | Array of role filters — "All" should always be first |

### Contact Information

```json
{
  "contact": {
    "email": "your.email@example.com",
    "linkedin": "https://linkedin.com/in/yourprofile",
    "github": "https://github.com/yourusername",
    "website": "https://yourwebsite.com"
  }
}
```

All fields are optional. Only provided fields will be displayed.

### Skills

```json
{
  "skills": [
    {
      "name": "JavaScript",
      "description": "Full-stack development with modern ES6+ features",
      "proficiency": 90,
      "roles": ["Software Engineer"]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Skill name |
| `description` | string | Brief description |
| `proficiency` | number | 0-100, displayed as animated progress bar |
| `roles` | array | Which role filters show this skill |

### Work Experience

```json
{
  "experience": [
    {
      "company": "Company Name",
      "logo": "./CT-Logo.svg",
      "title": "Senior Developer",
      "duration": "Jan 2020 - Present",
      "description": "Led development of...",
      "links": ["https://company.com"],
      "roles": ["Software Engineer"]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `company` | string | Company name |
| `logo` | string | Path to company logo |
| `title` | string | Your job title |
| `duration` | string | Employment period |
| `description` | string | Role description |
| `links` | array | Company/project URLs (displays as domain name) |
| `roles` | array | Role filters |

### Education

```json
{
  "education": [
    {
      "institution": "University Name",
      "course": "BSc Computer Science",
      "grade": "First Class Honours",
      "description": "Specialized in...",
      "modules": [
        { "name": "Machine Learning", "grade": "A+" },
        { "name": "Algorithms", "grade": "A" }
      ],
      "roles": ["Software Engineer"]
    }
  ]
}
```

### Projects

```json
{
  "projects": [
    {
      "name": "Project Name",
      "featured": true,
      "award": {
        "label": "Some Award 2024",
        "icon": "./MyProject/award-logo.svg"
      },
      "description": "Built a full-stack application...",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "images": [
        "./MyProject/screenshot-1.jpg",
        "./MyProject/screenshot-2.jpg",
        "./MyProject/bts-clip.mp4",
        { "src": "./MyProject/demo.mp4", "type": "video", "poster": "./MyProject/screenshot-1.jpg" }
      ],
      "links": ["https://project-demo.com", "https://github.com/user/project"],
      "roles": ["Software Engineer"],
      "startDate": "March 2023",
      "endDate": "June 2023"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Project title |
| `featured` | boolean | Optional — accent glow, ★ Featured badge, and a **full-width row** on desktop (the grid is 2-column ≥980px). Keep featured entries at the top of the array so they render as a clean full-width block |
| `award` | object | Optional — `{ "label", "icon" }` renders a light-gold award chip over the card image (icon is optional; falls back to 🏆) |
| `description` | string | Project summary |
| `technologies` | array | Tech stack tags |
| `images` | array | Gallery media, shown in order. Plain strings are stills — or **videos**, auto-detected by extension (`.mp4`, `.webm`, `.mov`, `.m4v`, `.ogv`). Use the object form `{ "src", "type": "video", "poster" }` to give a video a poster frame. Videos play in the gallery with native controls; the card face uses the first still (or the first poster) |
| `links` | array | Live demo, GitHub, etc. (displays as domain) |
| `startDate` / `endDate` | string | Project timeline |
| `roles` | array | Role filters |

> **Ordering:** projects render in exactly the order they appear in `data.json` — move an entry up or down in the array to reposition its card. `featured` changes emphasis, not position.

### Software Projects (GitHub repos)

An optional second portfolio section of compact repo cards — name, star badge, description, tech tags, and links (github.com renders as "GitHub", `*.github.io` as "Live Demo"). Omit the array entirely and the section (and its nav button) disappears.

```json
{
  "githubUser": "ItzMorphineTime",
  "softwareProjects": [
    {
      "name": "Skybox Gallery",
      "description": "Skybox previewer and generator using the BlockadeLabs AI API.",
      "technologies": ["JavaScript", "BlockadeLabs AI"],
      "stars": 15,
      "links": [
        "https://github.com/ItzMorphineTime/skybox-gallery",
        "https://itzmorphinetime.github.io/skybox-gallery/"
      ],
      "roles": ["Software Engineer"],
      "startDate": "March 2023"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `githubUser` | string | Top-level, optional — when set, star badges refresh from the live GitHub API on page load (fails silently; the static `stars` values remain) |
| `stars` | number | Static star-count snapshot shown in the card's badge (omit to hide the badge) |
| `images` | array | Optional — same media convention as projects; adds a gallery strip to the card |
| *(rest)* | — | `name`, `description`, `technologies`, `links`, `roles`, `startDate` work exactly as in Projects |

### Stats, Clients & Speaking (optional bands)

All three render only when their data exists:

```json
{
  "skillsNote": "Percentages are my own honest judgment of my competency in each skill.",
  "stats": [
    { "value": "20+", "label": "Years in technology" }
  ],
  "clientsNote": "Selected clients & productions",
  "clients": ["Warner Bros.", "ITV", { "name": "ACME", "logo": "./logos/acme.svg" }]
}
```

| Field | Description |
|-------|-------------|
| `skillsNote` | Small italic note under the Skills heading (e.g. how percentages should be read) |
| `stats` | Hero stats band — `{ value, label }` pairs rendered as big accent numbers under the hero |
| `clients` / `clientsNote` | Slim wordmark strip after the hero; entries are plain names or `{ name, logo }` |
| `"talk": true` on a project | Collects that project into the **Speaking & Training** section (zero duplication — same entry powers both; its gallery opens from the talk row) |

### Interests

```json
{
  "interests": [
    {
      "title": "Open Source",
      "description": "Active contributor to various open source projects..."
    }
  ]
}
```

---

## 🎨 Customization

### Changing the Color Scheme

Edit the CSS variables at the top of `styles.css`:

```css
:root {
  --accent-primary: #d4a853;      /* Main accent (gold) */
  --accent-secondary: #e8c068;    /* Secondary accent */
  --bg-primary: #0a0a0f;          /* Page background */
  --bg-card: #16161f;             /* Card backgrounds */
  --skill-bar-bg: #8B2035;        /* Skill bar background (red) */
}
```

### Changing the Matrix Mode Trigger

Matrix mode (and the alternate headshot) activate for the role named by `matrixRole` in `data.json` (default: `"Software Engineer"`). Set it to any role from your `roles` list — no code changes needed.

```json
{ "matrixRole": "Software Engineer" }
```

### Exporting a CV

Two buttons in the hero generate a Word `.docx` résumé entirely from `data.json`:

- **Download CV** — a polished, accent-coloured single-column design (dates are right-aligned in small borderless rows so they never wrap), for sending to people.
- **ATS CV** — a plain single-column, parser-safe layout for applicant-tracking systems.

Both are **A4** and pull from the same fields (`name`, `headline`, `location`, `bio`, `skills`, `experience`, `education`, `interests`, `contact`), plus:

- **Awards** — any project with an `award` gets a line in a dedicated Awards section (label + project + date).
- **Selected Projects** — capped at 12: every `featured` project is guaranteed a slot, remaining slots fill with dated projects, all in `data.json` order. Undated, non-featured projects are omitted.
- **Open Source** — the top 5 `softwareProjects` by stars (name, tech tags, GitHub URL; the designed variant hyperlinks the name and shows a ★ count).
- The ATS variant prints **full URLs** and sticks to ASCII separators for parser safety; the designed variant makes email/profile links **clickable**.

Add optional `highlights: []` arrays to experience items for punchy bullet points (otherwise the `description` is used as a single bullet). The [`docx`](https://docx.js.org/) library is vendored in `vendor/` and **lazy-loaded only on first click**, so it adds nothing to initial page load. CVs ignore the on-screen role filter.

### Adding New Sections

The portfolio follows a modular pattern. To add a new section:

1. Create a render function (e.g., `renderCertifications()`)
2. Add it to the `renderContent()` function
3. Add a navigation button in the `footer-nav` element
4. Add CSS styles as needed

---

## 🖥️ Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile Browsers | ✅ Full |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate images in gallery |
| `Escape` | Close image gallery |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 💡 Tips

- **Images**: Use optimized images (WebP recommended) and small thumbnails for cards for faster loading
- **SEO**: title, description, Open Graph + Twitter cards, JSON-LD `Person`, and the favicon are **generated at runtime by `app.js` from `data.json`** — just edit `data.json`. (`robots.txt`, `sitemap.xml`, and `CNAME` are deployment config — update the domain in those when you deploy.) Note: because meta is JS-injected, non-rendering social scrapers won't see it; add a build step if you need guaranteed link-preview cards.
- **Favicon**: `favicon.svg` (a gold "JL" monogram) ships in the repo root — swap in your own
- **Analytics**: Add privacy-friendly analytics (e.g. Plausible) in the `<head>` if you want visitor insight
- **Custom Domain**: Configured via the `CNAME` file (see the Deploy step above)

---

<p align="center">
  <strong>Built with ❤️ using vanilla HTML, CSS, and JavaScript</strong>
</p>

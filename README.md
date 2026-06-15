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
| 🖼️ **Image Gallery** | Lightbox modal with keyboard navigation for project images |
| 📍 **Smart Navigation** | Floating bottom nav bar with scroll-aware section highlighting |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop viewports |
| 🎨 **Dynamic Theming** | Gold accent theme with Matrix green variant |
| ⚡ **Zero Dependencies** | Pure HTML/CSS/JS — no build tools required |
| 📝 **JSON-Driven Content** | Update your portfolio by editing a single JSON file |

---

## 📁 Project Structure

```
Portfolio/
├── index.html              # Page shell (HTML + meta/SEO/structured data)
├── styles.css              # All styles (theme variables, layout, responsive)
├── app.js                  # App logic — fetches data.json and renders the DOM
├── data.json               # Portfolio content (edit this!)
├── README.md               # Documentation
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
      "description": "Built a full-stack application...",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "images": [
        "./MyProject/screenshot-1.jpg",
        "./MyProject/screenshot-2.jpg"
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
| `description` | string | Project summary |
| `technologies` | array | Tech stack tags |
| `images` | array | Project screenshots (click to open gallery) |
| `links` | array | Live demo, GitHub, etc. (displays as domain) |
| `startDate` / `endDate` | string | Project timeline |
| `roles` | array | Role filters |

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

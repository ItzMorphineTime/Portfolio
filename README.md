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
portfolio/
├── index.html          # Main portfolio page
├── data.json           # Portfolio content (edit this!)
├── README.md           # Documentation
└── assets/             # Your images (create this folder)
    ├── headshot.png
    ├── company-logos/
    └── projects/
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
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

Your portfolio will be live at `https://yourusername.github.io/portfolio/`

---

## 📝 Content Configuration

All portfolio content is managed through `data.json`. Here's the complete structure:

### Basic Information

```json
{
  "bio": "Your professional summary...",
  "headshot": "./assets/headshot.png",
  "headshotalt": "./assets/headshot-animated.gif",
  "roles": ["All", "Software Engineer", "Designer", "Consultant"]
}
```

| Field | Description |
|-------|-------------|
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
      "logo": "./assets/logos/company.svg",
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
        "./assets/projects/project1-1.jpg",
        "./assets/projects/project1-2.jpg"
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

Edit the CSS variables in `index.html`:

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

By default, Matrix mode activates for "Software Engineer". To change this, find this line in the JavaScript:

```javascript
const isMatrixMode = role === 'Software Engineer';
```

Change `'Software Engineer'` to your preferred role.

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

- **Images**: Use optimized images (WebP format recommended) for faster loading
- **SEO**: Update the `<title>` and `<meta name="description">` tags in `index.html`
- **Favicon**: Add a favicon by placing `favicon.ico` in the root directory
- **Analytics**: Add Google Analytics or other tracking in the `<head>` section
- **Custom Domain**: Configure a custom domain in GitHub Pages settings

---

<p align="center">
  <strong>Built with ❤️ using vanilla HTML, CSS, and JavaScript</strong>
</p>

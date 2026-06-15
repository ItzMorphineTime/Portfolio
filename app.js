// Global state
let portfolioData = null;
let currentRole = 'All';
let modalImages = [];
let modalIndex = 0;
let matrixAnimation = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupHeaderScroll();
    setupIntersectionObserver();
    // Give the icon-only footer nav buttons accessible names
    document.querySelectorAll('.footer-nav .nav-btn').forEach(btn => {
        if (btn.dataset.tooltip) btn.setAttribute('aria-label', btn.dataset.tooltip);
    });
    await loadData();
});

// Header scroll effect
function setupHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Intersection Observer for footer nav highlighting
function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateActiveNavButton(sectionId);
            }
        });
    }, options);

    window.sectionObserver = observer;
}

function updateActiveNavButton(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.getElementById('header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight - 20;
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
}

// Build all <head> SEO/meta from data.json so the template carries no identity of its own.
// Note: this runs client-side, so JS-rendering crawlers (e.g. Google) see it; non-rendering
// social scrapers won't. For guaranteed link previews you'd bake these in via a build step.
function applyMeta(data) {
    const name = data.name || 'Portfolio';
    const headline = data.headline || '';
    const title = headline ? `${name} — ${headline}` : name;
    const desc = data.bio || '';
    const url = data.siteUrl || location.href;
    const abs = (p) => { try { return new URL(p, url).href; } catch (e) { return p; } };
    const image = data.ogImage ? abs(data.ogImage) : (data.headshot ? abs(data.headshot) : '');
    const contact = data.contact || {};
    const sameAs = [contact.linkedin, contact.github, contact.website].filter(Boolean);

    document.title = title;
    document.documentElement.lang = data.lang || 'en';

    const setMeta = (attr, key, content) => {
        if (!content) return;
        let el = document.head.querySelector(`meta[${attr}="${key}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
        el.setAttribute('content', content);
    };
    setMeta('name', 'description', desc);
    setMeta('name', 'author', name);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', name);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', image);

    let canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = url;

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url,
        ...(image ? { image } : {}),
        ...(data.jobTitle ? { jobTitle: data.jobTitle } : {}),
        ...(data.organization ? { worksFor: { '@type': 'Organization', name: data.organization.name, ...(data.organization.url ? { url: data.organization.url } : {}) } } : {}),
        ...(contact.email ? { email: 'mailto:' + contact.email } : {}),
        ...(desc ? { description: desc } : {}),
        ...(sameAs.length ? { sameAs } : {})
    };
    let ldEl = document.getElementById('ld-person');
    if (!ldEl) { ldEl = document.createElement('script'); ldEl.type = 'application/ld+json'; ldEl.id = 'ld-person'; document.head.appendChild(ldEl); }
    ldEl.textContent = JSON.stringify(ld);

    applyFavicon(name);
}

// Generate a favicon from the person's initials (gold monogram on the dark theme)
function applyFavicon(name) {
    const initials = (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'P';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4a853"/><stop offset="0.5" stop-color="#f0d78c"/><stop offset="1" stop-color="#d4a853"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#0a0a0f"/><text x="32" y="45" text-anchor="middle" fill="url(#g)" font-family="'Outfit','Segoe UI',sans-serif" font-size="30" font-weight="700">${initials}</text></svg>`;
    const href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    let link = document.head.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/svg+xml';
    link.href = href;
}

// Load JSON data
async function loadData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error('Failed to load data');
        portfolioData = await response.json();
        applyMeta(portfolioData);
        renderFilters();
        renderContent();
        observeSections();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="container">
                <div class="empty-state">
                    <h2>Unable to load portfolio data</h2>
                    <p>Please ensure data.json is in the same directory as this HTML file.</p>
                    <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">Error: ${error.message}</p>
                </div>
            </div>
        `;
    }
}

function observeSections() {
    setTimeout(() => {
        document.querySelectorAll('section[id]').forEach(section => {
            window.sectionObserver.observe(section);
        });
    }, 100);
}

// Escape user-supplied strings before inserting them into HTML
function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Respect the user's reduced-motion preference
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Render role filter buttons
function renderFilters() {
    const container = document.getElementById('roleFilters');
    const roles = portfolioData.roles || ['All'];

    container.innerHTML = roles.map(role => `
        <button class="role-btn ${role === 'All' ? 'active' : ''}" type="button"
                data-role="${esc(role)}">
            ${esc(role)}
        </button>
    `).join('');

    // Event delegation — no inline handlers, immune to quotes in role names
    container.onclick = (e) => {
        const btn = e.target.closest('.role-btn');
        if (btn) filterByRole(btn.dataset.role);
    };
}

// Filter content by role
function filterByRole(role) {
    currentRole = role;
    
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    
    document.querySelectorAll('.filterable').forEach(el => {
        const roles = JSON.parse(el.dataset.roles || '[]');
        const shouldShow = role === 'All' || roles.includes(role);
        el.classList.toggle('hidden', !shouldShow);
    });

    updateSectionVisibility();

    const isMatrixMode = role === (portfolioData.matrixRole || 'Software Engineer');
    document.body.classList.toggle('matrix-mode', isMatrixMode);
    
    const canvas = document.getElementById('matrix-canvas');
    if (isMatrixMode && !prefersReducedMotion()) {
        canvas.classList.add('active');
        startMatrixAnimation();
    } else {
        canvas.classList.remove('active');
        stopMatrixAnimation();
    }

    updateHeadshot(role);
}

// Hide a section entirely when the active filter leaves it with no visible cards
function updateSectionVisibility() {
    document.querySelectorAll('main section[id]').forEach(section => {
        const items = section.querySelectorAll('.filterable');
        if (items.length === 0) return; // hero / interests / contact have no filterable cards
        const anyVisible = [...items].some(el => !el.classList.contains('hidden'));
        section.classList.toggle('section-hidden', !anyVisible);
    });
}

function updateHeadshot(role) {
    const primaryHeadshot = document.getElementById('primaryHeadshot');
    const altHeadshot = document.getElementById('altHeadshot');
    
    if (!primaryHeadshot || !altHeadshot) return;

    if (role === (portfolioData.matrixRole || 'Software Engineer')) {
        primaryHeadshot.classList.add('hidden');
        altHeadshot.classList.remove('hidden');
    } else {
        primaryHeadshot.classList.remove('hidden');
        altHeadshot.classList.add('hidden');
    }
}

// Matrix Animation
function startMatrixAnimation() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*(){}[]|;:<>?'.split('');
    
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    
    const drops = [];
    const speeds = [];
    const brightness = [];
    
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
        speeds[i] = 0.5 + Math.random() * 1.5;
        brightness[i] = 0.5 + Math.random() * 0.5;
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = `rgba(180, 255, 180, ${brightness[i]})`;
            ctx.fillText(char, x, y);

            for (let j = 1; j < 20; j++) {
                const trailY = y - j * fontSize;
                if (trailY > 0) {
                    const trailChar = chars[Math.floor(Math.random() * chars.length)];
                    const alpha = (1 - j / 20) * brightness[i] * 0.8;
                    const green = Math.floor(150 + Math.random() * 105);
                    ctx.fillStyle = `rgba(0, ${green}, 65, ${alpha})`;
                    ctx.fillText(trailChar, x, trailY);
                }
            }

            drops[i] += speeds[i];

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = Math.random() * -20;
                speeds[i] = 0.5 + Math.random() * 1.5;
                brightness[i] = 0.5 + Math.random() * 0.5;
            }
        }
    }

    function handleResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);

    // ~30fps via requestAnimationFrame (auto-throttles in background tabs)
    const frameInterval = 1000 / 30;
    let last = 0;
    let rafId = 0;
    function loop(ts) {
        rafId = requestAnimationFrame(loop);
        if (ts - last < frameInterval) return;
        last = ts;
        draw();
    }
    function play() {
        last = 0;
        rafId = requestAnimationFrame(loop);
    }
    function pause() {
        cancelAnimationFrame(rafId);
    }
    function handleVisibility() {
        if (document.hidden) pause(); else play();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    play();

    matrixAnimation = {
        stop() {
            pause();
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibility);
        }
    };
}

function stopMatrixAnimation() {
    if (matrixAnimation) {
        matrixAnimation.stop();
        matrixAnimation = null;

        const canvas = document.getElementById('matrix-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function extractDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return 'Link';
    }
}

// Render all content
function renderContent() {
    const main = document.getElementById('mainContent');
    const logo = document.querySelector('.header .logo');
    if (logo && portfolioData.name) logo.textContent = portfolioData.name;

    main.innerHTML = `
        ${renderHero()}
        ${renderSkills()}
        ${renderExperience()}
        ${renderEducation()}
        ${renderProjects()}
        ${renderInterests()}
        ${renderContact()}
    `;

    setTimeout(animateSkillBars, 500);
}

// Render hero section
function renderHero() {
    const { bio, headshot, headshotalt, contact, name } = portfolioData;
    const who = name || 'Profile';
    const heroHeading = portfolioData.heroHeading || 'Building {Digital} Experiences';
    // Render {highlighted} words as gold spans; escape all other text
    const heroHeadingHtml = heroHeading.replace(/\{([^}]*)\}|([^{]+)/g,
        (m, hi, plain) => hi != null ? `<span>${esc(hi)}</span>` : esc(plain));

    const contactLinks = [];
    if (contact) {
        if (contact.email) {
            contactLinks.push(`
                <a href="mailto:${esc(contact.email)}" class="hero-contact-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                </a>
            `);
        }
        if (contact.linkedin) {
            contactLinks.push(`
                <a href="${esc(contact.linkedin)}" target="_blank" rel="noopener" class="hero-contact-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                </a>
            `);
        }
        if (contact.github) {
            contactLinks.push(`
                <a href="${esc(contact.github)}" target="_blank" rel="noopener" class="hero-contact-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    GitHub
                </a>
            `);
        }
        if (contact.website) {
            contactLinks.push(`
                <a href="${esc(contact.website)}" target="_blank" rel="noopener" class="hero-contact-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Website
                </a>
            `);
        }
    }

    return `
        <section class="hero" id="hero">
            <div class="container">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1>${heroHeadingHtml}</h1>
                        <p class="hero-bio">${esc(bio || '')}</p>
                        ${contactLinks.length > 0 ? `
                            <div class="hero-contact">
                                ${contactLinks.join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="hero-image">
                        <div class="headshot-container">
                            ${headshot ? 
                                `<img id="primaryHeadshot" src="${esc(headshot)}" alt="${esc(who)} headshot" class="headshot" width="350" height="350" fetchpriority="high" onerror="this.style.display='none'">` :
                                `<div id="primaryHeadshot" class="headshot" style="background: var(--bg-secondary);"></div>`
                            }
                            ${headshotalt ?
                                `<img id="altHeadshot" src="${esc(headshotalt)}" alt="${esc(who)} alternate headshot" class="headshot hidden" width="350" height="350" loading="lazy" decoding="async" onerror="this.style.display='none'">` :
                                ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Render skills section
function renderSkills() {
    const skills = portfolioData.skills || [];
    if (skills.length === 0) return '';

    return `
        <section id="skills">
            <div class="container">
                <div class="section-header">
                    <div class="section-label">Expertise</div>
                    <h2 class="section-title">Skills & Technologies</h2>
                </div>
                <div class="skills-grid">
                    ${skills.map(skill => {
                        const pct = Math.max(0, Math.min(100, Number(skill.proficiency) || 0));
                        return `
                        <div class="skill-card filterable" data-roles='${esc(JSON.stringify(skill.roles || []))}'>
                            <div class="skill-name">${esc(skill.name)}</div>
                            <div class="skill-description">${esc(skill.description || '')}</div>
                            <div class="skill-bar-container">
                                <div class="skill-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(skill.name)} proficiency" data-proficiency="${pct}" style="width: 0%"></div>
                            </div>
                            <div class="skill-proficiency">${pct}%</div>
                            ${skill.roles && skill.roles.length ? `
                                <div class="skill-roles">
                                    ${skill.roles.map(role => `<span class="skill-role-tag">${esc(role)}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </section>
    `;
}

function animateSkillBars() {
    document.querySelectorAll('.skill-bar').forEach(bar => {
        const proficiency = bar.dataset.proficiency;
        bar.style.width = proficiency + '%';
    });
}

// Render experience section
function renderExperience() {
    const experience = portfolioData.experience || [];
    if (experience.length === 0) return '';

    return `
        <section id="experience">
            <div class="container">
                <div class="section-header">
                    <div class="section-label">Career</div>
                    <h2 class="section-title">Work Experience</h2>
                </div>
                <div class="experience-timeline">
                    ${experience.map(exp => `
                        <div class="experience-item filterable" data-roles='${esc(JSON.stringify(exp.roles || []))}'>
                            <div class="experience-header">
                                ${exp.logo ? `<img src="${esc(exp.logo)}" alt="${esc(exp.company)} logo" class="company-logo" width="50" height="50" loading="lazy" decoding="async" onerror="this.style.display='none'">` : ''}
                                <div class="experience-meta">
                                    <div class="company-name">${esc(exp.company)}</div>
                                    <div class="experience-title">${esc(exp.title)}</div>
                                    <div class="experience-duration">${esc(exp.duration)}</div>
                                </div>
                            </div>
                            <p class="experience-description">${esc(exp.description || '')}</p>
                            ${exp.links && exp.links.length ? `
                                <div class="experience-links">
                                    ${exp.links.map(link => `<a href="${esc(link)}" target="_blank" rel="noopener" class="experience-link">${esc(extractDomain(link))} ↗</a>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render education section
function renderEducation() {
    const education = portfolioData.education || [];
    if (education.length === 0) return '';

    return `
        <section id="education">
            <div class="container">
                <div class="section-header">
                    <div class="section-label">Background</div>
                    <h2 class="section-title">Education</h2>
                </div>
                <div class="education-grid">
                    ${education.map(edu => `
                        <div class="education-card filterable" data-roles='${esc(JSON.stringify(edu.roles || []))}'>
                            <div class="education-institution">${esc(edu.institution)}</div>
                            <div class="education-course">${esc(edu.course)}</div>
                            ${edu.grade ? `<div class="education-grade">${esc(edu.grade)}</div>` : ''}
                            ${edu.description ? `<p class="education-description">${esc(edu.description)}</p>` : ''}
                            ${edu.modules && edu.modules.length ? `
                                <div class="section-label" style="margin-top: 1rem;">Key Modules</div>
                                <div class="modules-grid">
                                    ${edu.modules.map(mod => `
                                        <div class="module-item">
                                            <span>${esc(mod.name)}</span>
                                            <span class="module-grade">${esc(mod.grade)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render projects section
function renderProjects() {
    const projects = portfolioData.projects || [];
    if (projects.length === 0) return '';

    return `
        <section id="projects">
            <div class="container">
                <div class="section-header">
                    <div class="section-label">Portfolio</div>
                    <h2 class="section-title">Featured Projects</h2>
                </div>
                <div class="projects-grid">
                    ${projects.map((project, idx) => `
                        <div class="project-card filterable" data-roles='${esc(JSON.stringify(project.roles || []))}'>
                            <div class="project-images ${project.images && project.images.length ? 'has-images' : ''}"
                                 ${project.images && project.images.length ? `onclick="openModal(${idx})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openModal(${idx});}" tabindex="0" role="button" aria-label="Open image gallery for ${esc(project.name)}"` : ''}>
                                ${project.images && project.images.length ? `
                                    <img src="${esc(project.images[0])}" alt="${esc(project.name)}" class="project-image" loading="lazy" decoding="async"
                                         onerror="this.parentElement.innerHTML='<div class=\\'project-placeholder\\'><svg class=\\'project-placeholder-icon\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>'">
                                    ${project.images.length > 1 ? `<div class="project-image-counter">${project.images.length} images</div>` : ''}
                                ` : `
                                    <div class="project-placeholder">
                                        <svg class="project-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <path d="m21 15-5-5L5 21"/>
                                        </svg>
                                    </div>
                                `}
                            </div>
                            <div class="project-content">
                                <h3 class="project-name">${esc(project.name)}</h3>
                                ${project.startDate || project.endDate ? `
                                    <div class="project-date">${esc(project.startDate || '')}${project.endDate ? ` - ${esc(project.endDate)}` : ''}</div>
                                ` : ''}
                                ${project.description ? `<p class="project-description">${esc(project.description)}</p>` : ''}
                                ${project.technologies && project.technologies.length ? `
                                    <div class="project-technologies">
                                        ${project.technologies.map(tech => `<span class="tech-tag">${esc(tech)}</span>`).join('')}
                                    </div>
                                ` : ''}
                                ${project.links && project.links.length ? `
                                    <div class="project-links">
                                        ${project.links.map(link => `<a href="${esc(link)}" target="_blank" rel="noopener" class="project-link">${esc(extractDomain(link))} ↗</a>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render interests section
function renderInterests() {
    const interests = portfolioData.interests || [];
    if (interests.length === 0) return '';

    return `
        <section id="interests">
            <div class="container">
                <div class="section-header">
                    <div class="section-label">Personal</div>
                    <h2 class="section-title">Interests & Hobbies</h2>
                </div>
                <div class="interests-grid">
                    ${interests.map(interest => `
                        <div class="interest-card">
                            <h3 class="interest-title">${esc(interest.title)}</h3>
                            <p class="interest-description">${esc(interest.description || '')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render contact section
function renderContact() {
    const contact = portfolioData.contact;
    if (!contact) return '';

    const contactCards = [];
    
    if (contact.email) {
        contactCards.push(`
            <a href="mailto:${esc(contact.email)}" class="contact-card">
                <div class="contact-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>
                <span class="contact-card-label">Email</span>
                <span class="contact-card-value">${esc(contact.email)}</span>
            </a>
        `);
    }

    if (contact.linkedin) {
        contactCards.push(`
            <a href="${esc(contact.linkedin)}" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </div>
                <span class="contact-card-label">LinkedIn</span>
                <span class="contact-card-value">Connect</span>
            </a>
        `);
    }

    if (contact.github) {
        contactCards.push(`
            <a href="${esc(contact.github)}" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                </div>
                <span class="contact-card-label">GitHub</span>
                <span class="contact-card-value">View Code</span>
            </a>
        `);
    }

    if (contact.website) {
        contactCards.push(`
            <a href="${esc(contact.website)}" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                </div>
                <span class="contact-card-label">Website</span>
                <span class="contact-card-value">Visit</span>
            </a>
        `);
    }

    if (contactCards.length === 0) return '';

    return `
        <section id="contact">
            <div class="container">
                <div class="contact-section">
                    <h2 class="contact-title">${esc(portfolioData.contactTitle || "Let's Connect")}</h2>
                    <p class="contact-subtitle">${esc(portfolioData.contactSubtitle || "I'm always open to discussing new projects, opportunities, or just having a chat about technology and creativity.")}</p>
                    <div class="contact-grid">
                        ${contactCards.join('')}
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Modal functions
let lastFocused = null;
function openModal(projectIndex) {
    const project = portfolioData.projects[projectIndex];
    if (!project || !project.images || !project.images.length) return;

    modalImages = project.images;
    modalIndex = 0;
    updateModalImage();
    const modal = document.getElementById('imageModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;      // remember the trigger
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();            // move focus into the dialog
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();                   // return focus to the trigger
        lastFocused = null;
    }
}

function navigateModal(direction) {
    modalIndex = (modalIndex + direction + modalImages.length) % modalImages.length;
    updateModalImage();
}

function updateModalImage() {
    const img = document.getElementById('modalImage');
    const counter = document.getElementById('modalCounter');
    img.src = modalImages[modalIndex];
    counter.textContent = `${modalIndex + 1} / ${modalImages.length}`;
}

document.getElementById('imageModal').addEventListener('click', (e) => {
    if (e.target.id === 'imageModal') closeModal();
});

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
    if (e.key === 'Tab') {
        // Trap focus within the dialog
        const focusable = [...modal.querySelectorAll('button')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }
});
    

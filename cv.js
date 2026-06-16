/*
 * CV export — generates Word (.docx) résumés purely from portfolioData (data.json).
 * Two variants: "ats" (single-column, parser-safe) and "designed" (two-column, accented).
 * The heavy `docx` library is vendored and lazy-loaded on first use.
 */
(function () {
    'use strict';

    const DOCX_SRC = './vendor/docx.iife.js';
    let _docxLoading = null;

    // Lazy-load the vendored docx library once, on first click.
    function loadDocx() {
        if (window.docx) return Promise.resolve(window.docx);
        if (_docxLoading) return _docxLoading;
        _docxLoading = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = DOCX_SRC;
            s.onload = () => window.docx ? resolve(window.docx) : reject(new Error('docx did not initialise'));
            s.onerror = () => reject(new Error('Failed to load ' + DOCX_SRC));
            document.head.appendChild(s);
        });
        return _docxLoading;
    }

    const cleanUrl = (u) => String(u || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const slug = (s) => (String(s || 'cv').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cv');
    const projectDate = (p) => {
        const s = (p.startDate || '').trim(), e = (p.endDate || '').trim();
        if (s && e) return s === e ? s : `${s} – ${e}`;
        return s || e || '';
    };

    // data.json -> normalized CV model. Always the full CV (decision D2: role filter ignored).
    function buildCvModel(data) {
        data = data || {};
        const c = data.contact || {};
        const contacts = [];
        if (c.email) contacts.push({ label: 'Email', value: c.email });
        if (c.phone) contacts.push({ label: 'Phone', value: c.phone });
        if (data.location) contacts.push({ label: 'Location', value: data.location });
        if (c.linkedin) contacts.push({ label: 'LinkedIn', value: cleanUrl(c.linkedin) });
        if (c.github) contacts.push({ label: 'GitHub', value: cleanUrl(c.github) });
        if (c.website) contacts.push({ label: 'Website', value: cleanUrl(c.website) });

        return {
            name: data.name || 'Your Name',
            headline: data.headline || data.jobTitle || '',
            contacts,
            summary: data.bio || '',
            skills: (data.skills || []).map((s) => s.name).filter(Boolean),
            skillDetails: (data.skills || []).map((s) => ({ name: s.name, proficiency: s.proficiency })),
            experience: (data.experience || []).map((e) => ({
                title: e.title || '',
                company: e.company || '',
                duration: e.duration || '',
                bullets: (Array.isArray(e.highlights) && e.highlights.length)
                    ? e.highlights
                    : (e.description ? [e.description] : [])
            })),
            projects: (data.projects || []).map((p) => ({ title: p.name || '', date: projectDate(p) })).filter((p) => p.title),
            education: (data.education || []).map((ed) => ({
                institution: ed.institution || '',
                course: ed.course || '',
                grade: ed.grade || '',
                description: ed.description || '',
                modules: (ed.modules || []).map((m) => `${m.name}${m.grade ? ` (${m.grade})` : ''}`)
            })),
            interests: (data.interests || []).map((i) => i.title).filter(Boolean)
        };
    }

    // ---------- Variant A: ATS (single column, parser-safe) ----------
    function renderAtsDocx(model) {
        const { Document, Paragraph, TextRun, AlignmentType, BorderStyle } = window.docx;
        const kids = [];

        kids.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: model.name, bold: true, size: 34 })] }));
        if (model.headline) kids.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: model.headline, size: 22 })] }));
        if (model.contacts.length) {
            kids.push(new Paragraph({
                spacing: { after: 220 },
                children: [new TextRun({ text: model.contacts.map((x) => x.value).join('   |   '), size: 18, color: '444444' })]
            }));
        }

        const heading = (t) => new Paragraph({
            spacing: { before: 220, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' } },
            children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 24 })]
        });
        const para = (text, opts) => new Paragraph(Object.assign({ children: [new TextRun({ text, size: 20 })] }, opts || {}));

        if (model.summary) { kids.push(heading('Summary')); kids.push(para(model.summary, { spacing: { after: 120 } })); }
        if (model.skills.length) { kids.push(heading('Skills')); kids.push(para(model.skills.join(', '), { spacing: { after: 120 } })); }

        if (model.experience.length) {
            kids.push(heading('Experience'));
            model.experience.forEach((e) => {
                kids.push(new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: e.title, bold: true, size: 22 }),
                        e.company ? new TextRun({ text: `  —  ${e.company}`, size: 22 }) : null
                    ].filter(Boolean)
                }));
                if (e.duration) kids.push(new Paragraph({ children: [new TextRun({ text: e.duration, italics: true, size: 18, color: '666666' })] }));
                e.bullets.forEach((b) => kids.push(new Paragraph({ text: b, bullet: { level: 0 }, spacing: { after: 20 } })));
            });
        }

        if (model.projects.length) {
            kids.push(heading('Projects'));
            model.projects.forEach((p) => {
                kids.push(new Paragraph({
                    spacing: { after: 20 },
                    children: [
                        new TextRun({ text: p.title, size: 20 }),
                        p.date ? new TextRun({ text: `   —   ${p.date}`, size: 18, color: '666666' }) : null
                    ].filter(Boolean)
                }));
            });
        }

        if (model.education.length) {
            kids.push(heading('Education'));
            model.education.forEach((ed) => {
                kids.push(new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: ed.institution, bold: true, size: 22 }),
                        ed.course ? new TextRun({ text: `  —  ${ed.course}`, size: 22 }) : null
                    ].filter(Boolean)
                }));
                if (ed.grade) kids.push(new Paragraph({ children: [new TextRun({ text: ed.grade, italics: true, size: 18, color: '666666' })] }));
                if (ed.description) kids.push(para(ed.description, { spacing: { after: 20 } }));
                if (ed.modules.length) kids.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Modules: ' + ed.modules.join(', '), size: 18, color: '444444' })] }));
            });
        }

        if (model.interests.length) { kids.push(heading('Interests')); kids.push(para(model.interests.join(', '))); }

        return new Document({
            creator: model.name,
            title: `${model.name} — CV`,
            styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
            sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: kids }]
        });
    }

    // ---------- Variant B: Designed (single-column; borderless 2-col rows for date alignment) ----------
    // Accent header + full-width rules under headings. Dates sit in a fixed-width, right-aligned
    // borderless table cell so they can NEVER wrap onto the next line. This is a per-row helper
    // table, not the old full-page layout table.
    function renderDesignedDocx(model, accentInput) {
        const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, TableLayoutType, AlignmentType, VerticalAlign, BorderStyle } = window.docx;
        const accent = String(accentInput || '#d4a853').replace('#', '') || 'd4a853';
        const CONTENT_W = 10080, DATE_W = 2600, LEAD_W = CONTENT_W - DATE_W; // Letter, 0.75in margins

        const MONTHS = { January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', May: 'May', June: 'Jun', July: 'Jul', August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec' };
        const shortDate = (d) => String(d || '').replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g, (m) => MONTHS[m]);

        const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
        const cellNB = { top: NB, bottom: NB, left: NB, right: NB };
        const tableNB = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

        // One borderless row: left cell holds `leadParas`, right cell holds the right-aligned date.
        const dateRow = (leadParas, dateText, vpad) => new TableRow({
            children: [
                new TableCell({ width: { size: LEAD_W, type: WidthType.DXA }, borders: cellNB, margins: { top: vpad || 0, bottom: vpad || 0, left: 0, right: 120 }, verticalAlign: VerticalAlign.TOP, children: leadParas }),
                new TableCell({ width: { size: DATE_W, type: WidthType.DXA }, borders: cellNB, margins: { top: vpad || 0, bottom: vpad || 0, left: 120, right: 0 }, verticalAlign: VerticalAlign.TOP, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: shortDate(dateText), size: 17, color: '777777' })] })] })
            ]
        });
        const wrapTable = (rows) => new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [LEAD_W, DATE_W], layout: TableLayoutType.FIXED, borders: tableNB, rows });

        const kids = [];

        kids.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: model.name, bold: true, size: 44, color: accent })] }));
        if (model.headline) kids.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: model.headline, size: 24, color: '555555' })] }));
        if (model.contacts.length) kids.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: model.contacts.map((c) => c.value).join('   ·   '), size: 17, color: '666666' })] }));
        kids.push(new Paragraph({ spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: accent } }, children: [] }));

        const heading = (t) => new Paragraph({
            spacing: { before: 240, after: 100 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent } },
            children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22, color: accent })]
        });

        if (model.summary) {
            kids.push(heading('Profile'));
            kids.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: model.summary, size: 19, color: '333333' })] }));
        }

        if (model.skills.length) {
            kids.push(heading('Skills'));
            kids.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: model.skills.join('   ·   '), size: 18, color: '333333' })] }));
        }

        if (model.experience.length) {
            kids.push(heading('Experience'));
            model.experience.forEach((e) => {
                const lead = [new TextRun({ text: e.title, bold: true, size: 21, color: '222222' })];
                if (e.company) lead.push(new TextRun({ text: `    ${e.company}`, size: 19, color: accent }));
                kids.push(wrapTable([dateRow([new Paragraph({ children: lead })], e.duration, 60)]));
                e.bullets.forEach((b) => kids.push(new Paragraph({ text: b, bullet: { level: 0 }, spacing: { before: 40, after: 20 } })));
            });
        }

        if (model.projects.length) {
            kids.push(heading('Selected Projects'));
            kids.push(wrapTable(model.projects.map((p) => dateRow([new Paragraph({ children: [new TextRun({ text: p.title, size: 19, color: '222222' })] })], p.date, 24))));
        }

        if (model.education.length) {
            kids.push(heading('Education'));
            model.education.forEach((ed) => {
                const lead = [new TextRun({ text: ed.institution, bold: true, size: 20, color: '222222' })];
                if (ed.course) lead.push(new TextRun({ text: `    ${ed.course}`, size: 18, color: accent }));
                kids.push(new Paragraph({ spacing: { before: 100 }, children: lead }));
                if (ed.grade) kids.push(new Paragraph({ children: [new TextRun({ text: ed.grade, italics: true, size: 17, color: '666666' })] }));
                if (ed.modules.length) kids.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: 'Modules: ' + ed.modules.join(', '), size: 16, color: '777777' })] }));
            });
        }

        if (model.interests.length) {
            kids.push(heading('Interests'));
            kids.push(new Paragraph({ children: [new TextRun({ text: model.interests.join('   ·   '), size: 18, color: '444444' })] }));
        }

        return new Document({
            creator: model.name,
            title: `${model.name} — CV`,
            styles: { default: { document: { run: { font: 'Calibri' } } } },
            sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: kids }]
        });
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    // Build a .docx Blob for the given variant ("ats" | "designed"). Exposed for testing too.
    async function generateCvBlob(variant) {
        const lib = await loadDocx();
        const model = buildCvModel(portfolioData);
        const doc = variant === 'ats' ? renderAtsDocx(model) : renderDesignedDocx(model, portfolioData && portfolioData.cvAccent);
        return lib.Packer.toBlob(doc);
    }

    async function downloadCv(variant, btn) {
        if (typeof portfolioData === 'undefined' || !portfolioData) return;
        const original = btn ? btn.innerHTML : null;
        try {
            if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = 'Generating…'; }
            const blob = await generateCvBlob(variant);
            const name = buildCvModel(portfolioData).name;
            triggerDownload(blob, `${slug(name)}-CV${variant === 'ats' ? '-ATS' : ''}.docx`);
        } catch (e) {
            console.error('CV generation failed:', e);
            alert('Sorry — CV generation failed. Please try again.');
        } finally {
            if (btn && original != null) { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = original; }
        }
    }

    window.downloadCv = downloadCv;
    window.generateCvBlob = generateCvBlob; // used by verification / programmatic export
})();

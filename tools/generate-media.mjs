#!/usr/bin/env node
/*
 * generate-media.mjs — builds web-optimised card/strip thumbnails for the portfolio.
 *
 * For every raster image referenced by data.json projects (plain strings and the
 * poster of { src, type: "video", poster } entries), writes a WebP capped at
 * MAX_WIDTH px wide to  thumbs/<same relative path>.webp  and records it in
 * thumbs/manifest.json. app.js fetches that manifest and swaps card faces and
 * modal thumbnail-strip images to the small versions; the modal stage (and
 * preloading) always keeps the full-resolution originals.
 *
 * Originals are never modified or deleted. Thumbs are regenerated only when the
 * source is newer (delete thumbs/ to force a full rebuild). Requires ffmpeg on PATH.
 *
 * Usage:  node tools/generate-media.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THUMB_DIR = path.join(ROOT, 'thumbs');
const MAX_WIDTH = 960;   // covers 2-col featured cards on 2x displays well enough
const QUALITY = 80;      // libwebp quality
const RASTER = /\.(jpe?g|png|webp|avif|gif)$/i;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));

// Collect every raster image path referenced by the projects.
const refs = new Set();
const add = (p) => { if (typeof p === 'string' && p.startsWith('./') && RASTER.test(p)) refs.add(p.slice(2)); };
for (const project of data.projects || []) {
    for (const entry of project.images || []) {
        if (typeof entry === 'string') add(entry);
        else if (entry && typeof entry === 'object') { add(entry.poster); if (entry.type !== 'video') add(entry.src); }
    }
}

let made = 0, skipped = 0, missing = 0, failed = 0;
const manifest = {};

for (const rel of [...refs].sort()) {
    const srcAbs = path.join(ROOT, rel);
    if (!fs.existsSync(srcAbs)) { console.warn(`  !! missing on disk, skipped: ${rel}`); missing++; continue; }

    const thumbRel = path.posix.join('thumbs', rel.split(path.sep).join('/') + '.webp');
    const thumbAbs = path.join(ROOT, thumbRel);
    fs.mkdirSync(path.dirname(thumbAbs), { recursive: true });

    const fresh = fs.existsSync(thumbAbs) && fs.statSync(thumbAbs).mtimeMs >= fs.statSync(srcAbs).mtimeMs;
    if (!fresh) {
        try {
            execFileSync('ffmpeg', [
                '-y', '-v', 'error', '-i', srcAbs,
                '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
                '-frames:v', '1',                    // stills only (also collapses GIFs)
                '-c:v', 'libwebp', '-quality', String(QUALITY),
                thumbAbs
            ], { stdio: ['ignore', 'inherit', 'inherit'] });
            made++;
        } catch {
            console.warn(`  !! ffmpeg failed, card will use the original: ${rel}`);
            failed++;
            continue;
        }
    } else {
        skipped++;
    }
    manifest['./' + rel.split(path.sep).join('/')] = './' + thumbRel;
}

fs.writeFileSync(path.join(THUMB_DIR, 'manifest.json'), JSON.stringify(manifest, null, 1));

const bytes = Object.values(manifest).reduce((n, t) => n + fs.statSync(path.join(ROOT, t)).size, 0);
console.log(`thumbs: ${made} generated, ${skipped} up-to-date, ${missing} missing, ${failed} failed`);
console.log(`manifest: ${Object.keys(manifest).length} entries, total thumb weight ${(bytes / 1024 / 1024).toFixed(1)} MB`);

#!/usr/bin/env node
/*
 * generate-media.mjs — builds web-optimised media derivatives for the portfolio.
 *
 * 1. THUMBNAILS: for every raster image referenced by data.json projects (plain
 *    strings and the poster of { src, type: "video", poster } entries), writes a
 *    WebP capped at MAX_WIDTH px wide to  thumbs/<same relative path>.webp.
 *    app.js swaps card faces and modal-strip images to these; the modal stage
 *    (and preloading) always keeps the full-resolution originals.
 *
 * 2. VIDEO POSTERS: for every referenced video WITHOUT an explicit "poster" in
 *    data.json, extracts a representative frame to  <video basename>-poster.jpg
 *    next to the video (so gallery thumbnails/posters actually show the video's
 *    content), then thumbnails that poster too. An explicit poster in data.json
 *    always wins — set one to override the extracted frame.
 *
 * Everything lands in thumbs/manifest.json as { "thumbs": {...}, "posters": {...} },
 * which app.js fetches at runtime. Originals are never modified or deleted.
 * Regeneration is incremental (source newer than derivative); delete thumbs/ or
 * the -poster.jpg files to force a rebuild. Requires ffmpeg on PATH.
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
const VIDEO = /\.(mp4|webm|mov|m4v|ogv)$/i;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));

// Collect every referenced raster image, and every video that needs a poster extracted.
const refs = new Set();
const videosNeedingPoster = new Set();
const add = (p) => { if (typeof p === 'string' && p.startsWith('./') && RASTER.test(p)) refs.add(p.slice(2)); };
const addVideo = (p) => { if (typeof p === 'string' && p.startsWith('./') && VIDEO.test(p)) videosNeedingPoster.add(p.slice(2)); };
for (const project of [...(data.projects || []), ...(data.softwareProjects || [])]) {
    for (const entry of project.images || []) {
        if (typeof entry === 'string') { add(entry); addVideo(entry); }
        else if (entry && typeof entry === 'object') {
            if (entry.type === 'video' || VIDEO.test(entry.src || '')) {
                if (entry.poster) add(entry.poster);      // explicit poster wins; just thumb it
                else addVideo(entry.src);
            } else {
                add(entry.src);
                add(entry.poster);
            }
        }
    }
}

// Extract a representative frame for each poster-less video: seek past any fade-in,
// then let ffmpeg's thumbnail filter pick the most representative of ~90 frames.
const posters = {};
let postersMade = 0, postersFresh = 0;
for (const rel of [...videosNeedingPoster].sort()) {
    const srcAbs = path.join(ROOT, rel);
    if (!fs.existsSync(srcAbs)) { console.warn(`  !! video missing on disk, skipped: ${rel}`); continue; }
    const posterRel = rel.replace(/\.[^.]+$/, '') + '-poster.jpg';
    const posterAbs = path.join(ROOT, posterRel);
    const fresh = fs.existsSync(posterAbs) && fs.statSync(posterAbs).mtimeMs >= fs.statSync(srcAbs).mtimeMs;
    if (!fresh) {
        try {
            execFileSync('ffmpeg', [
                '-y', '-v', 'error', '-ss', '1.5', '-i', srcAbs,
                '-vf', `thumbnail=90,scale='min(1280,iw)':-2`,
                '-frames:v', '1', '-q:v', '3',
                posterAbs
            ], { stdio: ['ignore', 'inherit', 'inherit'] });
            postersMade++;
        } catch {
            console.warn(`  !! poster extraction failed: ${rel}`);
            continue;
        }
    } else {
        postersFresh++;
    }
    posters['./' + rel.split(path.sep).join('/')] = './' + posterRel.split(path.sep).join('/');
    refs.add(posterRel);   // thumbnail the poster for the modal strip
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

fs.mkdirSync(THUMB_DIR, { recursive: true });
fs.writeFileSync(path.join(THUMB_DIR, 'manifest.json'), JSON.stringify({ thumbs: manifest, posters }, null, 1));

const bytes = Object.values(manifest).reduce((n, t) => n + fs.statSync(path.join(ROOT, t)).size, 0);
console.log(`posters: ${postersMade} extracted, ${postersFresh} up-to-date (${Object.keys(posters).length} in manifest)`);
console.log(`thumbs: ${made} generated, ${skipped} up-to-date, ${missing} missing, ${failed} failed`);
console.log(`manifest: ${Object.keys(manifest).length} thumb entries, total thumb weight ${(bytes / 1024 / 1024).toFixed(1)} MB`);

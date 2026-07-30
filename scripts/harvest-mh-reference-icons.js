#!/usr/bin/env node
'use strict';

// Private reference-media harvester. Outputs are intentionally ignored by Git.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'rise');
const MANIFEST = path.join(OUTPUT, 'manifest.json');
const BASE = 'https://mhrise.kiranico.com/ja/data';
const CDN_PREFIX = 'https://cdn.kiranico.net/file/kiranico/mhrise-web/';
const USER_AGENT = 'BubbleChat local reference catalog/1.0 (resumable; low concurrency)';
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY = process.argv.find(value => value.startsWith('--only='))?.split('=')[1] || 'all';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function decodeHtml(value) {
    return String(value || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}
function normalizeUrl(value) { return String(value).replace(/^http:\/\//i, 'https://'); }
function loadManifest() {
    if (!fs.existsSync(MANIFEST)) return { version: 1, game: 'rise-sunbreak', locale: 'ja', source: 'Kiranico', records: {}, pages: {} };
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}
function saveManifest(manifest) {
    manifest.updatedAt = new Date().toISOString();
    fs.mkdirSync(OUTPUT, { recursive: true });
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
async function fetchWithRetry(url, binary = false) {
    let last;
    for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
            const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
        } catch (error) {
            last = error;
            await sleep(400 * (attempt + 1));
        }
    }
    throw new Error(`${url}: ${last?.message || 'fetch failed'}`);
}

function pageSpecs() {
    const specs = [];
    if (ONLY === 'all' || ONLY === 'weapons') for (let view = 0; view < 14; view += 1) specs.push({ kind: 'weapon', url: `${BASE}/weapons?view=${view}`, view: String(view) });
    if (ONLY === 'all' || ONLY === 'armor') for (let view = 0; view < 10; view += 1) specs.push({ kind: 'armor', url: `${BASE}/armors?view=${view}`, view: String(view) });
    if (ONLY === 'all' || ONLY === 'items') for (const view of ['consume', 'material', 'scrap', 'ammo', 'account', 'antique']) specs.push({ kind: 'item', url: `${BASE}/items?view=${view}`, view });
    if (ONLY === 'all' || ONLY === 'monsters') for (const view of ['lg', 'sm']) specs.push({ kind: 'monster', url: `https://mhrise.kiranico.com/ko/data/monsters?view=${view}`, view });
    return specs;
}

function parsePage(spec, html) {
    const found = new Map();
    if (spec.kind === 'weapon') {
        const pattern = /<img[^>]+src="(https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhrise-web\/avatar\/weapons\/(\d+)\.webp)"[^>]*>[\s\S]{0,500}?href="https?:\/\/mhrise\.kiranico\.com\/ja\/data\/weapons\/\2"[^>]*>([\s\S]*?)<\/a>/gi;
        for (const match of html.matchAll(pattern)) found.set(`weapon:${match[2]}`, { mediaKind: 'weapon', sourceId: match[2], variant: null, nameJa: decodeHtml(match[3]), url: normalizeUrl(match[1]), extension: '.webp' });
    } else if (spec.kind === 'armor') {
        const pattern = /<img[^>]+src="(https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhrise-web\/avatar\/armors\/(\d+)_(m|f)\.webp)"[^>]*>/gi;
        for (const match of html.matchAll(pattern)) found.set(`armor:${match[2]}:${match[3]}`, { mediaKind: 'armor', sourceId: match[2], variant: match[3] === 'm' ? 'male' : 'female', nameJa: null, url: normalizeUrl(match[1]), extension: '.webp' });
    } else if (spec.kind === 'item') {
        const pattern = /<a[^>]+href="https?:\/\/mhrise\.kiranico\.com\/ja\/data\/items\/(\d+)"[\s\S]{0,500}?<img[^>]+src="(https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhrise-web\/images\/items\/\1\.png)"[^>]*>[\s\S]{0,500}?<p[^>]*>([\s\S]*?)<\/p>/gi;
        for (const match of html.matchAll(pattern)) found.set(`item:${match[1]}`, { mediaKind: 'item', sourceId: match[1], variant: null, nameJa: decodeHtml(match[3]), url: normalizeUrl(match[2]), extension: '.png' });
    } else if (spec.kind === 'monster') {
        const pattern = /<img[^>]+src="(https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhrise-web\/images\/icons\/(ems?\d+_\d+)\.png)"[^>]+alt="([^"]*)"[^>]*>[\s\S]{0,500}?href="https?:\/\/mhrise\.kiranico\.com\/ko\/data\/monsters\/(\d+)"[^>]*>/gi;
        for (const match of html.matchAll(pattern)) found.set(`monster:${match[4]}`, {
            mediaKind: 'monster', sourceId: match[4], variant: match[2].toLowerCase(),
            nameKo: decodeHtml(match[3]), url: normalizeUrl(match[1]), extension: '.png'
        });
    }
    return [...found.entries()].map(([key, value]) => ({ key, ...value }));
}

async function mapLimit(entries, limit, worker) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, entries.length) }, async () => {
        while (cursor < entries.length) { const index = cursor++; await worker(entries[index], index); }
    });
    await Promise.all(runners);
}

async function main() {
    const manifest = loadManifest();
    const parsed = new Map();
    for (const spec of pageSpecs()) {
        const html = await fetchWithRetry(spec.url);
        const records = parsePage(spec, html);
        if (!records.length) throw new Error(`No ${spec.kind} icons parsed from ${spec.url}`);
        for (const record of records) parsed.set(record.key, { ...record, pageUrl: spec.url, view: spec.view });
        manifest.pages[spec.url] = { kind: spec.kind, view: spec.view, recordCount: records.length, fetchedAt: new Date().toISOString(), htmlSha256: sha256(Buffer.from(html)) };
        console.log(`[mh-icons] ${spec.kind}:${spec.view} -> ${records.length}`);
    }
    if (DRY_RUN) return console.log(JSON.stringify({ pages: Object.keys(manifest.pages).length, records: parsed.size }, null, 2));
    let completed = 0, skipped = 0, unavailable = 0;
    await mapLimit([...parsed.values()], 4, async record => {
        const variant = record.variant ? `_${record.variant}` : '';
        const relative = path.join(record.mediaKind, `${record.sourceId}${variant}${record.extension}`).replace(/\\/g, '/');
        const destination = path.join(OUTPUT, relative);
        const previous = manifest.records[record.key];
        if (previous?.status === 'unavailable' && previous.sourceUrl === record.url) { unavailable += 1; return; }
        if (previous && fs.existsSync(destination)) {
            const existing = fs.readFileSync(destination);
            if (existing.length === previous.bytes && sha256(existing) === previous.sha256) { skipped += 1; return; }
        }
        let bytes;
        try { bytes = await fetchWithRetry(record.url, true); }
        catch (error) {
            manifest.records[record.key] = { game: 'rise-sunbreak', mediaKind: record.mediaKind, sourceId: record.sourceId, variant: record.variant, nameJa: record.nameJa, nameKo: record.nameKo, sourceUrl: record.url, pageUrl: record.pageUrl, localPath: null, status: 'unavailable', error: error.message, checkedAt: new Date().toISOString(), evidence: 'kiranico-page-id-and-image-row' };
            unavailable += 1;
            return;
        }
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, bytes);
        manifest.records[record.key] = { game: 'rise-sunbreak', mediaKind: record.mediaKind, sourceId: record.sourceId, variant: record.variant, nameJa: record.nameJa, nameKo: record.nameKo, sourceUrl: record.url, pageUrl: record.pageUrl, localPath: relative, bytes: bytes.length, sha256: sha256(bytes), status: 'downloaded', evidence: 'kiranico-page-id-and-image-row' };
        completed += 1;
        if (completed % 100 === 0) saveManifest(manifest);
        await sleep(35);
    });
    saveManifest(manifest);
    console.log(`[mh-icons] complete: ${completed} downloaded, ${skipped} verified/skipped, ${unavailable} unavailable, ${Object.keys(manifest.records).length} manifest records`);
}

if (require.main === module) main().catch(error => { console.error(`[mh-icons] ${error.message}`); process.exitCode = 1; });
module.exports = { decodeHtml, normalizeUrl, parsePage };

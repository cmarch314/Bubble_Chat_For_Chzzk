'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
    HUNT_PROTECTED_CLASSIC_AUDIO,
    HUNT_VERIFIED_LOCAL_WEAPON_CUES
} = require('../js/effects/hunt/HuntAudioCatalog.js');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'game_extracts', 'catalogs', 'hunt-sfx-migration.json');
const audioExtension = /\.(?:mp3|wav|ogg|m4a|aac|flac|webm|mp4)$/i;
const huntRoots = [path.join(root, 'js', 'effects', 'HuntEffect.js'), path.join(root, 'js', 'effects', 'hunt')];

function walk(target) {
    if (!fs.existsSync(target)) return [];
    const stat = fs.statSync(target);
    if (stat.isFile()) return [target];
    return fs.readdirSync(target, { withFileTypes: true }).flatMap(entry => walk(path.join(target, entry.name)));
}

function normalizedReference(reference) {
    return String(reference || '').replace(/^\.\//, '').replaceAll('\\', '/');
}

function verifiedPaths() {
    return new Set(Object.values(HUNT_VERIFIED_LOCAL_WEAPON_CUES)
        .flat()
        .flatMap(variant => variant.layers.map(layer => normalizedReference(layer[0]))));
}

function classify(reference, verified) {
    const clean = normalizedReference(reference);
    const soundtrackRelative = clean.replace(/^MonsterHunter_Soundtracks\//, '');
    if (verified.has(clean)) return { decision: 'keep', class: 'verified-local-extract' };
    if (/^AI CMC\//i.test(clean)) return { decision: 'keep', class: 'protected-cmc' };
    if (HUNT_PROTECTED_CLASSIC_AUDIO.includes(soundtrackRelative)) {
        return { decision: 'keep', class: /potion/i.test(clean) ? 'protected-potion' : 'protected-classic-mh' };
    }
    if (/^(?:SFX\/)?MonsterHunter_(?:Hunters|Roars)\//i.test(clean)
        || /^mh_(?:slash|blunt|heavy|reload|hit|guard|dodge|cart|aibo|dust|stun|sharpen)/i.test(path.basename(clean))) {
        return { decision: 'retire', class: 'legacy-unverified' };
    }
    if (/^local_assets\/monster_hunter\//i.test(clean)) return { decision: 'review', class: 'local-extract-unpromoted' };
    if (/^MonsterHunter_Soundtracks\/Unified_SFX\/MH - /i.test(clean)) return { decision: 'review', class: 'classic-candidate' };
    return { decision: 'review', class: 'hunt-audio-reference' };
}

function extractReferences(file) {
    const source = fs.readFileSync(file, 'utf8').replace(/^\s*\/\/.*$/gm, '');
    return [...source.matchAll(/(['"`])([^'"`\r\n]+?\.(?:mp3|wav|ogg|m4a|aac|flac|webm|mp4))\1/gi)].map(match => match[2]);
}

function buildManifest() {
    const verified = verifiedPaths();
    const records = new Map();
    for (const file of huntRoots.flatMap(walk).filter(file => file.endsWith('.js'))) {
        const source = path.relative(root, file).replaceAll(path.sep, '/');
        for (const reference of extractReferences(file)) {
            const clean = normalizedReference(reference);
            if (!audioExtension.test(clean)) continue;
            if (!records.has(clean)) records.set(clean, { reference: clean, sources: [] });
            const record = records.get(clean);
            if (!record.sources.includes(source)) record.sources.push(source);
        }
    }

    const entries = [...records.values()].map(record => ({
        ...record,
        ...classify(record.reference, verified),
        sources: record.sources.sort()
    })).sort((a, b) => a.reference.localeCompare(b.reference));
    const summary = entries.reduce((counts, entry) => {
        counts[entry.decision] = (counts[entry.decision] || 0) + 1;
        return counts;
    }, {});
    const fingerprint = crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex');
    return {
        version: 1,
        policy: 'Keep verified local extracts, CMC, potion, and explicit classic MH cues. Retire unverified legacy hunt fallbacks before moving any files.',
        fingerprint,
        summary,
        entries
    };
}

function main() {
    const manifest = buildManifest();
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`[hunt-sfx] migration inventory: ${manifest.entries.length} references`);
    console.log(`[hunt-sfx] decisions: ${Object.entries(manifest.summary).map(([key, value]) => `${key}=${value}`).join(', ')}`);
    console.log(`[hunt-sfx] wrote ${path.relative(root, outputPath)}`);
}

if (require.main === module) main();
module.exports = { buildManifest, classify, normalizedReference };

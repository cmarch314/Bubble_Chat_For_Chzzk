#!/usr/bin/env node
'use strict';

// Scaffolds a deliberately unreleased kit. It writes no runtime profile and
// cannot make a monster selectable: authors must add evidence, a BEAT profile,
// review each action, then pass the compiler/release gate separately.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const value = flag => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : '';
const id = String(value('--id') || '').trim().toLowerCase();
const nameKO = String(value('--name-ko') || '').trim();
const edition = String(value('--edition') || 'world-iceborne').trim();
const dryRun = argv.includes('--dry-run');

if (!/^[a-z][a-z0-9_]*$/.test(id) || !nameKO) {
    console.error('usage: node scripts/create-monster-kit.js --id <snake_case> --name-ko <한국어명> [--edition world-iceborne] [--dry-run]');
    process.exit(1);
}

const kitPath = path.join(ROOT, 'data', 'hunt', 'monster-kits', `${id}.json`);
const actionPath = path.join(ROOT, 'data', 'hunt', 'monster-kits', 'actions', `${id}.json`);
const notePath = path.join(ROOT, 'data', 'hunt', 'monster-kits', 'notes', `${id}.md`);
const files = [kitPath, actionPath, notePath];
const existing = files.filter(file => fs.existsSync(file));
if (existing.length) {
    console.error(`refusing to overwrite existing kit material: ${existing.map(file => path.relative(ROOT, file)).join(', ')}`);
    process.exit(1);
}

const kit = {
    schemaVersion: 1,
    id,
    nameKO,
    canonicalEdition: edition,
    variantOf: null,
    release: {
        stage: 'draft', order: 0, reviewId: null, reviewedAt: null,
        gates: { evidence: false, patterns: false, anatomy: false, animation: false, audio: false, preview: false, simulation: false }
    },
    runtime: { profileId: id, mechanicModules: ['common'], actionManifest: `data/hunt/monster-kits/actions/${id}.json` },
    evidenceRefs: [{ kind: 'review-standard', path: 'data/hunt/monster-implementation-standard.md' }]
};
const actions = { schemaVersion: 1, id, actions: [] };
const note = `# ${nameKO} (${id})\n\n## Evidence\n\n- [ ] Source/game/action reference recorded\n- [ ] Audio route evidence recorded\n\n## Design decisions\n\n- [ ] Anatomy anchors\n- [ ] Action list and BEAT review status\n- [ ] Preview/live trace verified\n`;
const output = [
    [kitPath, `${JSON.stringify(kit, null, 2)}\n`],
    [actionPath, `${JSON.stringify(actions, null, 2)}\n`],
    [notePath, note]
];

if (dryRun) {
    output.forEach(([file]) => console.log(`[draft-kit] ${path.relative(ROOT, file)}`));
    process.exit(0);
}
output.forEach(([file, content]) => fs.writeFileSync(file, content, 'utf8'));
console.log(`[draft-kit] created ${id}; add its roster/profile deliberately before compilation`);

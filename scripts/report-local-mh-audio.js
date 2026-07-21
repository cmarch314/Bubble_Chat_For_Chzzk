#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { classifyBank } = require('./mh-audio-taxonomy');

const root = path.resolve(__dirname, '..');
const libraryRoot = path.join(root, 'local_assets', 'monster_hunter');
const games = ['wilds', 'world', 'rise'];
const rows = [];
const inventory = [];
const inputs = {
    wilds: path.join(root, 'game_extracts', 'wilds', 'natives', 'STM'),
    world: path.join(root, 'game_extracts', 'world'),
    rise: path.join(root, 'game_extracts', 'rise', 'natives', 'STM')
};

function walk(dir, result = []) {
    if (!fs.existsSync(dir)) return result;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(absolute, result);
        else result.push(absolute);
    }
    return result;
}

for (const game of games) {
    const input = inputs[game];
    for (const file of walk(input).filter(file => /\.(?:sbnk|spck)\.\d+\.x64(?:\.[a-z0-9]+)?$|\.(?:nbnk|npck|bnk|pck)$/i.test(path.basename(file)))) {
        const meta = classifyBank(file, game);
        inventory.push({
            game,
            sourceBank: path.relative(input, file).replace(/\\/g, '/'),
            bank: meta.bank,
            category: meta.category,
            identity: meta.weaponId || meta.monsterId || meta.group,
            purpose: meta.purpose,
            language: meta.language,
            weaponId: meta.weaponId,
            monsterId: meta.monsterId,
            monsterVariant: meta.monsterVariant,
            classification: meta.classification
        });
    }
}

for (const game of games) {
    const manifestPath = path.join(libraryRoot, game, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
    for (const entry of manifest.entries || []) rows.push({ ...entry, game: entry.game || game });
}

const keyOf = entry => [entry.game, entry.category, entry.weaponId || entry.monsterId || entry.group || 'common', entry.purpose || 'unclassified', entry.actionFamily || 'unclassified'].join('|');
const groups = new Map();
for (const entry of rows) {
    const key = keyOf(entry);
    if (!groups.has(key)) groups.set(key, {
        game: entry.game, category: entry.category, identity: entry.weaponId || entry.monsterId || entry.group || 'common',
        purpose: entry.purpose || 'unclassified', actionFamily: entry.actionFamily || 'unclassified', clips: 0,
        events: new Set(), sources: new Set(), banks: new Set(), confidence: new Set()
    });
    const group = groups.get(key);
    group.clips += 1;
    (entry.wwiseEventIds || []).forEach(value => group.events.add(value));
    (entry.wwiseSourceIds || []).forEach(value => group.sources.add(value));
    group.banks.add(entry.sourceBank);
    group.confidence.add(entry.classification?.level || 'unknown');
}

const catalog = [...groups.values()].map(group => ({
    ...group,
    events: [...group.events], sources: [...group.sources], banks: [...group.banks].filter(Boolean), confidence: [...group.confidence]
})).sort((a, b) => games.indexOf(a.game) - games.indexOf(b.game) || a.category.localeCompare(b.category) || a.identity.localeCompare(b.identity));

fs.mkdirSync(libraryRoot, { recursive: true });
const inventorySummary = inventory.reduce((summary, bank) => {
    summary[bank.game] ||= { total: 0, categories: {} };
    summary[bank.game].total += 1;
    summary[bank.game].categories[bank.category] = (summary[bank.game].categories[bank.category] || 0) + 1;
    return summary;
}, {});
fs.writeFileSync(path.join(libraryRoot, 'catalog.json'), `${JSON.stringify({ version: 2, generatedAt: new Date().toISOString(), clips: rows.length, inventorySummary, banks: inventory, groups: catalog }, null, 2)}\n`, 'utf8');

const markdown = [
    '# Local Monster Hunter audio catalog', '',
    `Generated: ${new Date().toISOString()}`, `Extracted banks: ${inventory.length}`, `Runtime clips: ${rows.length}`, '',
    '| Game | Category | Identity | Purpose | Action family | Clips | Banks | Events | Confidence |',
    '|---|---|---|---|---|---:|---:|---:|---|',
    ...catalog.map(group => `| ${group.game} | ${group.category} | ${group.identity} | ${group.purpose} | ${group.actionFamily} | ${group.clips} | ${group.banks.length} | ${group.events.length} | ${group.confidence.join(', ')} |`),
    ''
];
fs.writeFileSync(path.join(libraryRoot, 'catalog.md'), markdown.join('\n'), 'utf8');
console.log(`[mh-audio] cataloged ${inventory.length} extracted banks and ${rows.length} runtime clips into ${catalog.length} purpose groups.`);

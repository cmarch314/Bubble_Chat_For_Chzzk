#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DB = path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
const DEFAULT_OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'WildsWeaponProgression.generated.js');
const BONE_SERIES = -1365154048;
const EXPEDITION_SERIES = 1;
const EVIDENCE = 'installed-game-files-via-mhdb-extractor';

const SERIES_SEALS = Object.freeze({
    'Bone Tree': 'bone', 'Expedition Tree': 'iron', 'Ore Tree': 'iron', 'Workshop Tree': 'iron',
    'Vespoid Tree': 'small', 'Yian Kut-Ku Tree': 'bird', 'Quematrice Tree': 'bird',
    'Gypceros Tree': 'bird', 'Congalala Tree': 'fanged', 'Doshaguma Tree': 'fanged',
    'G. Doshaguma Tree': 'fanged', 'Blangonga Tree': 'fanged', 'Chatacabra Tree': 'fanged',
    'Rathian Tree': 'flying', 'Rathalos Tree': 'flying', 'G. Rathalos Tree': 'flying',
    'Arkveld Tree': 'flying', 'G. Arkveld Tree': 'flying', 'Seregios Tree': 'flying',
    'Hirabami Tree': 'flying', 'Rey Dau Tree': 'flying', 'G. Fulgur Tree': 'flying',
    'Rompopolo Tree': 'brute', 'Ajarakan Tree': 'brute', 'Gravios Tree': 'brute',
    'Balahara Tree': 'aquatic', 'Uth Duna Tree': 'aquatic', 'Lagiacrus Tree': 'aquatic',
    'Mizutsune Tree': 'aquatic', 'Jin Dahaad Tree': 'elder', 'Gore Magala Tree': 'elder',
    'Zoh Shia Tree': 'elder', 'G. Ebony Tree': 'elder', 'Nu Udra Tree': 'elder',
    'Lala Barina Tree': 'temnoceran', 'Nerscylla Tree': 'temnoceran',
    'Xu Wu Tree': 'cephalopod', 'Omega Tree': 'special', 'Dark Knight Tree': 'special',
    'Azure Star Tree': 'special', 'Azure Era Tree': 'special', 'Kunafa Tree': 'special',
    'Shatterseal Tree': 'special', 'Speartuna Tree': 'special', 'Felyne Tree': 'special',
    'Paralysis Tree': 'special', 'Water Element Tree': 'special', 'Unknown': 'special'
});

function arg(name, fallback) {
    const prefix = `--${name}=`;
    const value = process.argv.find(item => item.startsWith(prefix));
    return value ? value.slice(prefix.length) : fallback;
}
function parse(value, fallback) {
    if (value == null || value === '') return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
}
function kindId(kind) { return String(kind).replace(/-/g, '_'); }
function tierFor(rarity) { return Math.max(1, Math.min(4, Math.ceil(Number(rarity || 1) / 2))); }
function jsModule(entries) {
    return `'use strict';\n\nconst WILDS_WEAPON_PROGRESSION = ${JSON.stringify(entries)};\n\n`
        + `if (typeof module !== 'undefined' && module.exports) module.exports = WILDS_WEAPON_PROGRESSION;\n`
        + `else globalThis.WILDS_WEAPON_PROGRESSION = WILDS_WEAPON_PROGRESSION;\n`;
}

function validate(entries, seriesNames) {
    if (entries.length < 1000) throw new Error(`Progression catalog is unexpectedly small: ${entries.length}`);
    const unknownSeries = [...seriesNames, 'Unknown'].filter(name => !SERIES_SEALS[name]);
    if (unknownSeries.length) throw new Error(`Unmapped weapon series: ${unknownSeries.join(', ')}`);
    const byKey = new Map(entries.map(entry => [entry.key, entry]));
    const kinds = new Set(entries.map(entry => entry.kind));
    if (kinds.size !== 14) throw new Error(`Expected 14 weapon kinds, found ${kinds.size}`);
    for (const kind of kinds) {
        const roots = entries.filter(entry => entry.kind === kind && entry.starterStyle);
        for (const style of ['iron', 'bone']) {
            const starters = roots.filter(entry => entry.starterStyle === style);
            if (!starters.length) throw new Error(`${kind} has no ${style} starter`);
            const open = starters.map(entry => entry.key);
            const visited = new Set(open);
            while (open.length) {
                const current = byKey.get(open.shift());
                for (const child of current?.branches || []) if (!visited.has(child)) {
                    visited.add(child);
                    open.push(child);
                }
            }
            if (![...visited].some(key => byKey.get(key)?.tier === 4)) throw new Error(`${kind} ${style} starter cannot reach R4`);
        }
    }
}

function generate(options = {}) {
    const dbPath = path.resolve(options.dbPath || DEFAULT_DB);
    const outputPath = path.resolve(options.outputPath || DEFAULT_OUTPUT);
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const series = db.prepare('SELECT series_id, name_en FROM weapon_tree_series').all();
    const seriesById = new Map(series.map(row => [Number(row.series_id), row.name_en]));
    const branches = new Map();
    for (const edge of db.prepare('SELECT parent_key, child_key FROM weapon_tree_edges ORDER BY parent_key, child_key').all()) {
        if (!branches.has(edge.parent_key)) branches.set(edge.parent_key, []);
        branches.get(edge.parent_key).push(edge.child_key);
    }
    const entries = db.prepare('SELECT * FROM weapon_tree_nodes ORDER BY kind, tree_row, tree_column, game_id').all().map(row => {
        const seriesName = seriesById.get(Number(row.series_id)) || 'Unknown';
        const starterStyle = row.previous_key == null && Number(row.series_id) === BONE_SERIES ? 'bone'
            : row.previous_key == null && Number(row.series_id) === EXPEDITION_SERIES ? 'iron' : null;
        return {
            key: row.weapon_key,
            id: Number(row.game_id),
            kind: kindId(row.kind),
            nameKo: row.name_ko || row.name_en,
            name: row.name_en,
            rarity: Number(row.rarity),
            tier: tierFor(row.rarity),
            raw: Number(row.attack_raw || 0),
            affinity: Number(row.affinity || 0),
            defense: Number(row.defense || 0),
            sharpness: parse(row.sharpness_json, null),
            handicraft: parse(row.handicraft_json, null),
            specials: parse(row.specials_json, []),
            slots: parse(row.slots_json, []),
            skills: parse(row.skills_json, []),
            zenny: Number(row.zenny_cost || 0),
            seriesId: Number(row.series_id),
            seriesName,
            seal: SERIES_SEALS[seriesName],
            previousKey: row.previous_key || null,
            branches: branches.get(row.weapon_key) || [],
            starterStyle,
            evidence: row.evidence || EVIDENCE
        };
    });
    validate(entries, new Set(series.map(row => row.name_en)));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, jsModule(entries), 'utf8');
    db.close();
    return { entries, outputPath };
}

if (require.main === module) {
    const result = generate({ dbPath: arg('db', DEFAULT_DB), outputPath: arg('output', DEFAULT_OUTPUT) });
    const roots = result.entries.filter(entry => entry.starterStyle).length;
    console.log(`[wilds-weapon-progression] ${result.entries.length} nodes, ${roots} starters -> ${result.outputPath}`);
}

module.exports = { generate, validate, tierFor, SERIES_SEALS, BONE_SERIES, EXPEDITION_SERIES };

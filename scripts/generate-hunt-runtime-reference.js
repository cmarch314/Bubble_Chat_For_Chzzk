#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'data', 'hunt', 'wilds-game-reference.json');
const output = path.join(root, 'js', 'effects', 'hunt', 'data', 'WildsMonsterAnatomy.generated.js');

function normalizeId(value) {
    return String(value || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function build() {
    const source = JSON.parse(fs.readFileSync(input, 'utf8'));
    const monsters = {};
    for (const monster of source.monsters || []) {
        const id = normalizeId(monster.name);
        monsters[id] = {
            id,
            gameId: monster.gameId,
            nameEN: monster.name,
            baseHealth: monster.baseHealth,
            locations: monster.locations || [],
            parts: (monster.parts || []).map(part => ({
                id: part.id,
                kind: part.kind,
                health: part.health,
                breakable: Boolean(part.breakable),
                essence: part.kinsectEssence || null,
                hitzones: {
                    slash: part.multipliers?.slash ?? null,
                    blunt: part.multipliers?.blunt ?? null,
                    pierce: part.multipliers?.pierce ?? null,
                    fire: part.multipliers?.fire ?? null,
                    water: part.multipliers?.water ?? null,
                    thunder: part.multipliers?.thunder ?? null,
                    ice: part.multipliers?.ice ?? null,
                    dragon: part.multipliers?.dragon ?? null,
                    stun: part.multipliers?.stun ?? null
                }
            })),
            weaknesses: (monster.weaknesses || []).map(entry => ({
                kind: entry.kind,
                element: entry.element || null,
                status: entry.status || null,
                effect: entry.effect || null,
                level: entry.level ?? null,
                condition: entry.condition || null
            }))
        };
    }
    const payload = { version: 1, gameVersion: source.gameVersion, evidence: 'wilds-game-files-via-mhdb', monsters };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `'use strict';\nconst HUNT_WILDS_MONSTER_ANATOMY = ${JSON.stringify(payload)};\nif (typeof module !== 'undefined' && module.exports) module.exports = HUNT_WILDS_MONSTER_ANATOMY;\nelse window.HUNT_WILDS_MONSTER_ANATOMY = HUNT_WILDS_MONSTER_ANATOMY;\n`, 'utf8');
    console.log(`[hunt-runtime] generated ${Object.keys(monsters).length} compact monster anatomy profiles -> ${output}`);
    return payload;
}

if (require.main === module) build();
module.exports = { build, normalizeId };

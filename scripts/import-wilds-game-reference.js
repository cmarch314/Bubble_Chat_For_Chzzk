#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = process.argv[2] || path.join(root, 'data', 'hunt', 'wilds-game-reference.json');
const baseUrl = 'https://wilds.mhdb.io/en';

function partKey(value) {
    if (typeof value === 'string') return value;
    return value?.kind || value?.name || value?.value || null;
}

function normalizeMonster(monster) {
    const breakable = new Set();
    for (const reward of monster.rewards || []) {
        for (const condition of reward.conditions || []) {
            if (condition.kind === 'broken-part' && partKey(condition.part)) breakable.add(partKey(condition.part));
        }
    }
    const parts = (monster.parts || []).map(part => ({
        id: part.id,
        kind: partKey(part.kind) || part.part || part.name,
        health: part.health,
        kinsectEssence: part.kinsectEssence,
        multipliers: part.multipliers,
        breakable: breakable.has(partKey(part.kind) || part.part || part.name),
        evidence: 'wilds-game-files-via-mhdb'
    }));
    return {
        id: monster.id,
        gameId: monster.gameId,
        name: monster.name,
        kind: monster.kind,
        species: monster.species,
        baseHealth: monster.baseHealth,
        locations: (monster.locations || []).map(location => location.name),
        weaknesses: monster.weaknesses || [],
        resistances: monster.resistances || [],
        parts,
        breakablePartKinds: [...breakable],
        evidence: 'wilds-game-files-via-mhdb'
    };
}

function isFinalWeapon(weapon) {
    return Array.isArray(weapon?.crafting?.branches) && weapon.crafting.branches.length === 0;
}

function normalizeWeapon(weapon) {
    return {
        id: weapon.id,
        gameId: weapon.gameId,
        name: weapon.name,
        kind: weapon.kind,
        rank: weapon.rank || null,
        rarity: weapon.rarity,
        damage: weapon.damage,
        affinity: weapon.affinity,
        defenseBonus: weapon.defenseBonus,
        specials: weapon.specials || [],
        sharpness: weapon.sharpness || null,
        handicraft: weapon.handicraft || null,
        slots: weapon.slots || [],
        skills: (weapon.skills || []).map(entry => ({
            id: entry.id || entry.skill?.id,
            name: entry.name || entry.skill?.name,
            level: entry.level || null
        })),
        finalTreeNode: isFinalWeapon(weapon),
        sourceTreePosition: weapon.crafting ? { row: weapon.crafting.row, column: weapon.crafting.column } : null,
        typeData: Object.fromEntries(['shell', 'phial', 'ammo', 'coatings', 'melodies', 'notes', 'specialAmmo'].filter(key => weapon[key] != null).map(key => [key, weapon[key]])),
        evidence: 'wilds-game-files-via-mhdb'
    };
}

function normalizeItem(item) {
    return {
        id: item.id,
        gameId: item.gameId,
        name: item.name,
        rarity: item.rarity,
        carryLimit: item.carryLimit,
        value: item.value,
        description: item.description,
        icon: item.icon || null,
        evidence: 'wilds-game-files-via-mhdb'
    };
}

async function fetchAll(endpoint) {
    const pageSize = 1000;
    const output = [];
    for (let offset = 0; ; offset += pageSize) {
        const response = await fetch(`${baseUrl}/${endpoint}?limit=${pageSize}&offset=${offset}`);
        if (!response.ok) throw new Error(`${endpoint}: HTTP ${response.status}`);
        const page = await response.json();
        if (!Array.isArray(page)) throw new Error(`${endpoint}: expected an array`);
        output.push(...page);
        if (page.length < pageSize) return output;
    }
}

async function main() {
    const [versionResponse, monsters, weapons, items] = await Promise.all([
        fetch('https://wilds.mhdb.io/version'), fetchAll('monsters'), fetchAll('weapons'), fetchAll('items')
    ]);
    if (!versionResponse.ok) throw new Error(`version: HTTP ${versionResponse.status}`);
    const sourceVersion = await versionResponse.json();
    const normalizedWeapons = weapons.map(normalizeWeapon);
    const data = {
        version: 1,
        source: { title: 'Monster Hunter Wilds API', url: 'https://docs.wilds.mhdb.io/', importedAt: new Date().toISOString(), sourceVersion },
        rankPolicy: 'Wilds currently has no Master Rank; finalTreeNode means no further crafting branch in the current API data.',
        monsters: monsters.filter(monster => monster.kind === 'large').map(normalizeMonster),
        finalWeapons: normalizedWeapons.filter(weapon => weapon.finalTreeNode),
        items: items.map(normalizeItem)
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`[wilds-reference] ${data.monsters.length} large monsters, ${data.finalWeapons.length} final weapons, ${data.items.length} items -> ${outputPath}`);
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { partKey, normalizeMonster, isFinalWeapon, normalizeWeapon, normalizeItem };

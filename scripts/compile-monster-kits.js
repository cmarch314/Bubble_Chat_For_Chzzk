#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const HuntMonsterKitContract = require('../js/effects/hunt/HuntMonsterKitContract.js');
const HuntMonsterMechanicRegistry = require('../js/effects/hunt/HuntMonsterMechanicRegistry.js');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'data', 'hunt', 'monster-kits');
const ROSTER_SOURCE = path.join(ROOT, 'img', 'monsters', 'monsters.json');
const JSON_OUTPUT = path.join(ROOT, 'data', 'hunt', 'monster-release-manifest.generated.json');
const JS_OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MonsterReleaseManifest.generated.js');
const RUNTIME_INDEX_OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'ReleasedMonsterRuntimeIndex.generated.js');

function readKits(sourceDir = SOURCE_DIR) {
    return fs.readdirSync(sourceDir, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => {
            const sourcePath = path.join(sourceDir, entry.name);
            const kit = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
            HuntMonsterKitContract.assertValid(kit, path.relative(ROOT, sourcePath));
            return kit;
        });
}

function compile(kits) {
    const ids = new Set();
    const orders = new Set();
    for (const kit of kits) {
        if (ids.has(kit.id)) throw new Error(`duplicate monster kit ID: ${kit.id}`);
        ids.add(kit.id);
        if (orders.has(kit.release.order)) throw new Error(`duplicate release order: ${kit.release.order}`);
        orders.add(kit.release.order);
        for (const reference of kit.evidenceRefs) {
            if (reference.path && !fs.existsSync(path.join(ROOT, reference.path))) {
                throw new Error(`${kit.id} missing evidence path: ${reference.path}`);
            }
        }
    }
    for (const kit of kits) {
        if (kit.variantOf && !ids.has(kit.variantOf)) {
            throw new Error(`${kit.id} references missing base variant: ${kit.variantOf}`);
        }
    }
    const records = kits
        .map(kit => HuntMonsterKitContract.releaseRecord(kit))
        .filter(Boolean)
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
        .map(record => ({
            id: record.id,
            review: record.review,
            reviewedAt: record.reviewedAt,
            canonicalEdition: record.canonicalEdition,
            variantOf: record.variantOf,
            mechanicModules: [...record.mechanicModules]
        }));
    const digestInput = JSON.stringify(kits.slice().sort((a, b) => a.id.localeCompare(b.id)));
    return {
        schemaVersion: HuntMonsterKitContract.SCHEMA_VERSION,
        sourceDigest: crypto.createHash('sha256').update(digestInput).digest('hex'),
        records
    };
}

function jsonText(manifest) {
    return `${JSON.stringify(manifest, null, 2)}\n`;
}

function jsText(manifest) {
    return `'use strict';\n`
        + `const HUNT_MONSTER_RELEASE_MANIFEST = Object.freeze({\n`
        + `    schemaVersion: ${manifest.schemaVersion},\n`
        + `    sourceDigest: '${manifest.sourceDigest}',\n`
        + `    records: Object.freeze(${JSON.stringify(manifest.records, null, 4)}.map(record => Object.freeze({\n`
        + `        ...record,\n`
        + `        mechanicModules: Object.freeze([...record.mechanicModules])\n`
        + `    })))\n`
        + `});\n`
        + `if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_RELEASE_MANIFEST;\n`
        + `else globalThis.HUNT_MONSTER_RELEASE_MANIFEST = HUNT_MONSTER_RELEASE_MANIFEST;\n`;
}

function compileRuntimeIndex(manifest) {
    const roster = JSON.parse(fs.readFileSync(ROSTER_SOURCE, 'utf8'));
    const byId = new Map(roster.map(monster => [monster.id, monster]));
    const monsters = manifest.records.map(record => {
        const monster = byId.get(record.id);
        if (!monster) throw new Error(`released monster is missing from the runtime roster: ${record.id}`);
        return {
            ...monster,
            canonicalEdition: record.canonicalEdition,
            releaseReview: record.review,
            mechanicModules: [...record.mechanicModules]
        };
    });
    return {
        schemaVersion: manifest.schemaVersion,
        sourceDigest: manifest.sourceDigest,
        monsters
    };
}

function runtimeIndexText(index) {
    return `'use strict';\n`
        + `const HUNT_RELEASED_MONSTER_DATA = Object.freeze(${JSON.stringify(index.monsters, null, 4)}`
        + `.map(monster => Object.freeze(monster)));\n`
        + `if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_RELEASED_MONSTER_DATA;\n`
        + `else globalThis.HUNT_RELEASED_MONSTER_DATA = HUNT_RELEASED_MONSTER_DATA;\n`;
}

function main(args = process.argv.slice(2)) {
    const kits = readKits();
    const profiles = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntMonsterProfiles.js'));
    kits.forEach(kit => HuntMonsterMechanicRegistry.assertKit(kit, profiles[kit.id] || []));
    const manifest = compile(kits);
    const runtimeIndex = compileRuntimeIndex(manifest);
    const outputs = [
        [JSON_OUTPUT, jsonText(manifest)],
        [JS_OUTPUT, jsText(manifest)],
        [RUNTIME_INDEX_OUTPUT, runtimeIndexText(runtimeIndex)]
    ];
    if (args.includes('--check')) {
        const stale = outputs.filter(([file, content]) =>
            !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content);
        if (stale.length) {
            throw new Error(`stale monster kit outputs:\n${stale.map(([file]) => `- ${path.relative(ROOT, file)}`).join('\n')}`);
        }
    } else {
        outputs.forEach(([file, content]) => {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, content, 'utf8');
        });
    }
    console.log(`[monster-kits] ${manifest.records.length} released kits, ${manifest.sourceDigest.slice(0, 12)}`);
    return manifest;
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`[monster-kits] ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = {
    ROOT,
    SOURCE_DIR,
    ROSTER_SOURCE,
    JSON_OUTPUT,
    JS_OUTPUT,
    RUNTIME_INDEX_OUTPUT,
    readKits,
    compile,
    compileRuntimeIndex,
    jsonText,
    jsText,
    runtimeIndexText,
    main
};

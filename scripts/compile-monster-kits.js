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

function readActionManifest(kit) {
    const ref = String(kit?.runtime?.actionManifest || '').trim();
    if (!ref) return null;
    const sourcePath = path.join(ROOT, ref);
    if (!fs.existsSync(sourcePath)) throw new Error(`${kit.id} missing action manifest: ${ref}`);
    const manifest = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.id !== kit.id || !Array.isArray(manifest.actions)) {
        throw new Error(`${kit.id} has an invalid action manifest: ${ref}`);
    }
    const ids = manifest.actions.map(action => String(action?.id || ''));
    if (!ids.length || ids.some(id => !id.startsWith(`${kit.id}.`)) || new Set(ids).size !== ids.length) {
        throw new Error(`${kit.id} action manifest must contain unique local action IDs`);
    }
    if (manifest.actions.some(action => !['draft', 'migrated', 'approved'].includes(action?.reviewStatus))) {
        throw new Error(`${kit.id} action manifest has an invalid review status`);
    }
    return { ref, manifest };
}

function assertActionManifestMatchesProfile(kit, patterns = []) {
    const source = readActionManifest(kit);
    if (!source) return null;
    const byId = new Map((patterns || []).map(pattern => [pattern.id, pattern]));
    const manifestIds = new Set(source.manifest.actions.map(action => action.id));
    const profileIds = new Set((patterns || []).map(pattern => pattern.id));
    if (manifestIds.size !== profileIds.size || [...manifestIds].some(id => !profileIds.has(id))) {
        throw new Error(`${kit.id} action manifest does not match the authored profile IDs`);
    }
    source.manifest.actions.forEach(action => {
        const profile = byId.get(action.id);
        const profileStatus = profile?.beatV2Approved === true ? 'approved' : 'migrated';
        if (profileStatus !== action.reviewStatus) {
            throw new Error(`${kit.id}.${action.id} action review status disagrees with the authored profile`);
        }
    });
    return source;
}

function readGoldenTrace(kit) {
    const ref = String(kit?.runtime?.goldenTrace || '').trim();
    if (!ref) return null;
    const sourcePath = path.join(ROOT, ref);
    if (!fs.existsSync(sourcePath)) throw new Error(`${kit.id} missing golden trace: ${ref}`);
    const trace = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    if (trace.schemaVersion !== 1 || trace.monsterId !== kit.id || !trace.actions
        || typeof trace.actions !== 'object' || Array.isArray(trace.actions)) {
        throw new Error(`${kit.id} has an invalid golden trace: ${ref}`);
    }
    return { ref, trace };
}

function assertGoldenTraceMatchesProfile(kit, patterns = []) {
    const source = readGoldenTrace(kit);
    if (!source) return null;
    const approved = (patterns || []).filter(pattern => pattern.reviewStatus === 'approved'
        || pattern.beatV2Approved === true);
    const expectedIds = Object.keys(source.trace.actions).sort();
    const actualIds = approved.map(pattern => pattern.id).sort();
    if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
        throw new Error(`${kit.id} golden trace must cover every approved action exactly once`);
    }
    approved.forEach(pattern => {
        const expected = source.trace.actions[pattern.id];
        const compiled = pattern.beatV2;
        if (!compiled || Number(compiled.totalTicks) !== Number(expected.totalTicks)) {
            throw new Error(`${kit.id}.${pattern.id} golden trace duration differs from compiled BEAT`);
        }
        const events = compiled.events.map(event => [event.kind, event.beatId, event.atTicks]);
        if (JSON.stringify(events) !== JSON.stringify(expected.events)) {
            throw new Error(`${kit.id}.${pattern.id} golden trace events differ from compiled BEAT`);
        }
    });
    return source;
}

function buildCompiledProfiles() {
    global.HuntBeatV2Contract = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntBeatV2Contract.js')).HuntBeatV2Contract;
    global.HuntBeatV2Adapter = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntBeatV2Adapter.js'));
    global.HUNT_MONSTER_PATTERN_OVERRIDES = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntMonsterProfiles.js'));
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(path.join(
        ROOT, 'js', 'effects', 'hunt', 'data', 'MonsterPatternMotionOverrides.generated.js'));
    const PatternCatalog = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntMonsterPatternCatalog.js'));
    return PatternCatalog.build({});
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
    const compiledProfiles = buildCompiledProfiles();
    kits.forEach(kit => {
        const patterns = profiles[kit.id] || [];
        // Variants may deliberately inherit body-plan mechanics from the base
        // kit while retaining only their tuning/profile override locally.
        // Validate against both sources so a shared burrow or flight module is
        // not falsely rejected merely because the variant does not duplicate
        // every semantic tag in its local profile object.
        const mechanicPatterns = kit.variantOf
            ? [...patterns, ...(profiles[kit.variantOf] || [])]
            : patterns;
        HuntMonsterMechanicRegistry.assertKit(kit, mechanicPatterns);
        assertActionManifestMatchesProfile(kit, compiledProfiles[kit.id] || patterns);
        assertGoldenTraceMatchesProfile(kit, compiledProfiles[kit.id] || patterns);
    });
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
    readActionManifest,
    assertActionManifestMatchesProfile,
    readGoldenTrace,
    assertGoldenTraceMatchesProfile,
    buildCompiledProfiles,
    compile,
    compileRuntimeIndex,
    jsonText,
    jsText,
    runtimeIndexText,
    main
};

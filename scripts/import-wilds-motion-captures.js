#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DEFAULT_CAPTURE = path.join(root, 'game_extracts', 'tools', 'wilds-motion-captures.ndjson');
const DEFAULT_TIMINGS = path.join(root, 'game_extracts', 'tools', 'wilds-motion-timings.json');
const DEFAULT_COMBOS = path.join(root, 'game_extracts', 'tools', 'wilds-weapon-combos.json');
const DEFAULT_RUNTIME_MAP = path.join(root, 'data', 'hunt', 'wilds-runtime-action-map.json');
const DEFAULT_OUTPUT = path.join(root, 'data', 'hunt', 'wilds-runtime-motion-timings.json');
const DEFAULT_JS_OUTPUT = path.join(root, 'js', 'effects', 'hunt', 'data', 'WildsRuntimeMotionTimings.generated.js');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readNdjson(file) {
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
        try { return JSON.parse(line); } catch (error) { throw new Error(`${file}:${index + 1}: ${error.message}`); }
    });
}

function classNames(value) {
    return String(value || '').split('/').map(item => item.trim()).filter(Boolean);
}

function buildRuntimeIndex(runtimeMap) {
    const result = new Map();
    for (const [weaponId, actions] of Object.entries(runtimeMap.actions || {})) {
        for (const [runtimeActionId, actionClass] of Object.entries(actions || {})) {
            for (const name of classNames(actionClass)) {
                const key = `${weaponId}:${name}`;
                if (!result.has(key)) result.set(key, []);
                result.get(key).push(runtimeActionId);
            }
        }
    }
    return result;
}

function compileCaptures(captures, timings, combos, runtimeMap) {
    const runtimeIndex = buildRuntimeIndex(runtimeMap);
    const motions = new Map();
    const knownClasses = new Set();
    for (const [weaponId, weapon] of Object.entries(timings.weapons || {})) {
        for (const motion of weapon.motions || []) motions.set(`${weaponId}:${motion.motionId}`, motion);
    }
    for (const [weaponId, graph] of Object.entries(combos.weapons || {})) {
        for (const action of graph.actions || []) knownClasses.add(`${weaponId}:${action.className}`);
    }

    const observations = new Map();
    captures.forEach((capture, index) => {
        const line = index + 1;
        const weaponId = String(capture.weaponId || '');
        const actionClass = String(capture.actionClass || '');
        const motionId = Number(capture.motionId);
        if (!knownClasses.has(`${weaponId}:${actionClass}`)) throw new Error(`capture ${line}: unknown installed-game action class ${weaponId}:${actionClass}`);
        const motion = motions.get(`${weaponId}:${motionId}`);
        if (!motion) throw new Error(`capture ${line}: motion ${weaponId}:${capture.motionId} is absent from the installed motlist`);
        const runtimeActions = runtimeIndex.get(`${weaponId}:${actionClass}`) || [];
        if (!runtimeActions.length) return;
        const key = `${weaponId}:${actionClass}`;
        if (!observations.has(key)) observations.set(key, new Map());
        const byMotion = observations.get(key);
        byMotion.set(motionId, (byMotion.get(motionId) || 0) + 1);
    });

    const actions = {};
    const unresolved = [];
    for (const [key, runtimeActions] of runtimeIndex) {
        const [weaponId, actionClass] = key.split(':');
        const byMotion = observations.get(key);
        if (!byMotion || !byMotion.size) {
            unresolved.push(...runtimeActions.map(runtimeActionId => ({ weaponId, runtimeActionId, actionClass, reason: 'not-observed' })));
            continue;
        }
        if (byMotion.size !== 1) {
            unresolved.push(...runtimeActions.map(runtimeActionId => ({ weaponId, runtimeActionId, actionClass, reason: 'conflicting-motion-ids', candidates: [...byMotion.entries()] })));
            continue;
        }
        const [[motionId, observationCount]] = [...byMotion.entries()];
        const motion = motions.get(`${weaponId}:${motionId}`);
        for (const runtimeActionId of runtimeActions) {
            actions[runtimeActionId] = {
                weaponId, actionClass, motionId, internalName: motion.internalName,
                frames: motion.frames, fps: motion.fps, seconds: motion.seconds,
                observationCount,
                semanticEvidence: 'reframework-action-class+live-motion-observation',
                timingEvidence: motion.timingEvidence
            };
        }
    }
    return { actions, unresolved };
}

function main(paths = {}) {
    const capturePath = paths.capture || process.argv[2] || DEFAULT_CAPTURE;
    const outputPath = paths.output || process.argv[3] || DEFAULT_OUTPUT;
    const jsOutputPath = paths.jsOutput || process.argv[4] || DEFAULT_JS_OUTPUT;
    if (!fs.existsSync(capturePath)) throw new Error(`Motion capture log is missing: ${capturePath}`);
    const compiled = compileCaptures(
        readNdjson(capturePath),
        readJson(paths.timings || DEFAULT_TIMINGS),
        readJson(paths.combos || DEFAULT_COMBOS),
        readJson(paths.runtimeMap || DEFAULT_RUNTIME_MAP)
    );
    const data = {
        version: 1,
        game: 'Monster Hunter Wilds',
        evidencePolicy: 'Only a live action-class observation paired with an installed motlist motion ID may set runtime timing.',
        captureSource: path.relative(root, capturePath).replace(/\\/g, '/'),
        ...compiled
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    fs.mkdirSync(path.dirname(jsOutputPath), { recursive: true });
    fs.writeFileSync(jsOutputPath,
        `'use strict';\n\n// Generated by scripts/import-wilds-motion-captures.js. Do not hand-edit.\nconst HUNT_WILDS_RUNTIME_MOTION_TIMINGS = ${JSON.stringify(data)};\n\nif (typeof module !== 'undefined' && module.exports) module.exports = HUNT_WILDS_RUNTIME_MOTION_TIMINGS;\nelse window.HUNT_WILDS_RUNTIME_MOTION_TIMINGS = HUNT_WILDS_RUNTIME_MOTION_TIMINGS;\n`,
        'utf8'
    );
    console.log(`[hunt-motion] linked ${Object.keys(data.actions).length} runtime actions; ${data.unresolved.length} unresolved -> ${outputPath}`);
    return data;
}

if (require.main === module) main();
module.exports = { readNdjson, buildRuntimeIndex, compileCaptures, main };

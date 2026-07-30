#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const RUNTIME_CATALOG = path.join(ROOT, 'local_assets', 'monster_hunter', 'runtime-action-routes.js');
const AUDIO_DB = path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
const MOTION_CAPTURES = path.join(ROOT, 'game_extracts', 'tools', 'wilds-motion-captures.ndjson');
const WILDS_WEAPON_EVENTS = path.join(ROOT, 'game_extracts', 'tools', 'wilds-weapon-audio-events.json');
const WEAPONS = [
    'great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn',
    'lance', 'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive', 'light_bowgun',
    'heavy_bowgun', 'bow'
];

function loadRuntimeRoutes(file = RUNTIME_CATALOG) {
    if (!fs.existsSync(file)) return {};
    const sandbox = { globalThis: {} };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    return sandbox.globalThis.HUNT_LOCAL_WEAPON_ACTION_ROUTES || {};
}

function countCaptureRows(file = MOTION_CAPTURES) {
    if (!fs.existsSync(file)) return 0;
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(line => line.trim()).length;
}

function loadInstalledEventSummary(file = WILDS_WEAPON_EVENTS) {
    if (!fs.existsSync(file)) return { triggers: 0, hircLinked: 0, motionLinked: 0, coverage: {} };
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const links = data.triggerLinks || [];
    return {
        triggers: links.length,
        hircLinked: links.filter(link => link.sourceIds?.length).length,
        motionLinked: links.filter(link => link.motionContexts?.length).length,
        coverage: data.coverage || {}
    };
}

function loadDatabaseSummary(file = AUDIO_DB) {
    if (!fs.existsSync(file)) return { audioEvidence: [], installedActions: 0, installedMotions: 0 };
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(file, { readOnly: true });
    const audioEvidence = db.prepare(`
        SELECT game, confidence, COUNT(*) AS clips,
            SUM(CASE WHEN json_array_length(event_ids_json) > 0 THEN 1 ELSE 0 END) AS eventLinked,
            SUM(CASE WHEN json_array_length(source_ids_json) > 0 THEN 1 ELSE 0 END) AS sourceLinked,
            SUM(CASE WHEN semantic_evidence_json IS NOT NULL THEN 1 ELSE 0 END) AS semantic
        FROM audio_evidence
        WHERE owner_type = 'weapon'
        GROUP BY game, confidence
        ORDER BY game, confidence
    `).all();
    const installedActions = Number(db.prepare('SELECT COUNT(*) AS count FROM combo_actions').get().count);
    const installedMotions = Number(db.prepare(`
        SELECT COUNT(*) AS count FROM motion_timings WHERE owner_type = 'weapon'
    `).get().count);
    db.close();
    return { audioEvidence, installedActions, installedMotions };
}

function audit() {
    const HuntWeaponMechanics = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntWeaponMechanics.js'));
    const { HUNT_VERIFIED_LOCAL_WEAPON_CUES } = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntAudioCatalog.js'));
    const routes = loadRuntimeRoutes();
    const rows = WEAPONS.map(weaponId => {
        const actions = HuntWeaponMechanics.actionsFor(weaponId);
        const audible = actions.filter(action => action.audioCue && action.audioCue !== 'none');
        const cueVerified = audible.filter(action => HUNT_VERIFIED_LOCAL_WEAPON_CUES[`${weaponId}:${action.audioCue}`]);
        const heuristic = audible.filter(action => routes[action.id]);
        const genericOnly = audible.filter(action => (
            !HUNT_VERIFIED_LOCAL_WEAPON_CUES[`${weaponId}:${action.audioCue}`] && !routes[action.id]
        ));
        const routedWithIds = heuristic.filter(action => routes[action.id].some(candidate => (
            candidate.eventIds?.length && candidate.sourceIds?.length
        )));
        const probableInstalled = heuristic.filter(action => routes[action.id].some(candidate => (
            candidate.game === 'wilds' && candidate.confidence === 'probable'
                && candidate.eventIds?.length && candidate.sourceIds?.length
                && candidate.motionContexts?.length
        )));
        return {
            weaponId,
            actions: actions.length,
            audibleActions: audible.length,
            verifiedCueEligibleActions: cueVerified.length,
            verifiedCueBundles: new Set(cueVerified.map(action => action.audioCue)).size,
            heuristicActionRoutes: heuristic.length,
            heuristicRoutesWithEventAndSourceIds: routedWithIds.length,
            probableInstalledRoutes: probableInstalled.length,
            genericFallbackOnly: genericOnly.length,
            genericFallbackActionIds: genericOnly.map(action => action.id)
        };
    });
    const totals = rows.reduce((sum, row) => {
        Object.keys(sum).forEach(key => { sum[key] += row[key]; });
        return sum;
    }, {
        actions: 0,
        audibleActions: 0,
        verifiedCueEligibleActions: 0,
        verifiedCueBundles: 0,
        heuristicActionRoutes: 0,
        heuristicRoutesWithEventAndSourceIds: 0,
        probableInstalledRoutes: 0,
        genericFallbackOnly: 0
    });
    return {
        version: 2,
        policy: {
            verifiedCueEligibleActions: 'The runtime cue selects a hand-authored labelled bundle. This is cue-level evidence, not a stored action→motion→event chain.',
            heuristicActionRoutes: 'The generator matched labels and installed bank roles to a runtime action by scoring. Event/source IDs identify the clip, but do not prove that the action fired that exact event.',
            probableInstalledRoutes: 'The motion trigger, Wwise event, HIRC and source are installed-data facts; runtime action assignment remains explicitly probable.',
            genericFallbackOnly: 'No cue bundle or scored action route exists; runtime falls back to same-weapon semantic/bank evidence.'
        },
        strictExactActionChains: 0,
        strictExactDefinition: 'runtime action ID → installed action class → observed motion ID/event frame → Wwise event → HIRC branch → source ID',
        fixedVerifiedCueKeys: Object.keys(HUNT_VERIFIED_LOCAL_WEAPON_CUES).length,
        generatedActionRouteKeys: Object.keys(routes).length,
        liveWildsMotionCaptureRows: countCaptureRows(),
        installedWildsWeaponAudio: loadInstalledEventSummary(),
        database: loadDatabaseSummary(),
        totals,
        weapons: rows
    };
}

function printHuman(report) {
    console.log('[hunt-weapon-audio-precision]');
    console.table(report.weapons.map(row => ({
        weapon: row.weaponId,
        actions: row.actions,
        audible: row.audibleActions,
        cueVerified: row.verifiedCueEligibleActions,
        scoredRoute: row.heuristicActionRoutes,
        probable: row.probableInstalledRoutes,
        genericOnly: row.genericFallbackOnly
    })));
    console.log(`strict exact action chains: ${report.strictExactActionChains}`);
    console.log(`fixed verified cue keys: ${report.fixedVerifiedCueKeys}`);
    console.log(`heuristic generated route keys: ${report.generatedActionRouteKeys}`);
    console.log(`Wilds live motion capture rows: ${report.liveWildsMotionCaptureRows}`);
    console.log(`installed Wilds trigger/HIRC/source links: ${report.installedWildsWeaponAudio.hircLinked}/${report.installedWildsWeaponAudio.triggers}`);
    console.log(`installed Wilds motion-linked triggers: ${report.installedWildsWeaponAudio.motionLinked}`);
    console.log(`installed Wilds action rows: ${report.database.installedActions}`);
    console.log(`installed Wilds weapon motions: ${report.database.installedMotions}`);
}

if (require.main === module) {
    const report = audit();
    if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else printHuman(report);
}

module.exports = { loadRuntimeRoutes, countCaptureRows, loadInstalledEventSummary, loadDatabaseSummary, audit };

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
global.HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
global.HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
global.HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
global.HuntBeatV2Adapter = require('../js/effects/hunt/HuntBeatV2Adapter.js');
global.HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');
global.HuntCombatJudgmentRuntime = require('../js/effects/hunt/HuntCombatJudgmentRuntime.js');
global.HuntCombatJudgmentResolver = require('../js/effects/hunt/HuntCombatJudgmentResolver.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
global.HuntBalanceTelemetry = require('../js/effects/hunt/HuntBalanceTelemetry.js');
global.HuntBattleTickExecutor = require('../js/effects/hunt/HuntBattleTickExecutor.js');
global.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
global.HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');
global.HuntTrapConfig = require('../js/effects/hunt/HuntTrapConfig.js');
global.HuntMonsterReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntCombatRuntime = require('../js/effects/hunt/HuntCombatRuntime.js');
const golden = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hunt', 'monster-kits', 'golden', 'diablos-beat-events.json'), 'utf8'));

function hunter(index) {
    return { index, id: 'great_sword', name: `Hunter ${index + 1}`,
        hunterName: `Hunter ${index + 1}`, type: 'melee', personality: 'balanced',
        status: 'alive', hp: 10000, maxHp: 10000, atb: 0, potions: 10, sharpness: 100, perks: [] };
}

function engineConfig(patterns) {
    const noop = () => {};
    return {
        selectedWeapons: [0, 1, 2, 3].map(hunter),
        selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
        monsterTier: 'large', monsterHp: 100000, monsterMaxHp: 100000,
        monsterAtb: 0, monsterSpeed: .0001, hunterSpeedMultiplier: 0,
        random: () => .999, weaponActionSelector: { select: () => null },
        monsterPatternSelector: { tick: noop, cooldowns: new Map() },
        telemetry: { recordMonsterPattern: noop, recordHunterAction: noop, tick: noop },
        MONSTER_ATTACKS: {}, MONSTER_PATTERNS: patterns, COMBO_LIST: {},
        callbacks: new Proxy({}, { get: () => noop })
    };
}

function run(pattern, mode) {
    const patterns = HuntMonsterPatternCatalog.build({});
    const timerHarness = { callback: null, interval(callback) { this.callback = callback; return 1; }, clear() {} };
    const runtime = new HuntCombatRuntime({ Engine: HuntEngine, mode,
        timers: mode === 'live' ? timerHarness : undefined, engineConfig: engineConfig(patterns),
        // Clock transport is the subject under test here. Drive only the same
        // monster BEAT/judgment owners, not autonomous hunter decisions.
        tick: engine => {
            engine.battleTime++;
            engine.tickMonsterBeatAction();
            engine.drainCombatJudgments();
        } });
    runtime.executeMonsterPattern(pattern, { primaryTargetIndex: 1, targetIndices: [1] });
    if (mode === 'live') {
        runtime.start();
        for (let tick = 0; tick < pattern.beatV2.totalTicks + 2; tick++) timerHarness.callback();
    } else {
        runtime.start();
        runtime.step(pattern.beatV2.totalTicks + 2);
    }
    return runtime.recentTrace().filter(entry => entry.type === 'beat-event')
        .map(entry => [entry.kind, entry.beatId, entry.atTicks]);
}

const patterns = HuntMonsterPatternCatalog.build({}).diablos;
const approved = patterns.filter(pattern => pattern.reviewStatus === 'approved');
assert.deepStrictEqual(approved.map(pattern => pattern.id).sort(), Object.keys(golden.actions).sort(),
    'the release gate must cover every approved Diablos action exactly once');
for (const pattern of approved) {
    const expected = golden.actions[pattern.id];
    assert.ok(expected, `missing golden action ${pattern.id}`);
    assert.strictEqual(pattern.beatV2.totalTicks, expected.totalTicks, `${pattern.id} total BEAT duration drifted`);
    assert.deepStrictEqual(pattern.beatV2.events.map(event => [event.kind, event.beatId, event.atTicks]), expected.events,
        `${pattern.id} authored event timing drifted`);
    const previewTrace = run(pattern, 'preview');
    const liveTrace = run(pattern, 'live');
    assert.deepStrictEqual(previewTrace, expected.events, `${pattern.id} Preview trace diverged from its graph`);
    assert.deepStrictEqual(liveTrace, expected.events, `${pattern.id} live trace diverged from its graph`);
}

console.log('[test] Diablos approved BEAT golden traces passed.');

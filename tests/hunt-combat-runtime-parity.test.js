'use strict';

const assert = require('assert');

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
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntCombatRuntime = require('../js/effects/hunt/HuntCombatRuntime.js');

function hunter(index) {
    return {
        index, id: 'great_sword', name: `Hunter ${index + 1}`,
        hunterName: `Hunter ${index + 1}`, type: 'melee', personality: 'balanced',
        status: 'alive', hp: 1000, maxHp: 1000, atb: 0, potions: 10,
        sharpness: 100, perks: []
    };
}

function engineConfig(patterns) {
    const noop = () => {};
    return {
        selectedWeapons: [0, 1, 2, 3].map(hunter),
        selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
        monsterTier: 'large', monsterHp: 10000, monsterMaxHp: 10000,
        monsterAtb: 0, monsterSpeed: .0001, hunterSpeedMultiplier: 0,
        random: () => .999,
        weaponActionSelector: { select: () => null },
        monsterPatternSelector: { tick: noop, cooldowns: new Map() },
        telemetry: { recordMonsterPattern: noop, recordHunterAction: noop, tick: noop },
        MONSTER_ATTACKS: {}, MONSTER_PATTERNS: patterns, COMBO_LIST: {},
        callbacks: new Proxy({}, { get: () => noop })
    };
}

const patterns = HuntMonsterPatternCatalog.build({});
const pattern = patterns.diablos.find(candidate => candidate.id === 'diablos.horn_charge');
const totalTicks = pattern.beatV2.totalTicks + 2;

const manual = new HuntCombatRuntime({
    Engine: HuntEngine, mode: 'preview', engineConfig: engineConfig(patterns)
});
manual.start();
manual.executeMonsterPattern(pattern, { primaryTargetIndex: 1, targetIndices: [1] });
manual.step(totalTicks);

const timerHarness = {
    callback: null,
    interval(callback) { this.callback = callback; return 1; },
    clear() { this.callback = null; }
};
const automatic = new HuntCombatRuntime({
    Engine: HuntEngine, mode: 'live', timers: timerHarness, engineConfig: engineConfig(patterns)
});
automatic.executeMonsterPattern(pattern, { primaryTargetIndex: 1, targetIndices: [1] });
automatic.start();
for (let tick = 0; tick < totalTicks; tick += 1) timerHarness.callback();

const eventProjection = runtime => runtime.recentTrace()
    .filter(entry => entry.type === 'beat-event')
    .map(({ beatId, eventId, kind, atTicks }) => ({ beatId, eventId, kind, atTicks }));
assert.deepStrictEqual(eventProjection(automatic), eventProjection(manual),
    'automatic live transport and manual Preview transport must emit identical BEAT events');
assert.deepStrictEqual(
    automatic.engine.selectedWeapons.map(candidate => candidate.hp),
    manual.engine.selectedWeapons.map(candidate => candidate.hp),
    'automatic live transport and manual Preview transport must resolve identical damage');

console.log('[test] HuntCombatRuntime live/Preview BEAT parity passed.');

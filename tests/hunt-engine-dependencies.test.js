const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntTrapConfig = require('../js/effects/hunt/HuntTrapConfig.js');

assert.deepStrictEqual([1, 2, 3, 4].map(useCount => HuntTrapConfig.struggleCount(useCount)),
    [6, 3, 1, 0], 'pitfall resistance must reduce the authored struggle count');
assert.strictEqual(HuntTrapConfig.STRUGGLE_TICKS, 12,
    'each pitfall escape attempt must have a full 1.2 second authored cycle');
assert.deepStrictEqual(HuntTrapConfig.struggleSchedule(40, 1), [6, 18, 30, 42, 54, 66],
    'the first pitfall must run six non-overlapping escape attempts after entry');
assert.deepStrictEqual(HuntTrapConfig.struggleSchedule(14, 4), [],
    'the fourth pitfall must retain entry and escape without a struggle pulse');
const authoredPitfallMotion = [
    { beat: 'reaction', ticks: 6 },
    ...Array.from({ length: 6 }, (_, index) => ({ beat: `held-${index + 1}`, ticks: 12 })),
    { beat: 'release', ticks: 12 }
];
assert.deepStrictEqual(HuntTrapConfig.lifecycleFromMotion(authoredPitfallMotion, 1), {
    entryTicks: 6,
    releaseTicks: 12,
    struggleTicks: [12, 12, 12, 12, 12, 12],
    struggleSchedule: [6, 18, 30, 42, 54, 66],
    durationTicks: 90
}, 'live pitfall timing must be derived from the same authored BEAT graph as Preview');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js');
const context = vm.createContext({ console, window: {}, setTimeout, HuntTrapConfig });
context.HuntMonsterReactionCatalog = {
    resolvePitfall(monsterId, struggleCount) {
        return {
            motion: authoredPitfallMotion.filter(beat => {
                const match = /^held-(\d+)$/.exec(beat.beat);
                return !match || Number(match[1]) <= struggleCount;
            })
        };
    }
};
const atbConfigPath = path.resolve(__dirname, '../js/effects/hunt/HuntAtbConfig.js');
const rulesPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterRules.js');
const actionStatePath = path.resolve(__dirname, '../js/effects/hunt/HuntActionStateMachine.js');
const weaponMechanicsPath = path.resolve(__dirname, '../js/effects/hunt/HuntWeaponMechanics.js');
const actionSelectorPath = path.resolve(__dirname, '../js/effects/hunt/HuntWeaponActionSelector.js');
const monsterCatalogPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterPatternCatalog.js');
const monsterSelectorPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterPatternSelector.js');
const telemetryPath = path.resolve(__dirname, '../js/effects/hunt/HuntBalanceTelemetry.js');
const battleTickPath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const valstraxPath = path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js');
const monsterTurnPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const hunterTurnPath = path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js');
vm.runInContext(fs.readFileSync(atbConfigPath, 'utf8'), context, { filename: atbConfigPath });
vm.runInContext(fs.readFileSync(rulesPath, 'utf8'), context, { filename: rulesPath });
vm.runInContext(fs.readFileSync(actionStatePath, 'utf8'), context, { filename: actionStatePath });
vm.runInContext(fs.readFileSync(weaponMechanicsPath, 'utf8'), context, { filename: weaponMechanicsPath });
vm.runInContext(fs.readFileSync(actionSelectorPath, 'utf8'), context, { filename: actionSelectorPath });
vm.runInContext(fs.readFileSync(monsterCatalogPath, 'utf8'), context, { filename: monsterCatalogPath });
vm.runInContext(fs.readFileSync(monsterSelectorPath, 'utf8'), context, { filename: monsterSelectorPath });
vm.runInContext(fs.readFileSync(telemetryPath, 'utf8'), context, { filename: telemetryPath });
vm.runInContext(fs.readFileSync(battleTickPath, 'utf8'), context, { filename: battleTickPath });
vm.runInContext(fs.readFileSync(valstraxPath, 'utf8'), context, { filename: valstraxPath });
vm.runInContext(fs.readFileSync(monsterTurnPath, 'utf8'), context, { filename: monsterTurnPath });
vm.runInContext(fs.readFileSync(hunterTurnPath, 'utf8'), context, { filename: hunterTurnPath });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntEngine = HuntEngine;`;
vm.runInContext(source, context, { filename: sourcePath });

const scheduled = [];
const randomValues = [0, 0.99];
const random = () => randomValues.shift() ?? 0;
const schedule = (callback, delay) => scheduled.push({ callback, delay });
const engine = new context.HuntEngine({
    selectedWeapons: [],
    selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
    random,
    schedule,
    MONSTER_ATTACKS: { default: ['공격'] },
    COMBO_LIST: {},
    callbacks: {}
});

assert.strictEqual(engine.timeLimit, 480, 'default hunt time limit must be eight minutes');
assert.strictEqual(engine.combatGatherLimit, 3, 'the whole party must share exactly three combat gathering opportunities');
assert.deepStrictEqual([
    engine.tryConsumeCombatGather(), engine.tryConsumeCombatGather(), engine.tryConsumeCombatGather(), engine.tryConsumeCombatGather()
], [true, true, true, false], 'the fourth party combat-gather attempt must be rejected');
engine.combatGatherCount = 0;
assert.strictEqual(engine.random, random);
assert.strictEqual(engine.schedule, schedule);

{
    const roarEvents = [];
    const extraAudio = [];
    const roarEngine = new context.HuntEngine({
        selectedWeapons: [],
        selectedMonster: {
            id: 'rathalos',
            nameKO: '리오레우스',
            roar: { status: 'verified-present' }
        },
        monsterTier: 'large',
        random: () => 0.99,
        MONSTER_ATTACKS: { default: ['공격'] },
        COMBO_LIST: {},
        callbacks: {
            onTriggerMonsterRoar: monster => roarEvents.push(monster.id),
            onPlayAudioFile: path => extraAudio.push(path)
        }
    });
    assert.strictEqual(roarEngine.triggerMonsterRoarFlinch(true), true);
    assert.strictEqual(roarEngine.triggerMonsterRoarFlinch(false), true);
    assert.deepStrictEqual(roarEvents, ['rathalos', 'rathalos'],
        'encounter and rage roars must each emit exactly one monster-roar event');
    assert.deepStrictEqual(extraAudio, [],
        'roars must not layer the legacy Encounter music cue beneath the monster voice');
    assert.strictEqual(roarEngine.triggerMonsterRoarFlinch(false, { actionOwned: true }), true);
    assert.strictEqual(roarEngine.monsterRoarDuration, 0,
        'an approved BEAT roar must not create a second fixed-duration monster lock');
}

assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntBattleTickExecutor\.execute\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntValstraxExecutor\.executeChargeSuccess\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntMonsterTurnExecutor\.prepare\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntMonsterTurnExecutor\.execute\(this, pattern, attackerIndex, targetIndex\)/,
    'monster turns must preserve the reserved small-monster attacker and telegraphed target identities');
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntHunterTurnExecutor\.execute\(this, w\)/);
assert.doesNotMatch(
    fs.readFileSync(valstraxPath, 'utf8'),
    /\bthis\./,
    'Valstrax executor must receive engine state explicitly'
);
assert.doesNotMatch(
    fs.readFileSync(battleTickPath, 'utf8'),
    /\bthis\./,
    'battle tick executor must receive engine state explicitly'
);
assert.doesNotMatch(fs.readFileSync(battleTickPath, 'utf8'), /w\.speedGroup\s*===/,
    'weapon speed groups must not compound motion-value-derived action occupancy');
assert.doesNotMatch(
    fs.readFileSync(monsterTurnPath, 'utf8'),
    /\bthis\./,
    'monster turn executor must receive engine state explicitly'
);
assert.doesNotMatch(
    fs.readFileSync(hunterTurnPath, 'utf8'),
    /\bthis\./,
    'hunter turn executor must receive engine state explicitly'
);
assert.strictEqual(
    vm.runInContext("HuntHunterTurnExecutor.preparationAudioCue({ id: 'insect_glaive.extract_red', audioCue: 'none' })", context),
    'kinsect_extract'
);
assert.strictEqual(
    vm.runInContext("HuntHunterTurnExecutor.preparationAudioCue({ id: 'light_bowgun.reload', audioCue: 'none' })", context),
    'reload'
);
assert.strictEqual(
    vm.runInContext("HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.charge_1', audioCue: 'none' })", context),
    'charge_tier_1'
);
assert.deepStrictEqual(
    JSON.parse(vm.runInContext("JSON.stringify([0.12, 0.34, 0.62].map(value => HuntHunterTurnExecutor.combatGatherFind(() => value).kind))", context)),
    ['ore', 'mushroom', 'insect'],
    'combat gathering must include ore, mushroom, and insect nodes'
);
assert.deepStrictEqual(
    JSON.parse(vm.runInContext("JSON.stringify([0, 0.35, 0.699].map(value => HuntHunterTurnExecutor.combatGatherFind(() => value, 'support').kind))", context)),
    ['herb', 'herb', 'herb'],
    'only support hunters should receive the 70% herb-gathering priority'
);
assert.notStrictEqual(
    vm.runInContext("HuntHunterTurnExecutor.combatGatherFind(() => 0.71, 'support').kind", context),
    'herb',
    'support herb priority must remain weighted rather than guaranteed'
);
assert.deepStrictEqual(
    JSON.parse(vm.runInContext("JSON.stringify((() => { const find = HuntHunterTurnExecutor.combatGatherFind(() => 0.72); return { item: find.item, emoji: find.emoji, visualVariant: find.visualVariant, color: find.color }; })())", context)),
    { item: '광충', emoji: '🪲', visualVariant: 'flashbug', color: '#ffe45c' },
    'Flashbug gathering must use a yellow-filtered beetle visual and retain its exact label'
);
assert.strictEqual(vm.runInContext("HuntHunterTurnExecutor.applyGatherReward(globalThis.__flashHunter = {}, { item: '광충' })", context), ' · 섬광탄 1개 조제');
assert.strictEqual(vm.runInContext("globalThis.__flashHunter.flashPods", context), 1, 'gathered Flashbugs must craft one usable flash pod');
const combatAnimatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const huntRuntimeCss = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');
assert.match(combatAnimatorSource, /options\.variant === 'flashbug'[\s\S]{0,100}?hunt-gather-flashbug/,
    'the internal Flashbug marker must reach the floating weapon-image visual');
assert.match(huntRuntimeCss, /\.victory-emoji-bubble\.hunt-gather-flashbug\s*\{[\s\S]*?sepia\(1\)[\s\S]*?saturate\(6\)[\s\S]*?brightness\(1\.35\)/,
    'the Flashbug beetle must receive an explicit bright yellow filter');
assert.strictEqual(vm.runInContext("HuntHunterTurnExecutor.applyGatherReward(globalThis.__thunderHunter = {}, { item: '뇌광충' })", context), ' · 마비함정 1개 조제');
assert.strictEqual(vm.runInContext("globalThis.__thunderHunter.shockTraps", context), 1, 'gathered Thunderbugs must craft one usable shock trap');
assert.deepStrictEqual([
    engine.consumeTrapDuration(40), engine.consumeTrapDuration(40), engine.consumeTrapDuration(40), engine.consumeTrapDuration(40)
], [86, 50, 26, 14], 'repeated traps must shorten by removing full struggle cycles while preserving entry and escape');
engine.monsterTrapUseCount = 0;
engine.monsterAtb = -80;
const firstTrap = engine.beginMonsterTrapControl('trap', 40);
assert.strictEqual(firstTrap.durationTicks, 90,
    'the first pitfall must reserve the complete authored entry, six struggles, and 1.2 second escape');
assert.strictEqual(firstTrap.releaseTicks, 12,
    'the live release and trap fade must use the Preview-authored release duration');
assert.deepStrictEqual(Array.from(engine.activeTrapControl.struggleSchedule), [6, 18, 30, 42, 54, 66],
    'the live struggle events must begin at the authored BEAT boundaries');
assert.strictEqual(engine.activeTrapControl.kind, 'pitfall',
    'the generic live-hunt trap item must deploy the default pitfall without save-key churn');
assert.strictEqual(HuntTrapConfig.normalizeKind('shocktrap'), 'shocktrap',
    'an explicit paralysis trap must remain a distinct future item kind');
assert.strictEqual(engine.monsterAtb, 50,
    'first trap entry must replace action debt with a fixed half gauge');
assert.strictEqual(engine.activeTrapControl.retainedAtb, 50,
    'trap visuals and ATB recovery must share one lifecycle record');
const authoredRepeatedDurations = [firstTrap.durationTicks];
for (let use = 2; use <= 4; use++) {
    engine.activeTrapControl = null;
    engine.monsterKnockdownDuration = 0;
    authoredRepeatedDurations.push(engine.beginMonsterTrapControl('pitfall', 40).durationTicks);
}
assert.deepStrictEqual(authoredRepeatedDurations, [90, 54, 30, 18],
    'resistance may remove struggles, but every live use must preserve the authored entry and release');
engine.activeTrapControl = null;
engine.monsterTrapUseCount = 0;
assert.match(fs.readFileSync(hunterTurnPath, 'utf8'), /action: 'weapon_preparation'/,
    'non-damaging weapon mechanics must still route a same-weapon preparation layer');
assert.strictEqual(engine.getPreviousMonsterMaterial('화룡'), '화룡의 비늘');
assert.strictEqual(engine.getPreviousMonsterMaterial('화룡'), '화룡의 꼬리뼈');

engine.schedule(() => {}, 2500);
assert.strictEqual(scheduled.length, 1);
assert.strictEqual(scheduled[0].delay, 2500);

{
    const deathEvents = [];
    const cartHunter = {
        index: 0, id: 'great_sword', name: '대검', hunterName: 'Cart Tester', status: 'alive',
        hp: 10, maxHp: 100, atb: 100, potions: 10, sharpness: 100, perks: []
    };
    const cartEngine = new context.HuntEngine({
        selectedWeapons: [cartHunter],
        selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
        random: () => 0.99,
        MONSTER_ATTACKS: { default: ['공격'] },
        COMBO_LIST: {},
        callbacks: { onTriggerDeathTag: (...args) => deathEvents.push(args) }
    });
    let whetstoneCancelled = 0;
    cartEngine.callbacks.onCancelWhetstoneCue = () => { whetstoneCancelled++; };
    cartHunter.pendingSharpnessRestore = true;
    cartHunter.itemDuration = 20;
    assert.strictEqual(cartEngine.triggerHunterCart(cartHunter), true);
    assert.strictEqual(cartHunter.pendingSharpnessRestore, false, 'carting must cancel pending sharpness restoration');
    assert.strictEqual(cartHunter.itemDuration, 0, 'carting must clear the remaining item lock');
    assert.strictEqual(whetstoneCancelled, 1, 'carting must invalidate delayed whetstone audio');
    assert.deepStrictEqual(
        deathEvents,
        [[0, context.HuntEngine.CART_CAMP_TICKS / 10]],
        'cart presentation must fire immediately with its real recovery time'
    );
    assert.strictEqual(cartEngine.triggerHunterCart(cartHunter), false, 'the same faint must not create duplicate cart animations');
    assert.strictEqual(deathEvents.length, 1);
}

const directGlobalCalls = fs.readFileSync(sourcePath, 'utf8')
    .replace(/config\.random \|\| Math\.random/, '')
    .replace(/setTimeout\(callback, delay\)/, '');
assert.doesNotMatch(directGlobalCalls, /Math\.random\(\)|setTimeout\(/);

console.log('[test] HuntEngine deterministic dependency contract passed.');

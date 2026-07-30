const assert = require('assert');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.window = global;
require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');

const rathalosPatterns = global.HUNT_MONSTER_PATTERN_OVERRIDES.rathalos;
const rathalosRoar = rathalosPatterns.find(pattern => pattern.type === 'roar');
const rathalosAttacks = rathalosPatterns.filter(pattern => pattern.type !== 'roar');
assert.strictEqual(HuntAtbConfig.monsterActionCostGauge(rathalosRoar), 50,
    'Rathalos roar is interference, not an attack, and must keep its authored ATB cost');
assert.ok(rathalosAttacks.length >= 8);
for (const pattern of rathalosAttacks) {
    assert.strictEqual(pattern.monsterAtbCostMultiplier, 1.10, `${pattern.id} needs the Rathalos pacing multiplier`);
    assert.strictEqual(
        HuntAtbConfig.monsterActionCostGauge(pattern),
        Number((pattern.monsterAtbCost * 100 * 1.10).toFixed(6)),
        `${pattern.id} must spend ten percent more monster ATB`
    );
}

const catalog = HuntMonsterPatternCatalog.build({
    test_monster: ['괴수의 포효', '돌진 몸통박치기', '화염 브레스', '대재앙 대폭발']
});
assert.deepStrictEqual(HuntMonsterPatternCatalog.validate(catalog), []);
assert.strictEqual(catalog.test_monster[0].type, 'roar');
assert.strictEqual(catalog.test_monster[0].damageRatio, 0);
assert.strictEqual(catalog.test_monster[1].type, 'charge');
assert.ok(catalog.test_monster[3].damageRatio > catalog.test_monster[1].damageRatio);
assert.ok(catalog.test_monster[3].recoveryTicks > catalog.test_monster[1].recoveryTicks);
assert.strictEqual(catalog.test_monster[3].damageRatio, 0.90);
assert.strictEqual(catalog.test_monster[3].minTargets, 4);
assert.strictEqual(catalog.test_monster[3].maxTargets, 4);
assert.strictEqual(HuntMonsterPatternCatalog.displayName('리오레우스 화염구 브레스', {
    id: 'rathalos', nameKO: '리오레우스', nameEN: 'Rathalos'
}), '화염구 브레스');
assert.strictEqual(HuntMonsterPatternCatalog.displayName('화룡의 포효', {
    id: 'rathalos', nameKO: '리오레우스', nameEN: 'Rathalos'
}), '포효');
assert.strictEqual(HuntMonsterPatternCatalog.displayName('파멸의 일격', {
    id: 'nergigante', nameKO: '네르기간테'
}), '파멸의 일격', 'ordinary move grammar must not be mistaken for a monster title');

const selector = new HuntMonsterPatternSelector(() => 0);
const monster = { id: 'test_monster' };
const first = selector.select(monster, catalog.test_monster, { state: 'normal' });
const second = selector.select(monster, catalog.test_monster, { state: 'normal' });
assert.notStrictEqual(first.id, second.id, 'the selector should not immediately repeat a pattern');
assert.ok(!first.tags.includes('ultimate'), 'ultimates should be reserved for enraged state when alternatives exist');

const smallSelector = new HuntMonsterPatternSelector(() => 0);
const smallPick = smallSelector.select(monster, catalog.test_monster, { state: 'normal', monsterTier: 'small' });
assert.notStrictEqual(smallPick.type, 'roar', 'small monsters must never select roar patterns');

const pitySelector = new HuntMonsterPatternSelector(() => 0.99);
let pityPick = null;
for (let turn = 0; turn < 5; turn++) {
    pitySelector.cooldowns.clear();
    pityPick = pitySelector.select(monster, catalog.test_monster, { state: 'enraged', hpRatio: .5 });
}
assert.ok(pityPick.tags.includes('ultimate'), 'an enraged monster must use its available ultimate by the fifth eligible turn');
const postUltimate = pitySelector.select(monster, catalog.test_monster, {
    state: 'enraged', hpRatio: .5, ultimateUsedInRage: true
});
assert.ok(!postUltimate.tags.includes('ultimate'), 'an ultimate may occur only once in the same rage phase');

const curated = HuntMonsterPatternCatalog.build({ rathalos: ['placeholder'] }).rathalos;
assert.strictEqual(curated.length, 12);
for (const retired of ['triple_fireball', 'step_fireball', 'air_kick_combo', 'flame_sweep']) {
    assert.ok(!curated.some(pattern => pattern.id === `rathalos.${retired}`),
        `${retired} must stay out of the World-style original Rathalos kit`);
}
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.fireball').damageRatio, 0.50);
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.fireball').delivery, 'projectile',
    'Rathalos single fireball must never route through a beam or stream visual');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.fireball').originPart, 'head',
    'Rathalos fireballs must launch from the measured lower-left head anchor');
assert.ok(curated.find(pattern => pattern.id === 'rathalos.fireball').tags.includes('ground-only'));
assert.ok(curated.find(pattern => pattern.id === 'rathalos.aerial_fireball').tags.includes('flight-only'));
assert.ok(curated.find(pattern => pattern.id === 'rathalos.aerial_tail_sweep').tags.includes('flight-only'));
assert.ok(curated.find(pattern => pattern.id === 'rathalos.hop_stomp').tags.includes('ground-only'));
assert.deepStrictEqual(
    curated.find(pattern => pattern.id === 'rathalos.fireball').brokenPartDamageModifiers,
    { head: 0.60 },
    'a broken head must reduce the single fireball from 50% to 30%'
);
assert.strictEqual(HuntMonsterTurnExecutor.monsterAttackAccuracy(
    curated.find(pattern => pattern.id === 'rathalos.fireball'),
    { monsterPartState: [{ kind: 'head', broken: true }] }
), .75, 'a broken Rathalos head must reduce fireball accuracy by 25%');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.tail_sweep').impactTimeline, null,
    'original Rathalos uses a single tail sweep action rather than a fabricated double combo');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.tail_sweep').brokenPartDamageModifiers.tail, 0.50);
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').flightTransition, 'takeoff',
    'backstep breath must preserve its data-driven transition into flight');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').damageRatio, 0.70);
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').delivery, 'projectile',
    'Rathalos backstep breath must remain a detached fireball');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').originPart, 'head',
    'the backstep breath must share the measured head launch anchor');
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').brokenPartDamageModifiers.head, 0.50);
assert.deepStrictEqual(curated.find(pattern => pattern.id === 'rathalos.backstep_fireball').secondaryInterference,
    { kind: 'wind', size: 'large' });
{
    const openerEngine = {
        selectedMonster: { id: 'rathalos' },
        MONSTER_PATTERNS: { rathalos: curated },
        monsterTier: 'large',
        monsterState: 'enraged',
        monsterFlightState: 'grounded',
        monsterHp: 100,
        monsterMaxHp: 100,
        monsterUltimateUsedInRage: false,
        monsterPartState: [],
        forcedMonsterPatternId: 'rathalos.backstep_fireball',
        monsterPatternSelector: new HuntMonsterPatternSelector(() => .99)
    };
    assert.strictEqual(
        HuntMonsterTurnExecutor.selectPattern(openerEngine).id,
        'rathalos.backstep_fireball',
        'rage entry must force the reviewed backstep-breath takeoff before random selection'
    );
    assert.strictEqual(openerEngine.forcedMonsterPatternId, null);
}
{
    const glide = curated.find(pattern => pattern.id === 'rathalos.glide');
    assert.strictEqual(glide.chargeMode, 'wide',
        'Rathalos glide must remain distinct from a target-contact Diablos charge');
    assert.strictEqual(glide.targeting.mode, 'screen-sweep');
    assert.deepStrictEqual([glide.minTargets, glide.maxTargets], [4, 4]);
    assert.deepStrictEqual(glide.impactTimeline.map(event => event.atTicks), [12, 16, 20, 24],
        'the non-DOM fallback must reserve the off-screen entry and exit portions of the crossing');
    assert.strictEqual(glide.animationProfile, 'aerial-charge-cross');
}
assert.ok(curated.every(pattern => !pattern.tags.includes('ultimate')),
    'Rathalos ordinary aerial combos must not be promoted into a fabricated ultimate');
{
    const aerialSelector = new HuntMonsterPatternSelector(() => .99);
    const stomp = curated.find(pattern => pattern.id === 'rathalos.stomp');
    const glide = curated.find(pattern => pattern.id === 'rathalos.glide');
    assert.strictEqual(aerialSelector.select(
        { id: 'rathalos' },
        [stomp, glide],
        { state: 'enraged', hpRatio: 1, flightState: 'airborne', landingPending: false }
    ).id, 'rathalos.glide', 'landing stomp must not end an ordinary flight action early');
}
{
    const repeatSelector = new HuntMonsterPatternSelector(() => 0);
    const weakBite = curated.find(pattern => pattern.id === 'rathalos.bite');
    const rush = curated.find(pattern => pattern.id === 'rathalos.rush');
    const repeated = Array.from({ length: 4 }, () => {
        repeatSelector.cooldowns.clear();
        return repeatSelector.select(
            { id: 'rathalos' },
            [weakBite, rush],
            { state: 'normal', hpRatio: 1, flightState: 'grounded' }
        ).id;
    });
    assert.deepStrictEqual(repeated, [
        'rathalos.bite', 'rathalos.bite', 'rathalos.bite', 'rathalos.rush'
    ], 'a weak move may repeat up to three times, then yield to another pattern');
    assert.strictEqual(weakBite.maxConsecutiveUses, 3);
}
for (const monsterId of ['gore_magala', 'seregios', 'mizutsune', 'lagiacrus']) {
    const extracted = HuntMonsterPatternCatalog.build({})[monsterId];
    assert.strictEqual(extracted.length, 5, `${monsterId} needs a compact extracted pattern kit`);
    assert.ok(extracted.every(pattern => pattern.sourceActionClass && pattern.evidence === 'installed-game-action-class'));
}
const pilotCatalog = HuntMonsterPatternCatalog.build({});
for (const monsterId of ['bazelgeuse', 'chameleos', 'rathian', 'rathalos', 'diablos']) {
    const patterns = pilotCatalog[monsterId];
    assert.ok(patterns.length >= 7, `${monsterId} needs a recognizable pilot kit`);
    assert.ok(patterns.every(pattern =>
        pattern.evidence === 'verified-complete-action'
        && (/^https:\/\//.test(pattern.sourceUrl)
            || pattern.sourceUrl === 'data/hunt/research/world-iceborne-flying-wyverns.json')
        && !pattern.tags.includes('ultimate')),
    `${monsterId} must use sourced complete actions without a fabricated ultimate`);
}
assert.ok(pilotCatalog.black_diablos.every(pattern =>
    pattern.runtimePolicy === 'reviewed-variant-kit'
    && pattern.id.startsWith('black_diablos.')),
'Black Diablos must use its distinct reviewed variant tuning instead of the normal Diablos values');
assert.strictEqual(pilotCatalog.chameleos.find(pattern => pattern.id === 'chameleos.poison_mist').delivery, 'gas');
const exhaustedBazelSelector = new HuntMonsterPatternSelector(() => 0);
const exhaustedBazel = exhaustedBazelSelector.select({ id: 'bazelgeuse' }, [
    pilotCatalog.bazelgeuse.find(pattern => pattern.id === 'bazelgeuse.fire_breath'),
    pilotCatalog.bazelgeuse.find(pattern => pattern.id === 'bazelgeuse.bite')
], { state: 'exhausted', flightState: 'grounded' });
assert.strictEqual(exhaustedBazel.id, 'bazelgeuse.bite', 'exhausted Bazelgeuse must fail to use its breath');
const brokenEngine = { monsterPartState: [{ id: 'head', kind: 'head', broken: true }] };
const diablosBurrowEnter = pilotCatalog.diablos.find(pattern => pattern.id === 'diablos.burrow_enter');
assert.ok(diablosBurrowEnter?.tags.includes('burrow-enter'), 'Diablos must spend a separate action entering the ground');
assert.strictEqual(diablosBurrowEnter.damageRatio, 0, 'entering the ground must not deal the ambush hit');
const brokenHornEngine = { monsterPartState: [{ id: 'left-horn', kind: 'left-horn', broken: true }] };
assert.strictEqual(HuntMonsterTurnExecutor.brokenPartDamageModifier(
    brokenHornEngine,
    diablosBurrowEnter
), 0.89, 'each broken Diablos horn must weaken the later uppercut');
assert.strictEqual(HuntMonsterTurnExecutor.brokenHornCount({
    monsterPartState: [
        { kind: 'left-horn', broken: true },
        { kind: 'right-horn', broken: true }
    ]
}), 2, 'both Diablos horns must be tracked independently');
const severedTailEngine = { monsterPartState: [{ id: 'tail', kind: 'tail', severed: true }] };
assert.strictEqual(HuntMonsterTurnExecutor.effectiveTargetCap(
    severedTailEngine,
    pilotCatalog.rathalos.find(pattern => pattern.id === 'rathalos.tail_sweep')
), 1, 'a severed Rathalos tail must shorten the sweep reach');
const valstraxPatterns = HuntMonsterPatternCatalog.build({ valstrax: ['placeholder'] }).valstrax;
assert.ok(!valstraxPatterns.some(pattern => pattern.id === 'valstrax.ambush'),
    'Crimson Comet Ambush must exist only in the dedicated disappear-and-land state machine');
const rosterFallback = HuntMonsterPatternCatalog.build({}, [
    { id: 'anjanath', nameKO: '안쟈나프' },
    { id: 'jagras', nameKO: '쟈그라스' }
]);
assert.ok(rosterFallback.anjanath.length >= 5);
assert.strictEqual(rosterFallback.jagras.length, 3);
assert.ok(rosterFallback.anjanath.every(pattern =>
    pattern.evidence === 'mhrice-installed-move-table'
    || pattern.evidence.startsWith('installed-game-action-id+action-param')));
assert.ok(rosterFallback.jagras.every(pattern =>
    pattern.evidence === 'kiranico-rise-installed-attack-move-table'));
assert.ok(rosterFallback.anjanath.every(pattern => !pattern.name.startsWith('안쟈나프 ')),
    'generated fallback move names must not repeat the monster name');
const variants = HuntMonsterPatternCatalog.build({});
assert.ok(variants.silver_rathalos.length >= 5);
assert.ok(variants.silver_rathalos.every(pattern =>
    pattern.sourceGame === 'world_iceborne'
    && !pattern.evidence.startsWith('species-archetype:')),
    'Silver Rathalos must use its reviewed World variant kit instead of a species fallback');
assert.ok(HuntMonsterPatternCatalog.build({}).acidic_glavenus
    .every(pattern => pattern.evidence === 'mhw-executable-action-enumeration'));

require('../js/effects/MonsterData.js');
const fullRosterCatalog = HuntMonsterPatternCatalog.build({}, window.MONSTER_DATA);
assert.strictEqual(Object.keys(fullRosterCatalog).length, window.MONSTER_DATA.length);
assert.deepStrictEqual(HuntMonsterPatternCatalog.validate(fullRosterCatalog), []);
for (const entry of window.MONSTER_DATA) {
    const runtimeId = entry.id.replace(/[-']/g, '_');
    const entryPatterns = fullRosterCatalog[runtimeId] || [];
    const exactSourceKit = entryPatterns.length > 0 && entryPatterns.every(pattern =>
        !pattern.evidence?.startsWith('species-archetype:'));
    assert.ok(entryPatterns.length >= (exactSourceKit ? 1 : 3),
        `${entry.id} needs its complete installed move table or a three-action fallback kit`);
    const ultimate = entryPatterns.find(pattern => pattern.tags?.includes('ultimate'));
    if (ultimate) {
        assert.strictEqual(ultimate.damageRatio, 0.90, `${entry.id} signature ultimate must deal 90% max HP`);
        assert.deepStrictEqual([ultimate.minTargets, ultimate.maxTargets], [4, 4], `${entry.id} ultimate must target the full party`);
    }
}
const publishedIds = Object.keys(global.HUNT_PUBLISHED_MONSTER_BEHAVIOR);
assert.strictEqual(publishedIds.length, 32, 'every remaining non-extracted monster needs a documented behavior kit');
for (const monsterId of publishedIds) {
    const patterns = fullRosterCatalog[monsterId];
    assert.ok(patterns?.length >= 2, `${monsterId} needs at least two documented behaviors`);
    assert.ok(patterns.every(pattern =>
        pattern.evidence === 'published-behavior-description'
        && /^https:\/\//.test(pattern.sourceUrl)
        && pattern.adaptation === 'bubblechat-autobattler-timing-and-damage'),
    `${monsterId} must preserve published behavior provenance separately from adapted balance`);
    const monster = window.MONSTER_DATA.find(row => row.id.replace(/[-']/g, '_') === monsterId);
    if (monster?.tier === 'small') {
        assert.ok(patterns.every(pattern => pattern.type !== 'roar' && !pattern.tags.includes('roar')),
            `${monsterId} must not receive a fabricated small-monster roar`);
    }
}

console.log('[test] Hunt monster pattern catalog and selector passed.');

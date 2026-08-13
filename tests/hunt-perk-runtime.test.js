const assert = require('assert');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
global.HuntPersonalityProfiles = require('../js/effects/hunt/HuntPersonalityProfiles.js');
const HuntIssuedSupplyRuntime = require('../js/effects/hunt/HuntIssuedSupplyRuntime.js');

const events = [];
const engine = {
    random: () => 0,
    addLog: text => events.push(text),
    updateHpUI() {}, updateWeaponAtbUI() {}, updatePotionCountUI() {}, showSkillBubble() {}
};
const runtime = new HuntPerkRuntime(engine);
const camper = {
    index: 0, id: 'great_sword', type: 'melee', hunterName: 'CAMPER', hp: 100, maxHp: 100,
    sharpness: 100, potions: 10, lifepowders: 1, atb: 0,
    perks: [{ name: '캠프 수호자' }, { name: '체력 증강' }, { name: '장인' }]
};
runtime.initialize(camper);
assert.strictEqual(camper.isAtCamp, true);
assert.strictEqual(camper.maxHp, 120);
assert.strictEqual(camper.hp, 120);
assert.strictEqual(camper.maxSharpness, 120);
assert.strictEqual(runtime.canAct(camper), false);
assert.strictEqual(runtime.isTargetable(camper), false);
assert.strictEqual(camper.perkCampTicks, 320, 'camp guardian must spend a dramatic 32 seconds resupplying');
for (let tick = 0; tick < 320; tick++) runtime.tick(camper);
assert.strictEqual(camper.isAtCamp, false);
assert.strictEqual(camper.hp, 120);
assert.strictEqual(camper.atb, 70);
assert.ok(events.some(text => text.includes('캠프 합류')));
assert.strictEqual(runtime.ammoCost({ perks: [{ name: '탄환 절약' }] }, 1), 0);
assert.strictEqual(runtime.stunValue({ perks: [{ name: 'KO술' }] }, 100), 130);
assert.strictEqual(runtime.roarDuration({ perks: [{ name: '귀마개' }] }, 45), 0);
assert.strictEqual(runtime.healAmount({ perks: [{ name: '체력 회복량 UP' }] }, 40), 50);
const affinityHunter = {
    id: 'long_sword', hp: 100, maxHp: 100, atb: 0,
    weaponInstance: { affinity: 20 }, perks: []
};
assert.strictEqual(runtime.outgoingDamage(affinityHunter, {}, 100), 125,
    'weapon affinity must drive the same real critical-hit chance shown in the hunter HUD');
assert.strictEqual(affinityHunter.lastAttackCritical, true,
    'the resolved affinity roll must be exposed to the impact renderer');
const ordinaryHunter = { id: 'long_sword', hp: 100, maxHp: 100, atb: 0, perks: [] };
engine.random = () => .99;
assert.strictEqual(runtime.outgoingDamage(ordinaryHunter, {}, 100), 100);
assert.strictEqual(ordinaryHunter.lastAttackCritical, false,
    'ordinary hits must explicitly clear the transient critical marker');

const lost = { index: 1, hunterName: 'LOST', hp: 100, maxHp: 100, potions: 10, sharpness: 100, atb: 0, perks: [{ name: '길치' }] };
runtime.initialize(lost);
assert.strictEqual(lost.isAtCamp, true);
assert.strictEqual(lost.perkCampTicks, 100, 'lost hunters must remain absent for the four-times-longer camp delay');
for (let tick = 0; tick < 100; tick++) runtime.tick(lost);
assert.strictEqual(lost.isAtCamp, false);
assert.ok(events.some(text => text.includes('길치 합류')));

const statusHunter = {
    hunterName: 'VIPER', perks: [{ name: '독사' }],
    weaponInstance: { specials: [{ kind: 'status', status: 'poison', raw: 20, hidden: false }] }
};
runtime.applyMonsterStatus(statusHunter, {}, 2500);
runtime.applyMonsterStatus(statusHunter, {}, 2500);
runtime.applyMonsterStatus(statusHunter, {}, 2500);
assert.strictEqual(engine.monsterPoisonTicks, 130, 'Poison Expert must strengthen an existing poison weapon and extend its DOT');
engine.monsterPoisonTicks = 0;
engine.monsterPoisonBuild = 0;
runtime.applyMonsterStatus({ hunterName: 'FAKE VIPER', perks: [{ name: '독사' }] }, {}, 9999);
assert.strictEqual(engine.monsterPoisonBuild, 0, 'status perks must never invent status on a non-status weapon');
const hero = { index: 2, hunterName: 'HERO', status: 'alive', hp: 100, maxHp: 100, atb: 0, perks: [{ name: '영웅의 증표' }] };
engine.selectedWeapons = [hero];
runtime.initialize(hero);
runtime.outgoingDamage(hero, { tags: ['finisher'] }, 100);
assert.strictEqual(hero.atb, 12, 'Hero Emblem must inspire team ATB after a finisher instead of duplicating Guts');
assert.strictEqual(runtime.preventCart(hero, 120), false, 'Hero Emblem must not prevent a lethal hit');

const expandedHunter = {
    index: 3, hunterName: 'EXPANDED', id: 'great_sword', type: 'melee', status: 'alive',
    hp: 100, maxHp: 100, atb: 0, potions: 10, lifepowders: 1, bombs: 1,
    perks: [
        { name: '첫 수는 크게' }, { name: '복수의 일격' }, { name: '공중 추적자' },
        { name: '보급관' }, { name: '폭탄 배달부' }, { name: '불길한 예감' }
    ]
};
engine.selectedWeapons = [expandedHunter];
engine.monsterFlightState = 'airborne';
engine.monsterHp = 1000;
engine.monsterMaxHp = 1000;
engine.monsterKnockdownDuration = 0;
expandedHunter.personality = 'normal';
expandedHunter.perks = expandedHunter.perks.map(perk => ({
    ...perk, modifiers: HuntPerkCatalog._modifiers(perk.name)
}));
expandedHunter.perkModifiers = HuntPerkCatalog.aggregate(expandedHunter.perks);
HuntIssuedSupplyRuntime.grant(expandedHunter, 'test-expanded');
runtime.initialize(expandedHunter);
assert.strictEqual(expandedHunter.lifepowders, 2, 'Quartermaster must bring a real extra Lifepowder');
assert.strictEqual(expandedHunter.bombs, 3, 'Bomb Courier must modify the personality-issued barrel bomb pack');
assert.strictEqual(runtime.incomingDamage(expandedHunter, 100, { isUltimate: true }), 72, 'Premonition must mitigate signature attacks');
assert.strictEqual(expandedHunter.revengeReady, true, 'taking damage must arm Retaliation');
assert.strictEqual(runtime.outgoingDamage(expandedHunter, {}, 100), 180, 'first strike, airborne pursuit, and retaliation must compose');
assert.strictEqual(expandedHunter.firstStrikeReady, false);
assert.strictEqual(expandedHunter.revengeReady, false);
const dungHunter = {
    id: 'hammer', hp: 100, maxHp: 100, potions: 10, lifepowders: 1, bombs: 1, shockTraps: 0,
    perks: [{ name: '💩' }],
    perkModifiers: { critChance: .6 }
};
engine.random = () => 0;
assert.ok(HuntPerkRuntime.names({ perks: [{ name: '똥' }] }).has('💩'),
    'legacy in-memory Dung records must migrate to the emoji runtime name');
runtime.initialize(dungHunter);
assert.deepStrictEqual([dungHunter.potions, dungHunter.lifepowders, dungHunter.bombs, dungHunter.shockTraps], [10, 1, 1, 0]);
assert.strictEqual(runtime.actionDuration(dungHunter, {}, 20), 20, 'Dung must not shorten actions or alter ATB pacing');
assert.strictEqual(runtime.whetstoneDuration(dungHunter, 20), 20, 'Dung must not accelerate whetstone actions');
assert.strictEqual(runtime.itemDuration(dungHunter, 20), 20, 'Dung must not accelerate item actions');
assert.strictEqual(runtime.incomingDamage(dungHunter, 100), 100, 'Dung must not provide fixed damage reduction');
assert.strictEqual(runtime.stunValue(dungHunter, 100), 100, 'Dung must not provide fixed stun multipliers');
assert.strictEqual(runtime.healAmount(dungHunter, 40), 40, 'Dung must not provide fixed healing multipliers');
assert.strictEqual(runtime.outgoingDamage(dungHunter, {}, 100), 125, 'Dung critical chance must affect the real critical roll');
assert.strictEqual(runtime.sharpnessCost(dungHunter, 4), 0);
assert.strictEqual(runtime.ammoCost(dungHunter, 1), 0);
assert.strictEqual(runtime.cartRecoveryTicks(dungHunter, 50), 50, 'Dung must not accelerate cart recovery');

const reactive = {
    index: 4, id: 'long_sword', type: 'melee', hunterName: 'REACTIVE', personality: 'normal',
    status: 'alive', hp: 100, maxHp: 100, atb: 0, potions: 1, lifepowders: 0,
    shockTraps: 0, flashPods: 0, bombs: 0,
    perks: [{ name: '쾌격' }, { name: '불운 수집가' }, { name: '불굴의 맥박' }]
};
reactive.perkModifiers = HuntPerkCatalog.aggregate(reactive.perks.map(perk => ({ ...perk, modifiers: HuntPerkCatalog._modifiers(perk.name) })));
engine.selectedWeapons = [reactive];
engine.monsterState = 'normal';
engine.monsterFlightState = 'grounded';
engine.random = () => .99;
runtime.initialize(reactive);
runtime.onDefense(reactive, 'dodge');
assert.strictEqual(runtime.outgoingDamage(reactive, {}, 100), 118, 'Evasion-triggered Coalescing Strike must create a real timed attack buff');
runtime.onAttackMiss(reactive);
runtime.onAttackMiss(reactive);
assert.strictEqual(runtime.hitChance(reactive, .1), 1, 'two misses must arm the visible sure-hit comeback');
assert.strictEqual(runtime.hitChance(reactive, .1), .1, 'sure-hit comeback must be consumed by one attack');
reactive.hp = 10;
assert.strictEqual(runtime.preventCart(reactive, 20), true, 'Pulse of Defiance must prevent one lethal hit');
assert.strictEqual(reactive.atb, 100);
assert.strictEqual(runtime.preventCart(reactive, 20), false, 'Pulse of Defiance must not fire twice');

const campLover = {
    index: 5, id: 'hammer', type: 'melee', hunterName: 'CAMP LOVER', personality: 'normal',
    status: 'alive', hp: 70, maxHp: 100, atb: 0, potions: 10, lifepowders: 1,
    shockTraps: 0, flashPods: 0, bombs: 0, sharpness: 50, maxSharpness: 100,
    perks: [{ name: '캠프 러버' }], perkModifiers: HuntPerkCatalog.aggregate([])
};
engine.selectedWeapons = [campLover];
runtime.initialize(campLover);
assert.strictEqual(campLover.isAtCamp, true, 'Camp Lover must really remain away from battle');
assert.strictEqual(campLover.perkCampTicks, 200);
for (let tick = 0; tick < 200; tick++) runtime.tick(campLover);
assert.strictEqual(campLover.isAtCamp, false);
assert.strictEqual(campLover.hp, 100);
assert.strictEqual(campLover.atb, 85);

const reviewed = {
    index: 6, id: 'great_sword', type: 'melee', hunterName: 'REVIEWED', personality: 'normal',
    status: 'alive', hp: 100, maxHp: 100, atb: 0, potions: 1, lifepowders: 1,
    shockTraps: 1, flashPods: 1, bombs: 1, perks: [{ name: '집중 포화' }, { name: '날개 꺾기' }]
};
engine.selectedWeapons = [reviewed];
engine.monsterKnockdownDuration = 20;
engine.monsterStunDuration = 0;
engine.monsterState = 'knocked_down';
runtime.initialize(reviewed);
assert.strictEqual(runtime.atbRecoveryMultiplier(reviewed), 3, 'Focused Barrage must accelerate ATB during real control windows');
assert.strictEqual(runtime.partTargetWeight(reviewed, { kind: 'left-wing' }), 1.6, 'Wing Breaker must target wings for melee hunters too');

engine.random = () => 0;
assert.strictEqual(runtime.shouldConsumeItem({ perks: [{ name: '만족감' }], potions: 3 }, 'potions'), false,
    'Free Meal must preserve any consumable through its own roll');
assert.strictEqual(runtime.shouldConsumeItem({ perks: [{ name: '절약가' }], potions: 1 }, 'potions'), false,
    'Frugal must protect the final stock');
assert.strictEqual(runtime.shouldConsumeItem({ perks: [{ name: '만족할 줄 모름' }], potions: 3 }, 'potions'), true,
    'Insatiable must change item AI rather than duplicate item preservation');
assert.strictEqual(runtime.canReceiveTeamHealing({ perks: [{ name: '고독한 사냥꾼' }] }, reviewed), false,
    'Lone Hunter must reject allied shared healing');

engine.random = () => .99;
engine.monsterKnockdownDuration = 0;
engine.monsterState = 'normal';
const oneHit = { id: 'great_sword', personality: 'normal', hp: 100, maxHp: 100, perks: [{ name: '한 대만' }] };
assert.strictEqual(runtime.outgoingDamage(oneHit, { tags: ['finisher'], motionValue: 100 }, 100), 135);
assert.strictEqual(runtime.outgoingDamage(oneHit, { tags: [], motionValue: 20 }, 100), 90);
const dawn = { index: 7, personality: 'normal', hp: 30, maxHp: 100, atb: 0, perks: [{ name: '새벽의 생존자' }] };
runtime.initialize(dawn);
assert.strictEqual(runtime.incomingDamage(dawn, 70), 29, 'Dawn Survivor must make a lethal low-HP hit survivable');
assert.strictEqual(dawn.atb, 100);
console.log('[test] Hunt perk event runtime and real camp absence passed.');

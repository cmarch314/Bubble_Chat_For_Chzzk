const assert = require('assert');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');

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

const lost = { index: 1, hunterName: 'LOST', hp: 100, maxHp: 100, potions: 10, sharpness: 100, atb: 0, perks: [{ name: '길치' }] };
runtime.initialize(lost);
assert.strictEqual(lost.isAtCamp, true);
assert.strictEqual(lost.perkCampTicks, 100, 'lost hunters must remain absent for the four-times-longer camp delay');
for (let tick = 0; tick < 100; tick++) runtime.tick(lost);
assert.strictEqual(lost.isAtCamp, false);
assert.ok(events.some(text => text.includes('길치 합류')));

const statusHunter = { hunterName: 'VIPER', perks: [{ name: '독사' }] };
runtime.applyMonsterStatus(statusHunter, {}, 2500);
assert.strictEqual(engine.monsterPoisonTicks, 100, 'poison perk must create a real poison DOT state');
const hero = { index: 2, hunterName: 'HERO', hp: 20, heroSaveReady: true, perks: [{ name: '영웅의 증표' }] };
assert.strictEqual(runtime.preventCart(hero, 30), true);
assert.strictEqual(hero.hp, 1);

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
runtime.initialize(expandedHunter);
assert.strictEqual(expandedHunter.lifepowders, 2, 'Quartermaster must bring a real extra Lifepowder');
assert.strictEqual(expandedHunter.bombs, 2, 'Bomb Courier must bring a real extra barrel bomb');
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
console.log('[test] Hunt perk event runtime and real camp absence passed.');

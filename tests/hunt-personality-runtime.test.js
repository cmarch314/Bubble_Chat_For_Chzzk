'use strict';

const assert = require('assert');
const Profiles = require('../js/effects/hunt/HuntPersonalityProfiles');
const Issued = require('../js/effects/hunt/HuntIssuedSupplyRuntime');
const Coordinator = require('../js/effects/hunt/HuntTeamIntentCoordinator');
const Decisions = require('../js/effects/hunt/HuntHunterDecisionPolicy');
const fs = require('fs');
const path = require('path');

const expected = {
    offensive: { stats: [.90, .70, .75, .75, .60], items: [10, 0, 0, 1, 5] },
    normal: { stats: [.85, .55, .75, .75, .55], items: [10, 1, 0, 1, 2] },
    defensive: { stats: [.85, .45, .85, .85, .70], items: [10, 3, 0, 0, 2] },
    support: { stats: [.80, .40, .75, .75, .50], items: [10, 3, 2, 2, 4] },
    veteran: { stats: [.90, .60, .80, .80, .60], items: [10, 2, 0, 2, 2] },
    newbie: { stats: [.80, .40, .70, .70, .40], items: [10, 3, 1, 2, 2] }
};
for (const [personality, values] of Object.entries(expected)) {
    const profile = Profiles.get(personality);
    assert.deepStrictEqual(['hit', 'critical', 'evade', 'guard', 'special'].map(key => profile.stats[key]), values.stats);
    assert.deepStrictEqual(['potions', 'lifepowders', 'shockTraps', 'flashPods', 'bombs'].map(key => profile.issued[key]), values.items);
}

const perkHunter = { personality: 'normal', perkModifiers: { hitChance: .04, counterChance: .08,
    issuedPotions: 2, issuedTraps: 1 } };
assert.strictEqual(Profiles.chance(perkHunter, 'hit'), .89);
assert.strictEqual(Profiles.specialActionChance(perkHunter, .55), .63);
assert.deepStrictEqual(Issued.packFor(perkHunter), {
    potions: 12, lifepowders: 1, shockTraps: 1, flashPods: 1, bombs: 2
});

const offensive = { personality: 'offensive' };
const defensive = { personality: 'defensive' };
assert.strictEqual(Profiles.outgoingDamageMultiplier(offensive, { battleTime: 899 }), 1.2);
assert.strictEqual(Profiles.outgoingDamageMultiplier(offensive, { battleTime: 900 }), 1);
assert.strictEqual(Profiles.incomingDamageMultiplier(defensive, { battleTime: 899 }), .8);
assert.strictEqual(Profiles.incomingDamageMultiplier(defensive, { battleTime: 900 }), 1);

const support = { index: 0, personality: 'support', status: 'alive', hp: 100, maxHp: 100,
    shockTraps: 2, flashPods: 0, lifepowders: 0, bombs: 0 };
const normal = { index: 1, personality: 'normal', status: 'alive', hp: 100, maxHp: 100,
    shockTraps: 1, flashPods: 0, lifepowders: 0, bombs: 0 };
const engine = {
    selectedWeapons: [support, normal], battleTime: 30, timeLimit: 480, monsterAtb: 90,
    monsterState: 'normal', monsterFlightState: 'grounded', monsterFlashUseCount: 0,
    random: () => 0, isMonsterTrapImmune: () => false,
    monsterTraitRuntime: { canTriggerTrap: () => true }, teamIntentCoordinator: new Coordinator()
};
assert.strictEqual(Decisions.chooseSupportAction(engine, support)?.kind, 'trap');
assert.strictEqual(Decisions.chooseSupportAction(engine, normal), null,
    'team intent must prevent duplicate trap use in the same decision window');

const veteran = { index: 2, personality: 'veteran', status: 'alive', hp: 100, maxHp: 100,
    shockTraps: 0, flashPods: 2, lifepowders: 0, bombs: 0 };
const otherFlash = { index: 3, personality: 'normal', status: 'alive', hp: 100, maxHp: 100, flashPods: 1 };
const airEngine = { ...engine, selectedWeapons: [veteran, otherFlash], monsterFlightState: 'airborne',
    teamIntentCoordinator: new Coordinator() };
assert.strictEqual(Decisions.chooseSupportAction(airEngine, veteran), null,
    'veteran must conserve flash while another hunter can use one');
otherFlash.flashPods = 0;
assert.strictEqual(Decisions.chooseSupportAction(airEngine, veteran)?.kind, 'flash');

const grantHunter = { personality: 'support', perkModifiers: {} };
Issued.grant(grantHunter, 'stage-1');
grantHunter.potions = 4;
Issued.grant(grantHunter, 'stage-1');
assert.strictEqual(grantHunter.potions, 4, 're-entering one combat node must not duplicate issued stock');
Issued.grant(grantHunter, 'stage-2');
assert.strictEqual(grantHunter.potions, 10, 'a new combat node grants its guaranteed hunt pack');

const turnSource = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
assert.doesNotMatch(turnSource, /Support Trap or Stonefall AI|낙석격동|ATB 충전! \(\+25 HP, \+60 ATB\)/,
    'legacy free traps, rockfalls and powder ATB injection must not survive beside the decision policy');
const perkSource = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntPerkRuntime.js'), 'utf8');
assert.doesNotMatch(perkSource, /hunter\.perk(?:Traps|Flashes)/,
    'perk consumables must use the same issued inventory instead of a shadow stock');

console.log('[test] Personality stats, issued supplies, buffs, perks and coordinated item AI passed.');

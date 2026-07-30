'use strict';

const assert = require('assert');
const {
    classifyAction,
    isUsableAction,
    selectRepresentativeActions,
    buildBehavior
} = require('../scripts/generate-wilds-monster-behavior.js');

assert.strictEqual(classifyAction('cStraightThunderBreath'), 'projectile');
assert.strictEqual(classifyAction('cRushThunderTackle'), 'charge');
assert.strictEqual(classifyAction('cKillKickFly'), 'close');
assert.strictEqual(classifyAction('cRoarDiscover'), 'roar');
assert.strictEqual(isUsableAction({ offensiveCandidate: true, actionKind: 'action', className: 'cDamageReactionAttack' }), false);

const actions = [
    { actionId: '1', actionKind: 'action', className: 'cRoarDiscover', offensiveCandidate: true, stateCandidates: ['CommonAttack'], conditions: { parameters: {} }, evidence: 'installed', sourcePath: 'a' },
    { actionId: '2', actionKind: 'action', className: 'cBreathAttack', offensiveCandidate: true, stateCandidates: ['CommonAttack'], conditions: { parameters: { _SubStamina: 20 } }, evidence: 'installed', sourcePath: 'a' },
    { actionId: '3', actionKind: 'action', className: 'cRushThunderTackle', offensiveCandidate: true, stateCandidates: ['CommonAttack'], conditions: { parameters: { _SubStamina: 30 } }, evidence: 'installed', sourcePath: 'a' },
    { actionId: '4', actionKind: 'action', className: 'cDamageReactionAttack', offensiveCandidate: true, stateCandidates: [], conditions: { parameters: {} }, evidence: 'installed', sourcePath: 'a' }
];
assert.deepStrictEqual(selectRepresentativeActions(actions).map(action => action.actionId), ['2', '3']);
const monsters = buildBehavior({ monsters: { Em0001_00: actions } }, { identifiers: [{
    monsterCode: 'Em0001_00', variantIndex: 0, publicMonsterId: 13,
    nameEn: 'Rathian', nameKo: '리오레이아'
}] });
assert.strictEqual(monsters.length, 1);
assert.strictEqual(monsters[0].roar.status, 'verified-present');
assert.strictEqual(monsters[0].patterns[0].type, 'roar');
assert.ok(monsters[0].patterns.every(pattern => pattern.evidence === 'installed'));

console.log('wilds monster behavior generator tests passed');

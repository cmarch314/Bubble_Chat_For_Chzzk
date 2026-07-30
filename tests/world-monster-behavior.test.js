'use strict';

const assert = require('assert');
const { parseNamespaces, usable, selectActions, buildBehavior } = require('../scripts/generate-world-monster-behavior');

const fixture = [
    'nActEm001_02::cRotateSubAction',
    'nActEm001_02::DashAttackFirstBase',
    'nActEm001_02::HighPowerBreathCombo',
    'nActEm001_02::Somersault360_G2G',
    'nActEm001_02::SuperRoarR'
].join('\n');
assert.strictEqual(parseNamespaces(fixture).get('Em001_02').length, 5);
assert.strictEqual(usable('cRotateSubAction'), false);
assert.ok(selectActions(parseNamespaces(fixture).get('Em001_02')).includes('HighPowerBreathCombo'));
const monsters = buildBehavior(fixture);
assert.strictEqual(monsters.length, 1);
assert.strictEqual(monsters[0].id, 'gold_rathian');
assert.strictEqual(monsters[0].roar.status, 'verified-present');
assert.ok(monsters[0].patterns.every(pattern => pattern.evidence === 'mhw-executable-action-enumeration'));

console.log('world monster behavior generator tests passed');

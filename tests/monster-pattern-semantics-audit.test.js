'use strict';

const assert = require('assert');
const {
    RELEASED_MONSTER_IDS,
    auditPattern,
    auditCatalog,
    loadRuntimeCatalog
} = require('../scripts/audit-monster-pattern-semantics.js');

const poisonMistLaser = auditPattern('chameleos', {
    id: 'chameleos.bad',
    name: '레이저',
    type: 'projectile',
    tags: ['projectile'],
    sourceActionClass: '固定長ビーム状毒霧ヒットデータ'
}, 0);
assert.deepStrictEqual(
    poisonMistLaser.map(row => row.code).sort(),
    ['delivery-mismatch', 'internal-only-action-row']
);

const ordinaryUltimate = auditPattern('rathalos', {
    id: 'rathalos.bad',
    name: '공중 화염구 연사',
    type: 'ultimate',
    tags: ['ultimate'],
    sourceActionClass: 'cBandBreathTripleShootLFly'
}, 0);
assert.deepStrictEqual(ordinaryUltimate.map(row => row.code), ['missing-signature-evidence']);

const sourcedUltimate = auditPattern('verified', {
    id: 'verified.signature',
    name: '검증된 필살기',
    type: 'ultimate',
    tags: ['ultimate'],
    signatureEvidence: {
        sourceUrl: 'https://example.invalid/verified-move',
        assessment: 'move-specific-source'
    }
}, 0);
assert.deepStrictEqual(sourcedUltimate, []);

const runtimeCatalog = loadRuntimeCatalog();
const findings = auditCatalog(runtimeCatalog, RELEASED_MONSTER_IDS);
assert.deepStrictEqual(findings, [],
    'every released runtime kit must contain only complete sourced actions and verified delivery semantics');

console.log('[test] Monster pattern semantic audit passed.');

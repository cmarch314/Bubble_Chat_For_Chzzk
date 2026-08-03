'use strict';

const assert = require('assert');
const {
    TAG_ROUTES,
    runtimeRoutes
} = require('../scripts/generate-world-monster-audio-review-routes');

assert.deepStrictEqual(
    TAG_ROUTES.blast_scale_explosion,
    { kind: 'blast_scale_explosion', volume: 0.74 },
    'the user-confirmed blast-scale explosion tag must have a dedicated runtime route'
);
assert.deepStrictEqual(
    TAG_ROUTES.charge_stride_step,
    { kind: 'charge_stride_step', volume: 0.58 },
    'reviewed Tigrex stride steps need a dedicated route outside the broad attack pool'
);
assert.deepStrictEqual(
    TAG_ROUTES.projectile_launch,
    { kind: 'projectile_launch', volume: 0.62 },
    'reviewed projectile release audio must stay separate from impact audio'
);

const labels = {
    tagAliases: {
        '돌진': 'physical_attack_vocal'
    },
    runtimePolicy: {
        semanticSeFallbackTags: ['wing_flap']
    },
    records: [
        { bank: 'em900_vo', eventId: 10, sourceId: 20, tags: ['monster_roar'], verdict: '확정' },
        { bank: 'em900_se', eventId: 11, sourceId: 21, tags: ['wing_flap'], verdict: '확정' },
        { bank: 'em900_vo', eventId: 12, sourceId: 22, tags: ['unknown'], verdict: '확정' },
        { bank: 'em900_vo', eventId: 13, sourceId: 23, tags: ['wing_flap'], verdict: '확정' },
        { bank: 'em900_01_vo', eventId: 14, sourceId: 24, tags: ['돌진'], verdict: '확정' }
    ]
};
const graph = {
    events: [
        {
            bank: 'em900_vo',
            eventId: 10,
            variants: [{ decodedClips: [{ sourceId: 20, path: 'local/roar.mp3' }] }]
        },
        {
            bank: 'em900_se',
            eventId: 11,
            variants: [{ decodedClips: [{ sourceId: 21, path: 'local/wing.mp3' }] }]
        },
        {
            bank: 'em900_vo',
            eventId: 12,
            variants: [{ decodedClips: [{ sourceId: 22, path: 'local/unknown.mp3' }] }]
        },
        {
            bank: 'em900_vo',
            eventId: 13,
            variants: [{ decodedClips: [{ sourceId: 23, path: 'local/voice-wing.mp3' }] }]
        },
        {
            bank: 'em900_01_vo',
            eventId: 14,
            variants: [{ decodedClips: [{ sourceId: 24, path: 'local/variant-charge.mp3' }] }]
        }
    ]
};
const result = runtimeRoutes(labels, { em900_vo: ['fixture_monster'] }, () => graph);

assert.strictEqual(result.routes['fixture_monster:roar'][0].layers[0][0], 'local/roar.mp3');
assert.strictEqual(result.routes['fixture_monster:attack'][0].semanticTag, 'wing_flap');
assert.ok(result.routes['fixture_monster:attack'].some(route =>
    route.semanticTag === 'physical_attack_vocal'
    && route.layers[0][0] === 'local/variant-charge.mp3'
), 'variant banks and user-facing tag aliases should resolve through the base monster family');
assert.ok(result.routes['fixture_monster:attack'][0].patternKeywords.includes('flight'));
assert.strictEqual(result.unresolved.length, 1);
assert.strictEqual(result.unresolved[0].reason, 'unrouted-semantic-tag');
assert.deepStrictEqual(
    result.seFallbacks.wing_flap.map(variant => variant.layers[0][0]),
    ['local/wing.mp3'],
    'generic semantic SE pools must exclude identity-bound VO even when it has the same review tag'
);
assert.strictEqual(result.seFallbacks.wing_flap[0].temporaryFallback, true);
assert.strictEqual(result.seFallbacks.wing_flap[0].reuseScope, 'cross-species-semantic-se');
assert.strictEqual(
    result.seFallbacks.wing_flap[0].evidence,
    'world-user-audition-semantic-se-fallback'
);

const familyLabels = {
    runtimePolicy: {
        silentVoiceMonsterIds: ['silent_monster'],
        voiceFallbackFamilies: [{
            id: 'paired-elders',
            members: ['alpha', 'beta'],
            mode: 'fill-missing-semantic-tag'
        }]
    },
    records: [
        { bank: 'em901_vo', eventId: 20, sourceId: 30, tags: ['monster_roar'], verdict: '확정' },
        { bank: 'em901_vo', eventId: 21, sourceId: 31, tags: ['death_vocal'], verdict: '확정' },
        { bank: 'em902_vo', eventId: 22, sourceId: 32, tags: ['monster_roar'], verdict: '확정' },
        { bank: 'em903_vo', eventId: 23, sourceId: 33, tags: ['monster_roar'], verdict: '확정' }
    ]
};
const familyGraph = {
    events: [
        { bank: 'em901_vo', eventId: 20, variants: [{ decodedClips: [{ sourceId: 30, path: 'local/alpha-roar.mp3' }] }] },
        { bank: 'em901_vo', eventId: 21, variants: [{ decodedClips: [{ sourceId: 31, path: 'local/alpha-death.mp3' }] }] },
        { bank: 'em902_vo', eventId: 22, variants: [{ decodedClips: [{ sourceId: 32, path: 'local/beta-roar.mp3' }] }] },
        { bank: 'em903_vo', eventId: 23, variants: [{ decodedClips: [{ sourceId: 33, path: 'local/silent-roar.mp3' }] }] }
    ]
};
const familyResult = runtimeRoutes(familyLabels, {
    em901_vo: ['alpha'],
    em902_vo: ['beta'],
    em903_vo: ['silent_monster']
}, () => familyGraph);
assert.strictEqual(familyResult.routes['beta:death'][0].fallbackFromMonsterId, 'alpha',
    'paired monsters should borrow only a missing confirmed vocal tag');
assert.strictEqual(familyResult.routes['beta:roar'].length, 1,
    'an existing monster-specific vocal tag must not be replaced or unioned');
assert.strictEqual(familyResult.routes['silent_monster:roar'], undefined,
    'an explicitly voiceless monster must remain silent despite a stale labelled route');
assert.deepStrictEqual(familyResult.runtimePolicy.silentVoiceMonsterIds, ['silent_monster']);

console.log('world monster review audio route tests passed');

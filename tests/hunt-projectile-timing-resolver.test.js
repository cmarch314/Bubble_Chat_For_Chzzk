'use strict';

const assert = require('assert');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
const Resolver = require('../js/effects/hunt/HuntProjectileTimingResolver.js');

const action = HuntBeatV2Contract.compile({
    schemaVersion: 2, backend: 'beat-v2', id: 'test.distance-projectile', actor: 'monster',
    reviewStatus: 'approved', beats: [
        { id: 'spit', ticks: 6, events: [
            { id: 'launch', kind: 'projectile-launch', projectileId: 'fireball', target: 'primary',
                origin: 'part:head', outcomeEventId: 'contact', flightMode: 'distance',
                speedPxPerTick: 120, offsetTicks: 0 },
            { id: 'contact', kind: 'damage', group: 'contact', projectileId: 'fireball',
                target: 'primary', damagePercent: 30, offsetTicks: 4 }
        ] },
        { id: 'recover', ticks: 4, events: [
            { id: 'finish', kind: 'projectile-finish', projectileId: 'fireball', offsetTicks: 2 }
        ] }
    ]
});

const near = Resolver.resolveSession(action, { targetIndex: 1,
    judgmentEvents: [{ id: 'contact', targetIndices: [1], atTicks: 4 }] });
const far = Resolver.resolveSession(action, { targetIndex: 0,
    judgmentEvents: [{ id: 'contact', targetIndices: [0], atTicks: 4 }] });
const nearContact = near.action.events.find(event => event.id === 'contact');
const farContact = far.action.events.find(event => event.id === 'contact');
assert.ok(farContact.atTicks > nearContact.atTicks,
    'a farther hunter must receive projectile contact later than a nearer hunter');
assert.equal(near.context.judgmentEvents[0].atTicks, nearContact.atTicks,
    'combat judgment timing must use the same resolved contact tick as presentation');
assert.equal(far.context.judgmentEvents[0].atTicks, farContact.atTicks,
    'live combat must not retain the authored fallback contact tick');
const farFinish = far.action.events.find(event => event.id === 'finish');
assert.ok(farFinish.atTicks > farContact.atTicks,
    'finish follows the distance-resolved contact and extends recovery when needed');
assert.equal(action.events.find(event => event.id === 'contact').atTicks, 4,
    'distance resolution must not mutate the authored graph');

console.log('[test] distance-based projectile timing resolver passed');

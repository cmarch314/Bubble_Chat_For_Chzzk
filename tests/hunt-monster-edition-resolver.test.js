'use strict';

const assert = require('assert');
const Resolver = require('../js/effects/hunt/HuntMonsterEditionResolver.js');

const sources = {
    wilds: [{ id: 'wilds.attack' }],
    'rise-sunbreak': [{ id: 'rise.attack' }],
    'world-iceborne': [{ id: 'world.attack' }],
    'world-shell': [{ id: 'world.shell' }],
    'generations-ultimate-db': [{ id: 'mhgu.db' }],
    'generations-ultimate': [{ id: 'mhgu.guide' }]
};

assert.strictEqual(Resolver.resolve(sources, {
    canonicalEdition: 'world-iceborne',
    strict: true
}).patterns[0].id, 'world.attack');
assert.strictEqual(Resolver.resolve(sources, {
    canonicalEdition: 'rise_sunbreak',
    strict: true
}).patterns[0].id, 'rise.attack');
assert.strictEqual(Resolver.resolve(sources, {
    canonicalEdition: 'generations-ultimate',
    strict: true
}).patterns[0].id, 'mhgu.db');
assert.strictEqual(Resolver.resolve({
    'world-shell': [{ id: 'shell.fallback' }],
    wilds: [{ id: 'wrong.newer-edition' }]
}, {
    canonicalEdition: 'world-iceborne',
    strict: true
}).patterns[0].id, 'shell.fallback');
assert.strictEqual(Resolver.resolve({
    wilds: [{ id: 'wrong.newer-edition' }]
}, {
    canonicalEdition: 'world-iceborne',
    strict: true
}), null, 'a reviewed World kit must not silently borrow Wilds behavior');
assert.strictEqual(Resolver.resolve(sources).patterns[0].id, 'wilds.attack',
    'unreviewed inventory candidates retain the existing discovery precedence');

console.log('[test] Canonical monster edition source resolution passed.');

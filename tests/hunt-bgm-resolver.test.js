const assert = require('assert');
const HuntBgmResolver = require('../js/effects/hunt/HuntBgmResolver.js');

const resolver = new HuntBgmResolver({
    random: () => 0,
    historyLimit: 2,
    locales: {
        forest: ['forest-a.mp3', 'forest-b.mp3'],
        arena: ['arena.mp3']
    },
    themes: { zinogre: ['zinogre.mp3'] },
    habitats: {
        zinogre: { latestAppearance: 'world', habitats: [{ id: 'forest', weight: 1 }] },
        rathalos: { latestAppearance: 'world', habitats: [{ id: 'forest', weight: 1 }] }
    }
});

const dedicated = resolver.resolve({ id: 'zinogre' });
assert.strictEqual(dedicated.kind, 'dedicated');
assert.strictEqual(dedicated.track, 'zinogre.mp3');

const first = resolver.resolve({ id: 'rathalos' });
const second = resolver.resolve({ id: 'rathalos' });
assert.strictEqual(first.habitatId, 'forest');
assert.notStrictEqual(first.track, second.track, 'recent-track protection should avoid immediate repeats');

console.log('[test] Hunt habitat BGM resolver contract passed.');

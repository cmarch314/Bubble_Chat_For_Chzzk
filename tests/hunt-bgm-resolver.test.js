const assert = require('assert');
const HuntBgmResolver = require('../js/effects/hunt/HuntBgmResolver.js');
const catalog = require('../js/effects/hunt/HuntBgmCatalog.js');

assert.deepStrictEqual(catalog.HUNT_DEDICATED_THEMES.magnamalo, ['BGM/MHR_Magnamalo.mp3']);
assert.deepStrictEqual(catalog.HUNT_DEDICATED_THEMES.bazelgeuse, ['BGM/MHW_Bazelgeuse.mp3']);
assert.deepStrictEqual(catalog.HUNT_DEDICATED_THEMES.seething_bazelgeuse, ['BGM/MHW_Bazelgeuse.mp3']);
assert.ok(!catalog.HUNT_BGM_LOCALES.kamura.includes('BGM/MHR_Kamura.mp3'), 'village lobby music must never be used as a hunt-area fallback');

const catalogResolver = new HuntBgmResolver({
    random: () => 0,
    locales: catalog.HUNT_BGM_LOCALES,
    themes: catalog.HUNT_DEDICATED_THEMES,
    habitats: catalog.HUNT_MONSTER_HABITATS
});
assert.deepStrictEqual(
    ['bazelgeuse', 'seething_bazelgeuse'].map(id => catalogResolver.resolve({ id }).track),
    ['BGM/MHW_Bazelgeuse.mp3', 'BGM/MHW_Bazelgeuse.mp3'],
    'both Bazelgeuse forms must prefer their verified dedicated theme'
);

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

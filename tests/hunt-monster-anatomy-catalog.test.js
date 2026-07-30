const assert = require('assert');

global.HUNT_WILDS_MONSTER_ANATOMY = {
    monsters: {
        rathalos: {
            id: 'rathalos', baseHealth: 5000, parts: [
                { id: 1, kind: 'head', health: 100, breakable: true, hitzones: { slash: 0.6, blunt: 0.7, pierce: 0.5 } },
                { id: 2, kind: 'torso', health: 200, breakable: false, hitzones: { slash: 0.2, blunt: 0.2, pierce: 0.2 } }
            ]
        }
    }
};
const Catalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');

const profile = Catalog.find({ id: 'rathalos', nameEN: 'Rathalos' });
assert.strictEqual(profile.baseHealth, 5000);
const state = Catalog.createPartState(profile);
assert.strictEqual(state.length, 5);
const result = Catalog.applyPartDamage(state, { id: 'great_sword', type: 'melee' }, 500, 1, () => 0);
assert.strictEqual(result.part.kind, 'head');
assert.strictEqual(result.newlyBroken, true);
assert.strictEqual(Catalog.damageTypeForWeapon({ id: 'hammer' }), 'blunt');
assert.ok(Catalog.partDamageScale(state, 15600) > 0,
    'part durability must scale from actual breakable pools instead of unrelated monster base HP');
assert.strictEqual(Catalog.damageTypeForWeapon({ type: 'ranged' }), 'pierce');
assert.strictEqual(Catalog.breakReaction('rathalos', 'head', true).type, 'aerial_topple',
    'any actual part break in flight must become a forced landing');
assert.deepStrictEqual(
    Catalog.breakReaction('rathalos', 'left-wing', false),
    {
        type: 'part_break_topple',
        visualType: 'part_break_topple',
        durationTicks: 35,
        label: '부위 파괴 넘어짐'
    },
    'every grounded part break uses the shared short topple reaction'
);
assert.deepStrictEqual(
    Catalog.breakReaction('rathalos', 'tail', false),
    {
        type: 'tail_sever_roll',
        visualType: 'tail_sever_roll',
        durationTicks: 55,
        label: '꼬리 절단 나뒹굴기'
    },
    'tail severing uses the stronger shared rolling reaction'
);
assert.strictEqual(
    Catalog.breakReaction('rathalos', 'tail', true).visualType,
    'tail_sever_roll',
    'an airborne tail sever keeps its distinct visual after forced landing'
);
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathalos' }, 'head'), { x: .23, y: .64, kind: 'head' });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathalos' }, 'left-wing'), { x: .31, y: .19, kind: 'left-wing' });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathalos' }, 'right-wing'), { x: .66, y: .25, kind: 'right-wing' });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathalos' }, 'tail', 0), { x: .82, y: .57, kind: 'tail', pathIndex: 0 });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathalos' }, 'tail', 5), { x: .17, y: .84, kind: 'tail', pathIndex: 5 });
const reviewedRathalos = Catalog.createPartState(profile);
assert.deepStrictEqual(
    Catalog.partDisplaySlots(reviewedRathalos).map(part => part.kind),
    ['head', 'back', 'wing', 'wing', 'tail'],
    'reviewed Rathalos UI must retain head, back, both wings, and its severable tail'
);
const reviewedRathian = Catalog.find({ id: 'rathian' });
const reviewedRathianSlots = Catalog.partDisplaySlots(Catalog.createPartState(reviewedRathian));
assert.deepStrictEqual(
    reviewedRathianSlots.map(part => part.kind),
    ['head', 'back', 'wing', 'wing', 'tail'],
    'reviewed Rathian UI must expose its World head, back, both wings, and severable tail'
);
assert.deepStrictEqual(
    reviewedRathianSlots.map(part => part.sourceKind),
    ['head', 'back', 'left-wing', 'right-wing', 'tail']
);
assert.deepStrictEqual(
    reviewedRathianSlots.map(part => part.shortLabel),
    ['머리', '등', '좌익', '우익', '꼬리']
);
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathian' }, 'head'), { x: .18, y: .72, kind: 'head' });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'rathian' }, 'left-wing'), { x: .53, y: .20, kind: 'left-wing' });
for (const id of ['diablos', 'black_diablos']) {
    const reviewedDiablos = Catalog.find({ id });
    const slots = Catalog.partDisplaySlots(Catalog.createPartState(reviewedDiablos));
    assert.deepStrictEqual(
        slots.map(part => part.kind),
        ['head', 'head', 'back', 'tail'],
        `${id} must display two horn breaks, the back break, and the severable tail`
    );
    assert.deepStrictEqual(
        slots.map(part => part.sourceKind),
        ['left-horn', 'right-horn', 'back', 'tail'],
        `${id} must not invent leg or wing break slots`
    );
    assert.match(reviewedDiablos.evidence.breakContract, /horns-back-tail/);
}

const reviewedWorldFamilies = {
    legiana: ['head', 'back', 'wing', 'wing', 'tail'],
    shrieking_legiana: ['head', 'back', 'wing', 'wing', 'tail'],
    paolumu: ['head', 'back', 'wing', 'wing', 'tail'],
    nightshade_paolumu: ['head', 'back', 'wing', 'wing', 'tail'],
    bazelgeuse: ['head', 'back', 'wing', 'wing', 'tail'],
    seething_bazelgeuse: ['head', 'back', 'wing', 'wing', 'tail'],
    tigrex: ['head', 'leg', 'leg', 'tail'],
    brute_tigrex: ['head', 'leg', 'leg', 'tail'],
    nargacuga: ['head', 'wing', 'wing', 'tail'],
    barioth: ['head', 'leg', 'leg', 'tail'],
    frostfang_barioth: ['head', 'leg', 'leg', 'tail']
};
for (const [id, expectedKinds] of Object.entries(reviewedWorldFamilies)) {
    const anatomy = Catalog.find({ id });
    const slots = Catalog.partDisplaySlots(Catalog.createPartState(anatomy));
    assert.deepStrictEqual(slots.map(part => part.kind), expectedKinds, `${id} reviewed part contract`);
    assert.ok(slots.every(part => [...part.shortLabel].length <= 3),
        `${id} part labels must fit the compact three-character HUD contract`);
    assert.ok(anatomy.evidence?.breakContract, `${id} must retain reviewed anatomy evidence`);
}
assert.deepStrictEqual(
    Catalog.partDisplaySlots(Catalog.createPartState(Catalog.find({ id: 'tigrex' })))
        .map(part => part.shortLabel),
    ['머리', '왼발', '오른발', '꼬리'],
    'paired feet must retain visible left/right labels'
);
for (const id of ['legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu']) {
    assert.strictEqual(Catalog.find({ id }).tailSeverable, false, `${id} tail only breaks in World`);
}
for (const id of ['bazelgeuse', 'seething_bazelgeuse', 'tigrex', 'brute_tigrex',
    'nargacuga', 'barioth', 'frostfang_barioth']) {
    assert.strictEqual(Catalog.find({ id }).tailSeverable, true, `${id} tail must be severable`);
}
assert.deepStrictEqual(Catalog.visualPoint({ id: 'shrieking_legiana' }, 'head'), { x: .52, y: .27, kind: 'head' });
assert.deepStrictEqual(Catalog.visualPoint({ id: 'brute_tigrex' }, 'tail'), { x: .74, y: .26, kind: 'tail' });

let endgameBreakCoverage = 0;
for (let seed = 1; seed <= 50; seed++) {
    let value = seed >>> 0;
    const random = () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 0x100000000;
    };
    const endgameParts = Catalog.createPartState(Catalog.fallbackProfile('rathalos'));
    const scale = Catalog.partDamageScale(endgameParts, 15600);
    const weapons = [
        { id: 'great_sword' },
        { id: 'long_sword' },
        { id: 'hammer' },
        { type: 'ranged' }
    ];
    for (let hit = 0; hit < 120; hit++) {
        Catalog.applyPartDamage(endgameParts, weapons[hit % weapons.length], 15600 * .95 / 120, scale, random);
    }
    const breakable = endgameParts.filter(part => part.breakable || part.severable);
    endgameBreakCoverage += breakable.filter(part => part.broken || part.severed).length / breakable.length;
}
endgameBreakCoverage /= 50;
assert.ok(endgameBreakCoverage >= .75,
    `a mixed party should break most Rathalos parts near 95% hunt damage: ${endgameBreakCoverage}`);
console.log('[test] Hunt monster anatomy catalog passed.');

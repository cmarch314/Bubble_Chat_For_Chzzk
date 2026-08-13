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
const wingBreak = Catalog.breakReaction('rathalos', 'left-wing', false);
assert.strictEqual(wingBreak.type, 'flinch');
assert.strictEqual(wingBreak.reactionProfile, 'flinch');
assert.strictEqual(wingBreak.durationTicks, 30,
    'ordinary grounded part breaks use the shared short BEAT flinch');
const tailBreak = Catalog.breakReaction('rathalos', 'tail', false);
assert.strictEqual(tailBreak.type, 'knockdown');
assert.strictEqual(tailBreak.reactionProfile, 'tail');
assert.strictEqual(tailBreak.durationTicks, 60,
    'tail severing uses the stronger shared rolling BEAT reaction');
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
assert.deepStrictEqual(Catalog.visualPoint({ id: 'diablos' }, 'torso'), { x: .50, y: .50, kind: 'torso' },
    'Diablos BEAT rotations require an authored torso pivot');
assert.deepStrictEqual(Catalog.visualPoint({ id: 'black_diablos' }, 'torso'), { x: .50, y: .50, kind: 'torso' },
    'the reviewed Black Diablos variant must inherit the base torso pivot');
for (const id of ['diablos', 'black_diablos']) {
    const reviewedDiablos = Catalog.find({ id });
    const partState = Catalog.createPartState(reviewedDiablos);
    const slots = Catalog.partDisplaySlots(partState);
    assert.deepStrictEqual(
        slots.map(part => part.kind),
        ['head', 'head', 'back', 'leg', 'leg', 'tail'],
        `${id} must display two horn breaks, the back, both front legs, and the severable tail`
    );
    assert.deepStrictEqual(
        slots.map(part => part.sourceKind),
        ['left-horn', 'right-horn', 'back', 'left-front-leg', 'right-front-leg', 'tail'],
        `${id} must omit non-breakable wings while retaining front-leg break slots`
    );
    assert.match(reviewedDiablos.evidence.breakContract, /wings-hitzone-only/);
    assert.deepStrictEqual(
        partState.find(part => part.kind === 'head').hitzones,
        { slash: .45, blunt: .63, pierce: .40 },
        `${id} combat anatomy must keep the soft head separate from its breakable horns`
    );
    assert.strictEqual(
        partState.find(part => part.kind === 'left-horn').hitzones.blunt,
        .42,
        `${id} horn blunt hitzone must use the reviewed World value`
    );
    assert.ok(partState.every(part => part.flinchHealth > 0),
        `${id} must accumulate ordinary part flinches independently of visible breaks`);
    assert.strictEqual(Catalog.breakReaction(id, 'left-horn').type, 'flinch',
        `${id} horn destruction is a short flinch, not a generic full knockdown`);
    assert.strictEqual(partState.find(part => part.kind === 'left-wing').breakable, false,
        `${id} wings are damageable hitzones but not visible break slots in World`);
    assert.deepStrictEqual(partState.find(part => part.kind === 'left-wing').hitzones,
        { slash: .40, blunt: .30, pierce: .60 },
        `${id} wings must use their reviewed soft projectile hitzone`);
    assert.strictEqual(Catalog.breakReaction(id, 'back').type, 'flinch',
        `${id} back destruction is a short flinch, not a generic full knockdown`);
    for (const side of ['left', 'right']) {
        const reaction = Catalog.breakReaction(id, `${side}-front-leg`);
        assert.strictEqual(reaction.type, 'knockdown', `${id} ${side} front-leg destruction must topple`);
        assert.strictEqual(reaction.durationTicks, 76, `${id} ${side} front-leg destruction must use the authored shared BEAT knockdown`);
    }
    assert.strictEqual(Catalog.breakReaction(id, 'tail').reactionProfile, 'tail');
    const ordinaryFlinch = Catalog.applyPartDamage(
        partState,
        { id: 'great_sword', type: 'melee' },
        partState[0].flinchHealth * 2,
        1,
        () => 0
    );
    assert.strictEqual(ordinaryFlinch.newlyFlinched, true,
        `${id} non-breakable head damage must still produce an accumulated small flinch`);
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
const legianaVisualContract = Object.freeze({
    head: { x: .52, y: .27, kind: 'head' },
    'left-wing': { x: .25, y: .42, kind: 'left-wing' },
    'right-wing': { x: .78, y: .42, kind: 'right-wing' },
    tail: { x: .53, y: .84, kind: 'tail' }
});
for (const id of ['legiana', 'shrieking_legiana']) {
    for (const [partKind, expectedPoint] of Object.entries(legianaVisualContract)) {
        assert.deepStrictEqual(
            Catalog.visualPoint({ id }, partKind),
            expectedPoint,
            `${id} ${partKind} must stay aligned to the reviewed front-facing sprite silhouette`
        );
    }
}
assert.deepStrictEqual(Catalog.visualPoint({ id: 'brute_tigrex' }, 'tail'), { x: .62, y: .28, kind: 'tail' });
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'bazelgeuse' }, 'mouth'),
    { x: .50, y: .58, kind: 'mouth' },
    'Bazelgeuse gas breath must originate from its central, slightly lowered mouth'
);
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'seething_bazelgeuse' }, 'mouth'),
    { x: .50, y: .58, kind: 'mouth' },
    'Seething Bazelgeuse must inherit the same species mouth anchor'
);
assert.strictEqual(Catalog.baseFacing({ id: 'barioth' }), 'left');
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'barioth' }, 'mouth'),
    { x: .41, y: .23, kind: 'mouth' },
    'Barioth breath must leave the left-facing mouth at the upper center of the sprite'
);
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'barioth' }, 'left-front-leg'),
    { x: .31, y: .81, kind: 'left-front-leg' }
);
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'barioth' }, 'right-front-leg'),
    { x: .72, y: .81, kind: 'right-front-leg' }
);
assert.deepStrictEqual(
    Catalog.visualPoint({ id: 'barioth' }, 'tail'),
    { x: .70, y: .15, kind: 'tail' }
);

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

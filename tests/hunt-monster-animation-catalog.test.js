const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const Catalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');

for (const [authored, runtime] of Object.entries({
    'aerial-sweep': 'lateral-sweep',
    'aerial-dive-return': 'aerial-dive',
    'aerial-slam': 'aerial-dive',
    'aerial-dive-explosion': 'aerial-dive',
    'ground-charge-chain': 'ground-charge-zigzag',
    'agile-leap-chain': 'pounce-chain',
    'low-glide-sweep': 'rathalos-glide'
})) {
    assert.strictEqual(
        Catalog.resolve({ id: `test.${authored}`, animationProfile: authored }, '', '', { species: 'Flying Wyvern' }).id,
        runtime,
        `${authored} must resolve to an installed motion class`
    );
}
global.HuntMonsterAnimationCatalog = Catalog;
global.HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');
const animatorSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterAttackAnimator.js'), 'utf8');
const runtimeStyle = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');

// A completed turn is visually identical to zero degrees, but interpolating
// from 360/720 back to `transform:none` visibly rewinds the monster. Keep the
// accumulated angle through the return frame and let the motion cleanup snap
// the detached transform only after the animation has ended.
function keyframeBlocks(source) {
    const blocks = [];
    let cursor = 0;
    while ((cursor = source.indexOf('@keyframes ', cursor)) >= 0) {
        const name = source.slice(cursor + 11).match(/^\s*([\w-]+)/)?.[1];
        const open = source.indexOf('{', cursor);
        let depth = 1;
        let end = open + 1;
        while (depth > 0 && end < source.length) {
            if (source[end] === '{') depth += 1;
            else if (source[end] === '}') depth -= 1;
            end += 1;
        }
        blocks.push({ name, body: source.slice(open + 1, end - 1) });
        cursor = end;
    }
    return blocks;
}

const rotationValues = text => [...text.matchAll(
    /rotate\((?:calc\()?\s*([-+]?\d+(?:\.\d+)?)deg/g
)].map(match => Number(match[1]));
for (const { name, body } of keyframeBlocks(runtimeStyle)) {
    if (!/^(?:monster-motion-|tigrex-)/.test(name || '')) continue;
    const turns = rotationValues(body);
    const largestTurn = Math.max(0, ...turns.map(Math.abs));
    if (largestTurn < 300) continue;
    const frames = [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    const finalFrame = frames.find(match => match[1].split(',').some(value => value.trim() === '100%'));
    assert.ok(finalFrame, `${name} must author an explicit 100% recovery frame`);
    assert.doesNotMatch(finalFrame[2], /transform\s*:\s*none/,
        `${name} must not reverse-spin into transform:none while returning`);
    const finalTurns = rotationValues(finalFrame[2]);
    assert.ok(Math.max(0, ...finalTurns.map(Math.abs)) >= largestTurn,
        `${name} must preserve its accumulated rotation through recovery`);
}
assert.match(animatorSource, /easing: 'step-end'/,
    'direction changes must flip the image discretely without a scale-through-zero squash');
assert.match(animatorSource, /tigrexRouteFallback = 'css'/,
    'Tigrex charge must retain a moving CSS fallback if dynamic route keyframes fail');
assert.match(runtimeStyle, /\.game-hunt-monster-img\.enraged\s*\{[\s\S]*?filter:\s*drop-shadow\(0 0 18px/,
    'the rage aura must remain visible when an attack replaces the image animation channel');

{
    const facingAnimator = new HuntMonsterAttackAnimator({
        card: null,
        animationTimers: { timeout() {} },
        selectedMonster: { id: 'rathalos' }
    }, () => {});
    const cross = facingAnimator.facingPlan(
        { id: 'aerial-charge-cross', aim: 'sweep' },
        { runtimeSweepDirection: 'left-to-right' },
        -300
    );
    assert.strictEqual(cross[0].direction, 1,
        'an authored left-to-right crossing must face right even when the first target is left of home');
    assert.strictEqual(cross.at(-1).direction, 0,
        'a crossing must restore the authored sprite direction after it leaves the screen');
    const reverseCross = facingAnimator.facingPlan(
        { id: 'aerial-charge-cross', aim: 'sweep' },
        { runtimeSweepDirection: 'right-to-left' },
        300
    );
    assert.strictEqual(reverseCross[0].direction, -1,
        'a right-to-left crossing must preserve the sprite original left-facing direction');
    const approach = facingAnimator.facingPlan({ id: 'close-strike', aim: 'target' }, {}, 240);
    assert.strictEqual(approach[0].direction, 1);
    assert.strictEqual(approach[2].direction, -1,
        'a target approach must turn around before visibly returning home');
    facingAnimator.owner.selectedMonster = { id: 'diablos' };
    assert.strictEqual(facingAnimator.facingPlan({ id: 'ground-charge-cross', aim: 'target' }, {
        runtimeSweepDirection: 'left-to-right'
    }, 300), null, 'front-facing symmetric sprites must not be mirrored needlessly');
}

{
    assert.deepStrictEqual(
        HuntMonsterAttackAnimator.tigrexRouteDirections(
            [{ x: -420 }, { x: -180 }, { x: 520 }],
            [{ x: -1320 }, { x: 1280 }, { x: 1320 }]
        ),
        [-1, 1, -1],
        'each Tigrex pass must face by its current offscreen origin-to-target vector, not target screen half'
    );
    assert.strictEqual(
        HuntMonsterAttackAnimator.tigrexBranchStartDelayMs(78, 2600, .68, 10),
        5590,
        'the branch scheduler must subtract the scaled branch windup from the real 100 ms combat tick'
    );
    assert.strictEqual(
        HuntMonsterAttackAnimator.tigrexBranchApproachDurationMs(
            { x: -1000, y: 700 }, { x: 0, y: 300 }, { x: 1000, y: 700 },
            { x: 160, y: 364 }, 10000, .2
        ),
        840,
        'the finisher approach duration must preserve the preceding charge speed for the measured route'
    );
    const biteRoute = HuntMonsterAttackAnimator.tigrexBiteRoute(
        { x: -900, y: -700 },
        { x: 120, y: 340 },
        { width: 390, height: 390 },
        { x: .43, y: .72 }
    );
    assert.ok(biteRoute.contact.y < 340,
        'the monster center must compensate for Tigrex mouth being below the image center');
    assert.ok(
        (biteRoute.finish.x - biteRoute.contact.x) * (biteRoute.contact.x + 900)
        + (biteRoute.finish.y - biteRoute.contact.y) * (biteRoute.contact.y + 700) > 0,
        'the second bite must finish beyond the hunter along the incoming charge vector'
    );
    const routeFrames = HuntMonsterAttackAnimator.tigrexChargeRouteKeyframes(
        [{ x: 180, y: 330 }, { x: 180, y: 330 }],
        [{ x: 570, y: 1015 }, { x: -620, y: -1105 }],
        { x: -28, y: -48 },
        2
    );
    const secondHitOffset = routeFrames.impactOffsets[1];
    const secondLaunch = routeFrames.find(frame => frame.offset > .29 && frame.offset < secondHitOffset);
    const firstSpeed = Math.hypot(570 - 180, 1015 - 330) / ((.29 - .176) * 10000);
    const inboundSpeed = Math.hypot(180 - 570, 330 - 1015)
        / ((secondHitOffset - secondLaunch.offset) * 10000);
    const outboundSpeed = Math.hypot(-620 - 180, -1105 - 330)
        / ((routeFrames.routeExitOffset - secondHitOffset) * 10000);
    assert.ok(Math.abs(inboundSpeed - firstSpeed) / firstSpeed < .01);
    assert.ok(Math.abs(outboundSpeed - firstSpeed) / firstSpeed < .01,
        'the second pass must match the first charge speed before and after contact');
    const enragedFrames = HuntMonsterAttackAnimator.tigrexChargeRouteKeyframes(
        [{ x: 180, y: 330 }, { x: 180, y: 330 }, { x: 180, y: 330 }],
        [{ x: 570, y: 1015 }, { x: -620, y: -1105 }, { x: 570, y: 1015 }],
        { x: -28, y: -48 },
        3
    );
    const enragedSecondLaunch = enragedFrames.find(frame =>
        frame.offset > .27 && frame.offset < enragedFrames.impactOffsets[1]);
    const enragedThirdLaunch = enragedFrames.find(frame =>
        frame.offset > enragedFrames.impactOffsets[1]
        && frame.offset < enragedFrames.impactOffsets[2]);
    assert.ok(enragedSecondLaunch && enragedThirdLaunch,
        'enraged second and third passes must each have a distance-balanced offscreen launch');
    const tigrexFacingAnimator = new HuntMonsterAttackAnimator({
        card: null,
        animationTimers: { timeout() {} },
        selectedMonster: { id: 'tigrex' },
        monsterState: 'normal'
    }, () => {});
    const normalTurns = tigrexFacingAnimator.facingPlan(
        { id: 'tigrex-charge-chain' },
        { runtimeTigrexFacingDirections: [-1, 1, -1], targeting: { passCountByState: { normal: 2 } } }
    );
    assert.deepStrictEqual(normalTurns.map(step => [step.offset, step.direction]), [
        [0, -1], [.419, -1], [.42, 1], [.639, 1], [.64, -1], [1, -1]
    ], 'Tigrex must flip at the offscreen relaunch boundary, then face its final branch approach');
}

{
    const slotOneArc = HuntMonsterAttackAnimator.projectileArc(960, 360, 240, 720);
    assert.strictEqual(slotOneArc.startX, 720,
        'a rock aimed at slot 1 must begin on the monster-facing right side of that target');
    assert.strictEqual(slotOneArc.startY, -360);
    assert.ok(slotOneArc.midX > 0 && slotOneArc.midX < slotOneArc.startX,
        'the rock arc must converge from the live monster origin toward the target');
}

{
    const monsterRect = { left: 760, top: 120, width: 400, height: 300 };
    const hunterCenters = [240, 720, 1200, 1680];
    const monsterImg = {
        getBoundingClientRect: () => monsterRect
    };
    const cards = hunterCenters.map((center, index) => {
        const anchor = {
            getBoundingClientRect: () => ({ left: center - 100, top: 650, width: 200, height: 220 })
        };
        return {
            id: `fight-card-${index}`,
            querySelector: selector => selector === '.game-hunt-weapon-img-container' ? anchor : null
        };
    });
    const card = {
        getBoundingClientRect: () => ({ left: 0, top: 0, right: 1920, bottom: 918, width: 1920, height: 918 }),
        querySelector(selector) {
            if (selector === '#fight-monster-img') return monsterImg;
            const match = selector.match(/^#fight-card-(\d+)$/);
            return match ? cards[Number(match[1])] : null;
        }
    };
    const animator = new HuntMonsterAttackAnimator({
        card,
        animationTimers: { timeout() {} },
        selectedMonster: { id: 'rathalos' }
    }, () => {});
    const measured = animator.resolveScreenCrossImpactTimeline({
        tags: ['screen-crossing'],
        movement: { ticks: 40 },
        runtimeSweepDirection: 'left-to-right'
    }, [0, 1, 2, 3]);
    assert.deepStrictEqual(measured.timeline.map(event => event.atTicks), [12, 16, 20, 24],
        'live hunter centers must determine collision ticks inside the visible 10%-82% crossing segment');
    assert.deepStrictEqual(measured.timeline.map(event => event.targetIndices[0]), [0, 1, 2, 3]);
    assert.strictEqual(measured.runtimeSweepVector, 1,
        'sprite facing must derive from the same measured left-to-right trajectory as collision timing');

    const reverse = animator.resolveScreenCrossImpactTimeline({
        tags: ['screen-crossing'],
        movement: { ticks: 40 },
        runtimeSweepDirection: 'right-to-left'
    }, [3, 2, 1, 0]);
    assert.deepStrictEqual(reverse.timeline.map(event => event.atTicks), [12, 16, 20, 24]);
    assert.deepStrictEqual(reverse.timeline.map(event => event.targetIndices[0]), [3, 2, 1, 0]);
    assert.strictEqual(reverse.runtimeSweepVector, -1);

    const leadingEdge = animator.resolveScreenCrossImpactTimeline({
        tags: ['screen-crossing'],
        movement: { ticks: 40 },
        impact: { contactLeadRatio: .25 },
        runtimeSweepDirection: 'left-to-right'
    }, [0, 1, 2, 3]);
    assert.deepStrictEqual(leadingEdge.timeline.map(event => event.atTicks), [11, 15, 19, 23],
        'authored collision depth must resolve when the leading body edge reaches each hunter');
}

const cases = [
    ['화염 브레스', 'ranged-cast'], ['꼬리 회전', 'tail-sweep'], ['전력 돌진', 'ground-charge'],
    ['공중 급강하', 'aerial-dive'], ['지중 급습', 'burrow-emerge'], ['바디 프레스', 'leap-slam'],
    ['앞발 할퀴기', 'close-strike'], ['대폭발', 'area-burst'], ['포효', 'roar']
];
cases.forEach(([name, expected]) => assert.strictEqual(Catalog.resolve({ name }, name, 'physical').id, expected, name));
assert.strictEqual(Catalog.resolve({ id: 'diablos.horn_uppercut', tags: ['horn', 'target-contact'] }).duration, 2800);
assert.strictEqual(Catalog.resolve({
    id: 'diablos.tail_sweep', tags: ['tail'], animationProfile: 'diablos-tail-cross'
}).duration, 4000);
assert.strictEqual(Catalog.resolve({
    id: 'future_monster.tail_slam_rock', tags: ['tail', 'projectile'], animationProfile: 'tail-slam-rock'
}).id, 'tail-slam-rock');
assert.strictEqual(Catalog.resolve({
    id: 'future_monster.side_tackle', tags: ['target-contact'], animationProfile: 'side-tackle-contact'
}).id, 'side-tackle-contact');
assert.strictEqual(Catalog.resolve({
    id: 'future_monster.return_charge',
    tags: ['charge', 'cross-charge'],
    animationProfile: 'ground-charge-double'
}).duration, 11400, 'any reviewed monster may reuse the authored double-charge route');
assert.strictEqual(Catalog.resolve({
    id: 'future_monster.air_sweep',
    type: 'charge',
    chargeMode: 'wide',
    tags: ['charge', 'wide-charge']
}).id, 'aerial-charge-cross',
'wide charges must use screen traversal instead of target-contact charge motion');
assert.strictEqual(Catalog.resolve({ name: '미분류 공격' }, '', 'elemental').id, 'ranged-cast');
assert.strictEqual(Catalog.resolve({ name: '미분류 공격' }, '', 'physical').id, 'close-strike');
assert.strictEqual(Catalog.resolve({ name: '피날레', type: 'ultimate' }, '', 'physical').ultimate, true);
assert.strictEqual(Catalog.resolve({ id: 'diablos.burrow_enter', name: '지중 잠행', tags: ['burrow-enter'] }).id, 'burrow-enter');
assert.strictEqual(Catalog.resolve({ id: 'diablos.burrow_emerge', name: '지중 급습', tags: ['burrow-emerge'] }).id, 'burrow-emerge');
assert.strictEqual(Catalog.resolve({ id: 'diablos.tail_sweep', name: '꼬리 휘두르기', tags: ['tail', 'double-sweep'] }).id, 'tail-sweep-double');
assert.strictEqual(Catalog.resolve({
    id: 'diablos.horn_sweep', name: '연속 뿔 휘두르기', tags: ['horn', 'multi-hit', 'target-contact']
}).id, 'horn-sweep-contact');
assert.strictEqual(Catalog.resolve({ name: '포효' }, '포효', 'physical').duration, 1313,
    'monster visual profiles must use the shared 25% slowdown');

assert.strictEqual(Catalog.resolve({ name: '광란의 지그재그 돌진', tags: ['charge', 'cross-charge', 'multi-hit'] }).id, 'ground-charge-zigzag');
assert.strictEqual(Catalog.resolve({ name: '화염 브레스 쓸기', tags: ['area', 'elemental'] }).id, 'lateral-sweep');
assert.strictEqual(Catalog.resolve({ name: '연속 발톱 공격', tags: ['multi-hit'] }).id, 'pounce-chain');

const css = require('./helpers/hunt-css');
assert.strictEqual(HuntMonsterAttackAnimator.usesElementalDelivery('physical', {
    type: 'projectile',
    delivery: 'projectile',
    projectileVisual: 'rock'
}), false, 'dedicated physical rocks must never fall through to the purple elemental projectile renderer');
assert.strictEqual(HuntMonsterAttackAnimator.usesElementalDelivery('elemental', {
    type: 'projectile',
    delivery: 'projectile'
}), true, 'elemental projectiles must retain the shared projectile renderer');
for (const id of ['ground-charge-zigzag', 'ground-charge-double', 'aerial-charge-cross', 'lateral-sweep', 'pounce-chain', 'burrow-enter', 'burrow-emerge', 'tail-sweep-double', 'tail-slam-rock', 'side-tackle-contact', 'horn-sweep-contact', 'diablos-tail-cross']) {
    assert(css.includes(`.monster-motion-${id}`), `${id} class must exist`);
    assert(css.includes(`@keyframes monster-motion-${id}`), `${id} keyframes must exist`);
}
for (const id of [
    'rathalos-bite-contact', 'rathalos-rush-bite', 'rathalos-fireball',
    'rathalos-triple-fireball', 'rathalos-step-fireball', 'rathalos-backstep-fireball',
    'rathalos-claw-dive', 'rathalos-air-kick-combo', 'rathalos-tail-sweep-double',
    'rathalos-flame-sweep', 'rathalos-stomp', 'rathalos-glide'
]) {
    assert.strictEqual(Catalog.resolve({ animationProfile: id }).id, id);
    assert(css.includes(`.monster-motion-${id}`), `${id} class must exist`);
    assert(css.includes(`@keyframes monster-motion-${id}`), `${id} keyframes must exist`);
}
assert(css.includes('var(--monster-lane-x)'), 'wide motions must scale to the available monster lane');
assert(css.includes('.hunt-monster-attack-motion'), 'monster attacks need an isolated transform owner outside the status-effect image');
assert(css.includes('.hunt-monster-facing-layer'), 'direction changes need a nested layer isolated from travel and hit transforms');
assert(css.includes('.monster-local-action-fx.tail-vortex'), 'Diablos tail sweep needs its local vortex emoji layer');
assert(css.includes('--tail-rock-start-x'),
    'Diablos rocks must launch from the live monster position instead of a fixed off-screen offset');
assert(css.includes('--tail-rock-mid-x'),
    'Diablos rocks must preserve their authored arc while travelling toward each hunter slot');
assert(css.includes('var(--monster-charge-second-x)'), 'return charge needs a separately locked second target lane');
assert(css.includes('var(--monster-charge-cross-y)'), 'wide aerial charges need a hunter-row crossing route');
assert(css.includes('.monster-uppercut-launched'), 'uppercut launch reactions must be reusable across monsters');
assert(!css.includes('.diablos-horn-launched'), 'shared launch reactions must not retain monster-specific selectors');
const ironMountainFrames = css.match(/@keyframes monster-motion-side-tackle-contact\s*\{[\s\S]*?\n\}/)?.[0] || '';
assert.ok(ironMountainFrames, 'Iron Mountain contact keyframes must exist');
assert.ok(!/rotate\(90deg\)/.test(ironMountainFrames), 'Iron Mountain must not rotate the whole Diablos sprite by 90 degrees');
{
    const burrowFrames = css.match(/@keyframes monster-motion-burrow-emerge\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(burrowFrames, /--monster-burrow-apex-y/,
        'burrow emergence must use the hunter-relative measured apex');
    assert.match(burrowFrames, /100%\{transform:none/,
        'burrow emergence must return the monster to its home position');
    assert.doesNotMatch(burrowFrames, /monster-attack-y\)\s*-\s*95px/,
        'burrow emergence must not use the old fixed-height overshoot');
}
{
    const doubleChargeFrames = css.match(/@keyframes monster-motion-ground-charge-double\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(doubleChargeFrames, /\b14%\b/,
        'Diablos return charge must not spend an opening segment on an anticipation pose');
    assert.match(doubleChargeFrames, /34%[^}]*--monster-charge-first-exit-y/,
        'the first pass must continue along its target vector to a measured off-board exit');
    assert.match(doubleChargeFrames, /35%[^}]*--monster-charge-first-exit-y/,
        'the first pass may disappear only after reaching that off-board exit');
    assert.match(doubleChargeFrames, /18%[^}]*--monster-charge-first-y/,
        'the first collision frame must cross the locked hunter position');
    assert.match(doubleChargeFrames, /40%[^}]*--monster-charge-first-exit-y/,
        'the return pass must launch immediately from off-board without a second telegraph');
    assert.match(doubleChargeFrames, /40%[^}]*--monster-charge-first-exit-x/,
        'the return pass must inherit the first pass off-board exit instead of pre-positioning below its next hunter');
    assert.doesNotMatch(doubleChargeFrames, /40%[^}]*--monster-charge-second-x/,
        'the return pass must not teleport to the next hunter lane before launching');
    assert.match(doubleChargeFrames, /62%[^}]*--monster-charge-second-y/,
        'the return collision frame must cross its separately locked hunter');
    assert.match(doubleChargeFrames, /78%[^}]*--monster-charge-second-exit-y/,
        'the return pass must continue through its hunter and leave the opposite edge before home recovery');
    assert.doesNotMatch(doubleChargeFrames, /rotate\(180deg\)/,
        'the shared facing layer must turn return charges without flipping the monster upside down');
    assert.match(css, /\.monster-motion-ground-charge-double\s*\{[^}]*\slinear\s/,
        'both charge passes must keep continuous speed through hunter collision frames');
}
for (const rig of ['quadruped', 'winged', 'serpentine', 'arthropod']) {
    assert(css.includes(`data-monster-rig="${rig}"`), `${rig} rig needs a visual transform origin`);
    assert(css.includes(`monster-motion-close-strike-${rig}`), `${rig} rig needs a distinct close-strike motion`);
}

{
    const timers = [];
    const classes = new Set();
    const classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        [Symbol.iterator]: () => classes[Symbol.iterator]()
    };
    const properties = new Map();
    const style = {
        setProperty(name, value) { properties.set(name, value); },
        removeProperty(name) { properties.delete(name); }
    };
    const monsterImg = {
        classList, style, dataset: {}, offsetWidth: 100,
        getBoundingClientRect: () => ({ left: 300, top: 200, width: 200, height: 180, bottom: 380 }),
        closest: () => ({ clientWidth: 900 }),
        addEventListener() {},
        removeEventListener() {}
    };
    const targetCard = {
        id: 'fight-card-0',
        getBoundingClientRect: () => ({ left: 80, top: 620, width: 260, height: 300 })
    };
    const animator = new HuntMonsterAttackAnimator({
        card: { getBoundingClientRect: () => ({ width: 1920, bottom: 1080 }) },
        animationTimers: { timeout: callback => timers.push(callback) },
        selectedMonster: { id: 'diablos', species: 'Flying Wyvern' }
    }, () => {});
    animator.playPatternMotion(monsterImg, targetCard, { id: 'diablos.horn_uppercut', name: '뿔 쳐올리기' }, '뿔 쳐올리기', 'physical');
    assert.strictEqual(Number.parseFloat(properties.get('--monster-attack-x')), -190,
        'the uppercut must cover the complete horizontal route to the hunter');
    assert(Number.parseFloat(properties.get('--monster-attack-y')) > 300,
        'the uppercut must reach the hunter weapon before lifting instead of stopping nearby');
    animator.playPatternMotion(monsterImg, targetCard, {
        id: 'future_monster.short_uppercut',
        name: '짧은 쳐올리기',
        tags: ['target-contact'],
        animationProfile: 'horn-uppercut',
        animationGeometry: { approachX: .5, approachY: .4 }
    }, '짧은 쳐올리기', 'physical');
    assert.strictEqual(Number.parseFloat(properties.get('--monster-attack-x')), -95,
        'another monster must be able to retune a shared motion without an ID branch');
    assert(Number.parseFloat(properties.get('--monster-attack-y')) < 250);
    animator.playPatternMotion(monsterImg, targetCard, {
        id: 'diablos.side_tackle', name: '철산고', tags: ['physical', 'side-tackle', 'target-contact'],
        animationProfile: 'side-tackle-contact'
    }, '철산고', 'physical');
    assert.strictEqual(
        Number.parseFloat(properties.get('--monster-side-ready-y')),
        Number.parseFloat(properties.get('--monster-attack-y')) * .7,
        'Iron Mountain must stop with 30% of the target route remaining before the body check'
    );
    assert(classes.has('monster-motion-side-tackle-contact'));
    animator.playPatternMotion(monsterImg, targetCard, { id: 'diablos.tail_sweep', name: '꼬리 휘두르기', tags: ['tail'] }, '꼬리 휘두르기', 'physical');
    assert(classes.has('monster-motion-tail-sweep'));
    timers[0]();
    assert(classes.has('monster-motion-tail-sweep'), 'an old cleanup timer must not stop the next monster animation');
    timers.at(-1)();
    assert(!classes.has('monster-motion-tail-sweep'));

    animator.playPatternMotion(monsterImg, targetCard, {
        id: 'diablos.horn_sweep', name: '연속 뿔 휘두르기', tags: ['horn', 'multi-hit', 'target-contact']
    }, '연속 뿔 휘두르기', 'physical');
    assert(classes.has('monster-motion-horn-sweep-contact'));
    animator.clearActiveMonsterMotion();
    assert(!classes.has('monster-motion-horn-sweep-contact'));
    assert.strictEqual(properties.has('transform'), false);
}

{
    const properties = new Map();
    const animator = new HuntMonsterAttackAnimator({
        card: null,
        animationTimers: { timeout() {} },
        selectedMonster: { id: 'diablos', species: 'Flying Wyvern' }
    }, () => {});
    const position = animator.positionBurrowEmergence(
        { style: { setProperty(name, value) { properties.set(name, value); } } },
        { getBoundingClientRect: () => ({ left: 700, top: 180, width: 240, height: 240 }) },
        { getBoundingClientRect: () => ({ left: 240, top: 620, width: 200, height: 300 }) },
        { clientWidth: 1500 }
    );
    assert.strictEqual(position.targetY, 470);
    assert.strictEqual(position.apexY, 410,
        'emergence apex must be 20% of the measured hunter anchor height above the hunter');
    assert.strictEqual(properties.get('--monster-burrow-apex-y'), '410px');
}

{
    const motionWrapper = {
        classList: { contains: name => name === 'hunt-monster-attack-motion' }
    };
    const monsterImg = {
        parentElement: motionWrapper,
        closest: () => ({ className: 'hunt-monster-motion-stage' })
    };
    const animator = new HuntMonsterAttackAnimator({
        card: null,
        animationTimers: { timeout() {} },
        selectedMonster: { id: 'diablos', species: 'Flying Wyvern' }
    }, () => {});
    let attachedContainer = null;
    animator.createLocalEmojiFx = container => { attachedContainer = container; return {}; };
    animator.createMonsterAttachedEmojiFx(monsterImg, '🌀', 'tail-vortex', 3100);
    assert.strictEqual(attachedContainer, motionWrapper,
        'Diablos spin emoji must ride the moving monster layer instead of staying at the stage home position');
}

{
    const timers = [];
    const listeners = {};
    const classes = new Set(['hunt-monster-attack-motion']);
    const classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        [Symbol.iterator]: () => classes[Symbol.iterator]()
    };
    const properties = new Set();
    const style = {
        setProperty(name) { properties.add(name); },
        removeProperty(name) { properties.delete(name); }
    };
    const wrapper = {
        classList, style, dataset: {}, offsetWidth: 100, isConnected: true,
        addEventListener(type, callback) { listeners[type] = callback; },
        removeEventListener(type, callback) { if (listeners[type] === callback) delete listeners[type]; }
    };
    const monsterImg = {
        parentElement: wrapper,
        classList: { contains: () => false },
        getBoundingClientRect: () => ({ left: 300, top: 200, width: 200, height: 180, bottom: 380 }),
        closest: () => ({ clientWidth: 900 })
    };
    const targetCard = {
        id: 'fight-card-0',
        getBoundingClientRect: () => ({ left: 80, top: 620, width: 260, height: 300 })
    };
    const cardClasses = new Set(['hunt-monster-underground', 'monster-charge-rumble']);
    const animator = new HuntMonsterAttackAnimator({
        card: {
            classList: { remove: (...names) => names.forEach(name => cardClasses.delete(name)) },
            getBoundingClientRect: () => ({ width: 1920, bottom: 1080 }),
            querySelectorAll(selector) {
                return selector === '.hunt-monster-attack-motion' ? [wrapper] : [];
            }
        },
        animationTimers: {
            timeout(callback) { timers.push(callback); return timers.length - 1; },
            clear() {}
        },
        selectedMonster: { id: 'diablos', species: 'Flying Wyvern' }
    }, () => {});
    animator.playPatternMotion(monsterImg, targetCard, {
        id: 'diablos.horn_sweep', name: '연속 뿔 휘두르기', tags: ['horn', 'multi-hit', 'target-contact']
    }, '연속 뿔 휘두르기', 'physical');
    assert(classes.has('monster-motion-horn-sweep-contact'));
    listeners.animationend({
        type: 'animationend',
        target: monsterImg,
        animationName: 'monster-signature-ultimate'
    });
    assert(classes.has('monster-motion-horn-sweep-contact'),
        'a status or spectacle animation ending on the child image must not cancel the attack-motion wrapper');
    listeners.animationend({
        type: 'animationend',
        target: wrapper,
        animationName: 'monster-motion-horn-sweep-contact'
    });
    assert(!classes.has('monster-motion-horn-sweep-contact'));
    const events = animator.getMonsterMotionTrace().map(entry => entry.event);
    assert(events.includes('ignored-child-event'));
    assert(events.includes('complete'));

    classes.add('monster-motion-ground-charge-double');
    properties.add('animation');
    properties.add('transform');
    animator.clearMonsterMotion('knockdown');
    assert(!classes.has('monster-motion-ground-charge-double'),
        'knockdown must remove stale travel classes even after active-motion bookkeeping was lost');
    assert(!properties.has('animation'));
    assert(!properties.has('transform'));
    assert(!cardClasses.has('hunt-monster-underground'));
    assert(!cardClasses.has('monster-charge-rumble'));
}

console.log('[test] Monster animation semantic and wide-lane coverage passed.');

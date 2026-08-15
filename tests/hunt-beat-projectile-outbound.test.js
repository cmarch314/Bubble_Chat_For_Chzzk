const assert = require('assert');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

const board = { left: 100, top: 50, width: 1000, height: 600 };
const left = HuntMonsterAttackAnimator.outboundProjectileTarget(board, 'left');
const right = HuntMonsterAttackAnimator.outboundProjectileTarget(board, 'right');

assert(left, 'left outer lane has a visual target');
assert(right, 'right outer lane has a visual target');
assert(left.getBoundingClientRect().left < board.left, 'left lane exits past board edge');
assert(right.getBoundingClientRect().left > board.left + board.width, 'right lane exits past board edge');
assert.strictEqual(HuntMonsterAttackAnimator.outboundProjectileTarget(board, 'primary'), null,
    'only authored outer lanes synthesize a target');

const rendered = HuntMonsterAttackAnimator.motionFromCompiledBeat({
    beatV2Enabled: true,
    beatV2: { beats: [{
        id: 'spit', ticks: 7,
        tracks: { visual: [
            { offsetTicks: 0, value: { pose: 'stretch-strong' } },
            { offsetTicks: 1, value: { pose: 'brace' } },
            { offsetTicks: 4, value: { pose: 'idle' } }
        ] }
    }] }
});
assert.deepStrictEqual(rendered.motion.map(beat => [beat.beat, beat.ticks]), [
    ['spit', 1], ['spit@1', 3], ['spit@4', 3]
], 'within-BEAT visual frames compile into contiguous renderer segments');

console.log('hunt-beat-projectile-outbound: ok');

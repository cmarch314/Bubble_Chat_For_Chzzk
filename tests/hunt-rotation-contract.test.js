'use strict';

const assert = require('assert');
const Rotation = require('../js/effects/hunt/HuntRotationContract.js');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');

assert.deepStrictEqual(
    ['clockwise', 'counterclockwise'].map(rotationDirection =>
        Rotation.resolve({ rotationDirection, rotationDegrees: 15 }, 0).final),
    [15, -15],
    'image-local direction must produce opposite signed angles'
);
assert.strictEqual(Rotation.resolve({ to: 'home', rotation: 0 }, -330).final, -330,
    'automatic home recovery must translate without adding a finishing or reverse turn');
assert.strictEqual(Rotation.resolve({ to: 'home', rotation: 0, rotationResetMode: 'animate' }, -330).final, 0,
    'an explicit animate mode may author a visible return rotation');
assert.strictEqual(Rotation.resolve({ rotationDirection: 'clockwise', rotationDegrees: 360 }, -15).final, 345,
    'directed full turns must accumulate without normalizing away their path');
assert.deepStrictEqual(Rotation.canonicalize({
    rotation: -15, rotationDirection: 'counterclockwise', rotationDegrees: 15,
    rotateBy: 80, rotateByFacing: -40
}), { rotationDirection: 'counterclockwise', rotationDegrees: 15 },
'directed rotation must have one persisted owner');

const candidate = ({ value }) => ({
    schemaVersion: 1,
    monsterId: 'rotation-test',
    status: 'candidate',
    actions: [{
        id: 'rotation-test.turn', name: 'turn',
        graph: {
            schemaVersion: 2, backend: 'beat-v2', reviewStatus: 'draft',
            atb: { cost: 1, recovery: 'during-action', gateUntil: 'complete' },
            beats: [{ id: 'turn', ticks: 4,
                tracks: { visual: [{ offsetTicks: 0, value }] }, events: [] }]
        }
    }]
});
const canonicalCandidate = CandidateCatalog.compileKit(candidate({ value: {
    pose: 'idle', rotation: 15, rotationDirection: 'counterclockwise', rotationDegrees: 15
} }));
assert.deepStrictEqual(canonicalCandidate.actions[0].motion[0], {
    beat: 'turn', ticks: 4, pose: 'idle',
    rotationDirection: 'counterclockwise', rotationDegrees: 15
}, 'native candidate projection must remove the competing absolute angle before Preview/live compile');
assert.throws(() => CandidateCatalog.compileKit(candidate({ value: { rotateByFacing: 15 } })),
    /legacy rotation fields are forbidden/,
    'native candidates must reject hidden legacy rotation owners');

console.log('[test] shared hunt rotation contract passed');

'use strict';

const assert = require('assert');
const data = require('../js/effects/hunt/data/WildsMotionValues.generated.js');
const HuntMotionValueCatalog = require('../js/effects/hunt/HuntMotionValueCatalog.js');

const reference = HuntMotionValueCatalog.resolve('bow', { id: 'bow.arc_shot' }, data);
assert(reference && /Arc Shot/i.test(reference.name));
const enriched = HuntMotionValueCatalog.enrich('great_sword', { id: 'great_sword.offset_rising', motionValue: 70 }, data);
assert.strictEqual(enriched.motionValueEvidence, 'wilds-1.040-community-sheet');
assert(enriched.motionTimeSeconds > 0, 'motion value must provide an explicit timing proxy');
assert.match(enriched.timingEvidence, /motion-value-proxy/);
const timing = HuntMotionValueCatalog.timingFor('great_sword', enriched, { windupTicks: 4, activeTicks: 3, recoveryTicks: 6, durationTicks: 13 });
assert.strictEqual(timing.atbOccupancyTicks, enriched.motionTimingReference.ticks);
assert.match(timing.timingEvidence, /motion-value-proxy/);

const lightProxy = HuntMotionValueCatalog.motionValueTiming({ motionValue: 20 });
const heavyProxy = HuntMotionValueCatalog.motionValueTiming({ motionValue: 200 });
assert(lightProxy.ticks < heavyProxy.ticks, 'higher motion value must occupy more ATB time');
assert.strictEqual(HuntMotionValueCatalog.motionValueTiming({ motionValue: 0 }), null, 'preparation actions retain authored timing');

const measuredTiming = HuntMotionValueCatalog.timingFor('great_sword', {
    id: 'great_sword.test_measured_action',
    motionTimeSeconds: 1.8,
    timingEvidence: 'installed-game-action-to-motion-link',
    tags: ['charge']
}, { windupTicks: 1, activeTicks: 1, recoveryTicks: 1, durationTicks: 3 });
assert.strictEqual(measuredTiming.durationTicks, 18);
assert.strictEqual(measuredTiming.atbOccupancyTicks, 18, 'verified motion seconds must become ATB occupancy at 10 ticks/second');
assert.strictEqual(measuredTiming.timingEvidence, 'installed-game-action-to-motion-link');

const captured = HuntMotionValueCatalog.enrich('great_sword', {
    id: 'great_sword.tackle', motionValue: 26
}, data, { actions: { 'great_sword.tackle': {
    seconds: 1.2,
    motionId: 42,
    semanticEvidence: 'reframework-action-class+live-motion-observation',
    timingEvidence: 'installed-game-motlist-header'
} } });
assert.strictEqual(captured.motionTimeSeconds, 1.2);
assert.strictEqual(captured.motionTimingReference.motionId, 42);
assert.match(captured.timingEvidence, /live-motion-observation/);

const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const weaponIds = Object.keys(HuntWeaponMechanics.canonicalActions());
let damagingActions = 0;
let sheetMatches = 0;
weaponIds.forEach(weaponId => {
    HuntWeaponMechanics.actionsFor(weaponId).filter(action => Number(action.motionValue) > 0).forEach(action => {
        damagingActions++;
        if (HuntMotionValueCatalog.resolve(weaponId, action, data)) sheetMatches++;
    });
});
assert.ok(sheetMatches >= 100, `canonical MV linkage regressed: ${sheetMatches}/${damagingActions}`);

console.log('[test] Wilds motion-value and ATB occupancy contract passed.');

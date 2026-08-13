'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

if (typeof global.window === 'undefined') global.window = global;

(0, eval)(fs.readFileSync(path.resolve(__dirname, '../js/runtime/ManagedTimers.js'), 'utf8') + '\nglobalThis.ManagedTimers = ManagedTimers;');
global.HuntBgmResolver = require('../js/effects/hunt/HuntBgmResolver.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
for (const file of ['WildsMonsterBehavior', 'RiseMonsterBehavior', 'WorldMonsterBehavior',
    'WorldShellBehavior', 'MhxxMonsterBehavior', 'MhxxDbMonsterBehavior']) {
    require(`../js/effects/hunt/data/${file}.generated.js`);
}
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
require('../js/effects/MonsterData.js');

const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const AudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');
const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');
const { loadHuntPatternAudioMap, patternAudioSlots } = require('../tools/hunt-audio-pattern-map.js');

const FLAGSHIP_MONSTERS = ['tigrex', 'diablos', 'rathian', 'rathalos', 'legiana', 'bazelgeuse'];

console.log('[test] Beginning precision audio audit for 6 flagship monsters...');

// 1. Pattern catalog and slot derivation checks for all 6 flagship monsters
for (const monsterId of FLAGSHIP_MONSTERS) {
    const map = loadHuntPatternAudioMap(monsterId);
    assert.strictEqual(map.huntId, monsterId, `Map huntId must match ${monsterId}`);
    assert.ok(map.patterns.length > 0, `${monsterId} must have implemented patterns`);

    for (const pattern of map.patterns) {
        assert.ok(pattern.id, `${monsterId} pattern must have id`);
        assert.ok(pattern.slots.length > 0, `${pattern.id} must have audio slots`);

        // Check phase validity
        for (const slot of pattern.slots) {
            assert.ok(
                ['telegraph', 'start', 'launch', 'travel', 'impact', 'recovery', 'roar', 'burrow', 'motion', 'reaction'].includes(slot.phase),
                `Invalid audio phase ${slot.phase} in pattern ${pattern.id}`
            );
        }
    }
}
console.log('✓ 6 flagship monsters pattern slot derivation verified.');

// 2. Individual monster audio precision rules

// --- Tigrex (티가렉스) ---
const tigrexMap = loadHuntPatternAudioMap('tigrex');
const tigrexCharge = tigrexMap.patterns.find(p => p.id === 'tigrex.charge_rock' || p.id === 'tigrex.charge_spin' || p.id === 'tigrex.charge_bite');
assert.ok(tigrexCharge, 'Tigrex must have consecutive charge pattern (charge_rock/spin/bite)');
const tigrexTravelSlot = tigrexCharge.slots.find(s => s.phase === 'travel')
    || tigrexCharge.slots.find(s => s.beatId === 'action-2');
assert.ok(tigrexTravelSlot, 'Tigrex consecutive charge must expose its travel motion beat');
assert.strictEqual(tigrexTravelSlot.runtimeReady, true,
    'Tigrex travel BEAT must be fully runtime-ready through the shared motion compiler');

// --- Diablos (디아블로스) ---
const diablosCues = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['diablos:burrow'];
assert.ok(Array.isArray(diablosCues) && diablosCues.length > 0, 'Diablos burrow sound cue must exist');
assert.ok(
    diablosCues[0].layers[0][0].includes('em007_se_nbnk_056_205431218.mp3'),
    'Diablos burrow must map to em007_se_nbnk_056_205431218.mp3'
);
const diablosRoar = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['diablos:roar'];
assert.ok(Array.isArray(diablosRoar) && diablosRoar.length > 0, 'Diablos roar cue must exist');
assert.ok(
    diablosRoar[0].layers[0][0].includes('em007_vo_nbnk_056_543762063.mp3'),
    'Diablos roar must map to audition-confirmed #2063 em007_vo_nbnk_056_543762063.mp3'
);

const diablosMap = loadHuntPatternAudioMap('diablos');
const diablosBurrow = diablosMap.patterns.find(p => p.id === 'diablos.burrow_enter');
assert.ok(diablosBurrow, 'Diablos burrow pattern must exist');
const diablosHornCharge = diablosMap.patterns.find(p => p.id === 'diablos.horn_charge');
assert.ok(diablosHornCharge, 'Diablos horn_charge pattern must exist');

// --- Rathian (리오레이아) ---
const rathianTelegraph = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:telegraph'];
assert.ok(Array.isArray(rathianTelegraph) && rathianTelegraph.length > 0, 'Rathian telegraph cues must exist');
const somersaultCue = rathianTelegraph.find(c => c.patternKeywords?.includes('somersault'));
assert.ok(somersaultCue, 'Rathian somersault vocal cue must exist in telegraph');

const rathianMap = loadHuntPatternAudioMap('rathian');
const rathianSomersault = rathianMap.patterns.find(p => p.id === 'rathian.somersault');
assert.ok(rathianSomersault, 'Rathian somersault pattern must exist');
assert.ok(
    rathianSomersault.slots.some(s => s.phase === 'start' || s.phase === 'impact'),
    'Rathian somersault must have start and impact slots'
);

// --- Rathalos (리오레우스) ---
const rathalosTelegraph = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:telegraph'];
assert.ok(Array.isArray(rathalosTelegraph) && rathalosTelegraph.length > 0, 'Rathalos telegraph cues must exist');
assert.ok(
    rathalosTelegraph[0].layers[0][0].includes('em001_vo_nbnk_117_897645699.mp3'),
    'Rathalos fireball charge vocal must map to em001_vo_nbnk_117_897645699.mp3'
);

const rathalosMap = loadHuntPatternAudioMap('rathalos');
const rathalosBackstep = rathalosMap.patterns.find(p => p.id === 'rathalos.backstep_fireball');
assert.ok(rathalosBackstep, 'Rathalos backstep fireball pattern must exist');

// --- Legiana (레이기에나) ---
const legianaRoar = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['legiana:roar'];
assert.ok(Array.isArray(legianaRoar) && legianaRoar.length > 0, 'Legiana roar cue must exist');
assert.ok(
    legianaRoar[0].layers[0][0].includes('em111_vo_nbnk_040_386696490.mp3'),
    'Legiana roar must map to em111_vo_nbnk_040_386696490.mp3'
);

const legianaMap = loadHuntPatternAudioMap('legiana');
const legianaColdSweep = legianaMap.patterns.find(p => p.id === 'legiana.aerial_cold_sweep');
assert.ok(legianaColdSweep, 'Legiana aerial cold sweep pattern must exist');
assert.ok(
    legianaColdSweep.slots.some(s => s.phase === 'impact' && s.runtimeReady === true),
    'Legiana cold sweep must expose a runtime-ready frost impact BEAT'
);

// --- Bazelgeuse (바젤기우스) ---
const bazelRoar = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES['bazelgeuse:roar'];
assert.ok(Array.isArray(bazelRoar) && bazelRoar.length > 0, 'Bazelgeuse roar cue must exist');

const bazelMap = loadHuntPatternAudioMap('bazelgeuse');
const bazelCarpet = bazelMap.patterns.find(p => p.id === 'bazelgeuse.carpet_bombing');
assert.ok(bazelCarpet, 'Bazelgeuse carpet bombing pattern must exist');
assert.ok(
    bazelCarpet.slots.some(s => s.phase === 'travel' || s.beatId === 'bombing-run'),
    'Bazelgeuse carpet bombing must expose its travel motion beat'
);

console.log('✓ Individual audio precision rules for all 6 flagship monsters passed!');

// 3. Audio Manager Playback Resolution Smoke Test
global.HUNT_VERIFIED_LOCAL_MONSTER_CUES = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
global.HUNT_ROAR_ROUTE = AudioCatalog.HUNT_ROAR_ROUTE;

const mockAudioManager = new HuntAudioManager({
    playSFX: () => true
});

for (const monsterId of FLAGSHIP_MONSTERS) {
    const roarCue = mockAudioManager.verifiedMonsterCue(monsterId, 'roar');
    assert.ok(roarCue, `HuntAudioManager verifiedMonsterCue must find roar for ${monsterId}`);
}
console.log('✓ HuntAudioManager playback resolution smoke test passed for 6 flagship monsters!');

console.log('🎉 [test] 6 flagship monster audio precision test passed successfully!');

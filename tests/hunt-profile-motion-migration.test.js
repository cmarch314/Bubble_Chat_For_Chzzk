'use strict';

const assert = require('assert');
const fs = require('fs');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterAnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const HuntMonsterProfileMotionRuntime = require('../js/effects/hunt/HuntMonsterProfileMotionRuntime.js');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');

const labels = JSON.parse(fs.readFileSync('data/hunt/world-monster-audio-review-labels.json', 'utf8'));
const missing = [];
let authored = 0, migrated = 0;
for (const monsterId of labels.runtimePolicy?.completedMonsterIds || []) {
    for (const pattern of loadHuntPatternAudioMap(monsterId).patterns) {
        if (pattern.motionGraph?.renderer === 'beat') { authored += 1; continue; }
        const profile = HuntMonsterAnimationCatalog.resolve(pattern, pattern.name, pattern.type, { id: monsterId });
        const frames = HuntMonsterProfileMotionRuntime.frames(profile.id, pattern, profile.rig.id);
        if (!frames?.length) missing.push(`${monsterId}/${pattern.id}:${profile.id}`);
        else migrated += 1;
    }
}
assert.deepStrictEqual(missing, [],
    `every reviewed keyframe BEAT pattern must have generated non-CSS keyframes: ${missing.join(', ')}`);

const animatorSource = fs.readFileSync('js/effects/hunt/HuntMonsterAttackAnimator.js', 'utf8');
assert.match(animatorSource, /disableCssAnimation:\s*useDynamicTigrexRoute\s*\|\|\s*Boolean\(profileGraphFrames\?\.length\)/,
    'generated profile graphs must suppress their old CSS animation class at runtime');
assert.doesNotMatch(animatorSource, /adaptProfileMotion\s*\(/,
    'runtime must never capture or retime a live legacy CSS animation');
console.log(`[test] profile motion migration passed: ${authored} authored BEAT, ${migrated} generated profile graphs.`);

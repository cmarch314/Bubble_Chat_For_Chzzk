'use strict';

const assert = require('assert');
const { HuntBeatV2Contract } = require('../js/effects/hunt/HuntBeatV2Contract.js');
global.HuntBeatV2Contract = HuntBeatV2Contract;
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');
const HuntMonsterReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
const fs = require('fs');
const path = require('path');

const compiled = HuntMonsterReactionCatalog.compile({
    id: 'sleep', patternId: '__reaction.sleep', visualType: 'sleeping',
    controlType: 'sleep', motion: [{ beat: 'held', ticks: 65, pose: 'land' }]
});
assert.strictEqual(compiled.actor, 'reaction');
assert.strictEqual(compiled.reviewStatus, 'approved');
assert.deepStrictEqual(compiled.events.map(event => event.atTicks), [0, 30, 60],
    'held sleep audio must be authored at entry and each three-second BEAT interval');

const observed = [];
const runtime = new HuntBeatActionRuntime({
    onEvent: (_state, event) => observed.push(event.atTicks)
});
runtime.begin('reaction:monster', compiled);
for (let tick = 0; tick < compiled.totalTicks; tick++) runtime.tick('reaction:monster');
assert.deepStrictEqual(observed, [0, 30, 60],
    'reaction cues must be emitted by the shared BEAT runtime, never renderer timeouts');

const engineSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntEngine.js'), 'utf8');
const animatorSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntCombatAnimator.js'), 'utf8');
assert.match(engineSource, /beginMonsterReactionBeat\(profile, context = \{\}\)/);
assert.match(engineSource, /tick\?\.\('reaction:monster'\)/,
    'reaction sessions must advance on the same engine tick as monster actions');
assert.match(engineSource, /dispatchMonsterReactionBeatEvent/);
assert.doesNotMatch(animatorSource, /audioMoments|audioPatternId = '__reaction\.knockdown'/,
    'renderer must not retain an independent knockdown audio scheduler');

console.log('[test] Shared monster reaction BEAT runtime contract passed.');

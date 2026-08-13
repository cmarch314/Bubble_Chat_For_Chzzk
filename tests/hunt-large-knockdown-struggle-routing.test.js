'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
    path.join(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);

const partBreakMethod = source.slice(
    source.indexOf('triggerMonsterPartBreakReaction('),
    source.indexOf('\n    triggerMonsterPartBreakVisual(', source.indexOf('triggerMonsterPartBreakReaction('))
);

assert.match(partBreakMethod, /profileId === 'knockdown'/,
    'large part-break reactions must have an explicit shared knockdown route');
assert.match(partBreakMethod, /this\.triggerMonsterKnockdownAnim\(\{[\s\S]*?motion,[\s\S]*?struggleCount:/,
    'large part-break reactions must pass authored struggle beats to the visible knockdown player');
assert.match(partBreakMethod, /\^struggle-\\d\+\$/,
    'the shared route must derive the visible struggle count from authored struggle beats');

console.log('[test] Large knockdown struggle routing passed.');

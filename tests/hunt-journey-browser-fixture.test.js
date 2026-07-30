'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const controller = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-journey-preview.html'), 'utf8');
const canvas = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-journey-canvas.html'), 'utf8');
const packageJson = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8');

assert.match(controller, /width:1920px;height:1080px/);
for (const scene of ['opening', 'vote', 'travel', 'event', 'upgrade']) {
    assert.match(controller, new RegExp(`data-scene="${scene}"`), `journey preview needs the ${scene} scene`);
}
assert.match(canvas, /Object\.create\(HuntRenderer\.prototype\)/, 'fixture must exercise the real journey renderer');
assert.match(canvas, /renderJourneyQuestBoard/);
assert.match(canvas, /renderJourneyTravelMap/);
assert.match(canvas, /renderJourneyEventBoard/);
assert.match(canvas, /renderJourneyUpgradeBoard/);
assert.match(canvas, /box\.bottom<=918\.5/, 'every journey scene must enforce the OBS bottom-15% boundary');
assert.match(canvas, /scrollWidth<=card\.clientWidth/);
assert.match(canvas, /scrollHeight<=card\.clientHeight/);
assert.match(packageJson, /"preview:hunt-journey":\s*"node scripts\/serve-hunt-ui-preview\.js 8080 tests\/fixtures\/hunt-journey-preview\.html"/);

console.log('[test] Visible !몬헌 journey browser fixture contract passed.');

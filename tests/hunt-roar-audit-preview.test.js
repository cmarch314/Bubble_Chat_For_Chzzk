'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(
    __dirname, 'fixtures/hunt-roar-audit-preview.html'), 'utf8');

assert.match(source, /WorldMonsterRoarRoutes\.generated\.js/);
assert.match(source, /HUNT_WORLD_MONSTER_ROAR_REVIEW/);
assert.match(source, /document\.createElement\('audio'\)/);
assert.match(source, /direct-decoded-stream/);
assert.match(source, /zero-based-decoded-index/);
assert.match(source, /world-monster-audio-auditions\.json/);
assert.match(source, /navigator\.clipboard\.writeText/);

console.log('[test] Monster roar one-click audition preview contract passed.');

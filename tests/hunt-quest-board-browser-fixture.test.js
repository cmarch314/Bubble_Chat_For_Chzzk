'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const controller = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-quest-board-preview.html'), 'utf8');
const canvas = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-quest-board-canvas.html'), 'utf8');
const server = fs.readFileSync(path.resolve(__dirname, '../scripts/serve-hunt-ui-preview.js'), 'utf8');

assert.match(controller, /width:1920px;height:1080px/);
assert.match(controller, /data-scenario="single"/);
assert.match(controller, /data-scenario="filled"/);
assert.match(controller, /data-scenario="consecutive"/);
assert.match(controller, /data-scenario="elder"/);
assert.match(canvas, /Object\.create\(HuntRenderer\.prototype\)/, 'fixture must exercise the real quest-board renderer');
assert.match(canvas, /slots\.length === 4/);
assert.match(canvas, /cardBox\.bottom <= 918\.5/, 'fixture must enforce the OBS bottom-15% boundary');
assert.match(canvas, /scrollWidth <= card\.clientWidth/);
assert.match(canvas, /scrollHeight <= card\.clientHeight/);
assert.match(server, /startsWith\(`\$\{ROOT\}\$\{path\.sep\}`\)/, 'preview server must reject paths outside the workspace');
assert.match(server, /'127\.0\.0\.1'/, 'preview server must remain localhost-only');

console.log('[test] Standalone !수렵 browser preview fixture contract passed.');

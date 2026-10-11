const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'tools', 'monster-audio-review-app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tools', 'monster-audio-review.html'), 'utf8');

assert.match(app, /async function assignSourceToSlot[\s\S]*?saveRoute\(/,
    'source drops must use the same verified save route as explicit assignment');
assert.match(app, /row\.draggable = Boolean\(source\.path\)/,
    'each playable source must be a drag source');
assert.match(app, /kind: 'source', path: source\.path/,
    'source drag payloads must preserve the exact decoded file path');
assert.match(app, /payload\?\.kind === 'source'[\s\S]*?assignSourceToSlot\(/,
    'slot drops must distinguish new source assignment from mapped-file moves');
assert.match(app, /event\.dataTransfer\.setData\('text\/plain', payload\)/,
    'drag payloads need a browser-compatible text fallback');
assert.match(html, /\.source\[draggable="true"\]\{cursor:grab\}/,
    'playable sources must advertise their drag affordance');

console.log('[test] monster audio source drag assignment passed.');

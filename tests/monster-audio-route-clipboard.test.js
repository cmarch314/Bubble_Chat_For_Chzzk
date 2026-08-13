const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'tools', 'monster-audio-review-app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tools', 'monster-audio-review.html'), 'utf8');

assert.match(app, /class="route-copy-button"[\s\S]*?class="route-source-link"/,
    'each mapped source must expose copy immediately before its source link');
assert.match(app, /bubblechat\.monsterAudioReview\.routeClipboard/,
    'the copied source must persist while navigating between monsters and patterns');
assert.match(app, /async function pasteRouteLayer[\s\S]*?saveRoute\(/,
    'paste must use the verified route save and runtime regeneration path');
assert.match(app, /files:\s*\[clip\.path\]/,
    'paste must map the exact copied source rather than an inferred group');
assert.match(html, /\.route-copy-button\+\.route-source-link\{margin-left:0\}/,
    'copy and source-link controls must remain visually adjacent');

console.log('[test] monster audio route clipboard passed.');

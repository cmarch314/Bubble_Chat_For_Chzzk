'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'AGENTS.md');
const bytes = fs.readFileSync(rulesPath);
const text = bytes.toString('utf8');

assert.notStrictEqual(bytes[0], 0xef, 'AGENTS.md must not contain a UTF-8 BOM');
assert(!text.includes('\uFFFD'), 'AGENTS.md must not contain replacement characters');
assert(bytes.length <= 16 * 1024, 'AGENTS.md must stay under 16 KiB');

const required = [
    '## 1. Product North Star',
    '## 4. OBS and Chzzk Lifecycle',
    '## 6. Hunt Product Contract',
    '## 7. Monster Hunter Audio Evidence',
    '## 8. Legacy SFX Replacement Policy',
    '## 10. Verification Ladder',
    '## 11. Self-Maintaining Rules',
    '## 12. Concurrent Agent Coordination'
];
for (const heading of required) assert(text.includes(heading), `Missing section: ${heading}`);

const headings = text.match(/^#{1,6} .+$/gm) || [];
assert.strictEqual(new Set(headings).size, headings.length, 'AGENTS.md headings must be unique');
assert(text.includes('Duration is never semantic evidence.'), 'Duration evidence prohibition is missing');
assert(text.includes('increase viewer chat participation'), 'Participation north star is missing');
assert(text.includes('minimize streamer intervention'), 'Streamer-autonomy north star is missing');
assert(text.includes('Protect all `AI CMC/` media'), 'CMC protection policy is missing');
assert(/Never `git add -A`|Never absorb foreign work/.test(text), 'Concurrent-agent commit-hygiene rule is missing');
assert(text.includes('agent-specific `--port`'), 'Concurrent-agent port-isolation rule is missing');

console.log('Agent rules contract tests passed.');

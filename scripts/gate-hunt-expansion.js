#!/usr/bin/env node
'use strict';

// One reproducible expansion lock.  Default mode is intentionally focused so
// authors can run it before every kit edit; --full appends repository-wide and
// asset-heavy verification before a release/push.
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const full = process.argv.includes('--full');
const commands = [
    ['node', ['scripts/compile-monster-kits.js', '--check']],
    ['node', ['tests/hunt-beat-review-status.test.js']],
    ['node', ['tests/hunt-hunter-beat-review-status.test.js']],
    ['node', ['tests/hunt-beat-v2-contract.test.js']],
    ['node', ['tests/hunt-reaction-beat-runtime.test.js']],
    ['node', ['tests/hunt-monster-sleep-runtime.test.js']],
    ['node', ['tests/hunt-monster-part-break-reaction.test.js']],
    ['node', ['tests/hunt-preview-live-runtime-contract.test.js']],
    ['node', ['tests/hunt-combat-runtime-parity.test.js']],
    ['node', ['tests/hunt-diablos-golden-beat-trace.test.js']],
    ['node', ['tests/hunt-monster-kit-contract.test.js']],
    ['node', ['tests/create-monster-kit.test.js']],
    ['node', ['tests/hunt-profile-motion-migration.test.js']]
];

if (full) {
    commands.push(
        ['npm', ['run', 'test:mh-audio']],
        ['npm', ['run', 'audit:hunt']],
        ['npm', ['run', 'audit:hunt-monsters']],
        ['npm', ['run', 'simulate:hunt', '--', '50']],
        ['npm', ['run', 'verify']],
        ['npm', ['test']]
    );
}

for (const [command, args] of commands) {
    const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
    const display = `${executable} ${args.join(' ')}`;
    console.log(`\n[hunt-expansion] ${display}`);
    const result = spawnSync(executable, args, { cwd: ROOT, stdio: 'inherit', shell: false });
    if (result.status !== 0) {
        console.error(`[hunt-expansion] failed: ${display}`);
        process.exit(result.status || 1);
    }
}
console.log(`\n[hunt-expansion] ${full ? 'full' : 'focused'} gate passed`);

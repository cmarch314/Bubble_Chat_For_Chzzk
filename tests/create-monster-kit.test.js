'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [
    'scripts/create-monster-kit.js', '--id', 'test_wyvern', '--name-ko', '테스트 비룡', '--dry-run'
], { cwd: root, encoding: 'utf8' });

assert.strictEqual(result.status, 0, result.stderr);
assert.match(result.stdout, /monster-kits[\\/]test_wyvern\.json/);
assert.match(result.stdout, /monster-kits[\\/]actions[\\/]test_wyvern\.json/);
assert.match(result.stdout, /monster-kits[\\/]notes[\\/]test_wyvern\.md/);
console.log('[test] Draft monster-kit scaffold stays unreleased and review-first.');

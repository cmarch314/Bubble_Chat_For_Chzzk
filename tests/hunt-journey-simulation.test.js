'use strict';

const assert = require('assert');
const { parseRuns, simulate } = require('../scripts/simulate-hunt-journey');

assert.strictEqual(parseRuns([]), 25);
assert.strictEqual(parseRuns(['50']), 50);
assert.strictEqual(parseRuns(['--runs=7']), 7);
assert.strictEqual(parseRuns(['--runs', '9']), 9);
assert.throws(() => parseRuns(['--runs=NaN']), /integer from 1 to 10000/);
assert.throws(() => parseRuns(['--runs=0']), /integer from 1 to 10000/);

(async () => {
    for (const mode of ['silent', 'average', 'maximum']) {
        assert.strictEqual(await simulate(1, mode), 15);
    }
    console.log('[test] Journey simulation executes real nodes and accepts validated run-count arguments.');
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const GameEffectRuntime = require(path.resolve(__dirname, '../js/runtime/GameEffectRuntime.js'));

const calls = [];
const timers = {
    clearAll: () => calls.push('clearAll'),
    timeout: (callback, delay) => ({ callback, delay, type: 'timeout' }),
    interval: (callback, delay) => ({ callback, delay, type: 'interval' }),
    clear: id => calls.push(['clear', id])
};
const owner = { isActive: false };
const director = { activeGame: null };
const runtime = new GameEffectRuntime(owner, director, { timers });

runtime.start();
assert.strictEqual(owner.isActive, true);
assert.strictEqual(director.activeGame, owner);

const interval = runtime.interval(() => {}, 1000);
assert.strictEqual(interval.delay, 1000);
runtime.clear(interval);
assert.deepStrictEqual(calls.at(-1), ['clear', interval]);

let completionCount = 0;
const complete = runtime.once(() => ++completionCount);
complete();
complete();
assert.strictEqual(completionCount, 1);

const pendingWait = runtime.wait(5000);

assert.strictEqual(runtime.end(), true);
assert.strictEqual(runtime.end(), false);
assert.strictEqual(owner.isActive, false);
assert.strictEqual(director.activeGame, null);
assert.strictEqual(calls.filter(call => call === 'clearAll').length, 2);

pendingWait.then(completed => assert.strictEqual(completed, false));

director.activeGame = { another: true };
runtime.start();
director.activeGame = { replacement: true };
runtime.end();
assert.deepStrictEqual(director.activeGame, { replacement: true });

const raidPath = path.resolve(__dirname, '../js/effects/RaidEffect.js');
const raidSource = fs.readFileSync(raidPath, 'utf8');
assert.match(raidSource, /this\.runtime = new GameEffectRuntime\(this, director\)/);
assert.match(raidSource, /if \(!this\.runtime\.end\(\)\) return;/);
assert.doesNotMatch(raidSource, /setTimeout\(|setInterval\(|clearTimeout\(|clearInterval\(/);

const quizPath = path.resolve(__dirname, '../js/effects/SoundQuizEffect.js');
const quizSource = fs.readFileSync(quizPath, 'utf8');
assert.match(quizSource, /this\.runtime = new GameEffectRuntime\(this, director\)/);
assert.doesNotMatch(quizSource, /setTimeout\(|setInterval\(|clearTimeout\(|clearInterval\(/);
assert.match(quizSource, /const shouldContinue = await this\.runtime\.wait\(5000\);\s*cleanupFireworks\(\);\s*if \(!shouldContinue\) break;/,
    'forced quiz shutdown must clean fireworks before leaving the round loop');

const racingPath = path.resolve(__dirname, '../js/effects/RacingEffect.js');
const racingSource = fs.readFileSync(racingPath, 'utf8');
const racingRunnerSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/RacingRunner.js'), 'utf8');
assert.match(racingSource, /this\.runtime = new GameEffectRuntime\(this, director\)/);
assert.match(racingSource, /return RacingRunner\.start\(this, resolve\)/);
assert.match(racingSource, /if \(!this\.runtime\.end\(\)\) return;/);
assert.doesNotMatch(racingSource, /setTimeout\(|setInterval\(|clearTimeout\(|clearInterval\(/);
assert.doesNotMatch(racingRunnerSource, /\bthis\.|setTimeout\(|setInterval\(|clearTimeout\(|clearInterval\(/);

console.log('[test] GameEffectRuntime ownership and completion contract passed.');

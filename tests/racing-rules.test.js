const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/RacingRules.js');
const context = vm.createContext({ Math });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.RacingRules = RacingRules;`, context);

const pool = [
    { name: 'A', emoji: 'A!', code: 'a' },
    { name: 'B', emoji: 'B!', code: 'b' },
    { name: 'C', emoji: 'C!', code: 'c' },
    { name: 'D', emoji: 'D!', code: 'd' }
];
const racers = context.RacingRules.createRacers(pool, () => 0.5, 4);

assert.strictEqual(racers.length, 4);
assert.deepStrictEqual(JSON.parse(JSON.stringify(racers[0])), {
    id: 0, name: 'A', emoji: 'A!', code: 'a', pos: 0, speed: 0, boost: 0,
    stunTicks: 0, shieldTicks: 0, scale: 1, rotate: 0,
    statusText: '', statusTimer: 0, hasItem1: false, hasItem2: false,
    eventCooldownTicks: 0
});
assert.strictEqual(context.RacingRules.resolveRacerIndex('1', racers), 0);
assert.strictEqual(context.RacingRules.resolveRacerIndex('!4', racers), 3);
assert.strictEqual(context.RacingRules.resolveRacerIndex('응원 B!', racers), 1);
assert.strictEqual(context.RacingRules.resolveRacerIndex('C 가자', racers), 2);
assert.strictEqual(context.RacingRules.resolveRacerIndex('9', racers), -1);

racers[0].pos = 10;
racers[1].pos = 30;
assert.strictEqual(context.RacingRules.leader(racers).id, 1);
assert.deepStrictEqual(Array.from(context.RacingRules.standings(racers), racer => racer.id), [1, 0, 2, 3]);

console.log('[test] Racing rules deterministic contract passed.');

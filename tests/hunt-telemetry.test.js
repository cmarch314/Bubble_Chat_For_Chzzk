const assert = require('assert');
const HuntSeededRandom = require('../js/effects/hunt/HuntSeededRandom.js');
const HuntBalanceTelemetry = require('../js/effects/hunt/HuntBalanceTelemetry.js');

const first = new HuntSeededRandom(42);
const second = new HuntSeededRandom(42);
for (let i = 0; i < 20; i++) assert.strictEqual(first.next(), second.next());

const telemetry = new HuntBalanceTelemetry();
telemetry.recordHunterAction('great_sword', { id: 'tcs', name: '참모아베기' }, 500);
telemetry.recordMonsterPattern('rathalos', { id: 'fireball', name: '화염구' }, 'dodge', 0);
telemetry.recordMonsterPattern('rathalos', { id: 'charge', name: '돌진' }, 'hit', 25);
telemetry.recordCart();
telemetry.finish(true, 830);
const summary = telemetry.summary();
assert.strictEqual(summary.victory, true);
assert.strictEqual(summary.totalHunterDamage, 500);
assert.strictEqual(summary.totalMonsterDamage, 25);
assert.strictEqual(summary.dodges, 1);
assert.strictEqual(summary.hits, 1);
assert.strictEqual(summary.carts, 1);

console.log('[test] Hunt seeded replay and telemetry contract passed.');

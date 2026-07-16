const assert = require('assert');
const HuntLobbyRoster = require('../js/effects/hunt/HuntLobbyRoster.js');

const values = [0.2, 0.8, 0.1, 0.6, 0.4];
let cursor = 0;
const roster = new HuntLobbyRoster(() => values[cursor++ % values.length]);
assert.strictEqual(roster.register({ nickname: 'A' }).added, true);
assert.strictEqual(roster.register({ nickname: 'A' }).added, false);
['B', 'C', 'D', 'E', 'F'].forEach(nickname => roster.register({ nickname }));
const selected = roster.selectFour();
assert.strictEqual(selected.length, 4);
assert.strictEqual(new Set(selected.map(item => item.nickname)).size, 4);

const shortRoster = new HuntLobbyRoster(() => 0);
shortRoster.register({ nickname: '유저' });
const filled = shortRoster.selectFour();
assert.strictEqual(filled.length, 4);
assert.strictEqual(filled.filter(item => item.isNpc).length, 3);
console.log('[test] Hunt unique recruitment and four-hunter selection passed.');

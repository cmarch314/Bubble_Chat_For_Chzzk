const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntParticipantParser.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntParticipantParser = HuntParticipantParser;`;
vm.runInContext(source, context, { filename: sourcePath });
const parser = new context.HuntParticipantParser();

assert.strictEqual(parser.parse('hello', {}, false), null);
assert.deepStrictEqual(
    { ...parser.parse('!참가 2', {}, false) },
    { index: 1, isSubscriber: false, weaponId: null, personality: null }
);
assert.deepStrictEqual(
    { ...parser.parse('3 차액 베테랑', { isSubscriber: true }, false) },
    { index: 2, isSubscriber: true, weaponId: 'charge_blade', personality: 'veteran' }
);
assert.deepStrictEqual(
    { ...parser.parse('1 해머 공격적', {}, false) },
    { index: 0, isSubscriber: false, weaponId: null, personality: null }
);
assert.deepStrictEqual(
    { ...parser.parse('4 라보 뉴비형', { badges: [{ title: '12개월 구독' }] }, false) },
    { index: 3, isSubscriber: true, weaponId: 'light_bowgun', personality: 'newbie' }
);

console.log('[test] HuntParticipantParser command contract passed.');

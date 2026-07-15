const assert = require('assert');
const path = require('path');
const { isAllowedChzzkUrl, resolveStaticPath } = require('../tools/chzzk-companion');

assert.strictEqual(isAllowedChzzkUrl(
    'https://api.chzzk.naver.com/polling/v2/channels/057a9a03fea9b368eb0c76b9e95e1ae5/live-status?_t=1'
), true);
assert.strictEqual(isAllowedChzzkUrl(
    'https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=N2XCXJ&chatType=STREAMING&_t=1'
), true);
assert.strictEqual(isAllowedChzzkUrl('https://example.com/steal'), false);
assert.strictEqual(isAllowedChzzkUrl('https://api.chzzk.naver.com/other'), false);

const root = path.resolve(__dirname, '..');
assert.strictEqual(resolveStaticPath('/'), path.join(root, 'index.html'));
assert.strictEqual(resolveStaticPath('/index.html'), path.join(root, 'index.html'));
assert.strictEqual(resolveStaticPath('/../outside.txt'), null);
assert.strictEqual(resolveStaticPath('/%2e%2e/outside.txt'), null);

console.log('Chzzk local companion safety contract passed');

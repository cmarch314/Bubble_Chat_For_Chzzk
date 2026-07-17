'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ChatSpecialBubbleCommand = require('../js/chat/ChatSpecialBubbleCommand.js');

assert.deepStrictEqual(
    ChatSpecialBubbleCommand.parse('!광대 사람이 죽는다구!'),
    { kind: 'clown', text: '사람이 죽는다구!' }
);
assert.deepStrictEqual(
    ChatSpecialBubbleCommand.parse('  !광대   두 줄도\n안전하게 표시  '),
    { kind: 'clown', text: '두 줄도\n안전하게 표시' }
);
assert.deepStrictEqual(ChatSpecialBubbleCommand.parse('!광대'), { kind: 'clown', text: '...' });
assert.strictEqual(ChatSpecialBubbleCommand.parse('오늘 !광대 사람이 죽는다구!'), null);
assert.strictEqual(ChatSpecialBubbleCommand.parse('!광대놀자'), null);

const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/ChatRenderer.js'), 'utf8');
assert.match(rendererSource, /const clownPositions = \[2, 25, 48, 71\]/);
assert.match(rendererSource, /this\.boxPos % 80/);

console.log('[test] Special clown chat bubble command passed.');

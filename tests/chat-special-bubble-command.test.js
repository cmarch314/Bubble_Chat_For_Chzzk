'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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
const rendererContext = vm.createContext({ console });
vm.runInContext(`${rendererSource}\nglobalThis.ChatRenderer = ChatRenderer;`, rendererContext);
const allocator = Object.create(rendererContext.ChatRenderer.prototype);
allocator.boxPos = 0;
allocator.activeBubbles = [];
const bubble = () => ({
    dataset: {},
    style: {},
    parentElement: {},
    removed: false,
    remove() { this.removed = true; this.parentElement = null; }
});
const normalA = bubble();
const normalB = bubble();
const clownA = bubble();
const normalC = bubble();
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(normalA, 1) }, { start: 0, span: 1 });
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(normalB, 1) }, { start: 1, span: 1 });
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(clownA, 2) }, { start: 2, span: 2 });
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(normalC, 1) }, { start: 4, span: 1 });
const clownB = bubble();
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(clownB, 2) }, { start: 0, span: 2 });
assert.strictEqual(normalA.removed, true);
assert.strictEqual(normalB.removed, true);

const cssSource = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');
assert.match(cssSource, /광대\.jpg'\) center center \/ cover no-repeat/);

console.log('[test] Special clown chat bubble command passed.');

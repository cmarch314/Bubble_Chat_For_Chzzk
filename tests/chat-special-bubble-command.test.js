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
const rendererContext = vm.createContext({ console, URL });
const safeContentSource = fs.readFileSync(path.resolve(__dirname, '../js/runtime/SafeContent.js'), 'utf8');
vm.runInContext(`${safeContentSource}\n${rendererSource}\nglobalThis.ChatRenderer = ChatRenderer;`, rendererContext);
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
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(clownA, 1) }, { start: 2, span: 1 });
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(normalC, 1) }, { start: 3, span: 1 });
const clownB = bubble();
assert.deepStrictEqual({ ...allocator._claimBubbleSlots(clownB, 1) }, { start: 4, span: 1 });
assert.strictEqual(normalA.removed, false);
assert.strictEqual(normalB.removed, false);

const cssSource = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');
assert.match(cssSource, /광대\.jpg'\) right 14px top \/ 112% auto no-repeat/);
assert.doesNotMatch(cssSource, /\.chat-box\.chat-box--clown|chat-line-inner--clown\s*\{[\s\S]*?width:\s*600px;/,
    'clown bubbles must retain the ordinary chat width');
assert.match(cssSource, /chat-line-inner--clown\s*\{[\s\S]*?width:\s*min\(372px, calc\(20vw - 12px\)\);/,
    'clown bubbles must leave a stable gap between ordinary chat slots');
assert.match(cssSource, /\.message\.message--clown\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?bottom:\s*14px;[\s\S]*?max-height:\s*116px;/,
    'clown copy must stay inside the lower caption-safe area');
assert.match(cssSource, /\.message\.message--clown\s*\{[\s\S]*?word-break:\s*keep-all;[\s\S]*?overflow-wrap:\s*normal;[\s\S]*?text-wrap:\s*balance;/,
    'clown copy must wrap on word boundaries and balance its lines');
assert.match(cssSource, /chat-line-inner--clown \.name-box\s*\{[\s\S]*?top:\s*10px;[\s\S]*?right:\s*10px;/,
    'clown author label must stay over the right hair area instead of the face');
assert.match(rendererSource, /specialBubble\?\.kind === 'clown'[\s\S]*?_normalizeClownText\(specialBubble\.text\)/);
assert.match(rendererSource, /_fitClownCaption\(element\)[\s\S]*?element\.scrollWidth <= element\.clientWidth[\s\S]*?element\.scrollHeight <= maxHeight/,
    'clown font sizing must measure the rendered caption instead of using character-count buckets');
assert.match(rendererSource, /document\.fonts\?\.ready[\s\S]*?_fitClownCaption\(messageEle\)/,
    'clown caption must be refitted after the web font becomes ready');
const clownBranch = rendererSource.match(/if \(specialBubble\?\.kind === 'clown'\)[\s\S]*?else if/)?.[0] || '';
assert.doesNotMatch(clownBranch, /slotSpan\s*=\s*2|chat-box--clown/,
    'clown bubbles must claim one ordinary chat slot');

const renderer = Object.create(rendererContext.ChatRenderer.prototype);
assert.strictEqual(renderer._normalizeClownText('아니  이러다\n모두 죽어!!!'), '아니 이러다 모두 죽어!!!');
assert.strictEqual(renderer._isSingleEmoteMessage(
    '{good}',
    { good: { imageUrl: 'https://example.com/emote.png' } }
), true);
assert.strictEqual(renderer._isSingleEmoteMessage(
    '말 {good}',
    { good: { imageUrl: 'https://example.com/emote.png' } }
), false);

console.log('[test] Special clown chat bubble command passed.');

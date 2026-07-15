const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/runtime/SafeContent.js');
const context = vm.createContext({ URL });
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.SafeContent = SafeContent;`,
    context,
    { filename: sourcePath }
);

const { SafeContent } = context;
assert.strictEqual(
    SafeContent.escapeHTML(`<img src=x onerror="alert('x')">`),
    '&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt;'
);

const rendered = SafeContent.renderEmotesHTML(
    'hello <b>{good}</b> {bad}',
    {
        good: { imageUrl: 'https://example.com/emote.png' },
        bad: { imageUrl: 'javascript:alert(1)' }
    },
    2
);
assert.ok(rendered.includes('&lt;b&gt;'));
assert.ok(rendered.includes('https://example.com/emote.png'));
assert.ok(rendered.includes('{bad}'));
assert.ok(!rendered.includes('javascript:'));
assert.ok(!rendered.includes('<b>'));

assert.strictEqual(SafeContent.remoteImageUrl('http://example.com/a.png'), null);
assert.strictEqual(SafeContent.remoteImageUrl('data:text/html,x'), null);
assert.strictEqual(SafeContent.cssColor('#12aBcD'), '#12aBcD');
assert.strictEqual(SafeContent.cssColor('red; background:url(x)'), '#ffffff');

console.log('[test] SafeContent remote-input contract passed.');

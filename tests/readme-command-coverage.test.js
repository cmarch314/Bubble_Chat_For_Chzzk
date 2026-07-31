const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readme = read('README.md');

const commandSources = [
    'js/SystemController.js',
    'js/routing/GameCommandMatcher.js',
    'js/effects/hunt/HuntCommandCatalog.js',
    'js/effects/hunt/HuntChatTactics.js'
].map(read).join('\n');

const literalCommands = [...commandSources.matchAll(/['"](![가-힣A-Za-z]+)['"]/g)]
    .map(match => match[1]);
const parserCommands = [
    '!준비', '!리롤', '!퍽리롤', '!잠금', '!해제', '!추천', '!자동추천',
    '!참가', '!1', '!2', '!3', '!퀴즈 중단', '!경마 중단', '!커맨드 중단'
];
const nonBangCommands = ['set [sfx/visual/master]'];
const documented = [...new Set([...literalCommands, ...parserCommands, ...nonBangCommands])];

for (const command of documented) {
    assert.ok(
        readme.includes(command),
        `README command guide is missing the live command: ${command}`
    );
}

assert.ok(!readme.includes('!참여'), 'README must not advertise the rejected legacy !참여 spelling');

console.log(`[test] README covers ${documented.length} live command forms.`);

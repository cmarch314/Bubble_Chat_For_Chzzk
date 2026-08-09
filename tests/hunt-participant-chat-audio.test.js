'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const start = source.indexOf('    shouldPlayBaseChatAudio(');
const end = source.indexOf('\n    async execute(', start);
assert.ok(start >= 0 && end > start, 'HuntEffect must own participant chat-audio eligibility');

class HarnessBase {
    constructor() {
        this.isActive = true;
        this.phase = 'fighting';
        this.selectedWeapons = [
            { hunterName: '참가자', participantUid: 'viewer-1', isNpc: false },
            { hunterName: 'AI 헌터', isNpc: true }
        ];
    }
}

const Harness = Function(`return class extends arguments[0] {\n${source.slice(start, end)}\n}`)(HarnessBase);
const effect = new Harness();

assert.strictEqual(effect.shouldPlayBaseChatAudio({ message: 'ㅋㅋㅋ', nickname: '참가자' }), true);
assert.strictEqual(effect.shouldPlayBaseChatAudio({ message: '안녕', nickname: '다른 사람', uid: 'viewer-1' }), true);
assert.strictEqual(effect.shouldPlayBaseChatAudio({ message: '!준비', nickname: '참가자' }), false);
assert.strictEqual(effect.shouldPlayBaseChatAudio({ message: '안녕', nickname: 'AI 헌터' }), false);
effect.isActive = false;
assert.strictEqual(effect.shouldPlayBaseChatAudio({ message: 'ㅋㅋㅋ', nickname: '참가자' }), false);

console.log('[test] Active human hunters retain ordinary chat audio without command duplication.');

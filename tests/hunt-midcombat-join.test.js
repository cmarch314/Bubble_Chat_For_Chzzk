const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const start = source.indexOf('    joinNpcHunterDuringCombat(');
const end = source.indexOf('\n    async showJourneyTravelMap(', start);
assert.ok(start >= 0 && end > start, 'HuntEffect must own the mid-combat NPC takeover boundary');
assert.match(rendererSource, /selectedWeapons\.some\(hunter => hunter\.isNpc\)[\s\S]*?AI 교대[\s\S]*?!참가/,
    'combat UI must advertise !참가 only while an AI takeover slot exists');

class HarnessBase {
    constructor() {
        this.phase = 'fighting';
        this.huntMode = 'single';
        this.participantParser = { parseRecruitment: message => message === '!참가' ? { join: true } : null };
        this.LobbyRoster = {
            normalizeNickname: value => String(value || '').trim().toLowerCase(),
            isStreamerParticipant: data => Boolean(data.isStreamer)
        };
        this.selectedWeapons = [
            {
                index: 0, hunterName: '길드 헌터 1', isNpc: true, status: 'alive',
                hp: 37, maxHp: 100, atb: 64, id: 'lance', perks: [{ id: 'perk_guard' }],
                potions: 2, currentAction: { id: 'lance.counter_stance' }
            },
            { index: 1, hunterName: '기존 시청자', isNpc: false, status: 'alive' }
        ];
        this.bets = { '길드 헌터 1': { index: 0, isNpc: true } };
        this.rendered = [];
        this.renderer = {
            updateCombatHunterIdentity: hunter => this.rendered.push(['identity', hunter.index]),
            spawnCombatChatBubble: (index, text) => this.rendered.push(['bubble', index, text])
        };
        this.logs = [];
        this.engine = { addLog: text => this.logs.push(text) };
    }
}

const Harness = Function(`return class extends arguments[0] {\n${source.slice(start, end)}\n}`)(HarnessBase);
const effect = new Harness();
const original = effect.selectedWeapons[0];
assert.strictEqual(effect.joinNpcHunterDuringCombat({
    message: '!참가', nickname: '새 시청자', uid: 'viewer-1', color: '#12abef'
}), true);
assert.strictEqual(effect.selectedWeapons[0], original, 'takeover must preserve the live combat object');
assert.deepStrictEqual(
    [original.hp, original.atb, original.id, original.potions, original.currentAction.id],
    [37, 64, 'lance', 2, 'lance.counter_stance'],
    'HP, ATB, weapon, supplies, and current action must survive the handoff'
);
assert.deepStrictEqual(
    [original.hunterName, original.participantUid, original.isNpc],
    ['새 시청자', 'viewer-1', false]
);
assert.ok(effect.bets['새 시청자'] && !effect.bets['길드 헌터 1']);
assert.ok(effect.rendered.some(entry => entry[0] === 'identity'));
assert.strictEqual(effect.joinNpcHunterDuringCombat({
    message: '!참가', nickname: '새 시청자', uid: 'viewer-1'
}), true, 'duplicate joins must be consumed without taking another slot');
assert.strictEqual(effect.selectedWeapons[1].hunterName, '기존 시청자');

console.log('[test] Mid-combat viewer takeover preserves the live NPC hunter state.');

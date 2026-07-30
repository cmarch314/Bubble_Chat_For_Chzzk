const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const start = source.indexOf('    joinNpcHunterDuringLoadout(');
const end = source.indexOf('\n    joinNpcHunterDuringCombat(', start);
assert.ok(start >= 0 && end > start, 'HuntEffect must own the loadout NPC takeover boundary');
assert.match(source, /phase === 'loadout'[\s\S]*?joinNpcHunterDuringLoadout\(msgData\)/,
    'loadout chat must route !참가 before ordinary loadout mutations');
assert.match(rendererSource, /some\(hunter => hunter\.isNpc\)[\s\S]*?hunt-loadout-join-command[\s\S]*?!참가/,
    'loadout UI must advertise !참가 only when an NPC slot exists');

class HarnessBase {
    constructor() {
        this.phase = 'loadout';
        this.huntMode = 'single';
        this.participantParser = { parseRecruitment: message => message === '!참가' ? { join: true } : null };
        this.LobbyRoster = {
            normalizeNickname: value => String(value || '').trim().toLowerCase(),
            isStreamerParticipant: data => Boolean(data.isStreamer)
        };
        this.selectedWeapons = [
            {
                index: 0, hunterName: '길드 헌터 1', hunterColor: '#c9b79c', isNpc: true,
                loadoutReady: true, id: 'great_sword', perks: [{ id: 'npc-perk' }],
                perkRerolled: true, perkRerollCount: 2
            },
            { index: 1, hunterName: '기존 시청자', participantUid: 'existing', isNpc: false, loadoutReady: false },
            { index: 2, hunterName: '길드 헌터 3', isNpc: true, loadoutReady: true }
        ];
        this.bets = { '길드 헌터 1': { index: 0, isNpc: true } };
        this.roster = {
            register: data => ({ added: true, participant: data }),
            list: () => [{ nickname: '새 시청자' }]
        };
        this.renderer = {
            cards: [],
            joinStates: [],
            bubbles: [],
            updateLoadoutCard: hunter => this.renderer.cards.push(hunter.index),
            updateLoadoutJoinAvailability: value => this.renderer.joinStates.push(value),
            spawnCombatChatBubble: (index, text) => this.renderer.bubbles.push([index, text])
        };
        this.profileClient = null;
    }
}

const Harness = Function(`return class extends arguments[0] {\n${source.slice(start, end)}\n}`)(HarnessBase);
const effect = new Harness();
const inheritedBuild = effect.selectedWeapons[0];
assert.strictEqual(effect.joinNpcHunterDuringLoadout({
    message: '!참가', nickname: '새 시청자', uid: 'viewer-1', color: '#12abef'
}), true);
assert.strictEqual(effect.selectedWeapons[0], inheritedBuild, 'takeover must preserve the existing loadout object');
assert.deepStrictEqual(
    [inheritedBuild.hunterName, inheritedBuild.participantUid, inheritedBuild.isNpc, inheritedBuild.loadoutReady],
    ['새 시청자', 'viewer-1', false, false],
    'the viewer must own the former AI slot and receive time to edit it'
);
assert.deepStrictEqual(
    [inheritedBuild.id, inheritedBuild.perks[0].id, inheritedBuild.perkRerollCount, inheritedBuild.perkRerolled],
    ['great_sword', 'npc-perk', 0, false],
    'the AI build must remain intact while reroll opportunities reset for the viewer'
);
assert.deepStrictEqual(effect.renderer.joinStates, [true], 'the command remains while another AI slot exists');

assert.strictEqual(effect.joinNpcHunterDuringLoadout({
    message: '!참가', nickname: '새 시청자', uid: 'viewer-1'
}), true);
assert.strictEqual(effect.selectedWeapons[2].isNpc, true, 'a duplicate join must not consume another AI slot');

console.log('[test] Loadout !참가 replaces one AI slot without skipping viewer setup.');

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntAudioManager.js'), 'utf8');
const played = [];
const configured = [];
const context = vm.createContext({
    console: { info() {}, warn() {} },
    Math: Object.assign(Object.create(Math), { random: () => 0 }),
    ManagedTimers: class {
        timeout(callback) { callback(); return 1; }
        interval() { return 1; }
        clear() {}
        clearAll() {}
    },
    HuntBgmResolver: class {},
    fetch: async () => ({
        ok: true,
        json: async () => ({
            defaultGain: 0.8,
            entries: [
                { path: 'local/gs.mp3', category: 'weapon', group: 'g_swd', duration: 1 },
                { path: 'local/dragon-piercer.mp3', category: 'weapon', group: 'bow', duration: 1.1, sourceBank: 'pl_wp_bow_com_media.bnk.2.X64' },
                { path: 'local/roar.mp3', category: 'monster', group: 'em002', duration: 2, sourceBank: 'em002_00_vo_media' },
                { path: 'local/hit.mp3', category: 'hit', group: 'monster', duration: 1 },
                { path: 'local/hunter-hit.mp3', category: 'hit', group: 'hunter', duration: 0.8, sourceBank: 'hit_pl_media.bnk.2.X64' },
                { path: 'local/voice.mp3', category: 'hunter_voice', group: 'm_01', language: 'ja', duration: 2 },
                { path: 'local/dlc-voice.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 2 },
                { path: 'local/dlc-short.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 0.18, sourceStream: 'combat_001.wav' },
                { path: 'local/dlc-pre.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 0.18, sourceStream: 'combat_001 [pre]' }
            ]
        })
    }),
    window: { HUNT_WEAPON_AUDIO_CUES: {}, HUNT_ROAR_ROUTE: {} }
});

vm.runInContext(source, context, { filename: 'HuntAudioManager.js' });

(async () => {
    const manager = new context.window.HuntAudioManager({
        audioManager: {
            playSound: (input, options) => configured.push({ input, options }),
            createNativeAudio: (audioPath, options) => ({
                volume: options.baseVolume,
                play: async () => played.push({ audioPath, options }),
                pause() {}, load() {}
            })
        },
        eventBus: { emit() {} }
    }, { getSoundConfig: () => ({}) });

    assert.strictEqual(await manager.localAudioReady, true);
    assert.strictEqual(manager.huntVolume(0.315), 0.63);
    assert.strictEqual(manager.playConfiguredSound('local/configured.mp3'), true);
    assert.strictEqual(configured[0].input.volume, 1, 'configured hunt sounds must use twice the default 0.5 gain');
    assert.strictEqual(manager.monsterGroup('rathalos'), 'em002');
    assert.strictEqual(manager.weaponGroup('great_sword'), 'g_swd');
    assert.strictEqual(manager.playMonsterAction({ id: 'rathalos' }, 'roar'), true);
    manager.playMHAsset('slash_heavy', null, { weaponId: 'great_sword' });
    await Promise.resolve();
    assert.deepStrictEqual(played.map(item => item.audioPath), ['local/roar.mp3', 'local/gs.mp3', 'local/hit.mp3']);
    assert.strictEqual(played[0].options.baseVolume, 1, 'hunt audio gain must double and cap native playback safely');
    manager.playMHAsset('dragon_piercer', null, { weaponId: 'bow', hunterIndex: 0 });
    manager.playMHAsset('mh_hit.mp3', null, { hunterIndex: 0 });
    await Promise.resolve();
    assert.deepStrictEqual(
        played.slice(3, 6).map(item => item.audioPath),
        ['local/dragon-piercer.mp3', 'local/hit.mp3', 'local/hunter-hit.mp3'],
        'dragon piercer and hunter damage must use dedicated locally extracted Rise banks'
    );
    assert.strictEqual(manager.playCharacterDialogue('result', { force: true }), true);
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/dlc-voice.mp3');

    const hunters = [
        { index: 0, hunterName: '첫째' },
        { index: 1, hunterName: '둘째' }
    ];
    assert.strictEqual(manager.assignHunterVoiceProfiles(hunters), true);
    assert.notStrictEqual(hunters[0].voiceProfile.key, hunters[1].voiceProfile.key, 'hunters need distinct fixed voice profiles');
    const assignedDlc = manager.hunterVoiceProfiles.get(0);
    assert.ok(assignedDlc.entries.some(entry => entry.path === 'local/dlc-short.mp3'), 'short combat grunts must remain eligible');
    assert.ok(!assignedDlc.entries.some(entry => entry.path === 'local/dlc-pre.mp3'), 'explicit pre-roll fragments must be excluded');
    const fixedProfile = hunters[0].voiceProfile.key;
    assert.strictEqual(manager.playHunterActionVoice(0, 'victory', { force: true }), true);
    assert.strictEqual(hunters[0].voiceProfile.key, fixedProfile, 'one hunter must never switch voice profile mid-hunt');
    assert.ok(played.at(-1).audioPath === 'local/voice.mp3' || played.at(-1).audioPath === 'local/dlc-voice.mp3');
    console.log('[test] Hunt local Rise audio routing contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

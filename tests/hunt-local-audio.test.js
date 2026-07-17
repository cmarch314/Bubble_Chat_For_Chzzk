'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntAudioManager.js'), 'utf8');
const played = [];
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
                { path: 'local/roar.mp3', category: 'monster', group: 'em002', duration: 2, sourceBank: 'em002_00_vo_media' },
                { path: 'local/hit.mp3', category: 'hit', group: 'monster', duration: 1 },
                { path: 'local/voice.mp3', category: 'hunter_voice', group: 'm_01', language: 'ja', duration: 2 }
            ]
        })
    }),
    window: { HUNT_WEAPON_AUDIO_CUES: {}, HUNT_ROAR_ROUTE: {} }
});

vm.runInContext(source, context, { filename: 'HuntAudioManager.js' });

(async () => {
    const manager = new context.window.HuntAudioManager({
        audioManager: {
            createNativeAudio: (audioPath, options) => ({
                volume: options.baseVolume,
                play: async () => played.push({ audioPath, options }),
                pause() {}, load() {}
            })
        },
        eventBus: { emit() {} }
    }, { getSoundConfig: () => ({}) });

    assert.strictEqual(await manager.localAudioReady, true);
    assert.strictEqual(manager.monsterGroup('rathalos'), 'em002');
    assert.strictEqual(manager.weaponGroup('great_sword'), 'g_swd');
    assert.strictEqual(manager.playMonsterAction({ id: 'rathalos' }, 'roar'), true);
    manager.playMHAsset('slash_heavy', null, { weaponId: 'great_sword' });
    await Promise.resolve();
    assert.deepStrictEqual(played.map(item => item.audioPath), ['local/roar.mp3', 'local/gs.mp3', 'local/hit.mp3']);
    assert.strictEqual(played[0].options.baseVolume, 0.78 * 0.8);
    console.log('[test] Hunt local Rise audio routing contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

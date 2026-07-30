'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntAudioManager.js'), 'utf8');
const played = [];
const configured = [];
let fetchCalls = 0;
const context = vm.createContext({
    console: { info() {}, warn() {} },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    ManagedTimers: class {
        timeout(callback) { callback(); return 1; }
        interval() { return 1; }
        clear() {}
        clearAll() {}
    },
    HuntBgmResolver: class {},
    fetch: async () => {
        fetchCalls += 1;
        return ({
        ok: true,
        json: async () => ({
            defaultGain: 0.8,
            entries: [
                { path: 'local/gs.mp3', category: 'weapon', group: 'g_swd', weaponId: 'great_sword', purpose: 'weapon_action', actionFamily: 'weapon_action', semanticEvidence: { actionFamily: 'weapon_action' }, duration: 1, sourceBank: 'pl_wp_g_swd_com_media.bnk.2.X64' },
                { path: 'local/db-bank.mp3', category: 'weapon', group: 'd_bld', weaponId: 'dual_blades', purpose: 'weapon_action', actionFamily: 'unknown', semanticEvidence: null, bankEvidence: { level: 'high' }, duration: 0.4, sourceBank: 'pl_wp_d_bld_com_media.bnk.2.X64' },
                { path: 'local/db-gimmick.mp3', category: 'weapon', group: 'd_bld', weaponId: 'dual_blades', purpose: 'weapon_action', actionFamily: 'unknown', semanticEvidence: null, bankEvidence: { level: 'high' }, duration: 0.4, sourceBank: 'pl_wp_d_bld_gimmick_074_media.bnk.2.X64' },
                { path: 'local/gs-gimmick.mp3', category: 'weapon', group: 'g_swd', duration: 1, sourceBank: 'pl_wp_g_swd_gimmick_116_media.bnk.2.X64' },
                { path: 'local/dragon-piercer.mp3', category: 'weapon', group: 'bow', weaponId: 'bow', purpose: 'weapon_action', actionFamily: 'dragon_piercer', semanticEvidence: { actionFamily: 'dragon_piercer' }, duration: 1.1, sourceBank: 'pl_wp_bow_com_media.bnk.2.X64' },
                { path: 'local/bow-shot.mp3', category: 'weapon', group: 'bow', weaponId: 'bow', purpose: 'weapon_action', actionFamily: 'bow_shot', semanticEvidence: { actionFamily: 'bow_shot' }, duration: 0.6, sourceBank: 'pl_wp_bow_com_media.bnk.2.X64' },
                { path: 'local/bow-laser-gimmick.mp3', category: 'weapon', group: 'bow', duration: 0.6, sourceBank: 'pl_wp_bow_gimmick_118_media.bnk.2.X64' },
                { path: 'local/roar.mp3', category: 'monster', group: 'em002', monsterId: 'em002', purpose: 'monster_vocal', actionFamily: 'monster_roar', semanticEvidence: { actionFamily: 'monster_roar' }, duration: 2, sourceBank: 'em002_00_vo_media' },
                { path: 'local/rathalos-se.mp3', category: 'monster', group: 'em002', monsterId: 'em002', purpose: 'monster_action', actionFamily: 'unknown', semanticEvidence: null, bankEvidence: { level: 'high' }, duration: 0.8, sourceBank: 'em002_se.nbnk' },
                { path: 'local/rathalos-vo-unknown.mp3', category: 'monster', group: 'em002', monsterId: 'em002', purpose: 'monster_vocal', actionFamily: 'unknown', semanticEvidence: null, bankEvidence: { level: 'high' }, duration: 0.8, sourceBank: 'em002_vo.nbnk' },
                { path: 'local/hit.mp3', category: 'hit', group: 'monster', duration: 1 },
                { path: 'local/hunter-hit.mp3', category: 'hit', group: 'hunter', duration: 0.8, sourceBank: 'hit_pl_media.bnk.2.X64' },
                { path: 'local/voice.mp3', category: 'hunter_voice', group: 'm_01', language: 'ja', duration: 2, semanticEvidence: { actionFamily: 'victory_call' } },
                { path: 'local/unlabelled-action.mp3', category: 'hunter_voice', group: 'm_01', language: 'ja', duration: 0.7, sourceBank: 'pl_act_vo_m_01_m.nbnk', semanticEvidence: null },
                { path: 'local/rise-spoken-call.mp3', category: 'hunter_voice', group: 'f_16', language: 'ja', duration: 1.4, sourceBank: 'streaming/Sound/Wwise/pl_voice_f_16_media.pck.3.X64.Ja', semanticEvidence: null },
                { path: 'local/dialogue-only.mp3', category: 'hunter_voice', group: 'm_01', language: 'ja', duration: 2.4, sourceBank: 'PL_Dia_M01_01_10_m.sbnk.1.X64.Ja', semanticEvidence: null },
                { path: 'local/npc-only.mp3', category: 'hunter_voice', group: 'npc_01', language: 'ja', duration: 1.4, sourceBank: 'Player_ActVoice_clb_npc101_50_024.sbnk.1.X64.Ja', semanticEvidence: null },
                { path: 'local/dlc-voice.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 2, semanticEvidence: { actionFamily: 'victory_call' } },
                { path: 'local/dlc-short.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 0.18, sourceStream: 'combat_001.wav', semanticEvidence: { actionFamily: 'attack_effort' } },
                { path: 'local/dlc-pre.mp3', category: 'hunter_voice', group: 'd_01', language: 'ja', duration: 0.18, sourceStream: 'combat_001 [pre]' }
            ]
        })
        });
    },
    window: {
        HUNT_WEAPON_AUDIO_CUES: {}, HUNT_ROAR_ROUTE: { furious_rajang: 'rajang', rathian: 'rathalos' },
        HUNT_WORLD_MONSTER_SILENT_VOICE_IDS: ['rajang'],
        HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES: {
            physical_attack: [{
                label: 'reviewed physical action fallback',
                evidence: 'world-user-audition-semantic-se-fallback',
                temporaryFallback: true,
                reuseScope: 'cross-species-semantic-se',
                layers: [['local/reviewed-physical-action-se.mp3', 0.6, 0]]
            }],
            physical_impact: [{
                label: 'reviewed physical impact fallback',
                evidence: 'world-user-audition-semantic-se-fallback',
                temporaryFallback: true,
                reuseScope: 'cross-species-semantic-se',
                layers: [['local/reviewed-physical-impact-se.mp3', 0.65, 0]]
            }]
        },
        HUNT_VERIFIED_LOCAL_WEAPON_CUES: {
            'great_sword:slash_heavy': [{ label: 'test', evidence: 'unit', layers: [['local/verified-gs.mp3', 0.7, 0]] }],
            'great_sword:charge_tier_1': [{ label: 'test charge tier 1', evidence: 'unit', layers: [['local/verified-gs-charge-1.mp3', 0.62, 0]] }],
            'bow:dragon_piercer': [{ label: 'test', evidence: 'unit', layers: [['local/verified-dragon.mp3', 0.7, 0]] }],
            'bow:bow_shot': [{ label: 'test', evidence: 'unit', layers: [['local/verified-bow.mp3', 0.7, 0]] }]
        },
        HUNT_VERIFIED_LOCAL_ITEM_CUES: {
            flash_pod: [{ label: 'test flash', evidence: 'unit', layers: [['local/flash-pod.mp3', 0.82, 0]] }],
            lifepowder: [{ label: 'test powder', evidence: 'unit', layers: [['local/powder-a.mp3', 0.6, 0], ['local/powder-b.mp3', 0.6, 40]] }]
        },
        HUNT_LOCAL_WEAPON_ACTION_ROUTES: {
            'gunlance.quick_reload': [{
                path: 'local/evidence-ranked-gl-reload.mp3', score: 90,
                label: 'Reload', game: 'world', eventIds: ['123'], sourceIds: ['456']
            }]
        },
        HUNT_VERIFIED_LOCAL_MONSTER_CUES: {
            'rathalos:roar': [{ label: 'test roar', evidence: 'unit', layers: [
                ['local/verified-roar.mp3', 0.78, 0],
                ['local/forbidden-roar-background.mp3', 0.78, 20]
            ] }],
            'rajang:roar': [{ label: 'test rajang', evidence: 'unit', layers: [['local/verified-rajang.mp3', 0.78, 0]] }],
            'nargacuga:attack': [{ label: 'tail slam', evidence: 'unit', patternKeywords: ['꼬리'], layers: [['local/narga-tail.mp3', 0.7, 0]] }],
            'safi_jiiva:ultimate': [{ label: 'sapphire star', evidence: 'unit', patternKeywords: ['ultimate'], layers: [['local/safi-breath.mp3', 0.7, 0], ['local/safi-explosion.mp3', 0.8, 0]] }]
        },
        HIVE_CMC_VOICE_COMMANDS: ['야!', '아야!', '나이스'],
        HIVE_SOUND_CONFIG: {
            '야!': { src: 'Chzzk_Signatures/cmc-attack.mp3', volume: 0.7 },
            '아야!': { src: 'Chzzk_Signatures/cmc-hit.mp3', volume: 0.65 },
            '나이스': { src: 'Chzzk_Signatures/cmc-victory.mp3', volume: 0.7 }
        },
        HIVE_AUDIO_LEVELS: {
            'SFX/Chzzk_Signatures/cmc-attack.mp3': { duration: 1 },
            'SFX/Chzzk_Signatures/cmc-hit.mp3': { duration: 1.2 },
            'SFX/Chzzk_Signatures/cmc-victory.mp3': { duration: 1.4 }
        }
    }
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
    assert.ok(!manager.voiceProfileCatalog.some(profile => profile.group === 'npc_01'),
        'NPC-only voice banks must never become a hunter profile');
    assert.strictEqual(manager.isHunterActionVoiceEntry({ sourceBank: 'streaming/Sound/Wwise/pl_voice_f_16_media.pck.3.X64.Ja' }), true,
        'Rise main player-voice media must be eligible for combat calls');
    assert.deepStrictEqual([...new Set(manager.localAudioEntries.map(entry => entry.game))], ['wilds', 'world', 'rise']);
    assert.strictEqual(manager.huntVolume(0.315), 0.63);
    assert.strictEqual(manager.playConfiguredSound('local/configured.mp3'), true);
    assert.strictEqual(configured[0].input.volume, 1, 'configured hunt sounds must use twice the default 0.5 gain');
    assert.strictEqual(manager.monsterGroup('rathalos'), 'em002');
    assert.strictEqual(manager.monsterGroup('silver_rathalos'), 'em002_02');
    assert.strictEqual(manager.monsterGroup('furious_rajang'), 'em023_05');
    assert.strictEqual(manager.weaponGroup('great_sword'), 'g_swd');
    assert.strictEqual(manager.playMonsterAction({ id: 'rathalos' }, 'roar'), true);
    assert.strictEqual(manager.playMonsterAction({ id: 'rathian' }, 'roar'), true,
        'Rathian must play the exact shared Rathalos roar route');
    assert.ok(!played.some(item => item.audioPath === 'local/forbidden-roar-background.mp3'),
        'roars must discard every secondary ambience/SE layer');
    assert.strictEqual(manager.playMonsterAction({ id: 'furious_rajang' }, 'roar'), false,
        'Rajang and its routed variant must stay silent when audition found no monster voice');
    assert.strictEqual(manager.playMonsterAction({ id: 'rathalos' }, 'physical', { patternName: '돌진' }), true,
        'an unmapped physical attack should use only the reviewed semantic SE pool');
    assert.strictEqual(played.at(-1).audioPath, 'local/reviewed-physical-impact-se.mp3');
    assert.ok(!played.some(item => item.audioPath === 'local/rathalos-vo-unknown.mp3'), 'unknown monster VO must never masquerade as an attack or roar');
    assert.strictEqual(manager.playMonsterAction({ id: 'nargacuga' }, 'physical', { patternName: '꼬리 내려찍기' }), true);
    assert.strictEqual(manager.playMonsterAction({ id: 'nargacuga' }, 'physical', { patternName: '앞발 할퀴기' }), true);
    assert.strictEqual(manager.playMonsterAction({ id: 'safi_jiiva' }, 'ultimate', { patternType: 'ultimate' }), true);
    manager.playMHAsset('slash_heavy', null, { weaponId: 'great_sword' });
    await Promise.resolve();
    assert.deepStrictEqual(played.map(item => item.audioPath), [
        'local/verified-roar.mp3',
        'local/verified-roar.mp3',
        'local/reviewed-physical-impact-se.mp3',
        'local/narga-tail.mp3',
        'local/reviewed-physical-action-se.mp3',
        'local/safi-breath.mp3',
        'local/safi-explosion.mp3',
        'local/verified-gs.mp3'
    ]);
    manager.playMHAudioFile('Unified_SFX/MH - Item Found.mp3', null, 1);
    await Promise.resolve();
    assert.strictEqual(played.at(-1).options.baseVolume, 0.7, 'item acquisition cues must be 30% below their mastered level');
    manager.playMHAudioFile('Unified_SFX/Potion Drink.mp3', null, 1);
    await Promise.resolve();
    assert.strictEqual(played.at(-1).options.baseVolume, 1, 'item cue attenuation must not affect potion audio');
    assert.ok(!played.some(item => item.audioPath === 'local/gs-gimmick.mp3'), 'normal great sword attacks must reject gimmick banks');
    const powderStart = played.length;
    manager.playMHAsset('lifepowder', null, { hunterIndex: 0, action: 'support' });
    await Promise.resolve();
    assert.deepStrictEqual(played.slice(powderStart, powderStart + 2).map(item => item.audioPath), ['local/powder-a.mp3', 'local/powder-b.mp3']);
    assert.ok(!played.slice(powderStart).some(item => /Item Found|Potion Drink/.test(item.audioPath)), 'Lifepowder must not reuse potion or item-acquisition audio');
    const flashStart = played.length;
    manager.playMHAsset('flash_pod', null, { hunterIndex: 0, action: 'support', item: 'flash-pod' });
    await Promise.resolve();
    assert.deepStrictEqual(played.slice(flashStart).map(item => item.audioPath), ['local/flash-pod.mp3'],
        'flash support must play only the audition-confirmed flash-pod explosion');
    assert.strictEqual(manager.playWeaponAction('dual_blades', 'slash_light'), true, 'weapon-bank evidence must prevent an unmapped weapon from becoming silent');
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/db-bank.mp3');
    assert.ok(!played.some(item => item.audioPath === 'local/db-gimmick.mp3'), 'weapon fallback must still reject gimmick banks');
    assert.strictEqual(manager.playWeaponAction('gunlance', 'weapon_ready', { actionId: 'gunlance.quick_reload' }), true,
        'an evidence-ranked action route must outrank broad same-weapon fallback');
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/evidence-ranked-gl-reload.mp3');
    assert.strictEqual(manager.playWeaponAction('great_sword', 'charge_tier_1'), true,
        'an exact Great Sword charge tier must outrank broad same-weapon fallback');
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/verified-gs-charge-1.mp3');
    assert.strictEqual(played[0].options.baseVolume, 1, 'hunt audio gain must double and cap native playback safely');
    manager.playMHAsset('dragon_piercer', null, { weaponId: 'bow' });
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/verified-dragon.mp3');
    assert.strictEqual(manager.playCharacterDialogue('result', { force: true }), true);
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/dlc-voice.mp3');

    const hunters = [
        { index: 0, hunterName: '첫째' },
        { index: 1, hunterName: '둘째' }
    ];
    assert.strictEqual(manager.assignHunterVoiceProfiles(hunters), true);
    assert.ok(hunters.every(hunter => hunter.voiceProfile.game === 'rise'),
        'fixed hunter profiles must prefer the extracted Rise cast when enough Rise actors are available');
    const beforeLoadoutVoice = played.length;
    hunters[0].personality = 'defensive';
    hunters[0].id = 'great_sword';
    assert.strictEqual(manager.playLoadoutConfirmationVoice(hunters[0], { weaponChanged: true, personalityChanged: true }), true,
        'an accepted viewer loadout mutation must play one fixed-actor hunter line');
    assert.strictEqual(played.length, beforeLoadoutVoice + 1,
        'one combined weapon and personality command must emit exactly one hunter line');
    assert.notStrictEqual(hunters[0].voiceProfile.key, hunters[1].voiceProfile.key, 'hunters need distinct fixed voice profiles');
    const assignedDlc = manager.hunterVoiceProfiles.get(0);
    assert.ok(assignedDlc.entries.every(entry => entry.game === assignedDlc.game), 'a fixed hunter voice must never mix games or actors');
    assert.ok(assignedDlc.entries.some(entry => entry.path === 'local/dlc-short.mp3'), 'short combat grunts must remain eligible');
    assert.strictEqual(manager.selectHunterActionVoice(0, 'attack', { preferLong: true, minDuration: 0.9 }).path, 'local/dlc-voice.mp3',
        'loadout-style selection must prefer a longer spoken line over a short attack grunt when the fixed actor has one');
    assert.ok(!assignedDlc.entries.some(entry => entry.path === 'local/dlc-pre.mp3'), 'explicit pre-roll fragments must be excluded');
    const fixedProfile = hunters[0].voiceProfile.key;
    assert.strictEqual(manager.playHunterActionVoice(0, 'victory', { force: true }), true);
    assert.strictEqual(hunters[0].voiceProfile.key, fixedProfile, 'one hunter must never switch voice profile mid-hunt');
    assert.ok(played.at(-1).audioPath === 'local/voice.mp3' || played.at(-1).audioPath === 'local/dlc-voice.mp3');
    const unlabelledHunter = hunters.find(hunter => {
        const profile = manager.hunterVoiceProfiles.get(hunter.index);
        return profile?.entries.some(entry => manager.isHunterActionVoiceEntry(entry));
    });
    assert.ok(unlabelledHunter, 'the fixture needs a fixed extracted action-voice profile');
    assert.strictEqual(manager.playHunterActionVoice(unlabelledHunter.index, 'attack', { force: true }), true,
        'an extracted player action-voice bank must not become silent merely because individual events are unlabelled');
    assert.ok(['local/unlabelled-action.mp3', 'local/rise-spoken-call.mp3'].includes(played.at(-1).audioPath),
        'unlabelled combat fallback must stay inside the fixed actor action-voice bank');
    assert.ok(!played.some(item => item.audioPath === 'local/dialogue-only.mp3'),
        'explicit dialogue banks must not masquerade as combat efforts');

    manager.playMHAsset('bow_shot', null, { weaponId: 'bow', hunterIndex: 0 });
    await Promise.resolve();
    assert.ok(played.some(item => item.audioPath === 'local/verified-bow.mp3'));
    assert.ok(!played.some(item => item.audioPath === 'local/bow-laser-gimmick.mp3'), 'bow attacks must never select laser-like gimmick banks');

    const fullParty = [0, 1, 2, 3].map(index => ({
        index,
        hunterName: `Hunter ${index + 1}`,
        isStreamer: index === 2
    }));
    assert.strictEqual(manager.assignHunterVoiceProfiles(fullParty), true);
    assert.strictEqual(fullParty[2].voiceProfile.isCmc, false, 'streamer identity must not force the CMC profile');
    let randomCmcHunter = null;
    for (let attempt = 0; attempt < 200 && !randomCmcHunter; attempt++) {
        const candidate = { index: 20, hunterName: `Viewer ${attempt}`, isStreamer: false };
        manager.assignHunterVoiceProfiles([candidate]);
        if (candidate.voiceProfile?.isCmc) randomCmcHunter = candidate;
    }
    assert.ok(randomCmcHunter, 'CMC must be selectable for an ordinary viewer through the shared random pool');
    assert.strictEqual(randomCmcHunter.voiceProfile.source, 'HIVE_CMC_VOICE_COMMANDS');
    assert.strictEqual(manager.selectCmcActionVoice('attack').path, 'SFX/Chzzk_Signatures/cmc-attack.mp3');
    assert.strictEqual(manager.playHunterActionVoice(randomCmcHunter.index, 'attack', { force: true }), true);
    assert.strictEqual(played.at(-1).audioPath, 'SFX/Chzzk_Signatures/cmc-attack.mp3',
        'random CMC hunter must use the chat MP3 group, never AI video audio');
    const beforeHit = played.length;
    manager.hunterVoiceCooldowns.clear();
    manager.playMHAsset('hunter_hit', null, { hunterIndex: randomCmcHunter.index });
    assert.deepStrictEqual(played.slice(beforeHit).map(item => item.audioPath), ['SFX/Chzzk_Signatures/cmc-hit.mp3'],
        'hunter hit must use the fixed actor reaction without an arbitrary click impact');
    const beforeStun = played.length;
    manager.hunterVoiceCooldowns.clear();
    manager.playMHAsset('hunter_stun', null, { hunterIndex: randomCmcHunter.index, action: 'stun' });
    manager.playMHAsset('hunter_hit', null, { hunterIndex: randomCmcHunter.index, action: 'stun', hunterStunned: true });
    assert.strictEqual(played.length, beforeStun, 'hunter stun must remain completely silent');
    context.window.HUNT_VERIFIED_LOCAL_WEAPON_CUES = {
        'great_sword:slash_heavy': [{
            label: 'verified test route',
            evidence: 'unit test',
            layers: [['local/verified-swing.mp3', 0.6, 0], ['local/verified-hit.mp3', 0.7, 50]]
        }]
    };
    const verifiedStart = played.length;
    assert.strictEqual(manager.playWeaponAction('great_sword', 'slash_heavy'), true);
    await Promise.resolve();
    assert.deepStrictEqual(
        played.slice(verifiedStart).map(item => item.audioPath),
        ['local/verified-swing.mp3', 'local/verified-hit.mp3'],
        'a verified labelled route must take priority over the broad semantic pool'
    );

    const fetchesBeforeEmbeddedCatalog = fetchCalls;
    context.HUNT_LOCAL_AUDIO_MANIFESTS = {
        rise: {
            defaultGain: 0.75,
            entries: [{
                path: 'local/embedded-lance.mp3', category: 'weapon', group: 'lance',
                weaponId: 'lance', purpose: 'weapon_action', actionFamily: 'unknown',
                bankEvidence: { level: 'high' }, sourceBank: 'pl_wp_lance_com_media.bnk.2.X64', duration: 0.5
            }]
        }
    };
    const embeddedManager = new context.window.HuntAudioManager({
        audioManager: manager.director.audioManager,
        eventBus: { emit() {} }
    }, { getSoundConfig: () => ({}) });
    assert.strictEqual(await embeddedManager.localAudioReady, true);
    assert.strictEqual(fetchCalls, fetchesBeforeEmbeddedCatalog,
        'OBS runtime catalog must bypass file:// JSON fetch completely');
    assert.strictEqual(embeddedManager.playWeaponAction('lance', 'thrust'), true,
        'the embedded catalog must provide same-weapon bank fallback audio');
    await Promise.resolve();
    assert.strictEqual(played.at(-1).audioPath, 'local/embedded-lance.mp3');
    console.log('[test] Hunt local Rise audio routing contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

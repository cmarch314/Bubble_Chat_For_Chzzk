'use strict';

const WORLD_EARPLUG_TEST = 'https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/';
const HUNT_MONSTER_ROAR_EVIDENCE = Object.freeze({
    acidic_glavenus: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    ancient_leshen: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    azure_rathalos: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    banbaro: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    behemoth: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    beotodus: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    black_diablos: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    blackveil_vaal_hazak: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    coral_pukei_pukei: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    deviljho: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    dodogama: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    ebony_odogaron: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    fatalis: ['verified-present', 'high', 'https://monsterhunter.fandom.com/wiki/Fatalis'],
    frostfang_barioth: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    fulgur_anjanath: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    great_girros: ['verified-absent', null, WORLD_EARPLUG_TEST],
    great_jagras: ['verified-absent', null, WORLD_EARPLUG_TEST],
    legiana: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    lunastra: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    namielle: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    nergigante: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    nightshade_paolumu: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    paolumu: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    pink_rathian: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    radobaan: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    raging_brachydios: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    ruiner_nergigante: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    safi_jiiva: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    savage_deviljho: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    scarred_yian_garuga: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    shara_ishvalda: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    shrieking_legiana: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    stygian_zinogre: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    tzitzi_ya_ku: ['verified-absent', null, WORLD_EARPLUG_TEST],
    vaal_hazak: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    valstrax: ['verified-present', 'high', 'https://monsterhunter.fandom.com/wiki/Valstrax'],
    viper_tobi_kadachi: ['verified-present', 'low', WORLD_EARPLUG_TEST],
    xeno_jiiva: ['verified-present', 'high', WORLD_EARPLUG_TEST],
    zorah_magdaros: ['verified-absent', null, WORLD_EARPLUG_TEST]
});

function resolveMonsterRoarEvidence(monsterId) {
    const row = HUNT_MONSTER_ROAR_EVIDENCE[String(monsterId || '').replace(/[-']/g, '_')];
    return row ? {
        status: row[0],
        strength: row[1],
        evidence: 'published-earplugs-test',
        sourceUrl: row[2]
    } : null;
}

if (typeof window !== 'undefined') {
    window.HUNT_MONSTER_ROAR_EVIDENCE = HUNT_MONSTER_ROAR_EVIDENCE;
    window.resolveMonsterRoarEvidence = resolveMonsterRoarEvidence;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HUNT_MONSTER_ROAR_EVIDENCE, resolveMonsterRoarEvidence };
}

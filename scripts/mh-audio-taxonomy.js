'use strict';

const WEAPON_BY_INDEX = Object.freeze(Object.fromEntries(
    Object.entries(require('../data/hunt/wilds-weapon-codes.json').codes)
        .map(([code, weaponId]) => [code.slice(2), weaponId])
));

const RISE_WEAPON_CODES = Object.freeze({
    g_swd: 'great_sword', s_swd: 'sword_shield', d_bld: 'dual_blades', l_swd: 'long_sword',
    ham: 'hammer', hrn: 'hunting_horn', lan: 'lance', g_lan: 'gunlance',
    s_axe: 'switch_axe', c_axe: 'charge_blade', i_gla: 'insect_glaive', bow: 'bow',
    h_bg: 'heavy_bowgun', l_bg: 'light_bowgun'
});

const WORLD_WEAPON_CODES = Object.freeze({
    two: 'great_sword', one: 'sword_shield', sou: 'dual_blades', swo: 'long_sword',
    ham: 'hammer', hue: 'hunting_horn', lan: 'lance', gun: 'gunlance',
    saxe: 'switch_axe', caxe: 'charge_blade', rod: 'insect_glaive', bow: 'bow',
    hbg: 'heavy_bowgun', lbg: 'light_bowgun'
});

function cleanBankName(file) {
    return String(file || '').replace(/\\/g, '/').split('/').pop()
        .replace(/\.(?:sbnk|spck)\.\d+\.x64(?:\.[a-z0-9]+)?$/i, '')
        .replace(/\.(?:bnk|pck)\.\d+\.x64(?:\.[a-z0-9]+)?$/i, '')
        .replace(/\.(?:nbnk|npck|bnk|pck)$/i, '');
}

function languageOf(file) {
    const match = String(file || '').match(/\.X64\.([A-Za-z0-9]+)$/i);
    if (match) return match[1].toLowerCase();
    const pathMatch = String(file || '').replace(/\\/g, '/').match(/\/(Japanese|English|Korean|French|German|Italian|Spanish)(?:\([^)]*\))?\//i);
    return pathMatch ? pathMatch[1].toLowerCase() : null;
}

function riseWeapon(bankLower) {
    for (const [code, id] of Object.entries(RISE_WEAPON_CODES)) {
        if (bankLower.startsWith(`pl_wp_${code}_`) || bankLower === `pl_wp_${code}`) return id;
    }
    return null;
}

function indexedWeapon(bankLower) {
    const match = bankLower.match(/(?:^|_)wp(\d{2})(?:_|$)/i);
    return match ? WEAPON_BY_INDEX[match[1]] || null : null;
}

function worldWeapon(bankLower, file) {
    const normalized = String(file || '').replace(/\\/g, '/').toLowerCase();
    const indexed = bankLower.match(/^wp(\d{2})(?:_|$)/)?.[1];
    if (indexed && WEAPON_BY_INDEX[indexed]) return WEAPON_BY_INDEX[indexed];
    for (const [code, id] of Object.entries(WORLD_WEAPON_CODES)) {
        if (new RegExp(`(?:^|[\\/_])(?:wp_|snd_)?${code}(?:_|[\\/]|$)`).test(normalized) || new RegExp(`^wp_${code}(?:_|$)`).test(bankLower)) return id;
    }
    return null;
}

function confidence(level, evidence) {
    return { level, evidence: Array.from(new Set(evidence.filter(Boolean))) };
}

function classifyBank(file, game = 'unknown') {
    const bank = cleanBankName(file);
    const lower = bank.toLowerCase();
    const language = languageOf(file);
    const weaponId = riseWeapon(lower) || indexedWeapon(lower) || worldWeapon(lower, file);
    const monsterMatch = lower.match(/^(ems?\d{3,4})((?:_\d{2})?)/) || lower.match(/(?:^|_)(em\d{3,4})((?:_\d{2})?)(?:_|$)/);
    const monsterId = monsterMatch ? monsterMatch[1] : null;
    const monsterVariant = monsterMatch?.[2] ? `${monsterMatch[1]}${monsterMatch[2]}` : monsterId;
    const evidence = [`bank:${bank}`];
    let category = 'unknown';
    let purpose = 'unclassified';
    let role = null;
    let level = 'low';

    if (weaponId || /^pl_wp_|^weapon_cmn|^bowgun_/.test(lower)) {
        category = 'weapon'; role = weaponId || 'common';
        purpose = /insect/.test(lower) ? 'kinsect_action'
            : /shell|bowgun/.test(lower) ? 'projectile_or_ammo'
                : /effect/.test(lower) ? 'weapon_effect'
                    : /_m$/.test(lower) ? 'weapon_motion' : 'weapon_action';
        level = weaponId ? 'high' : 'medium';
    } else if (monsterId || /^em_/.test(lower)) {
        category = 'monster'; role = monsterId || 'common';
        purpose = /(?:^|_)vo(?:_|$)/.test(lower) ? 'monster_vocal'
            : /(?:^|_)se(?:_|$)/.test(lower) ? 'monster_attack_or_body'
                : /village/.test(lower) ? 'monster_noncombat' : 'monster_action';
        level = monsterId ? 'high' : 'medium';
    } else if (/player_(?:actvoice|chat.*voice)|^pl_voice|^pl_act_vo_/.test(lower)) {
        category = 'hunter_voice'; role = lower.match(/(?:^|_)([fm]_?\d{2}|[dcs]_\d{2}|type\d+)/)?.[1] || 'common';
        purpose = /chat/.test(lower) ? 'hunter_chat_voice' : 'hunter_action_voice'; level = 'high';
    } else if (/^pl_dia_|player_.*(?:chara.*voice|dialogue)|^dialogue/.test(lower)) {
        category = 'hunter_voice'; role = lower.match(/(?:^|_)([fm]\d{2}|d_\d{2})/)?.[1] || 'common';
        purpose = /chara/.test(lower) ? 'character_creation_voice' : 'hunter_dialogue'; level = 'high';
    } else if (/^(?:npc|event_dia_npc|human_.*voice|fsm.*voice)/.test(lower)) {
        category = 'npc_voice'; role = lower.match(/^(npc\d+|fsm\d+)/)?.[1] || 'npc'; purpose = 'npc_dialogue'; level = 'high';
    } else if (/^(?:otomo|ot_|cat_|porter)/.test(lower)) {
        category = 'companion'; role = /^otomo|^cat_/.test(lower) ? 'palico' : /^porter/.test(lower) ? 'seikret' : 'companion';
        purpose = /voice|dia|_m$/.test(lower) ? 'companion_voice' : /wp|weapon/.test(lower) ? 'companion_weapon' : 'companion_action'; level = 'medium';
    } else if (/^hit_|_hit_|hit_/.test(lower)) {
        category = 'hit'; purpose = /weapon/.test(lower) ? 'weapon_impact' : /hm|pl/.test(lower) ? 'hunter_impact' : 'impact'; level = 'high';
    } else if (/^(?:gui|ui|sys_ui)_/.test(lower)) {
        category = 'ui'; purpose = 'interface'; level = 'high';
    } else if (/^(?:bgm|music)/.test(lower)) {
        category = 'music'; purpose = 'background_music'; level = 'high';
    } else if (/^(?:env|st\d+)|weather|wind|rain|blizzard|sandstorm|underwater/.test(lower)) {
        category = 'environment'; purpose = 'environment_ambience'; level = 'medium';
    } else if (/^(?:it\d+|item|human_item|meat|buff|pl_com|pl_quest|system)/.test(lower)) {
        category = 'item'; role = lower.match(/^it\d+/)?.[0] || 'common'; purpose = /meat/.test(lower) ? 'canteen' : 'item_or_system_action'; level = 'medium';
    } else if (/^(?:gm\d+|gimmick)/.test(lower)) {
        category = 'gimmick'; purpose = 'world_gimmick'; level = 'medium';
    } else if (/^(?:event|ev\d+)/.test(lower)) {
        category = 'event'; purpose = /dia|voice/.test(lower) ? 'event_dialogue' : 'event_sound'; level = 'medium';
    } else if (/^(?:acc|accessory)/.test(lower)) {
        category = 'accessory'; purpose = 'equipment_accessory'; level = 'medium';
    }

    evidence.push(`rule:${category}:${purpose}`);
    return { game, bank, category, group: role || monsterId || weaponId || 'common', language, purpose, weaponId, monsterId, monsterVariant, classification: confidence(level, evidence) };
}

function inferClipPurpose(meta, input = {}) {
    const options = typeof input === 'number' ? { duration: input } : (input || {});
    const seconds = Number(options.duration) || 0;
    const semantic = options.semanticReference || null;
    const bankEvidence = {
        level: meta.classification?.level || 'low',
        evidence: [...(meta.classification?.evidence || [])]
    };
    const reviewHints = {
        durationSeconds: Number(seconds.toFixed(3)),
        durationBand: seconds <= 0 ? 'unknown' : seconds < 0.4 ? 'very-short' : seconds < 1.2 ? 'short' : seconds < 3 ? 'medium' : 'long'
    };
    if (!semantic) {
        return {
            actionFamily: 'unknown',
            semanticEvidence: null,
            bankEvidence,
            reviewHints,
            classification: confidence('low', [...bankEvidence.evidence, 'semantic:unresolved'])
        };
    }
    const evidence = [
        ...bankEvidence.evidence,
        `semantic:${semantic.evidence?.type || 'reference'}`,
        semantic.evidence?.location ? `location:${semantic.evidence.location}` : null,
        semantic.label ? `label:${semantic.label}` : null
    ];
    return {
        actionFamily: semantic.actionFamily || 'unknown',
        semanticEvidence: {
            purpose: semantic.purpose || 'unknown',
            actionFamily: semantic.actionFamily || 'unknown',
            label: semantic.label || null,
            tags: Array.isArray(semantic.tags) ? semantic.tags : [],
            confidence: semantic.confidence || 'medium',
            evidence: semantic.evidence || null
        },
        bankEvidence,
        reviewHints,
        classification: confidence(semantic.confidence === 'high' ? 'high' : 'medium', evidence)
    };
}

module.exports = { WEAPON_BY_INDEX, RISE_WEAPON_CODES, WORLD_WEAPON_CODES, cleanBankName, languageOf, classifyBank, inferClipPurpose };

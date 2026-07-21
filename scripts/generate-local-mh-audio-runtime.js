'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GAMES = ['wilds', 'world', 'rise'];
const WEAPONS = [
    'great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn',
    'lance', 'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive', 'light_bowgun',
    'heavy_bowgun', 'bow'
];

function loadAudioEvidenceDatabase() {
    const dbPath = path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
    if (!fs.existsSync(dbPath)) return new Map();
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const rows = db.prepare(`SELECT decoded_path, action_family, event_ids_json, source_ids_json,
        semantic_evidence_json, confidence FROM audio_evidence
        WHERE owner_type='weapon' AND decoded_path IS NOT NULL`).all();
    db.close();
    return new Map(rows.map(row => [String(row.decoded_path).replaceAll('\\', '/'), {
        actionFamily: row.action_family,
        eventIds: JSON.parse(row.event_ids_json || '[]'),
        sourceIds: JSON.parse(row.source_ids_json || '[]'),
        semanticEvidence: JSON.parse(row.semantic_evidence_json || 'null'),
        confidence: row.confidence
    }]));
}

function actionLabelPatterns(action) {
    const id = String(action?.id || '').toLowerCase();
    const cue = String(action?.audioCue || '').toLowerCase();
    const patterns = [];
    const add = (...values) => patterns.push(...values);

    if (/reload|load_phials/.test(id)) add(/reload/, /load phial/);
    if (/special_sheathe/.test(id)) add(/special sheath/, /納刀|纳刀/);
    if (/counter|foresight|iai/.test(id)) add(/counter/, /foresight/, /iai|居合/);
    if (/charge|draw/.test(id)) add(/charg/, /string pull/, /draw/);
    if (/morph_axe|change.*axe/.test(id)) add(/change to axe/);
    if (/morph_sword|change.*sword/.test(id)) add(/change to sword/);

    if (id.startsWith('great_sword.')) {
        if (/true_charged_slash/.test(id)) add(/true charged slash|真正的带电斩击/);
        else if (/charged_slash/.test(id)) add(/charged slash/);
    } else if (id.startsWith('hammer.')) {
        if (/charge|release|mighty/.test(id)) add(/swing charge/, /power charge/, /charging hold/);
    } else if (id.startsWith('sword_shield.')) {
        if (/backstep/.test(id)) add(/backstep charge/);
        if (/charged_slash/.test(id)) add(/charged slash release/);
    } else if (id.startsWith('gunlance.')) {
        if (/full_burst/.test(id)) add(/burst fire/);
        if (/wyvern_fire/.test(id)) add(/wyvern'?s fire/);
        if (/wyrmstake/.test(id)) add(/wyrmstake cannon/);
        if (/shell/.test(id)) add(/shell.*explosion/, /shell charging/);
    } else if (id.startsWith('switch_axe.')) {
        if (/zero_sum|full_release|unbridled|discharge/.test(id)) add(/discharge finisher/, /phial explosion/);
        if (/sword_/.test(id)) add(/sword slash effect/, /amped state slash/);
        if (/heavy_slam/.test(id)) add(/slam attack/);
    } else if (id.startsWith('charge_blade.')) {
        if (/saed/.test(id)) add(/super amped element(?:al)? discharge/);
        else if (/element_discharge|aed/.test(id)) add(/phial explosion/, /axe phial swing/);
        if (/load_phials/.test(id)) add(/load phials/);
        if (/charged_double_slash/.test(id)) add(/charged double slash/);
        if (/savage_axe/.test(id)) add(/phial infused slash/);
    } else if (id.startsWith('insect_glaive.')) {
        if (/extract|focus_thrust/.test(id)) add(/kinsect hit/, /mark target/);
        if (/rising_spiral|descending|airborne/.test(id)) add(/midair/, /vault jump/);
    } else if (id.startsWith('bow.')) {
        if (/dragon_piercer/.test(id) || cue === 'dragon_piercer') add(/dragon piercer/);
        else if (/arc/.test(id)) add(/arc shot/);
        else if (/power_shot|power_volley/.test(id)) add(/power shot/, /arrows? shot/);
        else if (/shot|volley|tracer/.test(id)) add(/arrows? shot/, /quick shot/);
    }
    return patterns;
}

function scoreWeaponActionEntry(action, entry) {
    if (!action || !entry || action.id.split('.')[0] !== entry.weaponId) return -Infinity;
    const label = String(entry.semanticEvidence?.label || '').toLowerCase();
    const bank = String(entry.sourceBank || '').toLowerCase();
    const cue = String(action.audioCue || '').toLowerCase();
    const family = String(entry.actionFamily || entry.semanticEvidence?.actionFamily || '').toLowerCase();
    let score = 0;
    if (cue && cue !== 'none' && family === cue) score += 120;
    if (family === 'weapon_action') score += 8;
    const patterns = actionLabelPatterns(action);
    const matches = patterns.filter(pattern => pattern.test(label)).length;
    score += matches * 45;
    if (action.id.startsWith('hunting_horn.') && /recital|melody|echo/.test(action.id) && /_song_/.test(bank)) score += 58;
    if (/^(?:light|heavy)_bowgun\./.test(action.id) && Number(action.dmg || 0) > 0 && /_shot_/.test(bank)) score += 58;

    const tier = String(action.id).match(/(?:charge|draw)_(\d)/)?.[1];
    const labelledTier = label.match(/(?:tier|level)\s*(\d)/)?.[1];
    if (tier && labelledTier) score += tier === labelledTier ? 28 : -22;
    if (/miss|bad timing|clutch|mount attack|hits? (?:ground|water|dirt|wall)/.test(label)) score -= 70;
    if (entry.semanticEvidence?.confidence === 'high') score += 12;
    else if (entry.semanticEvidence?.confidence === 'medium') score += 5;
    return score;
}

function hasBankEvidence(entry) {
    return ['medium', 'high'].includes(entry?.bankEvidence?.level);
}

function includeEntry(entry) {
    const bank = String(entry.sourceBank || '');
    if (entry.category === 'weapon') {
        return Boolean(entry.semanticEvidence || hasBankEvidence(entry)) && !/gimmick/i.test(bank);
    }
    if (entry.category === 'hunter_voice') {
        const isActionVoice = /Player_ActVoice_|pl_act_vo_|pl_voice_[a-z]_[0-9]+_(?:(?:event(?:_khk)?|sv)_)?media/i.test(bank);
        const isExcluded = /PL_Dia_|clb_npc|clb_Gesture/i.test(bank) || /\[pre\]/i.test(entry.sourceStream || '');
        return Number(entry.duration || 0) > 0 && Number(entry.duration || 0) <= 7
            && Boolean(entry.semanticEvidence || isActionVoice) && !isExcluded;
    }
    if (entry.category === 'monster') {
        return Boolean(entry.semanticEvidence || (hasBankEvidence(entry) && /_se(?:\.|_|$)/i.test(bank)));
    }
    return false;
}

function compactEntry(entry, fallbackGame) {
    const compact = {};
    const fields = [
        'path', 'game', 'category', 'group', 'language', 'purpose', 'actionFamily', 'weaponId',
        'monsterId', 'monsterVariant', 'sourceBank', 'sourceStream', 'duration', 'voiceProfile'
    ];
    fields.forEach(field => {
        const value = field === 'game' ? (entry.game || fallbackGame) : entry[field];
        if (value !== null && value !== undefined && value !== '') compact[field] = value;
    });
    if (entry.semanticEvidence) compact.semanticEvidence = {
        actionFamily: entry.semanticEvidence.actionFamily || entry.actionFamily || 'unknown',
        ...(entry.semanticEvidence.label ? { label: entry.semanticEvidence.label } : {}),
        ...(entry.semanticEvidence.confidence ? { confidence: entry.semanticEvidence.confidence } : {})
    };
    if (entry.bankEvidence) compact.bankEvidence = { level: entry.bankEvidence.level || 'unknown' };
    if (Array.isArray(entry.wwiseEventIds) && entry.wwiseEventIds.length) compact.wwiseEventIds = entry.wwiseEventIds;
    if (Array.isArray(entry.wwiseSourceIds) && entry.wwiseSourceIds.length) compact.wwiseSourceIds = entry.wwiseSourceIds;
    return compact;
}

function generate() {
    const catalogs = {};
    const weaponCounts = Object.fromEntries(WEAPONS.map(id => [id, 0]));

    GAMES.forEach(game => {
        const manifestPath = path.join(ROOT, 'local_assets', 'monster_hunter', game, 'manifest.json');
        if (!fs.existsSync(manifestPath)) return;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const entries = (manifest.entries || []).filter(includeEntry).map(entry => compactEntry(entry, game));
        entries.forEach(entry => {
            if (entry.category === 'weapon' && weaponCounts[entry.weaponId] !== undefined) weaponCounts[entry.weaponId] += 1;
        });
        catalogs[game] = { defaultGain: Number(manifest.defaultGain || 0.8), entries };
    });

    const missingWeapons = WEAPONS.filter(id => weaponCounts[id] === 0);
    if (missingWeapons.length) throw new Error(`No runtime audio candidates for: ${missingWeapons.join(', ')}`);

    const HuntWeaponMechanics = require(path.join(ROOT, 'js', 'effects', 'hunt', 'HuntWeaponMechanics.js'));
    const databaseEvidence = loadAudioEvidenceDatabase();
    const weaponEntries = Object.values(catalogs).flatMap(catalog => catalog.entries).filter(entry => entry.category === 'weapon');
    const actionRoutes = {};
    WEAPONS.forEach(weaponId => {
        HuntWeaponMechanics.actionsFor(weaponId).forEach(action => {
            const ranked = weaponEntries
                .map(entry => ({ entry, score: scoreWeaponActionEntry(action, entry) }))
                .filter(item => item.score >= 45)
                .sort((a, b) => b.score - a.score);
            if (!ranked.length) return;
            const best = ranked[0].score;
            const candidateLimit = best >= 70 ? 4 : 12;
            actionRoutes[action.id] = ranked.filter(item => item.score >= best - 12).slice(0, candidateLimit).map(item => {
                const dbEvidence = databaseEvidence.get(String(item.entry.path).replaceAll('\\', '/'));
                return {
                path: item.entry.path,
                score: item.score,
                label: item.entry.semanticEvidence?.label || null,
                game: item.entry.game,
                eventIds: dbEvidence?.eventIds || item.entry.wwiseEventIds || [],
                sourceIds: dbEvidence?.sourceIds || item.entry.wwiseSourceIds || [],
                confidence: dbEvidence?.confidence || item.entry.semanticEvidence?.confidence || item.entry.bankEvidence?.level || 'unknown',
                evidence: dbEvidence
                    ? 'mh-wilds.sqlite/audio_evidence'
                    : (item.entry.semanticEvidence?.label ? 'manifest/labelled-event' : 'manifest/bank-role')
            };
            });
        });
    });

    const outputPath = path.join(ROOT, 'local_assets', 'monster_hunter', 'runtime-catalog.js');
    const payload = `'use strict';\n// Generated private runtime catalog. Do not publish.\nglobalThis.HUNT_LOCAL_AUDIO_MANIFESTS=${JSON.stringify(catalogs)};\nglobalThis.HUNT_LOCAL_WEAPON_ACTION_ROUTES=${JSON.stringify(actionRoutes)};\n`;
    fs.writeFileSync(outputPath, payload, 'utf8');

    const total = Object.values(catalogs).reduce((sum, catalog) => sum + catalog.entries.length, 0);
    console.log(`[hunt-audio-runtime] ${total} clips, ${(Buffer.byteLength(payload) / 1024 / 1024).toFixed(2)} MiB`);
    console.log(`[hunt-audio-runtime] weapon candidates: ${WEAPONS.map(id => `${id}=${weaponCounts[id]}`).join(', ')}`);
    console.log(`[hunt-audio-runtime] evidence-ranked action routes: ${Object.keys(actionRoutes).length}`);
    return { outputPath, total, weaponCounts, catalogs, actionRoutes };
}

if (require.main === module) generate();

module.exports = { GAMES, WEAPONS, includeEntry, compactEntry, actionLabelPatterns, scoreWeaponActionEntry, loadAudioEvidenceDatabase, generate };

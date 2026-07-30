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

function loadWildsWeaponEventEvidence() {
    const file = path.join(ROOT, 'game_extracts', 'tools', 'wilds-weapon-audio-events.json');
    if (!fs.existsSync(file)) return new Map();
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const index = new Map();
    for (const link of data.triggerLinks || []) {
        for (const sourceId of link.sourceIds || []) {
            const key = `${link.weaponId}:${sourceId}`;
            if (!index.has(key)) index.set(key, []);
            index.get(key).push(link);
        }
    }
    return index;
}

function probableRoleFit(action, roles) {
    const text = `${action?.id || ''} ${action?.audioCue || ''}`.toLowerCase();
    const set = new Set(roles || []);
    const projectile = /shell|burst|wyvern|wyrmstake|discharge|phial|shot|volley|piercer|tracer|kinsect|extract|explos/.test(text);
    const mechanical = /reload|load_phials|morph|sheathe|guard|counter|charge|draw/.test(text);
    let score = 0;
    if (projectile && (set.has('effect') || set.has('shell') || set.has('insect') || set.has('insect-effect'))) score += 34;
    if (!projectile && set.has('motion')) score += 18;
    if (mechanical && (set.has('motion') || set.has('sub'))) score += 12;
    if (projectile && set.size === 1 && set.has('motion')) score -= 8;
    return score;
}

function installedWildsEvidence(action, entry, evidenceIndex) {
    if (entry?.game !== 'wilds' || !entry.weaponId || !Array.isArray(entry.wwiseSourceIds)) return null;
    const links = entry.wwiseSourceIds.flatMap(sourceId =>
        evidenceIndex.get(`${entry.weaponId}:${sourceId}`) || []
    );
    if (!links.length) return null;
    const roles = [...new Set(links.map(link => link.role).filter(Boolean))];
    const motionLinks = links.filter(link => Array.isArray(link.motionContexts) && link.motionContexts.length);
    const smallestMotionSet = motionLinks.length
        ? Math.min(...motionLinks.map(link => link.motionContexts.length))
        : 0;
    return {
        score: 72 + probableRoleFit(action, roles)
            + (motionLinks.length ? 10 : 0)
            + (smallestMotionSet ? Math.max(0, 12 - Math.min(12, smallestMotionSet - 1)) : 0),
        confidence: motionLinks.length ? 'probable' : 'family',
        evidence: motionLinks.length
            ? 'installed-motion-trigger+wwise-event+hirc+source'
            : 'installed-trigger+wwise-event+hirc+source',
        roles,
        triggerIds: [...new Set(links.map(link => link.triggerId))],
        eventIds: [...new Set(links.map(link => String(link.eventId)))],
        sourceIds: [...new Set(links.flatMap(link => link.sourceIds || []).map(String))],
        motionContexts: [...new Map(motionLinks.flatMap(link => link.motionContexts).map(context => [
            `${context.motionList}:${context.motionId}:${context.motionName}`, context
        ])).values()].slice(0, 12)
    };
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
        else if (/charged_slash|charge/.test(id)) add(/charged slash/, /charge tier/);
        else add(/slash/, /tackle/, /overhead/);
    } else if (id.startsWith('long_sword.')) {
        if (/spirit_roundslash|spirit_iai/.test(id)) add(/spirit iai/, /spirit roundslash/);
        else if (/spirit|helm_breaker/.test(id)) add(/spirit/, /thrust/, /iai/);
        else add(/slash/, /stab/);
    } else if (id.startsWith('hammer.')) {
        if (/charge|release|mighty/.test(id)) add(/swing charge/, /power charge/, /charging hold/);
        else add(/smash/, /upswing/, /big bang/);
    } else if (id.startsWith('sword_shield.')) {
        if (/backstep/.test(id)) add(/backstep charge/);
        if (/charged_slash/.test(id)) add(/charged slash release/);
        else add(/slash/, /bash/, /rush/);
    } else if (id.startsWith('gunlance.')) {
        if (/full_burst/.test(id)) add(/burst fire/);
        if (/wyvern_fire/.test(id)) add(/wyvern'?s fire/);
        if (/wyrmstake/.test(id)) add(/wyrmstake cannon/);
        if (/shell/.test(id)) add(/shell.*explosion/, /shell charging/);
        else add(/slash/, /slam/);
    } else if (id.startsWith('switch_axe.')) {
        if (/zero_sum|full_release|unbridled|discharge/.test(id)) add(/discharge finisher/, /phial explosion/);
        if (/sword_/.test(id)) add(/sword slash effect/, /amped state slash/);
        if (/heavy_slam/.test(id)) add(/slam attack/);
        else add(/slash/, /swing/);
    } else if (id.startsWith('charge_blade.')) {
        if (/saed/.test(id)) add(/super amped element(?:al)? discharge/);
        else if (/element_discharge|aed/.test(id)) add(/phial explosion/, /axe phial swing/);
        if (/load_phials/.test(id)) add(/load phials/);
        if (/charged_double_slash/.test(id)) add(/charged double slash/);
        if (/savage_axe/.test(id)) add(/phial infused slash/);
        else add(/slash/, /thrust/);
    } else if (id.startsWith('insect_glaive.')) {
        if (/extract|focus_thrust/.test(id)) add(/kinsect hit/, /mark target/);
        if (/rising_spiral|descending|airborne/.test(id)) add(/midair/, /vault jump/);
        else add(/slash/, /thrust/);
    } else if (id.startsWith('bow.')) {
        if (/dragon_piercer/.test(id) || cue === 'dragon_piercer') add(/dragon piercer/);
        else if (/arc/.test(id)) add(/arc shot/);
        else if (/power_shot|power_volley/.test(id)) add(/power shot/, /arrows? shot/);
        else if (/shot|volley|tracer/.test(id)) add(/arrows? shot/, /quick shot/);
    }
    return patterns;
}

function scoreWeaponActionEntry(action, entry, wildsEvidenceIndex = new Map()) {
    if (!action || !entry || action.id.split('.')[0] !== entry.weaponId) return -Infinity;
    const label = String(entry.semanticEvidence?.label || '').toLowerCase();
    const bank = String(entry.sourceBank || '').toLowerCase();
    const cue = String(action.audioCue || '').toLowerCase();
    const family = String(entry.actionFamily || entry.semanticEvidence?.actionFamily || '').toLowerCase();
    let score = 0;
    if (cue && cue !== 'none' && family === cue) score += 120;
    if (family === 'weapon_action') score += 8;

    // World/Rise common banks are broad fallbacks. Wilds WpXX_Cmn is instead
    // the weapon's real action media bank and is ranked by installed trigger evidence below.
    if (/_epvsp_|_ep_/.test(bank)) score += 50;
    if (entry.game !== 'wilds' && /_com_|_cmn_|_cmn\./.test(bank)) score -= 120;

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
    const installed = installedWildsEvidence(action, entry, wildsEvidenceIndex);
    if (installed) score += installed.score;
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
    const wildsEvidenceIndex = loadWildsWeaponEventEvidence();
    const weaponEntries = Object.values(catalogs).flatMap(catalog => catalog.entries).filter(entry => entry.category === 'weapon');
    const actionRoutes = {};
    WEAPONS.forEach(weaponId => {
        HuntWeaponMechanics.actionsFor(weaponId).forEach(action => {
            if (String(action.audioCue || '').toLowerCase() === 'none') return;
            const ranked = weaponEntries
                .map(entry => ({
                    entry,
                    installed: installedWildsEvidence(action, entry, wildsEvidenceIndex),
                    score: scoreWeaponActionEntry(action, entry, wildsEvidenceIndex)
                }))
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
                eventIds: item.installed?.eventIds || dbEvidence?.eventIds || item.entry.wwiseEventIds || [],
                sourceIds: item.installed?.sourceIds || dbEvidence?.sourceIds || item.entry.wwiseSourceIds || [],
                confidence: item.installed?.confidence || dbEvidence?.confidence || item.entry.semanticEvidence?.confidence || item.entry.bankEvidence?.level || 'unknown',
                evidence: item.installed?.evidence || (dbEvidence
                    ? 'mh-wilds.sqlite/audio_evidence'
                    : (item.entry.semanticEvidence?.label ? 'manifest/labelled-event' : 'manifest/bank-role')),
                ...(item.installed ? {
                    roles: item.installed.roles,
                    triggerIds: item.installed.triggerIds,
                    motionContexts: item.installed.motionContexts
                } : {})
            };
            });
        });
    });

    const outputDir = path.join(ROOT, 'local_assets', 'monster_hunter');
    const manifestOutputPath = path.join(outputDir, 'runtime-audio-manifests.js');
    const routeOutputPath = path.join(outputDir, 'runtime-action-routes.js');
    const manifestPayload = `'use strict';\n// Generated private runtime audio manifests. Do not publish.\nglobalThis.HUNT_LOCAL_AUDIO_MANIFESTS=${JSON.stringify(catalogs)};\n`;
    const routePayload = `'use strict';\n// Generated private evidence-ranked weapon routes. Do not publish.\nglobalThis.HUNT_LOCAL_WEAPON_ACTION_ROUTES=${JSON.stringify(actionRoutes)};\n`;
    fs.writeFileSync(manifestOutputPath, manifestPayload, 'utf8');
    fs.writeFileSync(routeOutputPath, routePayload, 'utf8');

    const total = Object.values(catalogs).reduce((sum, catalog) => sum + catalog.entries.length, 0);
    const totalBytes = Buffer.byteLength(manifestPayload) + Buffer.byteLength(routePayload);
    console.log(`[hunt-audio-runtime] ${total} clips, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
    console.log(`[hunt-audio-runtime] weapon candidates: ${WEAPONS.map(id => `${id}=${weaponCounts[id]}`).join(', ')}`);
    console.log(`[hunt-audio-runtime] evidence-ranked action routes: ${Object.keys(actionRoutes).length}`);
    return {
        outputPath: manifestOutputPath,
        manifestOutputPath,
        routeOutputPath,
        total,
        weaponCounts,
        catalogs,
        actionRoutes
    };
}

if (require.main === module) generate();

module.exports = {
    GAMES, WEAPONS, includeEntry, compactEntry, actionLabelPatterns, probableRoleFit,
    installedWildsEvidence, scoreWeaponActionEntry, loadAudioEvidenceDatabase,
    loadWildsWeaponEventEvidence, generate
};

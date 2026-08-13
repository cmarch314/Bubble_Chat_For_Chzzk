#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LABELS_PATH = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-review-labels.json');
const BANK_MAP_PATH = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-banks.json');
const GRAPH_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'audio_graph');
const OUTPUT_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'WorldMonsterAudioReviewRoutes.generated.js');

const TAG_ROUTES = Object.freeze({
    monster_roar: { kind: 'roar', volume: 0.78 },
    death_vocal: { kind: 'death', volume: 0.72 },
    knockdown_vocal: { kind: 'knockdown', volume: 0.68 },
    trapped_vocal: { kind: 'trap', volume: 0.68 },
    small_flinch_vocal: { kind: 'flinch', volume: 0.62 },
    breath_charge: { kind: 'telegraph', volume: 0.66, keywords: ['breath', 'fireball', 'gas', 'projectile'] },
    breath: { kind: 'attack', volume: 0.66, keywords: ['breath', 'fireball', 'gas', 'projectile', 'tornado'] },
    breath_shot: { kind: 'attack', volume: 0.64, keywords: ['breath', 'fireball', 'projectile'] },
    breath_impact: { kind: 'attack', volume: 0.62, keywords: ['breath', 'fireball', 'projectile', 'impact'] },
    ground_fire: { kind: 'attack', volume: 0.58, keywords: ['fire', 'ground', 'breath'] },
    tornado: { kind: 'attack', volume: 0.64, keywords: ['tornado', 'wind'] },
    thunder: { kind: 'attack', volume: 0.66, keywords: ['thunder', 'lightning'] },
    hoof_step: { kind: 'attack', volume: 0.58, keywords: ['charge', 'stomp', 'hoof'] },
    charge_stride_step: { kind: 'charge_stride_step', volume: 0.58 },
    projectile_launch: { kind: 'projectile_launch', volume: 0.62 },
    wing_flap: { kind: 'attack', volume: 0.58, keywords: ['air', 'flight', 'glide', 'wing'] },
    aerial_attack_vocal: { kind: 'attack', volume: 0.64, keywords: ['air', 'flight', 'glide', 'dive'] },
    bite_vocal: { kind: 'attack', volume: 0.66, keywords: ['bite'] },
    somersault_vocal: { kind: 'attack', volume: 0.7, keywords: ['somersault', 'tail'] },
    physical_attack_vocal: { kind: 'attack', volume: 0.65 },
    physical_attack: { kind: 'attack', volume: 0.64 },
    physical_impact: { kind: 'attack', volume: 0.62 },
    blast_scale_explosion: { kind: 'blast_scale_explosion', volume: 0.74 }
});

function readJson(file, fallback = {}) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return fallback;
    }
}

function clipIndex(graph) {
    const index = new Map();
    for (const event of graph.events || []) {
        for (const variant of event.variants || []) {
            for (const clip of variant.decodedClips || []) {
                index.set(`${event.bank}:${event.eventId}:${clip.sourceId}`, clip.path);
            }
        }
    }
    for (const alias of graph.deduplication?.aliases || []) {
        index.set(`${alias.bank}:${alias.eventId || ''}:${alias.sourceId}`, alias.canonicalPath);
        for (const event of graph.events || []) {
            if (event.bank === alias.bank && event.sourceIds?.includes(Number(alias.sourceId))) {
                index.set(`${event.bank}:${event.eventId}:${alias.sourceId}`, alias.canonicalPath);
            }
        }
    }
    return index;
}

function applyRuntimePolicy(result, runtimePolicy = {}) {
    const silentVoiceMonsterIds = [...new Set(
        (runtimePolicy.silentVoiceMonsterIds || []).map(id => String(id).toLowerCase())
    )];
    const silentSet = new Set(silentVoiceMonsterIds);
    for (const [routeKey, variants] of Object.entries(result.routes)) {
        const monsterId = routeKey.split(':', 1)[0];
        if (!silentSet.has(monsterId)) continue;
        result.routes[routeKey] = variants.filter(variant =>
            !/_vo(?:_|$)/i.test(String(variant.sourceBank || '')));
        if (!result.routes[routeKey].length) delete result.routes[routeKey];
    }

    const voiceFallbackFamilies = [];
    for (const family of runtimePolicy.voiceFallbackFamilies || []) {
        const members = [...new Set((family.members || []).map(id => String(id).toLowerCase()))];
        if (members.length < 2 || family.mode !== 'fill-missing-semantic-tag') continue;
        const familyTags = new Map();
        const memberTags = new Map(members.map(member => [member, new Set()]));
        for (const member of members) {
            for (const [routeKey, variants] of Object.entries(result.routes)) {
                if (!routeKey.startsWith(`${member}:`)) continue;
                const kind = routeKey.slice(member.length + 1);
                for (const variant of variants) {
                    if (!/_vo(?:_|$)/i.test(String(variant.sourceBank || ''))) continue;
                    const tag = String(variant.semanticTag || '');
                    if (!tag) continue;
                    memberTags.get(member).add(tag);
                    if (!familyTags.has(tag)) familyTags.set(tag, []);
                    familyTags.get(tag).push({ member, kind, variant });
                }
            }
        }
        let filledTags = 0;
        for (const target of members) {
            for (const [tag, sources] of familyTags) {
                if (memberTags.get(target).has(tag)) continue;
                for (const source of sources) {
                    if (source.member === target) continue;
                    const routeKey = `${target}:${source.kind}`;
                    if (!result.routes[routeKey]) result.routes[routeKey] = [];
                    const path = source.variant.layers?.[0]?.[0];
                    const duplicate = result.routes[routeKey].some(variant =>
                        variant.semanticTag === tag && variant.layers?.[0]?.[0] === path);
                    if (duplicate) continue;
                    const fallback = {
                        ...source.variant,
                        label: `${target} ${tag} (${source.member} family fallback)`,
                        evidence: 'world-user-audition-family-gap-fill',
                        fallbackFromMonsterId: source.member,
                        fallbackFamilyId: family.id
                    };
                    result.routes[routeKey].push(fallback);
                    result.evidence.push({
                        monsterId: target,
                        routeKey,
                        tag,
                        bank: fallback.sourceBank,
                        eventId: fallback.eventId,
                        sourceId: fallback.sourceId,
                        path,
                        fallbackFromMonsterId: source.member,
                        fallbackFamilyId: family.id
                    });
                }
                memberTags.get(target).add(tag);
                filledTags += 1;
            }
        }
        voiceFallbackFamilies.push({
            id: family.id,
            members,
            mode: family.mode,
            filledTags
        });
    }

    const semanticSeFallbackTags = [...new Set(
        (runtimePolicy.semanticSeFallbackTags || []).map(tag => String(tag).toLowerCase())
    )];
    result.seFallbacks = {};
    for (const tag of semanticSeFallbackTags) {
        const seenPaths = new Set();
        const candidates = Object.values(result.routes)
            .flat()
            .filter(variant =>
                variant.semanticTag === tag
                && /_se(?:_|$)/i.test(String(variant.sourceBank || '')))
            .filter(variant => {
                const audioPath = variant.layers?.[0]?.[0];
                if (!audioPath || seenPaths.has(audioPath)) return false;
                seenPaths.add(audioPath);
                return true;
            })
            .map(variant => ({
                ...variant,
                label: `${tag} temporary semantic SE fallback`,
                evidence: 'world-user-audition-semantic-se-fallback',
                temporaryFallback: true,
                reuseScope: 'cross-species-semantic-se'
            }));
        if (candidates.length) result.seFallbacks[tag] = candidates;
    }
    return { silentVoiceMonsterIds, voiceFallbackFamilies, semanticSeFallbackTags };
}

function runtimeRoutes(labels, bankMap, graphLoader) {
    const routes = {};
    const evidence = [];
    const unresolved = [];
    const indexes = new Map();
    const seen = new Set();

    for (const record of labels.records || []) {
        if (record.verdict !== '확정' || !(record.tags || []).length) continue;
        const bank = String(record.bank || '');
        const bankId = bank.match(/^(em\d+)/i)?.[1]?.toLowerCase();
        const familyVoiceBank = bank.replace(/(?:_\d+)?_(?:se|vo)$/i, '_vo');
        const monsterIds = bankMap[bank.replace(/_se$/i, '_vo')]
            || bankMap[familyVoiceBank]
            || [];
        if (!bankId || !monsterIds.length) {
            unresolved.push({ bank, eventId: record.eventId, sourceId: record.sourceId, reason: 'missing-monster-bank-map' });
            continue;
        }
        if (!indexes.has(bankId)) indexes.set(bankId, clipIndex(graphLoader(bankId)));
        const clipPath = indexes.get(bankId).get(`${bank}:${record.eventId}:${record.sourceId}`);
        if (!clipPath) {
            unresolved.push({ bank, eventId: record.eventId, sourceId: record.sourceId, reason: 'missing-decoded-event-clip' });
            continue;
        }
        for (const rawTag of record.tags) {
            const tag = labels.tagAliases?.[rawTag] || rawTag;
            const policy = TAG_ROUTES[tag];
            if (!policy) {
                unresolved.push({ bank, eventId: record.eventId, sourceId: record.sourceId, tag, reason: 'unrouted-semantic-tag' });
                continue;
            }
            for (const monsterId of monsterIds) {
                const routeKey = `${monsterId}:${policy.kind}`;
                const uniqueKey = `${routeKey}:${clipPath}:${tag}`;
                if (seen.has(uniqueKey)) continue;
                seen.add(uniqueKey);
                if (!routes[routeKey]) routes[routeKey] = [];
                routes[routeKey].push({
                    label: `${monsterId} ${tag}`,
                    evidence: 'world-user-audition-event-group',
                    semanticTag: tag,
                    sourceBank: bank,
                    eventId: Number(record.eventId),
                    sourceId: Number(record.sourceId),
                    ...(policy.keywords ? { patternKeywords: policy.keywords } : {}),
                    layers: [[clipPath, policy.volume, 0]]
                });
                evidence.push({ monsterId, routeKey, tag, bank, eventId: Number(record.eventId), sourceId: Number(record.sourceId), path: clipPath });
            }
        }
    }
    const result = { routes, evidence, unresolved, seFallbacks: {} };
    result.runtimePolicy = applyRuntimePolicy(result, labels.runtimePolicy || {});
    return result;
}

function render(result) {
    return `'use strict';\n\n`
        + `const HUNT_WORLD_MONSTER_REVIEW_ROUTES = Object.freeze(${JSON.stringify(result.routes, null, 2)});\n`
        + `const HUNT_WORLD_MONSTER_REVIEW_EVIDENCE = Object.freeze(${JSON.stringify(result.evidence, null, 2)});\n`
        + `const HUNT_WORLD_MONSTER_REVIEW_UNRESOLVED = Object.freeze(${JSON.stringify(result.unresolved, null, 2)});\n\n`
        + `const HUNT_WORLD_MONSTER_SE_FALLBACKS = Object.freeze(${JSON.stringify(result.seFallbacks || {}, null, 2)});\n\n`
        + `const HUNT_WORLD_MONSTER_SILENT_VOICE_IDS = Object.freeze(${JSON.stringify(result.runtimePolicy?.silentVoiceMonsterIds || [], null, 2)});\n`
        + `const HUNT_WORLD_MONSTER_VOICE_FALLBACK_FAMILIES = Object.freeze(${JSON.stringify(result.runtimePolicy?.voiceFallbackFamilies || [], null, 2)});\n\n`
        + `if (typeof module !== 'undefined' && module.exports) module.exports = { HUNT_WORLD_MONSTER_REVIEW_ROUTES, HUNT_WORLD_MONSTER_REVIEW_EVIDENCE, HUNT_WORLD_MONSTER_REVIEW_UNRESOLVED, HUNT_WORLD_MONSTER_SE_FALLBACKS, HUNT_WORLD_MONSTER_SILENT_VOICE_IDS, HUNT_WORLD_MONSTER_VOICE_FALLBACK_FAMILIES };\n`
        + `else { window.HUNT_WORLD_MONSTER_REVIEW_ROUTES = HUNT_WORLD_MONSTER_REVIEW_ROUTES; window.HUNT_WORLD_MONSTER_REVIEW_EVIDENCE = HUNT_WORLD_MONSTER_REVIEW_EVIDENCE; window.HUNT_WORLD_MONSTER_REVIEW_UNRESOLVED = HUNT_WORLD_MONSTER_REVIEW_UNRESOLVED; window.HUNT_WORLD_MONSTER_SE_FALLBACKS = HUNT_WORLD_MONSTER_SE_FALLBACKS; window.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS = HUNT_WORLD_MONSTER_SILENT_VOICE_IDS; window.HUNT_WORLD_MONSTER_VOICE_FALLBACK_FAMILIES = HUNT_WORLD_MONSTER_VOICE_FALLBACK_FAMILIES; }\n`;
}

function sleepSync(milliseconds) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function replaceGeneratedFile(temporary, destination, contents) {
    const retryable = new Set(['EPERM', 'EACCES', 'EBUSY']);
    let lastError = null;
    for (let attempt = 0; attempt < 12; attempt += 1) {
        try {
            fs.renameSync(temporary, destination);
            return;
        } catch (error) {
            if (!retryable.has(error?.code)) throw error;
            lastError = error;
            sleepSync(25 * (attempt + 1));
        }
    }
    // Windows virus scanners and a concurrently refreshing review server can
    // briefly deny replacement of an existing generated module. A final
    // in-place write is preferable to losing the already committed review
    // label. Verify it byte-for-byte before removing the private temp file.
    try {
        fs.writeFileSync(destination, contents, 'utf8');
        if (fs.readFileSync(destination, 'utf8') !== contents) {
            throw new Error('generated route verification mismatch');
        }
        fs.rmSync(temporary, { force: true });
    } catch (error) {
        throw new Error(`Generated route replacement failed after retries: ${lastError?.message || error.message}`, {
            cause: error
        });
    }
}

function generate(options = {}) {
    const labels = readJson(options.labelsPath || LABELS_PATH, { records: [] });
    const bankMap = readJson(options.bankMapPath || BANK_MAP_PATH, {});
    const graphLoader = options.graphLoader || (bankId =>
        readJson(path.join(GRAPH_ROOT, bankId, 'audio-graph.json'), { events: [] }));
    const result = runtimeRoutes(labels, bankMap, graphLoader);
    const outputPath = options.outputPath || OUTPUT_PATH;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const contents = render(result);
    const temporary = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporary, contents, 'utf8');
    replaceGeneratedFile(temporary, outputPath, contents);
    return {
        routes: Object.keys(result.routes).length,
        clips: result.evidence.length,
        unresolved: result.unresolved.length,
        outputPath
    };
}

if (require.main === module) {
    const summary = generate();
    console.log(`[world-audio-review] routes=${summary.routes} clips=${summary.clips} unresolved=${summary.unresolved}`);
}

module.exports = { TAG_ROUTES, applyRuntimePolicy, clipIndex, generate, render, replaceGeneratedFile, runtimeRoutes };

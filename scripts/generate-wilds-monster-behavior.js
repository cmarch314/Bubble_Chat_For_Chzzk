#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PATTERN_PATH = path.join(ROOT, 'game_extracts', 'tools', 'wilds-monster-patterns.json');
const IDENTIFIER_PATH = path.join(ROOT, 'game_extracts', 'tools', 'wilds-monster-identifiers.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'wilds-monster-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'WildsMonsterBehavior.generated.js');

function slug(value) {
    return String(value || '').normalize('NFKD').replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function classifyAction(className) {
    const value = String(className || '').replace(/^c/, '');
    if (/Roar|Howl/i.test(value)) return 'roar';
    if (/Burrow|Underground|DiveGround/i.test(value)) return 'burrow';
    if (/Breath|Shot|Shoot|Shell|Beam|Laser|Projectile|Bullet|Throw/i.test(value)) return 'projectile';
    if (/Ambush|DiveBomb|DiveAttack|GlideAttack|DropKick|Somersault|JumpAttack|Aerial/i.test(value)) return 'aerial';
    if (/Rush|Charge|Tackle|DashAttack|BodyPressRun/i.test(value)) return 'charge';
    if (/Tail|Sweep|Spin|RollingAttack|TurnAttack/i.test(value)) return 'sweep';
    if (/Explosion|Explode|Bomb|Discharge|Tornado|Nova|Ultimate|AreaAttack|GroundCrack/i.test(value)) return 'area';
    if (/Bite|Claw|Kick|Punch|Slam|Strike|Stamp|BodyPress|Predation|Attack/i.test(value)) return 'close';
    return 'utility';
}

function isUsableAction(action) {
    if (!action?.offensiveCandidate || action.actionKind !== 'action') return false;
    if (classifyAction(action.className) === 'utility') return false;
    return !/(Reaction|Damage|Return|Escape|Demo|Tutorial|Check|Failed|Miss|Dummy|Test|Start$|End$|Loop$|Wait$)/i
        .test(action.className);
}

function actionScore(action) {
    const params = action.conditions?.parameters || {};
    const contextScore = action.stateCandidates?.some(value => /Attack|Hunt|Angry|Combat/i.test(value)) ? 100 : 0;
    const namedScore = /Ultimate|Ambush|Nova|Special|Large|Triple|Double|Ex|Max/i.test(action.className) ? 35 : 0;
    return contextScore + namedScore + Math.max(0, Number(params._SubStamina || 0)) + Math.max(0, Number(params._SubHate || 0));
}

function selectRepresentativeActions(actions, kind = 'large') {
    const desired = kind === 'small' ? 3 : 6;
    const candidates = actions.filter(action => isUsableAction(action) && classifyAction(action.className) !== 'roar');
    const selected = [];
    for (const semantic of ['projectile', 'charge', 'aerial', 'burrow', 'sweep', 'area', 'close']) {
        const candidate = candidates.filter(action => classifyAction(action.className) === semantic)
            .sort((a, b) => actionScore(b) - actionScore(a))[0];
        if (candidate) selected.push(candidate);
        if (selected.length >= desired) break;
    }
    for (const action of candidates.sort((a, b) => actionScore(b) - actionScore(a))) {
        if (selected.length >= desired) break;
        if (!selected.includes(action)) selected.push(action);
    }
    return selected.slice(0, desired);
}

function actionLabel(className, semantic) {
    const tokens = String(className || '').replace(/^c/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/);
    const dictionary = {
        Large: '대형', Double: '연속', Triple: '3연속', Ex: '강화', Ultimate: '필살',
        Ambush: '기습', Rush: '돌진', Charge: '돌진', Tackle: '몸통박치기',
        Dash: '질주', Bite: '물어뜯기', Claw: '할퀴기', Tail: '꼬리',
        Rolling: '회전', Spin: '회전', Sweep: '휩쓸기', Slam: '내려찍기',
        Stamp: '내려찍기', Punch: '강타', Kick: '차기', Somersault: '공중제비',
        Dive: '급강하', Glide: '활공', Jump: '도약', Breath: '브레스',
        Fire: '화염', Flame: '화염', Water: '물', Thunder: '번개', Ice: '빙결',
        Dragon: '용속성', Poison: '독', Shot: '탄', Shoot: '사격',
        Beam: '광선', Laser: '레이저', Shell: '탄환', Explosion: '폭발',
        Discharge: '방전', Tornado: '회오리', Body: '몸통', Press: '압박',
        Ground: '지면', Attack: '공격', Fly: '비행'
    };
    const translated = tokens.map(token => dictionary[token]).filter(Boolean);
    if (translated.length >= 2) return [...new Set(translated)].join(' ');
    return {
        projectile: '원거리 공격', charge: '돌진', aerial: '공중 급습',
        burrow: '지중 급습', sweep: '휩쓸기', area: '광역 공격',
        close: '근접 공격', roar: '포효'
    }[semantic] || '특수 행동';
}

function runtimePattern(monsterId, action, index) {
    const semantic = classifyAction(action.className);
    const isUltimate = /Ultimate|Ambush|Nova/i.test(action.className);
    const targets = semantic === 'area' || semantic === 'sweep' ? [2, 4]
        : semantic === 'projectile' ? [1, 3] : [1, 2];
    return {
        id: `${monsterId}.wilds.${index}.${slug(action.className)}`,
        name: actionLabel(action.className, semantic),
        type: isUltimate ? 'ultimate' : semantic === 'close' ? 'physical' : semantic,
        damageRatio: isUltimate ? 0.90 : semantic === 'area' ? 0.38 : semantic === 'charge' || semantic === 'aerial' ? 0.36 : 0.29,
        windupTicks: isUltimate ? 14 : ['charge', 'aerial', 'burrow'].includes(semantic) ? 7 : 5,
        activeTicks: isUltimate ? 5 : ['projectile', 'sweep'].includes(semantic) ? 3 : 2,
        recoveryTicks: isUltimate ? 18 : 9,
        minTargets: isUltimate ? 4 : targets[0],
        maxTargets: isUltimate ? 4 : targets[1],
        cooldownTicks: isUltimate ? 450 : 32,
        weight: isUltimate ? 0.55 : 1,
        tags: [isUltimate && 'ultimate', semantic, isUltimate && 'all-target'].filter(Boolean),
        requiredState: isUltimate ? 'enraged' : undefined,
        sourceActionClass: action.className,
        sourceActionId: action.actionId,
        sourceStates: action.stateCandidates,
        sourcePath: action.sourcePath,
        sourceGame: 'wilds',
        evidence: action.evidence,
        confidence: 'extracted-action'
    };
}

function buildBehavior(patternSource, identifierSource) {
    const identifiers = identifierSource.identifiers || [];
    const namesByCode = new Map();
    for (const row of identifiers) {
        if (!row.publicMonsterId || !row.nameEn || !patternSource.monsters?.[row.monsterCode]) continue;
        if (!namesByCode.has(row.monsterCode) || row.variantIndex === 0) namesByCode.set(row.monsterCode, row);
    }
    const byName = new Map();
    for (const [monsterCode, identifier] of namesByCode) {
        const actions = patternSource.monsters[monsterCode] || [];
        const monsterId = slug(identifier.nameEn);
        const representative = selectRepresentativeActions(actions, 'large');
        const roar = actions.find(action => isUsableAction(action) && classifyAction(action.className) === 'roar') || null;
        const record = {
            id: monsterId,
            monsterCode,
            publicMonsterId: identifier.publicMonsterId,
            nameEN: identifier.nameEn,
            nameKO: identifier.nameKo,
            roar: {
                status: roar ? 'verified-present' : 'verified-absent',
                sourceActionClass: roar?.className || null,
                audioStatus: 'unresolved'
            },
            sourceActionCount: actions.length,
            offensiveCandidateCount: actions.filter(isUsableAction).length,
            patterns: representative.map((action, index) => runtimePattern(monsterId, action, index)),
            evidence: 'installed-game-action-id+action-param'
        };
        if (roar) record.patterns.unshift({
            id: `${monsterId}.wilds.roar`, name: '포효', type: 'roar', damageRatio: 0,
            windupTicks: 3, activeTicks: 2, recoveryTicks: 8,
            minTargets: 2, maxTargets: 4, cooldownTicks: 120, weight: 0.25,
            tags: ['roar'], sourceActionClass: roar.className, sourceActionId: roar.actionId,
            sourceStates: roar.stateCandidates, sourcePath: roar.sourcePath, sourceGame: 'wilds',
            evidence: roar.evidence, confidence: 'extracted-action'
        });
        const existing = byName.get(monsterId);
        if (!existing || record.offensiveCandidateCount > existing.offensiveCandidateCount) byName.set(monsterId, record);
    }
    return [...byName.values()].sort((a, b) => a.nameEN.localeCompare(b.nameEN));
}

function generate(options = {}) {
    const patterns = JSON.parse(fs.readFileSync(options.patternPath || PATTERN_PATH, 'utf8'));
    const identifiers = JSON.parse(fs.readFileSync(options.identifierPath || IDENTIFIER_PATH, 'utf8'));
    const monsters = buildBehavior(patterns, identifiers);
    const output = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: {
            game: 'Monster Hunter Wilds',
            evidence: patterns.mappingPolicy,
            privateInput: 'game_extracts/tools/wilds-monster-patterns.json'
        },
        counts: {
            monsters: monsters.length,
            patterns: monsters.reduce((sum, monster) => sum + monster.patterns.length, 0),
            sourceActions: monsters.reduce((sum, monster) => sum + monster.sourceActionCount, 0),
            verifiedRoarPresent: monsters.filter(monster => monster.roar.status === 'verified-present').length,
            verifiedRoarAbsent: monsters.filter(monster => monster.roar.status === 'verified-absent').length
        },
        monsters
    };
    fs.mkdirSync(path.dirname(options.outputPath || OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(options.outputPath || OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.mkdirSync(path.dirname(RUNTIME_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_WILDS_MONSTER_BEHAVIOR = ${JSON.stringify(Object.fromEntries(monsters.map(monster => [monster.id, monster])), null, 2)};\n`,
        'utf8');
    return output;
}

if (require.main === module) {
    try {
        console.log(JSON.stringify(generate().counts, null, 2));
    } catch (error) {
        console.error(`[wilds-monster-behavior] ${error.stack || error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { classifyAction, isUsableAction, selectRepresentativeActions, actionLabel, buildBehavior, generate };

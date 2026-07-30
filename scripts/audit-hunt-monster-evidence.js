#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'data', 'hunt', 'monster-evidence-audit.generated.json');
global.window = global;
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
require('../js/effects/MonsterData.js');
const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const ReleasePolicy = require('../js/effects/hunt/HuntMonsterReleasePolicy.js');
const { HUNT_ROAR_ROUTE, HUNT_VERIFIED_LOCAL_MONSTER_CUES } = require('../js/effects/hunt/HuntAudioCatalog.js');

function runtimeId(id) {
    return String(id || '').toLowerCase().replace(/[-']/g, '_');
}

function hasExactRoarAudio(monsterId) {
    const id = runtimeId(monsterId);
    const routed = HUNT_ROAR_ROUTE[id] || id;
    return Boolean(HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${id}:roar`]
        || HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${routed}:roar`]);
}

function main() {
    const roster = global.MONSTER_DATA || [];
    const combat = roster.filter(monster => monster.selectable !== false);
    const releasedIds = ReleasePolicy.reviewedIds();
    const patternCatalog = PatternCatalog.build({}, roster);
    const records = combat.map(monster => {
        const patterns = patternCatalog[runtimeId(monster.id)] || [];
        const fallbackPatterns = patterns.filter(pattern => String(pattern.evidence || '').startsWith('species-archetype:'));
        const documentedPatterns = patterns.filter(pattern => pattern.evidence === 'published-behavior-description');
        const inferredPatterns = patterns.filter(pattern =>
            pattern.confidence === 'pattern-inferred'
            || String(pattern.evidence || '').startsWith('species-archetype:'));
        const patternStatus = releasedIds.has(monster.id) ? 'reviewed-release'
            : fallbackPatterns.length ? 'fallback-candidate'
                : documentedPatterns.length === patterns.length ? 'documented-candidate'
                    : 'source-derived-candidate';
        const profiles = patterns.map(pattern => AnimationCatalog.resolve(pattern, pattern.name, pattern.type, monster));
        const imagePath = monster.imagePath || (monster.filename ? `img/monsters/${monster.filename}` : null);
        const imageExists = Boolean(imagePath && imagePath !== 'img/monsters/unknown_monster.png'
            && fs.existsSync(path.join(ROOT, imagePath)));
        const rig = AnimationCatalog.resolveRig(monster);
        return {
            id: monster.id,
            nameKO: monster.nameKO,
            tier: monster.tier,
            image: { status: imageExists ? 'verified-local' : 'missing', path: imagePath, evidence: monster.mediaEvidence || null },
            anatomy: {
                species: monster.species || null,
                speciesStatus: monster.species ? 'verified' : 'unresolved',
                skeleton: monster.skeleton || [],
                rig: rig.id,
                rigEvidence: rig.evidence
            },
            roar: {
                status: monster.tier === 'small' ? 'not-used-small-monster' : (monster.roar?.status || 'unresolved'),
                evidence: monster.roar?.evidence || null,
                audioStatus: hasExactRoarAudio(monster.id) ? 'verified-exact-or-labelled-shared' : 'unresolved'
            },
            patterns: {
                status: patternStatus,
                count: patterns.length,
                fallbackCount: fallbackPatterns.length,
                inferredCount: inferredPatterns.length,
                reviewed: releasedIds.has(monster.id),
                evidence: [...new Set(patterns.map(pattern => pattern.evidence || 'unresolved'))]
            },
            animation: {
                semanticProfiles: [...new Set(profiles.map(profile => profile.id))],
                deliveryProfiles: [...new Set(profiles.map(profile => profile.delivery).filter(Boolean))],
                rig: rig.id
            }
        };
    });
    const count = predicate => records.filter(predicate).length;
    const report = {
        version: 1,
        scope: { roster: roster.length, combat: combat.length, journeyEventOnly: roster.length - combat.length },
        summary: {
            verifiedImages: count(row => row.image.status === 'verified-local'),
            reviewedPatternKits: count(row => row.patterns.status === 'reviewed-release'),
            sourceDerivedCandidateKits: count(row => row.patterns.status === 'source-derived-candidate'),
            documentedCandidateKits: count(row => row.patterns.status === 'documented-candidate'),
            fallbackCandidateKits: count(row => row.patterns.status === 'fallback-candidate'),
            verifiedSpecies: count(row => row.anatomy.speciesStatus === 'verified'),
            installedSkeletons: count(row => row.anatomy.rigEvidence === 'installed-skeleton'),
            resolvedAnimationRigs: count(row => row.anatomy.rig !== 'generic'),
            verifiedRoarPresence: count(row => row.roar.status === 'verified-present'),
            verifiedRoarAbsence: count(row => row.roar.status === 'verified-absent' || row.roar.status === 'not-used-small-monster'),
            unresolvedLargeRoar: count(row => !['verified-present', 'verified-absent', 'not-used-small-monster'].includes(row.roar.status)),
            verifiedRoarAudio: count(row => row.roar.audioStatus.startsWith('verified'))
        },
        unresolved: {
            images: records.filter(row => row.image.status !== 'verified-local').map(row => row.id),
            patterns: records.filter(row => row.patterns.status === 'fallback-candidate').map(row => row.id),
            patternReview: records.filter(row => !row.patterns.reviewed).map(row => row.id),
            species: records.filter(row => row.anatomy.speciesStatus !== 'verified').map(row => row.id),
            animationRig: records.filter(row => row.anatomy.rig === 'generic').map(row => row.id),
            largeRoar: records.filter(row => !['verified-present', 'verified-absent', 'not-used-small-monster'].includes(row.roar.status)).map(row => row.id),
            roarAudio: records.filter(row => row.roar.status === 'verified-present' && !row.roar.audioStatus.startsWith('verified')).map(row => row.id)
        },
        records
    };
    fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report.summary, null, 2));
    if (report.unresolved.images.length) process.exitCode = 1;
    return report;
}

if (require.main === module) main();
module.exports = { main };

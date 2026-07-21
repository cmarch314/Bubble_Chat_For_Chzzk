const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { HUNT_BGM_LOCALES, HUNT_DEDICATED_THEMES, HUNT_MONSTER_HABITATS } = require('../js/effects/hunt/HuntBgmCatalog.js');
const {
    HUNT_PROTECTED_CLASSIC_AUDIO,
    HUNT_ROAR_ROUTE,
    HUNT_VERIFIED_LOCAL_WEAPON_CUES,
    HUNT_VERIFIED_LOCAL_MONSTER_CUES
} = require('../js/effects/hunt/HuntAudioCatalog.js');
const wildsMotionValues = require('../js/effects/hunt/data/WildsMotionValues.generated.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntMotionValueCatalog = require('../js/effects/hunt/HuntMotionValueCatalog.js');

const root = path.resolve(__dirname, '..');
const allTracks = [...new Set([
    ...Object.values(HUNT_BGM_LOCALES).flat(),
    ...Object.values(HUNT_DEDICATED_THEMES).flat()
])];
const weaponSfx = [...new Set(Object.values(HUNT_VERIFIED_LOCAL_WEAPON_CUES)
    .flat()
    .flatMap(variant => variant.layers.map(layer => layer[0])))];
const monsterSfx = [...new Set(Object.values(HUNT_VERIFIED_LOCAL_MONSTER_CUES)
    .flat()
    .flatMap(variant => variant.layers.map(layer => layer[0])))];
const protectedClassicSfx = HUNT_PROTECTED_CLASSIC_AUDIO.map(file => `MonsterHunter_Soundtracks/${file}`);

function hashFile(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const missing = [];
const hashes = new Map();
const bgmDir = path.join(root, 'BGM');
const allBgmFiles = fs.existsSync(bgmDir)
    ? fs.readdirSync(bgmDir).filter(name => /\.(mp3|wav|ogg)$/i.test(name)).map(name => `BGM/${name}`)
    : [];
for (const relative of [...new Set([...allTracks, ...allBgmFiles, ...weaponSfx, ...monsterSfx, ...protectedClassicSfx])]) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) {
        missing.push(relative);
        continue;
    }
    const hash = hashFile(absolute);
    if (!hashes.has(hash)) hashes.set(hash, []);
    hashes.get(hash).push(relative);
}

const duplicates = [...hashes.values()].filter(group => group.length > 1);
const monsterJsonPath = path.join(root, 'img', 'monsters', 'monsters.json');
let monsterIds = [];
if (fs.existsSync(monsterJsonPath)) {
    const runtimeMonsters = JSON.parse(fs.readFileSync(monsterJsonPath, 'utf8'));
    monsterIds = runtimeMonsters.map(monster => String(monster.id || '').replace(/[-']/g, '_')).filter(Boolean);
} else {
    const monsterSource = fs.readFileSync(path.join(root, 'js', 'effects', 'MonsterData.js'), 'utf8');
    const monsterSection = monsterSource.split('window.HUNT_WEAPONS')[0];
    monsterIds = [...monsterSection.matchAll(/\bid:\s*["']([^"']+)["']/g)].map(match => match[1].replace(/[-']/g, '_'));
}
const missingHabitats = monsterIds.filter(id => !HUNT_MONSTER_HABITATS[id]);
const verifiedRoarIds = new Set(Object.keys(HUNT_VERIFIED_LOCAL_MONSTER_CUES)
    .filter(route => route.endsWith(':roar'))
    .map(route => route.split(':')[0]));
const monstersWithoutVerifiedRoar = monsterIds.filter(id => {
    const routed = HUNT_ROAR_ROUTE[id];
    return !verifiedRoarIds.has(id) && !(routed && verifiedRoarIds.has(routed));
});
const effectiveVerifiedRoars = monsterIds.length - monstersWithoutVerifiedRoar.length;
const unreferencedBgm = allBgmFiles.filter(file => !allTracks.includes(file));
const motionValueRows = Object.values(wildsMotionValues.weapons || {}).flat();
const measuredActionTimings = motionValueRows.filter(row => Number(row.motionTimeSeconds) > 0 && row.timingEvidence !== 'unresolved');
const estimatedActionTimings = motionValueRows.length - measuredActionTimings.length;
const runtimeTimingPath = path.join(root, 'data', 'hunt', 'wilds-runtime-motion-timings.json');
let capturedRuntimeTimings = 0;
let unresolvedRuntimeTimings = 0;
if (fs.existsSync(runtimeTimingPath)) {
    const runtimeTimings = JSON.parse(fs.readFileSync(runtimeTimingPath, 'utf8'));
    capturedRuntimeTimings = Object.keys(runtimeTimings.actions || {}).length;
    unresolvedRuntimeTimings = (runtimeTimings.unresolved || []).length;
}
const extractedTimingPath = path.join(root, 'game_extracts', 'tools', 'wilds-motion-timings.json');
let extractedMotionRows = 0;
if (fs.existsSync(extractedTimingPath)) {
    const extractedTimings = JSON.parse(fs.readFileSync(extractedTimingPath, 'utf8'));
    extractedMotionRows = Object.values(extractedTimings.weapons || {}).flatMap(weapon => weapon.motions || []).length;
}
const comboGraphPath = path.join(root, 'game_extracts', 'tools', 'wilds-weapon-combos.json');
let mechanicEvidenceMismatches = [];
let canonicalWeaponCount = 0;
let canonicalDamagingActions = 0;
let canonicalMotionValueLinks = 0;
Object.keys(HuntWeaponMechanics.canonicalActions()).forEach(weaponId => {
    (HuntWeaponMechanics.actionsFor(weaponId) || []).filter(action => Number(action.motionValue) > 0).forEach(action => {
        canonicalDamagingActions++;
        if (HuntMotionValueCatalog.resolve(weaponId, action, wildsMotionValues)) canonicalMotionValueLinks++;
    });
});
if (fs.existsSync(comboGraphPath)) {
    const comboGraph = JSON.parse(fs.readFileSync(comboGraphPath, 'utf8'));
    Object.entries(comboGraph.weapons || {}).forEach(([weaponId, weapon]) => {
        const actions = HuntWeaponMechanics.actionsFor(weaponId) || [];
        if (actions.length) canonicalWeaponCount++;
        const installedClasses = new Set((weapon.actions || []).map(row => row.className).filter(Boolean));
        actions.forEach(action => {
            const match = String(action.mechanicEvidence || '').match(/^wilds-action-class(?:-candidate)?:([A-Za-z0-9_]+)$/);
            if (match && !installedClasses.has(match[1])) mechanicEvidenceMismatches.push(`${action.id} -> ${match[1]}`);
        });
    });
} else {
    canonicalWeaponCount = Object.keys(HuntWeaponMechanics.canonicalActions()).length;
}

console.log(`[hunt-assets] referenced tracks/SFX: ${allTracks.length + weaponSfx.length + monsterSfx.length + protectedClassicSfx.length}`);
console.log(`[hunt-assets] verified local weapon clips: ${weaponSfx.length}`);
console.log(`[hunt-assets] verified local monster clips: ${monsterSfx.length}`);
console.log(`[hunt-assets] verified local monster routes: ${Object.keys(HUNT_VERIFIED_LOCAL_MONSTER_CUES).length}`);
console.log(`[hunt-assets] protected classic clips: ${protectedClassicSfx.length}`);
console.log(`[hunt-assets] missing referenced assets: ${missing.length}`);
missing.forEach(file => console.log(`  MISSING ${file}`));
console.log(`[hunt-assets] duplicate-content groups: ${duplicates.length}`);
duplicates.forEach(group => console.log(`  DUPLICATE ${group.join(' == ')}`));
console.log(`[hunt-assets] monsters without explicit habitat profile: ${missingHabitats.length}`);
missingHabitats.forEach(id => console.log(`  NO_HABITAT ${id}`));
console.log(`[hunt-assets] monsters deliberately silent without verified roar: ${monstersWithoutVerifiedRoar.length}`);
console.log(`[hunt-assets] monsters with exact or proven-family roar: ${effectiveVerifiedRoars}/${monsterIds.length}`);
console.log(`[hunt-assets] BGM files outside battle resolver (lobby/result/manual included): ${unreferencedBgm.length}`);
unreferencedBgm.forEach(file => console.log(`  NON_BATTLE ${file}`));
console.log(`[hunt-assets] Wilds motion-value actions: ${motionValueRows.length}`);
console.log(`[hunt-assets] canonical damaging actions matched to sheet rows: ${canonicalMotionValueLinks}/${canonicalDamagingActions}`);
console.log(`[hunt-assets] canonical damaging actions using authored MV fallback: ${canonicalDamagingActions - canonicalMotionValueLinks}`);
console.log(`[hunt-assets] action timings linked to verified motion IDs: ${measuredActionTimings.length}`);
console.log(`[hunt-assets] action timings still using explicit estimates: ${estimatedActionTimings}`);
console.log(`[hunt-assets] canonical runtime actions linked by live capture: ${capturedRuntimeTimings}`);
console.log(`[hunt-assets] canonical runtime actions awaiting live capture: ${unresolvedRuntimeTimings}`);
console.log(`[hunt-assets] raw installed-game motions awaiting action linkage: ${extractedMotionRows || 'private extract unavailable'}`);
console.log(`[hunt-assets] canonical state-machine weapon coverage: ${canonicalWeaponCount}/14`);
console.log(`[hunt-assets] mechanic evidence classes absent from installed graph: ${mechanicEvidenceMismatches.length}`);
mechanicEvidenceMismatches.forEach(row => console.log(`  BAD_MECHANIC_EVIDENCE ${row}`));

if (missing.some(file => weaponSfx.includes(file) || monsterSfx.includes(file) || protectedClassicSfx.includes(file)) || mechanicEvidenceMismatches.length) process.exitCode = 1;

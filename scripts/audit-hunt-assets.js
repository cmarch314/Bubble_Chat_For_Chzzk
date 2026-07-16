const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { HUNT_BGM_LOCALES, HUNT_DEDICATED_THEMES, HUNT_MONSTER_HABITATS } = require('../js/effects/hunt/HuntBgmCatalog.js');
const { HUNT_ROAR_ROUTE, HUNT_WEAPON_AUDIO_CUES } = require('../js/effects/hunt/HuntAudioCatalog.js');

const root = path.resolve(__dirname, '..');
const allTracks = [...new Set([
    ...Object.values(HUNT_BGM_LOCALES).flat(),
    ...Object.values(HUNT_DEDICATED_THEMES).flat()
])];
const weaponSfx = [...new Set(Object.values(HUNT_WEAPON_AUDIO_CUES).flat().map(layer => layer[0]))];

function hashFile(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const missing = [];
const hashes = new Map();
const bgmDir = path.join(root, 'BGM');
const allBgmFiles = fs.existsSync(bgmDir)
    ? fs.readdirSync(bgmDir).filter(name => /\.(mp3|wav|ogg)$/i.test(name)).map(name => `BGM/${name}`)
    : [];
for (const relative of [...new Set([...allTracks, ...allBgmFiles, ...weaponSfx])]) {
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
const roarDir = path.join(root, 'SFX', 'MonsterHunter_Roars');
const roars = fs.existsSync(roarDir)
    ? fs.readdirSync(roarDir).filter(name => /\.(mp3|wav|ogg)$/i.test(name))
    : [];
const suspiciousRoars = roars.filter(name => fs.statSync(path.join(roarDir, name)).size < 3000);
const monsterSource = fs.readFileSync(path.join(root, 'js', 'effects', 'MonsterData.js'), 'utf8');
const monsterSection = monsterSource.split('window.HUNT_WEAPONS')[0];
const monsterIds = [...monsterSection.matchAll(/\bid:\s*["']([^"']+)["']/g)].map(match => match[1].replace(/-/g, '_'));
const missingHabitats = monsterIds.filter(id => !HUNT_MONSTER_HABITATS[id]);
const missingDedicatedRoars = monsterIds.filter(id => {
    const routed = HUNT_ROAR_ROUTE[id] || id;
    return !roars.includes(`roar_${routed}.mp3`);
});
const unreferencedBgm = allBgmFiles.filter(file => !allTracks.includes(file));

console.log(`[hunt-assets] referenced tracks/SFX: ${allTracks.length + weaponSfx.length}`);
console.log(`[hunt-assets] available roar files: ${roars.length}`);
console.log(`[hunt-assets] missing referenced assets: ${missing.length}`);
missing.forEach(file => console.log(`  MISSING ${file}`));
console.log(`[hunt-assets] duplicate-content groups: ${duplicates.length}`);
duplicates.forEach(group => console.log(`  DUPLICATE ${group.join(' == ')}`));
console.log(`[hunt-assets] suspicious tiny roars: ${suspiciousRoars.length}`);
suspiciousRoars.forEach(file => console.log(`  TINY ${file}`));
console.log(`[hunt-assets] monsters without explicit habitat profile: ${missingHabitats.length}`);
missingHabitats.forEach(id => console.log(`  NO_HABITAT ${id}`));
console.log(`[hunt-assets] monsters using fallback roar: ${missingDedicatedRoars.length}`);
console.log(`[hunt-assets] BGM files outside battle resolver (lobby/result/manual included): ${unreferencedBgm.length}`);
unreferencedBgm.forEach(file => console.log(`  NON_BATTLE ${file}`));

if (!fs.existsSync(path.join(root, weaponSfx[0]))) process.exitCode = 1;

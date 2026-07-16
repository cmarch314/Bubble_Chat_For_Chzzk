const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const failures = [];
const checked = new Set();
const runtimeAudioReferences = new Set();
const mediaPattern = /\.(?:mp3|wav|ogg|m4a|aac|flac|mp4|webm|png|jpe?g|gif)$/i;
const audioPattern = /\.(?:mp3|wav|ogg|m4a|aac|flac)$/i;

function normalize(reference) {
    return reference.replace(/^\.\//, '').replaceAll('/', path.sep);
}

function requireFile(reference, source) {
    const normalized = normalize(reference);
    const absolute = path.resolve(root, normalized);
    checked.add(normalized.replaceAll(path.sep, '/'));
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
        failures.push(`${source}: ${reference}`);
    }
}

function collect(value, keyPath, visitor) {
    if (typeof value === 'string') {
        visitor(value, keyPath);
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        collect(nested, `${keyPath}.${key}`, visitor);
    }
}

function loadWindowScripts(files) {
    const window = {};
    const context = vm.createContext({ window });
    for (const file of files) {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        vm.runInContext(source, context, { filename: file });
    }
    return window;
}

const config = loadWindowScripts([
    'config.js',
    path.join('config', 'sound-catalog.js'),
    path.join('config', 'visual-config.js'),
    path.join('config', 'cmc-catalog.js')
]);

collect(config.HIVE_SOUND_CONFIG, 'HIVE_SOUND_CONFIG', (reference, keyPath) => {
    if (!audioPattern.test(reference)) return;
    const runtimePath = path.join('SFX', normalize(reference));
    requireFile(runtimePath, keyPath);
    runtimeAudioReferences.add(runtimePath.replaceAll(path.sep, '/'));
});

collect(config.HIVE_VISUAL_CONFIG, 'HIVE_VISUAL_CONFIG', (reference, keyPath) => {
    if (!mediaPattern.test(reference)) return;
    if (reference.startsWith('./')) {
        requireFile(reference, keyPath);
        return;
    }
    if (keyPath.startsWith('HIVE_VISUAL_CONFIG.random_dance.videoPool.')) {
        requireFile(path.join('Video', 'RandomDance', reference), keyPath);
        return;
    }
    failures.push(`${keyPath}: ambiguous runtime asset path '${reference}'`);
});

for (const command of config.HIVE_CMC_FILES || []) {
    requireFile(path.join('AI CMC', `${command}.mp4`), 'HIVE_CMC_FILES');
}

const levels = loadWindowScripts([path.join('js', 'audio-levels.generated.js')]).HIVE_AUDIO_LEVELS || {};
for (const reference of Object.keys(levels)) {
    requireFile(reference, 'HIVE_AUDIO_LEVELS');
}

const levelLookup = new Map(Object.entries(levels).map(([reference, entry]) => [reference.toLowerCase(), entry]));
for (const reference of runtimeAudioReferences) {
    const profile = levelLookup.get(reference.toLowerCase());
    if (profile?.silent === true) {
        failures.push(`HIVE_SOUND_CONFIG references silent audio: ${reference}`);
    }
}

const profileRoots = ['SFX', 'BGM', 'MonsterHunter_Soundtracks', 'Video', 'AI CMC'];
const normalizedProfiles = new Set(Object.keys(levels).map(reference => reference.replaceAll('\\', '/').toLowerCase()));
for (const rootName of profileRoots) {
    const rootPath = path.join(root, rootName);
    if (!fs.existsSync(rootPath)) continue;
    const stack = [rootPath];
    while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const absolute = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(absolute);
                continue;
            }
            if (!audioPattern.test(entry.name) && !/\.(?:mp4|webm)$/i.test(entry.name)) continue;
            const relative = path.relative(root, absolute).replaceAll(path.sep, '/');
            if (!normalizedProfiles.has(relative.toLowerCase())) {
                failures.push(`HIVE_AUDIO_LEVELS missing profile: ${relative}`);
            }
        }
    }
}

console.log(`[assets] Verified ${checked.size} unique runtime media files.`);
console.log(`[assets] Verified ${(config.HIVE_CMC_FILES || []).length} chat video commands.`);
console.log(`[assets] Verified ${Object.keys(levels).length} measured audio profiles.`);

if (failures.length) {
    for (const failure of failures) console.error(`[missing] ${failure}`);
    process.exit(1);
}

console.log('[assets] Runtime asset integrity passed.');

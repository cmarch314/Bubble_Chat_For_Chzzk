const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const addDir = path.resolve(__dirname, '../SFX/Add');
const targetDir = path.resolve(__dirname, '../SFX/Chzzk_Signatures');
const configFile = path.resolve(__dirname, '../config.js');
const generatorScript = path.resolve(__dirname, './generate_sfx_catalog.js');

// 1. Scan Add folder
if (!fs.existsSync(addDir)) {
    fs.mkdirSync(addDir, { recursive: true });
}

const files = fs.readdirSync(addDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(ext);
});

if (files.length === 0) {
    console.log("No new audio files found in SFX/Add.");
    process.exit(0);
}

console.log(`Found ${files.length} new audio files in SFX/Add.`);

// 2. Load existing config.js using vm context
const configCode = fs.readFileSync(configFile, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(configCode, sandbox);

if (!sandbox.window.HIVE_SOUND_CONFIG) {
    console.error("Error: window.HIVE_SOUND_CONFIG not found in config.js.");
    process.exit(1);
}

const soundConfig = sandbox.window.HIVE_SOUND_CONFIG;

// 3. Move files and register them
files.forEach(file => {
    const srcPath = path.join(addDir, file);
    const destPath = path.join(targetDir, file);
    
    // Move file
    fs.renameSync(srcPath, destPath);
    console.log(`Moved: ${file} -> SFX/Chzzk_Signatures/`);
    
    // Command name is filename without extension
    const cmdName = path.parse(file).name;
    
    // Register command
    soundConfig[cmdName] = {
        src: `Chzzk_Signatures/${file}`,
        volume: 0.7
    };
    console.log(`Registered command: "${cmdName}"`);
});

// 4. Sort soundConfig keys alphabetically
const sortedConfig = {};
Object.keys(soundConfig).sort().forEach(key => {
    sortedConfig[key] = soundConfig[key];
});

// 5. Replace HIVE_SOUND_CONFIG in config.js
const startMarker = 'window.HIVE_SOUND_CONFIG = {';
const startIndex = configCode.indexOf(startMarker);
if (startIndex === -1) {
    console.error("Error: Could not find HIVE_SOUND_CONFIG start marker in config.js.");
    process.exit(1);
}

const nextMarker = 'window.HIVE_VISUAL_CONFIG = {';
const nextIndex = configCode.indexOf(nextMarker);
if (nextIndex === -1) {
    console.error("Error: Could not find HIVE_VISUAL_CONFIG start marker in config.js.");
    process.exit(1);
}

const preNextText = configCode.substring(startIndex, nextIndex);
const lastClosingBraceIndex = preNextText.lastIndexOf('};');
if (lastClosingBraceIndex === -1) {
    console.error("Error: Could not find closing brace of HIVE_SOUND_CONFIG.");
    process.exit(1);
}

const absoluteEndIndex = startIndex + lastClosingBraceIndex + 2;

// Construct the new config code
const newSoundConfigCode = `window.HIVE_SOUND_CONFIG = ${JSON.stringify(sortedConfig, null, 4)};`;
const updatedConfigCode = configCode.substring(0, startIndex) + newSoundConfigCode + configCode.substring(absoluteEndIndex);

fs.writeFileSync(configFile, updatedConfigCode, 'utf8');
console.log("Successfully updated config.js with new sound mappings.");

// 6. Regenerate SFX catalog
try {
    console.log("Regenerating SFX Catalog...");
    execSync(`node "${generatorScript}"`, { stdio: 'inherit' });
} catch (err) {
    console.error("Failed to regenerate SFX catalog:", err);
}

console.log("Import process completed successfully!");

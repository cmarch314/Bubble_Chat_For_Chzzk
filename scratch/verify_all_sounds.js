const fs = require('fs');
const path = require('path');

// 1. Read config.js
const content = fs.readFileSync('config.js', 'utf8');

// 2. Extract window.HIVE_SOUND_CONFIG block
const match = content.match(/window\.HIVE_SOUND_CONFIG\s*=\s*\{([\s\S]*?)};\r?\n\r?\n\/\//);
if (!match) {
    console.log("Could not find HIVE_SOUND_CONFIG");
    process.exit(1);
}

const objStr = "{\n" + match[1] + "}";
let configObj;
try {
    configObj = eval("(" + objStr + ")");
} catch (e) {
    console.log("Error evaluating config:", e.message);
    process.exit(1);
}

// 3. Scan SFX folder files
const sfxDir = 'SFX';
const sfxFiles = new Set(
    fs.readdirSync(sfxDir)
      .filter(file => fs.statSync(path.join(sfxDir, file)).isFile())
      .map(file => file.normalize('NFC').toLowerCase())
);

console.log(`Loaded ${sfxFiles.size} physical SFX files.`);

let missingCount = 0;
const missingResults = [];

// 4. Verify all mapped files in config
for (const [key, value] of Object.entries(configObj)) {
    const processItem = (item) => {
        const src = (typeof item === 'object' ? item.src : item) || "";
        if (!src) return;
        const normSrc = src.normalize('NFC').toLowerCase();
        
        if (!sfxFiles.has(normSrc)) {
            missingCount++;
            missingResults.push({ key, src });
        }
    };

    if (Array.isArray(value)) {
        value.forEach(processItem);
    } else {
        processItem(value);
    }
}

// 5. Output results
console.log(`\nVerification Finished. Mapped commands count: ${Object.keys(configObj).length}`);
if (missingCount > 0) {
    console.log(`🚨 Found ${missingCount} broken file mappings!`);
    missingResults.forEach(res => {
        console.log(` - Key: "${res.key}" refers to missing file: "${res.src}"`);
    });
    fs.writeFileSync('missing_keys.txt', JSON.stringify(missingResults, null, 2), 'utf8');
    console.log("Results written to missing_keys.txt");
} else {
    console.log("✅ All sound commands are fully verified! Every single mapping points to a valid file in SFX folder.");
}

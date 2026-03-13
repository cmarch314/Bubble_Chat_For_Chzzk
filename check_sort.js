const fs = require('fs');

const content = fs.readFileSync('config.js', 'utf8');

// Extract the HIVE_SOUND_CONFIG block
const match = content.match(/window\.HIVE_SOUND_CONFIG\s*=\s*\{([\s\S]*?)};\r?\n\r?\n\/\//);
if (!match) {
    console.log("Could not find HIVE_SOUND_CONFIG");
    process.exit(1);
}

const objStr = "{\n" + match[1] + "}";
// To parse it safely, we might just evaluate it
let configObj;
try {
    configObj = eval("(" + objStr + ")");
} catch (e) {
    console.log("Error evaluating config:", e.message);
    process.exit(1);
}

const keys = Object.keys(configObj);
let outOfOrderCount = 0;

// Re-implement the section logic, or just check the whole array?
// The user has two sections: [일반 음성] and [CMC음성].
// We need to separate them based on their keys or indices in the file.
// Let's just use the file content line numbers to find the sections.
const lines = content.split('\n');

let normalKeys = [];
let cmcKeys = [];
let inCMC = false;

for (let line of lines) {
    if (line.includes('[CMC음성]')) {
        inCMC = true;
    }
    const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
    if (keyMatch) {
        if (inCMC) {
            cmcKeys.push(keyMatch[1]);
        } else {
            // might have duplicates? no.
            // ignore window.xxx
            if (line.includes('HIVE_SOUND_CONFIG') || line.includes('VISUAL_CONFIG')) continue;
            normalKeys.push(keyMatch[1]);
        }
    }
}

function checkSorted(arr, name) {
    let sorted = [...arr].sort((a, b) => a.localeCompare(b, 'ko'));
    let issues = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== sorted[i]) {
            issues.push(`Mismatch at ${i}: expected "${sorted[i]}" but found "${arr[i]}"`);
        }
    }
    if (issues.length > 0) {
        console.log(`\n--- ${name} is NOT sorted ---`);
        for (let i = 0; i < Math.min(issues.length, 10); i++) {
            console.log(issues[i]);
        }
    } else {
        console.log(`\n--- ${name} is sorted! ---`);
    }
}

checkSorted(normalKeys, "일반 음성");
checkSorted(cmcKeys, "CMC음성");

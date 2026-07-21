const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sfxDir = path.resolve('D:/BubbleChat/MonsterHunter_Soundtracks/Unified_SFX');
const files = fs.readdirSync(sfxDir).filter(f => f.endsWith('.mp3'));

const results = [];

files.forEach(file => {
    const fullPath = path.join(sfxDir, file);
    try {
        // Run ffprobe to get duration
        const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullPath}"`, { encoding: 'utf-8' });
        const duration = parseFloat(output.trim());
        results.push({ file, duration });
    } catch (e) {
        console.error(`Failed to get duration for ${file}:`, e.message);
    }
});

// Sort by duration descending
results.sort((a, b) => b.duration - a.duration);

console.log(JSON.stringify(results, null, 2));

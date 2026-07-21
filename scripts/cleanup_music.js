const fs = require('fs');
const path = require('path');

const baseDir = path.resolve('D:/BubbleChat/MonsterHunter_Soundtracks');

if (!fs.existsSync(baseDir)) {
    console.error('MonsterHunter_Soundtracks directory not found.');
    process.exit(1);
}

const items = fs.readdirSync(baseDir);

items.forEach(item => {
    const fullPath = path.join(baseDir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
        if (item === 'Unified_SFX') {
            console.log('Keeping Unified_SFX directory.');
            return;
        }

        console.log(`Deleting music directory: ${item}`);
        try {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } catch (e) {
            console.error(`Failed to delete ${item}:`, e.message);
        }
    } else {
        if (item === 'sfx_mapping.json') {
            console.log('Keeping sfx_mapping.json mapping file.');
        } else {
            console.log(`Keeping file: ${item}`);
        }
    }
});

console.log('Cleanup complete.');

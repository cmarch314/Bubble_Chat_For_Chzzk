const fs = require('fs');
const path = require('path');

const sfxDir = path.join(__dirname, '../SFX');
const files = fs.readdirSync(sfxDir);

console.log(`Total SFX files: ${files.length}`);

const keywords = ['potion', 'drink', 'swallow', 'sharpen', 'whetstone', 'reload', 'dodge', 'roll', 'guard', 'shield', 'block', 'cart', 'faint', 'roar', 'scream', 'wilhelm', 'monster', 'mh_'];

files.forEach(f => {
    const lower = f.toLowerCase();
    const match = keywords.some(k => lower.includes(k));
    if (match) {
        console.log(`Matched: ${f}`);
    }
});

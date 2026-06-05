const fs = require('fs');
const path = require('path');

const sfxDir = path.join(__dirname, '../SFX');
const files = fs.readdirSync(sfxDir);

console.log(`Total SFX files: ${files.length}`);

const searchPatterns = {
    guard: ['guard', 'shield', 'block', 'metal', 'clank', 'iron', 'reflect'],
    dodge: ['roll', 'dodge', 'whoosh', 'dash', 'wind', 'jump', 'move', 'evade'],
    sharpen: ['sharp', 'whet', 'sword', 'blade', 'scrape', 'knife', 'grind'],
    reload: ['reload', 'gun', 'shot', 'arrow', 'bow', 'weapon', 'load'],
    roar: ['roar', 'growl', 'scream', 'cry', 'monster', 'beast', 'dragon', 'yell'],
    cart: ['cart', 'faint', 'die', 'dead', 'fail', 'defeat', 'fall']
};

for (const [key, patterns] of Object.entries(searchPatterns)) {
    console.log(`\n🔍 Searching potential matches for: ${key}`);
    const matches = files.filter(f => {
        const lower = f.toLowerCase();
        return patterns.some(p => lower.includes(p));
    });
    if (matches.length > 0) {
        console.log(`Found ${matches.length} candidates:`);
        matches.slice(0, 15).forEach(m => console.log(`  - ${m}`));
        if (matches.length > 15) console.log(`  ... and ${matches.length - 15} more`);
    } else {
        console.log(`  - No candidates found`);
    }
}

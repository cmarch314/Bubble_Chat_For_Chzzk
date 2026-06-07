const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock frontend globals
global.BaseEffect = class BaseEffect {
    constructor(director) {
        this.director = director;
    }
};
global.window = {
    HUNT_WEAPONS: [],
    MONSTER_DATA: [],
    MONSTER_ATTACKS: {}
};

const huntEffectPath = path.join(__dirname, '../js/effects/HuntEffect.js');
const code = fs.readFileSync(huntEffectPath, 'utf8');

try {
    vm.runInThisContext(code);
} catch (e) {
    console.error("❌ Failed to compile HuntEffect.js in VM:", e);
    process.exit(1);
}

// Instantiate HuntEffect
const instance = new HuntEffect({
    audioManager: { volumeConfig: { master: 1, visual: 1, sfx: 1 } }
});

const testCases = [
    { input: '안쟈나프', expected: 'BGM/MHW_Ancient_Forest.mp3' },
    { input: 'Anjanath', expected: 'BGM/MHW_Ancient_Forest.mp3' },
    { input: '리오레우스', expected: 'BGM/MHW_Ancient_Forest.mp3' },
    { input: '디아블로스', expected: 'BGM/MHW_Wildspire_Waste.mp3' },
    { input: '볼보로스', expected: 'BGM/MHW_Wildspire_Waste.mp3' },
    { input: '레이기에나', expected: 'BGM/MHW_Coral_Highlands.mp3' },
    { input: '파오우르무', expected: 'BGM/MHW_Coral_Highlands.mp3' },
    { input: '오도가론', expected: 'BGM/MHW_Rotten_Vale.mp3' },
    { input: '도스기르오스', expected: 'BGM/MHW_Rotten_Vale.mp3' },
    { input: '도도가마', expected: 'BGM/MHW_Elders_Recess.mp3' },
    { input: '우라간킨', expected: 'BGM/MHW_Elders_Recess.mp3' },
    { input: '버프바로', expected: 'BGM/MHWI_Hoarfrost_Reach.mp3' },
    { input: '베리오로스', expected: 'BGM/MHWI_Hoarfrost_Reach.mp3' },
    // Title / Boss monsters
    { input: '진오우거', expected: 'BGM/MHW_Zinogre.mp3' },
    { input: '벨카나', expected: 'BGM/MHW_Velkhana.mp3' },
    { input: '밀라보레아스', expected: 'BGM/MHW_Fatalis.mp3' },
    { input: '아마츠마가츠치', expected: 'BGM/MHR_Amatsu.mp3' },
    { input: '아마츠', expected: 'BGM/MHR_Amatsu.mp3' },
    { input: '샤가르마가라', expected: 'BGM/MH4_Shagaru_Magala.mp3' },
    { input: '샤갈', expected: 'BGM/MH4_Shagaru_Magala.mp3' },
    { input: '노산룡', expected: 'BGM/MH_Lao_Shan_Lung.mp3' },
    { input: '라잔', expected: 'BGM/William Tell.mp3' },
    { input: '요츠미와두', expected: 'BGM/MHGU_Arena.mp3' },
    { input: '테오', expected: 'BGM/MHW_Teostra.mp3' },
    { input: 'teostra', expected: 'BGM/MHW_Teostra.mp3' },
    { input: '나나', expected: 'BGM/MHW_Teostra.mp3' },
    { input: 'lunastra', expected: 'BGM/MHW_Teostra.mp3' }
];

console.log('🧪 Testing getMonsterBgm mapping logic via VM execution...');
let passed = 0;
let failed = 0;

for (const tc of testCases) {
    const result = instance.getMonsterBgm(tc.input);
    if (tc.expected === 'random_fallback') {
        const genericBgms = [
            'BGM/MHGU_Arena.mp3',
            'BGM/MHW_Proof_of_a_Hero.mp3',
            'BGM/MHW_Ancient_Forest.mp3',
            'BGM/MHW_Wildspire_Waste.mp3',
            'BGM/MHW_Coral_Highlands.mp3',
            'BGM/MHW_Rotten_Vale.mp3',
            'BGM/MHW_Elders_Recess.mp3',
            'BGM/MHWI_Hoarfrost_Reach.mp3'
        ];
        if (genericBgms.includes(result)) {
            console.log(`✅ Passed: [${tc.input}] correctly matched random fallback track: ${result}`);
            passed++;
        } else {
            console.error(`❌ Failed: [${tc.input}] expected random fallback from list, got: ${result}`);
            failed++;
        }
    } else {
        if (result === tc.expected) {
            console.log(`✅ Passed: [${tc.input}] -> ${result}`);
            passed++;
        } else {
            console.error(`❌ Failed: [${tc.input}] expected: ${tc.expected}, got: ${result}`);
            failed++;
        }
    }
}

console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}

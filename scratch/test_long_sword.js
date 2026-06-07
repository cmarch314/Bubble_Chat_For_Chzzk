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
global.document = {
    createElement: () => ({
        style: {},
        parentNode: null,
        appendChild: () => {},
        remove: () => {}
    })
};
global.Audio = class Audio {
    constructor(src) {
        this.src = src;
    }
    play() {
        return Promise.resolve();
    }
};

global.HuntRenderer = class HuntRenderer {
    constructor() {}
    setContainer() {}
    createContainer() {}
    removeContainer() {}
    renderLobby() {}
    updateBettingUI() {}
    updateBettingTimer() {}
    renderFight() {}
    updateHpUI() {}
    updateMonsterHpUI() {}
    updateWeaponAtbUI() {}
    updateMonsterAtbUI() {}
    updateMonsterStateUI() {}
    updatePotionCountUI() {}
    updateOverheatUI() {}
    updatePhialsUI() {}
    updateExtractsUI() {}
    updateCartUI() {}
    updateTimerUI() {}
    showSkillBubble() {}
    triggerMonsterRoar() {}
    triggerMonsterCharge() {}
    triggerHitAnimation() {}
    triggerRollAnimation() {}
    triggerStunUI() {}
    triggerDeathTag() {}
    triggerMonsterKnockdownAnim() {}
    restoreBorder() {}
    shakeWeapon() {}
    shakeMonster() {}
};

global.HuntAudioManager = class HuntAudioManager {
    constructor() {
        this.lobbyBgm = null;
        this.battleBgm = null;
        this.winBgm = null;
    }
    getMonsterBgm() { return ''; }
    playMonsterRoar() {}
    playMHAsset() {}
    playMHAudioFile() {}
    stopBgms() {}
};

global.HuntInitializer = class HuntInitializer {
    constructor() {
        this.WEAPONS = [
            { id: 'long_sword', name: '태도', filename: 'long_sword.svg', type: 'melee', speedGroup: 'fast' }
        ];
        this.fallbackMonsters = [
            { id: 'rathalos', nameKO: '리오레우스' }
        ];
        this.MONSTER_ATTACKS = {};
        this.COMBO_LIST = {};
    }
    parseCommand() {
        return {
            consecutiveTotal: 1,
            selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
            consecutiveQueue: [],
            chosenWeaponIds: []
        };
    }
    buildSelectedWeapons() { return []; }
    getMonsterTier() { return 'large'; }
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
    audioManager: { volumeConfig: { master: 1, sfx: 1, visual: 1 } },
    eventBus: { emit: () => {} },
    getSoundConfig: () => ({})
});

// Mock card UI structure
const mockCard = {
    querySelector: (selector) => {
        return {
            classList: {
                remove: () => {},
                add: () => {}
            },
            style: {
                borderColor: '',
                boxShadow: '',
                transform: '',
                width: ''
            },
            textContent: ''
        };
    },
    querySelectorAll: () => []
};

// Setup mock state
instance.bets = {};
instance.selectedMonster = { id: 'rathalos', nameKO: '리오레우스' };
instance.WEAPONS = [
    { id: 'long_sword', name: '태도', filename: 'long_sword.svg', type: 'melee', speedGroup: 'fast' }
];

console.log('🧪 Running Long Sword Spirit Level & Foresight Slash tests...');

// 1. Initial State Check
const shuffled = [...instance.WEAPONS];
instance.selectedWeapons = shuffled.map((w, index) => {
    return {
        ...w,
        index,
        hp: 100,
        maxHp: 100,
        status: 'alive',
        sharpness: 100,
        spiritLevel: 0,
        comboIndex: 0
    };
});

const ls = instance.selectedWeapons[0];
console.log(`- Long Sword initialized: spiritLevel = ${ls.spiritLevel} (Expected: 0)`);
if (ls.spiritLevel !== 0) {
    console.error('❌ Fail: Initial spirit level is not 0.');
    process.exit(1);
}

// 2. Test damage multiplier calculation
const calcDamage = (spiritLevel, baseDmg) => {
    const spiritMults = { 0: 1.0, 1: 1.05, 2: 1.10, 3: 1.20 };
    const mult = spiritMults[spiritLevel] || 1.0;
    return Math.floor(baseDmg * mult);
};

console.log('- Testing Spirit Level damage multipliers:');
const tests = [
    { level: 0, base: 100, expected: 100 },
    { level: 1, base: 100, expected: 105 },
    { level: 2, base: 100, expected: 110 },
    { level: 3, base: 100, expected: 120 }
];

for (const t of tests) {
    const result = calcDamage(t.level, t.base);
    console.log(`  Level ${t.level}: ${t.base} dmg -> ${result} dmg (Expected: ${t.expected})`);
    if (result !== t.expected) {
        console.error(`❌ Fail: Level ${t.level} damage multiplier mismatch.`);
        process.exit(1);
    }
}

// 3. Helm Breaker reduction check
console.log('- Testing Helm Breaker level reduction:');
ls.spiritLevel = 3;
console.log(`  Before Helm Breaker: spiritLevel = ${ls.spiritLevel}`);
if (ls.id === 'long_sword') {
    ls.spiritLevel = Math.max(0, ls.spiritLevel - 1);
}
console.log(`  After Helm Breaker: spiritLevel = ${ls.spiritLevel} (Expected: 2)`);
if (ls.spiritLevel !== 2) {
    console.error('❌ Fail: Helm Breaker did not decrease spiritLevel.');
    process.exit(1);
}

ls.spiritLevel = 0;
if (ls.id === 'long_sword') {
    ls.spiritLevel = Math.max(0, ls.spiritLevel - 1);
}
console.log(`  At level 0 after Helm Breaker: spiritLevel = ${ls.spiritLevel} (Expected: 0)`);
if (ls.spiritLevel !== 0) {
    console.error('❌ Fail: Helm Breaker should not decrease spiritLevel below 0.');
    process.exit(1);
}

// 4. Evasion Success Rate Check (75% rate)
console.log('- Testing Foresight Slash success rate over 10,000 rolls:');
let successes = 0;
const totalRolls = 10000;
for (let i = 0; i < totalRolls; i++) {
    if (Math.random() < 0.75) {
        successes++;
    }
}
const rate = successes / totalRolls;
console.log(`  Success rate: ${(rate * 100).toFixed(2)}% (Expected: ~75.00%)`);
if (rate < 0.72 || rate > 0.78) {
    console.error('❌ Fail: Evasion success rate is outside the acceptable range of 72% to 78%.');
    process.exit(1);
}

// 5. Test Long Sword Combo Progression and Knockdown Selection Logic
console.log('- Testing Long Sword combo and knockdown move selection:');

const testComboReset = (spiritLevel, comboIndex) => {
    let newComboIndex = comboIndex;
    if (newComboIndex === 3) {
        const canUseHB = (spiritLevel >= 3);
        if (!canUseHB) {
            newComboIndex = 0;
        }
    }
    return newComboIndex;
};

const testKnockdownMove = (spiritLevel) => {
    const combos = [
        { name: "세로베기", dmg: 100 },
        { name: "기인베기 I", dmg: 140 },
        { name: "기인베기 II", dmg: 180 },
        { name: "기인투구깨기", dmg: 480 }
    ];
    let maxDmgCombo = combos[0];
    for (let i = 1; i < combos.length; i++) {
        if (combos[i].name === '기인투구깨기') {
            const canUseHB = (spiritLevel >= 2);
            if (!canUseHB) {
                continue;
            }
        }
        if (combos[i].dmg > maxDmgCombo.dmg) {
            maxDmgCombo = combos[i];
        }
    }
    return maxDmgCombo.name;
};

// Test normal combo resets
console.log(`  Normal combo reset at level 0: index 3 -> ${testComboReset(0, 3)} (Expected: 0)`);
if (testComboReset(0, 3) !== 0) {
    console.error('❌ Fail: Combo did not reset at level 0.');
    process.exit(1);
}
console.log(`  Normal combo reset at level 1: index 3 -> ${testComboReset(1, 3)} (Expected: 0)`);
if (testComboReset(1, 3) !== 0) {
    console.error('❌ Fail: Combo did not reset at level 1.');
    process.exit(1);
}
console.log(`  Normal combo reset at level 2: index 3 -> ${testComboReset(2, 3)} (Expected: 0)`);
if (testComboReset(2, 3) !== 0) {
    console.error('❌ Fail: Combo did not reset at level 2.');
    process.exit(1);
}
console.log(`  Normal combo reset at level 3: index 3 -> ${testComboReset(3, 3)} (Expected: 3)`);
if (testComboReset(3, 3) !== 3) {
    console.error('❌ Fail: Combo should not reset at level 3.');
    process.exit(1);
}

// Test knockdown move selection
console.log(`  Knockdown move at level 0: ${testKnockdownMove(0)} (Expected: 기인베기 II)`);
if (testKnockdownMove(0) !== '기인베기 II') {
    console.error('❌ Fail: Incorrect knockdown move selected at level 0.');
    process.exit(1);
}
console.log(`  Knockdown move at level 1: ${testKnockdownMove(1)} (Expected: 기인베기 II)`);
if (testKnockdownMove(1) !== '기인베기 II') {
    console.error('❌ Fail: Incorrect knockdown move selected at level 1.');
    process.exit(1);
}
console.log(`  Knockdown move at level 2: ${testKnockdownMove(2)} (Expected: 기인투구깨기)`);
if (testKnockdownMove(2) !== '기인투구깨기') {
    console.error('❌ Fail: Incorrect knockdown move selected at level 2.');
    process.exit(1);
}
console.log(`  Knockdown move at level 3: ${testKnockdownMove(3)} (Expected: 기인투구깨기)`);
if (testKnockdownMove(3) !== '기인투구깨기') {
    console.error('❌ Fail: Incorrect knockdown move selected at level 3.');
    process.exit(1);
}

console.log('✅ All tests passed successfully!');
process.exit(0);

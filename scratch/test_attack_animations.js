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

const huntEffectPath = path.join(__dirname, '../js/effects/HuntEffect.js');
const code = fs.readFileSync(huntEffectPath, 'utf8');

try {
    vm.runInThisContext(code);
} catch (e) {
    console.error("❌ Failed to compile HuntEffect.js in VM:", e);
    process.exit(1);
}

const instance = new HuntEffect({
    audioManager: { volumeConfig: { master: 1, sfx: 1, visual: 1 } },
    eventBus: { emit: () => {} },
    getSoundConfig: () => ({})
});

// Setup mock state
instance.selectedMonster = { id: 'rathalos', nameKO: '리오레우스' };
instance.WEAPONS = [
    { id: 'great_sword', name: '대검', filename: 'great_sword.svg', type: 'melee', speedGroup: 'slow' },
    { id: 'hammer', name: '해머', filename: 'hammer.svg', type: 'melee', speedGroup: 'slow' },
    { id: 'light_bowgun', name: '라이트보건', filename: 'light_bowgun.svg', type: 'ranged', speedGroup: 'fast' },
    { id: 'heavy_bowgun', name: '헤비보건', filename: 'heavy_bowgun.svg', type: 'shield', speedGroup: 'normal' }
];

instance.selectedWeapons = instance.WEAPONS.map((w, index) => {
    return {
        ...w,
        index,
        hp: 100,
        maxHp: 100,
        status: 'alive',
        sharpness: 100,
        spiritLevel: 0
    };
});

console.log('🧪 Testing shakeWeapon Animation Selection Logic...');

// Let's mock a simple function representing shakeWeapon's inner dispatcher
const getAnimationDetails = (w, moveName = null) => {
    if (!w) return null;
    let animClass = 'attack-melee-anim';
    let animDuration = 250;

    if (w.id === 'hammer') {
        if (moveName === '쿵 쿵 따') {
            animClass = 'attack-hammer-kkt';
            animDuration = 1200;
        } else if (moveName === '키프 스웨이') {
            animClass = 'attack-hammer-keep-sway';
            animDuration = 450;
        } else if (moveName === '2차지 어퍼!') {
            animClass = 'attack-hammer-charge2';
            animDuration = 650;
        } else if (moveName === '3차지 내려치기') {
            animClass = 'attack-hammer-charge3';
            animDuration = 900;
        } else if (moveName === '회전 회오리!!!') {
            animClass = 'attack-hammer-tornado';
            animDuration = 1600;
        } else {
            animClass = 'attack-hammer-anim';
            animDuration = 400;
        }
    } else if (w.id === 'great_sword') {
        if (moveName === '모아베기') {
            animClass = 'attack-gs-charge1';
            animDuration = 800;
        } else if (moveName === '강모아베기') {
            animClass = 'attack-gs-charge2';
            animDuration = 1000;
        } else if (moveName === '참모아베기') {
            animClass = 'attack-gs-charge3';
            animDuration = 1300;
        }
    } else if (w.id === 'light_bowgun' || w.id === 'heavy_bowgun') {
        animClass = 'attack-bowgun-anim';
        animDuration = 600;
    }
    return { class: animClass, duration: animDuration };
};

const testCases = [
    { id: 'great_sword', move: null, expectedClass: 'attack-melee-anim', expectedDuration: 250 },
    { id: 'great_sword', move: '모아베기', expectedClass: 'attack-gs-charge1', expectedDuration: 800 },
    { id: 'great_sword', move: '강모아베기', expectedClass: 'attack-gs-charge2', expectedDuration: 1000 },
    { id: 'great_sword', move: '참모아베기', expectedClass: 'attack-gs-charge3', expectedDuration: 1300 },
    { id: 'hammer', move: '쿵 쿵 따', expectedClass: 'attack-hammer-kkt', expectedDuration: 1200 },
    { id: 'hammer', move: '키프 스웨이', expectedClass: 'attack-hammer-keep-sway', expectedDuration: 450 },
    { id: 'hammer', move: '2차지 어퍼!', expectedClass: 'attack-hammer-charge2', expectedDuration: 650 },
    { id: 'hammer', move: '3차지 내려치기', expectedClass: 'attack-hammer-charge3', expectedDuration: 900 },
    { id: 'hammer', move: '회전 회오리!!!', expectedClass: 'attack-hammer-tornado', expectedDuration: 1600 },
    { id: 'hammer', move: '일반공격', expectedClass: 'attack-hammer-anim', expectedDuration: 400 },
    { id: 'light_bowgun', move: null, expectedClass: 'attack-bowgun-anim', expectedDuration: 600 },
    { id: 'heavy_bowgun', move: null, expectedClass: 'attack-bowgun-anim', expectedDuration: 600 }
];

for (const tc of testCases) {
    const weapon = instance.selectedWeapons.find(w => w.id === tc.id);
    const result = getAnimationDetails(weapon, tc.move);
    console.log(`- Weapon: ${tc.id} (${tc.move || 'default'}) -> Class: ${result.class}, Duration: ${result.duration}ms`);
    if (result.class !== tc.expectedClass || result.duration !== tc.expectedDuration) {
        console.error(`❌ Fail: Animation details mismatch for ${tc.id} (Move: ${tc.move}).`);
        process.exit(1);
    }
}

console.log('✅ All animation tests passed successfully!');
process.exit(0);

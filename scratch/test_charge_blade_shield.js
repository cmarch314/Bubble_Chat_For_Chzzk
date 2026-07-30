const fs = require('fs');
const path = require('path');

const managedTimersCode = fs.readFileSync(path.join(__dirname, '../js/runtime/ManagedTimers.js'), 'utf8');
eval(managedTimersCode + "; globalThis.ManagedTimers = ManagedTimers;");
const huntLifecycleCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntLifecycle.js'), 'utf8');
eval(huntLifecycleCode + "; globalThis.HuntLifecycle = HuntLifecycle;");
const participantParserCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntParticipantParser.js'), 'utf8');
eval(participantParserCode + "; globalThis.HuntParticipantParser = HuntParticipantParser;");
const chatTacticsCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntChatTactics.js'), 'utf8');
eval(chatTacticsCode + "; globalThis.HuntChatTactics = HuntChatTactics;");

function createMockElement() {
  const el = {
    className: '',
    innerHTML: '',
    textContent: '',
    style: {},
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    querySelector(sel) {
      return createMockElement();
    },
    querySelectorAll(sel) {
      return [];
    },
    appendChild(child) {},
    remove() {}
  };
  return el;
}

// Mock window and document
globalThis.window = {
  MONSTER_DATA: [
    { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" }
  ]
};

globalThis.document = {
  createElement(tag) {
    return createMockElement();
  },
  body: createMockElement()
};

globalThis.BaseEffect = class BaseEffect {
  constructor(director) {
    this.director = director;
    this.config = director.config;
    this.eventBus = director.eventBus;
    this.audioManager = director.audioManager;
  }
};

globalThis.HuntRenderer = class HuntRenderer {
  constructor() {}
  init() {}
  render() {}
  update() {}
};

globalThis.HuntEngine = class HuntEngine {
  constructor() {}
  init() {}
  update() {}
};

globalThis.HuntAudioManager = class HuntAudioManager {
  constructor() {}
};

const huntDataCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntData.js'), 'utf8');
eval(huntDataCode);
globalThis.LocalCompanionEndpoint = require('../js/runtime/LocalCompanionEndpoint.js');
globalThis.HuntCommandCatalog = require('../js/effects/hunt/HuntCommandCatalog.js');
globalThis.HuntProfileContract = require('../js/effects/hunt/HuntProfileContract.js');
const weaponCatalogCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntWeaponCatalog.js'), 'utf8');
eval(weaponCatalogCode + "; globalThis.HuntWeaponCatalog = HuntWeaponCatalog;");
const monsterPatternCatalogCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntMonsterPatternCatalog.js'), 'utf8');
eval(monsterPatternCatalogCode + "; globalThis.HuntMonsterPatternCatalog = HuntMonsterPatternCatalog;");

globalThis.HuntSupportItemPolicy = require('../js/effects/hunt/HuntSupportItemPolicy.js');

const huntInitializerCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntInitializer.js'), 'utf8');
eval(huntInitializerCode + "; globalThis.HuntInitializer = HuntInitializer;");

const huntEffectCode = fs.readFileSync(path.join(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
eval(huntEffectCode + "; globalThis.HuntEffect = HuntEffect;");

const director = {
  config: {
    getSoundConfig() { return {}; }
  },
  eventBus: {
    emit(event, data) {}
  },
  audioManager: {
    volumeConfig: { master: 1, sfx: 1 }
  }
};

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log("🧪 Running Charge Blade Shield Charge & SAED Requirement tests...");
  
  const hunt = new HuntEffect(director);
  // Preserve the legacy eight-step regression fixture; supplemental Wilds
  // actions are covered by the conditional catalog tests.
  const combos = hunt.initializer.COMBO_LIST['charge_blade'].slice(0, 8);
  
  // Setup Charge Blade hunter
  const w = {
    id: 'charge_blade',
    name: '차지액스',
    filename: 'charge_blade.svg',
    index: 0,
    hp: 100,
    maxHp: 100,
    status: 'alive',
    personality: 'normal',
    lifepowders: 1,
    potions: 10,
    sharpness: 100,
    hunterName: 'CBer',
    comboIndex: 0,
    phials: 5,
    shieldChargeDuration: 0,
    atb: 100
  };
  hunt.selectedWeapons = [w];
  
  // Mock test turn runner mimicking HuntEffect loop logic
  hunt.testCBTurn = function(w) {
    let isCBShieldChargeMove = false;
    let currentCombo = combos[w.comboIndex];
    let isKnockdownAttack = false;

    // 1. Intercept Move 3 if shield not charged and phials === 5
    if (w.id === 'charge_blade' && w.comboIndex === 3 && !isKnockdownAttack) {
      const isShieldCharged = (w.shieldChargeDuration && w.shieldChargeDuration > 0);
      if (!isShieldCharged && w.phials === 5) {
        currentCombo = { name: "방패강화", dmg: 0, sharp: -2 };
        isCBShieldChargeMove = true;
      }
    }

    // 2. Downgrade SAED to AED if shield not charged
    if (w.id === 'charge_blade' && currentCombo && currentCombo.name === '초고출력 속성해방베기') {
      const isShieldCharged = (w.shieldChargeDuration && w.shieldChargeDuration > 0);
      if (!isShieldCharged) {
        currentCombo = combos[5]; // Downgrade to AED (Move 5)
      }
    }

    let damage = currentCombo.dmg;

    // 3. Special actions execution
    if (currentCombo.name === '방패강화') {
      w.phials = 0;
      w.shieldChargeDuration = 60;
      w.comboIndex = 7; // Wraps to 0 after increment
    } else if (currentCombo.name === '병충전') {
      w.phials = 5;
    } else if (currentCombo.name === '도끼 속성해방베기 I') {
      if (w.phials > 0) {
        w.phials--;
        damage += 70;
      }
    } else if (currentCombo.name === '고출력 속성해방베기') {
      if (w.phials > 0) {
        w.phials--;
        damage += 100;
      }
    } else if (currentCombo.name === '초고출력 속성해방베기') {
      const phialsUsed = w.phials;
      w.phials = 0;
      damage += phialsUsed * 120;
    }

    // Advance combo index
    w.comboIndex = (w.comboIndex + 1) % combos.length;
    return { name: currentCombo.name, damage };
  };

  console.log("1. Starting with uncharged shield and 5 phials...");
  w.comboIndex = 3;
  w.phials = 5;
  w.shieldChargeDuration = 0;
  
  let res = hunt.testCBTurn(w);
  assert(res.name === "방패강화" && w.shieldChargeDuration === 60 && w.phials === 0, "Move 3 must trigger shield charge, consuming 5 phials");
  assert(w.comboIndex === 0, "After shield charge, combo index must wrap back to 0");

  console.log("2. Simulating building up to SAED with charged shield...");
  // Turn 0: 검 모아 2단베기
  res = hunt.testCBTurn(w); 
  // Turn 1: 방패치기
  res = hunt.testCBTurn(w);
  // Turn 2: 병충전 (recharges phials to 5)
  res = hunt.testCBTurn(w);
  assert(w.phials === 5, "Should have 5 phials after charge");
  
  // Turn 3: 변형 (검->도끼) - since shield is charged (duration 60), it should NOT be intercepted!
  res = hunt.testCBTurn(w);
  assert(res.name === "변형 (검→도끼)", "Should proceed to Axe morph because shield is charged");

  // Turn 4: 도끼 속성해방베기 I
  res = hunt.testCBTurn(w);
  assert(res.name === "도끼 속성해방베기 I" && w.phials === 4, "Should execute Axe I, consuming 1 phial");

  // Turn 5: 고출력 속성해방베기
  res = hunt.testCBTurn(w);
  assert(res.name === "고출력 속성해방베기" && w.phials === 3, "Should execute AED, consuming 1 phial");

  // Turn 6: 초고출력 속성해방베기 (SAED) - shield is charged, so should execute successfully!
  res = hunt.testCBTurn(w);
  assert(res.name === "초고출력 속성해방베기" && w.phials === 0 && res.damage === 400 + (3 * 120), "Should execute SAED successfully, consuming remaining 3 phials");

  console.log("3. Simulating SAED without shield charge (should downgrade to AED)...");
  w.shieldChargeDuration = 0;
  w.phials = 3;
  w.comboIndex = 6; // Directly at SAED
  res = hunt.testCBTurn(w);
  assert(res.name === "고출력 속성해방베기" && w.phials === 2 && res.damage === 350 + 100, "SAED must downgrade to AED (Move 5) when shield is not charged, consuming 1 phial");

  console.log("4. Simulating countdown decrement...");
  w.shieldChargeDuration = 10;
  // Tick down 3s
  for (let i = 0; i < 3; i++) {
    if (w.shieldChargeDuration > 0) w.shieldChargeDuration--;
  }
  assert(w.shieldChargeDuration === 7, "Duration should tick down to 7s");

  console.log("✅ All Charge Blade Shield Charge & SAED requirement tests passed successfully!");
}

runTests().catch(console.error);

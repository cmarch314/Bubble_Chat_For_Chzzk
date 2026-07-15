const fs = require('fs');
const path = require('path');

// Mock DOM & window
globalThis.window = {
  MONSTER_DATA: [
    { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" },
    { id: "diablos", nameEN: "Diablos", nameKO: "디아블로스", filename: "diablos.png" },
    { id: "nergigante", nameEN: "Nergigante", nameKO: "네르기간테", filename: "nergigante.png" },
    { id: "zinogre", nameEN: "진오우거", filename: "zinogre.png" },
    { id: "velkhana", nameEN: "Velkhana", nameKO: "벨카나", filename: "velkhana.png" }
  ]
};

globalThis.document = {
  createElement(tag) {
    return {
      className: '',
      innerHTML: '',
      querySelector(sel) { return { textContent: '' }; },
      querySelectorAll(sel) { return []; }
    };
  },
  body: {
    appendChild(child) {}
  }
};

// Base class mock
globalThis.BaseEffect = class BaseEffect {
  constructor(director) {
    this.director = director;
    this.config = director.config;
    this.eventBus = director.eventBus;
    this.audioManager = director.audioManager;
  }
};

globalThis.HuntAudioManager = class HuntAudioManager {
  constructor() {}
  stopBgms() {}
  playMHAudioFile() {}
};

// Read files
const managedTimersCode = fs.readFileSync(path.join(__dirname, '../js/runtime/ManagedTimers.js'), 'utf8');
eval(managedTimersCode + "; globalThis.ManagedTimers = ManagedTimers;");
const huntLifecycleCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntLifecycle.js'), 'utf8');
eval(huntLifecycleCode + "; globalThis.HuntLifecycle = HuntLifecycle;");
const participantParserCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntParticipantParser.js'), 'utf8');
eval(participantParserCode + "; globalThis.HuntParticipantParser = HuntParticipantParser;");

const huntDataCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntData.js'), 'utf8');
eval(huntDataCode);

const huntInitializerCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntInitializer.js'), 'utf8');
eval(huntInitializerCode + "; globalThis.HuntInitializer = HuntInitializer;");

const huntRendererCode = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const huntEffectCode = fs.readFileSync(path.join(__dirname, '../js/effects/HuntEffect.js'), 'utf8');

// We mock Audio
globalThis.Audio = class {
  constructor() {
    this.src = "";
    this.play = async () => {};
    this.pause = () => {};
  }
};
globalThis.window.AudioContext = class {
  createGain() { return { gain: { value: 1.0 }, connect() {} }; }
  createMediaElementSource() { return { connect() {} }; }
};

// Mock visual director
const director = {
  activeGame: null,
  config: {
    getSoundConfig() { return {}; }
  },
  eventBus: {
    emit() {}
  },
  audioManager: {
    volumeConfig: { master: 1, visual: 1, sfx: 1 }
  }
};

eval(huntRendererCode + "; globalThis.HuntRenderer = HuntRenderer;");
eval(huntEffectCode + "; globalThis.HuntEffect = HuntEffect;");

async function testCommand(msg) {
  const hunt = new HuntEffect(director);
  hunt.WEAPONS = [
    { id: 'great_sword', name: '대검', filename: 'great_sword.svg' },
    { id: 'long_sword', name: '태도', filename: 'long_sword.svg' },
    { id: 'sword_shield', name: '한손검', filename: 'sword_shield.svg' },
    { id: 'dual_blades', name: '쌍검', filename: 'dual_blades.svg' }
  ];

  // Mock fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => window.MONSTER_DATA
  });

  const mockContext = { message: msg, nickname: "Streamer" };
  
  // We stub container append and innerHTML capturing
  let capturedHTML = "";
  const timerElement = { textContent: "" };
  globalThis.document.createElement = (tag) => {
    const el = {
      className: '',
      set innerHTML(val) {
        capturedHTML = val;
      },
      get innerHTML() {
        return capturedHTML;
      },
      querySelector(sel) {
        if (sel === '.game-timer') return timerElement;
        return { textContent: '' };
      }
    };
    return el;
  };

  // We stub playMHAudioFile
  hunt.playMHAudioFile = () => {};
  hunt.stopBgms = () => {};
  
  // Call execute.
  hunt.execute(mockContext);
  
  // Wait 100ms
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`\n=== TEST COMMAND: "${msg}" ===`);
  console.log("consecutiveTotal:", hunt.consecutiveTotal);
  console.log("consecutiveQueue Length:", hunt.consecutiveQueue ? hunt.consecutiveQueue.length : 'undefined');
  const hasMultipleIcons = capturedHTML.includes('game-hunt-monster-showcase') && capturedHTML.includes('1') && capturedHTML.includes('2') && capturedHTML.includes('3');
  console.log("Lobby rendering check (multiple items):", hasMultipleIcons ? "PASS" : "FAIL");

  // Clean up timer to exit gracefully
  if (hunt.gameTimer) {
    clearInterval(hunt.gameTimer);
  }
}

async function run() {
  await testCommand("!수렵 3");
  await testCommand("!수렵3");
  await testCommand("!수렵 3마리");
  await testCommand("!수렵3마리");
  process.exit(0);
}

run().catch(console.error);

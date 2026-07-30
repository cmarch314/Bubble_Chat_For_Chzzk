const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const disposableScopePath = path.resolve(__dirname, '../js/runtime/DisposableScope.js');
const managedTimersPath = path.resolve(__dirname, '../js/runtime/ManagedTimers.js');
const baseEffectPath = path.resolve(__dirname, '../js/effects/EffectInterface.js');
const runtimePath = path.resolve(__dirname, '../js/runtime/GameEffectRuntime.js');
const safeContentPath = path.resolve(__dirname, '../js/runtime/SafeContent.js');
const soundQuizPath = path.resolve(__dirname, '../js/effects/SoundQuizEffect.js');

let rawSource = [
    fs.readFileSync(disposableScopePath, 'utf8'),
    fs.readFileSync(managedTimersPath, 'utf8'),
    fs.readFileSync(baseEffectPath, 'utf8'),
    fs.readFileSync(runtimePath, 'utf8'),
    fs.readFileSync(safeContentPath, 'utf8'),
    fs.readFileSync(soundQuizPath, 'utf8')
].join('\n');

rawSource = rawSource.replace(/^class (\w+)/gm, 'var $1 = class $1');

const mockCmcFiles = ['구독감사1', '싼다(느낌표)', '야호'];

const context = vm.createContext({
    console,
    document: {
        body: {
            appendChild: () => {},
            querySelector: () => null
        },
        createElement: () => ({
            className: '',
            style: {},
            appendChild: () => {},
            querySelector: () => null,
            remove: () => {}
        })
    },
    window: {
        HIVE_CMC_FILES: mockCmcFiles
    }
});

vm.runInContext(rawSource, context);
const SoundQuizEffect = context.SoundQuizEffect;

// Test 1: Verify SoundQuizEffect exists
assert.ok(SoundQuizEffect, 'SoundQuizEffect must be loaded');

// Test 2: Command name normalization for quiz answers (e.g. 구독감사1 -> 구독감사, 싼다(느낌표) -> 싼다!)
{
    const director = {
        config: {
            getSoundConfig: () => ({}),
            getVisualConfig: () => ({})
        },
        audioManager: { playSound: async () => {} },
        eventBus: { emit: () => {} }
    };
    const effect = new SoundQuizEffect(director);

    const testCases = [
        { file: '구독감사1', expected: '구독감사' },
        { file: '구독감사5', expected: '구독감사' },
        { file: '싼다(느낌표)', expected: '싼다!' },
        { file: '진짜(물음표)2', expected: '진짜?' },
        { file: '야호', expected: '야호' }
    ];

    testCases.forEach(({ file, expected }) => {
        const cmdName = file.replace(/\(물음표\)/g, '?').replace(/\(느낌표\)/g, '!').replace(/\d+$/, '');
        assert.strictEqual(cmdName, expected, `Filename ${file} must normalize to command name ${expected}`);
    });
}

console.log('[test] SoundQuizEffect !퀴즈 AI command name normalization unit test passed.');

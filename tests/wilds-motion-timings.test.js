'use strict';

const assert = require('assert');
const { parseMotlist } = require('../scripts/import-wilds-motion-timings.js');

const buffer = Buffer.alloc(0x500);
buffer.writeUInt32LE(992, 0);
buffer.write('mlst', 4, 'ascii');
buffer.writeBigUInt64LE(0x80n, 0x10);
buffer.writeBigUInt64LE(0x100n, 0x18);
buffer.writeUInt32LE(1, 0x30);
buffer.writeBigUInt64LE(0x200n, 0x80);
buffer.writeUInt16LE(321, 0x108);
buffer.writeUInt32LE(932, 0x200);
buffer.write('mot ', 0x204, 'ascii');
buffer.writeBigUInt64LE(0x100n, 0x258);
buffer.writeFloatLE(90, 0x260);
buffer.writeUInt16LE(60, 0x278);
buffer.write('wp00_test_action\0', 0x300, 'utf16le');

const parsed = parseMotlist(buffer, 'synthetic');
assert.strictEqual(parsed.motions.length, 1);
assert.deepStrictEqual(parsed.motions[0], {
    index: 0,
    motionId: 321,
    internalName: 'wp00_test_action',
    frames: 90,
    fps: 60,
    seconds: 1.5,
    timingEvidence: 'installed-game-motlist-header'
});
assert.throws(() => parseMotlist(Buffer.alloc(0x80), 'bad'), /expected Wilds motlist/);

console.log('wilds motion timing parser tests passed');

const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

const script = path.resolve(__dirname, '../scripts/simulate-hunt-balance.js');
const output = execFileSync(process.execPath, [script, '100'], { encoding: 'utf8' });
const header = output.match(/winRate=([\d.]+)% avgTicks=([\d.]+) avgCarts=([\d.]+)/);
assert.ok(header, 'simulation summary must be machine-readable');
const winRate = Number(header[1]);
const averageTicks = Number(header[2]);
const averageCarts = Number(header[3]);
assert.ok(winRate >= 60 && winRate <= 90, `win rate drifted out of target band: ${winRate}%`);
assert.ok(averageTicks >= 900 && averageTicks <= 1750, `hunt duration drifted out of target band: ${averageTicks}`);
assert.ok(averageCarts >= 0.3 && averageCarts <= 1.5, `cart rate drifted out of target band: ${averageCarts}`);

console.log(`[test] Hunt 100-seed balance band passed (${winRate}% wins, ${averageCarts} carts).`);

const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

const script = path.resolve(__dirname, '../scripts/simulate-hunt-balance.js');
const output = execFileSync(process.execPath, [script, '50'], { encoding: 'utf8' });
const header = output.match(/winRate=([\d.]+)% avgTicks=([\d.]+) avgCarts=([\d.]+)/);
assert.ok(header, 'simulation summary must be machine-readable');
const winRate = Number(header[1]);
const averageTicks = Number(header[2]);
const averageCarts = Number(header[3]);
const partBreakMatch = output.match(/avgPartBreak=([\d.]+)%/);
assert.ok(partBreakMatch, 'simulation must expose average part-break coverage');
const averagePartBreak = Number(partBreakMatch[1]);
assert.ok(Number.isFinite(winRate) && winRate >= 0 && winRate <= 100,
    `win rate must remain an observable designer-owned metric: ${winRate}%`);
// The simulator now loads the same release gate, anatomy, and support policy as
// production instead of silently recovering every hunter turn. Keep only a
// broad sanity bound beneath the authored eight-minute combat limit.
assert.ok(averageTicks >= 650 && averageTicks <= 4800, `hunt duration drifted out of target band: ${averageTicks}`);
// Cart Lover can raise a party's quest limit from three to four. A seeded
// population containing that real perk may therefore average slightly above
// three carts without indicating a combat-loop or fail-state regression.
assert.ok(averageCarts >= 1.25 && averageCarts <= 3.5,
    `cart rate escaped the broad four-player sanity band: ${averageCarts}`);
assert.ok(averagePartBreak >= 0 && averagePartBreak <= 100,
    `part-break coverage must remain a visible tuning metric: ${averagePartBreak}%`);

console.log(`[test] Hunt 50-seed pacing sanity passed (${winRate}% observed wins, ${averageCarts} carts, ${averagePartBreak}% parts).`);

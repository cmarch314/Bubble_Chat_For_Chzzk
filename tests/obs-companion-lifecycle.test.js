const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const lua = fs.readFileSync(path.join(root, 'obs/bubblechat-companion.lua'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'tools/obs-companion-control.ps1'), 'utf8');

assert.match(lua, /function script_load\(settings\)[\s\S]*ensure_companion\(\)/);
assert.match(lua, /function script_unload\(\)[\s\S]*run_controller\("stop"\)/);
assert.doesNotMatch(lua, /timer_add|script_tick/);
assert.match(controller, /startedAtTicks/);
assert.match(controller, /ProcessName -ne 'node'/);
assert.doesNotMatch(controller, /Get-CimInstance/);
assert.match(controller, /--obs-parent/);
assert.match(controller, /-WindowStyle Hidden/);

console.log('OBS companion lifecycle contract passed');

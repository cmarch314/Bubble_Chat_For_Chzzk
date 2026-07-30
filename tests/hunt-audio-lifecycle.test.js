'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntAudioManager.js'), 'utf8');
assert.match(source, /activeTransientAudios = new Set\(\)/);
assert.match(source, /addEventListener\('ended', release, \{ once: true \}\)/);
assert.match(source, /for \(const audio of this\.activeTransientAudios\)/);
assert.match(source, /this\.activeTransientAudios\.clear\(\)/);
assert.match(source, /audioManager\.releaseMediaElement\?\.\(audio\)/,
    'stopped hunt audio must release the global media-stage reference');
assert.match(source, /audioManager\.releaseMediaElement\?\.\(bgm\)/,
    'stopped hunt BGM must release the global media-stage reference');
assert.match(source, /stopBgms\(\) \{\s*this\.timers\.clearAll\(\)/);
assert.match(source, /dispose\(\) \{[\s\S]*this\.localAudioEntries = \[\]/);
assert.match(source, /this\.localAudioByCategory\.clear\(\)/);
assert.match(source, /this\.hunterVoiceProfiles\.clear\(\)/);
console.log('[test] Hunt audio transient-object and timer lifecycle ownership passed.');

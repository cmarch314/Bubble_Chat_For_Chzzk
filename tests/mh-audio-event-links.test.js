'use strict';

const assert = require('assert');
const { parseTxtpLinks, companionEventBankCandidates, linkForStream } = require('../scripts/build-local-mh-audio');

const links = parseTxtpLinks([
    { eventId: '21645643', text: 'wem/347625427.wem #i  ##memory\n' },
    { eventId: '9981', text: '#s7 #i ##123456.wem\n' }
]);

assert.deepStrictEqual(links['source:347625427'], { eventIds: ['21645643'], sourceIds: ['347625427'] });
assert.deepStrictEqual(links[7], { eventIds: ['9981'], sourceIds: ['123456'] });
assert.deepStrictEqual(linkForStream(links, 1, '347625427').eventIds, ['21645643']);
assert.deepStrictEqual(linkForStream(links, 7, 'not-numeric').eventIds, ['9981']);
assert.deepStrictEqual(
    companionEventBankCandidates('D:/Wilds/Wp00_Cmn_m.sbnk.1.X64'),
    ['D:/Wilds/Wp00_Cmn.sbnk.1.X64']
);
assert.deepStrictEqual(
    companionEventBankCandidates('D:/Rise/Player_ActVoice_media.bnk.3.x64'),
    ['D:/Rise/Player_ActVoice.bnk.3.x64']
);

console.log('mh-audio event link tests passed');

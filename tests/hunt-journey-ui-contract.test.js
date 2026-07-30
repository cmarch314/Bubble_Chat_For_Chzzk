const assert = require('assert');
const fs = require('fs');
const path = require('path');
const renderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const effect = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const flow = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntJourneyFlowController.js'), 'utf8');
const css = require('./helpers/hunt-css');
assert.match(renderer, /hunt-journey-event-choices/);
assert.match(renderer, /hunt-journey-upgrade-list/);
assert.match(renderer, /renderJourneyTravelMap\(data\)/, 'journey needs a dedicated between-node map scene');
assert.match(renderer, /data-journey-map-node/, 'the map must render every route node as visible progress');
assert.match(renderer, /data-journey-travel-timer/, 'the travel scene must expose its arrival countdown');
assert.match(renderer, /data\.scene\?\.narrative/, 'selected destinations must render a second encounter scene');
assert.match(renderer, /choice\.description/, 'event actions must show cost and consequence copy');
assert.match(renderer, /!\$\{index \+ 1\}/, 'journey commands must be printed in full');
assert.match(css, /\.hunt-journey-event-board\s*\{[^}]*min-height:\s*760px/s);
assert.match(css, /\.hunt-journey-upgrade-board\s*\{[^}]*min-height:\s*760px/s);
assert.match(css, /\.hunt-journey-travel-map\s*\{[^}]*min-height:\s*760px/s);
assert.match(css, /\.hunt-journey-map-node\.is-current\s+i\s*\{[\s\S]*?animation:/,
    'the current route position must be visually prominent');
assert.match(flow, /TRAVEL_DURATION_SECONDS\s*=\s*10/, 'the journey flow owner must define the ten-second travel contract');
assert.match(effect, /duration:\s*travelDuration/, 'the travel UI and timer must consume the flow-owned duration');
assert.match(effect, /if \(this\.journeyTravelActive\) return false/, 'combat/loadout chat must not leak into the travel scene');
assert.match(effect, /HuntJourneyVoteRuntime\.VOTE_DURATION_SECONDS/g,
    'combat, event, and upgrade votes must share the one-minute vote contract');
assert.match(effect, /hasAllEligibleVotes[\s\S]*?finishJourneyTimedVote\(\)/,
    'event votes must close immediately once every human hunter has voted');
assert.match(effect, /hasAllEligibleVotes[\s\S]*?this\.beginLoadout\(\)/,
    'monster votes must advance immediately once every human hunter has voted');
assert.match(renderer, /투표 마감 60초 · 전원 투표 시 즉시 확정/);
assert.match(renderer, /선택 마감 60초 · 전원 선택 시 즉시 확정/);
assert.match(renderer, /강화 선택 60초 · 전원 선택 시 즉시 확정/);
assert.doesNotMatch(css.match(/\.hunt-journey-(?:event|upgrade)[\s\S]*?(?=\n\.[^{]+\{|$)/)?.[0] || '', /text-overflow:\s*ellipsis/);
console.log('[test] Journey 1920x1080-safe event/upgrade command readability contract passed.');

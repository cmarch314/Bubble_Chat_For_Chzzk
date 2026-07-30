'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const renderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const effect = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const css = require('./helpers/hunt-css');
const start = renderer.indexOf('    renderJourneyQuestBoard(data)');
const end = renderer.indexOf('\n    renderQuestBoard(data)', start);
const journeyBoard = renderer.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.match(renderer, /renderQuestBoard\(data\)\s*\{\s*if \(data\.journey\) \{\s*this\.renderJourneyQuestBoard\(data\);/,
    'journey must use its dedicated quest-card layout without altering standalone hunts');
assert.match(journeyBoard, /voting \? data\.journeyChoices : \[data\.selectedMonster\]/,
    'the opening board must show exactly the fixed first monster when no vote exists');
assert.match(journeyBoard, /\.filter\(Boolean\)\.slice\(0, 3\)/,
    'later target votes must be bounded to one through three quest cards');
assert.match(journeyBoard, /class="hunt-journey-quest-card/);
assert.match(journeyBoard, /data-journey-choice=/);
assert.match(journeyBoard, /<h2>[\s\S]*?nameKO[\s\S]*?<p><span>보상<\/span>/,
    'each compact quest card must prioritize monster name and actual reward');
assert.doesNotMatch(journeyBoard, /목적지|제한 시간|실패 조건|참가 조건/,
    'journey quest cards must not restore the verbose standalone quest sheet');
assert.match(journeyBoard, /id="hunt-recruit-names" class="hunt-rise-recruit-slots"/);
assert.match(journeyBoard, /!참가/);
assert.match(journeyBoard, /recruiting[\s\S]*?사냥감 확정[\s\S]*?자동 출발/,
    'a later fixed boss must not reopen recruitment merely because it has no vote');
assert.match(effect, /const journeyOpening =[\s\S]*?nodeIndex[\s\S]*?party/);
assert.match(effect, /journeyVote \? '투표 마감'[\s\S]*?!journeyOpening \? '출발 준비' : '모집 마감'/,
    'opening recruitment and later fixed encounters need distinct timer labels');
assert.match(css, /\.hunt-journey-party-strip \.hunt-rise-recruit-slots\s*\{[\s\S]*?grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/,
    'the four hunter slots must remain a horizontal bottom strip');
assert.match(effect, /journeyReward:[\s\S]*?HuntJourneyRewardCatalog\.coinFor/,
    'displayed quest rewards must come from the same runtime reward owner as settlement');

console.log('[test] Journey opening recruitment and later 1-3 card target vote layout passed.');

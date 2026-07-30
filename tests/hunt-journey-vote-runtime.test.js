const assert = require('assert');
global.HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
global.HuntJourneyEventCatalog = require('../js/effects/hunt/HuntJourneyEventCatalog');
const HuntJourneyVoteRuntime = require('../js/effects/hunt/HuntJourneyVoteRuntime');
const HuntJourneyEventEngine = require('../js/effects/hunt/HuntJourneyEventEngine');

assert.strictEqual(HuntJourneyVoteRuntime.parse('!2'), 1);
assert.strictEqual(HuntJourneyVoteRuntime.parse('!4'), null);
assert.strictEqual(HuntJourneyVoteRuntime.VOTE_DURATION_SECONDS, 60);
const vote = new HuntJourneyVoteRuntime(42);
const openingNode = { type: 'combat', isBoss: false, monsterId: null, monsterChoices: ['a', 'b', 'c'] };
assert.strictEqual(HuntJourneyVoteRuntime.shouldOpenCombatVote({ nodeIndex: 0, party: [] }, openingNode), false,
    'the first recruitment must not show a meaningless next-target vote');
assert.strictEqual(HuntJourneyVoteRuntime.shouldOpenCombatVote({ nodeIndex: 2, party: [{ nickname: 'A' }] }, openingNode), true,
    'later non-boss combat choices must remain party votes');
assert.strictEqual(HuntJourneyVoteRuntime.shouldOpenCombatVote({ nodeIndex: 3, party: [{ nickname: 'A' }] }, { ...openingNode, isBoss: true }), false);
assert.ok(vote.cast('a', 0, 3));
assert.ok(vote.cast('b', 1, 3));
assert.ok(vote.cast('a', 2, 3), 'latest vote replaces the earlier vote');
assert.deepStrictEqual(vote.tally(3), [0, 1, 1]);
assert.deepStrictEqual(vote.resolve(3, 7), vote.resolve(3, 7), 'tie resolution must be deterministic');
const idleVote = new HuntJourneyVoteRuntime(42);
assert.deepStrictEqual(idleVote.resolve(3, 7, 1), { index: 1, counts: [0, 0, 0], tied: false, usedDefault: true },
    'an explicit no-vote default must not be replaced by a random paid or risky action');
assert.deepStrictEqual(idleVote.resolve(3, 7, null), { index: null, counts: [0, 0, 0], tied: false, usedDefault: true },
    'a no-action default must preserve shared currency and resources');
const voters = { party: [
    { uid: 'u1', nickname: 'a', isNpc: false },
    { nickname: 'b', isNpc: false },
    { nickname: 'npc', isNpc: true }
] };
const completionVote = new HuntJourneyVoteRuntime(7);
completionVote.cast('u1', 0, 2);
assert.strictEqual(HuntJourneyVoteRuntime.hasAllEligibleVotes(voters, completionVote), false);
completionVote.cast('b', 1, 2);
assert.strictEqual(HuntJourneyVoteRuntime.hasAllEligibleVotes(voters, completionVote), true,
    'all human hunters voting must close the timer without waiting for NPCs');

const state = { zenny: 1, rerolls: 0, supply: { potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 }, party: [
    { nickname: 'a', potions: 0, lifepowders: 0, bombs: 0 },
    { nickname: 'b', potions: 0, lifepowders: 0, bombs: 0 }
] };
const engine = new HuntJourneyEventEngine();
const individual = engine.resolveChoices(state, { eventScope: 'individual', eventChoices: ['gather', 'trader'] }, [0, 1]);
assert.strictEqual(individual.supply.potions, 1);
assert.strictEqual(individual.supply.lifepowders, 1,
    'the first hunter gathering a coin may fund the later shared-supply purchase');
const party = engine.resolveChoices(state, { eventScope: 'party', eventChoices: ['smithy', 'gather'] }, [0]);
assert.strictEqual(party.rerolls, 1);
const customCatalog = new HuntJourneyEventCatalog().register({ id: 'ambush', label: '난입', apply(result) { result.zenny = 9; } });
assert.strictEqual(new HuntJourneyEventEngine(customCatalog).resolveChoices(state, { eventScope: 'party', eventChoices: ['ambush'] }, [0]).zenny, 9);
const defaults = HuntJourneyEventCatalog.createDefault();
assert.ok(['camp', 'felyne', 'risky_gather'].every(id => defaults.get(id)));
console.log('[test] Journey party/individual voting and deterministic tie resolution passed.');

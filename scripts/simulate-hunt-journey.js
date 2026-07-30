const HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
global.HuntJourneyCatalog = HuntJourneyCatalog;
global.HuntRunState = require('../js/effects/hunt/HuntRunState');
global.HuntJourneyEventCatalog = require('../js/effects/hunt/HuntJourneyEventCatalog');
const HuntJourneyVoteRuntime = require('../js/effects/hunt/HuntJourneyVoteRuntime');
const HuntJourneyEventEngine = require('../js/effects/hunt/HuntJourneyEventEngine');
const HuntJourneyRewardCatalog = require('../js/effects/hunt/HuntJourneyRewardCatalog');
const HuntRunDirector = require('../js/effects/hunt/HuntRunDirector');

const modes = ['silent', 'average', 'maximum'];
const tiers = ['small', 'medium', 'normal', 'elder', 'colossal'];
const monsters = tiers.flatMap(tier => Array.from({ length: 5 }, (_, index) => ({ id: `${tier}-${index}`, tier })));

function parseRuns(args = []) {
    const equals = args.find(arg => String(arg).startsWith('--runs='));
    const flagIndex = args.indexOf('--runs');
    const raw = equals ? equals.slice('--runs='.length)
        : flagIndex >= 0 ? args[flagIndex + 1]
            : args.find(arg => !String(arg).startsWith('-')) ?? 25;
    const runs = Number(raw);
    if (!Number.isSafeInteger(runs) || runs < 1 || runs > 10000) {
        throw new Error(`--runs must be an integer from 1 to 10000, received: ${raw}`);
    }
    return runs;
}

async function simulate(seed, mode) {
    const nodes = HuntJourneyCatalog.build(monsters, monster => monster.tier, seed);
    const director = new HuntRunDirector({ client: null, channelKey: 'simulation' });
    director.state = HuntRunState.normalize({
        runId: `sim-${mode}-${seed}`, seed, nodes, carts: 3, zenny: 0, lockLimit: 1,
        party: Array.from({ length: 4 }, (_, index) => ({ nickname: `H${index}`, hp: 100, maxHp: 100, potions: 3 }))
    });
    const eventEngine = new HuntJourneyEventEngine();
    let decisions = 0;
    while (director.state.status === 'active') {
        const node = director.currentNode();
        if (!node) throw new Error('active journey has no current node');
        if (node.type === 'combat') {
            const vote = new HuntJourneyVoteRuntime(seed ^ director.state.nodeIndex);
            const voters = mode === 'silent' ? 0 : mode === 'average' ? 2 : 4;
            for (let index = 0; index < voters; index++) vote.cast(`H${index}`, index % node.monsterChoices.length, node.monsterChoices.length);
            node.monsterId = node.monsterId || node.monsterChoices[vote.resolve(node.monsterChoices.length, director.state.nodeIndex).index];
            await director.completeCurrentNode({ zenny: Math.min(9, director.state.zenny
                + HuntJourneyRewardCatalog.coinFor(node.tier, node.isBoss)) });
        } else {
            const vote = new HuntJourneyVoteRuntime(seed ^ director.state.nodeIndex);
            const voters = mode === 'silent' ? 0 : mode === 'average' ? 2 : 4;
            for (let index = 0; index < voters; index++) vote.cast(`H${index}`, index % node.eventChoices.length, node.eventChoices.length);
            const selected = vote.resolve(node.eventChoices.length, director.state.nodeIndex).index;
            const eventId = node.eventChoices[selected];
            const scene = eventEngine.catalog.get(eventId);
            const actionCount = scene.actions.length;
            const defaultActionIndex = scene.defaultActionId
                ? scene.actions.findIndex(action => action.id === scene.defaultActionId)
                : null;
            const actionVote = new HuntJourneyVoteRuntime(seed ^ director.state.nodeIndex ^ 0xa5a5);
            for (let index = 0; index < voters; index++) {
                actionVote.cast(`H${index}`, index % actionCount, actionCount);
            }
            const actionIndexes = scene.scope === 'party'
                ? [actionVote.resolve(actionCount, director.state.nodeIndex, defaultActionIndex).index]
                : director.state.party.map((_, index) => index < voters ? index % actionCount : defaultActionIndex);
            const patch = eventEngine.resolveEventActions(director.state, eventId, actionIndexes);
            delete patch.summary;
            await director.completeCurrentNode(patch);
        }
        decisions++;
        if (decisions > HuntRunState.NODE_COUNT) throw new Error('journey exceeded its node budget');
        if (director.state.zenny < 0 || director.state.zenny > 9) throw new Error('zenny escaped 0..9');
    }
    if (director.state.nodeIndex !== HuntRunState.NODE_COUNT) throw new Error('journey did not complete every node');
    return decisions;
}

async function main(args = process.argv.slice(2)) {
    const runsPerMode = parseRuns(args);
    for (const mode of modes) {
        let decisions = 0;
        for (let seed = 1; seed <= runsPerMode; seed++) decisions += await simulate(seed, mode);
        if (decisions !== runsPerMode * HuntRunState.NODE_COUNT) {
            throw new Error(`journey simulation executed ${decisions} nodes; expected ${runsPerMode * HuntRunState.NODE_COUNT}`);
        }
        console.log(`[journey-sim] mode=${mode} runs=${runsPerMode} nodes=${decisions}`);
    }
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });

module.exports = { parseRuns, simulate, main };

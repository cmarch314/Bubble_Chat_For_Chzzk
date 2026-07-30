class HuntJourneyEventEngine {
    constructor(catalog = null) {
        const Catalog = typeof HuntJourneyEventCatalog !== 'undefined'
            ? HuntJourneyEventCatalog
            : require('./HuntJourneyEventCatalog');
        this.catalog = catalog || Catalog.createDefault();
    }

    applyEvent(result, eventId, memberIndexes = null, actionId = null) {
        const indexes = memberIndexes || result.party.map((_, index) => index);
        const definition = this.catalog.get(eventId);
        if (!definition) throw new Error(`Unknown journey event: ${eventId}`);
        const action = actionId ? definition.actions?.find(item => item.id === actionId) : definition.actions?.[0];
        const apply = action?.apply || definition.apply;
        if (typeof apply !== 'function') throw new Error(`Journey event action is not executable: ${eventId}:${actionId || 'default'}`);
        const affordable = !action?.price || Number(result.zenny || 0) >= Number(action.price);
        const applied = affordable && apply(result, indexes, { individual: memberIndexes !== null, event: definition, action }) !== false;
        result.eventOutcomes = [...(result.eventOutcomes || []), {
            eventId, actionId: action?.id || actionId || null, indexes: [...indexes],
            applied, reason: affordable ? (applied ? 'applied' : 'rejected') : 'insufficient-zenny'
        }];
        return result;
    }

    actionFor(definition, choiceIndex) {
        if (Number.isInteger(choiceIndex)) return definition.actions?.[choiceIndex] || null;
        if (!definition.defaultActionId) return null;
        return definition.actions?.find(action => action.id === definition.defaultActionId) || null;
    }

    resolveEventActions(state, eventId, choiceIndexes = []) {
        const definition = this.catalog.get(eventId);
        if (!definition) throw new Error(`Unknown journey event: ${eventId}`);
        const result = { party: (state.party || []).map(member => ({ ...member })), zenny: state.zenny,
            rerolls: state.rerolls, supply: { ...(state.supply || {}) }, ambushHook: null };
        const labels = [];
        if (definition.scope === 'party') {
            const action = this.actionFor(definition, choiceIndexes[0]);
            if (action) {
                this.applyEvent(result, eventId, null, action.id);
                const outcome = result.eventOutcomes.at(-1);
                labels.push(outcome?.applied ? action.label : `${action.label} (실패)`);
            } else labels.push('행동 없음');
        } else {
            result.party.forEach((_, index) => {
                const action = this.actionFor(definition, choiceIndexes[index]);
                if (action) {
                    this.applyEvent(result, eventId, [index], action.id);
                    const outcome = result.eventOutcomes.at(-1);
                    labels.push(`${result.party[index].nickname || index + 1}:${action.label}${outcome?.applied ? '' : ' (실패)'}`);
                } else labels.push(`${result.party[index].nickname || index + 1}:행동 없음`);
            });
        }
        result.lastEvent = eventId;
        result.summary = `${definition.icon} ${definition.label}: ${labels.join(' · ')}`;
        return result;
    }

    resolveChoices(state, node, choiceIndexes = []) {
        const result = { party: (state.party || []).map(member => ({ ...member })), zenny: state.zenny,
            rerolls: state.rerolls, supply: { ...(state.supply || {}) }, ambushHook: null };
        const choices = node.eventChoices || [];
        if (node.eventScope === 'party') {
            const eventId = choices[choiceIndexes[0] || 0];
            this.applyEvent(result, eventId);
            result.lastEvent = eventId;
            result.summary = `공동 선택: ${eventId}`;
        } else {
            const labels = [];
            result.party.forEach((_, index) => {
                const eventId = choices[choiceIndexes[index] ?? 0];
                this.applyEvent(result, eventId, [index]);
                labels.push(eventId);
            });
            result.lastEvent = 'individual';
            result.summary = `개별 선택: ${labels.join(' · ')}`;
        }
        return result;
    }

    resolve(state, node) {
        if (node.eventChoices?.length) return this.resolveChoices(state, node, [0]);
        const definition = this.catalog.get(node.eventId);
        if (!definition) throw new Error(`Unknown journey event: ${node.eventId}`);
        return this.resolveEventActions(state, node.eventId, []);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyEventEngine;
else globalThis.HuntJourneyEventEngine = HuntJourneyEventEngine;

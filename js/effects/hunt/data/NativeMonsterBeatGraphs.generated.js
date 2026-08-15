'use strict';

/**
 * Generated native BEAT graphs promoted from reviewed candidate kits.
 * This file is deliberately data-only: preview and live combat consume the
 * same graph through HuntMonsterNativeBeatCatalog.
 */
const RATHIAN_TRIPLE_FIREBALL_GRAPH = Object.freeze({
    id: 'rathian.triple_fireball', actor: 'monster', schemaVersion: 2, backend: 'beat-v2', reviewStatus: 'approved',
    atb: Object.freeze({ cost: 46, recovery: 'during-action', gateUntil: 'complete' }),
    beats: Object.freeze([
        Object.freeze({ id: 'look', ticks: 3,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({ origin: 'part:head', pose: 'brace', face: 'target' }) })
            ]) }),
            events: Object.freeze([{ kind: 'audio', slot: 'look', offsetTicks: 1 }]) }),
        Object.freeze({ id: 'inhale', ticks: 14,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({ origin: 'part:head', scaleX: 1.08, scaleY: 1.12 }) })
            ]) }),
            events: Object.freeze([{ kind: 'audio', slot: 'inhale', offsetTicks: 2 }]) }),
        Object.freeze({ id: 'spit-primary', ticks: 7,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({
                    projectileRecoil: true, origin: 'part:head', moveEasing: 'smooth', rotation: 0, scaleX: .9, scaleY: .84
                }) })
            ]) }),
            events: Object.freeze([
                { kind: 'audio', slot: 'projectile', offsetTicks: 0 },
                { kind: 'projectile-launch', id: 'fireball-1:launch', projectileId: 'fireball-1', target: 'primary',
                    origin: 'part:head', outcomeEventId: 'fireball-1:contact', flightMode: 'distance', speedPxPerTick: 120, offsetTicks: 0 },
                { kind: 'damage', id: 'fireball-1:contact', group: 'fireball-1:contact', target: 'primary', projectileId: 'fireball-1',
                    damagePercent: 40, hitReactionKind: 'strong', offsetTicks: 5 }
            ]) }),
        Object.freeze({ id: 'spit-left', ticks: 7,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({
                    projectileRecoil: true, origin: 'part:head', moveEasing: 'smooth', rotationToward: -15, scaleX: .9, scaleY: .84
                }) })
            ]) }),
            events: Object.freeze([
                { kind: 'audio', slot: 'projectile', offsetTicks: 0 },
                { kind: 'projectile-finish', id: 'fireball-1:finish', projectileId: 'fireball-1', offsetTicks: 1 },
                { kind: 'projectile-launch', id: 'fireball-2:launch', projectileId: 'fireball-2', target: 'left',
                    origin: 'part:head', outcomeEventId: 'fireball-2:contact', flightMode: 'distance', speedPxPerTick: 120, offsetTicks: 0 },
                { kind: 'damage', id: 'fireball-2:contact', group: 'fireball-2:contact', target: 'left', projectileId: 'fireball-2',
                    damagePercent: 40, hitReactionKind: 'strong', offsetTicks: 5 }
            ]) }),
        Object.freeze({ id: 'spit-right', ticks: 7,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({
                    projectileRecoil: true, origin: 'part:head', moveEasing: 'smooth', rotationToward: 15, scaleX: .9, scaleY: .84
                }) })
            ]) }),
            events: Object.freeze([
                { kind: 'audio', slot: 'projectile', offsetTicks: 0 },
                { kind: 'projectile-finish', id: 'fireball-2:finish', projectileId: 'fireball-2', offsetTicks: 1 },
                { kind: 'projectile-launch', id: 'fireball-3:launch', projectileId: 'fireball-3', target: 'right',
                    origin: 'part:head', outcomeEventId: 'fireball-3:contact', flightMode: 'distance', speedPxPerTick: 120, offsetTicks: 0 },
                { kind: 'damage', id: 'fireball-3:contact', group: 'fireball-3:contact', target: 'right', projectileId: 'fireball-3',
                    damagePercent: 40, hitReactionKind: 'strong', offsetTicks: 5 }
            ]) }),
        Object.freeze({ id: 'recover', ticks: 14,
            tracks: Object.freeze({ visual: Object.freeze([
                Object.freeze({ offsetTicks: 0, value: Object.freeze({ origin: 'part:head', moveEasing: 'decelerate', pose: 'idle', rotation: 0, scaleX: 1, scaleY: 1 }) })
            ]) }),
            events: Object.freeze([{ kind: 'projectile-finish', id: 'fireball-3:finish', projectileId: 'fireball-3', offsetTicks: 1 }]) })
    ])
});

const HUNT_NATIVE_BEAT_GRAPHS = Object.freeze({
    rathian: Object.freeze({
        'rathian.fireball': Object.freeze({
            id: 'rathian.fireball',
            actor: 'monster',
            schemaVersion: 2,
            backend: 'beat-v2',
            reviewStatus: 'approved',
            atb: Object.freeze({ cost: 30, recovery: 'during-action', gateUntil: 'complete' }),
            beats: Object.freeze([
                Object.freeze({
                    id: 'look', ticks: 3,
                    tracks: Object.freeze({ visual: Object.freeze([
                        Object.freeze({ offsetTicks: 0, value: Object.freeze({ origin: 'part:head', pose: 'brace', face: 'target' }) })
                    ]) }),
                    events: Object.freeze([{ kind: 'audio', slot: 'look', offsetTicks: 1 }])
                }),
                Object.freeze({
                    id: 'inhale', ticks: 16,
                    tracks: Object.freeze({ visual: Object.freeze([
                        Object.freeze({ offsetTicks: 0, value: Object.freeze({
                            origin: 'part:head', moveEasing: 'decelerate', pose: 'crouch', scaleX: 1.08, scaleY: 1.12
                        }) })
                    ]) }),
                    events: Object.freeze([{ kind: 'audio', slot: 'inhale', offsetTicks: 2 }])
                }),
                Object.freeze({
                    id: 'spit', ticks: 7,
                    tracks: Object.freeze({ visual: Object.freeze([
                        Object.freeze({ offsetTicks: 0, value: Object.freeze({
                            origin: 'part:head', moveEasing: 'snap', pose: 'stretch-strong',
                            rotationToward: 8, scaleX: 0.9, scaleY: 0.84, projectileRecoil: true
                        }) })
                    ]) }),
                    events: Object.freeze([
                        { kind: 'audio', slot: 'projectile', offsetTicks: 0 },
                        {
                            kind: 'projectile-launch', id: 'fireball-1:launch', projectileId: 'fireball-1',
                            target: 'primary', origin: 'part:head', outcomeEventId: 'fireball-1:contact',
                            flightMode: 'distance', speedPxPerTick: 120, offsetTicks: 0
                        }
                    ])
                }),
                Object.freeze({
                    id: 'recover', ticks: 15,
                    tracks: Object.freeze({ visual: Object.freeze([
                        Object.freeze({ offsetTicks: 0, value: Object.freeze({
                            origin: 'part:head', moveEasing: 'decelerate', pose: 'idle',
                            rotation: 0, scaleX: 1, scaleY: 1
                        }) })
                    ]) }),
                    events: Object.freeze([
                        {
                            kind: 'damage', id: 'fireball-1:contact', group: 'fireball-1:contact',
                            target: 'primary', projectileId: 'fireball-1', damagePercent: 34,
                            hitReactionKind: 'strong', offsetTicks: 0
                        },
                        { kind: 'projectile-finish', id: 'fireball-1:finish', projectileId: 'fireball-1', offsetTicks: 5 }
                    ])
                })
            ])
        }),
        'rathian.triple_fireball': RATHIAN_TRIPLE_FIREBALL_GRAPH
    })
});

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_NATIVE_BEAT_GRAPHS;
else globalThis.HUNT_NATIVE_BEAT_GRAPHS = HUNT_NATIVE_BEAT_GRAPHS;

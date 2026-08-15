'use strict';

/**
 * Generated native BEAT graphs promoted from reviewed candidate kits.
 * This file is deliberately data-only: preview and live combat consume the
 * same graph through HuntMonsterNativeBeatCatalog.
 */
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
        })
    })
});

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_NATIVE_BEAT_GRAPHS;
else globalThis.HUNT_NATIVE_BEAT_GRAPHS = HUNT_NATIVE_BEAT_GRAPHS;

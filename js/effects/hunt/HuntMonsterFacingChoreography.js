'use strict';

// Data-driven facing (left/right flip) timelines for monster attack motions.
//
// Each entry maps a motion profile id to a builder that returns an ordered list
// of { offset, direction } steps (direction is -1, 0, or 1), or null to fall
// back to the generic target-facing plan. Adding a new monster's directional
// choreography means adding one entry here — never threading another `if`
// branch through HuntMonsterAttackAnimator.facingPlan.
//
// The builder receives a context assembled by the animator:
//   {
//     id, pattern, profile,
//     horizontalDirection, authoredDirection,   // resolved sign hints
//     attackX, secondX,                          // measured travel offsets
//     monsterState,                              // 'normal' | 'enraged' | ...
//     ticksPerSecond,                            // HuntAtbConfig cadence
//     projectileLaunchDelayMs                    // static timing helper (fn)
//   }
// It must stay a pure function of that context so the same inputs always
// reproduce the same plan under the 1920x1080 pattern-lab review.

const HuntMonsterFacingChoreography = {
    'rathian-somersault-glide'({ pattern, horizontalDirection }) {
        const glideDirection = Math.sign(Number(pattern?.runtimeGlideFacingDirection || 0))
            || horizontalDirection || -1;
        const somersaultDirection = horizontalDirection || glideDirection;
        return [
            { offset: 0, direction: somersaultDirection },
            { offset: .38, direction: somersaultDirection },
            { offset: .39, direction: glideDirection },
            { offset: .85, direction: glideDirection },
            { offset: .86, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    },

    'rathian-glide'({ horizontalDirection }) {
        const direction = horizontalDirection || -1;
        return [
            { offset: 0, direction },
            { offset: .84, direction },
            { offset: .85, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    },

    'rathian-triple-fireball'({ pattern, profile, horizontalDirection, ticksPerSecond, projectileLaunchDelayMs }) {
        const directions = (pattern?.runtimeProjectileFacingDirections || [])
            .map(Number).map(Math.sign);
        if (!directions.some(Boolean)) return null;
        let previousDirection = directions.find(Boolean) || horizontalDirection || -1;
        const resolvedDirections = directions.map(direction => {
            if (direction) previousDirection = direction;
            return previousDirection;
        });
        const timeline = Array.isArray(pattern?.impactTimeline) ? pattern.impactTimeline : [];
        const firstImpactTicks = Number(timeline[0]?.atTicks || 0);
        const launchOffsets = timeline.slice(0, resolvedDirections.length).map(event =>
            Math.max(0, Math.min(.94,
                projectileLaunchDelayMs(
                    pattern,
                    Number(event?.atTicks || firstImpactTicks),
                    firstImpactTicks,
                    ticksPerSecond,
                    720
                ) / Math.max(1, Number(profile.duration || 1))
            )));
        const plan = [{ offset: 0, direction: resolvedDirections[0] }];
        for (let index = 1; index < resolvedDirections.length; index += 1) {
            const turnAt = launchOffsets[index] || (index + 1) / (resolvedDirections.length + 1);
            plan.push({ offset: Math.max(0, turnAt - .015), direction: resolvedDirections[index - 1] });
            plan.push({ offset: turnAt, direction: resolvedDirections[index] });
        }
        plan.push({ offset: .90, direction: resolvedDirections.at(-1) });
        plan.push({ offset: .91, direction: 0 });
        plan.push({ offset: 1, direction: 0 });
        return plan;
    },

    'tigrex-charge-chain'({ pattern, monsterState }) {
        const directions = (pattern?.runtimeTigrexFacingDirections || [])
            .map(Number).map(Math.sign).filter(Boolean);
        if (!directions.length) return null;
        const passCount = Math.max(2, Math.min(3,
            Number(pattern?.targeting?.passCountByState?.[monsterState]) || 2));
        if (passCount === 3) return [
            { offset: 0, direction: directions[0] },
            { offset: .339, direction: directions[0] },
            { offset: .34, direction: directions[1] || directions[0] },
            { offset: .569, direction: directions[1] || directions[0] },
            { offset: .57, direction: directions[2] || directions[1] || directions[0] },
            { offset: .689, direction: directions[2] || directions[1] || directions[0] },
            { offset: .69, direction: directions[3] || directions[2] || directions[1] || directions[0] },
            { offset: 1, direction: directions[3] || directions[2] || directions[1] || directions[0] }
        ];
        return [
            { offset: 0, direction: directions[0] },
            { offset: .419, direction: directions[0] },
            { offset: .42, direction: directions[1] || directions[0] },
            { offset: .639, direction: directions[1] || directions[0] },
            { offset: .64, direction: directions[2] || directions[1] || directions[0] },
            { offset: 1, direction: directions[2] || directions[1] || directions[0] }
        ];
    },

    'bazel-carpet-bombing'({ authoredDirection, horizontalDirection }) {
        const direction = authoredDirection || (horizontalDirection || 1);
        return [
            { offset: 0, direction },
            { offset: .46, direction },
            { offset: .47, direction: -direction },
            { offset: .68, direction: -direction },
            { offset: .69, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    },

    'ground-charge-double'({ pattern, horizontalDirection, attackX, secondX }) {
        const firstDirection = horizontalDirection;
        const betweenDirection = Math.abs(secondX - attackX) >= 12
            ? Math.sign(secondX - attackX)
            : -firstDirection;
        if (!firstDirection && !betweenDirection) return null;
        const isStompBurst = pattern?.chargeLaunchStyle === 'stomp-burst';
        if (isStompBurst) {
            return [
                { offset: 0, direction: firstDirection || betweenDirection },
                { offset: .460, direction: firstDirection || betweenDirection },
                { offset: .461, direction: 0 },
                { offset: .610, direction: 0 },
                { offset: .611, direction: betweenDirection || firstDirection },
                { offset: .909, direction: betweenDirection || firstDirection },
                { offset: .910, direction: 0 },
                { offset: 1, direction: 0 }
            ];
        }
        return [
            { offset: 0, direction: firstDirection || betweenDirection },
            { offset: .39, direction: firstDirection || betweenDirection },
            { offset: .40, direction: betweenDirection || firstDirection },
            { offset: .78, direction: betweenDirection || firstDirection },
            { offset: .79, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    },

    'ground-charge-triple'({ pattern, horizontalDirection }) {
        const authoredDirections = (pattern?.runtimeChargeFacingDirections || [])
            .map(Number).map(Math.sign);
        const firstDirection = authoredDirections[0] || horizontalDirection || -1;
        const secondDirection = authoredDirections[1] || -firstDirection;
        const thirdDirection = authoredDirections[2] || -secondDirection;
        return [
            { offset: 0, direction: firstDirection },
            { offset: .299, direction: firstDirection },
            { offset: .30, direction: secondDirection },
            { offset: .609, direction: secondDirection },
            { offset: .61, direction: thirdDirection },
            { offset: .89, direction: thirdDirection },
            { offset: .90, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    },

    'ground-charge-zigzag'() {
        return [
            { offset: 0, direction: -1 }, { offset: .25, direction: -1 },
            { offset: .26, direction: 1 }, { offset: .43, direction: 1 },
            { offset: .44, direction: -1 }, { offset: .61, direction: -1 },
            { offset: .62, direction: 1 }, { offset: .79, direction: 1 },
            { offset: .80, direction: 0 }, { offset: 1, direction: 0 }
        ];
    },

    'lateral-sweep'() {
        return [
            { offset: 0, direction: -1 }, { offset: .14, direction: -1 },
            { offset: .15, direction: 1 }, { offset: .42, direction: 1 },
            { offset: .43, direction: -1 }, { offset: .68, direction: -1 },
            { offset: .69, direction: 1 }, { offset: .84, direction: 1 },
            { offset: .85, direction: -1 }, { offset: 1, direction: 0 }
        ];
    },

    'pounce-chain'() {
        return [
            { offset: 0, direction: -1 }, { offset: .15, direction: -1 },
            { offset: .16, direction: 1 }, { offset: .51, direction: 1 },
            { offset: .52, direction: -1 }, { offset: .70, direction: -1 },
            { offset: .71, direction: 1 }, { offset: .86, direction: 1 },
            { offset: .87, direction: -1 }, { offset: 1, direction: 0 }
        ];
    }
};

// Straight-line cross charges share one hide-then-recenter timeline; the hide
// offset is earlier for the airborne dive variants.
function crossChargePlan({ id, horizontalDirection }) {
    if (!horizontalDirection) return null;
    const hideOffset = ['aerial-charge-cross', 'legiana-drill-cross'].includes(id) ? .65 : .73;
    return [
        { offset: 0, direction: horizontalDirection },
        { offset: hideOffset, direction: horizontalDirection },
        { offset: Math.min(.99, hideOffset + .01), direction: 0 },
        { offset: 1, direction: 0 }
    ];
}
for (const id of ['ground-charge-cross', 'aerial-charge-cross', 'legiana-drill-cross',
    'ground-charge', 'rathian-ground-charge']) {
    HuntMonsterFacingChoreography[id] = crossChargePlan;
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterFacingChoreography;
if (typeof globalThis !== 'undefined') globalThis.HuntMonsterFacingChoreography = HuntMonsterFacingChoreography;

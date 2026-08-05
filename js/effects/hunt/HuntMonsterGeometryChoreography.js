'use strict';

// Data-driven per-monster geometry setup for attack motions.
//
// Each entry maps a motion profile id to a function that reads the live 1920x1080
// layout and writes the CSS custom properties / runtime pattern fields that its
// signature move needs (glide targets, carpet-bomb lanes, bite routes, per-shot
// facing). Adding a new monster's bespoke geometry means adding one entry here —
// never threading another `if (profile.id === ...)` block through
// HuntMonsterAttackAnimator.playPatternMotion.
//
// Shared charge machinery (ground-charge / cross / chain routes) is intentionally
// NOT here: it is one system used by many profiles, not a per-monster exception,
// so it stays inline in the animator.
//
// The handler receives a context assembled by playPatternMotion:
//   {
//     animator,                         // the HuntMonsterAttackAnimator instance
//     motionElement, monsterImg,        // live nodes
//     monsterRect, targetCard, targetAnchor, targetRect,
//     pattern, profile,
//     maxX, dx, dy, attackX, attackY,   // resolved travel geometry
//     anatomy                           // HuntMonsterAnatomyCatalog (or null)
//   }
// Handlers run for their side-effects (style props / pattern runtime fields) and
// must stay a pure function of that context so the pattern-lab review reproduces.

const HuntMonsterGeometryChoreography = {
    'rathian-triple-fireball'({ animator, pattern, monsterRect, dx }) {
        const sequence = Array.isArray(pattern?.runtimeImpactTargetSequence)
            ? pattern.runtimeImpactTargetSequence
            : [];
        const monsterCenterX = monsterRect.left + monsterRect.width / 2;
        let fallbackDirection = Math.sign(dx) || -1;
        pattern.runtimeProjectileFacingDirections = sequence.slice(0, 3).map((pass, eventIndex) => {
            const rawIndex = Array.isArray(pass) ? pass[0] : pass;
            const targetIndex = Number(rawIndex?.index ?? rawIndex);
            const liveCard = Number.isInteger(targetIndex)
                ? animator.card.querySelector(`#fight-card-${targetIndex}`)
                : null;
            const anchor = liveCard?.querySelector?.('.game-hunt-weapon-img-container') || liveCard;
            const rect = anchor?.getBoundingClientRect?.();
            const direction = rect
                ? Math.sign(rect.left + rect.width / 2 - monsterCenterX)
                : (eventIndex === 1 ? -1 : eventIndex === 2 ? 1 : fallbackDirection);
            if (direction) fallbackDirection = direction;
            return direction || fallbackDirection;
        });
    },

    'rathian-somersault-glide'({ animator, motionElement, pattern, targetCard, targetRect, monsterRect, maxX, dx }) {
        const sequence = Array.isArray(pattern?.runtimeImpactTargetSequence)
            ? pattern.runtimeImpactTargetSequence
            : [];
        const secondPass = sequence[1];
        const rawIndex = Array.isArray(secondPass) ? secondPass[0] : secondPass;
        const secondIndex = Number(rawIndex?.index ?? rawIndex);
        const secondCard = Number.isInteger(secondIndex)
            ? animator.card.querySelector(`#fight-card-${secondIndex}`)
            : targetCard;
        const secondAnchor = secondCard?.querySelector?.('.game-hunt-weapon-img-container') || secondCard;
        const secondRect = secondAnchor?.getBoundingClientRect?.() || targetRect;
        const glideX = Math.max(-maxX, Math.min(maxX,
            secondRect.left + secondRect.width / 2 - (monsterRect.left + monsterRect.width / 2)));
        const glideY = Math.max(-240, Math.min(430,
            secondRect.top + secondRect.height / 2 - (monsterRect.top + monsterRect.height / 2)));
        motionElement.style.setProperty('--monster-glide-x', `${glideX}px`);
        motionElement.style.setProperty('--monster-glide-y', `${glideY}px`);
        pattern.runtimeGlideFacingDirection = Math.sign(glideX) || Math.sign(dx) || -1;
    },

    // 회전 축을 헌터 위에 두지 않고 "인접한 두 명 사이"에 놓는다. 각 패스의 쌍
    // 중점을 --monster-attack-x/y로 덮어써, 회전이 그 둘을 한꺼번에 훑게 만든다.
    // 두 번째 패스가 있으면 --monster-pivot2-x/y로 함께 넘긴다.
    'nargacuga-twin-pivot-spin'({ animator, motionElement, pattern, monsterRect, targetRect }) {
        const pairs = Array.isArray(pattern?.runtimePivotPairs) ? pattern.runtimePivotPairs : [];
        const monsterCenterX = monsterRect.left + monsterRect.width / 2;
        const monsterCenterY = monsterRect.top + monsterRect.height / 2;
        const midpointOf = pair => {
            const rects = (Array.isArray(pair) ? pair : []).map(index => {
                const card = animator.card.querySelector(`#fight-card-${index}`);
                const anchor = card?.querySelector?.('.game-hunt-weapon-img-container') || card;
                return anchor?.getBoundingClientRect?.() || null;
            }).filter(Boolean);
            if (!rects.length) return null;
            const x = rects.reduce((sum, r) => sum + r.left + r.width / 2, 0) / rects.length;
            const y = rects.reduce((sum, r) => sum + r.top + r.height / 2, 0) / rects.length;
            return {
                x: Math.max(-960, Math.min(960, x - monsterCenterX)),
                y: Math.max(-240, Math.min(430, y - monsterCenterY))
            };
        };
        const first = midpointOf(pairs[0]) || {
            x: targetRect.left + targetRect.width / 2 - monsterCenterX,
            y: targetRect.top + targetRect.height / 2 - monsterCenterY
        };
        const second = midpointOf(pairs[1]) || first;
        motionElement.style.setProperty('--monster-attack-x', `${Math.round(first.x)}px`);
        motionElement.style.setProperty('--monster-attack-y', `${Math.round(first.y)}px`);
        motionElement.style.setProperty('--monster-pivot2-x', `${Math.round(second.x)}px`);
        motionElement.style.setProperty('--monster-pivot2-y', `${Math.round(second.y)}px`);
    },

    // 평상시 1회전도 같은 규칙으로 두 명 사이를 축으로 삼는다.
    'nargacuga-pivot-spin'(context) {
        HuntMonsterGeometryChoreography['nargacuga-twin-pivot-spin'](context);
    },

    // 견제 도약은 좌/우를 무작위로 고른다. 방향은 패스마다 반대로 뒤집힌다.
    'nargacuga-stance-hop'({ animator, motionElement, monsterRect }) {
        const cardRect = animator.card.getBoundingClientRect();
        const lane = Math.max(220, cardRect.width * .22 + monsterRect.width * .5);
        const direction = Math.random() < 0.5 ? -1 : 1;
        motionElement.style.setProperty('--monster-lane-x', `${Math.round(direction * lane)}px`);
    },

    'bazel-carpet-bombing'({ animator, motionElement, pattern, monsterRect, targetCard, targetAnchor, maxX, attackX, attackY }) {
        const cardRect = animator.card.getBoundingClientRect();
        const direction = pattern?.runtimeSweepDirection === 'right-to-left' ? -1 : 1;
        const sideDistance = Math.max(1150, cardRect.width * .72 + monsterRect.width);
        const diveCard = Number.isInteger(pattern?.runtimeDiveTargetIndex)
            ? animator.card.querySelector(`#fight-card-${pattern.runtimeDiveTargetIndex}`)
            : targetCard;
        const diveAnchor = diveCard?.querySelector?.('.game-hunt-weapon-img-container')
            || diveCard
            || targetAnchor;
        const diveRect = diveAnchor.getBoundingClientRect();
        const diveX = Math.max(-maxX, Math.min(maxX,
            diveRect.left + diveRect.width / 2 - (monsterRect.left + monsterRect.width / 2)));
        const diveY = Math.max(-240, Math.min(430,
            diveRect.top + diveRect.height / 2 - (monsterRect.top + monsterRect.height / 2)));
        motionElement.style.setProperty('--monster-charge-bottom',
            `${Math.max(620, cardRect.bottom - monsterRect.top + monsterRect.height)}px`);
        motionElement.style.setProperty('--monster-carpet-opening-x', `${attackX}px`);
        motionElement.style.setProperty('--monster-carpet-opening-y', `${attackY}px`);
        motionElement.style.setProperty('--monster-carpet-dive-x', `${diveX}px`);
        motionElement.style.setProperty('--monster-carpet-dive-y', `${diveY}px`);
        motionElement.style.setProperty('--monster-carpet-start-x', `${direction * -sideDistance}px`);
        motionElement.style.setProperty('--monster-carpet-end-x', `${direction * sideDistance}px`);
        motionElement.style.setProperty('--monster-carpet-flight-y',
            `${Math.max(-160, cardRect.top - monsterRect.bottom - 120)}px`);
    },

    'tigrex-double-bite'({ animator, motionElement, monsterRect, attackX, attackY, anatomy }) {
        const mouthPoint = anatomy?.visualPoint?.(animator.owner?.selectedMonster, 'mouth', 0)
            || { x: .5, y: .5 };
        const biteRoute = animator.constructor.tigrexBiteRoute(
            { x: 0, y: 0 }, { x: attackX, y: attackY }, monsterRect, mouthPoint);
        motionElement.style.setProperty('--tigrex-bite-contact-x', `${biteRoute.contact.x}px`);
        motionElement.style.setProperty('--tigrex-bite-contact-y', `${biteRoute.contact.y}px`);
        motionElement.style.setProperty('--tigrex-bite-finish-x', `${biteRoute.finish.x}px`);
        motionElement.style.setProperty('--tigrex-bite-finish-y', `${biteRoute.finish.y}px`);
        motionElement.dataset.tigrexBiteRoute = 'standalone';
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterGeometryChoreography;
if (typeof globalThis !== 'undefined') globalThis.HuntMonsterGeometryChoreography = HuntMonsterGeometryChoreography;

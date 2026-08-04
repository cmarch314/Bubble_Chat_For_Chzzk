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

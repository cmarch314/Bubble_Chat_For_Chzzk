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

    // 3연 급습은 패스마다 다른 헌터를 노린다. 그런데 CSS 애니메이션은 하나뿐이라
    // 좌표 한 쌍(--narga-hit-x/y)만으로는 세 타가 같은 자리를 때린다.
    // 패스별 좌표를 --narga-pass1..3-x/y로 따로 넘겨, 각 접촉 프레임이 자기
    // 표적을 참조하게 한다. 시퀀스가 없으면(패턴 랩 단독 재생 등) 기본 표적으로
    // 폴백하므로 종전 동작 그대로다.
    'nargacuga-leap-ambush-triple'({ animator, motionElement, pattern, monsterRect, maxX, attackX, attackY }) {
        const sequence = Array.isArray(pattern?.runtimeImpactTargetSequence)
            ? pattern.runtimeImpactTargetSequence
            : [];
        const monsterCenterX = monsterRect.left + monsterRect.width / 2;
        const monsterCenterY = monsterRect.top + monsterRect.height / 2;
        for (let pass = 0; pass < 3; pass += 1) {
            const raw = Array.isArray(sequence[pass]) ? sequence[pass][0] : sequence[pass];
            const targetIndex = Number(raw?.index ?? raw);
            const liveCard = Number.isInteger(targetIndex)
                ? animator.card?.querySelector?.(`#fight-card-${targetIndex}`)
                : null;
            const anchor = liveCard?.querySelector?.('.game-hunt-weapon-img-container') || liveCard;
            const rect = anchor?.getBoundingClientRect?.();
            // 배율과 클램프는 playPatternMotion의 target-contact 규칙(.92/.88,
            // Y는 -240~430)과 같아야 한다. 다르게 잡으면 1타만 다른 거리에서 멈춘다.
            const x = rect
                ? Math.max(-maxX, Math.min(maxX, (rect.left + rect.width / 2 - monsterCenterX) * .92))
                : attackX;
            const y = rect
                ? Math.max(-240, Math.min(430, (rect.top + rect.height / 2 - monsterCenterY) * .88))
                : attackY;
            motionElement.style.setProperty(`--narga-pass${pass + 1}-x`, `${Math.round(x)}px`);
            motionElement.style.setProperty(`--narga-pass${pass + 1}-y`, `${Math.round(y)}px`);
        }
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

    // 대상 헌터를 겨누는 각도. 나르가 스프라이트는 머리가 아래(중앙 하단)를 향하므로
    // 기준 전방 벡터는 (0,1)이다. 이를 대상 방향 (dx,dy)로 돌리는 각이 atan2(-dx, dy).
    // 이 값이 없으면 몸이 정면을 본 채 다가가 1번과 2번 사이 허공을 때리는 것처럼 보인다.
    // 과도한 회전은 어색하므로 ±58도로 제한한다.
    'nargacuga-aim'({ animator, motionElement, monsterImg, monsterRect, targetRect }) {
        const dx = (targetRect.left + targetRect.width / 2) - (monsterRect.left + monsterRect.width / 2);
        const dy = (targetRect.top + targetRect.height / 2) - (monsterRect.top + monsterRect.height / 2);
        const deg = Math.atan2(-dx, Math.max(1, dy)) * 180 / Math.PI;
        const clamped = Math.max(-58, Math.min(58, deg));
        // 겨냥은 전용 레이어에만 건다. 모션 요소에 걸면 공격 회전과 합쳐져,
        // 회전 기술이 겨냥각만큼 기울어진 채 돌아가 대각선으로 미끄러져 보인다.
        // 레이어가 없는 구형 fixture에서는 모션 요소로 폴백한다.
        const aimLayer = animator?.resolveAimLayer?.(monsterImg);
        (aimLayer || motionElement).style.setProperty('--narga-aim-deg', `${clamped.toFixed(1)}deg`);
        // 화면 밖 이탈은 좌/우 중 하나를 무작위로 고른다. 대상에서 먼 쪽으로 빠져야
        // 곧바로 되돌아오는 그림이 되지 않는다.
        const away = dx >= 0 ? -1 : 1;
        const side = Math.random() < 0.75 ? away : -away;
        motionElement.style.setProperty('--narga-exit-x', `${side * 620}px`);
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

// 방향성 있는 나르가 공격은 전부 대상을 겨눈다. 기존 핸들러가 있는 프로파일은
// 그 핸들러를 먼저 돌린 뒤 겨냥 각을 덧씌운다.
// 회전·신장이 곧 공격인 기술(꼬리 회전/역회전/후려치기/내려찍기)은 제외한다.
// 그런 모션은 부모가 비균등 scale(예: scale(1.10,1.52))을 걸기 때문에, 자식인
// 겨냥 레이어가 회전하면 늘어나는 축이 몸을 따라가지 않아 옆으로 늘어난 것처럼
// 보인다(전단). 겨냥은 몸 방향이 의미 있는 직선 돌진·급습에만 건다.
// 내려찍기는 부모가 비균등 scale로 꼬리를 늘리므로 겨냥 레이어(자식)에서 돌리면
// 전단이 생긴다. 대신 겨냥 각을 모션 요소에 써서 키프레임이 rotate()...scale() 순서로
// 같은 transform 안에서 합성하게 한다. 그러면 늘어나는 축이 몸을 따라간다.
for (const id of ['nargacuga-turn-tail-slam', 'nargacuga-turn-tail-slam-double']) {
    const existing = HuntMonsterGeometryChoreography[id];
    HuntMonsterGeometryChoreography[id] = context => {
        if (existing) existing(context);
        const dx = (context.targetRect.left + context.targetRect.width / 2)
            - (context.monsterRect.left + context.monsterRect.width / 2);
        const dy = (context.targetRect.top + context.targetRect.height / 2)
            - (context.monsterRect.top + context.monsterRect.height / 2);
        const deg = Math.atan2(-dx, Math.max(1, dy)) * 180 / Math.PI;
        context.motionElement.style.setProperty(
            '--narga-aim-deg', `${Math.max(-46, Math.min(46, deg)).toFixed(1)}deg`);
    };
}

// 급습 계열은 재진입 위치가 "표적 기준 45도 아래, 좌/우 무작위, 고정 거리"로
// 정해져 있다. 머리 방향도 그 자리에서 표적을 향하도록 키프레임이 ±135도로
// 고정하므로, 표적 좌표에서 각을 계산하는 nargacuga-aim은 쓰지 않는다.
// 둘을 겹쳐 걸면 겨냥 레이어 회전이 더해져 몸이 과하게 꺾인다.
for (const id of ['nargacuga-leap-ambush', 'nargacuga-leap-ambush-triple']) {
    const existing = HuntMonsterGeometryChoreography[id];
    HuntMonsterGeometryChoreography[id] = context => {
        if (existing) existing(context);
        const side = Math.random() < 0.5 ? -1 : 1;
        context.motionElement.style.setProperty('--narga-ambush-side', String(side));
        // 최초 화면 이탈은 표적에서 먼 쪽으로 빠진다.
        const away = context.dx >= 0 ? -1 : 1;
        context.motionElement.style.setProperty('--narga-exit-x', `${away * 620}px`);
        // 겨냥 레이어가 이전 패턴의 각을 들고 있을 수 있으므로 명시적으로 편다.
        const aimLayer = context.animator?.resolveAimLayer?.(context.monsterImg);
        (aimLayer || context.motionElement).style.setProperty('--narga-aim-deg', '0deg');
    };
}

for (const id of ['nargacuga-dash-bite']) {
    const existing = HuntMonsterGeometryChoreography[id];
    HuntMonsterGeometryChoreography[id] = context => {
        if (existing) existing(context);
        HuntMonsterGeometryChoreography['nargacuga-aim'](context);
    };
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterGeometryChoreography;
if (typeof globalThis !== 'undefined') globalThis.HuntMonsterGeometryChoreography = HuntMonsterGeometryChoreography;

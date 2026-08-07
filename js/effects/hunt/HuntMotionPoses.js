'use strict';

// 자세(pose) 프리셋.
//
// 자세는 "그 순간의 몸 모양"이다. 위치는 들어가지 않는다 — 위치는 비트의 to/at이
// 정한다. 이 분리가 요점이다. 지금은 scale(1.12,.84)가 패턴마다 흩어져 있어서
// "웅크림을 조금 더 깊게"를 하려면 68개 키프레임을 다 뒤져야 한다.
//
// 값은 추측이 아니라 실측이다. scripts/extract-monster-poses.js가 기존 키프레임
// 68개에서 scale이 있는 프레임 515개를 뽑아 군집화한 결과다.
//
//   상위 7개 비율이 93.2%를 덮는다
//   전부 이 7개로 스냅했을 때 평균 오차 0.56%, 5% 초과 10개(1.9%)
//
// scale은 한 축이 아니라 두 축이다. 515개 중 320개(62%)가 비율 1.000 — 자세는
// 없고 원근만 있고, 그 원근이 0.52~1.62로 3.1배 퍼져 있다. 둘을 한 필드에 묶으면
// "같은 웅크림인데 거리가 달라서" 매번 다른 숫자를 적게 된다(조합이 139가지까지
// 늘어나 있었다). 그래서 자세는 비율(squash)만 갖고, 원근(depth)은 비트가 갖는다.
//
//   squash = scaleX / scaleY
//   depth  = sqrt(scaleX * scaleY)     ← 비트의 것. 목적지 앵커에서 파생 가능.

const HuntMotionPoses = {
    // 기본 일곱 — 실측 비율 그대로.
    BASE: Object.freeze({
        // 기준점. 모든 패턴의 시작과 끝이다. 복귀 비트가 이 자세로 끝나면
        // 이미지가 항상 똑바로 선다.
        // resetRotation은 "똑바로 선다"를 뜻한다. 회전은 비트를 넘어 유지되므로
        // (꼬리가 박힌 채 버티는 구간이 회전을 물고 있어야 한다), 이걸 풀어주는
        // 자세가 없으면 몬스터가 뒤집힌 채로 제자리에 돌아간다.
        idle: Object.freeze({ squash: 1.000, resetRotation: true }),

        // 스프링을 압축하는 순간. 이 자세가 빠지면 도약이 "튀어오르는" 대신
        // "미끄러지는" 것으로 보인다. 3연 급습 2·3타가 어색했던 원인이다.
        crouch: Object.freeze({ squash: 1.294, offset: [0, 26], hold: true }),

        // crouch의 반대. 공중에 뜬 구간. crouch -> stretch가 붙어야 스프링이 풀린다.
        stretch: Object.freeze({ squash: 0.744 }),
        'stretch-soft': Object.freeze({ squash: 0.923 }),
        'stretch-strong': Object.freeze({ squash: 0.655 }),

        // 착지 압축. 충격이 실린 순간이라 밝기가 올라간다.
        // 타격 비트(hit: true)는 거의 항상 이 계열이다.
        land: Object.freeze({ squash: 1.430, filter: 'brightness(1.4)' }),

        // land 직후 몸이 제 모양으로 돌아오는 중간값. land -> settle이 착지 반동이다.
        settle: Object.freeze({ squash: 1.090, hold: true }),

        // 후딜 구간. 꼬리가 박힌 채 버티거나 숨을 고른다.
        brace: Object.freeze({ squash: 1.160, hold: true })
    }),

    // 회전이 붙는 자세는 축과 되감기가 함께 따라다녀야 하므로 별도로 둔다.
    // 지금은 반동·오버슛·되감기를 패턴마다 프레임으로 손으로 넣고 있고, 그래서
    // 역회전 연계의 두 회전 속도가 4.1배 차이 나는 사고가 났다.
    //
    //   rotate 375 = 한 바퀴 + 15도. 관성이 실리는 오버슛이다.
    //   recoil  15 = 접촉 후 되감기는 각도. 오버슛과 짝이다.
    //   windup  22 = 회전 반대 방향으로 감았다가 푼다. 반동이다.
    ROTATION: Object.freeze({
        'spin-left': Object.freeze({
            squash: 1.060, rotate: -375, pivot: 'part:foreleg.screen-left', windup: 18, recoil: 15
        }),
        'spin-right': Object.freeze({
            squash: 1.060, rotate: 375, pivot: 'part:foreleg.screen-right', windup: 18, recoil: 15
        }),
        'tail-slam': Object.freeze({
            squash: 0.724, rotate: 180, pivot: 'part:tail',
            filter: 'brightness(1.48) drop-shadow(0 14px 20px #000a)'
        }),
        'tail-whip': Object.freeze({
            squash: 1.090, rotate: -175, pivot: 'part:torso', windup: 22, recoil: 15
        })
    }),

    // 골격마다 이름은 고정이고 값만 다르다. 새 몬스터를 넣을 때 자세를 새로
    // 정의하지 않는다 — 골격만 고르면 일곱 자세가 따라온다. 이게 200마리를
    // 감당하는 방식이다.
    RIGS: Object.freeze({
        winged: Object.freeze({}),
        quadruped: Object.freeze({
            crouch: Object.freeze({ squash: 1.360, offset: [0, 20], hold: true }),
            land: Object.freeze({ squash: 1.520, filter: 'brightness(1.4)' })
        }),
        serpentine: Object.freeze({
            crouch: Object.freeze({ squash: 1.120, offset: [0, 14], hold: true }),
            stretch: Object.freeze({ squash: 0.820 }),
            land: Object.freeze({ squash: 1.240, filter: 'brightness(1.4)' })
        })
    }),

    names() {
        return [...Object.keys(this.BASE), ...Object.keys(this.ROTATION)];
    },

    // 없는 자세는 조용히 idle로 떨어지지 않는다. 오타난 이름이 밋밋한 동작으로
    // 나타나면 원인을 찾을 수 없다 — 이번 세션 사고의 전형적인 형태다.
    resolve(name, rig = 'winged') {
        const key = String(name || 'idle');
        const base = this.ROTATION[key] || this.RIGS[rig]?.[key] || this.BASE[key];
        if (!base) {
            throw new Error(`알 수 없는 자세: ${key} (있는 것: ${this.names().join(', ')})`);
        }
        return base;
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMotionPoses;
if (typeof globalThis !== 'undefined') globalThis.HuntMotionPoses = HuntMotionPoses;

'use strict';

// 스테이지 좌표 어휘 해석기.
//
// 재설계안 원칙 2 — "좌표는 이름으로 지정한다"의 구현이다. 패턴 저작자는
// `to: 'hunter:2.bottom'`이라고 쓰고, 배율·클램프·안전 여백은 전부 여기 한 곳에만
// 존재한다. 지금까지 `approachX .92`(애니메이터)와 `standoff .88`(CSS)이 서로
// 모르게 곱해져 표적까지의 81%에서 멈추던 사고가, 곱하는 지점이 하나뿐이면
// 구조적으로 일어날 수 없다.
//
// 계약 (재설계안 "3. 앵커 해석기의 계약"):
//   - 반환은 픽셀 {x, y} 하나. 호출부는 여기에 배율을 곱하지 않는다.
//   - 클램프는 해석기만 한다. 호출부는 클램프하지 않는다.
//   - offscreen:* 는 클램프하지 않는다. 나가라고 지시한 것이다.
//   - OBS 하단 채팅 영역은 safe-bottom 경계 하나로 관리한다.
//   - 해석 실패는 조용히 0을 반환하지 않고 던진다. 지금은 undefined가 calc()에
//     흘러들어 선언이 통째로 무효화되고 아무 신호가 없다.
//
// 좌표계: 몬스터의 홈(정지) 중심을 원점으로 하는 픽셀 오프셋이다. 그대로
// translate()에 넣을 수 있고, 기존 --monster-attack-x/y와 같은 공간이다.

class HuntStageAnchorError extends Error {
    constructor(message, spec) {
        super(spec ? `${message} (앵커: "${spec}")` : message);
        this.name = 'HuntStageAnchorError';
        this.spec = spec || null;
    }
}

class HuntStageAnchors {
    // OBS 하단 15%는 채팅이 덮는다. 확대된 접촉 프레임이 여기 들어가면 잘린다.
    // 흩어져 있던 430 상수의 유일한 출처다.
    static SAFE_BOTTOM = 430;
    static SAFE_TOP = -240;
    static LANE_PADDING = 130;
    static MIN_LANE = 150;
    static DEFAULT_STAGE_WIDTH = 720;

    // 경계 프리셋. 접촉 기술은 헌터까지 내려가야 하고, 서서 쏘는 기술은 내려가면
    // 안 된다. 두 벌뿐이므로 이름으로 고정한다.
    // minX/maxX를 생략하면 이동 한계(this.maxX)를 쓴다.
    static BOUNDS = Object.freeze({
        contact: Object.freeze({ minY: -240, maxY: 430 }),
        standoff: Object.freeze({ minY: -190, maxY: 8 }),
        // 회전 기술은 표적 바로 위에 자리를 잡는 것이 곧 공격이다. 이동 한계로
        // 끌어당기면 축이 헌터에서 벗어나 꼬리가 닿지 않는다. 가로만 넓게 연다.
        pivot: Object.freeze({ minY: -240, maxY: 430, minX: -960, maxX: 960 })
    });

    // 헌터 카드 기준점의 세로 비율. bottom을 카드 밑변이 아니라 조금 위로 잡는
    // 이유는, 밑변이 곧 채팅 안전선과 겹쳐 실제로는 화면 밖을 때리기 때문이다.
    static EDGE_RATIOS = Object.freeze({
        center: { x: .5, y: .5 },
        top: { x: .5, y: .08 },
        bottom: { x: .5, y: .92 },
        left: { x: .04, y: .5 },
        right: { x: .96, y: .5 }
    });

    // rect: {left, top, width, height}
    constructor({
        monsterRect, cardRect = null, stageWidth = null, hunters = null,
        primaryTarget = null, targetSequence = null
    } = {}) {
        // 비트는 몇 번 헌터인지 적지 않는다. 표적은 매번 달라지므로 번호를 박으면
        // 패턴이 늘 같은 사람만 때린다. `target`이 이번 턴의 주 표적을 가리킨다.
        this.primaryTarget = Number.isInteger(Number(primaryTarget)) ? Number(primaryTarget) : null;
        this.targetSequence = Array.isArray(targetSequence)
            ? targetSequence.map(Number).filter(Number.isInteger)
            : [];
        if (!monsterRect) throw new HuntStageAnchorError('monsterRect가 없다');
        this.monsterRect = monsterRect;
        this.cardRect = cardRect;
        this.origin = {
            x: monsterRect.left + monsterRect.width / 2,
            y: monsterRect.top + monsterRect.height / 2
        };
        this.stageWidth = Number(stageWidth) || HuntStageAnchors.DEFAULT_STAGE_WIDTH;
        this.hunters = hunters instanceof Map
            ? hunters
            : new Map(Object.entries(hunters || {}).map(([k, v]) => [Number(k), v]));
        // 가로 이동 한계. 몬스터가 스테이지 폭 안에 머물되, 양옆으로 한 뼘
        // (LANE_PADDING)은 더 나갈 수 있다.
        this.maxX = Math.max(
            HuntStageAnchors.MIN_LANE,
            (this.stageWidth - monsterRect.width) / 2 + HuntStageAnchors.LANE_PADDING);
    }

    // DOM에서 직접 계측한다. 헌터 카드는 무기 컨테이너를 우선 쓴다 — 카드 전체보다
    // 실제 사람이 서 있는 위치에 가깝다.
    // 헌터 번호는 세지 않고 DOM에서 발견한다. 이 프로젝트의 fight-card는 0부터
    // 시작하고 인원수도 가변이라, 범위를 가정하면 0번을 놓치고 없는 번호를
    // 지어낸다(실제로 1..4로 훑다가 그렇게 됐다).
    static fromDom(card, monsterImg, { primaryTarget = null, targetSequence = null } = {}) {
        const monsterRect = monsterImg?.getBoundingClientRect?.();
        if (!monsterRect) throw new HuntStageAnchorError('몬스터 이미지를 계측할 수 없다');
        const hunters = new Map();
        for (const hunterCard of card?.querySelectorAll?.('[id^="fight-card-"]') || []) {
            const index = Number(String(hunterCard.id).replace('fight-card-', ''));
            if (!Number.isInteger(index)) continue;
            const anchor = hunterCard.querySelector?.('.game-hunt-weapon-img-container') || hunterCard;
            const rect = anchor.getBoundingClientRect?.();
            if (rect && (rect.width || rect.height)) hunters.set(index, rect);
        }
        return new HuntStageAnchors({
            monsterRect,
            cardRect: card?.getBoundingClientRect?.() || null,
            stageWidth: monsterImg.closest?.('.hunt-monster-motion-stage')?.clientWidth || null,
            hunters,
            primaryTarget,
            targetSequence
        });
    }

    // ---- 해석 ----

    // spec 문자열 또는 {x, y} 리터럴을 홈 기준 픽셀 오프셋으로 바꾼다.
    // bounds에 프리셋 이름('contact'|'standoff') 또는 {minY, maxY}를 준다.
    resolve(spec, { bounds = 'contact' } = {}) {
        const raw = this.#parse(spec);
        if (raw.unclamped) return { x: Math.round(raw.x), y: Math.round(raw.y) };
        return this.clamp(raw, bounds);
    }

    clamp({ x, y }, bounds = 'contact') {
        const box = typeof bounds === 'string'
            ? HuntStageAnchors.BOUNDS[bounds]
            : bounds;
        if (!box) throw new HuntStageAnchorError(`알 수 없는 경계 프리셋: ${bounds}`);
        const minX = Number.isFinite(box.minX) ? box.minX : -this.maxX;
        const maxX = Number.isFinite(box.maxX) ? box.maxX : this.maxX;
        return {
            x: Math.round(Math.max(minX, Math.min(maxX, x))),
            y: Math.round(Math.max(box.minY, Math.min(box.maxY, y)))
        };
    }

    // 규칙 3 — 방향은 앵커가 정하고 반전은 그 결과를 따른다.
    // facing을 저작 데이터에서 받지 않는다. 목적지에서 파생시킨다.
    facingToward(spec, from = { x: 0, y: 0 }) {
        const point = typeof spec === 'string' || Array.isArray(spec) ? this.#parse(spec) : spec;
        return Math.sign((point.x || 0) - (from.x || 0)) || 1;
    }

    // 인자를 받는 연산자(toward/polar/above/...)는 중첩할 수 없다. 인자가 어느
    // 연산자의 것인지 문법으로 구분되지 않기 때문이다. 허용하면 안쪽 연산자가
    // 조용히 기본값을 쓰고 잘못된 좌표를 낸다 — 신호 없는 오답은 만들지 않는다.
    static TERMINAL_KINDS = Object.freeze([
        'home', 'self', 'hunter', 'target', 'pass', 'between', 'arena', 'offscreen'
    ]);

    #parse(spec, nested = false) {
        if (spec && typeof spec === 'object' && !Array.isArray(spec)) {
            if (!Number.isFinite(Number(spec.x)) || !Number.isFinite(Number(spec.y))) {
                throw new HuntStageAnchorError('좌표 리터럴에 x/y가 없다', JSON.stringify(spec));
            }
            return { x: Number(spec.x), y: Number(spec.y), unclamped: !!spec.unclamped };
        }
        const text = String(spec || '').trim();
        if (!text) throw new HuntStageAnchorError('빈 앵커');
        const [head, ...args] = text.split(/\s+/);
        // 종류와 인자는 ':' 또는 '.'로 갈린다. `hunter:2.bottom`은 콜론이 먼저이므로
        // 종류가 hunter이고, `target.top`은 점뿐이므로 종류가 target이다.
        const separator = head.search(/[:.]/);
        const kind = separator < 0 ? head : head.slice(0, separator);
        const arg = separator < 0 ? '' : head.slice(separator + 1);
        const handler = this.#handlers()[kind];
        if (!handler) throw new HuntStageAnchorError(`알 수 없는 앵커 종류: ${kind}`, text);
        if (nested && !HuntStageAnchors.TERMINAL_KINDS.includes(kind)) {
            throw new HuntStageAnchorError(
                `${kind}은 중첩할 수 없다. 인자가 어느 연산자의 것인지 구분되지 않는다`, text);
        }
        return handler(arg, args, text);
    }

    #handlers() {
        if (this._handlers) return this._handlers;
        const num = (value, spec, label) => {
            // 빈 문자열은 Number()에서 0이 된다. 인자가 빠진 것과 0을 지시한 것을
            // 구분하지 않으면, 인자를 빠뜨린 앵커가 조용히 원점으로 해석된다.
            const text = String(value ?? '').trim().replace(/(px|deg|%)$/i, '');
            const parsed = text === '' ? NaN : Number(text);
            if (!Number.isFinite(parsed)) {
                throw new HuntStageAnchorError(`${label}에 숫자가 필요하다`, spec);
            }
            return parsed;
        };
        const shift = (axis, sign) => (arg, args, spec) => {
            const base = this.#parse(arg, true);
            const distance = num(args[0], spec, '거리');
            return { ...base, [axis]: base[axis] + sign * distance };
        };
        this._handlers = {
            home: () => ({ x: 0, y: 0 }),
            self: () => ({ x: 0, y: 0 }),

            hunter: (arg, args, spec) => {
                const [indexText, edge = 'center'] = arg.split('.');
                const index = Number(indexText);
                const rect = this.hunters.get(index);
                // 조용히 0을 반환하지 않는다. 없는 헌터를 가리키는 패턴은 버그다.
                if (!rect) throw new HuntStageAnchorError(`${indexText}번 헌터가 없다`, spec);
                const ratio = HuntStageAnchors.EDGE_RATIOS[edge];
                if (!ratio) throw new HuntStageAnchorError(`알 수 없는 기준점: .${edge}`, spec);
                return {
                    x: rect.left + rect.width * ratio.x - this.origin.x,
                    y: rect.top + rect.height * ratio.y - this.origin.y
                };
            },

            // `target` / `target.bottom` — 이번 턴의 주 표적. hunter:N으로 넘긴다.
            target: (arg, args, spec) => {
                if (this.primaryTarget === null) {
                    throw new HuntStageAnchorError('주 표적이 지정되지 않았다', spec);
                }
                const edge = arg ? `.${arg.replace(/^\./, '')}` : '';
                return this.#handlers().hunter(`${this.primaryTarget}${edge}`, args, spec);
            },

            // `pass:1` / `pass:2.top` — impactTimeline의 순차 표적. 복수 돌진을
            // 하나의 주 표적으로 축소하지 않는다. 번호는 저작자가 읽기 쉬운 1부터다.
            pass: (arg, args, spec) => {
                const [ordinalText, edge = 'center'] = arg.split('.');
                const ordinal = Number(ordinalText);
                if (!Number.isInteger(ordinal) || ordinal < 1) {
                    throw new HuntStageAnchorError('pass 번호는 1 이상의 정수여야 한다', spec);
                }
                const hunterIndex = this.targetSequence[ordinal - 1];
                if (!Number.isInteger(hunterIndex)) {
                    throw new HuntStageAnchorError(`${ordinal}번째 순차 표적이 없다`, spec);
                }
                return this.#handlers().hunter(`${hunterIndex}.${edge}`, args, spec);
            },

            between: (arg, args, spec) => {
                const parts = arg.split(',').map(v => v.trim()).filter(Boolean);
                if (parts.length < 2) throw new HuntStageAnchorError('between은 둘 이상이 필요하다', spec);
                const points = parts.map(part => this.#parse(
                    /^\d+$/.test(part) ? `hunter:${part}` : part, true));
                return {
                    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
                    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
                };
            },

            arena: (arg, args, spec) => {
                if (!this.cardRect) throw new HuntStageAnchorError('아레나를 계측할 수 없다', spec);
                const yRatio = arg === 'center-lower'
                    ? (args.length ? num(args[0], spec, '세로 비율') : .56)
                    : .5;
                return {
                    x: this.cardRect.left + this.cardRect.width / 2 - this.origin.x,
                    y: this.cardRect.top + this.cardRect.height * yRatio - this.origin.y
                };
            },

            // 홈에서 목적지까지의 도중. 지금 흩어져 있는 approachX/standoff 배율이
            // 전부 이 형태로 표현된다. `toward:hunter:2 92%`
            toward: (arg, args, spec) => {
                const destination = this.#parse(arg, true);
                const ratio = num(args[0] ?? '100', spec, '비율') / 100;
                return { x: destination.x * ratio, y: destination.y * ratio };
            },

            above: shift('y', -1),
            below: shift('y', +1),
            left: shift('x', -1),
            right: shift('x', +1),

            // `polar:hunter:2 225deg 320` — 0도가 위, 시계 방향.
            polar: (arg, args, spec) => {
                const base = this.#parse(arg, true);
                const degrees = num(args[0], spec, '각도');
                const distance = num(args[1], spec, '거리');
                const radians = (degrees - 90) * Math.PI / 180;
                return {
                    x: base.x + Math.cos(radians) * distance,
                    y: base.y + Math.sin(radians) * distance
                };
            },

            // 화면 밖. 클램프하지 않는다 — 나가라고 지시한 것이다.
            offscreen: (arg, args, spec) => {
                const margin = args.length ? num(args[0], spec, '여백') : 120;
                const half = this.monsterRect.width / 2;
                const outX = this.stageWidth / 2 + half + margin;
                const outY = (this.cardRect?.height || this.stageWidth * .6) / 2
                    + this.monsterRect.height / 2 + margin;
                const table = {
                    left: { x: -outX, y: 0 },
                    right: { x: outX, y: 0 },
                    top: { x: 0, y: -outY },
                    bottom: { x: 0, y: outY }
                };
                const point = table[arg];
                if (!point) throw new HuntStageAnchorError(`알 수 없는 화면 밖 방향: ${arg}`, spec);
                return { ...point, unclamped: true };
            }
        };
        return this._handlers;
    }

    // ---- 부위 (규칙 2) ----

    // 부위 좌표는 항상 뒤집지 않은 원본 이미지 기준으로 저장돼 있고, 반전 레이어는
    // pose보다 안쪽에 있다. 따라서 pose 레이어에서 부위를 가리키려면 해석 시점에
    // x를 뒤집는다. 저작자는 좌우 두 벌을 적지 않는다.
    //
    // 이름은 몬스터 기준으로 고정한다. 화면 기준이 필요하면 `.screen-left`를 붙인다.
    // 반환은 이미지 백분율 — 스테이지 픽셀과 섞이지 않도록 이름을 달리 한다.
    static resolvePart(anatomy, monster, name, facing = 1) {
        const text = String(name || '').replace(/^part:/, '').trim();
        if (!text) throw new HuntStageAnchorError('빈 부위 이름');
        const screenMatch = text.match(/^(.*)\.screen-(left|right)$/);
        let key = screenMatch ? screenMatch[1] : text;
        if (screenMatch) {
            // 화면 기준 요청은 반전을 고려해 어느 쪽 부위인지 먼저 고른다.
            const wantsScreenLeft = screenMatch[2] === 'left';
            const monsterSide = (wantsScreenLeft ? facing >= 0 : facing < 0) ? 'left' : 'right';
            key = `${monsterSide}-${key}`;
        }
        const point = anatomy?.visualPoint?.(monster, key, 0);
        if (!point) throw new HuntStageAnchorError(`부위를 찾을 수 없다: ${key}`, name);
        const xPercent = point.x * 100;
        return {
            xPercent: facing < 0 ? 100 - xPercent : xPercent,
            yPercent: point.y * 100,
            kind: point.kind || key
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntStageAnchors;
    module.exports.HuntStageAnchors = HuntStageAnchors;
    module.exports.HuntStageAnchorError = HuntStageAnchorError;
}
if (typeof globalThis !== 'undefined') {
    globalThis.HuntStageAnchors = HuntStageAnchors;
    globalThis.HuntStageAnchorError = HuntStageAnchorError;
}

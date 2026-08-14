'use strict';

// 비트 목록을 Web Animations 키프레임으로 컴파일한다 (재설계안 원칙 3).
//
// 저작자는 이렇게 쓴다:
//
//   motion: [
//     { beat: 'windup', ticks: 5, pose: 'crouch' },
//     { beat: 'leap',   ticks: 3, to: 'offscreen:left', pose: 'stretch', fade: 'out' },
//     { beat: 'appear', ticks: 2, at: 'polar:hunter:2 225deg 700', fade: 'in' },
//     { beat: 'strike', ticks: 4, to: 'hunter:2.bottom', pose: 'land', hit: true, sfx: 'impact' },
//     { beat: 'hold',   ticks: 2, pose: 'settle' },
//     { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
//   ]
//
// 여기서 자동으로 나오는 것:
//
//   총 길이   = 비트 틱 합. 길이가 틱에서 파생되므로 VISUAL_DURATION_SCALE
//               이중 적용 같은 사고가 불가능하다(모든 패턴이 25%씩 잘려 있었다).
//   타격 시점 = hit: true인 비트의 시작 틱. impactTimeline을 따로 적지 않으므로
//               그림과 판정이 어긋날 수 없다.
//   음향 시점 = sfx가 달린 비트. 선딜/타격/후딜 어디든 붙는다.
//   후딜      = recover 비트. recovery 틱이 무시되던 일이 없다.
//   방향      = 이동 방향에서 파생된다. 저작 데이터가 facing을 따로 정하지 않으므로
//               "돌진 방향과 머리 방향이 다르다"가 성립하지 않는다.
//
// 이 모듈은 DOM을 만지지 않는다. 앵커 해석기와 자세 표만 받아 순수 함수로 돈다.
// 그래서 화면 없이 테스트로 검증할 수 있다 — 그게 검수 왕복을 줄이는 핵심이다.

class HuntMotionCompilerError extends Error {
    constructor(message, beatIndex = null) {
        super(beatIndex === null ? message : `${message} (비트 #${beatIndex})`);
        this.name = 'HuntMotionCompilerError';
        this.beatIndex = beatIndex;
    }
}

class HuntMotionCompiler {
    static TICKS_PER_SECOND = 10;

    // 같은 오프셋에 값 두 개를 둬야 "순간이동"과 "정지"가 표현된다.
    // WAAPI는 동일 오프셋을 허용하지만, 아주 작은 간격을 두는 편이 브라우저별
    // 보간 차이에 안전하다.
    static EPS = 1e-4;

    // 회전 비트의 내부 구성. 반동 -> 본 회전(오버슛 포함) -> 되감기.
    // 이 비율이 자세에 들어있으므로 패턴은 pose 이름 한 줄만 쓴다. 지금은 이걸
    // 패턴마다 손으로 프레임에 넣고 있고, 그래서 역회전 연계의 두 회전 속도가
    // 4.1배 차이 나는 사고가 났다.
    static WINDUP_AT = .22;
    static SWING_AT = .88;
    static EASING_PRESETS = Object.freeze({
        linear: 'linear',
        accelerate: 'cubic-bezier(.42,0,1,1)',
        decelerate: 'cubic-bezier(0,0,.58,1)',
        smooth: 'cubic-bezier(.42,0,.58,1)',
        'slow-fast-slow': 'cubic-bezier(.65,0,.35,1)',
        snap: 'cubic-bezier(.2,.85,.25,1)',
        heavy: 'cubic-bezier(.55,.05,.25,1)'
    });

    static easing(name) {
        return this.EASING_PRESETS[name] || this.EASING_PRESETS.smooth;
    }

    // beats: 비트 배열
    // options: { anchors, rig, poses, ticksPerSecond }
    // align: 'part:tail' — 몸 중심이 아니라 그 부위가 목적지에 오도록 놓는다.
    //
    // 이게 없으면 저작자가 픽셀을 손으로 뺀다. 나르가 꼬리는 이미지 상단 좌측
    // (30%, 17%)이라, 꼬리를 헌터에 얹으려면 중심을 (+76, +125)px 옮겨야 한다.
    // 그 뺄셈을 패턴마다 적는 것이 지금 사고의 형태다 — "너무 헌터 중앙으로
    // 이동해서 몸통 내려찍기나 다름없다"가 정확히 이 뺄셈이 없어서 났다.
    // 부위 좌표가 이미 데이터에 있으므로 런타임이 계산한다.
    static #place(spec, beat, anchors, partOffset, facing) {
        const bounds = beat.bounds || 'contact';
        const destination = anchors.resolve(spec, { bounds });
        if (!beat.align) return destination;
        const offset = partOffset(beat.align, facing);
        // 접합 뒤에 다시 클램프한다. 앞에서만 걸면 접합 보정이 경계를 조용히
        // 넘는다 — 벨리오로스 꼬리 앵커가 이미지 위쪽이라 꼬리를 표적에 얹으면
        // 몸이 133px 아래로 밀려 OBS 채팅 영역으로 들어갔다.
        // 일부러 넘겨야 하는 기술은 bounds: 'reach'로 명시한다.
        return anchors.clamp({
            x: destination.x - offset.x,
            y: destination.y - offset.y
        }, bounds);
    }

    static #placeFromCurrent(spec, beat, anchors, partOffset, facing, current) {
        const match = String(spec || '').trim().match(/^through-current:(\S+)\s+(-?\d+(?:\.\d+)?)%$/);
        if (!match) return null;
        const destination = this.#place(match[1], beat, anchors, partOffset, facing);
        const ratio = Number(match[2]) / 100;
        return anchors.clamp({
            x: current.x + (destination.x - current.x) * ratio,
            y: current.y + (destination.y - current.y) * ratio
        }, beat.bounds || 'contact');
    }

    static compile(beats, {
        anchors, rig = 'winged', poses = null, ticksPerSecond = null, partOffset = null
    } = {}) {
        const offsetOf = partOffset || (() => ({ x: 0, y: 0 }));
        const Poses = poses || (typeof HuntMotionPoses !== 'undefined'
            ? HuntMotionPoses
            : (typeof require === 'function' ? require('./HuntMotionPoses.js') : null));
        if (!Poses) throw new HuntMotionCompilerError('자세 표를 찾을 수 없다');
        if (!anchors?.resolve) throw new HuntMotionCompilerError('앵커 해석기가 필요하다');
        if (!Array.isArray(beats) || !beats.length) {
            throw new HuntMotionCompilerError('비트가 비어 있다');
        }

        const perSecond = Number(ticksPerSecond) || this.TICKS_PER_SECOND;
        const totalTicks = beats.reduce((sum, beat, index) => {
            const ticks = Number(beat?.ticks);
            if (!Number.isInteger(ticks) || ticks <= 0) {
                throw new HuntMotionCompilerError(`ticks는 1 이상의 정수여야 한다 (받은 값: ${beat?.ticks})`, index);
            }
            return sum + ticks;
        }, 0);

        const state = {
            point: { x: 0, y: 0 },
            depth: 1,
            rotation: 0,
            squash: 1,
            origin: null,
            opacity: 1,
            filter: null,
            facing: 1,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0
        };

        const placement = [{ offset: 0, ...this.#placementFrame(state) }];
        const pose = [{ offset: 0, ...this.#poseFrame(state) }];
        const facing = [];
        const impacts = [];
        const cues = [];
        const visualCues = [];
        const strideWindows = [];
        const timeline = [];
        let facingActive = false;
        let lastTravel = null;

        let elapsed = 0;
        beats.forEach((beat, index) => {
            const startTicks = elapsed;
            const endTicks = elapsed + Number(beat.ticks);
            const startAt = startTicks / totalTicks;
            const endAt = endTicks / totalTicks;
            elapsed = endTicks;

            const definition = Poses.resolve(beat.pose || 'idle', rig);
            const previous = { ...state };

            // ---- 위치 ----
            // at은 그 비트 시작에 순간이동한다. to는 비트 내내 이동한다.
            // 둘 다 없으면 이전 위치를 유지한다.
            if (beat.align && !beat.to && !beat.at) {
                throw new HuntMotionCompilerError('align은 to나 at과 함께 써야 한다', index);
            }
            if (beat.at) {
                state.point = this.#place(beat.at, beat, anchors, offsetOf, state.facing);
                placement.push({ offset: Math.max(0, startAt - this.EPS), ...this.#placementFrame(previous) });
            }
            // `at` is an instantaneous placement at the beat boundary. Keep
            // that point as the interpolation start instead of restoring the
            // previous point in the generic start frame below.
            const placementStart = beat.at
                ? { ...previous, point: { ...state.point } }
                : previous;
            if (beat.continueTravel) {
                if (!lastTravel || !lastTravel.ticks) {
                    throw new HuntMotionCompilerError('continueTravel은 직전 이동 BEAT 뒤에서만 사용할 수 있습니다', index);
                }
                state.point = {
                    x: previous.point.x + lastTravel.dx / lastTravel.ticks * Number(beat.ticks),
                    y: previous.point.y + lastTravel.dy / lastTravel.ticks * Number(beat.ticks)
                };
            } else if (beat.to) {
                state.point = this.#placeFromCurrent(
                    beat.to, beat, anchors, offsetOf, state.facing, previous.point
                ) || this.#place(beat.to, beat, anchors, offsetOf, state.facing);
            }
            state.point = {
                x: state.point.x + (Number(beat.offsetX) || 0),
                y: state.point.y + (Number(beat.offsetY) || 0)
            };
            const travel = { dx: state.point.x - previous.point.x, dy: state.point.y - previous.point.y,
                ticks: Number(beat.ticks) };
            if (travel.dx || travel.dy) lastTravel = travel;
            else if (beat.at) lastTravel = null;

            // ---- 원근 ----
            // 명시하지 않으면 이전 값을 잇는다. 앵커에서 자동 파생하는 것은 아직
            // 하지 않는다 — 어떤 곡선이 맞는지 데이터가 없는 상태에서 상수를
            // 지어내면, 없애려던 "손으로 맞추는 숫자"를 숨은 자리에 다시 만드는
            // 셈이다.
            if (beat.depth !== undefined) {
                const depth = Number(beat.depth);
                if (!Number.isFinite(depth) || depth <= 0) {
                    throw new HuntMotionCompilerError(`depth는 양수여야 한다 (받은 값: ${beat.depth})`, index);
                }
                state.depth = depth;
            }

            // ---- 자세 ----
            state.squash = Number(definition.squash) || 1;
            state.filter = definition.filter || null;
            // 축은 회전과 함께 유지된다. 회전이 남아 있는데 축만 기본값으로
            // 돌아가면, 버티는 구간으로 넘어가는 순간 몸이 눈에 띄게 튄다
            // (꼬리를 축으로 180도 돈 상태에서 축이 몸 중앙으로 옮겨간다).
            if (definition.pivot) state.origin = definition.pivot;
            if (beat.fade === 'in') state.opacity = 1;
            else if (beat.fade === 'out') state.opacity = 0;
            if (beat.opacity !== undefined) state.opacity = Math.max(0, Math.min(1, Number(beat.opacity)));
            if (beat.scaleX !== undefined) state.scaleX = Math.max(.05, Number(beat.scaleX) || 1);
            if (beat.scaleY !== undefined) state.scaleY = Math.max(.05, Number(beat.scaleY) || 1);
            if (beat.skewX !== undefined) state.skewX = Number(beat.skewX) || 0;
            if (beat.skewY !== undefined) state.skewY = Number(beat.skewY) || 0;
            if (beat.origin) state.origin = beat.origin;

            // ---- 방향 (규칙 3) ----
            // facing을 저작 데이터에서 받지 않는다. 목적지에서 파생시킨다.
            const facingTarget = beat.flipFacing || beat.face || beat.to || beat.at || beat.continueTravel;
            const wasFacingActive = facingActive;
            if (facingTarget) {
                const faceCommand = String(beat.face || '').trim();
                let direction = 0;
                if (beat.flipFacing) direction = -(previous.facing || 1);
                else if (faceCommand === 'left') direction = -1;
                else if (faceCommand === 'right') direction = 1;
                else {
                    // The editor historically stored "toward-target" while
                    // authored graphs use "target". Both are facing commands,
                    // not stage-anchor names. Unknown custom anchors are allowed,
                    // but a bad facing value must never abort the whole pattern.
                    const faceAnchor = faceCommand === 'toward-target' ? 'target' : faceCommand;
                    let aim = state.point;
                    if (faceAnchor) {
                        try { aim = anchors.resolve(faceAnchor, { bounds: 'pivot' }); }
                        catch (_) { aim = state.point; }
                    }
                    direction = Math.sign(aim.x - previous.point.x);
                }
                if (direction) {
                    state.facing = direction;
                    facingActive = true;
                }
            }
            if (state.facing !== previous.facing || (!wasFacingActive && facingActive)) {
                facing.push({ offset: startAt, direction: state.facing });
            }
            const strideFlipTicks = Math.max(0, Math.floor(Number(beat.strideFlipTicks) || 0));
            if (strideFlipTicks > 0) strideWindows.push({ startTicks, endTicks, intervalTicks: strideFlipTicks });

            // ---- 키프레임 ----
            if (false) { // destination-at-EPS frame disabled: it caused visible teleportation
                // 페이드는 비트 전체에 걸린다. 시작점에 이전 불투명도를 못박지
                // 않으면 앞 비트부터 서서히 사라져 이탈이 흐릿해진다.
                placement.push({
                    offset: Math.max(0, startAt + this.EPS),
                    ...this.#placementFrame({ ...state, opacity: previous.opacity })
                });
            }
            const startOpacity = beat.instantOpacity
                ? (beat.opacity !== undefined
                    ? Math.max(0, Math.min(1, Number(beat.opacity)))
                    : beat.fade === 'in' ? 1 : beat.fade === 'out' ? 0 : previous.opacity)
                : previous.opacity;
            placement.push({
                offset: startAt,
                ...this.#placementFrame({ ...placementStart, opacity: startOpacity }),
                easing: this.easing(beat.moveEasing)
            });
            placement.push({ offset: endAt, ...this.#placementFrame(state) });

            // 복귀 중 rotate(Ndeg) -> rotate(0deg)를 보간하면 완료한 회전을
            // 거꾸로 되감으며 집으로 간다. 한 바퀴 회전은 누적 각도를 끝까지
            // 유지하고 모션 owner가 animation.cancel()로만 초기화한다. 반 바퀴
            // 같은 비정규 자세는 복귀 시작점에서 즉시 세운 뒤 이동한다.
            // A reviewed BEAT can explicitly carry its current angle through an
            // idle/recovery pose. This is vital for full rotations: resetting
            // the pose first makes the renderer interpolate the shortest path
            // backwards (the old double tail-sweep failure).
            if (definition.resetRotation && beat.keepRotation !== true && previous.rotation) {
                const turns = previous.rotation / 360;
                const completedFullTurn = Math.abs(turns - Math.round(turns)) < 1e-6;
                if (completedFullTurn) {
                    state.rotation = previous.rotation;
                    state.origin = previous.origin;
                } else {
                    pose.push({
                        offset: Math.max(0, startAt - this.EPS),
                        ...this.#poseFrame(previous)
                    });
                    state.rotation = 0;
                    state.origin = null;
                    pose.push({ offset: startAt, ...this.#poseFrame(state) });
                }
            } else if (definition.resetRotation && beat.keepRotation !== true) {
                state.rotation = 0;
                state.origin = null;
            }

            // A direct final angle is authoritative. `0` is a real authored
            // value; legacy deltas must never turn it into a visible spin.
            if (beat.origin) state.origin = beat.origin;
            const hasExplicitRotation = beat.rotation !== undefined;
            if (hasExplicitRotation) state.rotation = Number(beat.rotation) || 0;
            if (!hasExplicitRotation && beat.rotationToward !== undefined) {
                const degrees = Number(beat.rotationToward) || 0;
                const travelX = state.point.x - previous.point.x;
                const direction = Math.sign(travelX) || state.facing || 1;
                state.rotation = direction * degrees;
            }
            if (!hasExplicitRotation && beat.alignRotationToTravel) {
                const travelX = state.point.x - previous.point.x;
                const travelY = state.point.y - previous.point.y;
                if (travelX || travelY) {
                    const direction = Math.sign(travelX) || state.facing || 1;
                    state.rotation = direction * Math.atan2(travelY, Math.max(1e-6, Math.abs(travelX))) * 180 / Math.PI;
                }
            }
            if (!hasExplicitRotation && beat.aimBodyAt) {
                const aim = anchors.resolve(beat.aimBodyAt, { bounds: 'pivot' });
                const torso = offsetOf('part:torso', state.facing);
                const leftFoot = offsetOf('part:left-front-leg', state.facing);
                const rightFoot = offsetOf('part:right-front-leg', state.facing);
                const feetMidpoint = {
                    x: (leftFoot.x + rightFoot.x) / 2,
                    y: (leftFoot.y + rightFoot.y) / 2
                };
                const nativeX = feetMidpoint.x - torso.x;
                const nativeY = feetMidpoint.y - torso.y;
                const aimX = aim.x - previous.point.x;
                const aimY = aim.y - previous.point.y;
                if ((nativeX || nativeY) && (aimX || aimY)) {
                    const nativeAngle = Math.atan2(nativeY, nativeX);
                    const aimAngle = Math.atan2(aimY, aimX);
                    state.rotation = (aimAngle - nativeAngle) * 180 / Math.PI;
                }
            }
            // Rotation is authored data, never a pose side effect. This keeps
            // the editor's 0° truthful and makes Preview/live replayable from
            // the same BEAT graph.
            const rotationDelta = hasExplicitRotation ? 0 : beat.rotateByFacing !== undefined
                ? Math.abs(Number(beat.rotateByFacing) || 0) * (state.facing || 1)
                : beat.rotateBy !== undefined ? Number(beat.rotateBy) || 0 : 0;
            if (rotationDelta) {
                const sign = Math.sign(rotationDelta);
                const windup = Number(definition.windup) || 0;
                const recoil = Number(definition.recoil) || 0;
                const span = endAt - startAt;
                if (windup) {
                    pose.push({
                        offset: startAt + span * this.WINDUP_AT,
                        ...this.#poseFrame({ ...state, rotation: previous.rotation - sign * windup })
                    });
                }
                const swung = state.rotation + rotationDelta;
                pose.push({
                    offset: startAt + span * this.SWING_AT,
                    ...this.#poseFrame({ ...state, rotation: swung })
                });
                state.rotation = swung - sign * recoil;
            } else if (definition.hold && ![
                'rotation', 'rotationToward', 'rotateBy', 'rotateByFacing',
                'alignRotationToTravel', 'aimBodyAt', 'scaleX', 'scaleY',
                'skewX', 'skewY'
            ].some(key => beat[key] !== undefined && beat[key] !== null && beat[key] !== false)) {
                // 정지를 만든다. 같은 값을 두 프레임 적는 일을 저작자가 하지 않는다.
                // 이게 "휙! 착지!"의 멈춤을 만든다.
                pose.push({ offset: startAt + this.EPS, ...this.#poseFrame(state) });
            }
            const stompSteps = Math.max(0, Math.floor(Number(beat.stompSteps) || 0));
            if (stompSteps > 0) {
                const span = endAt - startAt;
                for (let step = 0; step < stompSteps; step += 1) {
                    const sectionStart = step / stompSteps;
                    const downAt = startAt + span * (sectionStart + .34 / stompSteps);
                    const reboundAt = startAt + span * (sectionStart + .78 / stompSteps);
                    const side = step % 2 === 0 ? -1 : 1;
                    pose.push({
                        offset: downAt,
                        ...this.#poseFrame({ ...state, rotation: side * 7, squash: 1,
                            scaleX: 1.08, scaleY: .82 })
                    });
                    pose.push({
                        offset: reboundAt,
                        ...this.#poseFrame({ ...state, rotation: side * 1.5, squash: 1,
                            scaleX: .98, scaleY: 1.04 })
                    });
                }
            }
            pose.push({
                offset: startAt,
                ...this.#poseFrame(beat.instantPose
                    ? state
                    : { ...previous, origin: beat.origin || previous.origin }),
                easing: this.easing(beat.rotationEasing)
            });
            pose.push({ offset: endAt, ...this.#poseFrame(state) });

            // ---- 판정과 음향 ----
            // 타격은 비트 시작이다. 그림과 같은 곳에서 나오므로 어긋날 수 없다.
            const damageJudgment = (Array.isArray(beat.judgments) ? beat.judgments : [])
                .find(judgment => judgment?.kind === 'damage');
            const hasImpact = Boolean(damageJudgment || beat.hit);
            const hitOffsetTicks = hasImpact
                ? Math.max(0, Math.min(Number(beat.ticks) - 1,
                    Math.round(Number(damageJudgment?.offsetTicks ?? beat.hitOffsetTicks) || 0)))
                : 0;
            if (hasImpact) {
                const policy = typeof HuntMonsterActionPolicy !== 'undefined'
                    ? HuntMonsterActionPolicy
                    : (typeof require === 'function' ? require('./HuntMonsterActionPolicy.js') : null);
                impacts.push({
                    atTicks: startTicks + hitOffsetTicks,
                    beat: beat.beat || `beat-${index}`,
                    damageScale: Number(damageJudgment?.damageScale ?? beat.damageScale) || 1,
                    targetMode: damageJudgment
                        ? (policy?.judgmentTargetMode?.(damageJudgment.target) || 'judgment-primary')
                        : beat.targetMode || 'sequential',
                    ...(beat.eventKind ? { eventKind: String(beat.eventKind) } : {})
                });
            }
            cues.push({
                atTicks: startTicks,
                beat: beat.beat || `beat-${index}`,
                audioSlot: `beat:${beat.beat || `beat-${index}`}`,
                authoredSfx: beat.sfx || null
            });
            const appendVisualCue = (fx, anchor, durationTicks, angleMode = null) => {
                if (!fx) return;
                const targetImpactFx = String(fx) === 'target-impact-dust' && hasImpact;
                visualCues.push({
                    atTicks: startTicks + (targetImpactFx ? hitOffsetTicks : 0),
                    beat: beat.beat || `beat-${index}`,
                    fx: String(fx),
                    anchor: anchor || 'monster',
                    ...((beat.targetMode || targetImpactFx)
                        ? { targetMode: beat.targetMode || 'sequential' }
                        : {}),
                    durationTicks: Math.max(1, Number(durationTicks) || Number(beat.ticks))
                    , ...(angleMode ? { angleMode: String(angleMode) } : {})
                });
            };
            appendVisualCue(beat.fx, beat.fxAnchor, beat.fxDurationTicks, beat.fxAngleMode);
            appendVisualCue(beat.fxSecondary, beat.fxSecondaryAnchor, beat.fxSecondaryDurationTicks,
                beat.fxSecondaryAngleMode);
            for (const extraFx of Array.isArray(beat.fxAdditional) ? beat.fxAdditional : []) {
                appendVisualCue(extraFx?.fx, extraFx?.anchor, extraFx?.durationTicks, extraFx?.angleMode);
            }

            timeline.push({
                beat: beat.beat || `beat-${index}`,
                startTicks,
                endTicks,
                pose: beat.pose || 'idle',
                to: beat.to || beat.at || null,
                offsetX: Number(beat.offsetX) || 0,
                offsetY: Number(beat.offsetY) || 0,
                rotation: state.rotation,
                rotationToward: beat.rotationToward === undefined ? null : Number(beat.rotationToward) || 0,
                alignRotationToTravel: Boolean(beat.alignRotationToTravel),
                continueTravel: Boolean(beat.continueTravel),
                aimBodyAt: beat.aimBodyAt || null,
                instantOpacity: Boolean(beat.instantOpacity),
                instantPose: Boolean(beat.instantPose),
                rotateByFacing: beat.rotateByFacing === undefined ? null : Number(beat.rotateByFacing) || 0,
                strideFlipTicks,
                stompSteps,
                moveEasing: beat.moveEasing || 'smooth',
                rotationEasing: beat.rotationEasing || 'smooth',
                hit: hasImpact,
                hitOffsetTicks
            });
        });

        return {
            totalTicks,
            durationMs: Math.round(totalTicks * 1000 / perSecond),
            placement: this.#tidy(placement),
            pose: this.#tidy(pose),
            facing,
            facingActive,
            impacts,
            cues,
            visualCues,
            strideWindows,
            timeline
        };
    }

    static #placementFrame(state) {
        return {
            transform: `translate(${Math.round(state.point.x)}px, ${Math.round(state.point.y)}px)`,
            opacity: state.opacity
        };
    }

    static #poseFrame(state) {
        const root = Math.sqrt(state.squash > 0 ? state.squash : 1);
        const size = state.depth > 0 ? state.depth : 1;
        const frame = {
            transform: `rotate(${state.rotation.toFixed(2)}deg) skew(${state.skewX.toFixed(2)}deg, ${state.skewY.toFixed(2)}deg) scale(${(size * root * state.scaleX).toFixed(4)}, ${(size / root * state.scaleY).toFixed(4)})`
        };
        if (state.origin) {
            if (/%/.test(String(state.origin))) frame.origin = state.origin;
            else frame.pivot = state.origin;
            // 축이 부위 이름이면 푸는 쪽이 반전을 알아야 한다. 오프셋으로 되찾게
            // 두면 비트 경계에서 어느 쪽 방향인지 갈리고, 실제로 버티는 구간
            // 끝에서 축이 30%↔70%로 튀었다. 낼 때 아는 값을 그대로 싣는다.
            frame.facing = state.facing;
        }
        if (state.filter) frame.filter = state.filter;
        return frame;
    }

    // 오프셋이 뒤로 가거나 1을 넘으면 WAAPI가 조용히 던진다. 정렬하고 잘라낸다.
    static #tidy(frames) {
        return frames
            .map(frame => ({ ...frame, offset: Math.min(1, Math.max(0, frame.offset)) }))
            .sort((a, b) => a.offset - b.offset);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntMotionCompiler;
    module.exports.HuntMotionCompiler = HuntMotionCompiler;
    module.exports.HuntMotionCompilerError = HuntMotionCompilerError;
}
if (typeof globalThis !== 'undefined') {
    globalThis.HuntMotionCompiler = HuntMotionCompiler;
    globalThis.HuntMotionCompilerError = HuntMotionCompilerError;
}

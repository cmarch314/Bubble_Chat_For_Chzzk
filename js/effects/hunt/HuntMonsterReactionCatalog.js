'use strict';

class HuntMonsterReactionCatalog {
    static PROFILE_IDS = Object.freeze(['flinch', 'knockdown', 'tail']);

    static smallMotion(label = '부위파괴[소]') {
        return [
            { beat: 'reaction', label, ticks: 3, pose: 'stretch-strong', origin: '50% 88%',
                offsetX: -12, offsetY: -8, rotation: -18, skewX: 5, scaleX: 1.06, scaleY: .94,
                moveEasing: 'snap', rotationEasing: 'snap' },
            { beat: 'recoil', label: '밀려남', ticks: 7, pose: 'land', origin: '50% 88%',
                offsetX: 42, offsetY: 18, rotation: 25, skewX: -9, scaleX: .96, scaleY: 1.06,
                moveEasing: 'decelerate', rotationEasing: 'slow-fast-slow' },
            { beat: 'brace', label: '버팀', ticks: 8, pose: 'brace', origin: '50% 88%',
                offsetX: 34, offsetY: 14, rotation: 15, skewX: -4, scaleX: .98, scaleY: 1.03,
                moveEasing: 'slow-fast-slow', rotationEasing: 'slow-fast-slow' },
            { beat: 'recover', label: '복귀', ticks: 12, pose: 'idle', origin: '50% 88%',
                offsetX: 0, offsetY: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1,
                moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ];
    }

    static largeMotion() {
        return [
            { beat: 'reaction', label: '충격', ticks: 4, pose: 'stretch-strong', origin: '50% 68%',
                offsetX: -16, offsetY: -18, rotation: -14, scaleX: 1.06, scaleY: 1.06,
                moveEasing: 'snap', rotationEasing: 'snap' },
            { beat: 'roll-1', label: '첫 회전', ticks: 11, pose: 'land', origin: '50% 68%',
                offsetX: 36, offsetY: 4, rotation: 170, scaleX: 1.04, scaleY: .94,
                moveEasing: 'accelerate', rotationEasing: 'accelerate' },
            { beat: 'roll-2', label: '두 번째 회전', ticks: 12, pose: 'land', origin: '50% 68%',
                offsetX: 126, offsetY: 32, rotation: 700, scaleX: 1.03, scaleY: .9,
                moveEasing: 'slow-fast-slow', rotationEasing: 'slow-fast-slow' },
            { beat: 'down', label: '쓰러짐', ticks: 20, pose: 'land', origin: '50% 68%',
                offsetX: 112, offsetY: 42, rotation: 720, skewX: -10, scaleX: 1.08, scaleY: .68,
                moveEasing: 'decelerate', rotationEasing: 'decelerate' },
            { beat: 'recover', label: '일어남', ticks: 13, pose: 'idle', origin: '50% 68%',
                offsetX: 0, offsetY: 0, rotation: 720, skewX: 0, scaleX: 1, scaleY: 1,
                moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ];
    }

    static knockdownMotion() {
        return [
            { beat: 'reaction', label: '넘어짐', ticks: 6, pose: 'land' },
            { beat: 'struggle-1', label: '바둥 1', ticks: 12, pose: 'land' },
            { beat: 'struggle-2', label: '바둥 2', ticks: 12, pose: 'land' },
            { beat: 'struggle-3', label: '바둥 3', ticks: 12, pose: 'land' },
            { beat: 'struggle-4', label: '바둥 4', ticks: 12, pose: 'land' },
            { beat: 'struggle-5', label: '바둥 5', ticks: 12, pose: 'land' },
            { beat: 'rise', label: '일어남', ticks: 10, pose: 'idle' }
        ];
    }

    static sleepMotion() {
        return [
            { beat: 'stagger', label: '졸음 비틀거림', ticks: 8, pose: 'brace', origin: '50% 88%',
                offsetX: 10, offsetY: 4, rotation: 8, skewX: -4, scaleX: 1.02, scaleY: .98,
                moveEasing: 'slow-fast-slow', rotationEasing: 'slow-fast-slow' },
            { beat: 'sleep-enter', label: '천천히 잠들기', ticks: 22, pose: 'land', origin: '50% 88%',
                offsetX: 24, offsetY: 30, rotation: 28, skewX: -8, scaleX: 1.06, scaleY: .68,
                moveEasing: 'decelerate', rotationEasing: 'decelerate' },
            { beat: 'held', label: '수면 유지', ticks: 15, pose: 'land', origin: '50% 88%',
                offsetX: 24, offsetY: 30, rotation: 28, skewX: -8, scaleX: 1.06, scaleY: .68,
                moveEasing: 'linear', rotationEasing: 'linear' },
            { beat: 'wake', label: '! 기상', ticks: 5, pose: 'idle', origin: '50% 88%',
                offsetX: 0, offsetY: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1,
                moveEasing: 'snap', rotationEasing: 'snap' }
        ];
    }

    static resolveSleep(monsterId) {
        return this.applyAuthoredMotion(monsterId, {
            id: 'sleep', patternId: '__reaction.sleep', visualType: 'sleeping',
            controlType: 'sleep', motion: this.sleepMotion().filter(beat => beat.beat !== 'stagger')
        });
    }

    static resolveKnockdown(monsterId, struggleCount = 5) {
        const count = Math.max(0, Math.min(5, Math.floor(Number(struggleCount) || 0)));
        const profile = this.applyAuthoredMotion(monsterId, {
            id: 'knockdown', patternId: '__reaction.knockdown',
            visualType: 'knockdown', controlType: 'knockdown', motion: this.knockdownMotion()
        });
        return { ...profile, struggleCount: count, motion: profile.motion.filter(beat => {
            const match = /^struggle-(\d+)$/.exec(String(beat.beat || ''));
            return !match || Number(match[1]) <= count;
        }) };
    }

    static resolvePitfall(monsterId, struggleCount = 6, durationTicks = 0) {
        const count = Math.max(0, Math.min(6, Math.floor(Number(struggleCount) || 0)));
        const fallback = [
            { beat: 'reaction', label: '지반 붕괴', ticks: 6, pose: 'land' },
            ...Array.from({ length: 6 }, (_, index) => ({
                beat: `held-${index + 1}`, label: `허덕임 ${index + 1}`, ticks: 12, pose: 'crouch'
            })),
            { beat: 'release', label: '탈출', ticks: 8, pose: 'idle' }
        ];
        const profile = this.applyAuthoredMotion(monsterId, {
            id: 'pitfall', patternId: '__reaction.pitfall', visualType: 'pitfall',
            controlType: 'trap', motion: fallback
        });
        const motion = profile.motion.filter(beat => {
            const match = /^held-(\d+)$/.exec(String(beat.beat || ''));
            return !match || Number(match[1]) <= count;
        });
        const authoredTicks = motion.reduce((sum, beat) => sum + Math.max(1, Number(beat.ticks) || 1), 0);
        const extraTicks = Math.max(0, Math.floor(Number(durationTicks) || 0) - authoredTicks);
        if (extraTicks > 0 && count > 0) {
            const held = motion.filter(beat => /^held-\d+$/.test(String(beat.beat || '')));
            held.forEach((beat, index) => {
                beat.ticks = Math.max(1, Number(beat.ticks) || 1)
                    + Math.floor(extraTicks / held.length)
                    + (index < extraTicks % held.length ? 1 : 0);
            });
        }
        return { ...profile, struggleCount: count, motion };
    }

    static profile(profileId) {
        const aliases = { small: 'flinch', large: 'knockdown' };
        const requested = aliases[profileId] || profileId;
        const id = this.PROFILE_IDS.includes(requested) ? requested : 'flinch';
        return {
            id,
            patternId: id === 'flinch' ? '__reaction.flinch'
                : id === 'tail' ? '__reaction.tail-sever' : '__reaction.knockdown',
            visualType: id === 'flinch' ? 'part_flinch' : (id === 'tail' ? 'tail_sever_roll' : 'part_break_topple'),
            controlType: id === 'flinch' ? 'flinch' : 'knockdown',
            motion: id === 'flinch' ? this.smallMotion()
                : id === 'tail' ? this.largeMotion() : this.knockdownMotion()
        };
    }

    static applyAuthoredMotion(monsterId, profile) {
        const monsterOverrides = globalThis.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES?.[monsterId] || {};
        const legacyPatternId = profile.id === 'tail' ? '__reaction.part-break-large'
            : profile.id === 'flinch' ? '__reaction.part-break-small' : null;
        const saved = monsterOverrides[profile.patternId]?.beats
            || (legacyPatternId ? monsterOverrides[legacyPatternId]?.beats : null);
        if (!saved) return profile;
        return {
            ...profile,
            motion: profile.motion.map((beat, index) => {
                const value = saved[beat.beat || `beat-${index + 1}`];
                if (value == null) return beat;
                return { ...beat, ...(typeof value === 'object' ? value : { ticks: value }) };
            })
        };
    }

    static defaultProfile(monsterId, partKind, airborne = false) {
        const kind = String(partKind || '').toLowerCase();
        if (/(^|[-_])tail($|[-_])/.test(kind)) return 'tail';
        if (airborne) return 'knockdown';
        const id = String(monsterId || '').toLowerCase();
        if ((id === 'diablos' || id === 'black_diablos') && /horn|back/.test(kind)) return 'flinch';
        if ((id === 'diablos' || id === 'black_diablos' || id === 'tigrex')
            && /(?:left|right)-front-leg/.test(kind)) return 'knockdown';
        return 'flinch';
    }

    static resolve(monsterId, partKind, airborne = false) {
        const overrides = globalThis.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES?.[monsterId]?.__partReactions || {};
        const requested = overrides[partKind] || this.defaultProfile(monsterId, partKind, airborne);
        return this.applyAuthoredMotion(monsterId, this.profile(requested));
    }

    // Reactions share the authored BEAT vocabulary with attacks. Renderers
    // project `motion`, while the runtime owns every audio/event tick.
    static compile(profile, options = {}) {
        if (!profile?.patternId || !Array.isArray(profile.motion) || !profile.motion.length) return null;
        const Contract = typeof HuntBeatV2Contract !== 'undefined'
            ? HuntBeatV2Contract
            : (typeof require === 'function' ? require('./HuntBeatV2Contract.js').HuntBeatV2Contract : null);
        if (!Contract) return null;
        const includeAudio = options.includeAudio !== false;
        return Contract.compile({
            id: String(profile.patternId),
            actor: 'reaction',
            backend: Contract.BACKEND,
            schemaVersion: Contract.VERSION,
            reviewStatus: 'approved',
            reactionProfile: String(profile.id || 'reaction'),
            visualType: String(profile.visualType || 'reaction'),
            controlType: String(profile.controlType || 'reaction'),
            beats: profile.motion.map((beat, index) => {
                const id = String(beat?.beat || beat?.id || `beat-${index + 1}`);
                const ticks = Math.max(1, Math.floor(Number(beat?.ticks) || 1));
                const events = includeAudio ? [{
                    id: `audio:${id}`,
                    kind: 'audio',
                    offsetTicks: 0
                }] : [];
                // The held sleep cue is authored as a real loop in the same
                // graph, not a wall-clock timeout outside the action session.
                if (includeAudio && id === 'held') {
                    for (let offsetTicks = 30; offsetTicks < ticks; offsetTicks += 30) {
                        events.push({ id: `audio:${id}:repeat-${offsetTicks}`,
                            kind: 'audio', offsetTicks });
                    }
                }
                return { ...beat, id, ticks, events };
            })
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterReactionCatalog;
if (typeof globalThis !== 'undefined') globalThis.HuntMonsterReactionCatalog = HuntMonsterReactionCatalog;

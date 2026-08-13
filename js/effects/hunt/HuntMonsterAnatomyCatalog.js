'use strict';

class HuntMonsterAnatomyCatalog {
    static TARGET_FULL_BREAK_DAMAGE_FRACTION = 0.82;
    static UNBROKEN_PART_WEIGHT = 4;
    static BROKEN_PART_WEIGHT = 0.14;
    static NON_BREAKABLE_PART_WEIGHT = 0.28;
    static SLASH_TAIL_WEIGHT = 1.65;

    // Curated review overrides sit above generated game data when the imported
    // break flag describes a damage pool rather than the visible break contract.
    static PART_OVERRIDES = Object.freeze({
        rathian: Object.freeze({
            head: Object.freeze({ breakable: true })
        }),
        rathalos: Object.freeze({
            head: Object.freeze({ breakable: true })
        }),
        gold_rathian: Object.freeze({
            head: Object.freeze({
                breakable: true,
                hitzones: Object.freeze({ slash: .22, blunt: .25, pierce: .18 }),
                breakHitzones: Object.freeze({ slash: .60, blunt: .65, pierce: .55 })
            })
        }),
        silver_rathalos: Object.freeze({
            head: Object.freeze({
                breakable: true,
                hitzones: Object.freeze({ slash: .22, blunt: .25, pierce: .18 }),
                breakHitzones: Object.freeze({ slash: .60, blunt: .65, pierce: .55 })
            })
        })
    });

    // Measured against the resolved 512x512 sprite. Long parts use a path so
    // effects can follow their actual silhouette instead of a card midpoint.
    static VISUAL_GEOMETRY = Object.freeze({
        rathian: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'left',
            parts: Object.freeze({
                head: Object.freeze({ x: .18, y: .72 }),
                torso: Object.freeze({ x: .58, y: .61 }),
                'left-wing': Object.freeze({ x: .53, y: .20 }),
                'right-wing': Object.freeze({ x: .73, y: .38 }),
                foot: Object.freeze({ x: .55, y: .82 }),
                tail: Object.freeze({
                    path: Object.freeze([
                        Object.freeze({ x: .75, y: .65 }),
                        Object.freeze({ x: .58, y: .79 }),
                        Object.freeze({ x: .39, y: .84 }),
                        Object.freeze({ x: .22, y: .78 }),
                        Object.freeze({ x: .14, y: .56 }),
                        Object.freeze({ x: .18, y: .30 }),
                        Object.freeze({ x: .31, y: .17 })
                    ])
                })
            })
        }),
        rathalos: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'left',
            parts: Object.freeze({
                head: Object.freeze({ x: .23, y: .64 }),
                torso: Object.freeze({ x: .53, y: .61 }),
                'left-wing': Object.freeze({ x: .31, y: .19 }),
                'right-wing': Object.freeze({ x: .66, y: .25 }),
                foot: Object.freeze({ x: .61, y: .70 }),
                tail: Object.freeze({
                    path: Object.freeze([
                        Object.freeze({ x: .82, y: .57 }),
                        Object.freeze({ x: .84, y: .70 }),
                        Object.freeze({ x: .73, y: .84 }),
                        Object.freeze({ x: .53, y: .89 }),
                        Object.freeze({ x: .32, y: .86 }),
                        Object.freeze({ x: .17, y: .84 })
                    ])
                })
            })
        }),
        legiana: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'front',
            parts: Object.freeze({
                head: Object.freeze({ x: .52, y: .27 }),
                torso: Object.freeze({ x: .52, y: .55 }),
                'left-wing': Object.freeze({ x: .25, y: .42 }),
                'right-wing': Object.freeze({ x: .78, y: .42 }),
                tail: Object.freeze({ x: .53, y: .84 })
            })
        }),
        paolumu: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'front',
            parts: Object.freeze({
                head: Object.freeze({ x: .49, y: .54 }),
                torso: Object.freeze({ x: .49, y: .48 }),
                'left-wing': Object.freeze({ x: .20, y: .28 }),
                'right-wing': Object.freeze({ x: .80, y: .28 }),
                tail: Object.freeze({ x: .69, y: .79 })
            })
        }),
        bazelgeuse: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'front',
            parts: Object.freeze({
                head: Object.freeze({ x: .50, y: .70 }),
                mouth: Object.freeze({ x: .50, y: .58 }),
                torso: Object.freeze({ x: .50, y: .39 }),
                'left-wing': Object.freeze({ x: .23, y: .45 }),
                'right-wing': Object.freeze({ x: .77, y: .45 }),
                tail: Object.freeze({ x: .50, y: .20 })
            })
        }),
        diablos: Object.freeze({
            // The reviewed front-facing sprite keeps its body mass around the
            // image centre. BEAT rotations (notably the reversed rear X-tail
            // follow-up) need this authored torso pivot; falling back to a
            // missing part aborts the entire animation before playback starts.
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'front',
            parts: Object.freeze({
                head: Object.freeze({ x: .50, y: .64 }),
                torso: Object.freeze({ x: .50, y: .50 }),
                'left-wing': Object.freeze({ x: .24, y: .42 }),
                'right-wing': Object.freeze({ x: .76, y: .42 }),
                'left-front-leg': Object.freeze({ x: .32, y: .76 }),
                'right-front-leg': Object.freeze({ x: .68, y: .76 }),
                tail: Object.freeze({ x: .50, y: .20 })
            })
        }),
        tigrex: Object.freeze({
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'left',
            parts: Object.freeze({
                head: Object.freeze({ x: .43, y: .68 }),
                mouth: Object.freeze({ x: .43, y: .72 }),
                torso: Object.freeze({ x: .52, y: .54 }),
                'left-front-leg': Object.freeze({ x: .25, y: .28 }),
                'right-front-leg': Object.freeze({ x: .72, y: .70 }),
                tail: Object.freeze({ x: .62, y: .28 })
            })
        }),
        nargacuga: Object.freeze({
            // 머리는 중앙 하단, 앞발은 하단 좌우, 앞발의 칼날(cutwing)은 그 위로
            // 좌우 면 전체를 차지한다. 몸통은 중앙, 꼬리는 우상단에서 몸통과
            // 이어져 좌상단을 향해 뻗는다.
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'front',
            parts: Object.freeze({
                head: Object.freeze({ x: .50, y: .82 }),
                torso: Object.freeze({ x: .50, y: .52 }),
                'left-foreleg': Object.freeze({ x: .29, y: .86 }),
                'right-foreleg': Object.freeze({ x: .71, y: .86 }),
                'left-wing': Object.freeze({ x: .15, y: .58 }),
                'right-wing': Object.freeze({ x: .85, y: .58 }),
                tail: Object.freeze({ x: .30, y: .17 })
            })
        }),
        barioth: Object.freeze({
            // 원본 스프라이트는 머리가 중앙 상단에서 왼쪽을 본다. 꼬리는
            // 우상단으로 솟고, 날개 바깥판과 그 아래로 뻗은 앞발은 별개다.
            sourceSize: Object.freeze({ width: 512, height: 512 }),
            baseFacing: 'left',
            parts: Object.freeze({
                head: Object.freeze({ x: .49, y: .24 }),
                mouth: Object.freeze({ x: .41, y: .23 }),
                torso: Object.freeze({ x: .50, y: .53 }),
                'left-wing': Object.freeze({ x: .18, y: .48 }),
                'right-wing': Object.freeze({ x: .82, y: .48 }),
                'left-front-leg': Object.freeze({ x: .31, y: .81 }),
                'right-front-leg': Object.freeze({ x: .72, y: .81 }),
                tail: Object.freeze({ x: .70, y: .15 })
            })
        })
    });

    static TAIL_SEVERABLE_IDS = new Set([
        'anjanath','azure_rathalos','rathalos','rathian','pink_rathian','gold_rathian','silver_rathalos',
        'bazelgeuse','seething_bazelgeuse','diablos','black_diablos','deviljho','savage_deviljho','dodogama',
        'great_girros','great_jagras','jyuratodus','kushala_daora','lavasioth',
        'lunastra','teostra','nergigante','ruiner_nergigante','odogaron','ebony_odogaron',
        'pukei_pukei','coral_pukei_pukei','radobaan','tobi_kadachi','viper_tobi_kadachi','uragaan',
        'vaal_hazak','blackveil_vaal_hazak','xenojiiva','safijiiva','acidic_glavenus','glavenus','alatreon',
        'banbaro','barioth','frostfang_barioth','brachydios','raging_brachydios','tigrex','brute_tigrex',
        'fatalis','namielle','nargacuga','yian_garuga','scarred_yian_garuga','zinogre','stygian_zinogre','velkhana',
        'gore_magala','shagaru_magala','valstrax','crimson_glow_valstrax','magnamalo','malzeno','primordial_malzeno',
        'mizutsune','astalos','seregios','chameleos','akantor','ukanlos','amatsu','lagiacrus','royal_ludroth'
    ]);

    static REVIEWED_VARIANT_BASES = Object.freeze({
        azure_rathalos: 'rathalos',
        silver_rathalos: 'rathalos',
        pink_rathian: 'rathian',
        gold_rathian: 'rathian',
        black_diablos: 'diablos',
        shrieking_legiana: 'legiana',
        nightshade_paolumu: 'paolumu',
        seething_bazelgeuse: 'bazelgeuse',
        brute_tigrex: 'tigrex',
        frostfang_barioth: 'barioth'
    });

    static normalize(value) {
        return String(value || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    static source() {
        if (typeof HUNT_WILDS_MONSTER_ANATOMY !== 'undefined') return HUNT_WILDS_MONSTER_ANATOMY;
        if (typeof window !== 'undefined') return window.HUNT_WILDS_MONSTER_ANATOMY || { monsters: {} };
        return { monsters: {} };
    }

    static reviewedSource() {
        if (typeof HUNT_REVIEWED_MONSTER_ANATOMY !== 'undefined') return HUNT_REVIEWED_MONSTER_ANATOMY;
        if (typeof window !== 'undefined') return window.HUNT_REVIEWED_MONSTER_ANATOMY || { monsters: {} };
        if (typeof require === 'function') return require('./data/ReviewedMonsterAnatomy.js');
        return { monsters: {} };
    }

    static visualGeometry(monster) {
        const id = this.normalize(monster?.id || monster?.nameEN || monster?.name);
        const baseId = this.REVIEWED_VARIANT_BASES[id];
        const overrides = typeof HUNT_MONSTER_VISUAL_GEOMETRY_OVERRIDES !== 'undefined'
            ? HUNT_MONSTER_VISUAL_GEOMETRY_OVERRIDES
            : (typeof require === 'function' ? require('./data/MonsterVisualGeometryOverrides.generated.js') : {});
        return overrides[id] || overrides[baseId] || this.VISUAL_GEOMETRY[id] || this.VISUAL_GEOMETRY[baseId] || null;
    }

    static baseFacing(monster) {
        const id = this.normalize(monster?.id || monster?.nameEN || monster?.name);
        if (['rathalos', 'azure_rathalos', 'silver_rathalos',
            'rathian', 'pink_rathian', 'gold_rathian'].includes(id)) return 'left';
        if (['diablos', 'black_diablos'].includes(id)) return 'front';
        return this.visualGeometry(monster)?.baseFacing || 'front';
    }

    static visualPoint(monster, partKind, sequence = 0) {
        const geometry = this.visualGeometry(monster);
        if (!geometry) return null;
        const rawKind = String(partKind || '').toLowerCase();
        let key = rawKind;
        if (/mouth|muzzle/.test(rawKind)) key = 'mouth';
        else if (/head|horn|chin/.test(rawKind)) key = 'head';
        else if (/tail/.test(rawKind)) key = 'tail';
        else if (/left.*wing|wing.*left/.test(rawKind)) key = 'left-wing';
        else if (/right.*wing|wing.*right/.test(rawKind)) key = 'right-wing';
        else if (/wing/.test(rawKind)) key = Number(sequence || 0) % 2 ? 'right-wing' : 'left-wing';
        else if (/left.*(?:front.*)?(?:foot|leg|claw)|(?:foot|leg|claw).*left/.test(rawKind)) key = 'left-front-leg';
        else if (/right.*(?:front.*)?(?:foot|leg|claw)|(?:foot|leg|claw).*right/.test(rawKind)) key = 'right-front-leg';
        else if (/foot|leg|claw/.test(rawKind)) key = 'foot';
        else if (/torso|body|back|chest/.test(rawKind)) key = 'torso';
        // 같은 부위를 몬스터마다 다르게 적어뒀다. 티가렉스는 left-front-leg,
        // 나르가쿠르가는 left-foreleg다. 정규화가 앞의 철자로만 떨어지므로
        // 나르가의 앞발 앵커는 여기로 한 번도 도달한 적이 없었다 — null이 조용히
        // 돌아가 회전축이 이미지 중앙으로 떨어졌다. 철자를 서로 대체 가능하게 둔다.
        const alternates = [key,
            key.replace('front-leg', 'foreleg'),
            key.replace('foreleg', 'front-leg')];
        const part = alternates.map(name => geometry.parts[name]).find(Boolean);
        if (!part) return null;
        key = alternates.find(name => geometry.parts[name]);
        if (Array.isArray(part.path) && part.path.length) {
            const index = Math.abs(Math.trunc(Number(sequence) || 0)) % part.path.length;
            return { ...part.path[index], kind: key, pathIndex: index };
        }
        return { x: part.x, y: part.y, kind: key };
    }

    static FLYING_IDS = new Set([
        'rathalos','azure_rathalos','silver_rathalos','rathian','pink_rathian','gold_rathian',
        'legiana','shrieking_legiana','paolumu','nightshade_paolumu','bazelgeuse','seething_bazelgeuse',
        'kushala_daora','namielle','alatreon','fatalis','astalos','seregios','valstrax','crimson_glow_valstrax'
    ]);

    static FORELEG_TOPPLE_IDS = new Set([
        'barioth','frostfang_barioth','tigrex','brute_tigrex','nargacuga','yian_garuga','scarred_yian_garuga',
        'anjanath','deviljho','savage_deviljho','zinogre','stygian_zinogre','odogaron','ebony_odogaron',
        'nergigante','ruiner_nergigante','magnamalo','malzeno','primordial_malzeno'
    ]);

    static HEAD_TOPPLE_IDS = new Set([
        'uragaan','radobaan','barroth','brachydios','raging_brachydios','nergigante','ruiner_nergigante'
    ]);

    static find(monster) {
        const source = this.source().monsters || {};
        const candidates = [monster?.id, monster?.nameEN, monster?.name].map(this.normalize);
        const reviewed = this.reviewedSource().monsters || {};
        for (const id of candidates) {
            if (id && reviewed[id]) {
                return {
                    ...reviewed[id],
                    parts: reviewed[id].parts.map(part => ({
                        ...part,
                        hitzones: { ...(part.hitzones || {}) }
                    }))
                };
            }
            const baseId = this.REVIEWED_VARIANT_BASES[id];
            if (id && baseId && reviewed[baseId]) {
                const base = reviewed[baseId];
                return {
                    ...base,
                    id,
                    tailSeverable: this.TAIL_SEVERABLE_IDS.has(id),
                    evidence: {
                        ...(base.evidence || {}),
                        variantOf: baseId,
                        inheritance: 'reviewed-world-family'
                    },
                    parts: base.parts.map(part => ({
                        ...part,
                        id: `${id}:${String(part.kind || 'part')}`,
                        health: Math.round(Number(part.health || 0) * 1.08),
                        hitzones: { ...(part.hitzones || {}) }
                    }))
                };
            }
        }
        for (const id of candidates) {
            if (id && source[id]) return { ...source[id], tailSeverable: this.TAIL_SEVERABLE_IDS.has(id) };
        }
        const id = candidates.find(Boolean);
        if (!id) return null;
        return this.fallbackProfile(id);
    }

    static fallbackProfile(id) {
        const flying = this.FLYING_IDS.has(id);
        const forelegTopple = this.FORELEG_TOPPLE_IDS.has(id);
        const parts = [
            { id: `${id}:head`, kind: 'head', health: 620, breakable: true, hitzones: { slash: .55, blunt: .62, pierce: .48 } },
            { id: `${id}:torso`, kind: 'torso', health: 900, breakable: false, hitzones: { slash: .32, blunt: .32, pierce: .28 } }
        ];
        if (id === 'diablos' || id === 'black_diablos') {
            parts.splice(0, 1,
                { id: `${id}:left-horn`, kind: 'left-horn', health: 310, breakable: true, hitzones: { slash: .55, blunt: .62, pierce: .48 } },
                { id: `${id}:right-horn`, kind: 'right-horn', health: 310, breakable: true, hitzones: { slash: .55, blunt: .62, pierce: .48 } }
            );
        }
        if (flying) {
            parts.push(
                { id: `${id}:left-wing`, kind: 'left-wing', health: 460,
                    breakable: !['diablos', 'black_diablos'].includes(id), hitzones: { slash: .44, blunt: .40, pierce: .48 } },
                { id: `${id}:right-wing`, kind: 'right-wing', health: 460,
                    breakable: !['diablos', 'black_diablos'].includes(id), hitzones: { slash: .44, blunt: .40, pierce: .48 } }
            );
        } else {
            const legKind = forelegTopple ? 'front-leg' : 'leg';
            parts.push(
                { id: `${id}:left-${legKind}`, kind: `left-${legKind}`, health: 500, breakable: true, hitzones: { slash: .42, blunt: .44, pierce: .38 } },
                { id: `${id}:right-${legKind}`, kind: `right-${legKind}`, health: 500, breakable: true, hitzones: { slash: .42, blunt: .44, pierce: .38 } }
            );
        }
        if (this.TAIL_SEVERABLE_IDS.has(id)) {
            parts.push({ id: `${id}:tail`, kind: 'tail', health: 560, breakable: false, hitzones: { slash: .48, blunt: .30, pierce: .40 } });
        }
        return {
            id, baseHealth: 5000, tailSeverable: this.TAIL_SEVERABLE_IDS.has(id),
            evidence: flying ? 'species-archetype:flying-wyvern' : 'species-archetype:grounded-body-plan', parts
        };
    }

    static breakReaction(monsterId, partKind, airborne = false) {
        const id = this.normalize(monsterId);
        const kind = String(partKind || '').toLowerCase();
        const catalog = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog
            : (typeof require === 'function' ? require('./HuntMonsterReactionCatalog.js') : null);
        if (catalog) {
            const profile = catalog.resolve(id, kind, airborne);
            const durationTicks = profile.motion.reduce((sum, beat) => sum + Number(beat.ticks || 0), 0);
            return {
                type: airborne ? 'aerial_topple' : profile.controlType,
                visualType: profile.visualType,
                durationTicks,
                reactionProfile: profile.id,
                motion: profile.motion,
                label: profile.id === 'flinch'
                    ? '소경직'
                    : (profile.id === 'tail' ? '꼬짤경직' : '대경직')
            };
        }
        const tailSever = /tail/.test(kind);
        if (airborne) {
            return {
                type: 'aerial_topple',
                visualType: tailSever ? 'tail_sever_roll' : 'part_break_topple',
                durationTicks: 105,
                label: tailSever ? '꼬리 절단 격추 대경직' : '부위 파괴 격추 대경직'
            };
        }
        if (tailSever) {
            return {
                type: 'tail_sever_roll',
                visualType: 'tail_sever_roll',
                durationTicks: 60,
                label: '꼬리 절단 나뒹굴기'
            };
        }
        if ((id === 'diablos' || id === 'black_diablos') && /horn/.test(kind)) {
            return {
                type: 'flinch',
                visualType: 'part_flinch',
                durationTicks: 30,
                label: '뿔 파괴 경직'
            };
        }
        if ((id === 'diablos' || id === 'black_diablos') && /back/.test(kind)) {
            return {
                type: 'flinch',
                visualType: 'part_flinch',
                durationTicks: 24,
                label: '등 파괴 경직'
            };
        }
        if ((id === 'diablos' || id === 'black_diablos') && /(?:left|right)-front-leg/.test(kind)) {
            return {
                type: 'knockdown',
                visualType: 'part_break_topple',
                durationTicks: 80,
                label: '앞발 파괴 대경직'
            };
        }
        if (id === 'tigrex' && /(?:left|right)-front-leg/.test(kind)) {
            return {
                type: 'knockdown',
                visualType: 'part_break_topple',
                durationTicks: 80,
                label: '앞발 파괴 대경직'
            };
        }
        return {
            type: 'part_break_topple',
            visualType: 'part_break_topple',
            durationTicks: 40,
            label: '부위 파괴 넘어짐'
        };
    }

    static flinchReaction(monsterId, partKind) {
        const id = this.normalize(monsterId);
        if (id !== 'diablos' && id !== 'black_diablos') return null;
        const kind = String(partKind || '').toLowerCase();
        return {
            type: 'flinch',
            visualType: 'part_flinch',
            durationTicks: /horn|head/.test(kind) ? 18 : 14,
            label: `${kind || 'part'} 누적 경직`
        };
    }

    static partDisplaySlots(parts) {
        const catalog = typeof HuntMonsterArchetypeCatalog !== 'undefined'
            ? HuntMonsterArchetypeCatalog
            : (typeof require === 'function' ? require('./HuntMonsterArchetypeCatalog.js') : null);
        return catalog ? catalog.partDisplaySlots(parts) : [];
    }

    static createPartState(profile) {
        if (!profile) return [];
        const monsterId = this.normalize(profile.id || profile.nameEN || profile.name);
        const overrides = this.PART_OVERRIDES[monsterId] || {};
        return (profile.parts || []).filter(part => Number(part.health) > 0).map(part => {
            const override = overrides[String(part.kind || '').toLowerCase()] || {};
            return {
                id: part.id,
                kind: part.kind,
                maxHealth: Number(part.health),
                health: Number(part.health),
                breakable: Boolean(override.breakable ?? part.breakable),
                severable: Boolean(profile.tailSeverable && /(^|-)tail($|-)/.test(part.kind)),
                severed: false,
                broken: false,
                damageAccumulated: 0,
                flinchHealth: ['diablos', 'black_diablos'].includes(monsterId)
                    ? Math.max(1, Number(part.flinchHealth || part.health))
                    : Math.max(0, Number(part.flinchHealth || 0)),
                flinchAccumulated: 0,
                repeatToppleHealthMultiplier: Number(part.repeatToppleHealthMultiplier || 0),
                postBreakDamageAccumulated: 0,
                essence: part.essence || null,
                hitzones: { ...(override.hitzones || part.hitzones || {}) },
                breakHitzones: override.breakHitzones
                    ? { ...override.breakHitzones }
                    : null
            };
        });
    }

    static damageTypeForWeapon(weapon) {
        if (weapon?.damageTypeOverride) return weapon.damageTypeOverride;
        if (weapon?.id === 'hammer' || weapon?.id === 'hunting_horn') return 'blunt';
        if (weapon?.type === 'ranged') return 'pierce';
        return 'slash';
    }

    static choosePart(parts, damageType, random = Math.random, weightModifier = null) {
        // Broken parts remain hittable in the original games; only a severed tail
        // leaves the target pool. This also lets blunt weapons keep pursuing the head.
        const candidates = (parts || []).filter(part => !part.severed);
        if (!candidates.length) return null;
        const weighted = candidates.map(part => ({
            part,
            weight: Math.max(0.05, Number(part.hitzones?.[damageType] || 0.05))
                * ((part.breakable || part.severable) && !part.broken
                    ? this.UNBROKEN_PART_WEIGHT
                    : part.broken
                        ? this.BROKEN_PART_WEIGHT
                        : this.NON_BREAKABLE_PART_WEIGHT)
                * (damageType === 'blunt' && /(^|[-_])(head|horn|chin)([-_]|$)/.test(part.kind) ? 4.5 : 1)
                * (damageType === 'slash' && part.severable ? this.SLASH_TAIL_WEIGHT : 1)
                * (damageType !== 'slash' && part.severable ? 0.02 : 1)
                * Math.max(0.1, Number(weightModifier?.(part) || 1))
        }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = Math.max(0, Math.min(0.999999, Number(random()) || 0)) * total;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return entry.part;
        }
        return weighted[weighted.length - 1].part;
    }

    static partDamageScale(parts, monsterMaxHp) {
        const totalBreakHealth = (parts || [])
            .filter(part => part && (part.breakable || part.severable))
            .reduce((sum, part) => sum + Math.max(0, Number(part.maxHealth || 0)), 0);
        const hp = Math.max(1, Number(monsterMaxHp || 1));
        if (totalBreakHealth <= 0) return 0;
        return totalBreakHealth / (hp * this.TARGET_FULL_BREAK_DAMAGE_FRACTION);
    }

    static applyPartDamage(parts, weapon, rawDamage, scale, random = Math.random, weightModifier = null) {
        const damageType = this.damageTypeForWeapon(weapon);
        const part = this.choosePart(parts, damageType, random, weightModifier);
        if (!part) return null;
        const hitzone = Math.max(0, Number(part.hitzones?.[damageType] || 0));
        const canDamage = !part.severable || damageType === 'slash';
        // The incoming action damage has already been resolved. Hitzone remains
        // important for target preference and bounce, but multiplying it again
        // here made part durability far outlive the monster's real combat life.
        const hitzonePartRate = 0.82 + Math.min(1, hitzone) * 0.36;
        const applied = canDamage
            ? Math.max(0, Number(rawDamage) || 0) * Math.max(0, Number(scale) || 0) * hitzonePartRate
            : 0;
        const wasBroken = part.broken;
        const previousHitzones = { ...(part.hitzones || {}) };
        const repeatThreshold = Number(part.maxHealth || part.health || 0)
            * Math.max(1, Number(part.repeatToppleHealthMultiplier || 0));
        part.damageAccumulated += applied;
        part.health = Math.max(0, part.health - applied);
        if ((part.breakable || part.severable) && part.health <= 0 && !part.breakPending) part.broken = true;
        if (part.severable && part.broken) part.severed = true;
        if (!wasBroken && part.broken && part.breakHitzones) {
            part.hitzones = { ...part.breakHitzones };
        }
        const flinchThreshold = Math.max(0, Number(part.flinchHealth || 0));
        let newlyFlinched = false;
        if (flinchThreshold > 0 && applied > 0) {
            part.flinchAccumulated = Number(part.flinchAccumulated || 0) + applied;
            if (part.flinchAccumulated >= flinchThreshold) {
                part.flinchAccumulated %= flinchThreshold;
                newlyFlinched = !(!wasBroken && part.broken);
            }
        }
        let repeatedTopple = false;
        if (wasBroken && repeatThreshold > 0) {
            part.postBreakDamageAccumulated = Number(part.postBreakDamageAccumulated || 0) + applied;
            if (part.postBreakDamageAccumulated >= repeatThreshold) {
                part.postBreakDamageAccumulated -= repeatThreshold;
                repeatedTopple = true;
            }
        }
        return { part, damageType, hitzone, applied, previousHitzones,
            newlyBroken: !wasBroken && part.broken, newlySevered: !wasBroken && part.severed,
            newlyFlinched, repeatedTopple };
    }

    static breakAudioSize(result = {}, reaction = {}) {
        return result.newlySevered || String(reaction.type || 'flinch') !== 'flinch'
            ? 'large'
            : 'small';
    }

    static breakAudioPatternId(size = 'small') {
        return `__reaction.part-break-${size === 'large' ? 'large' : 'small'}`;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterAnatomyCatalog;
else window.HuntMonsterAnatomyCatalog = HuntMonsterAnatomyCatalog;

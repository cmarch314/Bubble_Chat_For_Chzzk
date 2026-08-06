const HuntMonsterAnimationTiming = typeof HuntAtbConfig !== 'undefined'
    ? HuntAtbConfig
    : (typeof require === 'function' ? require('./HuntAtbConfig.js') : null);

class HuntMonsterAnimationCatalog {
    static resolve(pattern = {}, attackName = '', attackType = '', monster = null) {
        const text = [pattern.id, pattern.name, attackName, pattern.sourceActionClass, ...(pattern.tags || [])]
            .filter(Boolean).join(' ').toLowerCase();
        const has = re => re.test(text);
        const ultimate = pattern.type === 'ultimate' || (pattern.tags || []).includes('ultimate');
        const rig = this.resolveRig(monster);
        const delivery = this.resolveDelivery(pattern, attackName);
        const patternId = String(pattern.id || '').toLowerCase();
        const authoredProfile = String(pattern.animationProfile || '');
        if (authoredProfile) {
            // Reviewed kits may use semantic profile names, but the runtime must
            // resolve them onto a motion class that actually exists. Keeping
            // this mapping here prevents a typo or a new kit from silently
            // producing a motionless attack.
            const authoredRuntimeProfiles = {
                'aerial-sweep': 'lateral-sweep',
                'aerial-dive-return': 'aerial-dive',
                'aerial-slam': 'aerial-dive',
                'aerial-dive-explosion': 'aerial-dive',
                'ground-charge-chain': 'ground-charge-zigzag',
                'agile-leap-chain': 'pounce-chain',
                'low-glide-sweep': 'rathalos-glide'
            };
            const authoredDurations = {
                'burrow-enter': 1250,
                'burrow-emerge': 1450,
                'tail-sweep': 2480,
                'tail-sweep-double': 3680,
                'ground-charge': 1900,
                'ground-charge-double': 9120,
                'ground-charge-triple': 7800,
                'aerial-charge-cross': 3200,
                'horn-uppercut': 2240,
                'horn-sweep-contact': 1850,
                'side-tackle-contact': 2400,
                'tail-slam-rock': 2720,
                'rathalos-bite-contact': 2000,
                'rathalos-rush-bite': 3200,
                'rathalos-fireball': 1800,
                'rathalos-triple-fireball': 3000,
                'rathalos-step-fireball': 3800,
                'rathalos-backstep-fireball': 2600,
                'rathalos-claw-dive': 3600,
                'rathalos-air-kick-combo': 3800,
                'rathalos-tail-sweep-double': 3400,
                'rathalos-flame-sweep': 4100,
                'rathalos-stomp': 2700,
                'rathalos-glide': 4200,
                'rathian-triple-fireball': 3600,
                'rathian-tail-sweep-double': 4200,
                'rathian-ground-charge': 3000,
                'rathian-somersault': 3040,
                'rathian-somersault-double': 5120,
                'rathian-bite-somersault': 5500,
                'rathian-somersault-glide': 6500,
                'rathian-glide': 4000,
                'rath-flight-stagger': 5000,
                'rath-flight-wobble': 3000,
                'aerial-sweep': 2800,
                'aerial-dive-return': 3400,
                'aerial-slam': 3000,
                'aerial-dive-explosion': 3900,
                'ground-charge-chain': 5200,
                'agile-leap-chain': 3600,
                'low-glide-sweep': 4000
            };
            // A `*-tail-cross` profile keeps its own dedicated motion class instead
            // of collapsing into the shared spinning tail-sweep-double, so an
            // X-shaped rear tail whip can be authored independently of the sweep.
            const isTailCrossProfile = /tail-cross$/i.test(authoredProfile);
            const runtimeProfile = authoredRuntimeProfiles[authoredProfile] || authoredProfile;
            const anchor = authoredProfile.includes('burrow-enter') ? 'center'
                : authoredProfile.includes('sweep') ? 'sweep'
                : 'target';
            return this.profile(
                runtimeProfile,
                ultimate,
                Number(pattern.animationDurationMs || authoredDurations[authoredProfile] || (isTailCrossProfile ? 3200 : 1050)),
                anchor,
                rig,
                delivery,
                pattern
            );
        }

        if (/(?:^|\.)(?:horn_uppercut)$/.test(patternId)) {
            return this.profile('horn-uppercut', ultimate, 2240, 'target', rig);
        }
        if (/(?:^|\.)(?:tail_sweep)$/.test(patternId)) {
            const doubleSweep = (pattern.tags || []).includes('double-sweep');
            return this.profile(doubleSweep ? 'tail-sweep-double' : 'tail-sweep', ultimate, doubleSweep ? 3680 : 2480, 'sweep', rig);
        }
        if (pattern.chargeMode === 'wide' || (pattern.tags || []).includes('wide-charge')) {
            return this.profile('aerial-charge-cross', ultimate, 3200, 'sweep', rig);
        }
        if (has(/포효|울부짖|괴성|함성|roar|howl|scream/)) return this.profile('roar', ultimate, 1050, 'center', rig);
        if (has(/burrow-enter|지중 잠행|地中潜行/)) return this.profile('burrow-enter', ultimate, 1250, 'center', rig);
        if (has(/burrow-emerge|지중 급습|地中急襲/)) return this.profile('burrow-emerge', ultimate, 1450, 'target', rig);
        if (has(/잠복|지중|땅속|굴착|burrow|underground/)) return this.profile('burrow-enter', ultimate, 1250, 'center', rig);
        if (has(/공중|비행|활공|급강하|강습|낙하|dive|aerial|flight|ambush/)) return this.profile('aerial-dive', ultimate, 1450, 'target', rig);
        if (has(/꼬리.*(회전|휘두|휩쓸|치기)|회전.*꼬리|tail.*(spin|sweep|slam)/)) {
            return this.profile((pattern.tags || []).includes('double-sweep') ? 'tail-sweep-double' : 'tail-sweep', ultimate, (pattern.tags || []).includes('double-sweep') ? 1550 : 1100, 'sweep', rig);
        }
        if (has(/horn_sweep|연속.*뿔.*휘두|連続角振り/)) {
            return this.profile('horn-sweep-contact', ultimate, 1850, 'target', rig);
        }
        if (!(pattern.tags || []).includes('charge') && has(/휩쓸|쓸기|가로지르|횡단|sweep|strafe/)) return this.profile('lateral-sweep', ultimate, 1500, 'sweep', rig);
        if (has(/도약|점프|뛰어|내려찍|찍기|프레스|지진|slam|leap|jump|stomp|press/)) return this.profile('leap-slam', ultimate, 1150, 'target', rig);
        if (has(/회전|구르기|몸통.*휩쓸|roll|spin/)) return this.profile('body-spin', ultimate, 1050, 'sweep', rig);
        if ((pattern.tags || []).includes('charge') || has(/돌진|들이받|박치기|진격|쇄도|charge|rush|tackle|ram/)) {
            const crossScreen = (pattern.tags || []).includes('cross-charge');
            const chain = crossScreen && has(/지그재그|삼연|연쇄|연속|폭주|triple|chain|zigzag|multi-hit/);
            return this.profile(chain ? 'ground-charge-zigzag' : crossScreen ? 'ground-charge-cross' : 'ground-charge', ultimate, chain ? 2450 : crossScreen ? 2050 : 1900, 'target', rig);
        }
        if (has(/연속|연계|난무|콤보|combo|chain|multi-hit/) && has(/발톱|물기|할퀴|claw|bite|strike|attack/)) return this.profile('pounce-chain', ultimate, 1600, 'sweep', rig);
        if (has(/브레스|분사|방출|수류|화염구|포환|사격|레이저|광선|breath|beam|laser|projectile|shot/)) return this.profile('ranged-cast', ultimate, 1250, 'target', rig, delivery);
        if (has(/폭발|대폭발|초신성|폭풍|회오리|용오름|지반|eruption|nova|explosion|storm|tornado/)) return this.profile('area-burst', ultimate, 1350, 'center', rig);
        if (has(/쳐올리|올려치|uppercut/)) return this.profile('horn-uppercut', ultimate, 1050, 'target', rig);
        if (has(/물기|할퀴|베기|찌르기|앞발|육탄|뿔|bite|claw|slash|stab|horn/)) return this.profile('close-strike', ultimate, 1050, 'target', rig);
        if (attackType === 'elemental') return this.profile('ranged-cast', ultimate, 1250, 'target', rig, delivery);
        return this.profile(ultimate ? 'area-burst' : 'close-strike', ultimate, ultimate ? 1350 : 850, 'target', rig);
    }

    static resolveDelivery(pattern = {}, attackName = '') {
        if (pattern.delivery) return pattern.delivery;
        const text = [attackName, pattern.name, pattern.sourceActionClass, pattern.sourceMoveNameJA, ...(pattern.tags || [])]
            .filter(Boolean).join(' ');
        if (/毒霧|독무|독안개|poison\s*mist|mist|gas/i.test(text)) return 'gas';
        if (/laser|beam|waterpressure|レーザー|ビーム|광선|레이저|고압\s*수류/i.test(text)) return 'beam';
        if (/fireball|bullet|shell|shoot|ball|火球|弾|탄환|화염구|포말/i.test(text)) return 'projectile';
        if (/flamethrow|continuous|sweep|ブレス|분사|방출|브레스/i.test(text)) return 'gas';
        return pattern.type === 'projectile' || pattern.tags?.includes('projectile') ? 'projectile' : 'gas';
    }

    static resolveRig(monster = null) {
        const skeleton = Array.isArray(monster?.skeleton) ? monster.skeleton.join(' ') : '';
        const species = String(monster?.species || '');
        const monsterId = String(monster?.id || '');
        const text = `${skeleton} ${species} ${monsterId}`.toLowerCase().replace(/[-_]+/g, ' ');
        const evidence = skeleton ? 'installed-skeleton' : species ? 'species-morphology' : 'unresolved';
        let id = 'generic';
        if (/machine/.test(text)) id = 'machine';
        else if (/carapaceon|temnoceran|neopteron|crab|insect/.test(text)) id = 'arthropod';
        else if (/cephalopod|octop|mollusk/.test(text)) id = 'cephalopod';
        else if (/leviathan|snake|serpent|piscine|\bfish\b/.test(text)) id = 'serpentine';
        else if (/flying wyvern|bird wyvern|wingdrake|aerial|arial|arkveld|rathalos/.test(text)) id = 'winged';
        else if (/fanged beast|fanged wyvern|amphibian|doshaguma|odogaron/.test(text)) id = 'quadruped';
        else if (/elder dragon|zoh shia/.test(text)) id = 'elder';
        else if (/brute wyvern|relict|fulgur anjanath/.test(text)) id = 'bipedal';
        else if (/herbivore/.test(text)) id = 'herbivore';
        return Object.freeze({ id, evidence });
    }

    // VISUAL_DURATION_SCALE(1.25)은 틱 시스템 이전에 "감으로" 적어둔 길이를
    // 실제 재생 시간으로 늘려주기 위한 보정이다. 그런데 movement.ticks에서
    // 파생된 길이(animationDurationMs === ticks * 100)에 이걸 다시 곱하면
    // 애니메이션이 자기 틱 창보다 25% 길어진다. 턴이 끝나면 모션 클래스가
    // 제거되므로 그 25%가 잘려나가고, 마무리 동작 없이 뚝 끊긴 뒤 제자리로
    // 순간이동한 것처럼 보인다(3연 런지 1800ms, 3연 급습 1650ms 손실).
    // 이미 실시간 단위인 길이는 그대로 쓴다. monster-timing-unification-plan.md INV-4.
    static isTickDerivedDuration(pattern, duration) {
        const ticks = Number(pattern?.movement?.ticks || 0);
        const ticksPerSecond = Number(HuntMonsterAnimationTiming?.TICKS_PER_SECOND || 10);
        return ticks > 0 && Math.round(duration) === Math.round(ticks * 1000 / ticksPerSecond);
    }

    static profile(id, ultimate, duration, aim, rig = this.resolveRig(), delivery = null, pattern = null) {
        const scaledDuration = HuntMonsterAnimationTiming?.scaleVisualDurationMs
            && !this.isTickDerivedDuration(pattern, duration)
            ? HuntMonsterAnimationTiming.scaleVisualDurationMs(duration)
            : duration;
        return Object.freeze({ id, ultimate: Boolean(ultimate), duration: scaledDuration, aim, rig, delivery });
    }
}

if (typeof window !== 'undefined') window.HuntMonsterAnimationCatalog = HuntMonsterAnimationCatalog;
if (typeof module !== 'undefined') module.exports = HuntMonsterAnimationCatalog;

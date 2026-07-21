class HuntMonsterAnimationCatalog {
    static resolve(pattern = {}, attackName = '', attackType = '') {
        const text = [pattern.id, pattern.name, attackName, pattern.sourceActionClass, ...(pattern.tags || [])]
            .filter(Boolean).join(' ').toLowerCase();
        const has = re => re.test(text);
        const ultimate = pattern.type === 'ultimate' || (pattern.tags || []).includes('ultimate');

        if (has(/포효|울부짖|괴성|함성|roar|howl|scream/)) return this.profile('roar', ultimate, 1050, 'center');
        if (has(/잠복|지중|땅속|굴착|burrow|underground/)) return this.profile('burrow', ultimate, 1500, 'target');
        if (has(/공중|비행|활공|급강하|강습|낙하|dive|aerial|flight|ambush/)) return this.profile('aerial-dive', ultimate, 1450, 'target');
        if (has(/꼬리.*(회전|휘두|휩쓸|치기)|회전.*꼬리|tail.*(spin|sweep|slam)/)) return this.profile('tail-sweep', ultimate, 980, 'sweep');
        if (!(pattern.tags || []).includes('charge') && has(/휩쓸|쓸기|가로지르|횡단|sweep|strafe/)) return this.profile('lateral-sweep', ultimate, 1500, 'sweep');
        if (has(/도약|점프|뛰어|내려찍|찍기|프레스|지진|slam|leap|jump|stomp|press/)) return this.profile('leap-slam', ultimate, 1150, 'target');
        if (has(/회전|구르기|몸통.*휩쓸|roll|spin/)) return this.profile('body-spin', ultimate, 1050, 'sweep');
        if ((pattern.tags || []).includes('charge') || has(/돌진|들이받|박치기|진격|쇄도|charge|rush|tackle|ram/)) {
            const crossScreen = (pattern.tags || []).includes('cross-charge');
            const chain = crossScreen && has(/지그재그|삼연|연쇄|연속|폭주|triple|chain|zigzag|multi-hit/);
            return this.profile(chain ? 'ground-charge-zigzag' : crossScreen ? 'ground-charge-cross' : 'ground-charge', ultimate, chain ? 2450 : crossScreen ? 2050 : 1900, 'target');
        }
        if (has(/연속|연계|난무|콤보|combo|chain|multi-hit/) && has(/발톱|물기|할퀴|claw|bite|strike|attack/)) return this.profile('pounce-chain', ultimate, 1600, 'sweep');
        if (has(/브레스|분사|방출|수류|화염구|포환|사격|레이저|광선|breath|beam|laser|projectile|shot/)) return this.profile('ranged-cast', ultimate, 1250, 'target');
        if (has(/폭발|대폭발|초신성|폭풍|회오리|용오름|지반|eruption|nova|explosion|storm|tornado/)) return this.profile('area-burst', ultimate, 1350, 'center');
        if (has(/물기|할퀴|베기|찌르기|앞발|육탄|bite|claw|slash|stab|horn/)) return this.profile('close-strike', ultimate, 850, 'target');
        if (attackType === 'elemental') return this.profile('ranged-cast', ultimate, 1250, 'target');
        return this.profile(ultimate ? 'area-burst' : 'close-strike', ultimate, ultimate ? 1350 : 850, 'target');
    }

    static profile(id, ultimate, duration, aim) {
        return Object.freeze({ id, ultimate: Boolean(ultimate), duration, aim });
    }
}

if (typeof window !== 'undefined') window.HuntMonsterAnimationCatalog = HuntMonsterAnimationCatalog;
if (typeof module !== 'undefined') module.exports = HuntMonsterAnimationCatalog;

class HuntWeaponCatalog {
    static supplementalActions() {
        return {
            great_sword: [
                { id: 'great_sword.tackle', name: '태클', dmg: 85, motionValue: 26, stun: 55, tags: ['blunt', 'counter', 'tackle'], next: ['great_sword.strong_charge'], sourceGame: 'wilds' },
                { id: 'great_sword.rising_slash', name: '베어올리기', dmg: 150, motionValue: 38, next: ['great_sword.wide_slash'], sourceGame: 'wilds' },
                { id: 'great_sword.wide_slash', name: '횡날리기', dmg: 135, motionValue: 34, next: ['great_sword.charged_slash'], sourceGame: 'wilds' },
                { id: 'great_sword.offset_rising', name: '상쇄 올려베기', dmg: 260, motionValue: 70, tags: ['sever', 'counter', 'offset'], sourceGame: 'wilds' }
            ],
            long_sword: [
                { id: 'long_sword.thrust', name: '찌르기', dmg: 70, motionValue: 18, sourceGame: 'wilds' },
                { id: 'long_sword.foresight', name: '간파베기', dmg: 110, motionValue: 28, tags: ['sever', 'counter', 'foresight'], next: ['long_sword.spirit_roundslash'], sourceGame: 'wilds' },
                { id: 'long_sword.spirit_roundslash', name: '기인대회전베기', dmg: 240, motionValue: 60, effects: { spiritGain: 1 }, sourceGame: 'wilds' },
                { id: 'long_sword.iai_spirit', name: '거합베기', dmg: 360, motionValue: 90, requirements: { minSpirit: 1 }, tags: ['sever', 'counter'], next: ['long_sword.helm_breaker'], sourceGame: 'wilds' }
            ],
            sword_shield: [
                { id: 'sword_shield.lateral_slash', name: '수평베기', dmg: 75, motionValue: 20, sourceGame: 'wilds' },
                { id: 'sword_shield.roundslash', name: '회전베기', dmg: 105, motionValue: 28, sourceGame: 'wilds' },
                { id: 'sword_shield.backstep', name: '백스텝 모아베기', dmg: 145, motionValue: 38, evadeCancelFrom: 0, sourceGame: 'wilds' },
                { id: 'sword_shield.perfect_rush', name: '저스트 러시 피니시', dmg: 360, motionValue: 95, hits: [20, 25, 50], sourceGame: 'wilds' }
            ],
            dual_blades: [
                { id: 'dual_blades.double_slash', name: '이단베기', dmg: 70, motionValue: 20, hits: [10, 10], sourceGame: 'wilds' },
                { id: 'dual_blades.demon_fang', name: '귀인연참', dmg: 160, motionValue: 42, hits: [12, 14, 16], requirements: { demonMode: true }, sourceGame: 'wilds' },
                { id: 'dual_blades.blade_dance_2', name: '귀인난무 II', dmg: 340, motionValue: 88, hits: [10, 12, 14, 16, 16, 20], requirements: { demonMode: true }, sourceGame: 'wilds' },
                { id: 'dual_blades.blade_dance_3', name: '귀인난무 III', dmg: 520, motionValue: 132, hits: [12, 15, 18, 20, 22, 45], requirements: { demonMode: true }, sourceGame: 'wilds' }
            ],
            hammer: [
                { id: 'hammer.side_smash', name: '가로휘두르기', dmg: 100, motionValue: 25, stun: 35, sourceGame: 'wilds' },
                { id: 'hammer.upswing', name: '어퍼스윙', dmg: 210, motionValue: 52, stun: 70, sourceGame: 'wilds' },
                { id: 'hammer.big_bang', name: '빅뱅 피니시', dmg: 430, motionValue: 105, stun: 120, sourceGame: 'wilds' },
                { id: 'hammer.offset_upswing', name: '상쇄 어퍼', dmg: 300, motionValue: 75, stun: 100, tags: ['blunt', 'counter', 'offset'], sourceGame: 'wilds' }
            ],
            hunting_horn: [
                { id: 'hunting_horn.left_swing', name: '좌 휘두르기', dmg: 95, motionValue: 24, stun: 30, sourceGame: 'wilds' },
                { id: 'hunting_horn.backward_strike', name: '후방 공격', dmg: 150, motionValue: 38, stun: 45, sourceGame: 'wilds' },
                { id: 'hunting_horn.echo_bubble', name: '향옥 설치', dmg: 80, motionValue: 20, tags: ['blunt', 'support'], sourceGame: 'wilds' },
                { id: 'hunting_horn.offset_melody', name: '상쇄의 선율', dmg: 260, motionValue: 65, stun: 80, tags: ['blunt', 'support', 'counter', 'offset'], sourceGame: 'wilds' }
            ],
            lance: [
                { id: 'lance.triple_thrust', name: '3연 찌르기', dmg: 180, motionValue: 46, hits: [14, 15, 17], sourceGame: 'wilds' },
                { id: 'lance.counter_thrust', name: '카운터 찌르기', dmg: 190, motionValue: 48, tags: ['sever', 'counter', 'guard-point'], sourceGame: 'wilds' },
                { id: 'lance.power_guard', name: '파워 가드', dmg: 0, motionValue: 0, tags: ['guard-point'], guardCancelFrom: 0, sourceGame: 'wilds' },
                { id: 'lance.leaping_thrust', name: '뛰어들어찌르기', dmg: 230, motionValue: 58, sourceGame: 'wilds' }
            ],
            gunlance: [
                { id: 'gunlance.rising_slash', name: '베어올리기', dmg: 120, motionValue: 30, sourceGame: 'wilds' },
                { id: 'gunlance.slam', name: '내려치기', dmg: 210, motionValue: 52, sourceGame: 'wilds' },
                { id: 'gunlance.wyrmstake', name: '용항포', dmg: 390, motionValue: 96, tags: ['ranged', 'explosive', 'multi-hit'], requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'gunlance.reload', name: '퀵 리로드', dmg: 0, motionValue: 0, effects: { reload: true }, sourceGame: 'wilds' }
            ],
            switch_axe: [
                { id: 'switch_axe.wild_swing', name: '붕붕이 연속 휘두르기', dmg: 220, motionValue: 56, hits: [18, 18, 20], sourceGame: 'wilds' },
                { id: 'switch_axe.heavy_slam', name: '도끼 강화 내려치기', dmg: 280, motionValue: 70, sourceGame: 'wilds' },
                { id: 'switch_axe.heavenward', name: '비천연격', dmg: 310, motionValue: 78, hits: [30, 48], sourceGame: 'wilds' },
                { id: 'switch_axe.zero_sum', name: '영거리 속성해방 찌르기', dmg: 590, motionValue: 148, hits: [18, 18, 18, 24, 70], requirements: { minGauge: 60 }, sourceGame: 'wilds' }
            ],
            charge_blade: [
                { id: 'charge_blade.shield_thrust', name: '방패찌르기', dmg: 105, motionValue: 26, stun: 20, tags: ['blunt', 'guard-point'], sourceGame: 'wilds' },
                { id: 'charge_blade.element_discharge_2', name: '도끼 속성해방베기 II', dmg: 290, motionValue: 72, requirements: { minPhials: 1 }, sourceGame: 'wilds' },
                { id: 'charge_blade.savage_axe', name: '도끼 강화 회전베기', dmg: 330, motionValue: 82, hits: [22, 20, 20, 20], requirements: { minPhials: 1 }, sourceGame: 'wilds' },
                { id: 'charge_blade.guard_point', name: '변형 가드 포인트', dmg: 125, motionValue: 31, tags: ['sever', 'counter', 'guard-point'], sourceGame: 'wilds' }
            ],
            insect_glaive: [
                { id: 'insect_glaive.rising_slash', name: '뛰어들어 베어올리기', dmg: 120, motionValue: 30, sourceGame: 'wilds' },
                { id: 'insect_glaive.tornado_slash', name: '회귀베기', dmg: 260, motionValue: 65, requirements: { tripleExtract: true }, sourceGame: 'wilds' },
                { id: 'insect_glaive.vault', name: '도약', dmg: 40, motionValue: 10, evadeCancelFrom: 0, sourceGame: 'wilds' },
                { id: 'insect_glaive.descending_thrust', name: '급습베기', dmg: 390, motionValue: 98, requirements: { tripleExtract: true }, sourceGame: 'wilds' }
            ],
            light_bowgun: [
                { id: 'light_bowgun.pierce', name: '관통탄 속사', dmg: 230, motionValue: 58, hits: [12, 14, 14, 18], requirements: { minAmmo: 2 }, sourceGame: 'wilds' },
                { id: 'light_bowgun.spread', name: '산탄 사격', dmg: 210, motionValue: 52, hits: [10, 10, 10, 10, 12], requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'light_bowgun.chaser', name: '체이스 샷', dmg: 280, motionValue: 70, requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'light_bowgun.reload', name: '신속 재장전', dmg: 0, motionValue: 0, effects: { reload: true }, sourceGame: 'wilds' }
            ],
            heavy_bowgun: [
                { id: 'heavy_bowgun.pierce', name: '관통탄 사격', dmg: 260, motionValue: 65, hits: [14, 16, 17, 18], requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'heavy_bowgun.spread', name: '산탄 집중사격', dmg: 300, motionValue: 75, hits: [12, 14, 14, 16, 19], requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'heavy_bowgun.wyvernsnipe', name: '저격용탄', dmg: 520, motionValue: 130, requirements: { minAmmo: 1 }, sourceGame: 'wilds' },
                { id: 'heavy_bowgun.guard', name: '실드 가드', dmg: 0, motionValue: 0, tags: ['guard-point'], sourceGame: 'wilds' }
            ],
            bow: [
                { id: 'bow.quick_shot', name: '속사', dmg: 85, motionValue: 22, sourceGame: 'wilds' },
                { id: 'bow.power_shot', name: '강사 연계', dmg: 190, motionValue: 48, hits: [22, 26], sourceGame: 'wilds' },
                { id: 'bow.tracer', name: '유도 화살', dmg: 120, motionValue: 30, sourceGame: 'wilds' },
                { id: 'bow.arc_shot', name: '곡사', dmg: 170, motionValue: 42, stun: 35, hits: [10, 10, 10, 12], sourceGame: 'wilds' }
            ]
        };
    }

    static slug(value) {
        return String(value || '')
            .replace(/[^a-zA-Z0-9가-힣]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase();
    }

    static timingFor(weaponId, action) {
        if (Number(action.durationTicks) > 0) {
            const durationTicks = Math.max(3, Number(action.durationTicks));
            const windupTicks = Math.max(1, Number(action.windupTicks || Math.round(durationTicks * 0.32)));
            const activeTicks = Math.max(1, Number(action.activeTicks || Math.round(durationTicks * 0.18)));
            const recoveryTicks = Math.max(1, Number(action.recoveryTicks || durationTicks - windupTicks - activeTicks));
            return { windupTicks, activeTicks, recoveryTicks, durationTicks };
        }
        const name = action.name || '';
        const heavy = /참모아|초고출력|고출력|용격포|투구깨기|난무|용의 화살|기관용탄 난사|회전 회오리/.test(name);
        const quick = /발차기|병충전|진액 추출|귀인화|가드 대시|기폭용탄 설치/.test(name);
        if (heavy) return { windupTicks: 6, activeTicks: 4, recoveryTicks: 8, durationTicks: 18 };
        if (quick) return { windupTicks: 2, activeTicks: 2, recoveryTicks: 4, durationTicks: 8 };
        if (['great_sword', 'hammer', 'heavy_bowgun'].includes(weaponId)) {
            return { windupTicks: 4, activeTicks: 3, recoveryTicks: 6, durationTicks: 13 };
        }
        return { windupTicks: 3, activeTicks: 2, recoveryTicks: 5, durationTicks: 10 };
    }

    static tagsFor(weaponId, action) {
        const name = action.name || '';
        const tags = [];
        if (/방패|가드/.test(name)) tags.push('guard-point');
        if (/간파|카운터|태클/.test(name)) tags.push('counter');
        if (/포격|용격|탄|사격|화살/.test(name)) tags.push('ranged');
        if (/모아|차지/.test(name)) tags.push('charge');
        if (/난무|연사|속사|기관용탄/.test(name)) tags.push('multi-hit');
        if (/변형/.test(name)) tags.push('transform');
        if (/연주|회복/.test(name)) tags.push('support');
        if (weaponId === 'hammer' || /방패치기/.test(name)) tags.push('blunt');
        else tags.push('sever');
        return [...new Set(tags)];
    }

    static audioFor(weaponId, action) {
        const tags = HuntWeaponCatalog.tagsFor(weaponId, action);
        const name = action.name || '';
        if (weaponId === 'great_sword' && /참모아/.test(name)) return 'true_charged_slash';
        if (weaponId === 'sword_shield' && /모아베기/.test(name)) return 'charged_slash';
        if (weaponId === 'long_sword' && /간파/.test(name)) return 'counter';
        if (weaponId === 'hammer' && /모아|차지/.test(name)) {
            return Number(action.dmg || 0) >= 300 ? 'charged_swing_heavy' : 'charged_swing_light';
        }
        if (weaponId === 'switch_axe' && /속성해방/.test(name)) return 'explosive_heavy';
        if (weaponId === 'switch_axe' && /검|비천/.test(name)) return 'sword_slash';
        if (weaponId === 'insect_glaive' && /진액 추출/.test(name)) return 'kinsect_extract';
        if (weaponId === 'bow' && /용의 화살/.test(name)) return 'dragon_piercer';
        if (/용격|초고출력|풀버스트/.test(name)) return 'explosive_heavy';
        if (tags.includes('ranged')) return weaponId === 'bow' ? 'bow_shot' : 'bowgun_shot';
        if (tags.includes('blunt')) return Number(action.dmg || 0) >= 300 ? 'blunt_heavy' : 'blunt_light';
        if (tags.includes('transform')) return 'mechanical_transform';
        return Number(action.dmg || 0) >= 300 ? 'slash_heavy' : 'slash_light';
    }

    static build(comboList = {}) {
        const catalog = {};
        const supplemental = HuntWeaponCatalog.supplementalActions();
        const weaponIds = new Set([...Object.keys(comboList), ...Object.keys(supplemental)]);
        weaponIds.forEach(weaponId => {
            const canonical = typeof HuntWeaponMechanics !== 'undefined'
                ? HuntWeaponMechanics.actionsFor(weaponId)
                : null;
            const base = canonical || comboList[weaponId] || [];
            const existingNames = new Set(base.map(action => action.name));
            const actions = canonical
                ? base
                : [...base, ...(supplemental[weaponId] || []).filter(action => !existingNames.has(action.name))];
            catalog[weaponId] = actions.map((action, index) => {
                const identified = {
                    ...action,
                    id: action.id || `${weaponId}.${index}.${HuntWeaponCatalog.slug(action.name)}`
                };
                const enriched = typeof HuntMotionValueCatalog !== 'undefined'
                    ? HuntMotionValueCatalog.enrich(weaponId, identified)
                    : identified;
                const fallbackTiming = HuntWeaponCatalog.timingFor(weaponId, enriched);
                const timing = typeof HuntMotionValueCatalog !== 'undefined'
                    ? HuntMotionValueCatalog.timingFor(weaponId, enriched, fallbackTiming)
                    : { ...fallbackTiming, atbOccupancyTicks: fallbackTiming.durationTicks, timingEvidence: 'estimated' };
                const verifiedLink = typeof HUNT_WILDS_COMBO_LINKS !== 'undefined'
                    ? HUNT_WILDS_COMBO_LINKS.weapons?.[weaponId]?.[identified.id]
                    : null;
                const verifiedNext = Array.isArray(verifiedLink?.next) ? verifiedLink.next : [];
                return {
                    ...enriched,
                    gameActionClass: verifiedLink?.gameActionClass || enriched.gameActionClass || null,
                    next: [...new Set([...(enriched.next || []), ...verifiedNext])],
                    comboEvidence: verifiedLink?.evidence || enriched.comboEvidence || 'unverified-runtime-order',
                    motionValue: Number(enriched.motionValue || enriched.dmg || 0),
                    hits: Array.isArray(enriched.hits) ? enriched.hits : [100],
                    tags: enriched.tags || HuntWeaponCatalog.tagsFor(weaponId, enriched),
                    audioCue: enriched.audioCue || HuntWeaponCatalog.audioFor(weaponId, enriched),
                    sourceGame: enriched.sourceGame || 'mixed_reference',
                    confidence: enriched.confidence || (enriched.sourceUrl ? 'reference-derived' : enriched.sourceGame ? 'approximate' : 'legacy-unverified'),
                    ...timing
                };
            });
        });
        return catalog;
    }

    static validate(catalog) {
        const errors = [];
        Object.entries(catalog || {}).forEach(([weaponId, actions]) => {
            const ids = new Set();
            (actions || []).forEach((action, index) => {
                if (!action.id || ids.has(action.id)) errors.push(`${weaponId}[${index}] invalid or duplicate id`);
                ids.add(action.id);
                if (!action.name) errors.push(`${weaponId}[${index}] missing name`);
                if (!Number.isFinite(action.motionValue)) errors.push(`${weaponId}[${index}] invalid motion value`);
                if (!action.audioCue) errors.push(`${weaponId}[${index}] missing audio cue`);
            });
        });
        return errors;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntWeaponCatalog;
} else {
    window.HuntWeaponCatalog = HuntWeaponCatalog;
}

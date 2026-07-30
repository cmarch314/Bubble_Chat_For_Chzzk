'use strict';

// These kits cover monsters whose executable action tables are not available in
// the installed extracts. Move identity comes from the linked published ecology
// or strategy description; timing and damage are explicitly BubbleChat adaptation.
const HUNT_PUBLISHED_MONSTER_BEHAVIOR = (() => {
    const timing = {
        physical: [4, 2, 7, 0.18], charge: [5, 3, 9, 0.22],
        projectile: [6, 3, 9, 0.20], area: [7, 4, 11, 0.24],
        evade: [2, 2, 5, 0], ultimate: [14, 5, 18, 0.90]
    };
    const authored = {
        apceros: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.neoseeker.com/wiki/Apceros',
            moves: [['뿔 머리받기', 'charge'], ['가시 꼬리 후려치기', 'area']]
        },
        aptonoth: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Aptonoth',
            moves: [['성체의 머리받기', 'physical'], ['성체의 꼬리 방어', 'area'], ['무리 도주', 'evade']]
        },
        barnos: {
            species: 'Wingdrake', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Barnos',
            moves: [['산성액 투하', 'projectile', ['acid']], ['급강하 발톱치기', 'charge', ['aerial']]]
        },
        blango: {
            species: 'Fanged Beast', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Blango',
            moves: [['눈덩이 투척', 'projectile', ['iceblight']], ['도약 할퀴기', 'charge'], ['무리 연속공격', 'area', ['pack']]]
        },
        cephalos: {
            species: 'Piscine Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Cephalos',
            moves: [['모래밭 잠행 돌진', 'charge', ['burrow']], ['마비성 모래 분사', 'projectile', ['paralysis']], ['몸통 들이받기', 'physical']]
        },
        conga: {
            species: 'Fanged Beast', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Conga',
            moves: [['도약 몸통박치기', 'charge'], ['앞발 할퀴기', 'physical'], ['악취 방귀', 'area', ['stench']]]
        },
        cortos: {
            species: 'Wingdrake', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Cortos',
            moves: [['빙결액 투하', 'projectile', ['iceblight']], ['저공 급습', 'charge', ['aerial']]]
        },
        gastodon: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Gastodon',
            moves: [['완강한 머리 돌진', 'charge'], ['무리 머리받기', 'area', ['pack']]]
        },
        gendrome: {
            species: 'Bird Wyvern', roar: 'verified-present',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Gendrome',
            moves: [['마비 도약', 'charge', ['paralysis']], ['마비 송곳니', 'physical', ['paralysis']], ['겐프리 호출', 'area', ['summon', 'pack']]]
        },
        genprey: {
            species: 'Bird Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Genprey',
            moves: [['마비 송곳니', 'physical', ['paralysis']], ['무리 도약', 'charge', ['pack']]]
        },
        giaprey: {
            species: 'Bird Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Giaprey',
            moves: [['빙액 뱉기', 'projectile', ['iceblight']], ['도약 물어뜯기', 'charge', ['pack']]]
        },
        girros: {
            species: 'Fanged Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Girros',
            moves: [['마비 송곳니', 'physical', ['paralysis']], ['쓰러진 먹잇감 무리공격', 'area', ['paralysis', 'pack']]]
        },
        gowngoat: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Gowngoat',
            moves: [['뿔로 밀어내기', 'physical'], ['겁먹고 도주', 'evade']]
        },
        great_thunderbug: {
            species: 'Neopteron', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Great_Thunderbug',
            moves: [['전격 충돌', 'charge', ['thunderblight']], ['팽창 폭발', 'area', ['thunderblight']]]
        },
        ioprey: {
            species: 'Bird Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Ioprey',
            moves: [['독액 뱉기', 'projectile', ['poison']], ['독 송곳니 도약', 'charge', ['poison', 'pack']]]
        },
        kestodon_female: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Kestodon',
            moves: [['짧은 머리받기', 'physical'], ['무리 방어 돌진', 'charge', ['pack']]]
        },
        konchu: {
            species: 'Neopteron', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Konchu',
            moves: [['갑각 구르기', 'charge'], ['몬스터에게 달라붙기', 'evade', ['armor']]]
        },
        kulve_taroth: {
            species: 'Elder Dragon', roar: 'verified-present',
            sourceUrl: 'https://gamewith.net/monsterhunterworld-iceborne/article/show/18097',
            moves: [['거대 몸통 구르기', 'area'], ['고열 브레스', 'projectile', ['fireblight', 'beam']], ['용암 웅덩이', 'area', ['fireblight']], ['황금 천장 붕괴', 'ultimate', ['fireblight', 'all-target']]]
        },
        larinoth: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Larinoth',
            moves: [['긴 꼬리 휘두르기', 'area'], ['육중한 발 구르기', 'physical'], ['무리 도주', 'evade']]
        },
        leshen: {
            species: 'Relict', roar: 'verified-absent',
            sourceUrl: 'https://www.gamegrin.com/articles/monster-hunter-world-to-kill-an-ancient-leshen-complete-guide/',
            moves: [['지면 뿌리 솟구침', 'area'], ['레볼쳐 떼 습격', 'projectile', ['pack']], ['자그라스 소환', 'area', ['summon']], ['뿌리 구속', 'physical', ['root']]]
        },
        maccao: {
            species: 'Bird Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Maccao',
            moves: [['도약 발톱치기', 'charge'], ['꼬리 지지 발차기', 'physical'], ['무리 덮치기', 'area', ['pack']]]
        },
        mernos: {
            species: 'Wingdrake', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Mernos',
            moves: [['저공 발톱 급습', 'charge', ['aerial']], ['무리 선회', 'evade', ['pack']]]
        },
        moofah: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Moofah',
            moves: [['뿔로 밀어내기', 'physical'], ['겁먹고 도주', 'evade']]
        },
        mosswine: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Mosswine',
            moves: [['분노 돌진', 'charge'], ['숲속 도주', 'evade']]
        },
        noios: {
            species: 'Wingdrake', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Noios',
            moves: [['고주파 울음', 'area', ['sonic']], ['급강하 쪼기', 'charge', ['aerial']]]
        },
        odogaron: {
            species: 'Fanged Wyvern', roar: 'verified-present',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Odogaron',
            moves: [['도약 앞발 할퀴기', 'charge'], ['송곳니 연속 물기', 'physical', ['bleed']], ['꼬리 회전', 'area'], ['벽차기 급습', 'charge']]
        },
        popo: {
            species: 'Herbivore', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Popo',
            moves: [['성체의 엄니 방어', 'charge'], ['새끼를 감싸며 후퇴', 'evade']]
        },
        raphinos: {
            species: 'Wingdrake', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Raphinos',
            moves: [['무리 급강하', 'charge', ['aerial', 'pack']], ['독기 감염 난동', 'area', ['effluvium']]]
        },
        shamos: {
            species: 'Fanged Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Shamos',
            moves: [['어둠 속 도약', 'charge'], ['무리 물어뜯기', 'area', ['pack']]]
        },
        tzitzi_ya_ku: {
            species: 'Bird Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Tzitzi-Ya-Ku',
            moves: [['두 번 예고 섬광', 'area', ['flash', 'stun']], ['강력한 뒷발차기', 'physical'], ['꼬리치기 후 도약', 'charge']]
        },
        wulg: {
            species: 'Fanged Wyvern', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.fandom.com/wiki/Wulg',
            moves: [['달려들어 매달리기', 'charge', ['pin']], ['무리 물어뜯기', 'area', ['pack']]]
        },
        yamatsukami: {
            species: 'Elder Dragon', roar: 'verified-absent',
            sourceUrl: 'https://monsterhunter.neoseeker.com/wiki/Yama_Tsukami',
            moves: [['촉수 회전', 'area'], ['폭발 대뇌광충 방출', 'projectile', ['paralysis', 'summon']], ['거대 흡입', 'ultimate', ['wind', 'all-target']]]
        }
    };

    const result = {};
    Object.entries(authored).forEach(([monsterId, record]) => {
        result[monsterId] = {
            species: record.species,
            roar: { status: record.roar, evidence: 'published-behavior-description', sourceUrl: record.sourceUrl },
            sourceUrl: record.sourceUrl,
            evidence: 'published-behavior-description',
            patterns: record.moves.map((move, index) => {
                const [name, type, extraTags = []] = move;
                const [windupTicks, activeTicks, recoveryTicks, damageRatio] = timing[type];
                return {
                    id: `${monsterId}.published.${index}`,
                    name, type, damageRatio, windupTicks, activeTicks, recoveryTicks,
                    minTargets: type === 'ultimate' ? 4 : type === 'area' ? 2 : 1,
                    maxTargets: type === 'ultimate' ? 4 : type === 'area' ? 4 : type === 'projectile' ? 2 : 1,
                    cooldownTicks: type === 'ultimate' ? 450 : type === 'area' ? 42 : 26,
                    weight: type === 'evade' ? 0.45 : type === 'ultimate' ? 0.55 : 1,
                    tags: [...new Set([type, ...extraTags, ...(type === 'ultimate' ? ['ultimate', 'all-target'] : [])])],
                    requiredState: type === 'ultimate' ? 'enraged' : undefined,
                    sourceGame: 'published-reference',
                    sourceUrl: record.sourceUrl,
                    evidence: 'published-behavior-description',
                    confidence: 'documented-behavior',
                    adaptation: 'bubblechat-autobattler-timing-and-damage'
                };
            })
        };
    });
    return Object.freeze(result);
})();

if (typeof window !== 'undefined') window.HUNT_PUBLISHED_MONSTER_BEHAVIOR = HUNT_PUBLISHED_MONSTER_BEHAVIOR;
if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_PUBLISHED_MONSTER_BEHAVIOR;

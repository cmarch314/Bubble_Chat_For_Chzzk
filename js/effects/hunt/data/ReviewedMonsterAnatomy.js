'use strict';

// Compact runtime records for monsters whose latest available game does not
// exist in the Wilds extract. Part identity comes from reviewed game/web
// evidence; durability is normalized for BubbleChat's four-hunter hunt.
const HUNT_REVIEWED_MONSTER_ANATOMY = Object.freeze({
    version: 1,
    monsters: Object.freeze({
        rathalos: Object.freeze({
            id: 'rathalos',
            baseHealth: 5000,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-kiranico:head-back-wings-tail',
                hitzones: 'world-kiranico+game8-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/ja/monsters/jJxin/rioreusu',
                    'https://game8.jp/mhw/157267'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'rathalos:head', kind: 'head', health: 420, breakable: true, hitzones: Object.freeze({ slash: .65, blunt: .70, pierce: .60 }) }),
                Object.freeze({ id: 'rathalos:back', kind: 'back', health: 500, breakable: true, hitzones: Object.freeze({ slash: .25, blunt: .25, pierce: .20 }) }),
                Object.freeze({ id: 'rathalos:left-wing', kind: 'left-wing', health: 320, breakable: true, hitzones: Object.freeze({ slash: .50, blunt: .45, pierce: .40 }) }),
                Object.freeze({ id: 'rathalos:right-wing', kind: 'right-wing', health: 320, breakable: true, hitzones: Object.freeze({ slash: .50, blunt: .45, pierce: .40 }) }),
                Object.freeze({ id: 'rathalos:tail', kind: 'tail', health: 520, breakable: false, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) })
            ])
        }),
        rathian: Object.freeze({
            id: 'rathian',
            baseHealth: 4500,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-kiranico:head-back-wings-tail',
                hitzones: 'wilds-installed-anatomy+world-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/ja/monsters/Rz9Tb/rioreia',
                    'https://mhrise.kiranico.com/ja/data/monsters/366824395'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'rathian:head', kind: 'head', health: 390, breakable: true, hitzones: Object.freeze({ slash: .70, blunt: .75, pierce: .65 }) }),
                Object.freeze({ id: 'rathian:back', kind: 'back', health: 470, breakable: true, hitzones: Object.freeze({ slash: .35, blunt: .30, pierce: .25 }) }),
                Object.freeze({ id: 'rathian:left-wing', kind: 'left-wing', health: 300, breakable: true, hitzones: Object.freeze({ slash: .55, blunt: .50, pierce: .45 }) }),
                Object.freeze({ id: 'rathian:right-wing', kind: 'right-wing', health: 300, breakable: true, hitzones: Object.freeze({ slash: .55, blunt: .50, pierce: .45 }) }),
                Object.freeze({ id: 'rathian:tail', kind: 'tail', health: 480, breakable: false, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) })
            ])
        }),
        diablos: Object.freeze({
            id: 'diablos',
            baseHealth: 5000,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world+rise-kiranico:horns-back-tail',
                hitzones: 'mhgudb-sqlite:monster-7',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/en/monsters/BYXHE/diablos',
                    'https://mhrise.kiranico.com/data/monsters/485829389'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'diablos:left-horn', kind: 'left-horn', health: 310, breakable: true, hitzones: Object.freeze({ slash: .24, blunt: .15, pierce: .20 }) }),
                Object.freeze({ id: 'diablos:right-horn', kind: 'right-horn', health: 310, breakable: true, hitzones: Object.freeze({ slash: .24, blunt: .15, pierce: .20 }) }),
                Object.freeze({ id: 'diablos:back', kind: 'back', health: 520, breakable: true, hitzones: Object.freeze({ slash: .23, blunt: .42, pierce: .20 }) }),
                Object.freeze({ id: 'diablos:belly', kind: 'belly', health: 900, breakable: false, hitzones: Object.freeze({ slash: .68, blunt: .75, pierce: .40 }) }),
                Object.freeze({ id: 'diablos:tail', kind: 'tail', health: 560, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .24, pierce: .60 }) })
            ])
        }),
        black_diablos: Object.freeze({
            id: 'black_diablos',
            baseHealth: 5400,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-variant:horns-back-tail',
                hitzones: 'diablos-family-reviewed',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/en/monsters/BYXHE/diablos'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'black_diablos:left-horn', kind: 'left-horn', health: 335, breakable: true, hitzones: Object.freeze({ slash: .24, blunt: .15, pierce: .20 }) }),
                Object.freeze({ id: 'black_diablos:right-horn', kind: 'right-horn', health: 335, breakable: true, hitzones: Object.freeze({ slash: .24, blunt: .15, pierce: .20 }) }),
                Object.freeze({ id: 'black_diablos:back', kind: 'back', health: 560, breakable: true, hitzones: Object.freeze({ slash: .23, blunt: .42, pierce: .20 }) }),
                Object.freeze({ id: 'black_diablos:belly', kind: 'belly', health: 960, breakable: false, hitzones: Object.freeze({ slash: .68, blunt: .75, pierce: .40 }) }),
                Object.freeze({ id: 'black_diablos:tail', kind: 'tail', health: 600, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .24, pierce: .60 }) })
            ])
        }),
        legiana: Object.freeze({
            id: 'legiana',
            baseHealth: 4700,
            tailSeverable: false,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:head-back-wings-tail-break',
                hitzones: 'world-kiranico+gamewith-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/ja/monsters',
                    'https://gamewith.jp/mhw/87039'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'legiana:head', kind: 'head', health: 380, breakable: true, hitzones: Object.freeze({ slash: .65, blunt: .70, pierce: .60 }) }),
                Object.freeze({ id: 'legiana:back', kind: 'back', health: 460, breakable: true, hitzones: Object.freeze({ slash: .25, blunt: .25, pierce: .20 }) }),
                Object.freeze({ id: 'legiana:left-wing', kind: 'left-wing', health: 330, breakable: true, hitzones: Object.freeze({ slash: .50, blunt: .45, pierce: .45 }) }),
                Object.freeze({ id: 'legiana:right-wing', kind: 'right-wing', health: 330, breakable: true, hitzones: Object.freeze({ slash: .50, blunt: .45, pierce: .45 }) }),
                Object.freeze({ id: 'legiana:tail', kind: 'tail', health: 430, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) })
            ])
        }),
        paolumu: Object.freeze({
            id: 'paolumu',
            baseHealth: 4500,
            tailSeverable: false,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:neck-pouch-back-wings-tail-break',
                hitzones: 'world-kiranico+mhworld-jp-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze([
                    'https://mhworld.kiranico.com/ja/monsters/2mnT3/paolumu',
                    'https://mhworld.jp/m/d/16/'
                ])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'paolumu:neck-pouch', kind: 'head', health: 430, breakable: true, hitzones: Object.freeze({ slash: .55, blunt: .60, pierce: .50 }) }),
                Object.freeze({ id: 'paolumu:back', kind: 'back', health: 440, breakable: true, hitzones: Object.freeze({ slash: .30, blunt: .30, pierce: .25 }) }),
                Object.freeze({ id: 'paolumu:left-wing', kind: 'left-wing', health: 310, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .45 }) }),
                Object.freeze({ id: 'paolumu:right-wing', kind: 'right-wing', health: 310, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .45 }) }),
                Object.freeze({ id: 'paolumu:tail', kind: 'tail', health: 450, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) })
            ])
        }),
        bazelgeuse: Object.freeze({
            id: 'bazelgeuse',
            baseHealth: 5400,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:head-back-wings-tail-sever',
                hitzones: 'world-kiranico+gamewith-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze(['https://mhworld.kiranico.com/ja/monsters'])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'bazelgeuse:head', kind: 'head', health: 440, breakable: true, hitzones: Object.freeze({ slash: .60, blunt: .65, pierce: .55 }) }),
                Object.freeze({ id: 'bazelgeuse:back', kind: 'back', health: 520, breakable: true, hitzones: Object.freeze({ slash: .30, blunt: .30, pierce: .25 }) }),
                Object.freeze({ id: 'bazelgeuse:left-wing', kind: 'left-wing', health: 350, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .45 }) }),
                Object.freeze({ id: 'bazelgeuse:right-wing', kind: 'right-wing', health: 350, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .45 }) }),
                Object.freeze({ id: 'bazelgeuse:tail', kind: 'tail', health: 540, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .35, pierce: .45 }) })
            ])
        }),
        tigrex: Object.freeze({
            id: 'tigrex',
            baseHealth: 5200,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:head-forelegs-tail-sever',
                hitzones: 'world-kiranico+gamewith-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze(['https://gamewith.jp/mhw/151846'])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'tigrex:head', kind: 'head', health: 430, breakable: true, hitzones: Object.freeze({ slash: .65, blunt: .70, pierce: .55 }) }),
                Object.freeze({ id: 'tigrex:left-front-leg', kind: 'left-front-leg', health: 380, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'tigrex:right-front-leg', kind: 'right-front-leg', health: 380, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'tigrex:tail', kind: 'tail', health: 510, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .40, pierce: .45 }) })
            ])
        }),
        nargacuga: Object.freeze({
            id: 'nargacuga',
            baseHealth: 5000,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:head-wingarms-tail-sever',
                hitzones: 'world-kiranico+mhworld-jp-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze(['https://mhworld.jp/m/d/61/'])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'nargacuga:head', kind: 'head', health: 400, breakable: true, hitzones: Object.freeze({ slash: .65, blunt: .70, pierce: .55 }) }),
                Object.freeze({ id: 'nargacuga:left-wingarm', kind: 'left-wing', health: 370, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'nargacuga:right-wingarm', kind: 'right-wing', health: 370, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'nargacuga:tail', kind: 'tail', health: 530, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .35, pierce: .45 }) })
            ])
        }),
        barioth: Object.freeze({
            id: 'barioth',
            baseHealth: 5200,
            tailSeverable: true,
            evidence: Object.freeze({
                breakContract: 'world-reviewed:head-forelegs-tail-sever',
                hitzones: 'world-kiranico+gamewith-cross-check',
                durability: 'bubblechat-normalized',
                sources: Object.freeze(['https://gamewith.jp/mhw/151833'])
            }),
            parts: Object.freeze([
                Object.freeze({ id: 'barioth:head', kind: 'head', health: 420, breakable: true, hitzones: Object.freeze({ slash: .60, blunt: .65, pierce: .55 }) }),
                Object.freeze({ id: 'barioth:left-front-leg', kind: 'left-front-leg', health: 390, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'barioth:right-front-leg', kind: 'right-front-leg', health: 390, breakable: true, hitzones: Object.freeze({ slash: .45, blunt: .40, pierce: .35 }) }),
                Object.freeze({ id: 'barioth:tail', kind: 'tail', health: 520, breakable: false, hitzones: Object.freeze({ slash: .50, blunt: .35, pierce: .45 }) })
            ])
        })
    })
});

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_REVIEWED_MONSTER_ANATOMY;
else globalThis.HUNT_REVIEWED_MONSTER_ANATOMY = HUNT_REVIEWED_MONSTER_ANATOMY;

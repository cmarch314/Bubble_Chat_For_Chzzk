'use strict';

// Taxonomy fills identity gaps left by older runtime rows. It is descriptive
// classification only; animation still prefers an installed skeleton when present.
const HUNT_MONSTER_TAXONOMY = Object.freeze({
    acidic_glavenus: 'Brute Wyvern',
    altaroth: 'Neopteron',
    anteka: 'Herbivore',
    baggi: 'Bird Wyvern',
    banbaro: 'Brute Wyvern',
    beotodus: 'Piscine Wyvern',
    blackveil_vaal_hazak: 'Elder Dragon',
    bnahabra: 'Neopteron',
    boggi: 'Bird Wyvern',
    bombadgy: 'Fanged Beast',
    brute_tigrex: 'Flying Wyvern',
    bullfango: 'Fanged Beast',
    ceanataur: 'Carapaceon',
    coral_pukei_pukei: 'Bird Wyvern',
    delex: 'Piscine Wyvern',
    ebony_odogaron: 'Fanged Wyvern',
    fatalis: 'Elder Dragon',
    frostfang_barioth: 'Flying Wyvern',
    fulgur_anjanath: 'Brute Wyvern',
    gargwa: 'Bird Wyvern',
    hermitaur: 'Carapaceon',
    izuchi: 'Bird Wyvern',
    jaggi: 'Bird Wyvern',
    jaggia: 'Bird Wyvern',
    ludroth: 'Leviathan',
    nightshade_paolumu: 'Flying Wyvern',
    pyrantula: 'Temnoceran',
    rachnoid: 'Temnoceran',
    raging_brachydios: 'Brute Wyvern',
    remobra: 'Snake Wyvern',
    rhenoplos: 'Herbivore',
    ruiner_nergigante: 'Elder Dragon',
    savage_deviljho: 'Brute Wyvern',
    scarred_yian_garuga: 'Bird Wyvern',
    shara_ishvalda: 'Elder Dragon',
    shrieking_legiana: 'Flying Wyvern',
    slagtoth: 'Herbivore',
    uroktor: 'Leviathan',
    valstrax: 'Elder Dragon',
    velociprey: 'Bird Wyvern',
    wroggi: 'Bird Wyvern',
    zamite: 'Amphibian'
});

if (typeof window !== 'undefined') window.HUNT_MONSTER_TAXONOMY = HUNT_MONSTER_TAXONOMY;
if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_TAXONOMY;

'use strict';
const HUNT_RELEASED_MONSTER_DATA = Object.freeze([
    {
        "id": "bazelgeuse",
        "nameEN": "Bazelgeuse",
        "nameKO": "바젤기우스",
        "filename": "bazelgeuse.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "species": "Flying Wyvern",
        "baseHealth": null,
        "weaknesses": [],
        "breakablePartKinds": [],
        "sourceIds": {
            "rise-sunbreak": "321844636",
            "world-iceborne": "25"
        },
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "mediaEvidence": "existing-runtime-image",
        "locations": [
            "Ancient Forest",
            "Coral Highlands",
            "Wildspire Waste",
            "Rotten Vale",
            "Elder's Recess"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": "Strong roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "pilot-2026-07-25",
        "mechanicModules": [
            "common",
            "flight",
            "blast-scales"
        ]
    },
    {
        "id": "chameleos",
        "nameEN": "Chameleos",
        "nameKO": "오나즈치",
        "filename": "chameleos.png",
        "tier": "elder",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Elder Dragon",
        "baseHealth": 6400,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 5,
                    "water": 0,
                    "thunder": 4,
                    "ice": 1,
                    "dragon": 5
                },
                "statuses": {
                    "poison": 2,
                    "paralysis": 2,
                    "sleep": 4
                },
                "tools": {
                    "pitfallTrap": 0,
                    "shockTrap": 0,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Belly",
            "Back",
            "Front Legs",
            "Back Legs",
            "Wings",
            "Tail",
            "Head (Invisible)",
            "Belly (Invisible)",
            "Back (Invisible)",
            "Front Legs (Invisible)",
            "Back Legs (Invisible)",
            "Wings (Invisible)",
            "Tail (Invisible)"
        ],
        "sourceIds": {
            "rise-sunbreak": "138201299",
            "generations-ultimate": "25"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Verdant Hills",
            "Marshlands"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "고룡종",
        "skeleton": [
            "Other",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": false
        },
        "roar": {
            "status": "verified-present",
            "strength": "Strong roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "rise-sunbreak",
        "releaseReview": "pilot-2026-07-25",
        "mechanicModules": [
            "common",
            "elder",
            "mist"
        ]
    },
    {
        "id": "rathian",
        "nameEN": "Rathian",
        "nameKO": "리오레이아",
        "filename": "rathian.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "wilds",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4500,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 3,
                    "thunder": 4,
                    "ice": 3,
                    "dragon": 5
                },
                "statuses": {
                    "poison": 3,
                    "paralysis": 3,
                    "sleep": 4
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "left-wing",
            "right-wing"
        ],
        "sourceIds": {
            "rise-sunbreak": "366824395",
            "world-iceborne": "43",
            "wilds": "13",
            "generations-ultimate": "1"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Verdant Hills",
            "Misty Peaks",
            "Dunes",
            "Deserted Island",
            "Marshlands",
            "Ancestral Steppe",
            "Primal Forest",
            "Desert",
            "Jungle",
            "Ruined Pinnacle"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": null,
            "evidence": "installed-game-action-id+action-param",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-ground-queen-review-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    },
    {
        "id": "rathalos",
        "nameEN": "Rathalos",
        "nameKO": "리오레우스",
        "filename": "rathalos.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "wilds",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4200,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 2,
                    "thunder": 6,
                    "ice": 2,
                    "dragon": 5
                },
                "statuses": {
                    "poison": 3,
                    "paralysis": 3,
                    "sleep": 4
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "left-wing",
            "right-wing"
        ],
        "sourceIds": {
            "rise-sunbreak": "381074408",
            "world-iceborne": "42",
            "wilds": "29",
            "generations-ultimate": "2"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Verdant Hills",
            "Deserted Island",
            "Volcano",
            "Ancestral Steppe",
            "Volcanic Hollow",
            "Ruined Pinnacle"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": null,
            "evidence": "installed-game-action-id+action-param",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "pilot-2026-07-25",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    },
    {
        "id": "diablos",
        "nameEN": "Diablos",
        "nameKO": "디아블로스",
        "filename": "diablos.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4500,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 3,
                    "thunder": 3,
                    "ice": 5,
                    "dragon": 3
                },
                "statuses": {
                    "poison": 6,
                    "paralysis": 2,
                    "sleep": 2
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck",
            "Back",
            "Belly",
            "Wing Flaps",
            "Legs",
            "Tail",
            "Tail Tip"
        ],
        "sourceIds": {
            "rise-sunbreak": "485829389",
            "world-iceborne": "28",
            "generations-ultimate": "7"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Dunes"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": null,
            "flyingStanceToMove": false
        },
        "roar": {
            "status": "verified-present",
            "strength": "Strong roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "pilot-2026-07-25",
        "mechanicModules": [
            "common",
            "burrow",
            "charge-chain",
            "tremor"
        ]
    },
    {
        "id": "black_diablos",
        "nameEN": "Black Diablos",
        "nameKO": "디아블로스 아종",
        "filename": "black_diablos.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "sourceIds": {
            "world-iceborne": "29"
        },
        "role": "combat",
        "journeyEventId": null,
        "species": "flying wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "high",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "mediaEvidence": "existing-runtime-image",
        "variantOf": null,
        "baseHealth": null,
        "locations": [
            "Wildspire Waste"
        ],
        "weaknesses": [],
        "breakablePartKinds": [],
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "canonicalEdition": "world-iceborne",
        "releaseReview": "diablos-variant-interview-2026-07-25",
        "mechanicModules": [
            "common",
            "burrow",
            "charge-chain",
            "tremor"
        ]
    },
    {
        "id": "legiana",
        "nameEN": "Legiana",
        "nameKO": "레이기에나",
        "filename": "legiana.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "mediaEvidence": "existing-runtime-image",
        "species": "flying wyvern",
        "baseHealth": null,
        "weaknesses": [],
        "breakablePartKinds": [],
        "sourceIds": {
            "world-iceborne": "36"
        },
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "locations": [
            "Coral Highlands",
            "Rotten Vale"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "high",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight"
        ]
    },
    {
        "id": "shrieking_legiana",
        "nameEN": "Shrieking Legiana",
        "nameKO": "얼려 찌르는 레이기에나",
        "filename": "shrieking_legiana.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime"
        ],
        "evidence": "existing-runtime-image-catalog",
        "sourceIds": {},
        "role": "combat",
        "journeyEventId": null,
        "species": "Flying Wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "high",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight"
        ]
    },
    {
        "id": "paolumu",
        "nameEN": "Paolumu",
        "nameKO": "파오우르무",
        "filename": "paolumu.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "mediaEvidence": "existing-runtime-image",
        "species": "flying wyvern",
        "baseHealth": null,
        "weaknesses": [],
        "breakablePartKinds": [],
        "sourceIds": {
            "world-iceborne": "40"
        },
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "locations": [
            "Coral Highlands"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "low",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight"
        ]
    },
    {
        "id": "nightshade_paolumu",
        "nameEN": "Nightshade Paolumu",
        "nameKO": "부면룡 파오우르무",
        "filename": "nightshade_paolumu.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime"
        ],
        "evidence": "existing-runtime-image-catalog",
        "sourceIds": {},
        "role": "combat",
        "journeyEventId": null,
        "species": "Flying Wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "low",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight"
        ]
    },
    {
        "id": "seething_bazelgeuse",
        "nameEN": "Seething Bazelgeuse",
        "nameKO": "홍련의 솟구치는 바젤기우스",
        "filename": "seething_bazelgeuse.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak"
        ],
        "evidence": "kiranico-localized-id-and-icon-row",
        "species": "Flying Wyvern",
        "baseHealth": null,
        "weaknesses": [],
        "breakablePartKinds": [],
        "sourceIds": {
            "rise-sunbreak": "1572835996"
        },
        "anatomyEvidence": null,
        "mediaEvidence": "kiranico-localized-id-and-icon-row",
        "locations": [],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": "Strong roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "blast-scales"
        ]
    },
    {
        "id": "tigrex",
        "nameEN": "Tigrex",
        "nameKO": "티가렉스",
        "filename": "tigrex.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 5000,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 3,
                    "thunder": 4,
                    "ice": 2,
                    "dragon": 3
                },
                "statuses": {
                    "poison": 4,
                    "paralysis": 3,
                    "sleep": 3
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck",
            "Belly",
            "Back",
            "Tail",
            "Front Legs",
            "Back Legs",
            "Head (Enraged)",
            "Neck (Enraged)",
            "Belly (Enraged)",
            "Back (Enraged)",
            "Front Legs (Enraged)"
        ],
        "sourceIds": {
            "rise-sunbreak": "808327178",
            "world-iceborne": "jVAhP",
            "generations-ultimate": "32"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Arctic Ridge",
            "Dunes",
            "Marshlands",
            "Ancestral Steppe",
            "Primal Forest",
            "Frozen Seaway",
            "Desert"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": null,
            "flyingStanceToMove": false
        },
        "roar": {
            "status": "verified-present",
            "strength": null,
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "charge-chain"
        ]
    },
    {
        "id": "brute_tigrex",
        "nameEN": "Brute Tigrex",
        "nameKO": "티가렉스 아종",
        "filename": "brute_tigrex.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime"
        ],
        "evidence": "existing-runtime-image-catalog",
        "sourceIds": {},
        "role": "combat",
        "journeyEventId": null,
        "species": "Flying Wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": null,
            "evidence": "mhw-executable-action-enumeration",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "charge-chain"
        ]
    },
    {
        "id": "nargacuga",
        "nameEN": "Nargacuga",
        "nameKO": "나르가쿠르가",
        "filename": "nargacuga.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4200,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 4,
                    "water": 1,
                    "thunder": 5,
                    "ice": 2,
                    "dragon": 3
                },
                "statuses": {
                    "poison": 3,
                    "paralysis": 3,
                    "sleep": 3
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck + Back",
            "Belly",
            "Wing Blades",
            "Front Legs",
            "Back Legs",
            "Tail",
            "Tail Tip",
            "Head (Enraged)",
            "Front Legs (Enraged)"
        ],
        "sourceIds": {
            "rise-sunbreak": "1047302063",
            "world-iceborne": "BKNIm",
            "generations-ultimate": "37"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Misty Peaks",
            "Deserted Island",
            "Jungle"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": null,
            "flyingStanceToMove": false
        },
        "roar": {
            "status": "verified-present",
            "strength": "Weak roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "charge-chain"
        ]
    },
    {
        "id": "barioth",
        "nameEN": "Barioth",
        "nameKO": "벨리오로스",
        "filename": "barioth.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "world-iceborne",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4400,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 6,
                    "water": 0,
                    "thunder": 5,
                    "ice": 0,
                    "dragon": 4
                },
                "statuses": {
                    "poison": 0,
                    "paralysis": 0,
                    "sleep": 0
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck",
            "Belly",
            "Wings",
            "Claws",
            "Back Legs",
            "Tail"
        ],
        "sourceIds": {
            "rise-sunbreak": "614678208",
            "world-iceborne": "4k2UP",
            "generations-ultimate": "42"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Arctic Ridge",
            "Frozen Seaway"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": false
        },
        "roar": {
            "status": "verified-present",
            "strength": "Weak roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common"
        ]
    },
    {
        "id": "frostfang_barioth",
        "nameEN": "Frostfang Barioth",
        "nameKO": "서리칼날 품은 베리오로스",
        "filename": "frostfang_barioth.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime"
        ],
        "evidence": "existing-runtime-image-catalog",
        "sourceIds": {},
        "role": "combat",
        "journeyEventId": null,
        "species": "Flying Wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "high",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common"
        ]
    },
    {
        "id": "pink_rathian",
        "nameEN": "Pink Rathian",
        "nameKO": "리오레이아 아종",
        "filename": "pink_rathian.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "sourceIds": {
            "world-iceborne": "44"
        },
        "role": "combat",
        "journeyEventId": null,
        "species": "flying wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "low",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "mediaEvidence": "existing-runtime-image",
        "variantOf": null,
        "baseHealth": null,
        "locations": [
            "Coral Highlands",
            "Wildspire Waste"
        ],
        "weaknesses": [],
        "breakablePartKinds": [],
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    },
    {
        "id": "gold_rathian",
        "nameEN": "Gold Rathian",
        "nameKO": "리오레이아 희소종",
        "filename": "gold_rathian.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4700,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 3,
                    "thunder": 5,
                    "ice": 2,
                    "dragon": 0
                },
                "statuses": {
                    "poison": 3,
                    "paralysis": 4,
                    "sleep": 4
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck",
            "Back",
            "Belly",
            "Tail",
            "Wings",
            "Legs",
            "Tail Tip",
            "Head (Break)"
        ],
        "sourceIds": {
            "rise-sunbreak": "1518179787",
            "generations-ultimate": "513"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Misty Peaks"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": "Weak roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    },
    {
        "id": "azure_rathalos",
        "nameEN": "Azure Rathalos",
        "nameKO": "리오레우스 아종",
        "filename": "azure_rathalos.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "world-iceborne"
        ],
        "evidence": "mhw-db-game-reference",
        "sourceIds": {
            "world-iceborne": "24"
        },
        "role": "combat",
        "journeyEventId": null,
        "species": "flying wyvern",
        "speciesKO": null,
        "skeleton": [],
        "locomotion": null,
        "roar": {
            "status": "verified-present",
            "strength": "high",
            "evidence": "published-earplugs-test",
            "sourceUrl": "https://www.reddit.com/r/MonsterHunter/comments/ddjpj4/iceborne_list_of_roar_levels_for_each_monster/",
            "audioStatus": "unresolved"
        },
        "mediaEvidence": "existing-runtime-image",
        "variantOf": null,
        "baseHealth": null,
        "locations": [
            "Ancient Forest",
            "Elder's Recess"
        ],
        "weaknesses": [],
        "breakablePartKinds": [],
        "anatomyEvidence": "mhw-db-species-and-location-reference",
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    },
    {
        "id": "silver_rathalos",
        "nameEN": "Silver Rathalos",
        "nameKO": "리오레우스 희소종",
        "filename": "silver_rathalos.png",
        "tier": "large",
        "selectable": true,
        "games": [
            "legacy-runtime",
            "rise-sunbreak",
            "generations-ultimate"
        ],
        "evidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "species": "Flying Wyvern",
        "baseHealth": 4900,
        "weaknesses": [
            {
                "state": "Normal",
                "elements": {
                    "fire": 1,
                    "water": 6,
                    "thunder": 5,
                    "ice": 3,
                    "dragon": 0
                },
                "statuses": {
                    "poison": 3,
                    "paralysis": 3,
                    "sleep": 4
                },
                "tools": {
                    "pitfallTrap": 1,
                    "shockTrap": 1,
                    "flashBomb": 1
                }
            }
        ],
        "breakablePartKinds": [
            "Head",
            "Neck",
            "Back",
            "Belly",
            "Tail",
            "Wings",
            "Legs",
            "Tail Tip",
            "Head (Break)"
        ],
        "sourceIds": {
            "rise-sunbreak": "1532413416",
            "generations-ultimate": "514"
        },
        "anatomyEvidence": "mhgudb-sqlite-hitzones-status-and-habitat",
        "mediaEvidence": "mhgudb-sqlite-monster-anatomy-and-habitat",
        "locations": [
            "Jurassic Frontier",
            "Verdant Hills",
            "Misty Peaks"
        ],
        "variantOf": null,
        "role": "combat",
        "journeyEventId": null,
        "speciesKO": "비룡종",
        "skeleton": [
            "Flying wyvern",
            "Arial"
        ],
        "locomotion": {
            "defaultMovePattern": "fly",
            "flyingStanceToMove": true
        },
        "roar": {
            "status": "verified-present",
            "strength": "Weak roar",
            "evidence": "mhrice-installed-move-table-and-internal-species",
            "audioStatus": "unresolved"
        },
        "canonicalEdition": "world-iceborne",
        "releaseReview": "world-flying-batch-2026-07-28",
        "mechanicModules": [
            "common",
            "flight",
            "rath-family"
        ]
    }
].map(monster => Object.freeze(monster)));
if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_RELEASED_MONSTER_DATA;
else globalThis.HUNT_RELEASED_MONSTER_DATA = HUNT_RELEASED_MONSTER_DATA;

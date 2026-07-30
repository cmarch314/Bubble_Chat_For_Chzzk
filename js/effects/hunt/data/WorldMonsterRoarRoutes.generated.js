'use strict';

const HUNT_WORLD_MONSTER_ROAR_ROUTES = Object.freeze({
  "rathian:roar": [
    {
      "label": "Rathian/Rathalos shared signature roar",
      "evidence": {
        "type": "world-user-audition-event-chain",
        "sourceReference": {
          "type": "labelled-community-map",
          "source": "MHW Audio Modding Google workbook",
          "location": "Bank Index!E122"
        },
        "bank": "em001_vo",
        "ordinalBasis": "audition-confirmed-source",
        "referenceWemNumber": 87,
        "decodedStream": 91,
        "eventIds": [
          "1991097789"
        ],
        "sourceIds": [
          "721725382"
        ],
        "sourceStream": "721725382",
        "confirmation": {
          "label": "Rathian/Rathalos shared signature roar",
          "sourceStream": "721725382",
          "eventIds": [
            "1991097789"
          ],
          "monsterIds": [
            "rathian",
            "rathalos"
          ],
          "verification": "user-audition",
          "verifiedAt": "2026-07-28"
        }
      },
      "layers": [
        [
          "local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_091_721725382.mp3",
          0.78,
          0
        ]
      ]
    }
  ],
  "rathalos:roar": [
    {
      "label": "Rathian/Rathalos shared signature roar",
      "evidence": {
        "type": "world-user-audition-event-chain",
        "sourceReference": {
          "type": "labelled-community-map",
          "source": "MHW Audio Modding Google workbook",
          "location": "Bank Index!E122"
        },
        "bank": "em001_vo",
        "ordinalBasis": "audition-confirmed-source",
        "referenceWemNumber": 87,
        "decodedStream": 91,
        "eventIds": [
          "1991097789"
        ],
        "sourceIds": [
          "721725382"
        ],
        "sourceStream": "721725382",
        "confirmation": {
          "label": "Rathian/Rathalos shared signature roar",
          "sourceStream": "721725382",
          "eventIds": [
            "1991097789"
          ],
          "monsterIds": [
            "rathian",
            "rathalos"
          ],
          "verification": "user-audition",
          "verifiedAt": "2026-07-28"
        }
      },
      "layers": [
        [
          "local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_091_721725382.mp3",
          0.78,
          0
        ]
      ]
    }
  ],
  "diablos:roar": [
    {
      "label": "Diablos signature roar",
      "evidence": {
        "type": "world-user-audition-event-chain",
        "sourceReference": {
          "type": "labelled-community-map",
          "source": "MHW Audio Modding Google workbook",
          "location": "Bank Index!E125"
        },
        "bank": "em007_vo",
        "ordinalBasis": "audition-confirmed-source",
        "referenceWemNumber": 54,
        "decodedStream": 56,
        "eventIds": [
          "1263597779"
        ],
        "sourceIds": [
          "543762063"
        ],
        "sourceStream": "543762063",
        "confirmation": {
          "label": "Diablos signature roar",
          "sourceStream": "543762063",
          "eventIds": [
            "1263597779"
          ],
          "verification": "user-audition",
          "verifiedAt": "2026-07-25"
        }
      },
      "layers": [
        [
          "local_assets/monster_hunter/world/monster/em007/em007_vo_nbnk_056_543762063.mp3",
          0.78,
          0
        ]
      ]
    }
  ]
});
const HUNT_WORLD_MONSTER_ROAR_UNRESOLVED = Object.freeze([
  {
    "bank": "em011_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 88,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 88,
        "sourceStream": "851733936",
        "eventIds": [
          "1199489271"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_088_851733936.mp3"
      },
      {
        "referenceWemNumber": 88,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 89,
        "sourceStream": "861393576",
        "eventIds": [
          "1893936231"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_089_861393576.mp3"
      },
      {
        "referenceWemNumber": 92,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 92,
        "sourceStream": "889870420",
        "eventIds": [
          "2850667022"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_092_889870420.mp3"
      },
      {
        "referenceWemNumber": 92,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 93,
        "sourceStream": "896925450",
        "eventIds": [
          "2677040151"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_093_896925450.mp3"
      }
    ]
  },
  {
    "bank": "em023_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 52,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 52,
        "sourceStream": "330776805",
        "eventIds": [
          "3193998513"
        ],
        "path": "local_assets/monster_hunter/world/monster/em023/em023_vo_nbnk_052_330776805.mp3"
      },
      {
        "referenceWemNumber": 52,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 55,
        "sourceStream": "379584116",
        "eventIds": [
          "571465291"
        ],
        "path": "local_assets/monster_hunter/world/monster/em023/em023_vo_nbnk_055_379584116.mp3"
      }
    ]
  },
  {
    "bank": "em024_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 24,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 24,
        "sourceStream": "207572245",
        "eventIds": [
          "1796951406"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_024_207572245.mp3"
      },
      {
        "referenceWemNumber": 24,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 26,
        "sourceStream": "227756005",
        "eventIds": [
          "1027032621"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_026_227756005.mp3"
      },
      {
        "referenceWemNumber": 34,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 34,
        "sourceStream": "294999941",
        "eventIds": [
          "2736120957"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_034_294999941.mp3"
      },
      {
        "referenceWemNumber": 34,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 36,
        "sourceStream": "304699923",
        "eventIds": [
          "3455963807"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_036_304699923.mp3"
      }
    ]
  },
  {
    "bank": "em026_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 18,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 18,
        "sourceStream": "206753846",
        "eventIds": [
          "9541907"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_018_206753846.mp3"
      },
      {
        "referenceWemNumber": 18,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 21,
        "sourceStream": "221986094",
        "eventIds": [
          "1353900563"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_021_221986094.mp3"
      },
      {
        "referenceWemNumber": 39,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 39,
        "sourceStream": "345810039",
        "eventIds": [
          "3504934446"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_039_345810039.mp3"
      },
      {
        "referenceWemNumber": 39,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 46,
        "sourceStream": "382896812",
        "eventIds": [
          "3847648653"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_046_382896812.mp3"
      }
    ]
  },
  {
    "bank": "em027_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 29,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 29,
        "sourceStream": "313120888",
        "eventIds": [
          "2702480693"
        ],
        "path": "local_assets/monster_hunter/world/monster/em027/em027_vo_nbnk_029_313120888.mp3"
      }
    ]
  },
  {
    "bank": "em036_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 87,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 94,
        "sourceStream": "782056484",
        "eventIds": [
          "3224597940"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_094_782056484.mp3"
      },
      {
        "referenceWemNumber": 89,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 89,
        "sourceStream": "727855205",
        "eventIds": [
          "3357059819"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_089_727855205.mp3"
      },
      {
        "referenceWemNumber": 89,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 97,
        "sourceStream": "794913146",
        "eventIds": [
          "3952128864"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_097_794913146.mp3"
      }
    ]
  },
  {
    "bank": "em037_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 121,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 121,
        "sourceStream": "954859918",
        "eventIds": [
          "4264562554"
        ],
        "path": "local_assets/monster_hunter/world/monster/em037/em037_vo_nbnk_121_954859918.mp3"
      },
      {
        "referenceWemNumber": 121,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 122,
        "sourceStream": "963757232",
        "eventIds": [
          "3465526422"
        ],
        "path": "local_assets/monster_hunter/world/monster/em037/em037_vo_nbnk_122_963757232.mp3"
      }
    ]
  },
  {
    "bank": "em043_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 36,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 36,
        "sourceStream": "183982413",
        "eventIds": [
          "566267486"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_036_183982413.mp3"
      },
      {
        "referenceWemNumber": 36,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 37,
        "sourceStream": "187153585",
        "eventIds": [
          "2588565619"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_037_187153585.mp3"
      },
      {
        "referenceWemNumber": 172,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 172,
        "sourceStream": "911641999",
        "eventIds": [
          "2875596925"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_172_911641999.mp3"
      },
      {
        "referenceWemNumber": 172,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 173,
        "sourceStream": "945113092",
        "eventIds": [
          "2636319730"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_173_945113092.mp3"
      }
    ]
  },
  {
    "bank": "em044_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 2,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 2,
        "sourceStream": "30982086",
        "eventIds": [
          "3659503123"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_002_30982086.mp3"
      },
      {
        "referenceWemNumber": 2,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 3,
        "sourceStream": "31853744",
        "eventIds": [
          "1715368110"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_003_31853744.mp3"
      },
      {
        "referenceWemNumber": 127,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 127,
        "sourceStream": "1018282475",
        "eventIds": [
          "1739779726"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_127_1018282475.mp3"
      },
      {
        "referenceWemNumber": 127,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 131,
        "sourceStream": "1043944664",
        "eventIds": [
          "4249912261"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_131_1043944664.mp3"
      }
    ]
  },
  {
    "bank": "em045_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 50,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 50,
        "sourceStream": "416529856",
        "eventIds": [
          "3829806857"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_050_416529856.mp3"
      },
      {
        "referenceWemNumber": 50,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 53,
        "sourceStream": "467454748",
        "eventIds": [
          "2956875094"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_053_467454748.mp3"
      },
      {
        "referenceWemNumber": 75,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 75,
        "sourceStream": "653663447",
        "eventIds": [
          "172051335"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_075_653663447.mp3"
      },
      {
        "referenceWemNumber": 75,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 78,
        "sourceStream": "717041824",
        "eventIds": [
          "1039350508"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_078_717041824.mp3"
      }
    ]
  },
  {
    "bank": "em102_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 48,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 48,
        "sourceStream": "362681955",
        "eventIds": [
          "1026564"
        ],
        "path": "local_assets/monster_hunter/world/monster/em102/em102_vo_nbnk_048_362681955.mp3"
      },
      {
        "referenceWemNumber": 48,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 49,
        "sourceStream": "368947065",
        "eventIds": [
          "651637871"
        ],
        "path": "local_assets/monster_hunter/world/monster/em102/em102_vo_nbnk_049_368947065.mp3"
      }
    ]
  },
  {
    "bank": "em103_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 60,
        "sourceStream": "614181179",
        "eventIds": [
          "3315813618"
        ],
        "path": "local_assets/monster_hunter/world/monster/em103/em103_vo_nbnk_060_614181179.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 63,
        "sourceStream": "637568115",
        "eventIds": [
          "3315813624"
        ],
        "path": "local_assets/monster_hunter/world/monster/em103/em103_vo_nbnk_063_637568115.mp3"
      }
    ]
  },
  {
    "bank": "em104_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 117,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 117,
        "sourceStream": "937363759",
        "eventIds": [
          "1518264465"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_117_937363759.mp3"
      },
      {
        "referenceWemNumber": 117,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 118,
        "sourceStream": "952513829",
        "eventIds": [
          "1826997752"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_118_952513829.mp3"
      },
      {
        "referenceWemNumber": 128,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 128,
        "sourceStream": "1026646269",
        "eventIds": [
          "292792440"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_128_1026646269.mp3"
      },
      {
        "referenceWemNumber": 128,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 129,
        "sourceStream": "1032977519",
        "eventIds": [
          "2722199275"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_129_1032977519.mp3"
      }
    ]
  },
  {
    "bank": "em106_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 13,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 13,
        "sourceStream": "274942992",
        "eventIds": [
          "1076221620"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_013_274942992.mp3"
      },
      {
        "referenceWemNumber": 13,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 14,
        "sourceStream": "277523044",
        "eventIds": [
          "3471002227"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_014_277523044.mp3"
      },
      {
        "referenceWemNumber": 58,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 58,
        "sourceStream": "810975996",
        "eventIds": [
          "674544630"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_058_810975996.mp3"
      },
      {
        "referenceWemNumber": 58,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 59,
        "sourceStream": "851749235",
        "eventIds": [
          "3761843962"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_059_851749235.mp3"
      }
    ]
  },
  {
    "bank": "em107_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 22,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 22,
        "sourceStream": "142815062",
        "eventIds": [
          "4246918001"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_022_142815062.mp3"
      },
      {
        "referenceWemNumber": 22,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 24,
        "sourceStream": "175578589",
        "eventIds": [
          "1457046155"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_024_175578589.mp3"
      },
      {
        "referenceWemNumber": 112,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 112,
        "sourceStream": "1054250723",
        "eventIds": [
          "3500993482"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_112_1054250723.mp3"
      },
      {
        "referenceWemNumber": 112,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 114,
        "sourceStream": "1056698376",
        "eventIds": [
          "4209166500"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_114_1056698376.mp3"
      }
    ]
  },
  {
    "bank": "em109_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 62,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 62,
        "sourceStream": "495388163",
        "eventIds": [
          "996565541"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_062_495388163.mp3"
      },
      {
        "referenceWemNumber": 62,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 63,
        "sourceStream": "496790235",
        "eventIds": [
          "1483884846"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_063_496790235.mp3"
      },
      {
        "referenceWemNumber": 140,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 140,
        "sourceStream": "984720493",
        "eventIds": [
          "2467265451"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_140_984720493.mp3"
      },
      {
        "referenceWemNumber": 140,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 141,
        "sourceStream": "1006052595",
        "eventIds": [
          "3715166899"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_141_1006052595.mp3"
      }
    ]
  },
  {
    "bank": "em110_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 79,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 79,
        "sourceStream": "890527690",
        "eventIds": [
          "3819626308"
        ],
        "path": "local_assets/monster_hunter/world/monster/em110/em110_vo_nbnk_079_890527690.mp3"
      },
      {
        "referenceWemNumber": 79,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 89,
        "sourceStream": "956963303",
        "eventIds": [
          "641745280"
        ],
        "path": "local_assets/monster_hunter/world/monster/em110/em110_vo_nbnk_089_956963303.mp3"
      }
    ]
  },
  {
    "bank": "em111_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 40,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 40,
        "sourceStream": "386696490",
        "eventIds": [
          "3411438907"
        ],
        "path": "local_assets/monster_hunter/world/monster/em111/em111_vo_nbnk_040_386696490.mp3"
      },
      {
        "referenceWemNumber": 40,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 41,
        "sourceStream": "388839610",
        "eventIds": [
          "4086301915"
        ],
        "path": "local_assets/monster_hunter/world/monster/em111/em111_vo_nbnk_041_388839610.mp3"
      }
    ]
  },
  {
    "bank": "em112_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 93,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 93,
        "sourceStream": "624300947",
        "eventIds": [
          "3117425480"
        ],
        "path": "local_assets/monster_hunter/world/monster/em112/em112_vo_nbnk_093_624300947.mp3"
      },
      {
        "referenceWemNumber": 93,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 94,
        "sourceStream": "627275032",
        "eventIds": [
          "4093914803"
        ],
        "path": "local_assets/monster_hunter/world/monster/em112/em112_vo_nbnk_094_627275032.mp3"
      }
    ]
  },
  {
    "bank": "em113_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 59,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 59,
        "sourceStream": "460769289",
        "eventIds": [
          "595223075"
        ],
        "path": "local_assets/monster_hunter/world/monster/em113/em113_vo_nbnk_059_460769289.mp3"
      },
      {
        "referenceWemNumber": 59,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 62,
        "sourceStream": "468973410",
        "eventIds": [
          "921300987"
        ],
        "path": "local_assets/monster_hunter/world/monster/em113/em113_vo_nbnk_062_468973410.mp3"
      }
    ]
  },
  {
    "bank": "em120_vo",
    "reason": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 15,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 15,
        "sourceStream": "126401446",
        "eventIds": [
          "1747110759"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_015_126401446.mp3"
      },
      {
        "referenceWemNumber": 15,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 16,
        "sourceStream": "132401129",
        "eventIds": [
          "2259135772"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_016_132401129.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 60,
        "sourceStream": "586882371",
        "eventIds": [
          "123411672"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_060_586882371.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 62,
        "sourceStream": "600666623",
        "eventIds": [
          "1145147377"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_062_600666623.mp3"
      }
    ]
  }
]);

const HUNT_WORLD_MONSTER_ROAR_REVIEW = Object.freeze([
  {
    "bank": "em001_vo",
    "monsterIds": [
      "rathian",
      "rathalos"
    ],
    "status": "user-confirmed",
    "candidates": [
      {
        "referenceWemNumber": 87,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 87,
        "sourceStream": "695415387",
        "eventIds": [
          "1196173475"
        ],
        "path": "local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_087_695415387.mp3"
      },
      {
        "referenceWemNumber": 87,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 88,
        "sourceStream": "700522644",
        "eventIds": [
          "318476352"
        ],
        "path": "local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_088_700522644.mp3"
      }
    ]
  },
  {
    "bank": "em007_vo",
    "monsterIds": [
      "diablos"
    ],
    "status": "user-confirmed",
    "candidates": [
      {
        "referenceWemNumber": 54,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 54,
        "sourceStream": "520295467",
        "eventIds": [
          "2109899398"
        ],
        "path": "local_assets/monster_hunter/world/monster/em007/em007_vo_nbnk_054_520295467.mp3"
      },
      {
        "referenceWemNumber": 54,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 56,
        "sourceStream": "543762063",
        "eventIds": [
          "1263597779"
        ],
        "path": "local_assets/monster_hunter/world/monster/em007/em007_vo_nbnk_056_543762063.mp3"
      }
    ]
  },
  {
    "bank": "em011_vo",
    "monsterIds": [
      "kirin"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 88,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 88,
        "sourceStream": "851733936",
        "eventIds": [
          "1199489271"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_088_851733936.mp3"
      },
      {
        "referenceWemNumber": 88,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 89,
        "sourceStream": "861393576",
        "eventIds": [
          "1893936231"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_089_861393576.mp3"
      },
      {
        "referenceWemNumber": 92,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 92,
        "sourceStream": "889870420",
        "eventIds": [
          "2850667022"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_092_889870420.mp3"
      },
      {
        "referenceWemNumber": 92,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 93,
        "sourceStream": "896925450",
        "eventIds": [
          "2677040151"
        ],
        "path": "local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_093_896925450.mp3"
      }
    ]
  },
  {
    "bank": "em023_vo",
    "monsterIds": [
      "rajang"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 52,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 52,
        "sourceStream": "330776805",
        "eventIds": [
          "3193998513"
        ],
        "path": "local_assets/monster_hunter/world/monster/em023/em023_vo_nbnk_052_330776805.mp3"
      },
      {
        "referenceWemNumber": 52,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 55,
        "sourceStream": "379584116",
        "eventIds": [
          "571465291"
        ],
        "path": "local_assets/monster_hunter/world/monster/em023/em023_vo_nbnk_055_379584116.mp3"
      }
    ]
  },
  {
    "bank": "em024_vo",
    "monsterIds": [
      "kushala_daora"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 24,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 24,
        "sourceStream": "207572245",
        "eventIds": [
          "1796951406"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_024_207572245.mp3"
      },
      {
        "referenceWemNumber": 24,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 26,
        "sourceStream": "227756005",
        "eventIds": [
          "1027032621"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_026_227756005.mp3"
      },
      {
        "referenceWemNumber": 34,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 34,
        "sourceStream": "294999941",
        "eventIds": [
          "2736120957"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_034_294999941.mp3"
      },
      {
        "referenceWemNumber": 34,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 36,
        "sourceStream": "304699923",
        "eventIds": [
          "3455963807"
        ],
        "path": "local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_036_304699923.mp3"
      }
    ]
  },
  {
    "bank": "em026_vo",
    "monsterIds": [
      "lunastra"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 18,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 18,
        "sourceStream": "206753846",
        "eventIds": [
          "9541907"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_018_206753846.mp3"
      },
      {
        "referenceWemNumber": 18,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 21,
        "sourceStream": "221986094",
        "eventIds": [
          "1353900563"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_021_221986094.mp3"
      },
      {
        "referenceWemNumber": 39,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 39,
        "sourceStream": "345810039",
        "eventIds": [
          "3504934446"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_039_345810039.mp3"
      },
      {
        "referenceWemNumber": 39,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 46,
        "sourceStream": "382896812",
        "eventIds": [
          "3847648653"
        ],
        "path": "local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_046_382896812.mp3"
      }
    ]
  },
  {
    "bank": "em027_vo",
    "monsterIds": [
      "teostra"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 29,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 29,
        "sourceStream": "313120888",
        "eventIds": [
          "2702480693"
        ],
        "path": "local_assets/monster_hunter/world/monster/em027/em027_vo_nbnk_029_313120888.mp3"
      }
    ]
  },
  {
    "bank": "em036_vo",
    "monsterIds": [
      "jyuratodus",
      "lavasioth"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 87,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 94,
        "sourceStream": "782056484",
        "eventIds": [
          "3224597940"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_094_782056484.mp3"
      },
      {
        "referenceWemNumber": 89,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 89,
        "sourceStream": "727855205",
        "eventIds": [
          "3357059819"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_089_727855205.mp3"
      },
      {
        "referenceWemNumber": 89,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 97,
        "sourceStream": "794913146",
        "eventIds": [
          "3952128864"
        ],
        "path": "local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_097_794913146.mp3"
      }
    ]
  },
  {
    "bank": "em037_vo",
    "monsterIds": [
      "nargacuga"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 121,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 121,
        "sourceStream": "954859918",
        "eventIds": [
          "4264562554"
        ],
        "path": "local_assets/monster_hunter/world/monster/em037/em037_vo_nbnk_121_954859918.mp3"
      },
      {
        "referenceWemNumber": 121,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 122,
        "sourceStream": "963757232",
        "eventIds": [
          "3465526422"
        ],
        "path": "local_assets/monster_hunter/world/monster/em037/em037_vo_nbnk_122_963757232.mp3"
      }
    ]
  },
  {
    "bank": "em043_vo",
    "monsterIds": [
      "deviljho"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 36,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 36,
        "sourceStream": "183982413",
        "eventIds": [
          "566267486"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_036_183982413.mp3"
      },
      {
        "referenceWemNumber": 36,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 37,
        "sourceStream": "187153585",
        "eventIds": [
          "2588565619"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_037_187153585.mp3"
      },
      {
        "referenceWemNumber": 172,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 172,
        "sourceStream": "911641999",
        "eventIds": [
          "2875596925"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_172_911641999.mp3"
      },
      {
        "referenceWemNumber": 172,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 173,
        "sourceStream": "945113092",
        "eventIds": [
          "2636319730"
        ],
        "path": "local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_173_945113092.mp3"
      }
    ]
  },
  {
    "bank": "em044_vo",
    "monsterIds": [
      "barroth"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 2,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 2,
        "sourceStream": "30982086",
        "eventIds": [
          "3659503123"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_002_30982086.mp3"
      },
      {
        "referenceWemNumber": 2,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 3,
        "sourceStream": "31853744",
        "eventIds": [
          "1715368110"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_003_31853744.mp3"
      },
      {
        "referenceWemNumber": 127,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 127,
        "sourceStream": "1018282475",
        "eventIds": [
          "1739779726"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_127_1018282475.mp3"
      },
      {
        "referenceWemNumber": 127,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 131,
        "sourceStream": "1043944664",
        "eventIds": [
          "4249912261"
        ],
        "path": "local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_131_1043944664.mp3"
      }
    ]
  },
  {
    "bank": "em045_vo",
    "monsterIds": [
      "uragaan",
      "radobaan"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 50,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 50,
        "sourceStream": "416529856",
        "eventIds": [
          "3829806857"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_050_416529856.mp3"
      },
      {
        "referenceWemNumber": 50,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 53,
        "sourceStream": "467454748",
        "eventIds": [
          "2956875094"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_053_467454748.mp3"
      },
      {
        "referenceWemNumber": 75,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 75,
        "sourceStream": "653663447",
        "eventIds": [
          "172051335"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_075_653663447.mp3"
      },
      {
        "referenceWemNumber": 75,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 78,
        "sourceStream": "717041824",
        "eventIds": [
          "1039350508"
        ],
        "path": "local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_078_717041824.mp3"
      }
    ]
  },
  {
    "bank": "em102_vo",
    "monsterIds": [
      "pukei_pukei"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 48,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 48,
        "sourceStream": "362681955",
        "eventIds": [
          "1026564"
        ],
        "path": "local_assets/monster_hunter/world/monster/em102/em102_vo_nbnk_048_362681955.mp3"
      },
      {
        "referenceWemNumber": 48,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 49,
        "sourceStream": "368947065",
        "eventIds": [
          "651637871"
        ],
        "path": "local_assets/monster_hunter/world/monster/em102/em102_vo_nbnk_049_368947065.mp3"
      }
    ]
  },
  {
    "bank": "em103_vo",
    "monsterIds": [
      "nergigante"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 60,
        "sourceStream": "614181179",
        "eventIds": [
          "3315813618"
        ],
        "path": "local_assets/monster_hunter/world/monster/em103/em103_vo_nbnk_060_614181179.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 63,
        "sourceStream": "637568115",
        "eventIds": [
          "3315813624"
        ],
        "path": "local_assets/monster_hunter/world/monster/em103/em103_vo_nbnk_063_637568115.mp3"
      }
    ]
  },
  {
    "bank": "em104_vo",
    "monsterIds": [
      "safi_jiiva"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 117,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 117,
        "sourceStream": "937363759",
        "eventIds": [
          "1518264465"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_117_937363759.mp3"
      },
      {
        "referenceWemNumber": 117,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 118,
        "sourceStream": "952513829",
        "eventIds": [
          "1826997752"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_118_952513829.mp3"
      },
      {
        "referenceWemNumber": 128,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 128,
        "sourceStream": "1026646269",
        "eventIds": [
          "292792440"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_128_1026646269.mp3"
      },
      {
        "referenceWemNumber": 128,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 129,
        "sourceStream": "1032977519",
        "eventIds": [
          "2722199275"
        ],
        "path": "local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_129_1032977519.mp3"
      }
    ]
  },
  {
    "bank": "em106_vo",
    "monsterIds": [
      "zorah_magdaros"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 13,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 13,
        "sourceStream": "274942992",
        "eventIds": [
          "1076221620"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_013_274942992.mp3"
      },
      {
        "referenceWemNumber": 13,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 14,
        "sourceStream": "277523044",
        "eventIds": [
          "3471002227"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_014_277523044.mp3"
      },
      {
        "referenceWemNumber": 58,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 58,
        "sourceStream": "810975996",
        "eventIds": [
          "674544630"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_058_810975996.mp3"
      },
      {
        "referenceWemNumber": 58,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 59,
        "sourceStream": "851749235",
        "eventIds": [
          "3761843962"
        ],
        "path": "local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_059_851749235.mp3"
      }
    ]
  },
  {
    "bank": "em107_vo",
    "monsterIds": [
      "kulu_ya_ku"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 22,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 22,
        "sourceStream": "142815062",
        "eventIds": [
          "4246918001"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_022_142815062.mp3"
      },
      {
        "referenceWemNumber": 22,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 24,
        "sourceStream": "175578589",
        "eventIds": [
          "1457046155"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_024_175578589.mp3"
      },
      {
        "referenceWemNumber": 112,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 112,
        "sourceStream": "1054250723",
        "eventIds": [
          "3500993482"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_112_1054250723.mp3"
      },
      {
        "referenceWemNumber": 112,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 114,
        "sourceStream": "1056698376",
        "eventIds": [
          "4209166500"
        ],
        "path": "local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_114_1056698376.mp3"
      }
    ]
  },
  {
    "bank": "em109_vo",
    "monsterIds": [
      "tobi_kadachi"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 62,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 62,
        "sourceStream": "495388163",
        "eventIds": [
          "996565541"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_062_495388163.mp3"
      },
      {
        "referenceWemNumber": 62,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 63,
        "sourceStream": "496790235",
        "eventIds": [
          "1483884846"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_063_496790235.mp3"
      },
      {
        "referenceWemNumber": 140,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 140,
        "sourceStream": "984720493",
        "eventIds": [
          "2467265451"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_140_984720493.mp3"
      },
      {
        "referenceWemNumber": 140,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 141,
        "sourceStream": "1006052595",
        "eventIds": [
          "3715166899"
        ],
        "path": "local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_141_1006052595.mp3"
      }
    ]
  },
  {
    "bank": "em110_vo",
    "monsterIds": [
      "paolumu"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 79,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 79,
        "sourceStream": "890527690",
        "eventIds": [
          "3819626308"
        ],
        "path": "local_assets/monster_hunter/world/monster/em110/em110_vo_nbnk_079_890527690.mp3"
      },
      {
        "referenceWemNumber": 79,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 89,
        "sourceStream": "956963303",
        "eventIds": [
          "641745280"
        ],
        "path": "local_assets/monster_hunter/world/monster/em110/em110_vo_nbnk_089_956963303.mp3"
      }
    ]
  },
  {
    "bank": "em111_vo",
    "monsterIds": [
      "legiana"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 40,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 40,
        "sourceStream": "386696490",
        "eventIds": [
          "3411438907"
        ],
        "path": "local_assets/monster_hunter/world/monster/em111/em111_vo_nbnk_040_386696490.mp3"
      },
      {
        "referenceWemNumber": 40,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 41,
        "sourceStream": "388839610",
        "eventIds": [
          "4086301915"
        ],
        "path": "local_assets/monster_hunter/world/monster/em111/em111_vo_nbnk_041_388839610.mp3"
      }
    ]
  },
  {
    "bank": "em112_vo",
    "monsterIds": [
      "great_girros"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 93,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 93,
        "sourceStream": "624300947",
        "eventIds": [
          "3117425480"
        ],
        "path": "local_assets/monster_hunter/world/monster/em112/em112_vo_nbnk_093_624300947.mp3"
      },
      {
        "referenceWemNumber": 93,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 94,
        "sourceStream": "627275032",
        "eventIds": [
          "4093914803"
        ],
        "path": "local_assets/monster_hunter/world/monster/em112/em112_vo_nbnk_094_627275032.mp3"
      }
    ]
  },
  {
    "bank": "em113_vo",
    "monsterIds": [
      "odogaron"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 59,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 59,
        "sourceStream": "460769289",
        "eventIds": [
          "595223075"
        ],
        "path": "local_assets/monster_hunter/world/monster/em113/em113_vo_nbnk_059_460769289.mp3"
      },
      {
        "referenceWemNumber": 59,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 62,
        "sourceStream": "468973410",
        "eventIds": [
          "921300987"
        ],
        "path": "local_assets/monster_hunter/world/monster/em113/em113_vo_nbnk_062_468973410.mp3"
      }
    ]
  },
  {
    "bank": "em120_vo",
    "monsterIds": [
      "tzitzi_ya_ku"
    ],
    "status": "needs-audition",
    "candidates": [
      {
        "referenceWemNumber": 15,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 15,
        "sourceStream": "126401446",
        "eventIds": [
          "1747110759"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_015_126401446.mp3"
      },
      {
        "referenceWemNumber": 15,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 16,
        "sourceStream": "132401129",
        "eventIds": [
          "2259135772"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_016_132401129.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "direct-decoded-stream"
        ],
        "decodedStream": 60,
        "sourceStream": "586882371",
        "eventIds": [
          "123411672"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_060_586882371.mp3"
      },
      {
        "referenceWemNumber": 60,
        "mappingBases": [
          "zero-based-decoded-index"
        ],
        "decodedStream": 62,
        "sourceStream": "600666623",
        "eventIds": [
          "1145147377"
        ],
        "path": "local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_062_600666623.mp3"
      }
    ]
  }
]);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HUNT_WORLD_MONSTER_ROAR_ROUTES, HUNT_WORLD_MONSTER_ROAR_UNRESOLVED, HUNT_WORLD_MONSTER_ROAR_REVIEW };
} else {
    window.HUNT_WORLD_MONSTER_ROAR_ROUTES = HUNT_WORLD_MONSTER_ROAR_ROUTES;
    window.HUNT_WORLD_MONSTER_ROAR_UNRESOLVED = HUNT_WORLD_MONSTER_ROAR_UNRESOLVED;
    window.HUNT_WORLD_MONSTER_ROAR_REVIEW = HUNT_WORLD_MONSTER_ROAR_REVIEW;
}

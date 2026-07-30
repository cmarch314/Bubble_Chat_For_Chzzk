window.HUNT_MHXX_MONSTER_BEHAVIOR = {
  "agnaktor": {
    "id": "agnaktor",
    "nameEN": "Agnaktor",
    "nameKO": "아그나코트",
    "species": {
      "nameJA": "海竜種",
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "agnaktor.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "agnaktor.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "agnaktor.rise.1.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "agnaktor.rise.2.burrow",
        "name": "돌진",
        "sourceMoveNameJA": "潜行して突進",
        "type": "burrow",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "潜行して突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "agnaktor.rise.3.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "体当たり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "agnaktor.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続してかみつく",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続してかみつく",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "agnaktor.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続ついばみ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続ついばみ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "amatsu": {
    "id": "amatsu",
    "nameEN": "Amatsu",
    "nameKO": "아마츠마가츠치",
    "species": {
      "nameJA": "古龍種",
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "amatsu.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "amatsu.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.1.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.2.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "左腕なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "左腕なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "サパーソルト尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "サパーソルト尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.4.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進(弱)",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進(弱)",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "arzuros": {
    "id": "arzuros",
    "nameEN": "Arzuros",
    "nameKO": "아오아시라",
    "species": {
      "nameJA": "牙獣種",
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "arzuros.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続ひっかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続ひっかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "両手ひっかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "両手ひっかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.2.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転引っかき",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転引っかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "拘束",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "blangonga": {
    "id": "blangonga",
    "nameEN": "Blangonga",
    "nameKO": "도도블랑고",
    "species": {
      "nameJA": "牙竜種",
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "blangonga.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "blangonga.rise.0.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "blangonga.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "殴りかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "殴りかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "blangonga.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "雪玉投げ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "雪玉投げ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "blangonga.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "blangonga.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "後脚蹴り",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "後脚蹴り",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "blangonga.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "冷凍ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "冷凍ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "brachydios": {
    "id": "brachydios",
    "nameEN": "Brachydios",
    "nameKO": "브라키디오스",
    "species": {
      "nameJA": "獣竜種",
      "nameEN": "Brute Wyvern",
      "nameKO": "수룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "brachydios.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "brachydios.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "回り込む",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回り込む",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "brachydios.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "パンチ攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "パンチ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "brachydios.rise.2.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "叩きつけ攻撃",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "叩きつけ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "brachydios.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかりパンチ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかりパンチ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "brachydios.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "粘菌塗布",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "粘菌塗布",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "brachydios.rise.5.area",
        "name": "폭발",
        "sourceMoveNameJA": "直線爆発",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "直線爆発",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "bulldrome": {
    "id": "bulldrome",
    "nameEN": "Bulldrome",
    "nameKO": "도스팽고",
    "species": {
      "nameJA": "牙獣種",
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bulldrome.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "bulldrome.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進(長距離)",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進(長距離)",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "bulldrome.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "牙攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "牙攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "cephadrome": {
    "id": "cephadrome",
    "nameEN": "Cephadrome",
    "nameKO": "도스가레오스",
    "species": {
      "nameJA": "魚竜種",
      "nameEN": "Piscine Wyvern",
      "nameKO": "어룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "cephadrome.rise.0.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "cephadrome.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "体当たり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "cephadrome.rise.2.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "砂ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "砂ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "cephadrome.rise.3.3",
        "name": "3 브레스",
        "sourceMoveNameJA": "3連続砂ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "3連続砂ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "cephadrome.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "這いずり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "這いずり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "cephadrome.rise.5.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "chameleos": {
    "id": "chameleos",
    "nameEN": "Chameleos",
    "nameKO": "오오나즈치",
    "species": {
      "nameJA": "古龍種",
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "chameleos.rise.0.charge",
        "name": "돌진 휩쓸기",
        "sourceMoveNameJA": "突進からの舌なぎ払い",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進からの舌なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.1.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "舌なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "舌なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.2.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "引っかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "引っかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.4.sweep",
        "name": "꼬리 내려찍기",
        "sourceMoveNameJA": "後方尻尾を叩きつけ",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "後方尻尾を叩きつけ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "毒霧ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "毒霧ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "daimyo_hermitaur": {
    "id": "daimyo_hermitaur",
    "nameEN": "Daimyo Hermitaur",
    "nameKO": "다이묘자자미",
    "species": {
      "nameJA": "甲殻種",
      "nameEN": "Carapaceon",
      "nameKO": "갑각종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "daimyo_hermitaur.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "泡のブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "泡のブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.1.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "左右の爪攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "左右の爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.4.burrow",
        "name": "지중 급습",
        "sourceMoveNameJA": "地中からの突き上げ",
        "type": "burrow",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "地中からの突き上げ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "特殊なガード",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "特殊なガード",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "great_maccao": {
    "id": "great_maccao",
    "nameEN": "Great Maccao",
    "nameKO": "도스마카오",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "great_maccao.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "仲間呼び",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "仲間呼び",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "great_maccao.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ひっかき攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ひっかき攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "great_maccao.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾で支えて連続で引っかいてくる",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾で支えて連続で引っかいてくる",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "great_maccao.rise.3.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "タックル",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "タックル",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "great_maccao.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "great_maccao.rise.5.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾立ち",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾立ち",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "duramboros": {
    "id": "duramboros",
    "nameEN": "Duramboros",
    "nameKO": "도볼베르크",
    "species": {
      "nameJA": "獣竜種",
      "nameEN": "Brute Wyvern",
      "nameKO": "수룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "duramboros.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "duramboros.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "duramboros.rise.1.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾叩きつけ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "duramboros.rise.2.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "duramboros.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "duramboros.rise.4.sweep",
        "name": "회전",
        "sourceMoveNameJA": "大回転",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "大回転",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "duramboros.rise.5.aerial",
        "name": "회전 점프",
        "sourceMoveNameJA": "大回転後のジャンプ攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "大回転後のジャンプ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "giadrome": {
    "id": "giadrome",
    "nameEN": "Giadrome",
    "nameKO": "도스기아노스",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "giadrome.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "giadrome.rise.1.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "凍結液吐き",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "凍結液吐き",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "gore_magala": {
    "id": "gore_magala",
    "nameEN": "Gore Magala",
    "nameKO": "고어 마가라",
    "species": {
      "nameJA": "-",
      "nameEN": null,
      "nameKO": null,
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gore_magala.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "gore_magala.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.2.s",
        "name": "S 돌진",
        "sourceMoveNameJA": "S字突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "S字突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.4.3",
        "name": "3 브레스",
        "sourceMoveNameJA": "3連ブレス攻撃",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "3連ブレス攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "恐竜ウィルス鱗粉",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "恐竜ウィルス鱗粉",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "gypceros": {
    "id": "gypceros",
    "nameEN": "Gypceros",
    "nameKO": "게리오스",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gypceros.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "閃光",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "閃光",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gypceros.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "毒液",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "毒液",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gypceros.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gypceros.rise.3.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gypceros.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続ついばみ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続ついばみ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "gypceros.rise.5.projectile",
        "name": "돌진",
        "sourceMoveNameJA": "毒吐き突進",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "毒吐き突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "malfestio": {
    "id": "malfestio",
    "nameEN": "Malfestio",
    "nameKO": "호로로호루루",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "malfestio.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "malfestio.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "鱗粉",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "鱗粉",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "malfestio.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "超音波",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "超音波",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "malfestio.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "滑空",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滑空",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "malfestio.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "羽攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "羽攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "malfestio.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "脚攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "脚攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "malfestio.rise.5.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "iodrome": {
    "id": "iodrome",
    "nameEN": "Iodrome",
    "nameKO": "도스이오스",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "iodrome.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "毒液攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "毒液攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "iodrome.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "毒液攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "毒液攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "iodrome.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "iodrome.rise.3.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "iodrome.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "拘束",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "kecha_wacha": {
    "id": "kecha_wacha",
    "nameEN": "Kecha Wacha",
    "nameKO": "케차와차",
    "species": {
      "nameJA": "牙獣種",
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kecha_wacha.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "kecha_wacha.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "振り向き引っかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "振り向き引っかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kecha_wacha.rise.1.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "滑空",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滑空",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kecha_wacha.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "爪攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kecha_wacha.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ひっかき（ぶら下がり中）",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ひっかき（ぶら下がり中）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kecha_wacha.rise.4.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転引っかき（ぶら下がり中）",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転引っかき（ぶら下がり中）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kecha_wacha.rise.5.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり（ぶら下がり中）",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びかかり（ぶら下がり中）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "khezu": {
    "id": "khezu",
    "nameEN": "Khezu",
    "nameKO": "푸루푸루",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "khezu.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "khezu.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "体内発電",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "体内発電",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.1.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "電気ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "電気ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "飛びつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.3.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.4.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "首伸ばして噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "首伸ばして噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "落下攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "落下攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "kirin": {
    "id": "kirin",
    "nameEN": "Kirin",
    "nameKO": "키린",
    "species": {
      "nameJA": "古龍種",
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kirin.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "電撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "電撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kirin.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kirin.rise.2.charge",
        "name": "돌진",
        "sourceMoveNameJA": "猛突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "猛突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kirin.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "後ろ蹴り",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "後ろ蹴り",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "kushala_daora": {
    "id": "kushala_daora",
    "nameEN": "Kushala Daora",
    "nameKO": "크샬다오라",
    "species": {
      "nameJA": "古龍種",
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kushala_daora.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "kushala_daora.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "風ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "風ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.1.aerial",
        "name": "브레스",
        "sourceMoveNameJA": "滞空中に放射風ブレス",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滞空中に放射風ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.2.aerial",
        "name": "브레스",
        "sourceMoveNameJA": "滑空中に風ブレス",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滑空中に風ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "猛ダッシュ",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "猛ダッシュ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.4.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "滞空中に爪攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滞空中に爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "風まとい",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "風まとい",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "lagiacrus": {
    "id": "lagiacrus",
    "nameEN": "Lagiacrus",
    "nameKO": "라기아크루스",
    "species": {
      "nameJA": "海竜種",
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lagiacrus.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "lagiacrus.rise.0.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagiacrus.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagiacrus.rise.2.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagiacrus.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagiacrus.rise.4.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "体当たり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagiacrus.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "雷ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "雷ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "lagombi": {
    "id": "lagombi",
    "nameEN": "Lagombi",
    "nameKO": "울크스스",
    "species": {
      "nameJA": "牙獣種",
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lagombi.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプヒップ攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ジャンプヒップ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.3.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "氷塊投げ",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "氷塊投げ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "雪玉転がし",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "雪玉転がし",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "lavasioth": {
    "id": "lavasioth",
    "nameEN": "Lavasioth",
    "nameKO": "볼가노스",
    "species": {
      "nameJA": "魚竜種",
      "nameEN": "Piscine Wyvern",
      "nameKO": "어룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lavasioth.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "足踏み",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "足踏み",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lavasioth.rise.1.burrow",
        "name": "지중 급습",
        "sourceMoveNameJA": "地中からの急襲",
        "type": "burrow",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "地中からの急襲",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lavasioth.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "這いずり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "這いずり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lavasioth.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾振り",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾振り",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lavasioth.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ジャンピングボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ジャンピングボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "lavasioth.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "溶岩ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "溶岩ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "najarala": {
    "id": "najarala",
    "nameEN": "Najarala",
    "nameKO": "가라라아자라",
    "species": {
      "nameJA": "蛇竜種",
      "nameEN": "Snake Wyvern",
      "nameKO": "사룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "najarala.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "najarala.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "噛み付き",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛み付き",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "najarala.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "鳴甲飛ばし",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "鳴甲飛ばし",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "najarala.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "音波",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "音波",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "najarala.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "囲い込んで攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "囲い込んで攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "najarala.rise.4.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "najarala.rise.5.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "nargacuga": {
    "id": "nargacuga",
    "nameEN": "Nargacuga",
    "nameKO": "나르가쿠르가",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "nargacuga.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "nargacuga.rise.0.sweep",
        "name": "꼬리 휩쓸기",
        "sourceMoveNameJA": "尻尾でなぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾でなぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.1.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "大回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "大回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "トゲ飛ばし",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "トゲ飛ばし",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.3.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.4.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "連続飛びかかり",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続飛びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.5.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾叩きつけ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "nibelsnarf": {
    "id": "nibelsnarf",
    "nameEN": "Nibelsnarf",
    "nameKO": "하플보카",
    "species": {
      "nameJA": "海竜種",
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "nibelsnarf.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "砂ブレス（直線）",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "砂ブレス（直線）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nibelsnarf.rise.1.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "砂ブレス（扇状）",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "砂ブレス（扇状）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nibelsnarf.rise.2.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "砂噴射",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "砂噴射",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nibelsnarf.rise.3.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nibelsnarf.rise.4.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "nibelsnarf.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "砂中からの突き上げ攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "砂中からの突き上げ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "plesioth": {
    "id": "plesioth",
    "nameEN": "Plesioth",
    "nameKO": "가노토토스",
    "species": {
      "nameJA": "魚竜種",
      "nameEN": "Piscine Wyvern",
      "nameKO": "어룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "plesioth.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "急接近",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "急接近",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "plesioth.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ボディアタック",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディアタック",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "plesioth.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "腹すべり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "腹すべり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "plesioth.rise.3.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "plesioth.rise.4.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "一直線に水ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "一直線に水ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "plesioth.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "扇状に水ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "扇状に水ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "rathalos": {
    "id": "rathalos",
    "nameEN": "Rathalos",
    "nameKO": "리오레우스",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rathalos.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "rathalos.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.3.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "炎ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "炎ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.4.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.5.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "滑空",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "滑空",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "rathian": {
    "id": "rathian",
    "nameEN": "Rathian",
    "nameKO": "리오레이아",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rathian.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "rathian.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.2.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "サマーソルト攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "サマーソルト攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.5.3",
        "name": "3 브레스",
        "sourceMoveNameJA": "3連炎ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "3連炎ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "royal_ludroth": {
    "id": "royal_ludroth",
    "nameEN": "Royal Ludroth",
    "nameKO": "로아루도로스",
    "species": {
      "nameJA": "海竜種",
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "royal_ludroth.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.1.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "横転",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "横転",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.5.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "水ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "水ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "seltas": {
    "id": "seltas",
    "nameEN": "Seltas",
    "nameKO": "아르셀타스",
    "species": {
      "nameJA": "甲虫種",
      "nameEN": "Neopteron",
      "nameKO": "갑충종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "seltas.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "腐食液",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "腐食液",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas.rise.1.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中からの鎌攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "空中からの鎌攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas.rise.2.aerial",
        "name": "휩쓸기",
        "sourceMoveNameJA": "空中からの鎌なぎ払い攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "空中からの鎌なぎ払い攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas.rise.3.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "seltas_queen": {
    "id": "seltas_queen",
    "nameEN": "Seltas Queen",
    "nameKO": "게넬 셀타스",
    "species": {
      "nameJA": "甲虫種",
      "nameEN": "Neopteron",
      "nameKO": "갑충종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "seltas_queen.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "高圧ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "高圧ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas_queen.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas_queen.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "踏みつけ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "踏みつけ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas_queen.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "腐食液",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "腐食液",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas_queen.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "悪臭ガス",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "悪臭ガス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seltas_queen.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進(連携)",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進(連携)",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "seregios": {
    "id": "seregios",
    "nameEN": "Seregios",
    "nameKO": "셀레기오스",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "seregios.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "seregios.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "刃鱗飛ばし（前方）",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "刃鱗飛ばし（前方）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "刃鱗飛ばし（後方）",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "刃鱗飛ばし（後方）",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "キック",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "キック",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "爪引っかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "爪引っかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.5.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "shogun_ceanataur": {
    "id": "shogun_ceanataur",
    "nameEN": "Shogun Ceanataur",
    "nameKO": "쇼군기자미",
    "species": {
      "nameJA": "甲殻種",
      "nameEN": "Carapaceon",
      "nameKO": "갑각종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "shogun_ceanataur.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "爪攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "両爪攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "両爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転爪攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.4.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "天井から水ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "天井から水ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.5.burrow",
        "name": "지중 급습",
        "sourceMoveNameJA": "地中から急襲",
        "type": "burrow",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "地中から急襲",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "teostra": {
    "id": "teostra",
    "nameEN": "Teostra",
    "nameKO": "테오 테스카토르",
    "species": {
      "nameJA": "古龍種",
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "teostra.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "teostra.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "爪攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "爪攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ダッシュ",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ダッシュ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾を振る",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾を振る",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.3.area",
        "name": "폭발",
        "sourceMoveNameJA": "粉塵爆発",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "粉塵爆発",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.4.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "炎ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "炎ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.5.aerial",
        "name": "폭발",
        "sourceMoveNameJA": "空中爆発",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "空中爆発",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "tetsucabra": {
    "id": "tetsucabra",
    "nameEN": "Tetsucabra",
    "nameKO": "테츠카브라",
    "species": {
      "nameJA": "両生種",
      "nameEN": "Amphibian",
      "nameKO": "양서종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "tetsucabra.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "tetsucabra.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "岩石掘り",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "岩石掘り",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tetsucabra.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "岩くだき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "岩くだき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tetsucabra.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ攻撃",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ジャンプ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tetsucabra.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "踏み潰し",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "踏み潰し",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tetsucabra.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tetsucabra.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "tigrex": {
    "id": "tigrex",
    "nameEN": "Tigrex",
    "nameKO": "티가렉스",
    "species": {
      "nameJA": "飛竜種",
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "特大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "tigrex.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "tigrex.rise.0.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "噛みつき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.1.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.2.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "岩石飛ばし",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "岩石飛ばし",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "飛びついてくる",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びついてくる",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "uragaan": {
    "id": "uragaan",
    "nameEN": "Uragaan",
    "nameKO": "우라간킨",
    "species": {
      "nameJA": "獣竜種",
      "nameEN": "Brute Wyvern",
      "nameKO": "수룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "uragaan.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "uragaan.rise.0.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
        "type": "roar",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "uragaan.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "顎スタンプ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "顎スタンプ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "uragaan.rise.2.4",
        "name": "근접 강타",
        "sourceMoveNameJA": "4連続顎スタンプ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "4連続顎スタンプ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "uragaan.rise.3.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾なぎ払い",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "uragaan.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "転がり攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "転がり攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "uragaan.rise.5.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "velocidrome": {
    "id": "velocidrome",
    "nameEN": "Velocidrome",
    "nameKO": "도스람포스",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "velocidrome.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "拘束",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "velocidrome.rise.1.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり",
        "type": "aerial",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "飛びかかり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "volvidon": {
    "id": "volvidon",
    "nameEN": "Volvidon",
    "nameKO": "랑그로토라",
    "species": {
      "nameJA": "牙獣種",
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "volvidon.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続ひっかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続ひっかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "クロスひっかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "クロスひっかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.2.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転ひっかき",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転ひっかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "転がり",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "転がり",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "舌攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "舌攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.5.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "唾吐き",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "唾吐き",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "yian_garuga": {
    "id": "yian_garuga",
    "nameEN": "Yian Garuga",
    "nameKO": "얀가루루가",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "yian_garuga.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "yian_garuga.rise.0.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "サマーソルト尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "サマーソルト尻尾攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_garuga.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "連続ついばみ",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "連続ついばみ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_garuga.rise.2.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "火炎ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "火炎ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_garuga.rise.3.sweep",
        "name": "회전 꼬리",
        "sourceMoveNameJA": "回転して尻尾を振り回す",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "回転して尻尾を振り回す",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_garuga.rise.4.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_garuga.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "クチバシ突き刺し",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "クチバシ突き刺し",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "yian_kut_ku": {
    "id": "yian_kut_ku",
    "nameEN": "Yian Kut-Ku",
    "nameKO": "얀쿡",
    "species": {
      "nameJA": "鳥竜種",
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "yian_kut_ku.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ついばみ攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ついばみ攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_kut_ku.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_kut_ku.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾を振り回す",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "尻尾を振り回す",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "yian_kut_ku.rise.3.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "火玉吐き",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "火玉吐き",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "zamtrios": {
    "id": "zamtrios",
    "nameEN": "Zamtrios",
    "nameKO": "자보아자길",
    "species": {
      "nameJA": "両生種",
      "nameEN": "Amphibian",
      "nameKO": "양서종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "大",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "zamtrios.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "zamtrios.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "凍結ブレス",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "凍結ブレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zamtrios.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "引っかき",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "引っかき",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zamtrios.rise.2.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "凍結液吐き",
        "type": "projectile",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "凍結液吐き",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zamtrios.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "跳びかかってくる",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "跳びかかってくる",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zamtrios.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "溜める",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "溜める",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zamtrios.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  },
  "zinogre": {
    "id": "zinogre",
    "nameEN": "Zinogre",
    "nameKO": "진오우거",
    "species": {
      "nameJA": "牙竜種",
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "internal": []
    },
    "locomotion": null,
    "roar": {
      "status": "verified-present",
      "strength": "小",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "zinogre.mhxx.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0,
        "windupTicks": 3,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 120,
        "weight": 0.25,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "咆哮",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-monster-basic-data",
        "confidence": "published-guide"
      },
      {
        "id": "zinogre.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "帯電",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "帯電",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "前脚攻撃",
        "type": "physical",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "前脚攻撃",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.2.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "突進",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.4.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "反転から尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.319,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "反転から尻尾叩きつけ",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.5.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.319,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": null,
        "sourcePower": 35,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "generations-ultimate",
        "evidence": "game-e-mhxx-named-attack-pattern-guide",
        "confidence": "extracted-action"
      }
    ]
  }
};

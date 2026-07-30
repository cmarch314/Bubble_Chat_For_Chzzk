window.HUNT_RISE_MONSTER_BEHAVIOR = {
  "primordial_malzeno": {
    "id": "primordial_malzeno",
    "nameEN": "Primordial Malzeno",
    "nameKO": "원초를 새기는 멜-제나",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "primordial_malzeno.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "強咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "強咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.0.projectile",
        "name": "【 】 레이저",
        "sourceMoveNameJA": "【強】マルチレーザー",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【強】マルチレーザー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "【強】範囲ヒルサブ地走り",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【強】範囲ヒルサブ地走り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.2.aerial",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【強】飛び込み斬り爆発",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": false,
        "sourcePower": 95,
        "sourceActionClass": "【強】飛び込み斬り爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾一閃",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "尻尾一閃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【強】大技大爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 110,
        "sourceActionClass": "【強】大技大爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "primordial_malzeno.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "近距離かみつき",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "近距離かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "aknosom": {
    "id": "aknosom",
    "nameEN": "Aknosom",
    "nameKO": "아케노시름",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "aknosom.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス_Copied",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.0.projectile",
        "name": "화염구",
        "sourceMoveNameJA": "火球",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "火球",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "超突進",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "超突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.2.aerial",
        "name": "회전",
        "sourceMoveNameJA": "回転飛翔翼",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "回転飛翔翼",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "ふわふわ回転着陸攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ふわふわ回転着陸攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "燃え残り",
        "type": "area",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "燃え残り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aknosom.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "頭っつき",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "頭っつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "almudron": {
    "id": "almudron",
    "nameEN": "Almudron",
    "nameKO": "오로미도로",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "almudron.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ライジングタックル",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ライジングタックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.1.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "対空中",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "対空中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.2.burrow",
        "name": "【 잠복】꼬리",
        "sourceMoveNameJA": "【半潜り】尻尾パンチ",
        "type": "burrow",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "【半潜り】尻尾パンチ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.3.sweep",
        "name": "내려찍기 꼬리",
        "sourceMoveNameJA": "叩きつけパンチ尻尾派生",
        "type": "sweep",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "叩きつけパンチ尻尾派生",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "泥団子叩きつけ（段差揺らし）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "泥団子叩きつけ（段差揺らし）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "almudron.rise.5.sweep",
        "name": "회전",
        "sourceMoveNameJA": "沈み前回転攻撃",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "沈み前回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "amatsu": {
    "id": "amatsu",
    "nameEN": "Amatsu",
    "nameKO": "아마츠마가츠치",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "amatsu.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "大竜巻爆破",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "大竜巻爆破",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.1.charge",
        "name": "대돌진",
        "sourceMoveNameJA": "大突進",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "大突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中トンネル",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "空中トンネル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃（バク宙）",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "尻尾攻撃（バク宙）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.4.area",
        "name": "폭발",
        "sourceMoveNameJA": "超大技爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "超大技爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "amatsu.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "anjanath": {
    "id": "anjanath",
    "nameEN": "Anjanath",
    "nameKO": "안쟈나프",
    "species": {
      "nameEN": "Brute Wyvern",
      "nameKO": "수룡종",
      "nameJA": "獣竜種",
      "internal": [
        "Brute wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "anjanath.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "炎熱放射ブレス",
        "type": "projectile",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "炎熱放射ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進頭振り上げ（頭）",
        "type": "charge",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "突進頭振り上げ（頭）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.2.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり攻撃",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "飛びかかり攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.3.sweep",
        "name": "휩쓸기꼬리",
        "sourceMoveNameJA": "薙ぎ払い尻尾攻撃・ヒット",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "薙ぎ払い尻尾攻撃・ヒット",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.4.mr",
        "name": "【MR】 물어뜯기_내려찍기",
        "sourceMoveNameJA": "【MR】超歩きタメ噛みつき_叩きつけ",
        "type": "area",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "【MR】超歩きタメ噛みつき_叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anjanath.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "牽制噛みつき",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "牽制噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_arzuros": {
    "id": "apex_arzuros",
    "nameEN": "Apex Arzuros",
    "nameKO": "주인 아오아시라",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_arzuros.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "大咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "大咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "岩着弾（ヌシ）",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "岩着弾（ヌシ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.1.charge",
        "name": "돌진 ～",
        "sourceMoveNameJA": "突進攻撃（開始～ループ）",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進攻撃（開始～ループ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージなしアタリ",
        "type": "aerial",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "ジャンプ用ダメージなしアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.3.270",
        "name": "270 회전",
        "sourceMoveNameJA": "270度回転ひっかき",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "270度回転ひっかき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.4.d_2",
        "name": "광역 강타",
        "sourceMoveNameJA": "【百竜】【大技】Dサーモン岩_2回目",
        "type": "area",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【百竜】【大技】Dサーモン岩_2回目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_arzuros.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ラリアット",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ラリアット",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_diablos": {
    "id": "apex_diablos",
    "nameEN": "Apex Diablos",
    "nameKO": "주인 디아블로스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_diablos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.0.charge",
        "name": "돌진_돌진",
        "sourceMoveNameJA": "地獄突進_突進（角あり）",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "地獄突進_突進（角あり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.1.aerial",
        "name": "급강하",
        "sourceMoveNameJA": "急降下爆撃（角あり）",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "急降下爆撃（角あり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.2.burrow",
        "name": "덮치기잠복_",
        "sourceMoveNameJA": "飛びかかり潜り_百竜大技・設備破壊用",
        "type": "burrow",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "飛びかかり潜り_百竜大技・設備破壊用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾シェル飛ばし",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "尻尾シェル飛ばし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "角地面ぶっさし",
        "type": "area",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "角地面ぶっさし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_diablos.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進（角あり）",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "突進（角あり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_mizutsune": {
    "id": "apex_mizutsune",
    "nameEN": "Apex Mizutsune",
    "nameKO": "주인 타마미츠네",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_mizutsune.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "【百竜】【ヌシ】大技用着弾シェル",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【百竜】【ヌシ】大技用着弾シェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中大",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中大",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "昇竜尻尾",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "昇竜尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "しっぽ叩きつけ前半",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "しっぽ叩きつけ前半",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_mizutsune.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "その場噛みつき",
        "type": "physical",
        "damageRatio": 0.274,
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
        "guardable": true,
        "sourcePower": 25,
        "sourceActionClass": "その場噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_rathalos": {
    "id": "apex_rathalos",
    "nameEN": "Apex Rathalos",
    "nameKO": "주인 리오레우스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_rathalos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.0.projectile",
        "name": "【 】 물어뜯기브레스",
        "sourceMoveNameJA": "【ヌシ】チャージ噛みつきブレス二発目",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【ヌシ】チャージ噛みつきブレス二発目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ファイアバーナー地走り",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー地走り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.2.aerial",
        "name": "【 】 점프브레스화염구",
        "sourceMoveNameJA": "【ヌシ】高出力バックジャンプブレス火球",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【ヌシ】高出力バックジャンプブレス火球",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.3.sweep",
        "name": "꼬리회전",
        "sourceMoveNameJA": "尻尾回転攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ファイアバーナー",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathalos.rise.5.charge",
        "name": "물어뜯기",
        "sourceMoveNameJA": "ダッシュ噛みつき",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ダッシュ噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_rathian": {
    "id": "apex_rathian",
    "nameEN": "Apex Rathian",
    "nameKO": "주인 리오레이아",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_rathian.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.0.projectile",
        "name": "화염구브레스",
        "sourceMoveNameJA": "強化火球ブレス",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "強化火球ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進キャンセルサマーソルト（本体）",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進キャンセルサマーソルト（本体）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.2.aerial",
        "name": "급강하회전 꼬리",
        "sourceMoveNameJA": "急降下回転攻撃（尻尾）",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "急降下回転攻撃（尻尾）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.3.2_2",
        "name": "2 2 꼬리",
        "sourceMoveNameJA": "猛毒シェル2連サマー2回目（尻尾）",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "猛毒シェル2連サマー2回目（尻尾）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【怪異化】最大活性爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【怪異化】最大活性爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_rathian.rise.5.aerial",
        "name": "물어뜯기",
        "sourceMoveNameJA": "空中かみつき",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "apex_zinogre": {
    "id": "apex_zinogre",
    "nameEN": "Apex Zinogre",
    "nameKO": "주인 진오우거",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "apex_zinogre.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "雷光虫弾シェル",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "雷光虫弾シェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.2.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり攻撃",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "飛びかかり攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.3.sweep",
        "name": "_ 꼬리",
        "sourceMoveNameJA": "サマーソルト攻撃_浴びせ尻尾から繋がるサマー",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "サマーソルト攻撃_浴びせ尻尾から繋がるサマー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【怪異化】最大活性爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【怪異化】最大活性爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "apex_zinogre.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "サマーソルト攻撃",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "サマーソルト攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "arzuros": {
    "id": "arzuros",
    "nameEN": "Arzuros",
    "nameKO": "아오아시라",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "arzuros.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "岩着弾",
        "type": "projectile",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "岩着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.1.charge",
        "name": "돌진 ～",
        "sourceMoveNameJA": "突進攻撃（開始～ループ）",
        "type": "charge",
        "damageRatio": 0.255,
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
        "guardable": true,
        "sourcePower": 21,
        "sourceActionClass": "突進攻撃（開始～ループ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージなしアタリ",
        "type": "aerial",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "ジャンプ用ダメージなしアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.3.sweep",
        "name": "회전 _",
        "sourceMoveNameJA": "その場回転攻撃_左",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "その場回転攻撃_左",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.4.4",
        "name": "근접 강타",
        "sourceMoveNameJA": "ブン回し攻撃（4回目）",
        "type": "physical",
        "damageRatio": 0.346,
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
        "guardable": true,
        "sourcePower": 41,
        "sourceActionClass": "ブン回し攻撃（4回目）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "arzuros.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ベアハッグ",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ベアハッグ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "astalos": {
    "id": "astalos",
    "nameEN": "Astalos",
    "nameKO": "라이젝스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "astalos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.0.projectile",
        "name": "【 】 브레스",
        "sourceMoveNameJA": "【帯電】単発ブレス壁ヒット",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【帯電】単発ブレス壁ヒット",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.1.charge",
        "name": "돌진내려찍기방전",
        "sourceMoveNameJA": "中空突進叩きつけ放電",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "中空突進叩きつけ放電",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.2.aerial",
        "name": "물어뜯기",
        "sourceMoveNameJA": "空中前かみつき",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "空中前かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "中空回転攻撃",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": false,
        "sourcePower": 80,
        "sourceActionClass": "中空回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "【帯電】トサカブレード大",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 80,
        "sourceActionClass": "【帯電】トサカブレード大",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "astalos.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき汎用",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "噛みつき汎用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "aurora_somnacanth": {
    "id": "aurora_somnacanth",
    "nameEN": "Aurora Somnacanth",
    "nameKO": "이소네미쿠니 아종",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "aurora_somnacanth.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.0.projectile",
        "name": "_ 브레스",
        "sourceMoveNameJA": "(亜種)シェル_氷ブレス",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "(亜種)シェル_氷ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "必殺突進",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "必殺突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "イルカジャンプ",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "イルカジャンプ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.3.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "尻尾薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "拳叩きつけ",
        "type": "area",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "拳叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "aurora_somnacanth.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "(亜種)シェル_冷気破裂",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "(亜種)シェル_冷気破裂",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "barioth": {
    "id": "barioth",
    "nameEN": "Barioth",
    "nameKO": "벨리오로스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "barioth.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "氷ブレス着弾",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "氷ブレス着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.1.037",
        "name": "037_ 몸통박치기_",
        "sourceMoveNameJA": "037_左タックル_手",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "037_左タックル_手",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.2.102",
        "name": "102_ 점프",
        "sourceMoveNameJA": "102_必殺ジャンプ攻撃",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 85,
        "sourceActionClass": "102_必殺ジャンプ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.3.mr_2",
        "name": "【MR】 꼬리내려찍기_2 꼬리",
        "sourceMoveNameJA": "【MR】フルパワー尻尾叩き付け_2段目尻尾",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【MR】フルパワー尻尾叩き付け_2段目尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "捕食用強制死亡アタリ",
        "type": "physical",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "捕食用強制死亡アタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barioth.rise.5.025",
        "name": "025_물어뜯기_",
        "sourceMoveNameJA": "025_かみつき_牙",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "025_かみつき_牙",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "barroth": {
    "id": "barroth",
    "nameEN": "Barroth",
    "nameKO": "볼보로스",
    "species": {
      "nameEN": "Brute Wyvern",
      "nameKO": "수룡종",
      "nameJA": "獣竜種",
      "internal": [
        "Brute wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "barroth.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進ループ",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進ループ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージあり",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージあり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾振り攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾振り攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "頭突き",
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
        "guardable": true,
        "sourcePower": 35,
        "sourceActionClass": "頭突き",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.4.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進終わり",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進終わり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "barroth.rise.5.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "サイドタックル（左）",
        "type": "charge",
        "damageRatio": 0.274,
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
        "guardable": true,
        "sourcePower": 25,
        "sourceActionClass": "サイドタックル（左）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "basarios": {
    "id": "basarios",
    "nameEN": "Basarios",
    "nameKO": "바살모스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "basarios.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "発見咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "発見咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.0.charge",
        "name": "돌진 돌진",
        "sourceMoveNameJA": "突進転がり(突進部分)",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進転がり(突進部分)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.2.burrow",
        "name": "잠복돌진",
        "sourceMoveNameJA": "潜り突進",
        "type": "burrow",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "潜り突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾汎用",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾汎用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "熱線",
        "type": "area",
        "damageRatio": 0.342,
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
        "guardable": false,
        "sourcePower": 40,
        "sourceActionClass": "熱線",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "basarios.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.233,
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
        "guardable": true,
        "sourcePower": 16,
        "sourceActionClass": "噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "bazelgeuse": {
    "id": "bazelgeuse",
    "nameEN": "Bazelgeuse",
    "nameKO": "바젤기우스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bazelgeuse.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "ブレス",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "爆破突進",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "爆破突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "対空中",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "対空中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.3.mr",
        "name": "【MR】 꼬리내려찍기",
        "sourceMoveNameJA": "【MR】前方連続尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【MR】前方連続尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "倒れ込みプレス（操竜用）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "倒れ込みプレス（操竜用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bazelgeuse.rise.5.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾ウロコ飛ばし",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "尻尾ウロコ飛ばし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "bishaten": {
    "id": "bishaten",
    "nameEN": "Bishaten",
    "nameKO": "비슈텐고",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bishaten.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "分裂毒柿着弾",
        "type": "projectile",
        "damageRatio": 0.296,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile",
          "poison"
        ],
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "分裂毒柿着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.1.charge",
        "name": "【꼬리】 돌진",
        "sourceMoveNameJA": "【尻尾】旋風コマ突進",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【尻尾】旋風コマ突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.2.aerial",
        "name": "점프꼬리내려찍기",
        "sourceMoveNameJA": "ジャンプ尻尾叩きつけ",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "ジャンプ尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.3.mr",
        "name": "【MR】 꼬리",
        "sourceMoveNameJA": "【MR】バク宙尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "【MR】バク宙尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.4.area",
        "name": "내려찍기_ _",
        "sourceMoveNameJA": "鎖鎌叩きつけ_全身_毒",
        "type": "area",
        "damageRatio": 0.387,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area",
          "poison"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "鎖鎌叩きつけ_全身_毒",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bishaten.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "片手爪攻撃",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "片手爪攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "blood_orange_bishaten": {
    "id": "blood_orange_bishaten",
    "nameEN": "Blood Orange Bishaten",
    "nameKO": "비슈텐고 아종",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "blood_orange_bishaten.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.0.projectile",
        "name": "브레스 레이저",
        "sourceMoveNameJA": "着火ブレス(レーザー)",
        "type": "projectile",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "着火ブレス(レーザー)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.1.charge",
        "name": "【꼬리】 돌진",
        "sourceMoveNameJA": "【尻尾】旋風コマ突進",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【尻尾】旋風コマ突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.2.aerial",
        "name": "【 】【 】 돌진",
        "sourceMoveNameJA": "【亜種】【操竜】滑空突進",
        "type": "aerial",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "【亜種】【操竜】滑空突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.3.sweep",
        "name": "【 】【 】 꼬리휩쓸기",
        "sourceMoveNameJA": "【亜種】【操竜】風圧尻尾薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "【亜種】【操竜】風圧尻尾薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ダンクボム",
        "type": "area",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "ダンクボム",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "blood_orange_bishaten.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "【亜種】【操竜】旋風コマ突撃",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【亜種】【操竜】旋風コマ突撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "chameleos": {
    "id": "chameleos",
    "nameEN": "Chameleos",
    "nameKO": "오나즈치",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "chameleos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "テスト咆哮",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "テスト咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "固定長ビーム状毒霧ヒットデータ",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "固定長ビーム状毒霧ヒットデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.1.006_1003",
        "name": "돌진",
        "sourceMoveNameJA": "006 - がさがさダッシュ(頭・前脚) 1003",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "006 - がさがさダッシュ(頭・前脚) 1003",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾岩飛ばし",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "尻尾岩飛ばし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "確定操竜ヤラレ当たり（ボディプレス）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 85,
        "sourceActionClass": "確定操竜ヤラレ当たり（ボディプレス）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chameleos.rise.5.001",
        "name": "근접 강타",
        "sourceMoveNameJA": "001 - 舌直線攻撃",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "001 - 舌直線攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "chaotic_gore_magala": {
    "id": "chaotic_gore_magala",
    "nameEN": "Chaotic Gore Magala",
    "nameKO": "혼돈에 신음하는 고어-마가라",
    "species": {
      "nameEN": "???",
      "nameKO": "???",
      "nameJA": "？？？",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "chaotic_gore_magala.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.0.projectile",
        "name": "브레스 폭발",
        "sourceMoveNameJA": "強・狂竜ブレス（口元爆発）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "強・狂竜ブレス（口元爆発）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.1.6",
        "name": "_ ６ 몸통박치기",
        "sourceMoveNameJA": "翼腕_旧６足タックル",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "翼腕_旧６足タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.2.aerial",
        "name": "몸통박치기",
        "sourceMoveNameJA": "滑空体当たり",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "滑空体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.3.6",
        "name": "【 】【６ 】휩쓸기",
        "sourceMoveNameJA": "【渾沌】【６脚】薙ぎ払い（シャガル流用）",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "【渾沌】【６脚】薙ぎ払い（シャガル流用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "両翼脚腹下叩きつけ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "両翼脚腹下叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "chaotic_gore_magala.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "crimson_glow_valstrax": {
    "id": "crimson_glow_valstrax",
    "nameEN": "Crimson Glow Valstrax",
    "nameKO": "영묘한 광채의 발파루크",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "launch",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "crimson_glow_valstrax.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.0.projectile",
        "name": "레이저_",
        "sourceMoveNameJA": "龍属性レーザー_正面大範囲",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "龍属性レーザー_正面大範囲",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ホバリング突進(翼)",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ホバリング突進(翼)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.2.aerial",
        "name": "점프휩쓸기",
        "sourceMoveNameJA": "ジャンプ薙ぎ払い",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ジャンプ薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "ウィング薙ぎ払い(スーパーモード)",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ウィング薙ぎ払い(スーパーモード)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "大技着地",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 80,
        "sourceActionClass": "大技着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "crimson_glow_valstrax.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "槍攻撃",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "槍攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "daimyo_hermitaur": {
    "id": "daimyo_hermitaur",
    "nameEN": "Daimyo Hermitaur",
    "nameKO": "다이묘자자미",
    "species": {
      "nameEN": "Carapaceon",
      "nameKO": "갑각종",
      "nameJA": "甲殻種",
      "internal": [
        "Other",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "daimyo_hermitaur.rise.0.projectile",
        "name": "： _ 브레스",
        "sourceMoveNameJA": "(未使用：操竜)シェル_水ブレス",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "(未使用：操竜)シェル_水ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "後ろ突進攻撃",
        "type": "charge",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "後ろ突進攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.2.aerial",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【空中】後ろ突進攻撃",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【空中】後ろ突進攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.3.burrow",
        "name": "튀어나오기_",
        "sourceMoveNameJA": "地中飛び出し_着地",
        "type": "burrow",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "地中飛び出し_着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "daimyo_hermitaur.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束攻撃",
        "type": "physical",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "拘束攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "diablos": {
    "id": "diablos",
    "nameEN": "Diablos",
    "nameKO": "디아블로스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "diablos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進（角あり）",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "突進（角あり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージあり",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージあり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.2.burrow",
        "name": "잠복튀어나오기",
        "sourceMoveNameJA": "潜り飛び出し・角破壊前",
        "type": "burrow",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "潜り飛び出し・角破壊前",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾シェル飛ばし",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "尻尾シェル飛ばし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "角地面ぶっさし",
        "type": "area",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "角地面ぶっさし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "diablos.rise.5.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進（角なし）",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "突進（角なし）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "espinas": {
    "id": "espinas",
    "nameEN": "Espinas",
    "nameKO": "에스피나스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "espinas.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮_DMG",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.0.projectile",
        "name": "【 】 브레스",
        "sourceMoveNameJA": "【操竜用】チャージブレス",
        "type": "projectile",
        "damageRatio": 0.387,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile",
          "poison",
          "paralysis"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【操竜用】チャージブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.1.dmg",
        "name": "돌진_DMG",
        "sourceMoveNameJA": "突進_DMG",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "突進_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.2.dmg",
        "name": "점프브레스_DMG",
        "sourceMoveNameJA": "バックジャンプブレス_DMG",
        "type": "aerial",
        "damageRatio": 0.387,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial",
          "poison",
          "paralysis"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バックジャンプブレス_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.3.2_dmg",
        "name": "꼬리２ _DMG",
        "sourceMoveNameJA": "尻尾２連（左）_DMG",
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
        "guardable": true,
        "sourcePower": 35,
        "sourceActionClass": "尻尾２連（左）_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.4.3way_3_dmg",
        "name": "광역 강타",
        "sourceMoveNameJA": "上体起こし3Way_3段目_DMG",
        "type": "area",
        "damageRatio": 0.387,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area",
          "poison",
          "paralysis"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "上体起こし3Way_3段目_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "espinas.rise.5.dmg_copied",
        "name": "근접 강타",
        "sourceMoveNameJA": "かち上げ（溜め）_DMG_Copied",
        "type": "physical",
        "damageRatio": 0.365,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close",
          "poison"
        ],
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "かち上げ（溜め）_DMG_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "flaming_espinas": {
    "id": "flaming_espinas",
    "nameEN": "Flaming Espinas",
    "nameKO": "에스피나스 아종",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "flaming_espinas.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "【亜種】バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【亜種】バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.0.projectile",
        "name": "【 】 브레스 폭발",
        "sourceMoveNameJA": "【亜種】溜めブレス着弾爆発",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile",
          "poison"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【亜種】溜めブレス着弾爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.1.dmg",
        "name": "돌진_DMG",
        "sourceMoveNameJA": "突進_DMG",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "突進_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.2.dmg",
        "name": "점프브레스_DMG",
        "sourceMoveNameJA": "バックジャンプブレス_DMG",
        "type": "aerial",
        "damageRatio": 0.387,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "aerial",
          "poison",
          "paralysis"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バックジャンプブレス_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.3.sweep",
        "name": "【 】 회전",
        "sourceMoveNameJA": "【亜種】溜めかち上げ回転攻撃",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【亜種】溜めかち上げ回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.4.3",
        "name": "【 】 ３ 폭발",
        "sourceMoveNameJA": "【亜種】上体起こし３発目連続爆発",
        "type": "area",
        "damageRatio": 0.387,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "area",
          "poison"
        ],
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【亜種】上体起こし３発目連続爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "flaming_espinas.rise.5.dmg_copied",
        "name": "근접 강타",
        "sourceMoveNameJA": "かち上げ（溜め）_DMG_Copied",
        "type": "physical",
        "damageRatio": 0.365,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "close",
          "poison"
        ],
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "かち上げ（溜め）_DMG_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "furious_rajang": {
    "id": "furious_rajang",
    "nameEN": "Furious Rajang",
    "nameKO": "격앙 라잔",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "furious_rajang.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "気合ビーム（怒り）",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": false,
        "sourcePower": 60,
        "sourceActionClass": "気合ビーム（怒り）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.1.mr",
        "name": "【MR】 돌진",
        "sourceMoveNameJA": "【MR】ロングホーン突進中",
        "type": "charge",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "【MR】ロングホーン突進中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプローリング",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "ジャンプローリング",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "必殺両腕叩きつけ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "必殺両腕叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "furious_rajang.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "デンプシー",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "デンプシー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gaismagorm": {
    "id": "gaismagorm",
    "nameEN": "Gaismagorm",
    "nameKO": "가이아델름",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gaismagorm.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮(ダメージ)_ATK",
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
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "咆哮(ダメージ)_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.0.atk",
        "name": "_레이저_ATK",
        "sourceMoveNameJA": "壁頂点必殺_レーザー_ATK",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "壁頂点必殺_レーザー_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.1.atk",
        "name": "돌진_ _ATK",
        "sourceMoveNameJA": "ガスばら撒き突進_爆破_ATK",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "ガスばら撒き突進_爆破_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.2.atk",
        "name": "회전물어뜯기 물어뜯기 _ATK",
        "sourceMoveNameJA": "回転かみつき(かみつき)_ATK",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "回転かみつき(かみつき)_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.3.atk",
        "name": "광역 강타",
        "sourceMoveNameJA": "必殺プレス_ATK",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "必殺プレス_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.4.atk",
        "name": "근접 강타",
        "sourceMoveNameJA": "壁頂点必殺_超爆破_ATK",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "壁頂点必殺_超爆破_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gaismagorm.rise.5.atk",
        "name": "근접 강타",
        "sourceMoveNameJA": "両翼脚合掌大爆破(翼脚)_ATK",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "両翼脚合掌大爆破(翼脚)_ATK",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "garangolm": {
    "id": "garangolm",
    "nameEN": "Garangolm",
    "nameKO": "가란고르무",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "garangolm.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "苔水弾",
        "type": "projectile",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "苔水弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "右腕ジャンプ",
        "type": "aerial",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "右腕ジャンプ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "頭振り回し",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "頭振り回し",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ボディプレス",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ボディプレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "garangolm.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "共通_コケアタリ",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "共通_コケアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gold_rathian": {
    "id": "gold_rathian",
    "nameEN": "Gold Rathian",
    "nameKO": "리오레이아 희소종",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gold_rathian.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 15,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.0.projectile",
        "name": "【 】 브레스폭발",
        "sourceMoveNameJA": "【希】必殺チャージブレス爆発",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【希】必殺チャージブレス爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.1.charge",
        "name": "물어뜯기",
        "sourceMoveNameJA": "地上ダッシュかみつき",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "地上ダッシュかみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.2.aerial",
        "name": "【 】급강하회전 꼬리",
        "sourceMoveNameJA": "【ヌシ移植】急降下回転攻撃(尻尾)",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【ヌシ移植】急降下回転攻撃(尻尾)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.3.sweep",
        "name": "【 】 꼬리",
        "sourceMoveNameJA": "【希少】乱れ尻尾サマー(破壊前)",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "【希少】乱れ尻尾サマー(破壊前)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【怪異化】最大活性爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【怪異化】最大活性爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gold_rathian.rise.5.aerial",
        "name": "물어뜯기",
        "sourceMoveNameJA": "空中かみつき",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gore_magala": {
    "id": "gore_magala",
    "nameEN": "Gore Magala",
    "nameKO": "고어-마가라",
    "species": {
      "nameEN": "???",
      "nameKO": "???",
      "nameJA": "？？？",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gore_magala.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.0.projectile",
        "name": "브레스 폭발",
        "sourceMoveNameJA": "強・狂竜ブレス（口元爆発）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "強・狂竜ブレス（口元爆発）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.1.6",
        "name": "_ ６ 몸통박치기",
        "sourceMoveNameJA": "翼腕_旧６足タックル",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "翼腕_旧６足タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.2.aerial",
        "name": "몸통박치기",
        "sourceMoveNameJA": "滑空体当たり",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "滑空体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾ぺちん",
        "type": "sweep",
        "damageRatio": 0.274,
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
        "guardable": true,
        "sourcePower": 25,
        "sourceActionClass": "尻尾ぺちん",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "両翼脚腹下叩きつけ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "両翼脚腹下叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gore_magala.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "goss_harag": {
    "id": "goss_harag",
    "nameEN": "Goss Harag",
    "nameKO": "고샤하기",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "goss_harag.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "氷ブレスダメージデータ",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "氷ブレスダメージデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ぶちかましタックル",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ぶちかましタックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "ジャンピングトールハンマー空中",
        "type": "aerial",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "ジャンピングトールハンマー空中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.3.sweep",
        "name": "내려찍기휩쓸기",
        "sourceMoveNameJA": "包丁叩きつけ薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "包丁叩きつけ薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.4.area",
        "name": "내려찍기【 】",
        "sourceMoveNameJA": "叩きつけ【操獣確定】",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "叩きつけ【操獣確定】",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "goss_harag.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "包丁装着斬り(包丁)",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "包丁装着斬り(包丁)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "great_baggi": {
    "id": "great_baggi",
    "nameEN": "Great Baggi",
    "nameKO": "도스바기",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Bird wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "great_baggi.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進必殺攻撃",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "突進必殺攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_baggi.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_baggi.rise.2.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.228,
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
        "guardable": true,
        "sourcePower": 15,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_baggi.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "とびかかり攻撃",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "とびかかり攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_baggi.rise.4.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_baggi.rise.5.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.224,
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
        "guardable": true,
        "sourcePower": 14,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "great_izuchi": {
    "id": "great_izuchi",
    "nameEN": "Great Izuchi",
    "nameKO": "오사이즈치",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Bird wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "great_izuchi.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "胃液ブレス",
        "type": "projectile",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "胃液ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_izuchi.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "百裂切り裂き突進",
        "type": "charge",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "百裂切り裂き突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_izuchi.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_izuchi.rise.3.sweep",
        "name": "꼬리회전",
        "sourceMoveNameJA": "尻尾回転攻撃",
        "type": "sweep",
        "damageRatio": 0.274,
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
        "guardable": true,
        "sourcePower": 25,
        "sourceActionClass": "尻尾回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_izuchi.rise.4.mr",
        "name": "근접 강타",
        "sourceMoveNameJA": "【MR】春風脚",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "【MR】春風脚",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_izuchi.rise.5.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "足元薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "足元薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "great_wroggi": {
    "id": "great_wroggi",
    "nameEN": "Great Wroggi",
    "nameKO": "도스프로기",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Bird wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "great_wroggi.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "毒霧ブレス",
        "type": "projectile",
        "damageRatio": 0.251,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile",
          "poison"
        ],
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "毒霧ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_wroggi.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_wroggi.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_wroggi.rise.3.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.228,
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
        "guardable": true,
        "sourcePower": 15,
        "sourceActionClass": "回転尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_wroggi.rise.4.2",
        "name": "물어뜯기2",
        "sourceMoveNameJA": "噛みつき2段目",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": true,
        "sourcePower": 15,
        "sourceActionClass": "噛みつき2段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "great_wroggi.rise.5.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.224,
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
        "guardable": true,
        "sourcePower": 14,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "jyuratodus": {
    "id": "jyuratodus",
    "nameEN": "Jyuratodus",
    "nameKO": "쥬라토도스",
    "species": {
      "nameEN": "Piscine Wyvern",
      "nameKO": "어룡종",
      "nameJA": "魚竜種",
      "internal": [
        "Piscine wyvern",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "jyuratodus.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "泥着弾ダメージデータ",
        "type": "projectile",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "泥着弾ダメージデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.1.2",
        "name": "２ 몸통박치기",
        "sourceMoveNameJA": "２足タックル（左）",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "２足タックル（左）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用アタリダメージあり",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用アタリダメージあり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.3.mr",
        "name": "지중 급습",
        "sourceMoveNameJA": "【MR】地中から飛出し",
        "type": "burrow",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "burrow"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【MR】地中から飛出し",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.4.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "回転尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jyuratodus.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "組み技開始判定用",
        "type": "physical",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "組み技開始判定用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "khezu": {
    "id": "khezu",
    "nameEN": "Khezu",
    "nameKO": "푸루푸루",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "khezu.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "壁威嚇",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "壁威嚇",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "ボムブレス大（放物線）",
        "type": "projectile",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ボムブレス大（放物線）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ダッシュ攻撃",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ダッシュ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.2.rabbitconv034_em036_fly26",
        "name": "공중 급습",
        "sourceMoveNameJA": "RabbitConv034 - 落下攻撃（空中）EM036_FLY26",
        "type": "aerial",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "RabbitConv034 - 落下攻撃（空中）EM036_FLY26",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "発電飛びつき攻撃着地",
        "type": "area",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "発電飛びつき攻撃着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "khezu.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "首伸ばし噛みつき直線",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "首伸ばし噛みつき直線",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "kulu_ya_ku": {
    "id": "kulu_ya_ku",
    "nameEN": "Kulu-Ya-Ku",
    "nameKO": "쿠루루야크",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Bird wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kulu_ya_ku.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "岩投げ_着弾",
        "type": "projectile",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "岩投げ_着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kulu_ya_ku.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ガード突進",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ガード突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kulu_ya_ku.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ岩砕き",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ジャンプ岩砕き",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kulu_ya_ku.rise.3.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "岩叩きつけ",
        "type": "area",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "岩叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kulu_ya_ku.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "岩投げダメージデータ",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "岩投げダメージデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kulu_ya_ku.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ついばみ",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ついばみ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "kushala_daora": {
    "id": "kushala_daora",
    "nameEN": "Kushala Daora",
    "nameKO": "크샬다오라",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kushala_daora.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス(発見)",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "バインドボイス(発見)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "必殺ブレス(氷)",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "必殺ブレス(氷)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "着陸突進",
        "type": "charge",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "着陸突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.2.aerial",
        "name": "돌진",
        "sourceMoveNameJA": "滑空突進",
        "type": "aerial",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "滑空突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転上昇離陸",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "回転上昇離陸",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "台風",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "台風",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kushala_daora.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "組み技開始",
        "type": "physical",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "組み技開始",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "lagombi": {
    "id": "lagombi",
    "nameEN": "Lagombi",
    "nameKO": "울크스스",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lagombi.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "氷塊ヒットデータ",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "氷塊ヒットデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.1.006",
        "name": "006 - 돌진",
        "sourceMoveNameJA": "006 - 突進ループ",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "006 - 突進ループ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.2.039",
        "name": "039 - 돌진⇒ 점프",
        "sourceMoveNameJA": "039 - 突進⇒段差ジャンプ ループ",
        "type": "aerial",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "039 - 突進⇒段差ジャンプ ループ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.3.043",
        "name": "043 - 회전",
        "sourceMoveNameJA": "043 - 確定操獣ヤラレ当たり（その場回転攻撃右手）",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "043 - 確定操獣ヤラレ当たり（その場回転攻撃右手）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.4.030",
        "name": "광역 강타",
        "sourceMoveNameJA": "030 - ジャンピングプレス",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "030 - ジャンピングプレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lagombi.rise.5.003",
        "name": "근접 강타",
        "sourceMoveNameJA": "003 - ベアハッグ",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "003 - ベアハッグ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "lucent_nargacuga": {
    "id": "lucent_nargacuga",
    "nameEN": "Lucent Nargacuga",
    "nameKO": "나르가쿠르가 희소종",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lucent_nargacuga.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.0.projectile",
        "name": "【 】 내려찍기",
        "sourceMoveNameJA": "【新技】横歩き叩きつけ着弾",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【新技】横歩き叩きつけ着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.1.1",
        "name": "덮치기 １",
        "sourceMoveNameJA": "飛びかかり・１段目",
        "type": "aerial",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "飛びかかり・１段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.2.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "朧尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "朧尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "朧ブレード",
        "type": "physical",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "朧ブレード",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.4.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lucent_nargacuga.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ブレード攻撃",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ブレード攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "lunagaron": {
    "id": "lunagaron",
    "nameEN": "Lunagaron",
    "nameKO": "루나가론",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "lunagaron.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "広がり霜ブレス",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "広がり霜ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.1.charge",
        "name": "몸통박치기※",
        "sourceMoveNameJA": "ジャンピングタックル※未使用",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "ジャンピングタックル※未使用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "対空中",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "対空中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.3.sweep",
        "name": "_ _ 꼬리",
        "sourceMoveNameJA": "操竜攻撃_弱後_ツイスト尻尾バクステ",
        "type": "sweep",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "操竜攻撃_弱後_ツイスト尻尾バクステ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "掴み拘束（叩きつけ）",
        "type": "area",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "掴み拘束（叩きつけ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "lunagaron.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "必殺切り裂きクロー",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "必殺切り裂きクロー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "magma_almudron": {
    "id": "magma_almudron",
    "nameEN": "Magma Almudron",
    "nameKO": "오로미도로 아종",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "magma_almudron.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ライジングタックル",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ライジングタックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.1.aerial",
        "name": "【 】회전",
        "sourceMoveNameJA": "【亜種】回転飛翔",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【亜種】回転飛翔",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.2.burrow",
        "name": "【 잠복】꼬리",
        "sourceMoveNameJA": "【半潜り】尻尾パンチ",
        "type": "burrow",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "【半潜り】尻尾パンチ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.3.sweep",
        "name": "내려찍기 꼬리",
        "sourceMoveNameJA": "叩きつけパンチ尻尾派生",
        "type": "sweep",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "叩きつけパンチ尻尾派生",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "泥団子叩きつけ（段差揺らし）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "泥団子叩きつけ（段差揺らし）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magma_almudron.rise.5.sweep",
        "name": "회전",
        "sourceMoveNameJA": "沈み前回転攻撃",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "沈み前回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "magnamalo": {
    "id": "magnamalo",
    "nameEN": "Magnamalo",
    "nameKO": "마가이마가도",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "magnamalo.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス_Copied",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "鬼火爆弾着弾ヒットデータ",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "鬼火爆弾着弾ヒットデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ガスだまりバースト（突進）",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ガスだまりバースト（突進）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.3.copied",
        "name": "꼬리 _Copied",
        "sourceMoveNameJA": "振り向き爆速尻尾突き_Copied",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "振り向き爆速尻尾突き_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【予兆付】激怒爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【予兆付】激怒爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "magnamalo.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ギガドリルブレイク",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "ギガドリルブレイク",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "malzeno": {
    "id": "malzeno",
    "nameEN": "Malzeno",
    "nameKO": "멜-제나",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "malzeno.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.0.projectile",
        "name": "화염구_",
        "sourceMoveNameJA": "超火球_着弾",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "超火球_着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.1.dmg",
        "name": "회전돌진_DMG",
        "sourceMoveNameJA": "回転突進_DMG",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "回転突進_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中クロス攻撃",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "空中クロス攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.3.dmg",
        "name": "회전 꼬리 _DMG",
        "sourceMoveNameJA": "回転攻撃（尻尾）_DMG",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "回転攻撃（尻尾）_DMG",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.4.vs",
        "name": "【 】VS ヴ _ 폭발",
        "sourceMoveNameJA": "【組技】VSイヴェル_フィニッシュ爆発",
        "type": "area",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【組技】VSイヴェル_フィニッシュ爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "malzeno.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "近距離かみつき",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "近距離かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "mizutsune": {
    "id": "mizutsune",
    "nameEN": "Mizutsune",
    "nameKO": "타마미츠네",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "mizutsune.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "水圧レーザー横",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "水圧レーザー横",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中大",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中大",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.3.mr",
        "name": "【MR】꼬리내려찍기",
        "sourceMoveNameJA": "【MR】尻尾叩き付け用",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【MR】尻尾叩き付け用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "しっぽ叩きつけ前半",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "しっぽ叩きつけ前半",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "mizutsune.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "二連縦しっぽ攻撃",
        "type": "physical",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "二連縦しっぽ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "nargacuga": {
    "id": "nargacuga",
    "nameEN": "Nargacuga",
    "nameKO": "나르가쿠르가",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "nargacuga.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.0.projectile",
        "name": "【 】 내려찍기",
        "sourceMoveNameJA": "【新技】横歩き叩きつけ着弾",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【新技】横歩き叩きつけ着弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.1.1",
        "name": "덮치기 １",
        "sourceMoveNameJA": "飛びかかり・１段目",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "飛びかかり・１段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.2.sweep",
        "name": "꼬리내려찍기",
        "sourceMoveNameJA": "尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.3.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "連続かみつき",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "連続かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ブレード攻撃",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ブレード攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "nargacuga.rise.5.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "大回転尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "大回転尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "narwa_the_allmother": {
    "id": "narwa_the_allmother",
    "nameEN": "Narwa the Allmother",
    "nameKO": "백룡 연원 나루하타타히메",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "narwa_the_allmother.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 85,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "必殺技・電球ブレス",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "必殺技・電球ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.1.charge",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【逆】錐もみ突進",
        "type": "charge",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "【逆】錐もみ突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.2.sweep",
        "name": "【 】 꼬리내려찍기",
        "sourceMoveNameJA": "【立】巨大化尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【立】巨大化尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "落下リングシェル",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 120,
        "sourceActionClass": "落下リングシェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "【立】巨大化パンチ",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【立】巨大化パンチ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "narwa_the_allmother.rise.5.area",
        "name": "【 】 방전",
        "sourceMoveNameJA": "【逆】電撃放電（ボディ）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【逆】電撃放電（ボディ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "pukei_pukei": {
    "id": "pukei_pukei",
    "nameEN": "Pukei-Pukei",
    "nameKO": "푸케푸케",
    "species": {
      "nameEN": "Bird Wyvern",
      "nameKO": "조룡종",
      "nameJA": "鳥竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "pukei_pukei.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.0.projectile",
        "name": "돌진브레스",
        "sourceMoveNameJA": "突進ブレス",
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
        "guardable": true,
        "sourcePower": 35,
        "sourceActionClass": "突進ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "舌ビンタ（ダッシュ後）",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "舌ビンタ（ダッシュ後）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメ無しアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメ無しアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.3.sweep",
        "name": "회전꼬리",
        "sourceMoveNameJA": "回転尻尾",
        "type": "sweep",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "回転尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "毒地面残り",
        "type": "area",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "毒地面残り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pukei_pukei.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "直接ポップ食べ攻撃",
        "type": "physical",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "直接ポップ食べ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "pyre_rakna_kadaki": {
    "id": "pyre_rakna_kadaki",
    "nameEN": "Pyre Rakna-Kadaki",
    "nameKO": "야츠카다키 아종",
    "species": {
      "nameEN": "Temnoceran",
      "nameKO": "협각종",
      "nameJA": "鋏角種",
      "internal": [
        "Other"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "pyre_rakna_kadaki.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.0.360",
        "name": "원거리 공격",
        "sourceMoveNameJA": "360度火炎放射（着弾部分）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "360度火炎放射（着弾部分）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.1.sweep",
        "name": "【 】회전",
        "sourceMoveNameJA": "【亜種】回転子グモばら撒き",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【亜種】回転子グモばら撒き",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.2.area",
        "name": "【 】 내려찍기",
        "sourceMoveNameJA": "【亜種】爪叩きつけ大爆破",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【亜種】爪叩きつけ大爆破",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "正面火炎放射の頭",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "正面火炎放射の頭",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "前脚振り下ろし",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "前脚振り下ろし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyre_rakna_kadaki.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "前脚振り下ろし（捕食攻撃）",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "前脚振り下ろし（捕食攻撃）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rajang": {
    "id": "rajang",
    "nameEN": "Rajang",
    "nameKO": "라잔",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rajang.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "気合ビーム（怒り）",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": false,
        "sourcePower": 60,
        "sourceActionClass": "気合ビーム（怒り）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.1.mr",
        "name": "【MR】 돌진",
        "sourceMoveNameJA": "【MR】ロングホーン突進中",
        "type": "charge",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "【MR】ロングホーン突進中",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプローリング",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "ジャンプローリング",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転攻撃",
        "type": "sweep",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "必殺両腕叩きつけ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "必殺両腕叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rajang.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "デンプシー",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "デンプシー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rakna_kadaki": {
    "id": "rakna_kadaki",
    "nameEN": "Rakna-Kadaki",
    "nameKO": "야츠카다키",
    "species": {
      "nameEN": "Temnoceran",
      "nameKO": "협각종",
      "nameJA": "鋏角種",
      "internal": [
        "Other"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rakna_kadaki.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.0.360",
        "name": "원거리 공격",
        "sourceMoveNameJA": "360度火炎放射（着弾部分）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "360度火炎放射（着弾部分）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾振り旋回",
        "type": "sweep",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "尻尾振り旋回",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.2.360",
        "name": "광역 강타",
        "sourceMoveNameJA": "360度火炎放射",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "360度火炎放射",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "正面火炎放射の頭",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "正面火炎放射の頭",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "前脚振り下ろし",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "前脚振り下ろし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rakna_kadaki.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "前脚振り下ろし（捕食攻撃）",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "前脚振り下ろし（捕食攻撃）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rathalos": {
    "id": "rathalos",
    "nameEN": "Rathalos",
    "nameKO": "리오레우스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rathalos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.0.projectile",
        "name": "화염구",
        "sourceMoveNameJA": "火球ダメージデータ",
        "type": "projectile",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "火球ダメージデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ファイアバーナー地走り",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー地走り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.2.aerial",
        "name": "【 】 점프",
        "sourceMoveNameJA": "【操竜】真下ジャンプ踏み付け",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【操竜】真下ジャンプ踏み付け",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.3.sweep",
        "name": "꼬리회전",
        "sourceMoveNameJA": "尻尾回転攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ファイアバーナー",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathalos.rise.5.charge",
        "name": "물어뜯기",
        "sourceMoveNameJA": "ダッシュ噛みつき",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "ダッシュ噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rathian": {
    "id": "rathian",
    "nameEN": "Rathian",
    "nameKO": "리오레이아",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rathian.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 15,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.0.projectile",
        "name": "화염구브레스",
        "sourceMoveNameJA": "強化火球ブレス",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 75,
        "sourceActionClass": "強化火球ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.1.charge",
        "name": "물어뜯기",
        "sourceMoveNameJA": "地上ダッシュかみつき",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "地上ダッシュかみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "※未使用 レイア_滑空",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "※未使用 レイア_滑空",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "地上尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "地上尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【怪異化】最大活性爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【怪異化】最大活性爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rathian.rise.5.aerial",
        "name": "물어뜯기",
        "sourceMoveNameJA": "空中かみつき",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "risen_chameleos": {
    "id": "risen_chameleos",
    "nameEN": "Risen Chameleos",
    "nameKO": "괴이 극복 오나즈치",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "risen_chameleos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "テスト咆哮",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "テスト咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "固定長ビーム状毒霧ヒットデータ",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "固定長ビーム状毒霧ヒットデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.1.006_1003",
        "name": "돌진",
        "sourceMoveNameJA": "006 - がさがさダッシュ(頭・前脚) 1003",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "006 - がさがさダッシュ(頭・前脚) 1003",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.3.sweep",
        "name": "【 】 꼬리내려찍기",
        "sourceMoveNameJA": "【傀気解放】毒尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【傀気解放】毒尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.4.area",
        "name": "【 】 _폭발",
        "sourceMoveNameJA": "【傀異克服】毒沼_爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【傀異克服】毒沼_爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_chameleos.rise.5.001",
        "name": "근접 강타",
        "sourceMoveNameJA": "001 - 舌直線攻撃",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "001 - 舌直線攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "risen_crimson_glow_valstrax": {
    "id": "risen_crimson_glow_valstrax",
    "nameEN": "Risen Crimson Glow Valstrax",
    "nameKO": "괴이 극복 발파루크",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "launch",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "risen_crimson_glow_valstrax.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.0.projectile",
        "name": "레이저_",
        "sourceMoveNameJA": "龍属性レーザー_正面大範囲",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "龍属性レーザー_正面大範囲",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ホバリング突進(翼)",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ホバリング突進(翼)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.2.aerial",
        "name": "점프휩쓸기",
        "sourceMoveNameJA": "ジャンプ薙ぎ払い",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ジャンプ薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.3.sweep",
        "name": "【 】 회전",
        "sourceMoveNameJA": "【克服】大車輪(回転)",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【克服】大車輪(回転)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "大技着地",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 80,
        "sourceActionClass": "大技着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_crimson_glow_valstrax.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "【克服】大車輪(突き刺し)",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【克服】大車輪(突き刺し)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "risen_kushala_daora": {
    "id": "risen_kushala_daora",
    "nameEN": "Risen Kushala Daora",
    "nameKO": "괴이 극복 크샬다오라",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "risen_kushala_daora.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス(発見)",
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "バインドボイス(発見)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "必殺ブレス(氷)",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "必殺ブレス(氷)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.1.charge",
        "name": "【 】돌진",
        "sourceMoveNameJA": "【傀異克服】突進",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【傀異克服】突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.2.and",
        "name": "【 】 돌진＆ 브레스",
        "sourceMoveNameJA": "【傀異克服】滑空突進＆巨大ブレス用シェル",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 110,
        "sourceActionClass": "【傀異克服】滑空突進＆巨大ブレス用シェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.3.sweep",
        "name": "회전",
        "sourceMoveNameJA": "回転上昇離陸",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "回転上昇離陸",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【傀異克服】龍爪キック用爆発",
        "type": "area",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【傀異克服】龍爪キック用爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_kushala_daora.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "組み技開始",
        "type": "physical",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "組み技開始",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "risen_shagaru_magala": {
    "id": "risen_shagaru_magala",
    "nameEN": "Risen Shagaru Magala",
    "nameKO": "괴이 극복 샤가르마가라",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "risen_shagaru_magala.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.0.projectile",
        "name": "브레스 폭발",
        "sourceMoveNameJA": "強・狂竜ブレス（口元爆発）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "強・狂竜ブレス（口元爆発）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "翼脚突進",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "翼脚突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.2.aerial",
        "name": "몸통박치기",
        "sourceMoveNameJA": "滑空体当たり",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "滑空体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.4.area",
        "name": "【 】【 】 _폭발",
        "sourceMoveNameJA": "【克服】【操竜】地雷柱_爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 90,
        "sourceActionClass": "【克服】【操竜】地雷柱_爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_shagaru_magala.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束攻撃(つかみ)",
        "type": "physical",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "拘束攻撃(つかみ)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "risen_teostra": {
    "id": "risen_teostra",
    "nameEN": "Risen Teostra",
    "nameKO": "괴이 극복 테오-테스카토르",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "risen_teostra.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.0.2",
        "name": "【 】 브레스 2",
        "sourceMoveNameJA": "【傀気解放】炎ブレス レベル2",
        "type": "projectile",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【傀気解放】炎ブレス レベル2",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.1.charge",
        "name": "돌진【 】",
        "sourceMoveNameJA": "突進【操竜受付確定】",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "突進【操竜受付確定】",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.2.aerial",
        "name": "돌진",
        "sourceMoveNameJA": "空中突進着地",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "空中突進着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "【傀気解放】スーパーノヴァ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【傀気解放】スーパーノヴァ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "risen_teostra.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "かみつき",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "royal_ludroth": {
    "id": "royal_ludroth",
    "nameEN": "Royal Ludroth",
    "nameKO": "로아루드로스",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "royal_ludroth.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "正面単発ブレス",
        "type": "projectile",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "正面単発ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "鎌首体当たり",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "鎌首体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメ無しアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメ無しアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.3.sweep",
        "name": "회전 물어뜯기",
        "sourceMoveNameJA": "回転攻撃（噛みつき）",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "回転攻撃（噛みつき）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "地面叩きつけ(身体)",
        "type": "area",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "地面叩きつけ(身体)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "royal_ludroth.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "小噛みつき",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "小噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "scorned_magnamalo": {
    "id": "scorned_magnamalo",
    "nameEN": "Scorned Magnamalo",
    "nameKO": "원망 서린 마가이마가도",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "scorned_magnamalo.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス_Copied",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "【操竜】鬼火噴射刃【火力必殺】",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "【操竜】鬼火噴射刃【火力必殺】",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ガスだまりバースト（突進）",
        "type": "charge",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "ガスだまりバースト（突進）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.3.copied",
        "name": "꼬리 _Copied",
        "sourceMoveNameJA": "振り向き爆速尻尾突き_Copied",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "振り向き爆速尻尾突き_Copied",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【予兆付】激怒爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【予兆付】激怒爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "scorned_magnamalo.rise.5.utility",
        "name": "특수 행동",
        "sourceMoveNameJA": "一極鬼火ブレード",
        "type": "utility",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "utility"
        ],
        "guardable": true,
        "sourcePower": 120,
        "sourceActionClass": "一極鬼火ブレード",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "seething_bazelgeuse": {
    "id": "seething_bazelgeuse",
    "nameEN": "Seething Bazelgeuse",
    "nameKO": "홍련의 솟구치는 바젤기우스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "seething_bazelgeuse.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "ブレス",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.1.charge",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【紅蓮】グライド突進",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【紅蓮】グライド突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.2.aerial",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【紅蓮】引きずり滑空突進",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【紅蓮】引きずり滑空突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.3.mr",
        "name": "【MR】 꼬리내려찍기",
        "sourceMoveNameJA": "【MR】前方連続尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【MR】前方連続尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "倒れ込みプレス（操竜用）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "倒れ込みプレス（操竜用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seething_bazelgeuse.rise.5.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾ウロコ飛ばし",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "尻尾ウロコ飛ばし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "seregios": {
    "id": "seregios",
    "nameEN": "Seregios",
    "nameKO": "셀레기오스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "seregios.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮（長）",
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "咆哮（長）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "タックル",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.1.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "尻尾薙ぎ払い(地上)",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾薙ぎ払い(地上)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "飛び上がりピンポイント急襲",
        "type": "physical",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "飛び上がりピンポイント急襲",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.3.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "足ひっかき(左)",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "足ひっかき(左)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "足ひっかき(右)",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": true,
        "sourcePower": 10,
        "sourceActionClass": "足ひっかき(右)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "seregios.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "旋回蹴り",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "旋回蹴り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "shagaru_magala": {
    "id": "shagaru_magala",
    "nameEN": "Shagaru Magala",
    "nameKO": "샤가르마가라",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "shagaru_magala.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.0.projectile",
        "name": "브레스 폭발",
        "sourceMoveNameJA": "強・狂竜ブレス（口元爆発）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "強・狂竜ブレス（口元爆発）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.1.6",
        "name": "_ ６ 몸통박치기",
        "sourceMoveNameJA": "翼腕_旧６足タックル",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "翼腕_旧６足タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.2.aerial",
        "name": "몸통박치기",
        "sourceMoveNameJA": "滑空体当たり",
        "type": "aerial",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "滑空体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.4.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "両翼脚腹下叩きつけ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "両翼脚腹下叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shagaru_magala.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "拘束攻撃(つかみ)",
        "type": "physical",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "拘束攻撃(つかみ)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "shogun_ceanataur": {
    "id": "shogun_ceanataur",
    "nameEN": "Shogun Ceanataur",
    "nameKO": "쇼군기자미",
    "species": {
      "nameEN": "Carapaceon",
      "nameKO": "갑각종",
      "nameJA": "甲殻種",
      "internal": [
        "Other",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "shogun_ceanataur.rise.0.rabbitconv019_g",
        "name": "원거리 공격",
        "sourceMoveNameJA": "RabbitConv019 - 【G級】とびかかり鎌ふりおろし(着弾)",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "RabbitConv019 - 【G級】とびかかり鎌ふりおろし(着弾)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "爪突進フィニッシュ",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "爪突進フィニッシュ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.2.rabbitconv006_atk08_18_20_21_34_35_37_38",
        "name": "RabbitConv006 - ATK08,18,20,21,34,35,37,38:잠복",
        "sourceMoveNameJA": "RabbitConv006 - ATK08,18,20,21,34,35,37,38:潜りからの突き上げ",
        "type": "burrow",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "RabbitConv006 - ATK08,18,20,21,34,35,37,38:潜りからの突き上げ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.3.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "ヤド薙ぎ払い(殻)",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "ヤド薙ぎ払い(殻)",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.4.area",
        "name": "【 】덮치기 내려찍기",
        "sourceMoveNameJA": "【操竜確定】飛び掛かり両鎌叩きつけ",
        "type": "area",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【操竜確定】飛び掛かり両鎌叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "shogun_ceanataur.rise.5.g",
        "name": "근접 강타",
        "sourceMoveNameJA": "【G級】とびかかり鎌ふりおろし",
        "type": "physical",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【G級】とびかかり鎌ふりおろし",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "silver_rathalos": {
    "id": "silver_rathalos",
    "nameEN": "Silver Rathalos",
    "nameKO": "리오레우스 희소종",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": true
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "silver_rathalos.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.0.projectile",
        "name": "【 】 물어뜯기브레스",
        "sourceMoveNameJA": "【ヌシ】チャージ噛みつきブレス二発目",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【ヌシ】チャージ噛みつきブレス二発目",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ファイアバーナー地走り",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー地走り",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.2.aerial",
        "name": "【 】 점프브레스화염구",
        "sourceMoveNameJA": "【ヌシ】高出力バックジャンプブレス火球",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "【ヌシ】高出力バックジャンプブレス火球",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.3.sweep",
        "name": "【 】 꼬리",
        "sourceMoveNameJA": "【希少】旋回尻尾",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "【希少】旋回尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "ファイアバーナー",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "ファイアバーナー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "silver_rathalos.rise.5.sweep",
        "name": "꼬리회전",
        "sourceMoveNameJA": "尻尾回転攻撃",
        "type": "sweep",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "尻尾回転攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "somnacanth": {
    "id": "somnacanth",
    "nameEN": "Somnacanth",
    "nameKO": "이소네미쿠니",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "somnacanth.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "地上突進",
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
        "guardable": true,
        "sourcePower": 35,
        "sourceActionClass": "地上突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "イルカジャンプ",
        "type": "aerial",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "イルカジャンプ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.2.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "髪ヒレ薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "髪ヒレ薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.3.area",
        "name": "내려찍기",
        "sourceMoveNameJA": "拳叩きつけ",
        "type": "area",
        "damageRatio": 0.365,
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
        "guardable": true,
        "sourcePower": 45,
        "sourceActionClass": "拳叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.4.mr",
        "name": "내려찍기_MR",
        "sourceMoveNameJA": "髪ヒレ叩き付け_MR",
        "type": "physical",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "髪ヒレ叩き付け_MR",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "somnacanth.rise.5.2",
        "name": "근접 강타",
        "sourceMoveNameJA": "2連パンチ",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "2連パンチ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "teostra": {
    "id": "teostra",
    "nameEN": "Teostra",
    "nameKO": "테오-테스카토르",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "teostra.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.0.projectile",
        "name": "_ 브레스",
        "sourceMoveNameJA": "リセット熱風_口から出すブレス部分（操竜用）",
        "type": "projectile",
        "damageRatio": 0.478,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "リセット熱風_口から出すブレス部分（操竜用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.1.charge",
        "name": "돌진【 】",
        "sourceMoveNameJA": "突進【操竜受付確定】",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "突進【操竜受付確定】",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.2.aerial",
        "name": "돌진",
        "sourceMoveNameJA": "空中突進着地",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "空中突進着地",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.3.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "スーパーノヴァ",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "スーパーノヴァ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "teostra.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "かみつき",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "かみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "tetranadon": {
    "id": "tetranadon",
    "nameEN": "Tetranadon",
    "nameKO": "요츠미와두",
    "species": {
      "nameEN": "Amphibian",
      "nameKO": "양서종",
      "nameJA": "両生種",
      "internal": [
        "Other",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "tetranadon.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "※未使用 【デブ】咆哮",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "※未使用 【デブ】咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.0.projectile",
        "name": "【 】 레이저",
        "sourceMoveNameJA": "【デブ】水まき散らしレーザー",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【デブ】水まき散らしレーザー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.1.charge",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【デブ】突っ張り突進",
        "type": "charge",
        "damageRatio": 0.478,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "guardable": true,
        "sourcePower": 70,
        "sourceActionClass": "【デブ】突っ張り突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージなしアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージなしアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.3.sweep",
        "name": "※ 【 】꼬리",
        "sourceMoveNameJA": "※未使用 【デブ】尻尾攻撃",
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
        "guardable": true,
        "sourcePower": 35,
        "sourceActionClass": "※未使用 【デブ】尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "【デブ】地面砕け岩",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 85,
        "sourceActionClass": "【デブ】地面砕け岩",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tetranadon.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "【デブ】岩投げ岩",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【デブ】岩投げ岩",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "thunder_serpent_narwa": {
    "id": "thunder_serpent_narwa",
    "nameEN": "Thunder Serpent Narwa",
    "nameKO": "나루하타타히메",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "thunder_serpent_narwa.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 85,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "必殺技・電球ブレス",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "必殺技・電球ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.1.charge",
        "name": "【 】 돌진",
        "sourceMoveNameJA": "【逆】錐もみ突進",
        "type": "charge",
        "damageRatio": 0.41,
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
        "guardable": true,
        "sourcePower": 55,
        "sourceActionClass": "【逆】錐もみ突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.2.sweep",
        "name": "【 】 꼬리내려찍기",
        "sourceMoveNameJA": "【立】巨大化尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【立】巨大化尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "落下リングシェル",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 120,
        "sourceActionClass": "落下リングシェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "雷爆破",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "雷爆破",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "thunder_serpent_narwa.rise.5.area",
        "name": "【 】 방전",
        "sourceMoveNameJA": "【逆】電撃放電（ボディ）",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【逆】電撃放電（ボディ）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "tigrex": {
    "id": "tigrex",
    "nameEN": "Tigrex",
    "nameKO": "티가렉스",
    "species": {
      "nameEN": "Flying Wyvern",
      "nameKO": "비룡종",
      "nameJA": "飛竜種",
      "internal": [
        "Flying wyvern",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "tigrex.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮：攻撃アタリ（咆哮：内側）",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮：攻撃アタリ（咆哮：内側）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "ダッシュ攻撃（突進）（操竜用）",
        "type": "charge",
        "damageRatio": 0.474,
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
        "guardable": true,
        "sourcePower": 69,
        "sourceActionClass": "ダッシュ攻撃（突進）（操竜用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.1.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ攻撃（飛びつき）",
        "type": "aerial",
        "damageRatio": 0.474,
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
        "guardable": true,
        "sourcePower": 69,
        "sourceActionClass": "ジャンプ攻撃（飛びつき）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.2.mr_and",
        "name": "【MR】물어뜯기＆ 회전",
        "sourceMoveNameJA": "【MR】噛みつき＆フック半回転",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "【MR】噛みつき＆フック半回転",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.3.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "岩（溶岩）",
        "type": "area",
        "damageRatio": 0.337,
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
        "guardable": true,
        "sourcePower": 39,
        "sourceActionClass": "岩（溶岩）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "確定操竜アタリ（とびかかり）",
        "type": "physical",
        "damageRatio": 0.474,
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
        "guardable": true,
        "sourcePower": 69,
        "sourceActionClass": "確定操竜アタリ（とびかかり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tigrex.rise.5.close",
        "name": "물어뜯기 물어뜯기",
        "sourceMoveNameJA": "かみつき小（かみつき）",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "かみつき小（かみつき）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "tobi_kadachi": {
    "id": "tobi_kadachi",
    "nameEN": "Tobi-Kadachi",
    "nameKO": "토비카가치",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "tobi_kadachi.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.0.projectile",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾棘 接地後弾",
        "type": "projectile",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "尻尾棘 接地後弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.1.charge",
        "name": "【 】 물어뜯기 돌진물어뜯기",
        "sourceMoveNameJA": "【地上】横中技噛みつき （横 突進かみつき 中技）",
        "type": "charge",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【地上】横中技噛みつき （横 突進かみつき 中技）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.2.11_25m",
        "name": "【 】 덮치기 11～25m 덮치기",
        "sourceMoveNameJA": "【地上】遠距離飛びかかり （遠距離（11～25m）飛び掛かり）",
        "type": "aerial",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "【地上】遠距離飛びかかり （遠距離（11～25m）飛び掛かり）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.3.sweep",
        "name": "【 】 꼬리",
        "sourceMoveNameJA": "【地上】横必殺尻尾",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【地上】横必殺尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.4.area",
        "name": "광역 강타",
        "sourceMoveNameJA": "【木⇒地】ボディープレス",
        "type": "area",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "【木⇒地】ボディープレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "tobi_kadachi.rise.5.close",
        "name": "【 】 물어뜯기",
        "sourceMoveNameJA": "【地上】横牽制 （横かみつき）",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "【地上】横牽制 （横かみつき）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "velkhana": {
    "id": "velkhana",
    "nameEN": "Velkhana",
    "nameKO": "이베르카나",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": "fly",
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Strong roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "velkhana.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.0.projectile",
        "name": "_ 브레스",
        "sourceMoveNameJA": "操竜用_極低温ブレス（強）",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 110,
        "sourceActionClass": "操竜用_極低温ブレス（強）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.2.aerial",
        "name": "덮치기꼬리휩쓸기",
        "sourceMoveNameJA": "飛びかかり尻尾なぎ払い",
        "type": "aerial",
        "damageRatio": 0.48,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "飛びかかり尻尾なぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.3.sweep",
        "name": "꼬리휩쓸기",
        "sourceMoveNameJA": "滞空尻尾なぎ払い",
        "type": "sweep",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "滞空尻尾なぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.4.area",
        "name": "_ 폭발",
        "sourceMoveNameJA": "操竜用_冷気解放大爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "操竜用_冷気解放大爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velkhana.rise.5.utility",
        "name": "물어뜯기",
        "sourceMoveNameJA": "回り込みかみつき",
        "type": "utility",
        "damageRatio": 0.342,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "utility"
        ],
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "回り込みかみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "violet_mizutsune": {
    "id": "violet_mizutsune",
    "nameEN": "Violet Mizutsune",
    "nameKO": "타마미츠네 희소종",
    "species": {
      "nameEN": "Leviathan",
      "nameKO": "해룡종",
      "nameJA": "海竜種",
      "internal": [
        "Leviathan",
        "Aquatic"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "violet_mizutsune.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "バインドボイス",
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "バインドボイス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.0.projectile",
        "name": "레이저",
        "sourceMoveNameJA": "水圧レーザー横",
        "type": "projectile",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "水圧レーザー横",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.2.aerial",
        "name": "공중 급습",
        "sourceMoveNameJA": "空中大",
        "type": "aerial",
        "damageRatio": 0.296,
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
        "guardable": true,
        "sourcePower": 30,
        "sourceActionClass": "空中大",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.3.mr",
        "name": "【MR】꼬리내려찍기",
        "sourceMoveNameJA": "【MR】尻尾叩き付け用",
        "type": "sweep",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【MR】尻尾叩き付け用",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.4.area",
        "name": "【 】 폭발_",
        "sourceMoveNameJA": "【希少種】大技大爆発_強化",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": false,
        "sourcePower": 100,
        "sourceActionClass": "【希少種】大技大爆発_強化",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "violet_mizutsune.rise.5.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "その場噛みつき",
        "type": "physical",
        "damageRatio": 0.274,
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
        "guardable": true,
        "sourcePower": 25,
        "sourceActionClass": "その場噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "volvidon": {
    "id": "volvidon",
    "nameEN": "Volvidon",
    "nameKO": "랑그로토라",
    "species": {
      "nameEN": "Fanged Beast",
      "nameKO": "아수종",
      "nameJA": "牙獣種",
      "internal": [
        "Fanged beast"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "volvidon.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "麻痺ブレスシェル",
        "type": "projectile",
        "damageRatio": 0.251,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 8,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 28,
        "weight": 1,
        "tags": [
          "projectile",
          "paralysis"
        ],
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "麻痺ブレスシェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.1.5m",
        "name": "돌진5ｍ",
        "sourceMoveNameJA": "転がり突進5ｍ前",
        "type": "charge",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "転がり突進5ｍ前",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.2.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ用ダメージなしアタリ",
        "type": "aerial",
        "damageRatio": 0.251,
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
        "guardable": true,
        "sourcePower": 20,
        "sourceActionClass": "ジャンプ用ダメージなしアタリ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.3.rabbitconv004",
        "name": "RabbitConv004 - 회전",
        "sourceMoveNameJA": "RabbitConv004 - その場回転爪",
        "type": "sweep",
        "damageRatio": 0.342,
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "RabbitConv004 - その場回転爪",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.4.rabbitconv023",
        "name": "광역 강타",
        "sourceMoveNameJA": "RabbitConv023 - ボディプレス",
        "type": "area",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "RabbitConv023 - ボディプレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "volvidon.rise.5.rabbitconv001",
        "name": "근접 강타",
        "sourceMoveNameJA": "RabbitConv001 - （ラビット未使用）",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "RabbitConv001 - （ラビット未使用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "wind_serpent_ibushi": {
    "id": "wind_serpent_ibushi",
    "nameEN": "Wind Serpent Ibushi",
    "nameKO": "이부시마키히코",
    "species": {
      "nameEN": "Elder Dragon",
      "nameKO": "고룡종",
      "nameJA": "古龍種",
      "internal": [
        "Other",
        "Arial"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "wind_serpent_ibushi.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.0.projectile",
        "name": "휩쓸기레이저",
        "sourceMoveNameJA": "薙ぎ払いレーザー",
        "type": "projectile",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "projectile"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "薙ぎ払いレーザー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.1.charge",
        "name": "돌진",
        "sourceMoveNameJA": "地面走り気流",
        "type": "charge",
        "damageRatio": 0.455,
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
        "guardable": true,
        "sourcePower": 65,
        "sourceActionClass": "地面走り気流",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.2.sweep",
        "name": "【 】 꼬리내려찍기",
        "sourceMoveNameJA": "【立】巨大化尻尾叩きつけ",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": false,
        "sourcePower": 80,
        "sourceActionClass": "【立】巨大化尻尾叩きつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.3.mr",
        "name": "광역 강타",
        "sourceMoveNameJA": "【MR】ボディプレス",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【MR】ボディプレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.4.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "浮遊岩攻撃モードシェル",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 100,
        "sourceActionClass": "浮遊岩攻撃モードシェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wind_serpent_ibushi.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "【逆さ】昇竜",
        "type": "physical",
        "damageRatio": 0.387,
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
        "guardable": true,
        "sourcePower": 50,
        "sourceActionClass": "【逆さ】昇竜",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "zinogre": {
    "id": "zinogre",
    "nameEN": "Zinogre",
    "nameKO": "진오우거",
    "species": {
      "nameEN": "Fanged Wyvern",
      "nameKO": "아룡종",
      "nameJA": "牙竜種",
      "internal": [
        "Fanged wyvern"
      ]
    },
    "locomotion": {
      "defaultMovePattern": null,
      "flyingStanceToMove": false
    },
    "roar": {
      "status": "verified-present",
      "strength": "Weak roar",
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "zinogre.rise.roar",
        "name": "포효",
        "sourceMoveNameJA": "咆哮",
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
        "guardable": true,
        "sourcePower": 40,
        "sourceActionClass": "咆哮",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "雷光虫弾シェル",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": true,
        "sourcePower": 0,
        "sourceActionClass": "雷光虫弾シェル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.2.aerial",
        "name": "덮치기",
        "sourceMoveNameJA": "飛びかかり攻撃",
        "type": "aerial",
        "damageRatio": 0.433,
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
        "guardable": true,
        "sourcePower": 60,
        "sourceActionClass": "飛びかかり攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.3.sweep",
        "name": "_ 꼬리",
        "sourceMoveNameJA": "サマーソルト攻撃_浴びせ尻尾から繋がるサマー",
        "type": "sweep",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "サマーソルト攻撃_浴びせ尻尾から繋がるサマー",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.4.area",
        "name": "【 】 폭발",
        "sourceMoveNameJA": "【怪異化】最大活性爆発",
        "type": "area",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "area"
        ],
        "guardable": true,
        "sourcePower": 90,
        "sourceActionClass": "【怪異化】最大活性爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zinogre.rise.5.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "サマーソルト攻撃",
        "type": "physical",
        "damageRatio": 0.48,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 12,
        "minTargets": 1,
        "maxTargets": 1,
        "cooldownTicks": 45,
        "weight": 1,
        "tags": [
          "close"
        ],
        "guardable": true,
        "sourcePower": 80,
        "sourceActionClass": "サマーソルト攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "mhrice-installed-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "altaroth": {
    "id": "altaroth",
    "nameEN": "Altaroth",
    "nameKO": "오르타로스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "altaroth.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ギ酸攻撃",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "ギ酸攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "altaroth.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき攻撃ロング",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき攻撃ロング",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "altaroth.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき攻撃ショート",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき攻撃ショート",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "anteka": {
    "id": "anteka",
    "nameEN": "Anteka",
    "nameKO": "가우시카",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "anteka.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.21,
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
        "guardable": false,
        "sourcePower": 11,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anteka.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "突き上げ",
        "type": "physical",
        "damageRatio": 0.21,
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
        "guardable": false,
        "sourcePower": 11,
        "sourceActionClass": "突き上げ",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "anteka.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "足蹴り",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "足蹴り",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "baggi": {
    "id": "baggi",
    "nameEN": "Baggi",
    "nameKO": "바기",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "baggi.rise.0.aerial",
        "name": "점프몸통박치기",
        "sourceMoveNameJA": "ジャンプ体当たり",
        "type": "aerial",
        "damageRatio": 0.224,
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
        "guardable": false,
        "sourcePower": 14,
        "sourceActionClass": "ジャンプ体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "baggi.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "baggi.rise.2.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "bnahabra": {
    "id": "bnahabra",
    "nameEN": "Bnahabra",
    "nameKO": "브나하브라",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bnahabra.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "タックル",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bnahabra.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "属性耐性低下液ダメージデータ",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "属性耐性低下液ダメージデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bnahabra.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "通常針",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "通常針",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "boggi": {
    "id": "boggi",
    "nameEN": "Boggi",
    "nameKO": "올기",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "boggi.rise.0.aerial",
        "name": "점프몸통박치기",
        "sourceMoveNameJA": "ジャンプ体当たり",
        "type": "aerial",
        "damageRatio": 0.224,
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
        "guardable": false,
        "sourcePower": 14,
        "sourceActionClass": "ジャンプ体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "boggi.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "boggi.rise.2.1",
        "name": "물어뜯기１",
        "sourceMoveNameJA": "噛みつき１段目",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき１段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "bombadgy": {
    "id": "bombadgy",
    "nameEN": "Bombadgy",
    "nameKO": "분부지나",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bombadgy.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "たぬタックル",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "たぬタックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bombadgy.rise.1.area",
        "name": "폭발",
        "sourceMoveNameJA": "爆発(イベクエ用)",
        "type": "area",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "爆発(イベクエ用)",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bombadgy.rise.2.area",
        "name": "폭발",
        "sourceMoveNameJA": "爆発",
        "type": "area",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "爆発",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "bullfango": {
    "id": "bullfango",
    "nameEN": "Bullfango",
    "nameKO": "불팽고",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "bullfango.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進攻撃",
        "type": "charge",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "突進攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "bullfango.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ジタバタ攻撃",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "ジタバタ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "ceanataur": {
    "id": "ceanataur",
    "nameEN": "Ceanataur",
    "nameKO": "가미자미",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "ceanataur.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "毒ブレス",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "毒ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "ceanataur.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ハサミ攻撃(強)",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": false,
        "sourcePower": 30,
        "sourceActionClass": "ハサミ攻撃(強)",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "ceanataur.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "移動攻撃",
        "type": "physical",
        "damageRatio": 0.215,
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
        "guardable": false,
        "sourcePower": 12,
        "sourceActionClass": "移動攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "delex": {
    "id": "delex",
    "nameEN": "Delex",
    "nameKO": "델크스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "delex.rise.0.charge",
        "name": "돌진물어뜯기",
        "sourceMoveNameJA": "突進噛みつき",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "突進噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "delex.rise.1.emshellhitattackrsdata",
        "name": "근접 강타",
        "sourceMoveNameJA": "EmShellHitAttackRSData",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "EmShellHitAttackRSData",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "delex.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "felyne": {
    "id": "felyne",
    "nameEN": "Felyne",
    "nameKO": "아이루",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "felyne.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "大タル爆弾",
        "type": "projectile",
        "damageRatio": 0.387,
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
        "guardable": false,
        "sourcePower": 50,
        "sourceActionClass": "大タル爆弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "felyne.rise.1.charge",
        "name": "※ 몸통박치기",
        "sourceMoveNameJA": "※未使用 体当たり",
        "type": "charge",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "※未使用 体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "felyne.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "武器攻撃",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "武器攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gajau": {
    "id": "gajau",
    "nameEN": "Gajau",
    "nameKO": "가쟈우",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gajau.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gajau.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "陸飛びかみつき",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "陸飛びかみつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gajau.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "水中噛みつき",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "水中噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gargwa": {
    "id": "gargwa",
    "nameEN": "Gargwa",
    "nameKO": "가구아",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "gargwa.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ヒップアタック",
        "type": "physical",
        "damageRatio": 0.21,
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
        "guardable": false,
        "sourcePower": 11,
        "sourceActionClass": "ヒップアタック",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "gargwa.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "つっつき攻撃",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "つっつき攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "gowngoat": {
    "id": "gowngoat",
    "nameEN": "Gowngoat",
    "nameKO": "메르크",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": []
  },
  "hermitaur": {
    "id": "hermitaur",
    "nameEN": "Hermitaur",
    "nameKO": "야오자미",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "hermitaur.rise.0.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ハサミ攻撃(強)",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": false,
        "sourcePower": 30,
        "sourceActionClass": "ハサミ攻撃(強)",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "hermitaur.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "移動攻撃",
        "type": "physical",
        "damageRatio": 0.215,
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
        "guardable": false,
        "sourcePower": 12,
        "sourceActionClass": "移動攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "hermitaur.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ハサミ攻撃(弱)",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "ハサミ攻撃(弱)",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "hornetaur": {
    "id": "hornetaur",
    "nameEN": "Hornetaur",
    "nameKO": "칸타로스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "hornetaur.rise.0.aerial",
        "name": "점프",
        "sourceMoveNameJA": "ジャンプ攻撃",
        "type": "aerial",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "ジャンプ攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "izuchi": {
    "id": "izuchi",
    "nameEN": "Izuchi",
    "nameKO": "이즈치",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "izuchi.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "砂利ブレス",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "砂利ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "izuchi.rise.1.sweep",
        "name": "휩쓸기",
        "sourceMoveNameJA": "足元薙ぎ払い",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "足元薙ぎ払い",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "izuchi.rise.2.mr",
        "name": "근접 강타",
        "sourceMoveNameJA": "【MR】春風脚",
        "type": "physical",
        "damageRatio": 0.342,
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
        "guardable": false,
        "sourcePower": 40,
        "sourceActionClass": "【MR】春風脚",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "jaggi": {
    "id": "jaggi",
    "nameEN": "Jaggi",
    "nameKO": "재기",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "jaggi.rise.0.aerial",
        "name": "점프몸통박치기",
        "sourceMoveNameJA": "ジャンプ体当たり",
        "type": "aerial",
        "damageRatio": 0.224,
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
        "guardable": false,
        "sourcePower": 14,
        "sourceActionClass": "ジャンプ体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jaggi.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jaggi.rise.2.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "jaggia": {
    "id": "jaggia",
    "nameEN": "Jaggia",
    "nameKO": "재기노스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "jaggia.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jaggia.rise.1.2",
        "name": "물어뜯기2",
        "sourceMoveNameJA": "噛みつき2段目",
        "type": "physical",
        "damageRatio": 0.224,
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
        "guardable": false,
        "sourcePower": 14,
        "sourceActionClass": "噛みつき2段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jaggia.rise.2.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "jagras": {
    "id": "jagras",
    "nameEN": "Jagras",
    "nameKO": "쟈그라스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "jagras.rise.0.close",
        "name": "덮치기",
        "sourceMoveNameJA": "飛び掛かり",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "飛び掛かり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jagras.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "茂み探し",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "茂み探し",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "jagras.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "中噛みつき",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "中噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "kelbi": {
    "id": "kelbi",
    "nameEN": "Kelbi",
    "nameKO": "켈비",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kelbi.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kelbi.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "突き上げ",
        "type": "physical",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "突き上げ",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kelbi.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "足蹴",
        "type": "physical",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "足蹴",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "kestodon": {
    "id": "kestodon",
    "nameEN": "Kestodon",
    "nameKO": "케스토돈",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "kestodon.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進頭突き",
        "type": "charge",
        "damageRatio": 0.274,
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
        "guardable": false,
        "sourcePower": 25,
        "sourceActionClass": "突進頭突き",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "kestodon.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "その場タックル",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "その場タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "ludroth": {
    "id": "ludroth",
    "nameEN": "Ludroth",
    "nameKO": "루드로스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "ludroth.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "水吐き攻撃",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "水吐き攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "ludroth.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "飛びつき攻撃",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": false,
        "sourcePower": 30,
        "sourceActionClass": "飛びつき攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "ludroth.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "二連噛みつき",
        "type": "physical",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "二連噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "melynx": {
    "id": "melynx",
    "nameEN": "Melynx",
    "nameKO": "메라루",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "melynx.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "melynx.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "近接攻撃盗み",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "近接攻撃盗み",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "popo": {
    "id": "popo",
    "nameEN": "Popo",
    "nameKO": "포포",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": []
  },
  "pyrantula": {
    "id": "pyrantula",
    "nameEN": "Pyrantula",
    "nameKO": "하제히바키",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "pyrantula.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "火ブレス",
        "type": "projectile",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "火ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyrantula.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "pyrantula.rise.2.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "火ブレス（仮実装用）",
        "type": "projectile",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "火ブレス（仮実装用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rachnoid": {
    "id": "rachnoid",
    "nameEN": "Rachnoid",
    "nameKO": "츠케히바키",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rachnoid.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "火ブレス（仮実装用）",
        "type": "projectile",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "火ブレス（仮実装用）",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rachnoid.rise.1.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rachnoid.rise.2.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "火ブレス",
        "type": "projectile",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "火ブレス",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "remobra": {
    "id": "remobra",
    "nameEN": "Remobra",
    "nameKO": "가브라스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "remobra.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "毒弾",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "毒弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "remobra.rise.1.aerial",
        "name": "급강하",
        "sourceMoveNameJA": "急降下キック攻撃",
        "type": "aerial",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "急降下キック攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "remobra.rise.2.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾攻撃",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "尻尾攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "rhenoplos": {
    "id": "rhenoplos",
    "nameEN": "Rhenoplos",
    "nameKO": "리노프로스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "rhenoplos.rise.0.charge",
        "name": "돌진",
        "sourceMoveNameJA": "突進",
        "type": "charge",
        "damageRatio": 0.296,
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
        "guardable": false,
        "sourcePower": 30,
        "sourceActionClass": "突進",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rhenoplos.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "ストンピング攻撃",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "ストンピング攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "rhenoplos.rise.2.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "slagtoth": {
    "id": "slagtoth",
    "nameEN": "Slagtoth",
    "nameKO": "즈와로포스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "slagtoth.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "体当たり",
        "type": "charge",
        "damageRatio": 0.21,
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
        "guardable": false,
        "sourcePower": 11,
        "sourceActionClass": "体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "slagtoth.rise.1.sweep",
        "name": "꼬리",
        "sourceMoveNameJA": "尻尾",
        "type": "sweep",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "尻尾",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "slagtoth.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "踏みつけ",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "踏みつけ",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "uroktor": {
    "id": "uroktor",
    "nameEN": "Uroktor",
    "nameKO": "우로코트르",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "uroktor.rise.0.projectile",
        "name": "원거리 공격",
        "sourceMoveNameJA": "火の弾",
        "type": "projectile",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "火の弾",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "uroktor.rise.1.burrow",
        "name": "、 、튀어나오기",
        "sourceMoveNameJA": "溶岩アザラシ専用、地中、飛び出し攻撃",
        "type": "burrow",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "溶岩アザラシ専用、地中、飛び出し攻撃",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "uroktor.rise.2.rabbitconv007",
        "name": "근접 강타",
        "sourceMoveNameJA": "RabbitConv007 -",
        "type": "physical",
        "damageRatio": 0.296,
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
        "guardable": false,
        "sourcePower": 30,
        "sourceActionClass": "RabbitConv007 -",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "velociprey": {
    "id": "velociprey",
    "nameEN": "Velociprey",
    "nameKO": "람포스",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "velociprey.rise.0.close",
        "name": "덮치기",
        "sourceMoveNameJA": "飛び掛かり",
        "type": "physical",
        "damageRatio": 0.228,
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
        "guardable": false,
        "sourcePower": 15,
        "sourceActionClass": "飛び掛かり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velociprey.rise.1.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "噛みつき",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "velociprey.rise.2.close",
        "name": "물어뜯기",
        "sourceMoveNameJA": "早い噛みつき",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "早い噛みつき",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "vespoid": {
    "id": "vespoid",
    "nameEN": "Vespoid",
    "nameKO": "랑고스타",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "vespoid.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "タックル",
        "type": "charge",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "タックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "vespoid.rise.1.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "針刺し",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "針刺し",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "vespoid.rise.2.close",
        "name": "근접 강타",
        "sourceMoveNameJA": "麻痺針",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "麻痺針",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "wroggi": {
    "id": "wroggi",
    "nameEN": "Wroggi",
    "nameKO": "프로기",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "wroggi.rise.0.charge",
        "name": "몸통박치기",
        "sourceMoveNameJA": "ショルダータックル",
        "type": "charge",
        "damageRatio": 0.251,
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
        "guardable": false,
        "sourcePower": 20,
        "sourceActionClass": "ショルダータックル",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wroggi.rise.1.2",
        "name": "물어뜯기2",
        "sourceMoveNameJA": "噛みつき2段目",
        "type": "physical",
        "damageRatio": 0.224,
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
        "guardable": false,
        "sourcePower": 14,
        "sourceActionClass": "噛みつき2段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "wroggi.rise.2.1",
        "name": "물어뜯기1",
        "sourceMoveNameJA": "噛みつき1段目",
        "type": "physical",
        "damageRatio": 0.205,
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
        "guardable": false,
        "sourcePower": 10,
        "sourceActionClass": "噛みつき1段目",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  },
  "zamite": {
    "id": "zamite",
    "nameEN": "Zamite",
    "nameKO": "스쿠아길",
    "species": null,
    "locomotion": null,
    "roar": {
      "status": "verified-absent",
      "strength": null,
      "audioStatus": "unresolved"
    },
    "patterns": [
      {
        "id": "zamite.rise.0.projectile",
        "name": "브레스",
        "sourceMoveNameJA": "ブレスヒットデータ",
        "type": "projectile",
        "damageRatio": 0.16,
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
        "guardable": false,
        "sourcePower": 0,
        "sourceActionClass": "ブレスヒットデータ",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zamite.rise.1.4",
        "name": "4 몸통박치기",
        "sourceMoveNameJA": "4足体当たり",
        "type": "charge",
        "damageRatio": 0.233,
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
        "guardable": false,
        "sourcePower": 16,
        "sourceActionClass": "4足体当たり",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      },
      {
        "id": "zamite.rise.2.2",
        "name": "2 튀어나오기",
        "sourceMoveNameJA": "2足飛び出し",
        "type": "physical",
        "damageRatio": 0.233,
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
        "guardable": false,
        "sourcePower": 16,
        "sourceActionClass": "2足飛び出し",
        "sourceGame": "rise-sunbreak",
        "evidence": "kiranico-rise-installed-attack-move-table",
        "confidence": "extracted-action"
      }
    ]
  }
};

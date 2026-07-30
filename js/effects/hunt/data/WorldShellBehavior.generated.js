window.HUNT_WORLD_SHELL_BEHAVIOR = {
  "acidic_glavenus": {
    "id": "acidic_glavenus",
    "sourceGroups": [
      "AcidicGlavenus"
    ],
    "sourceMonsterCodes": [
      "em080_01"
    ],
    "sourceActionCount": 35,
    "patterns": [
      {
        "id": "acidic_glavenus.worldshell.0.breath_step",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_STEP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "acidic_glavenus.worldshell.1.tail_vertical_attack_slash_combo",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_VERTICAL_ATTACK_SLASH_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "acidic_glavenus.worldshell.2.tail_vertical_attack_step_combo",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_VERTICAL_ATTACK_STEP_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "acidic_glavenus.worldshell.3.tail_fire_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_FIRE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "acidic_glavenus.worldshell.4.tail_fire_attack_back",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_FIRE_ATTACK_BACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "acidic_glavenus.worldshell.5.tail_vertical_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_VERTICAL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "alatreon": {
    "id": "alatreon",
    "sourceGroups": [
      "Alatreon"
    ],
    "sourceMonsterCodes": [
      "em050_00"
    ],
    "sourceActionCount": 55,
    "patterns": [
      {
        "id": "alatreon.worldshell.0.triple_fire_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TRIPLE_FIRE_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "alatreon.worldshell.1.dragon_nova_ground",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "DRAGON_NOVA_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "alatreon.worldshell.2.press_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "PRESS_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "alatreon.worldshell.3.dragon_nova_fly_main_l",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "DRAGON_NOVA_FLY_MAIN_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "alatreon.worldshell.4.dragon_nova_fly_main_r",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "DRAGON_NOVA_FLY_MAIN_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "alatreon.worldshell.5.fire_breath_ground",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "FIRE_BREATH_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "ancient_leshen": {
    "id": "ancient_leshen",
    "sourceGroups": [
      "AncientLeshen"
    ],
    "sourceMonsterCodes": [
      "em127_00"
    ],
    "sourceActionCount": 30,
    "patterns": [
      {
        "id": "ancient_leshen.worldshell.0.crow_rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "CROW_RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ancient_leshen.worldshell.1.crow_nova_lv1",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "CROW_NOVA_LV1",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ancient_leshen.worldshell.2.to_catch_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_CATCH_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ancient_leshen.worldshell.3.crow_nova_lv2",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "CROW_NOVA_LV2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ancient_leshen.worldshell.4.crow_nova_lv3",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "CROW_NOVA_LV3",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ancient_leshen.worldshell.5.crow_rush_ex",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "CROW_RUSH_EX",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "anjanath": {
    "id": "anjanath",
    "sourceGroups": [
      "Anjanath"
    ],
    "sourceMonsterCodes": [
      "em100_00"
    ],
    "sourceActionCount": 43,
    "patterns": [
      {
        "id": "anjanath.worldshell.0.breath_charge",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "anjanath.worldshell.1.rush_bite",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "anjanath.worldshell.2.bite_2ren_combo",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_2REN_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "anjanath.worldshell.3.bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "anjanath.worldshell.4.step_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STEP_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "anjanath.worldshell.5.round_to_bite_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "ROUND_TO_BITE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "azure_rathalos": {
    "id": "azure_rathalos",
    "sourceGroups": [
      "AzureRathalos"
    ],
    "sourceMonsterCodes": [
      "em002_01"
    ],
    "sourceActionCount": 63,
    "patterns": [
      {
        "id": "azure_rathalos.worldshell.0.back_hover_breath_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_HOVER_BREATH_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "azure_rathalos.worldshell.1.rush_bite_fly_combo",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_BITE_FLY_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "azure_rathalos.worldshell.2.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "azure_rathalos.worldshell.3.breath_fly_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "azure_rathalos.worldshell.4.double_kick_fly2_combo",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "azure_rathalos.worldshell.5.back_step_breath_to_air_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH_TO_AIR_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "banbaro": {
    "id": "banbaro",
    "sourceGroups": [
      "Banbaro"
    ],
    "sourceMonsterCodes": [
      "em123_00"
    ],
    "sourceActionCount": 25,
    "patterns": [
      {
        "id": "banbaro.worldshell.0.shot_rock_attack_ground",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SHOT_ROCK_ATTACK_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "banbaro.worldshell.1.rush_to_stop_1",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_TO_STOP_1",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "banbaro.worldshell.2.overlie_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "OVERLIE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "banbaro.worldshell.3.shot_rock_attack",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SHOT_ROCK_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "banbaro.worldshell.4.to_rush_to_stop_1",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "TO_RUSH_TO_STOP_1",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "banbaro.worldshell.5.rush_to_stop_2",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_TO_STOP_2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "barioth": {
    "id": "barioth",
    "sourceGroups": [
      "Barioth"
    ],
    "sourceMonsterCodes": [
      "em042_00"
    ],
    "sourceActionCount": 8,
    "patterns": [
      {
        "id": "barioth.worldshell.0.breath_normal",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_NORMAL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barioth.worldshell.1.tail_attack_clockwise",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_CLOCKWISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barioth.worldshell.2.bite_slammed_latter",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_SLAMMED_LATTER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barioth.worldshell.3.bite_slammed_latter_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_SLAMMED_LATTER_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barioth.worldshell.4.tail_attack_counter_clockwise",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_COUNTER_CLOCKWISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barioth.worldshell.5.breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "barroth": {
    "id": "barroth",
    "sourceGroups": [
      "Barroth"
    ],
    "sourceMonsterCodes": [
      "em044_00"
    ],
    "sourceActionCount": 11,
    "patterns": [
      {
        "id": "barroth.worldshell.0.side_tackle",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SIDE_TACKLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barroth.worldshell.1.tail_wind",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_WIND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barroth.worldshell.2.head_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "HEAD_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barroth.worldshell.3.tail_wind_short",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_WIND_SHORT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "barroth.worldshell.4.ride_rage_tail",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "RIDE_RAGE_TAIL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "bazelgeuse": {
    "id": "bazelgeuse",
    "sourceGroups": [
      "Bazelgeuse"
    ],
    "sourceMonsterCodes": [
      "em118_00"
    ],
    "sourceActionCount": 66,
    "patterns": [
      {
        "id": "bazelgeuse.worldshell.0.back_step_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "bazelgeuse.worldshell.1.tail_scale_scatter_l",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_SCALE_SCATTER_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "bazelgeuse.worldshell.2.bomb_glide",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "BOMB_GLIDE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "bazelgeuse.worldshell.3.bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "bazelgeuse.worldshell.4.tail_scale_scatter_r",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_SCALE_SCATTER_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "bazelgeuse.worldshell.5.tail_stomp",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_STOMP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "behemoth": {
    "id": "behemoth",
    "sourceGroups": [
      "Behemoth"
    ],
    "sourceMonsterCodes": [
      "em121_00"
    ],
    "sourceActionCount": 14,
    "patterns": [
      {
        "id": "behemoth.worldshell.0.horn_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "HORN_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "behemoth.worldshell.1.to_standup_punch",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_STANDUP_PUNCH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "beotodus": {
    "id": "beotodus",
    "sourceGroups": [
      "Beotodus"
    ],
    "sourceMonsterCodes": [
      "em122_00"
    ],
    "sourceActionCount": 28,
    "patterns": [
      {
        "id": "beotodus.worldshell.0.drift_rush_attack",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "DRIFT_RUSH_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "beotodus.worldshell.1.slide_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SLIDE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "beotodus.worldshell.2.rolling_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "ROLLING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "beotodus.worldshell.3.drift_rush_start_type2",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "DRIFT_RUSH_START_TYPE2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "beotodus.worldshell.4.event_swim_surprise_counter_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "EVENT_SWIM_SURPRISE_COUNTER_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "black_diablos": {
    "id": "black_diablos",
    "sourceGroups": [
      "BlackDiablos"
    ],
    "sourceMonsterCodes": [
      "em007_00"
    ],
    "sourceActionCount": 21,
    "patterns": [
      {
        "id": "black_diablos.worldshell.0.tail_strike",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_STRIKE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "black_diablos.worldshell.1.appear_attack_from_wall",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "APPEAR_ATTACK_FROM_WALL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "blackveil_vaal_hazak": {
    "id": "blackveil_vaal_hazak",
    "sourceGroups": [
      "BlackveilVaal"
    ],
    "sourceMonsterCodes": [
      "em115_00",
      "em115_05"
    ],
    "sourceActionCount": 20,
    "patterns": [
      {
        "id": "blackveil_vaal_hazak.worldshell.0.syouki_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SYOUKI_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "blackveil_vaal_hazak.worldshell.1.desperate_tackle",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "DESPERATE_TACKLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "blackveil_vaal_hazak.worldshell.2.spore_ball_nova",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "SPORE_BALL_NOVA",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "blackveil_vaal_hazak.worldshell.3.to_syouki_laser",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_SYOUKI_LASER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "blackveil_vaal_hazak.worldshell.4.syouki_drain_laser",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SYOUKI_DRAIN_LASER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "blackveil_vaal_hazak.worldshell.5.to_syouki_drain_laser",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_SYOUKI_DRAIN_LASER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "brachydios": {
    "id": "brachydios",
    "sourceGroups": [
      "Brachydios"
    ],
    "sourceMonsterCodes": [
      "em063_00"
    ],
    "sourceActionCount": 33,
    "patterns": [
      {
        "id": "brachydios.worldshell.0.large_explosion",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "LARGE_EXPLOSION",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brachydios.worldshell.1.predator_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "PREDATOR_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brachydios.worldshell.2.stamp_turn_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brachydios.worldshell.3.stamp_turn_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brachydios.worldshell.4.stamp_turn_long_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_LONG_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brachydios.worldshell.5.stamp_turn_long_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_LONG_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "brute_tigrex": {
    "id": "brute_tigrex",
    "sourceGroups": [
      "BruteTigrex"
    ],
    "sourceMonsterCodes": [
      "em032_01"
    ],
    "sourceActionCount": 38,
    "patterns": [
      {
        "id": "brute_tigrex.worldshell.0.afterrush_rock_launcher",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "AFTERRUSH_ROCK_LAUNCHER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brute_tigrex.worldshell.1.jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brute_tigrex.worldshell.2.afterrush_super_roar_r",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "AFTERRUSH_SUPER_ROAR_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brute_tigrex.worldshell.3.afterrush_super_roar_l",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "AFTERRUSH_SUPER_ROAR_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brute_tigrex.worldshell.4.afterrush_max_roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "AFTERRUSH_MAX_ROAR",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "brute_tigrex.worldshell.5.afterrush_max_roar_back",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "AFTERRUSH_MAX_ROAR_BACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "coral_pukei_pukei": {
    "id": "coral_pukei_pukei",
    "sourceGroups": [
      "CoralPukei"
    ],
    "sourceMonsterCodes": [
      "em102_01"
    ],
    "sourceActionCount": 33,
    "patterns": [
      {
        "id": "coral_pukei_pukei.worldshell.0.to_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "coral_pukei_pukei.worldshell.1.eco_tail_fade_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "ECO_TAIL_FADE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "coral_pukei_pukei.worldshell.2.water_bomb",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "WATER_BOMB",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "coral_pukei_pukei.worldshell.3.stamp",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "coral_pukei_pukei.worldshell.4.to_breath_3way",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_BREATH_3WAY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "coral_pukei_pukei.worldshell.5.tail_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TAIL_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "deviljho": {
    "id": "deviljho",
    "sourceGroups": [
      "Deviljho"
    ],
    "sourceMonsterCodes": [
      "em043_00"
    ],
    "sourceActionCount": 91,
    "patterns": [
      {
        "id": "deviljho.worldshell.0.front_step_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "FRONT_STEP_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "deviljho.worldshell.1.side_tackle_l",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SIDE_TACKLE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "deviljho.worldshell.2.to_large_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_LARGE_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "deviljho.worldshell.3.to_large_bite_short",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_LARGE_BITE_SHORT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "deviljho.worldshell.4.bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "deviljho.worldshell.5.step_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STEP_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "diablos": {
    "id": "diablos",
    "sourceGroups": [
      "Diablos"
    ],
    "sourceMonsterCodes": [
      "em007_00"
    ],
    "sourceActionCount": 21,
    "patterns": [
      {
        "id": "diablos.worldshell.0.tail_strike",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_STRIKE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "diablos.worldshell.1.appear_attack_from_wall",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "APPEAR_ATTACK_FROM_WALL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "dodogama": {
    "id": "dodogama",
    "sourceGroups": [
      "Dodogama"
    ],
    "sourceMonsterCodes": [
      "em116_00"
    ],
    "sourceActionCount": 8,
    "patterns": [
      {
        "id": "dodogama.worldshell.0.breath_short_atk_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_SHORT_ATK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "dodogama.worldshell.1.rush_eat_ore",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_EAT_ORE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "dodogama.worldshell.2.breath_short_atk_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_SHORT_ATK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "dodogama.worldshell.3.breath_long_atk_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_LONG_ATK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "dodogama.worldshell.4.breath_long_atk_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_LONG_ATK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "ebony_odogaron": {
    "id": "ebony_odogaron",
    "sourceGroups": [
      "EbonyOdogaron"
    ],
    "sourceMonsterCodes": [
      "em113_00",
      "em113_01"
    ],
    "sourceActionCount": 10,
    "patterns": [
      {
        "id": "ebony_odogaron.worldshell.0.dragon_breath_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "DRAGON_BREATH_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ebony_odogaron.worldshell.1.dragon_breath_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "DRAGON_BREATH_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "fatalis": {
    "id": "fatalis",
    "sourceGroups": [
      "Fatalis"
    ],
    "sourceMonsterCodes": [
      "em013_00"
    ],
    "sourceActionCount": 98,
    "patterns": [
      {
        "id": "fatalis.worldshell.0.l2_switch_l4_counter_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "L2_SWITCH_L4_COUNTER_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fatalis.worldshell.1.fly_assault_ground_rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "FLY_ASSAULT_GROUND_RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fatalis.worldshell.2.l4_range_reset_dust_explosion_attack",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "L4_RANGE_RESET_DUST_EXPLOSION_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fatalis.worldshell.3.l2_quick_breath_attack_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "L2_QUICK_BREATH_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fatalis.worldshell.4.l2_quick_breath_attack_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "L2_QUICK_BREATH_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fatalis.worldshell.5.l4_quick_breath_attack_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "L4_QUICK_BREATH_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "frostfang_barioth": {
    "id": "frostfang_barioth",
    "sourceGroups": [
      "FrostfangBarioth"
    ],
    "sourceMonsterCodes": [
      "em042_00",
      "em042_05"
    ],
    "sourceActionCount": 20,
    "patterns": [
      {
        "id": "frostfang_barioth.worldshell.0.breath_normal",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_NORMAL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "frostfang_barioth.worldshell.1.tail_attack_clockwise",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_CLOCKWISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "frostfang_barioth.worldshell.2.bite_slammed_latter",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_SLAMMED_LATTER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "frostfang_barioth.worldshell.3.bite_slammed_latter_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_SLAMMED_LATTER_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "frostfang_barioth.worldshell.4.tail_attack_counter_clockwise",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_COUNTER_CLOCKWISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "frostfang_barioth.worldshell.5.breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "fulgur_anjanath": {
    "id": "fulgur_anjanath",
    "sourceGroups": [
      "FulgurAnjanath"
    ],
    "sourceMonsterCodes": [
      "em100_01",
      "em100_00"
    ],
    "sourceActionCount": 52,
    "patterns": [
      {
        "id": "fulgur_anjanath.worldshell.0.asyu_triple_nose_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "ASYU_TRIPLE_NOSE_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fulgur_anjanath.worldshell.1.charged_bite_2ren_combo",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "CHARGED_BITE_2REN_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fulgur_anjanath.worldshell.2.asyu_middle_range_sweep",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "ASYU_MIDDLE_RANGE_SWEEP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fulgur_anjanath.worldshell.3.asyu_elec_max_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "ASYU_ELEC_MAX_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fulgur_anjanath.worldshell.4.jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "fulgur_anjanath.worldshell.5.jump_attack_2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "furious_rajang": {
    "id": "furious_rajang",
    "sourceGroups": [
      "FuriousRajang"
    ],
    "sourceMonsterCodes": [
      "em023_00"
    ],
    "sourceActionCount": 43,
    "patterns": [
      {
        "id": "furious_rajang.worldshell.0.kiai_beam",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "KIAI_BEAM",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "furious_rajang.worldshell.1.triple_punch_b",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TRIPLE_PUNCH_B",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "furious_rajang.worldshell.2.triple_punch_d",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TRIPLE_PUNCH_D",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "furious_rajang.worldshell.3.to_to_jump_rolling_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_TO_JUMP_ROLLING_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "furious_rajang.worldshell.4.to_to_jump_rolling_attack_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_TO_JUMP_ROLLING_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "furious_rajang.worldshell.5.to_dempsey_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_DEMPSEY_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "glavenus": {
    "id": "glavenus",
    "sourceGroups": [
      "Glavenus"
    ],
    "sourceMonsterCodes": [
      "em080_00"
    ],
    "sourceActionCount": 24,
    "patterns": [
      {
        "id": "glavenus.worldshell.0.breath_shot_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_SHOT_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "glavenus.worldshell.1.tail_fire_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_FIRE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "glavenus.worldshell.2.special_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SPECIAL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "glavenus.worldshell.3.breath_shot_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_SHOT_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "glavenus.worldshell.4.three_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "THREE_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "glavenus.worldshell.5.tail_fire_attack_back",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_FIRE_ATTACK_BACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "gold_rathian": {
    "id": "gold_rathian",
    "sourceGroups": [
      "GoldRathian"
    ],
    "sourceMonsterCodes": [
      "em001_02"
    ],
    "sourceActionCount": 58,
    "patterns": [
      {
        "id": "gold_rathian.worldshell.0.high_power_breath_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "HIGH_POWER_BREATH_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "gold_rathian.worldshell.1.glide_charge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "GLIDE_CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "gold_rathian.worldshell.2.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "gold_rathian.worldshell.3.ultimate_breath_ground",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "ULTIMATE_BREATH_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "gold_rathian.worldshell.4.ultimate_breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "ULTIMATE_BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "gold_rathian.worldshell.5.triple_breath_single",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TRIPLE_BREATH_SINGLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "great_girros": {
    "id": "great_girros",
    "sourceGroups": [
      "GreatGirros"
    ],
    "sourceMonsterCodes": [
      "em112_00"
    ],
    "sourceActionCount": 2,
    "patterns": [
      {
        "id": "great_girros.worldshell.0.paralysis_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "PARALYSIS_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "great_jagras": {
    "id": "great_jagras",
    "sourceGroups": [
      "GreatJagras"
    ],
    "sourceMonsterCodes": [
      "em101_00"
    ],
    "sourceActionCount": 19,
    "patterns": [
      {
        "id": "great_jagras.worldshell.0.max_punch",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MAX_PUNCH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "jyuratodus": {
    "id": "jyuratodus",
    "sourceGroups": [
      "Jyuratodus",
      "Jyuuratodus"
    ],
    "sourceMonsterCodes": [
      "em108_00"
    ],
    "sourceActionCount": 16,
    "patterns": [
      {
        "id": "jyuratodus.worldshell.0.swim_breath_double",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_BREATH_DOUBLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "jyuratodus.worldshell.1.swim_rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SWIM_RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "jyuratodus.worldshell.2.swim_tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "SWIM_TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "jyuratodus.worldshell.3.swim_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SWIM_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "jyuratodus.worldshell.4.swim_breath_double_second",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_BREATH_DOUBLE_SECOND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "jyuratodus.worldshell.5.swim_triple_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_TRIPLE_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "kirin": {
    "id": "kirin",
    "sourceGroups": [
      "Kirin"
    ],
    "sourceMonsterCodes": [
      "em011_00"
    ],
    "sourceActionCount": 31,
    "patterns": [
      {
        "id": "kirin.worldshell.0.head_butt_rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "HEAD_BUTT_RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kirin.worldshell.1.ride_rage_crash_tail",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "RIDE_RAGE_CRASH_TAIL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kirin.worldshell.2.super_shock_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SUPER_SHOCK_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kirin.worldshell.3.ride_rage_crash_tail_lv2",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "RIDE_RAGE_CRASH_TAIL_LV2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kirin.worldshell.4.shock_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SHOCK_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kirin.worldshell.5.horn_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "HORN_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "kulu_ya_ku": {
    "id": "kulu_ya_ku",
    "sourceGroups": [
      "KuluYaku"
    ],
    "sourceMonsterCodes": [
      "em107_00"
    ],
    "sourceActionCount": 8,
    "patterns": [
      {
        "id": "kulu_ya_ku.worldshell.0.rock_throw",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "ROCK_THROW",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kulu_ya_ku.worldshell.1.rock_rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "ROCK_RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kulu_ya_ku.worldshell.2.carry_low_jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "CARRY_LOW_JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kulu_ya_ku.worldshell.3.to_carry_jump_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_CARRY_JUMP_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kulu_ya_ku.worldshell.4.to_carry_jump_attack_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_CARRY_JUMP_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kulu_ya_ku.worldshell.5.to_carry_jump_attack_no_break_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_CARRY_JUMP_ATTACK_NO_BREAK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "kushala_daora": {
    "id": "kushala_daora",
    "sourceGroups": [
      "KushalaDaora"
    ],
    "sourceMonsterCodes": [
      "em024_00"
    ],
    "sourceActionCount": 22,
    "patterns": [
      {
        "id": "kushala_daora.worldshell.0.breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kushala_daora.worldshell.1.spin_take_off",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "SPIN_TAKE_OFF",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kushala_daora.worldshell.2.close_breath_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CLOSE_BREATH_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kushala_daora.worldshell.3.charge_breath_shoot_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CHARGE_BREATH_SHOOT_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kushala_daora.worldshell.4.charge_breath_shoot_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CHARGE_BREATH_SHOOT_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "kushala_daora.worldshell.5.breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "lavasioth": {
    "id": "lavasioth",
    "sourceGroups": [
      "Lavasioth"
    ],
    "sourceMonsterCodes": [
      "em036_00"
    ],
    "sourceActionCount": 36,
    "patterns": [
      {
        "id": "lavasioth.worldshell.0.swim_breath_double",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_BREATH_DOUBLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lavasioth.worldshell.1.swim_rush_pre",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SWIM_RUSH_PRE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lavasioth.worldshell.2.bite_half_diving_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_HALF_DIVING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lavasioth.worldshell.3.swim_breath_double_second",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_BREATH_DOUBLE_SECOND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lavasioth.worldshell.4.swim_triple_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SWIM_TRIPLE_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lavasioth.worldshell.5.breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "legiana": {
    "id": "legiana",
    "sourceGroups": [
      "Legiana"
    ],
    "sourceMonsterCodes": [
      "em111_00"
    ],
    "sourceActionCount": 20,
    "patterns": [
      {
        "id": "legiana.worldshell.0.vertical_kick",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "VERTICAL_KICK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "legiana.worldshell.1.vertical_kick_fly",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "VERTICAL_KICK_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "legiana.worldshell.2.chill_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "CHILL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "legiana.worldshell.3.wide_chill_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "WIDE_CHILL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "legiana.worldshell.4.side_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SIDE_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "legiana.worldshell.5.side_attack_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SIDE_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "lunastra": {
    "id": "lunastra",
    "sourceGroups": [
      "Lunastra"
    ],
    "sourceMonsterCodes": [
      "em026_00"
    ],
    "sourceActionCount": 25,
    "patterns": [
      {
        "id": "lunastra.worldshell.0.close_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CLOSE_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lunastra.worldshell.1.charge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lunastra.worldshell.2.tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lunastra.worldshell.3.side_wing_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "SIDE_WING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lunastra.worldshell.4.tail_attack_side",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_SIDE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "lunastra.worldshell.5.powerful_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "POWERFUL_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "namielle": {
    "id": "namielle",
    "sourceGroups": [
      "Namielle"
    ],
    "sourceMonsterCodes": [
      "em125_00"
    ],
    "sourceActionCount": 26,
    "patterns": [
      {
        "id": "namielle.worldshell.0.water_breath_double_one",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "WATER_BREATH_DOUBLE_ONE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "namielle.worldshell.1.spark_charge_fly",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SPARK_CHARGE_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "namielle.worldshell.2.turn_spin_quick_end_l",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TURN_SPIN_QUICK_END_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "namielle.worldshell.3.water_claw_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "WATER_CLAW_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "namielle.worldshell.4.water_breath_double_tow",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "WATER_BREATH_DOUBLE_TOW",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "namielle.worldshell.5.water_laser_s_attack_fast",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "WATER_LASER_S_ATTACK_FAST",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "nargacuga": {
    "id": "nargacuga",
    "sourceGroups": [
      "Nargacuga"
    ],
    "sourceMonsterCodes": [
      "em037_00"
    ],
    "sourceActionCount": 12,
    "patterns": [
      {
        "id": "nargacuga.worldshell.0.tail_strike",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_STRIKE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nargacuga.worldshell.1.predator_attack_thorn",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "PREDATOR_ATTACK_THORN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nargacuga.worldshell.2.d_tail_strike_begin",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "D_TAIL_STRIKE_BEGIN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nargacuga.worldshell.3.counter_tail_attack_l",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "COUNTER_TAIL_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nargacuga.worldshell.4.counter_tail_attack_r",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "COUNTER_TAIL_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "nergigante": {
    "id": "nergigante",
    "sourceGroups": [
      "Nergigante"
    ],
    "sourceMonsterCodes": [
      "em103_05",
      "em103_00"
    ],
    "sourceActionCount": 20,
    "patterns": [
      {
        "id": "nergigante.worldshell.0.rarm_jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "RARM_JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nergigante.worldshell.1.rarm_jump_attack_smode",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "RARM_JUMP_ATTACK_SMODE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nergigante.worldshell.2.flying_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "FLYING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nergigante.worldshell.3.to_flying_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_FLYING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nergigante.worldshell.4.to_head_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_HEAD_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nergigante.worldshell.5.to_head_attack_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_HEAD_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "nightshade_paolumu": {
    "id": "nightshade_paolumu",
    "sourceGroups": [
      "NightshadePaolumu"
    ],
    "sourceMonsterCodes": [
      "em110_01"
    ],
    "sourceActionCount": 45,
    "patterns": [
      {
        "id": "nightshade_paolumu.worldshell.0.air_breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nightshade_paolumu.worldshell.1.mid_dist_kick_ground",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MID_DIST_KICK_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nightshade_paolumu.worldshell.2.air_breath_fly2",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nightshade_paolumu.worldshell.3.air_breath_from_glide",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FROM_GLIDE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nightshade_paolumu.worldshell.4.mid_dist_kick_fly",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MID_DIST_KICK_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "nightshade_paolumu.worldshell.5.eco_sleep_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "ECO_SLEEP_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "paolumu": {
    "id": "paolumu",
    "sourceGroups": [
      "Paolumu"
    ],
    "sourceMonsterCodes": [
      "em110_00"
    ],
    "sourceActionCount": 47,
    "patterns": [
      {
        "id": "paolumu.worldshell.0.air_breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "paolumu.worldshell.1.mid_dist_kick_ground",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MID_DIST_KICK_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "paolumu.worldshell.2.air_breath_fly2",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "paolumu.worldshell.3.air_breath_from_glide",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "AIR_BREATH_FROM_GLIDE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "paolumu.worldshell.4.mid_dist_kick_fly",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MID_DIST_KICK_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "pink_rathian": {
    "id": "pink_rathian",
    "sourceGroups": [
      "PinkRathian"
    ],
    "sourceMonsterCodes": [
      "em001_01"
    ],
    "sourceActionCount": 64,
    "patterns": [
      {
        "id": "pink_rathian.worldshell.0.high_power_breath_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "HIGH_POWER_BREATH_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pink_rathian.worldshell.1.glide_charge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "GLIDE_CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pink_rathian.worldshell.2.somersault_kick_fly_to_landing",
        "name": "공중 급습",
        "type": "aerial",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "sourceActionClass": "SOMERSAULT_KICK_FLY_TO_LANDING",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pink_rathian.worldshell.3.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pink_rathian.worldshell.4.normal_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pink_rathian.worldshell.5.normal_breath_to_enemy",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_TO_ENEMY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "pukei_pukei": {
    "id": "pukei_pukei",
    "sourceGroups": [
      "PukeiPukei"
    ],
    "sourceMonsterCodes": [
      "em102_00"
    ],
    "sourceActionCount": 16,
    "patterns": [
      {
        "id": "pukei_pukei.worldshell.0.to_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pukei_pukei.worldshell.1.stamp",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pukei_pukei.worldshell.2.to_breath_3way",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TO_BREATH_3WAY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pukei_pukei.worldshell.3.tail_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "TAIL_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pukei_pukei.worldshell.4.back_step_breath_to_ground",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH_TO_GROUND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "pukei_pukei.worldshell.5.to_jump_kick_2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_JUMP_KICK_2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "radobaan": {
    "id": "radobaan",
    "sourceGroups": [
      "Radobaan"
    ],
    "sourceMonsterCodes": [
      "em114_00"
    ],
    "sourceActionCount": 31,
    "patterns": [
      {
        "id": "radobaan.worldshell.0.side_tackle_to_rolling_attack_l",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SIDE_TACKLE_TO_ROLLING_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "radobaan.worldshell.1.tail_rotation_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ROTATION_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "radobaan.worldshell.2.double_upper_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_UPPER_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "radobaan.worldshell.3.jump_attack_high",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_HIGH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "radobaan.worldshell.4.jump_attack_wall_down",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_WALL_DOWN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "radobaan.worldshell.5.ago_stamp_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "AGO_STAMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "raging_brachydios": {
    "id": "raging_brachydios",
    "sourceGroups": [
      "RagingBrachydios_forceFinalMode",
      "RagingBrachydios_skipFinalMode"
    ],
    "sourceMonsterCodes": [
      "em063_05"
    ],
    "sourceActionCount": 60,
    "patterns": [
      {
        "id": "raging_brachydios.worldshell.0.tail_stomp",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_STOMP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "raging_brachydios.worldshell.1.large_explosion",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "LARGE_EXPLOSION",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "raging_brachydios.worldshell.2.stamp_turn_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "raging_brachydios.worldshell.3.stamp_turn_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "raging_brachydios.worldshell.4.stamp_turn_long_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_LONG_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "raging_brachydios.worldshell.5.stamp_turn_long_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_TURN_LONG_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "rajang": {
    "id": "rajang",
    "sourceGroups": [
      "Rajang"
    ],
    "sourceMonsterCodes": [
      "em023_00"
    ],
    "sourceActionCount": 43,
    "patterns": [
      {
        "id": "rajang.worldshell.0.kiai_beam",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "KIAI_BEAM",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rajang.worldshell.1.triple_punch_b",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TRIPLE_PUNCH_B",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rajang.worldshell.2.triple_punch_d",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TRIPLE_PUNCH_D",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rajang.worldshell.3.to_to_jump_rolling_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_TO_JUMP_ROLLING_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rajang.worldshell.4.to_to_jump_rolling_attack_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_TO_JUMP_ROLLING_ATTACK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rajang.worldshell.5.to_dempsey_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_DEMPSEY_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "rathalos": {
    "id": "rathalos",
    "sourceGroups": [
      "Rathalos"
    ],
    "sourceMonsterCodes": [
      "em002_00"
    ],
    "sourceActionCount": 58,
    "patterns": [
      {
        "id": "rathalos.worldshell.0.breath_fly_triple",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY_TRIPLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathalos.worldshell.1.glide_charge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "GLIDE_CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathalos.worldshell.2.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathalos.worldshell.3.normal_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathalos.worldshell.4.normal_breath_to_enemy",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_TO_ENEMY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathalos.worldshell.5.back_step_breath_to_air",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH_TO_AIR",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "rathian": {
    "id": "rathian",
    "sourceGroups": [
      "Rathian"
    ],
    "sourceMonsterCodes": [
      "em001_00"
    ],
    "sourceActionCount": 61,
    "patterns": [
      {
        "id": "rathian.worldshell.0.normal_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathian.worldshell.1.glide_charge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "GLIDE_CHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathian.worldshell.2.somersault_kick_fly_to_landing",
        "name": "공중 급습",
        "type": "aerial",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "sourceActionClass": "SOMERSAULT_KICK_FLY_TO_LANDING",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathian.worldshell.3.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathian.worldshell.4.normal_breath_to_enemy",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_TO_ENEMY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "rathian.worldshell.5.back_step_breath_to_air",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH_TO_AIR",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "ruiner_nergigante": {
    "id": "ruiner_nergigante",
    "sourceGroups": [
      "RuinerNergigante"
    ],
    "sourceMonsterCodes": [
      "em103_05",
      "em103_00"
    ],
    "sourceActionCount": 41,
    "patterns": [
      {
        "id": "ruiner_nergigante.worldshell.0.strong_double_punch",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_DOUBLE_PUNCH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ruiner_nergigante.worldshell.1.rarm_jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "RARM_JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ruiner_nergigante.worldshell.2.rarm_jump_attack_smode",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "RARM_JUMP_ATTACK_SMODE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ruiner_nergigante.worldshell.3.flying_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "FLYING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ruiner_nergigante.worldshell.4.to_flying_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_FLYING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "ruiner_nergigante.worldshell.5.to_head_attack_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_HEAD_ATTACK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "safi_jiiva": {
    "id": "safi_jiiva",
    "sourceGroups": [
      "Safijiiva"
    ],
    "sourceMonsterCodes": [
      "em104_00"
    ],
    "sourceActionCount": 64,
    "patterns": [
      {
        "id": "safi_jiiva.worldshell.0.catch_attack_throw",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CATCH_ATTACK_THROW",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "safi_jiiva.worldshell.1.short_rush_drift",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SHORT_RUSH_DRIFT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "safi_jiiva.worldshell.2.tail_tap",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_TAP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "safi_jiiva.worldshell.3.bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "safi_jiiva.worldshell.4.back_kick_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BACK_KICK_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "safi_jiiva.worldshell.5.back_kick_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BACK_KICK_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "savage_deviljho": {
    "id": "savage_deviljho",
    "sourceGroups": [
      "SavageDeviljho"
    ],
    "sourceMonsterCodes": [
      "em043_00",
      "em043_05"
    ],
    "sourceActionCount": 118,
    "patterns": [
      {
        "id": "savage_deviljho.worldshell.0.super_dragon_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SUPER_DRAGON_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "savage_deviljho.worldshell.1.side_tackle_l",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SIDE_TACKLE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "savage_deviljho.worldshell.2.to_large_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_LARGE_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "savage_deviljho.worldshell.3.to_large_bite_short",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_LARGE_BITE_SHORT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "savage_deviljho.worldshell.4.to_large_bite_near",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_LARGE_BITE_NEAR",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "savage_deviljho.worldshell.5.combo_to_large_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "COMBO_TO_LARGE_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "scarred_yian_garuga": {
    "id": "scarred_yian_garuga",
    "sourceGroups": [
      "ScarredYianGaruga"
    ],
    "sourceMonsterCodes": [
      "em018_00"
    ],
    "sourceActionCount": 27,
    "patterns": [
      {
        "id": "scarred_yian_garuga.worldshell.0.combo_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "COMBO_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "scarred_yian_garuga.worldshell.1.to_special_attack_rise",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_SPECIAL_ATTACK_RISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "scarred_yian_garuga.worldshell.2.high_power_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "HIGH_POWER_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "scarred_yian_garuga.worldshell.3.normal_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "scarred_yian_garuga.worldshell.4.three_way_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "THREE_WAY_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "scarred_yian_garuga.worldshell.5.breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "seething_bazelgeuse": {
    "id": "seething_bazelgeuse",
    "sourceGroups": [
      "SeethingBazelgeuse"
    ],
    "sourceMonsterCodes": [
      "em118_05"
    ],
    "sourceActionCount": 91,
    "patterns": [
      {
        "id": "seething_bazelgeuse.worldshell.0.back_step_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_STEP_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "seething_bazelgeuse.worldshell.1.blast_tackle_combo_turn_l",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "BLAST_TACKLE_COMBO_TURN_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "seething_bazelgeuse.worldshell.2.tail_attack_double",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_DOUBLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "seething_bazelgeuse.worldshell.3.bomb_glide",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "BOMB_GLIDE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "seething_bazelgeuse.worldshell.4.bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "seething_bazelgeuse.worldshell.5.tail_attack_triple_start_red_release",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK_TRIPLE_START_RED_RELEASE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "shara_ishvalda": {
    "id": "shara_ishvalda",
    "sourceGroups": [
      "SharaIshvalda_forceTransG",
      "SharaIshvalda_skipTransG"
    ],
    "sourceMonsterCodes": [
      "em126_00"
    ],
    "sourceActionCount": 54,
    "patterns": [
      {
        "id": "shara_ishvalda.worldshell.0.mini_scratch_laser_main_p",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "MINI_SCRATCH_LASER_MAIN_P",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shara_ishvalda.worldshell.1.arm_press_and_bomb_continue1_p",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "ARM_PRESS_AND_BOMB_CONTINUE1_P",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shara_ishvalda.worldshell.2.stamp_combo_g",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_COMBO_G",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shara_ishvalda.worldshell.3.stamp_combo2_g",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_COMBO2_G",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shara_ishvalda.worldshell.4.stamp_combo3_g",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_COMBO3_G",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shara_ishvalda.worldshell.5.stamp_combo_continue_left_hand",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STAMP_COMBO_CONTINUE_LEFT_HAND",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "shrieking_legiana": {
    "id": "shrieking_legiana",
    "sourceGroups": [
      "ShriekingLegiana"
    ],
    "sourceMonsterCodes": [
      "em111_05"
    ],
    "sourceActionCount": 32,
    "patterns": [
      {
        "id": "shrieking_legiana.worldshell.0.hover_rush_f2f",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "HOVER_RUSH_F2F",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shrieking_legiana.worldshell.1.vertical_kick",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "VERTICAL_KICK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shrieking_legiana.worldshell.2.vertical_kick_fly",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "VERTICAL_KICK_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shrieking_legiana.worldshell.3.chill_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "CHILL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shrieking_legiana.worldshell.4.wide_chill_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "WIDE_CHILL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "shrieking_legiana.worldshell.5.hover_rush_g2f",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "HOVER_RUSH_G2F",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "silver_rathalos": {
    "id": "silver_rathalos",
    "sourceGroups": [
      "SilverRathalos"
    ],
    "sourceMonsterCodes": [
      "em002_01",
      "em002_02"
    ],
    "sourceActionCount": 82,
    "patterns": [
      {
        "id": "silver_rathalos.worldshell.0.breath_fly_triple",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY_TRIPLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "silver_rathalos.worldshell.1.rush_bite_fly_combo",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH_BITE_FLY_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "silver_rathalos.worldshell.2.double_kick_fly2",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "silver_rathalos.worldshell.3.back_hover_breath_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BACK_HOVER_BREATH_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "silver_rathalos.worldshell.4.breath_fly_combo",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "silver_rathalos.worldshell.5.double_kick_fly2_combo",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "DOUBLE_KICK_FLY2_COMBO",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "stygian_zinogre": {
    "id": "stygian_zinogre",
    "sourceGroups": [
      "StygianZinogre"
    ],
    "sourceMonsterCodes": [
      "em057_01"
    ],
    "sourceActionCount": 74,
    "patterns": [
      {
        "id": "stygian_zinogre.worldshell.0.lightning_charge_max",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "LIGHTNING_CHARGE_MAX",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "stygian_zinogre.worldshell.1.dragon_somersault",
        "name": "공중 급습",
        "type": "aerial",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "aerial"
        ],
        "sourceActionClass": "DRAGON_SOMERSAULT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "stygian_zinogre.worldshell.2.dragon_tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "DRAGON_TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "stygian_zinogre.worldshell.3.multi_combo_attack_main",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MULTI_COMBO_ATTACK_MAIN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "stygian_zinogre.worldshell.4.lightning_charge_max_fake",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "LIGHTNING_CHARGE_MAX_FAKE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "stygian_zinogre.worldshell.5.strong_punch_combo_continue_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_PUNCH_COMBO_CONTINUE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "teostra": {
    "id": "teostra",
    "sourceGroups": [
      "Teostra"
    ],
    "sourceMonsterCodes": [
      "em027_00"
    ],
    "sourceActionCount": 35,
    "patterns": [
      {
        "id": "teostra.worldshell.0.close_breath_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "CLOSE_BREATH_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "teostra.worldshell.1.rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "teostra.worldshell.2.tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "teostra.worldshell.3.super_nova",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "SUPER_NOVA",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "teostra.worldshell.4.bite_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "teostra.worldshell.5.small_nova",
        "name": "광역 공격",
        "type": "area",
        "damageRatio": 0.38,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "area"
        ],
        "sourceActionClass": "SMALL_NOVA",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "tigrex": {
    "id": "tigrex",
    "sourceGroups": [
      "Tigrex"
    ],
    "sourceMonsterCodes": [
      "em032_00"
    ],
    "sourceActionCount": 21,
    "patterns": [
      {
        "id": "tigrex.worldshell.0.afterrush_rock_launcher",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "AFTERRUSH_ROCK_LAUNCHER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tigrex.worldshell.1.jump_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tigrex.worldshell.2.jump_attack_wall",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_WALL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tigrex.worldshell.3.afterrush_jump_attack",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "AFTERRUSH_JUMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tigrex.worldshell.4.afterrush_jump_attack_wall",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "AFTERRUSH_JUMP_ATTACK_WALL",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tigrex.worldshell.5.roar",
        "name": "포효",
        "type": "roar",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "roar"
        ],
        "sourceActionClass": "ROAR",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "tobi_kadachi": {
    "id": "tobi_kadachi",
    "sourceGroups": [
      "TobiKadachi"
    ],
    "sourceMonsterCodes": [
      "em109_00"
    ],
    "sourceActionCount": 7,
    "patterns": [
      {
        "id": "tobi_kadachi.worldshell.0.super_discharge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SUPER_DISCHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tobi_kadachi.worldshell.1.super_shock_side_tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "SUPER_SHOCK_SIDE_TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "tobi_kadachi.worldshell.2.shock_side_tail_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "SHOCK_SIDE_TAIL_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "uragaan": {
    "id": "uragaan",
    "sourceGroups": [
      "Uragaan"
    ],
    "sourceMonsterCodes": [
      "em045_00"
    ],
    "sourceActionCount": 45,
    "patterns": [
      {
        "id": "uragaan.worldshell.0.side_tackle_l",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "SIDE_TACKLE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "uragaan.worldshell.1.tail_rotation_attack",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_ROTATION_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "uragaan.worldshell.2.jump_attack_high",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_HIGH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "uragaan.worldshell.3.jump_attack_wall_down",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "JUMP_ATTACK_WALL_DOWN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "uragaan.worldshell.4.turn_ago_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TURN_AGO_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "uragaan.worldshell.5.ago_stamp_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "AGO_STAMP_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "vaal_hazak": {
    "id": "vaal_hazak",
    "sourceGroups": [
      "VaalHazak"
    ],
    "sourceMonsterCodes": [
      "em115_00"
    ],
    "sourceActionCount": 25,
    "patterns": [
      {
        "id": "vaal_hazak.worldshell.0.syouki_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SYOUKI_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "vaal_hazak.worldshell.1.rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "vaal_hazak.worldshell.2.tail_to_scratch",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "TAIL_TO_SCRATCH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "vaal_hazak.worldshell.3.bite_3ren",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_3REN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "vaal_hazak.worldshell.4.bite_middle",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "BITE_MIDDLE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "vaal_hazak.worldshell.5.strong_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "velkhana": {
    "id": "velkhana",
    "sourceGroups": [
      "Velkhana"
    ],
    "sourceMonsterCodes": [
      "em124_00"
    ],
    "sourceActionCount": 119,
    "patterns": [
      {
        "id": "velkhana.worldshell.0.combo_straight_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "COMBO_STRAIGHT_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "velkhana.worldshell.1.rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "velkhana.worldshell.2.combo_tail_sting",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "COMBO_TAIL_STING",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "velkhana.worldshell.3.adjust_bite",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "ADJUST_BITE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "velkhana.worldshell.4.combo_tail_sting_r",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "COMBO_TAIL_STING_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "velkhana.worldshell.5.combo_fly_tail_sting",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "COMBO_FLY_TAIL_STING",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "viper_tobi_kadachi": {
    "id": "viper_tobi_kadachi",
    "sourceGroups": [
      "ViperTobi"
    ],
    "sourceMonsterCodes": [
      "em109_01"
    ],
    "sourceActionCount": 8,
    "patterns": [
      {
        "id": "viper_tobi_kadachi.worldshell.0.poison_discharge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "POISON_DISCHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "viper_tobi_kadachi.worldshell.1.broken_poison_discharge",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "BROKEN_POISON_DISCHARGE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "xeno_jiiva": {
    "id": "xeno_jiiva",
    "sourceGroups": [
      "Xenojiiva"
    ],
    "sourceMonsterCodes": [
      "em105_00"
    ],
    "sourceActionCount": 32,
    "patterns": [
      {
        "id": "xeno_jiiva.worldshell.0.super_laser",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SUPER_LASER",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "xeno_jiiva.worldshell.1.rush",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "RUSH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "xeno_jiiva.worldshell.2.aura_tail_slap",
        "name": "휩쓸기",
        "type": "sweep",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 2,
        "maxTargets": 4,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "sweep"
        ],
        "sourceActionClass": "AURA_TAIL_SLAP",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "xeno_jiiva.worldshell.3.wing_attack",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "WING_ATTACK",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "xeno_jiiva.worldshell.4.breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "xeno_jiiva.worldshell.5.breath_3way",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_3WAY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "yian_garuga": {
    "id": "yian_garuga",
    "sourceGroups": [
      "YianGaruga"
    ],
    "sourceMonsterCodes": [
      "em018_00"
    ],
    "sourceActionCount": 26,
    "patterns": [
      {
        "id": "yian_garuga.worldshell.0.combo_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "COMBO_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "yian_garuga.worldshell.1.to_special_attack_rise",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "TO_SPECIAL_ATTACK_RISE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "yian_garuga.worldshell.2.high_power_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "HIGH_POWER_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "yian_garuga.worldshell.3.normal_breath_shot",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "NORMAL_BREATH_SHOT",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "yian_garuga.worldshell.4.three_way_breath",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "THREE_WAY_BREATH",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "yian_garuga.worldshell.5.breath_fly",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "BREATH_FLY",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "zinogre": {
    "id": "zinogre",
    "sourceGroups": [
      "Zinogre"
    ],
    "sourceMonsterCodes": [
      "em057_00"
    ],
    "sourceActionCount": 26,
    "patterns": [
      {
        "id": "zinogre.worldshell.0.lightning_charge_max",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "LIGHTNING_CHARGE_MAX",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zinogre.worldshell.1.multi_combo_attack_main",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "MULTI_COMBO_ATTACK_MAIN",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zinogre.worldshell.2.lightning_charge_max_fake",
        "name": "돌진",
        "type": "charge",
        "damageRatio": 0.36,
        "windupTicks": 7,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "charge"
        ],
        "sourceActionClass": "LIGHTNING_CHARGE_MAX_FAKE",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zinogre.worldshell.3.strong_punch_combo_continue_l",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_PUNCH_COMBO_CONTINUE_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zinogre.worldshell.4.strong_punch_combo_continue_r",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_PUNCH_COMBO_CONTINUE_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zinogre.worldshell.5.strong_punch_combo_continue_l_lightning",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "STRONG_PUNCH_COMBO_CONTINUE_L_LIGHTNING",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  },
  "zorah_magdaros": {
    "id": "zorah_magdaros",
    "sourceGroups": [
      "ZorahMagdaros/Magmacore"
    ],
    "sourceMonsterCodes": [
      "em106_00"
    ],
    "sourceActionCount": 24,
    "patterns": [
      {
        "id": "zorah_magdaros.worldshell.0.super_lava_breath_2leg",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SUPER_LAVA_BREATH_2LEG",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zorah_magdaros.worldshell.1.arm_slam_2leg",
        "name": "근접 공격",
        "type": "physical",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 2,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 2,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "close"
        ],
        "sourceActionClass": "ARM_SLAM_2LEG",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zorah_magdaros.worldshell.2.super_lava_breath_free_2leg",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "SUPER_LAVA_BREATH_FREE_2LEG",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zorah_magdaros.worldshell.3.lava_breath_2leg",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "LAVA_BREATH_2LEG",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zorah_magdaros.worldshell.4.lava_back_breath_nav_const_2leg_l",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "LAVA_BACK_BREATH_NAV_CONST_2LEG_L",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      },
      {
        "id": "zorah_magdaros.worldshell.5.lava_back_breath_nav_const_2leg_r",
        "name": "원거리 공격",
        "type": "projectile",
        "damageRatio": 0.29,
        "windupTicks": 5,
        "activeTicks": 3,
        "recoveryTicks": 9,
        "minTargets": 1,
        "maxTargets": 3,
        "cooldownTicks": 32,
        "weight": 1,
        "tags": [
          "projectile",
          "projectile"
        ],
        "sourceActionClass": "LAVA_BACK_BREATH_NAV_CONST_2LEG_R",
        "sourceGame": "world-iceborne",
        "evidence": "mhw-action-shell-mapping",
        "confidence": "extracted-action-shell"
      }
    ],
    "evidence": "mhw-action-shell-mapping"
  }
};

'use strict';
// GENERATED FILE — do not edit by hand.
// Source: data/hunt/monster-pattern-motion-overrides.json
const HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = {
  "barioth": {
    "barioth.shoulder_check": {
      "beats": {
        "spring-load": {
          "ticks": 2,
          "scaleX": 1.1,
          "scaleY": 0.8
        },
        "flank-hop": {
          "ticks": 5,
          "to": "flank:target 210",
          "moveEasing": "snap",
          "scaleX": 0.9,
          "scaleY": 1.14
        },
        "shoulder-set": {
          "ticks": 4,
          "origin": "part:torso",
          "rotationEasing": "accelerate",
          "rotationToward": 12,
          "scaleX": 0.96,
          "scaleY": 1.06
        },
        "lateral-slam": {
          "ticks": 7,
          "to": "target",
          "origin": "part:torso",
          "moveEasing": "snap",
          "rotationEasing": "slow-fast-slow",
          "rotationToward": 30
        },
        "shoulder-impact": {
          "ticks": 8,
          "origin": "part:torso"
        },
        "slow-return": {
          "ticks": 10,
          "to": "home",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1
        }
      }
    },
    "barioth.bite": {
      "beats": {
        "bite-load": {
          "ticks": 4,
          "origin": "part:head",
          "scaleX": 1.06,
          "scaleY": 0.88
        },
        "leaping-bite": {
          "ticks": 4,
          "to": "toward:target 112%",
          "origin": "part:head",
          "moveEasing": "snap",
          "rotationEasing": "accelerate",
          "rotationToward": 16,
          "scaleX": 1.16,
          "scaleY": 0.88
        },
        "bite-impact": {
          "ticks": 4,
          "origin": "part:head",
          "rotationToward": 16,
          "scaleX": 1.1,
          "scaleY": 0.78
        },
        "bite-recoil": {
          "ticks": 3,
          "to": "toward:target 96%",
          "origin": "part:head",
          "moveEasing": "snap",
          "rotationToward": 7,
          "scaleX": 0.98,
          "scaleY": 1.04
        },
        "bite-return": {
          "ticks": 3,
          "to": "home",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1
        }
      }
    },
    "barioth.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    }
  },
  "nargacuga": {
    "nargacuga.quick_bite": {
      "beats": {
        "windup": {
          "ticks": 4,
          "at": "home",
          "pose": "crouch",
          "alignRotationToTravel": true
        },
        "approach": {
          "ticks": 3,
          "to": "target",
          "pose": "stretch-soft",
          "align": "part:head",
          "alignRotationToTravel": true
        },
        "bite": {
          "ticks": 3,
          "to": "target",
          "pose": "land",
          "align": "part:head",
          "sfx": "impact",
          "hit": false,
          "judgments": [
            {
              "id": "bite-damage",
              "group": "bite-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 28.599999999999998
            }
          ]
        },
        "return": {
          "ticks": 6,
          "to": "home",
          "pose": "idle"
        }
      }
    },
    "nargacuga.spiked_tail_slam": {
      "beats": {
        "windup": {
          "ticks": 6,
          "pose": "crouch",
          "scaleY": 1,
          "alignRotationToTravel": false
        },
        "rise": {
          "ticks": 3,
          "to": "above:target 300",
          "pose": "stretch"
        },
        "aim": {
          "ticks": 10,
          "to": "above:target 260",
          "pose": "stretch-soft",
          "scaleX": 1,
          "scaleY": 1
        },
        "slam": {
          "ticks": 3,
          "to": "target",
          "pose": "tail-slam",
          "align": "part:tail",
          "bounds": "reach",
          "sfx": "impact",
          "scaleX": 1,
          "scaleY": 1.3,
          "hit": false,
          "judgments": [
            {
              "id": "slam-damage",
              "group": "slam-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 51.7
            }
          ]
        },
        "brace": {
          "ticks": 26,
          "pose": "brace"
        },
        "return": {
          "ticks": 4,
          "to": "home",
          "pose": "idle"
        }
      }
    },
    "nargacuga.tail_whip": {
      "beats": {
        "telegraph": {
          "ticks": 5,
          "pose": "crouch",
          "face": "target",
          "label": "전조"
        },
        "action-1": {
          "ticks": 5,
          "to": "above:target 180",
          "moveEasing": "slow-fast-slow",
          "pose": "tail-whip",
          "align": "part:tail",
          "bounds": "reach",
          "label": "접근·휘두르기"
        },
        "impact-1": {
          "ticks": 3,
          "to": "above:target 180",
          "pose": "settle",
          "align": "part:tail",
          "bounds": "reach",
          "sfx": "impact",
          "label": "꼬리 접촉",
          "hit": false,
          "judgments": [
            {
              "id": "impact-1-damage",
              "group": "impact-1-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 33
            }
          ]
        },
        "action-2": {
          "ticks": 12,
          "to": "home",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "pose": "idle",
          "label": "회수·복귀"
        }
      }
    },
    "nargacuga.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "nargacuga.tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 13
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 7
        }
      }
    },
    "nargacuga.cutwing_barrage": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 18
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 9
        }
      }
    },
    "nargacuga.lunge_chain": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 18
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 23
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 7
        }
      }
    },
    "nargacuga.quill_shot": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 10
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 7
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 2
        }
      }
    },
    "nargacuga.reposition_hop": {
      "beats": {
        "telegraph": {
          "ticks": 4
        },
        "action-1": {
          "ticks": 20
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 5
        }
      }
    },
    "nargacuga.leaping_cutwing_triple": {
      "beats": {
        "telegraph": {
          "ticks": 9
        },
        "action-1": {
          "ticks": 13
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 15
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 15
        },
        "impact-3": {
          "ticks": 1
        },
        "action-4": {
          "ticks": 11
        }
      }
    },
    "nargacuga.tail_sweep_reverse": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 13
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 19
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 5
        }
      }
    },
    "nargacuga.furious_tail_slam": {
      "beats": {
        "telegraph": {
          "ticks": 11
        },
        "action-1": {
          "ticks": 15
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 17
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 35
        }
      }
    },
    "nargacuga.lunge_chain_triple": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 16
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 17
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 21
        },
        "impact-3": {
          "ticks": 1
        },
        "action-4": {
          "ticks": 9
        }
      }
    },
    "nargacuga.leaping_cutwing": {
      "beats": {
        "windup": {
          "ticks": 5,
          "pose": "crouch",
          "sfx": "start",
          "label": "도약 압축"
        },
        "leap-out": {
          "ticks": 4,
          "to": "offscreen:left",
          "moveEasing": "accelerate",
          "pose": "stretch",
          "fade": "out",
          "label": "화면 밖 도약",
          "offsetY": -280,
          "alignRotationToTravel": true
        },
        "vanish": {
          "ticks": 3,
          "to": "offscreen:bottom",
          "pose": "stretch",
          "label": "사각 이동",
          "opacity": 0
        },
        "reappear": {
          "ticks": 2,
          "at": "polar:target 315deg 700",
          "pose": "crouch",
          "face": "target",
          "bounds": "reach",
          "label": "측후방 출현",
          "aimBodyAt": "target",
          "opacity": 1,
          "instantOpacity": true
        },
        "ambush-aim": {
          "ticks": 3,
          "pose": "crouch",
          "face": "target",
          "label": "측후방 조준",
          "aimBodyAt": "target",
          "opacity": 1
        },
        "dive": {
          "ticks": 4,
          "to": "target",
          "moveEasing": "accelerate",
          "pose": "stretch-strong",
          "face": "target",
          "align": "part:left-wing",
          "bounds": "reach",
          "label": "칼날깃 급습",
          "alignRotationToTravel": true
        },
        "impact": {
          "ticks": 2,
          "to": "target",
          "pose": "land",
          "align": "part:left-wing",
          "bounds": "reach",
          "sfx": "impact",
          "label": "칼날깃 충돌",
          "hit": false,
          "judgments": [
            {
              "id": "impact-damage",
              "group": "impact-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 46.2
            }
          ]
        },
        "pass-through": {
          "ticks": 4,
          "to": "offscreen:right",
          "moveEasing": "accelerate",
          "pose": "stretch",
          "fade": "out",
          "label": "관통 이탈",
          "offsetY": 620,
          "alignRotationToTravel": true
        },
        "return": {
          "ticks": 4,
          "at": "offscreen:top",
          "to": "home",
          "moveEasing": "decelerate",
          "pose": "idle",
          "fade": "in",
          "label": "상단 복귀"
        }
      }
    }
  },
  "bazelgeuse": {
    "bazelgeuse.roar": {
      "beats": {
        "action-1": {
          "ticks": 27
        }
      }
    },
    "bazelgeuse.bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 30
        },
        "impact-1": {
          "ticks": 30
        }
      }
    },
    "bazelgeuse.charge": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 50
        },
        "action-2": {
          "ticks": 50
        },
        "impact-1": {
          "ticks": 50
        },
        "action-3": {
          "ticks": 1
        }
      }
    },
    "bazelgeuse.side_tackle": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 40
        },
        "impact-1": {
          "ticks": 40
        }
      }
    },
    "bazelgeuse.tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 40
        },
        "impact-1": {
          "ticks": 40
        }
      }
    },
    "bazelgeuse.body_press": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 30
        },
        "impact-1": {
          "ticks": 30
        }
      }
    },
    "bazelgeuse.breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 5
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 17
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 3
        }
      }
    },
    "bazelgeuse.carpet_bombing": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 7
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 78
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 28
        }
      }
    }
  },
  "deviljho": {
    "deviljho.worldshell.0.front_step_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "deviljho.worldshell.1.side_tackle_l": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 9
        }
      }
    },
    "deviljho.worldshell.2.to_large_bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "deviljho.worldshell.3.to_large_bite_short": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "deviljho.worldshell.4.bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "deviljho.worldshell.5.step_bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "diablos": {
    "diablos.roar": {
      "beats": {
        "brace": {
          "ticks": 10,
          "pose": "crouch",
          "label": "몸 낮추기",
          "hit": false
        },
        "roar": {
          "ticks": 2,
          "pose": "stretch-strong",
          "sfx": "roar",
          "label": "포효",
          "hit": false,
          "judgments": [
            {
              "id": "roar-control",
              "group": "roar-control",
              "kind": "roar",
              "target": "all",
              "offsetTicks": 1,
              "size": "large"
            }
          ]
        },
        "settle": {
          "ticks": 33,
          "pose": "idle",
          "label": "자세 회복",
          "hit": false
        }
      }
    },
    "diablos.horn_charge": {
      "beats": {
        "stomp": {
          "ticks": 12,
          "pose": "crouch",
          "label": "발구르기",
          "stompSteps": 3
        },
        "charge": {
          "ticks": 8,
          "to": "target",
          "moveEasing": "linear",
          "pose": "idle",
          "face": "target",
          "bounds": "reach",
          "label": "돌진",
          "strideFlipTicks": 3,
          "hit": false,
          "instantPose": true,
          "judgments": [
            {
              "id": "charge-impact",
              "group": "charge-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 5,
              "damagePercent": 50,
              "hitReactionKind": "strong"
            }
          ]
        },
        "impact": {
          "ticks": 7,
          "to": "offscreen:bottom",
          "moveEasing": "linear",
          "pose": "land",
          "fade": "out",
          "sfx": "impact",
          "label": "피격",
          "hit": false,
          "continueTravel": true,
          "judgments": []
        },
        "return": {
          "ticks": 14,
          "at": "offscreen:top",
          "to": "home",
          "moveEasing": "decelerate",
          "pose": "idle",
          "fade": "in",
          "label": "Fade-in 복귀"
        }
      }
    },
    "diablos.burrow_enter": {
      "beats": {
        "dig": {
          "ticks": 3,
          "pose": "crouch",
          "label": "땅 파기",
          "fx": "burrow-dust",
          "scaleY": 0.82,
          "fxDurationTicks": 11,
          "hit": false
        },
        "sink": {
          "ticks": 15,
          "moveEasing": "accelerate",
          "label": "잠복",
          "offsetY": 105,
          "scaleY": 0.42,
          "opacity": 0.35
        },
        "still": {
          "ticks": 10,
          "pose": "crouch",
          "label": "정적",
          "opacity": 0
        },
        "track": {
          "ticks": 10,
          "at": "below:target 150",
          "pose": "crouch",
          "label": "지중 추적",
          "fx": "burrow-tracking-dust",
          "fxAnchor": "target",
          "opacity": 0,
          "fxDurationTicks": 14
        },
        "eruption": {
          "ticks": 5,
          "to": "above:target 20",
          "moveEasing": "snap",
          "pose": "stretch-strong",
          "bounds": "reach",
          "sfx": "impact",
          "label": "머리 쳐올리기",
          "fx": "burrow-emerge-dust",
          "fxAnchor": "target",
          "rotationToward": 10,
          "scaleX": 0.88,
          "scaleY": 1.18,
          "opacity": 1,
          "fxDurationTicks": 6,
          "hit": false,
          "instantOpacity": true,
          "judgments": [
            {
              "id": "burrow-hit",
              "group": "burrow-eruption",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 2,
              "damagePercent": 60,
              "hitReactionKind": "strong"
            },
            {
              "id": "burrow-tremor",
              "group": "burrow-eruption",
              "kind": "tremor",
              "target": "primary-adjacent",
              "offsetTicks": 2,
              "size": "large",
              "directHitSupersedes": false
            }
          ]
        },
        "land": {
          "ticks": 5,
          "to": "below:target 28",
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "솟구침 반동",
          "rotation": 0,
          "scaleX": 1.03,
          "scaleY": 0.96
        },
        "return": {
          "ticks": 20,
          "to": "home",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "천천히 복귀",
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1
        }
      }
    },
    "diablos.horn_uppercut": {
      "beats": {
        "telegraph": {
          "ticks": 6,
          "to": "toward:target 82%",
          "moveEasing": "linear",
          "pose": "stretch-soft",
          "face": "target",
          "label": "헌터 앞 접근"
        },
        "start": {
          "ticks": 7,
          "origin": "50% 52%",
          "pose": "crouch",
          "label": "뿔 낮추기",
          "rotationToward": 10
        },
        "impact": {
          "ticks": 4,
          "to": "toward:target 98%",
          "origin": "50% 52%",
          "moveEasing": "snap",
          "pose": "idle",
          "sfx": "impact",
          "label": "뿔 쳐올리기",
          "fx": "part-dust",
          "fxAnchor": "head",
          "fxSecondary": "target-impact-dust",
          "fxSecondaryAnchor": "target",
          "fxSecondaryAngleMode": "upward-diagonal",
          "offsetY": -24,
          "rotationToward": -34,
          "scaleX": 1,
          "scaleY": 1.03,
          "fxDurationTicks": 6,
          "fxSecondaryDurationTicks": 6,
          "hit": false,
          "judgments": [
            {
              "id": "impact-damage",
              "group": "impact-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 45,
              "hitReactionKind": "strong"
            }
          ],
          "fxAdditional": [
            {
              "fx": "part-swing-arc",
              "anchor": "head",
              "durationTicks": 5,
              "angleMode": "upward-diagonal"
            }
          ]
        },
        "recover": {
          "ticks": 7,
          "origin": "50% 52%",
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "상체 복구",
          "offsetY": -10,
          "rotationToward": -8
        },
        "return": {
          "ticks": 8,
          "to": "home",
          "origin": "50% 50%",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "제자리 복귀",
          "rotation": 0
        }
      }
    },
    "diablos.horn_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 7,
          "to": "between:pass:1,pass:2",
          "moveEasing": "linear",
          "pose": "brace",
          "face": "pass:1",
          "label": "두 헌터 사이 접근"
        },
        "lower-1": {
          "ticks": 4,
          "origin": "50% 52%",
          "pose": "crouch",
          "face": "pass:1",
          "label": "첫 뿔 낮추기",
          "rotationToward": 10
        },
        "impact-1": {
          "ticks": 4,
          "origin": "50% 52%",
          "moveEasing": "snap",
          "pose": "idle",
          "sfx": "impact",
          "label": "첫 쳐올리기",
          "fx": "part-dust",
          "fxAnchor": "head",
          "fxSecondary": "target-impact-dust",
          "fxSecondaryAnchor": "target",
          "fxSecondaryAngleMode": "upward-diagonal",
          "offsetY": -18,
          "rotationToward": -34,
          "fxDurationTicks": 6,
          "fxSecondaryDurationTicks": 6,
          "hit": false,
          "judgments": [
            {
              "id": "impact-1-damage",
              "group": "impact-1-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 45,
              "hitReactionKind": "strong"
            }
          ],
          "fxAdditional": [
            {
              "fx": "part-swing-arc",
              "anchor": "head",
              "durationTicks": 5,
              "angleMode": "upward-diagonal"
            }
          ]
        },
        "recenter": {
          "ticks": 5,
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "중앙 자세 전환",
          "offsetY": 0,
          "rotation": 0
        },
        "lower-2": {
          "ticks": 4,
          "origin": "50% 52%",
          "pose": "crouch",
          "face": "pass:2",
          "label": "둘째 뿔 낮추기",
          "rotationToward": 10
        },
        "impact-2": {
          "ticks": 4,
          "origin": "50% 52%",
          "moveEasing": "snap",
          "pose": "idle",
          "sfx": "impact",
          "label": "둘째 쳐올리기",
          "fx": "part-dust",
          "fxAnchor": "head",
          "fxSecondary": "target-impact-dust",
          "fxSecondaryAnchor": "target",
          "fxSecondaryAngleMode": "upward-diagonal",
          "offsetY": -18,
          "rotationToward": -34,
          "fxDurationTicks": 6,
          "fxSecondaryDurationTicks": 6,
          "hit": false,
          "judgments": [
            {
              "id": "impact-2-damage",
              "group": "impact-2-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 45,
              "hitReactionKind": "strong"
            }
          ],
          "fxAdditional": [
            {
              "fx": "part-swing-arc",
              "anchor": "head",
              "durationTicks": 5,
              "angleMode": "upward-diagonal"
            }
          ]
        },
        "recover": {
          "ticks": 6,
          "origin": "50% 52%",
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "상체 복구",
          "offsetY": -8,
          "rotationToward": -8
        },
        "return": {
          "ticks": 8,
          "to": "home",
          "origin": "50% 50%",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "제자리 복귀",
          "rotation": 0
        }
      }
    },
    "diablos.bite": {
      "beats": {
        "approach": {
          "ticks": 5,
          "to": "target",
          "moveEasing": "accelerate",
          "pose": "stretch-soft",
          "face": "toward-target",
          "label": "접근",
          "aimBodyAt": "target"
        },
        "bite": {
          "ticks": 3,
          "to": "toward:target 106%",
          "moveEasing": "snap",
          "pose": "stretch-strong",
          "sfx": "impact",
          "label": "물어뜯기",
          "hit": false,
          "judgments": [
            {
              "id": "bite-damage",
              "group": "bite-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 30,
              "hitReactionKind": "weak"
            }
          ]
        },
        "recoil": {
          "ticks": 3,
          "to": "toward:target 90%",
          "pose": "land",
          "label": "반동"
        },
        "return": {
          "ticks": 5,
          "to": "home",
          "pose": "idle",
          "label": "복귀"
        }
      }
    },
    "diablos.side_tackle": {
      "beats": {
        "side-hop": {
          "ticks": 7,
          "to": "pair-flank:targets 150",
          "moveEasing": "snap",
          "pose": "stretch-soft",
          "face": "target-group",
          "label": "측면 도약"
        },
        "shoulder-set": {
          "ticks": 5,
          "pose": "brace",
          "label": "어깨 들이밀기",
          "rotationToward": 14
        },
        "tackle": {
          "ticks": 4,
          "to": "through-current:target-group 150%",
          "moveEasing": "slow-fast-slow",
          "pose": "stretch-strong",
          "bounds": "reach",
          "sfx": "impact",
          "label": "철산고 충돌",
          "fx": "target-impact-dust",
          "fxAnchor": "target",
          "rotationToward": 22,
          "fxDurationTicks": 6,
          "hit": false,
          "judgments": [
            {
              "id": "tackle-damage",
              "group": "tackle-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 65,
              "hitReactionKind": "strong"
            }
          ]
        },
        "step-back": {
          "ticks": 8,
          "to": "toward:target 82%",
          "pose": "settle",
          "label": "한걸음 후퇴",
          "rotation": 0
        },
        "return": {
          "ticks": 6,
          "to": "home",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "복귀"
        }
      }
    },
    "diablos.rage_charge": {
      "beats": {
        "stomp": {
          "ticks": 7,
          "pose": "crouch",
          "label": "발구르기",
          "stompSteps": 3
        },
        "charge-out": {
          "ticks": 10,
          "to": "pair:center",
          "moveEasing": "linear",
          "pose": "idle",
          "face": "pair:center",
          "bounds": "reach",
          "label": "1차 돌진·헌터 관통",
          "strideFlipTicks": 3,
          "instantPose": true,
          "judgments": [
            {
              "id": "exit-bottom-damage",
              "group": "exit-bottom-impact",
              "kind": "damage",
              "target": "pair",
              "offsetTicks": 7,
              "damagePercent": 60,
              "hitReactionKind": "strong"
            }
          ],
          "hit": false
        },
        "exit-bottom": {
          "ticks": 10,
          "to": "through:pair:center 120",
          "moveEasing": "linear",
          "pose": "idle",
          "face": "pair:center",
          "fade": "out",
          "sfx": "impact",
          "label": "같은 직선으로 화면 하단 이탈",
          "targetMode": "runtime-pair-left",
          "strideFlipTicks": 3,
          "hit": false,
          "judgments": []
        },
        "hold-outside": {
          "ticks": 15,
          "pose": "brace",
          "label": "화면 하단 밖 대기",
          "opacity": 0
        },
        "return-charge": {
          "ticks": 12,
          "to": "above:pair:center 220",
          "moveEasing": "linear",
          "pose": "idle",
          "face": "pair:center",
          "bounds": "pivot",
          "label": "2차 돌진·화면 안 정지",
          "rotation": 180,
          "opacity": 1,
          "strideFlipTicks": 3,
          "hit": false,
          "instantOpacity": true,
          "instantPose": true,
          "judgments": [
            {
              "id": "return-charge-damage",
              "group": "return-charge-impact",
              "kind": "damage",
              "target": "pair",
              "offsetTicks": 7,
              "damagePercent": 60,
              "hitReactionKind": "strong"
            }
          ]
        },
        "return-impact": {
          "ticks": 4,
          "moveEasing": "linear",
          "pose": "land",
          "sfx": "impact",
          "label": "2차 충돌·정지",
          "targetMode": "runtime-pair-right",
          "rotation": 180,
          "strideFlipTicks": 0,
          "hit": false
        },
        "tail-wind-left": {
          "ticks": 15,
          "origin": "part:torso",
          "moveEasing": "accelerate",
          "pose": "stretch-soft",
          "label": "좌상단 꼬리 준비",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 165,
          "scaleX": 1.01,
          "scaleY": 0.99,
          "skewX": 4
        },
        "tail-cross-one": {
          "ticks": 5,
          "origin": "part:torso",
          "moveEasing": "snap",
          "pose": "stretch-strong",
          "sfx": "impact",
          "label": "후방 X자 좌상→우하",
          "targetMode": "runtime-pair-left",
          "fx": "target-impact-dust",
          "fxAnchor": "target",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 202,
          "scaleX": 1.04,
          "scaleY": 0.96,
          "skewX": -6,
          "damageScale": 0.45,
          "fxDurationTicks": 5,
          "hit": false,
          "judgments": [
            {
              "id": "tail-cross-one-damage",
              "group": "tail-cross-one-impact",
              "kind": "damage",
              "target": "pair-left",
              "offsetTicks": 0,
              "damagePercent": 30,
              "hitReactionKind": "strong"
            }
          ]
        },
        "tail-rebound": {
          "ticks": 4,
          "origin": "part:torso",
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "꼬리 반동",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 185,
          "scaleX": 1.01,
          "scaleY": 0.99,
          "skewX": -2
        },
        "tail-wind-right": {
          "ticks": 5,
          "origin": "part:torso",
          "moveEasing": "accelerate",
          "pose": "stretch-soft",
          "label": "우상단 꼬리 준비",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 195,
          "scaleX": 1.01,
          "scaleY": 0.99,
          "skewX": -4,
          "flipFacing": true
        },
        "tail-cross-two": {
          "ticks": 5,
          "origin": "part:torso",
          "moveEasing": "snap",
          "pose": "stretch-strong",
          "sfx": "impact",
          "label": "후방 X자 우상→좌하",
          "targetMode": "runtime-pair-right",
          "fx": "target-impact-dust",
          "fxAnchor": "target",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 158,
          "scaleX": 1.04,
          "scaleY": 0.96,
          "skewX": 6,
          "damageScale": 0.45,
          "fxDurationTicks": 5,
          "hit": false,
          "judgments": [
            {
              "id": "tail-cross-two-damage",
              "group": "tail-cross-two-impact",
              "kind": "damage",
              "target": "pair-right",
              "offsetTicks": 0,
              "damagePercent": 30,
              "hitReactionKind": "strong"
            }
          ]
        },
        "tail-settle": {
          "ticks": 5,
          "origin": "part:torso",
          "moveEasing": "decelerate",
          "pose": "settle",
          "label": "꼬리 회수",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 176,
          "scaleX": 1.01,
          "scaleY": 0.99,
          "skewX": 2
        },
        "return": {
          "ticks": 8,
          "to": "home",
          "origin": "part:torso",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "회전 유지 복귀",
          "rotation": 180,
          "scaleX": 1,
          "scaleY": 1,
          "flipFacing": true,
          "skewX": 0,
          "opacity": 1
        }
      }
    },
    "diablos.tail_slam_rock": {
      "beats": {
        "brace": {
          "ticks": 5,
          "pose": "brace",
          "label": "제자리 준비"
        },
        "turn-back": {
          "ticks": 5,
          "origin": "part:torso",
          "rotationEasing": "accelerate",
          "pose": "brace",
          "label": "뒤돌기",
          "rotation": 180
        },
        "tail-compress": {
          "ticks": 6,
          "origin": "part:torso",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "pose": "crouch",
          "label": "꼬리 높이 들어올리기",
          "rotation": 145,
          "scaleX": 0.9,
          "scaleY": 0.86,
          "skewX": -8
        },
        "tail-slam-volley": {
          "ticks": 4,
          "origin": "part:torso",
          "moveEasing": "snap",
          "rotationEasing": "snap",
          "pose": "stretch-strong",
          "label": "꼬리 원호 내려찍기 · 바위 발사",
          "fx": "tail-slam-arc",
          "fxAnchor": "tail",
          "rotation": 218,
          "scaleX": 1.16,
          "scaleY": 1.2,
          "skewX": 10,
          "fxDurationTicks": 4,
          "hit": false
        },
        "volley-flight": {
          "ticks": 7,
          "origin": "part:torso",
          "pose": "stretch-strong",
          "sfx": "impact",
          "label": "바위 3갈래 비행",
          "rotation": 218,
          "scaleX": 1.16,
          "scaleY": 1.2,
          "skewX": 10,
          "hit": false,
          "judgments": [
            {
              "id": "volley-flight-damage",
              "group": "volley-flight-impact",
              "kind": "damage",
              "target": "primary-adjacent",
              "offsetTicks": 6,
              "damagePercent": 40,
              "hitReactionKind": "strong"
            }
          ]
        },
        "recoil": {
          "ticks": 6,
          "origin": "part:torso",
          "rotationEasing": "decelerate",
          "pose": "land",
          "label": "내려찍기 반동",
          "rotation": 196,
          "scaleX": 1.03,
          "scaleY": 0.96
        },
        "recover": {
          "ticks": 5,
          "origin": "part:torso",
          "rotationEasing": "decelerate",
          "pose": "settle",
          "label": "꼬리 회수",
          "rotation": 180,
          "scaleX": 1,
          "scaleY": 1
        },
        "return": {
          "ticks": 8,
          "to": "home",
          "origin": "part:torso",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "제자리 복귀",
          "rotation": 180,
          "scaleX": 1,
          "scaleY": 1,
          "judgments": []
        }
      }
    },
    "__reaction.knockdown": {
      "beats": {
        "reaction": {
          "ticks": 6,
          "origin": "50% 88%",
          "moveEasing": "decelerate",
          "pose": "land",
          "label": "넘어짐",
          "offsetX": 100,
          "rotation": 30,
          "scaleX": 1.08,
          "scaleY": 0.68,
          "skewX": -10
        },
        "struggle-1": {
          "ticks": 14,
          "pose": "land",
          "label": "바둥 1"
        },
        "struggle-2": {
          "ticks": 14,
          "pose": "land",
          "label": "바둥 2"
        },
        "struggle-3": {
          "ticks": 14,
          "pose": "land",
          "label": "바둥 3"
        },
        "struggle-4": {
          "ticks": 14,
          "pose": "land",
          "label": "바둥 4"
        },
        "struggle-5": {
          "ticks": 14,
          "pose": "land",
          "label": "바둥 5"
        },
        "rise": {
          "ticks": 13,
          "to": "home",
          "moveEasing": "decelerate",
          "pose": "idle",
          "label": "일어남",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "skewX": 0
        }
      }
    },
    "__reaction.pitfall": {
      "beats": {
        "reaction": {
          "ticks": 6,
          "pose": "land",
          "label": "지반 붕괴"
        },
        "held-1": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 1"
        },
        "held-2": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 2"
        },
        "held-3": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 3"
        },
        "held-4": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 4"
        },
        "held-5": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 5"
        },
        "held-6": {
          "ticks": 12,
          "pose": "crouch",
          "label": "허덕임 6"
        },
        "release": {
          "ticks": 12,
          "pose": "idle",
          "label": "탈출"
        }
      }
    },
    "__partReactions": {
      "left-horn": "small",
      "right-horn": "small",
      "back": "small",
      "left-wing": "small",
      "right-wing": "small",
      "left-front-leg": "large",
      "right-front-leg": "large",
      "tail": "tail"
    },
    "__reaction.paralysis": {
      "beats": {
        "held": {
          "ticks": 50,
          "pose": "crouch",
          "label": "마비"
        }
      }
    },
    "__reaction.sleep": {
      "beats": {
        "sleep-enter": {
          "ticks": 20,
          "origin": "50% 88%",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "pose": "land",
          "label": "드러누워 잠들기",
          "offsetX": 24,
          "offsetY": 30,
          "rotation": 28,
          "scaleX": 1.06,
          "scaleY": 0.68,
          "skewX": -8
        },
        "held": {
          "ticks": 200,
          "origin": "50% 88%",
          "moveEasing": "linear",
          "rotationEasing": "linear",
          "pose": "land",
          "label": "수면 유지",
          "offsetX": 24,
          "offsetY": 30,
          "rotation": 28,
          "scaleX": 1.06,
          "scaleY": 0.68,
          "skewX": -8
        },
        "wake": {
          "ticks": 5,
          "to": "home",
          "origin": "50% 88%",
          "moveEasing": "snap",
          "rotationEasing": "snap",
          "pose": "idle",
          "label": "기상",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "skewX": 0
        }
      }
    },
    "__reaction.tail-sever": {
      "beats": {
        "reaction": {
          "ticks": 2,
          "origin": "50% 68%",
          "moveEasing": "snap",
          "rotationEasing": "snap",
          "pose": "stretch-strong",
          "label": "절단 충격",
          "offsetX": -16,
          "offsetY": -18,
          "rotation": -14,
          "scaleX": 1.06,
          "scaleY": 1.06
        },
        "roll-1": {
          "ticks": 3,
          "origin": "50% 68%",
          "moveEasing": "accelerate",
          "rotationEasing": "accelerate",
          "pose": "land",
          "label": "첫 바퀴",
          "offsetX": 36,
          "offsetY": 4,
          "rotation": 170,
          "scaleX": 1.04,
          "scaleY": 0.94
        },
        "roll-2": {
          "ticks": 22,
          "origin": "50% 68%",
          "moveEasing": "slow-fast-slow",
          "rotationEasing": "slow-fast-slow",
          "pose": "land",
          "label": "두 바퀴",
          "offsetX": 200,
          "offsetY": 32,
          "rotation": 700,
          "scaleX": 1.03,
          "scaleY": 0.9
        },
        "down": {
          "ticks": 20,
          "origin": "50% 68%",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "pose": "land",
          "label": "옆으로 쓰러짐",
          "offsetX": 60,
          "offsetY": 42,
          "rotation": 720,
          "scaleX": 1.08,
          "scaleY": 0.68,
          "skewX": -10
        },
        "recover": {
          "ticks": 13,
          "to": "home",
          "origin": "50% 68%",
          "moveEasing": "decelerate",
          "rotationEasing": "decelerate",
          "pose": "idle",
          "label": "일어남",
          "offsetX": 0,
          "offsetY": 0,
          "rotation": 720,
          "scaleX": 1,
          "scaleY": 1,
          "skewX": 0
        }
      }
    }
  },
  "frostfang_barioth": {
    "frostfang_barioth.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "frostfang_barioth.freezing_floor": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "frostfang_barioth.frost_leap": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 8
        }
      }
    }
  },
  "jyuratodus": {
    "jyuratodus.rise.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "jyuratodus.rise.0.projectile": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "jyuratodus.rise.1.2": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 8
        }
      }
    },
    "jyuratodus.rise.2.aerial": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "jyuratodus.rise.3.mr": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "jyuratodus.rise.4.sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "jyuratodus.rise.5.close": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "kirin": {
    "kirin.worldshell.0.head_butt_rush": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 9
        }
      }
    },
    "kirin.worldshell.1.ride_rage_crash_tail": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "kirin.worldshell.2.super_shock_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "kirin.worldshell.3.ride_rage_crash_tail_lv2": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "kirin.worldshell.4.shock_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "kirin.worldshell.5.horn_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "kushala_daora": {
    "kushala_daora.rise.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "kushala_daora.rise.0.projectile": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "kushala_daora.rise.1.charge": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 8
        }
      }
    },
    "kushala_daora.rise.2.aerial": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "kushala_daora.rise.3.sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "kushala_daora.rise.4.close": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "kushala_daora.rise.5.close": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "lavasioth": {
    "lavasioth.worldshell.0.swim_breath_double": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lavasioth.worldshell.1.swim_rush_pre": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 9
        }
      }
    },
    "lavasioth.worldshell.2.bite_half_diving_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "lavasioth.worldshell.3.swim_breath_double_second": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lavasioth.worldshell.4.swim_triple_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lavasioth.worldshell.5.breath_shot": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    }
  },
  "lunastra": {
    "lunastra.worldshell.0.close_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lunastra.worldshell.1.charge": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 9
        }
      }
    },
    "lunastra.worldshell.2.tail_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lunastra.worldshell.3.side_wing_attack": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "lunastra.worldshell.4.tail_attack_side": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "lunastra.worldshell.5.powerful_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    }
  },
  "rathalos": {
    "rathalos.roar": {
      "beats": {
        "brace": {
          "ticks": 3,
          "pose": "crouch",
          "label": "몸 낮추기"
        },
        "roar": {
          "ticks": 4,
          "pose": "stretch-strong",
          "sfx": "roar",
          "label": "포효"
        },
        "settle": {
          "ticks": 23,
          "pose": "idle",
          "label": "자세 회복"
        }
      }
    },
    "rathalos.bite": {
      "beats": {
        "approach": {
          "ticks": 5,
          "to": "toward:target 82%",
          "pose": "stretch-soft",
          "face": "target",
          "label": "접근"
        },
        "bite": {
          "ticks": 3,
          "to": "toward:target 106%",
          "moveEasing": "snap",
          "pose": "stretch-strong",
          "sfx": "impact",
          "label": "물어뜯기",
          "hit": false,
          "judgments": [
            {
              "id": "bite-damage",
              "group": "bite-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 24
            }
          ]
        },
        "recoil": {
          "ticks": 3,
          "to": "toward:target 91%",
          "pose": "land",
          "label": "반동"
        },
        "return": {
          "ticks": 5,
          "to": "home",
          "pose": "idle",
          "label": "복귀"
        }
      }
    },
    "rathalos.rush": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 32
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 1
        }
      }
    },
    "rathalos.fireball": {
      "beats": {
        "aim": {
          "ticks": 2,
          "pose": "brace",
          "face": "target",
          "label": "조준"
        },
        "charge": {
          "ticks": 8,
          "pose": "crouch",
          "sfx": "charge",
          "label": "화염 모으기"
        },
        "launch": {
          "ticks": 5,
          "pose": "stretch-strong",
          "sfx": "projectile",
          "label": "화염구 발사"
        },
        "impact": {
          "ticks": 8,
          "sfx": "impact",
          "label": "착탄",
          "hit": false,
          "judgments": [
            {
              "id": "impact-damage",
              "group": "impact-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 50
            }
          ]
        },
        "recover": {
          "ticks": 9,
          "pose": "idle",
          "label": "후딜"
        }
      }
    },
    "rathalos.aerial_fireball": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 1
        }
      }
    },
    "rathalos.aerial_triple_fireball": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 12
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 4
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 4
        },
        "impact-3": {
          "ticks": 1
        },
        "action-4": {
          "ticks": 2
        }
      }
    },
    "rathalos.backstep_fireball": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 1
        }
      }
    },
    "rathalos.claw_dive": {
      "beats": {
        "hover-track": {
          "ticks": 10,
          "pose": "brace",
          "face": "target",
          "label": "공중 추적",
          "offsetY": -115
        },
        "dive": {
          "ticks": 8,
          "to": "target",
          "moveEasing": "accelerate",
          "pose": "stretch-strong",
          "label": "발톱 급강하"
        },
        "claw-impact": {
          "ticks": 2,
          "to": "below:target 26",
          "pose": "land",
          "sfx": "impact",
          "label": "발톱 적중",
          "hit": false,
          "judgments": [
            {
              "id": "claw-impact-damage",
              "group": "claw-impact-impact",
              "kind": "damage",
              "target": "primary",
              "offsetTicks": 0,
              "damagePercent": 39
            }
          ]
        },
        "rise": {
          "ticks": 5,
          "pose": "stretch-soft",
          "label": "다시 상승",
          "offsetY": -105
        },
        "return": {
          "ticks": 5,
          "to": "home",
          "pose": "idle",
          "label": "비행 위치 복귀"
        }
      }
    },
    "rathalos.tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 9
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 9
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 13
        }
      }
    },
    "rathalos.aerial_tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "rathalos.hop_stomp": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "rathalos.stomp": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "rathalos.glide": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 7
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 3
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 3
        },
        "impact-3": {
          "ticks": 1
        },
        "action-4": {
          "ticks": 3
        },
        "impact-4": {
          "ticks": 1
        },
        "action-5": {
          "ticks": 15
        }
      }
    }
  },
  "rathian": {
    "rathian.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "rathian.bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "rathian.tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 19
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 9
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 7
        }
      }
    },
    "rathian.fireball": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 1
        }
      }
    },
    "rathian.triple_fireball": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 12
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 4
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 4
        },
        "impact-3": {
          "ticks": 1
        }
      }
    },
    "rathian.fireball_fizzle": {
      "beats": {
        "action-1": {
          "ticks": 13
        }
      }
    },
    "rathian.charge": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 24
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 1
        }
      }
    },
    "rathian.triple_charge": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 113
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 1
        }
      }
    },
    "rathian.somersault": {
      "beats": {
        "telegraph": {
          "ticks": 8
        },
        "action-1": {
          "ticks": 11
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 12
        }
      }
    },
    "rathian.double_somersault": {
      "beats": {
        "telegraph": {
          "ticks": 8
        },
        "action-1": {
          "ticks": 14
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 30
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 10
        }
      }
    },
    "rathian.bite_somersault": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 13
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 33
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 11
        }
      }
    },
    "rathian.somersault_glide": {
      "beats": {
        "telegraph": {
          "ticks": 8
        },
        "action-1": {
          "ticks": 13
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 34
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 21
        }
      }
    },
    "rathian.glide": {
      "beats": {
        "telegraph": {
          "ticks": 6
        },
        "action-1": {
          "ticks": 27
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 14
        }
      }
    }
  },
  "seething_bazelgeuse": {
    "seething_bazelgeuse.roar": {
      "beats": {
        "action-1": {
          "ticks": 27
        }
      }
    },
    "seething_bazelgeuse.bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 30
        },
        "impact-1": {
          "ticks": 30
        }
      }
    },
    "seething_bazelgeuse.charge": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 50
        },
        "action-2": {
          "ticks": 50
        },
        "impact-1": {
          "ticks": 50
        },
        "action-3": {
          "ticks": 1
        }
      }
    },
    "seething_bazelgeuse.side_tackle": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 40
        },
        "impact-1": {
          "ticks": 40
        }
      }
    },
    "seething_bazelgeuse.tail_sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 40
        },
        "impact-1": {
          "ticks": 40
        }
      }
    },
    "seething_bazelgeuse.body_press": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 30
        },
        "impact-1": {
          "ticks": 30
        }
      }
    },
    "seething_bazelgeuse.breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 5
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 17
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 3
        }
      }
    },
    "seething_bazelgeuse.carpet_bombing": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 7
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 78
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 28
        }
      }
    },
    "seething_bazelgeuse.purple_scale_barrage": {
      "beats": {
        "telegraph": {
          "ticks": 9
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "seething_bazelgeuse.diving_explosion": {
      "beats": {
        "telegraph": {
          "ticks": 14
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "teostra": {
    "teostra.rise.roar": {
      "beats": {
        "action-1": {
          "ticks": 2
        }
      }
    },
    "teostra.rise.0.projectile": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "teostra.rise.1.charge": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 8
        }
      }
    },
    "teostra.rise.2.aerial": {
      "beats": {
        "telegraph": {
          "ticks": 7
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "teostra.rise.3.sweep": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "teostra.rise.4.area": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "teostra.rise.5.close": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    }
  },
  "tigrex": {
    "tigrex.roar": {
      "beats": {
        "action-1": {
          "ticks": 20
        }
      }
    },
    "tigrex.foreleg_slam": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "tigrex.bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "tigrex.double_bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 5
        },
        "impact-1": {
          "ticks": 1
        },
        "action-2": {
          "ticks": 4
        },
        "impact-2": {
          "ticks": 1
        },
        "action-3": {
          "ticks": 14
        }
      }
    },
    "tigrex.charge_rock": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 100
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 8
        }
      }
    },
    "tigrex.charge_spin": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 100
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 8
        }
      }
    },
    "tigrex.charge_bite": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 100
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 8
        }
      }
    },
    "tigrex.spin": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "tigrex.rock_shot": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "tigrex.leap": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "action-2": {
          "ticks": 24
        },
        "impact-1": {
          "ticks": 2
        },
        "action-3": {
          "ticks": 8
        }
      }
    }
  },
  "yian_garuga": {
    "yian_garuga.worldshell.0.combo_breath_shot": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "yian_garuga.worldshell.1.to_special_attack_rise": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 2
        },
        "impact-1": {
          "ticks": 2
        }
      }
    },
    "yian_garuga.worldshell.2.high_power_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "yian_garuga.worldshell.3.normal_breath_shot": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "yian_garuga.worldshell.4.three_way_breath": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    },
    "yian_garuga.worldshell.5.breath_fly": {
      "beats": {
        "telegraph": {
          "ticks": 5
        },
        "action-1": {
          "ticks": 3
        },
        "impact-1": {
          "ticks": 3
        }
      }
    }
  }
};
if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;
if (typeof globalThis !== 'undefined') globalThis.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;

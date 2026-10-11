'use strict';
// Generated from styles/hunt-runtime.css. Do not edit.
const HUNT_MONSTER_PROFILE_KEYFRAMES={
  "keyframes": {
    "monster-idle": [
      {
        "offset": 0,
        "transform": "translateY(0) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translateY(-8px) scale(1.03)"
      }
    ],
    "log-fade-in": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateY(5px)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "translateY(0)"
      }
    ],
    "enraged-glow": [
      {
        "offset": 0,
        "filter": "drop-shadow(0 0 10px rgba(255, 0, 0, 0.6)) brightness(1.2)"
      },
      {
        "offset": 1,
        "filter": "drop-shadow(0 0 25px rgba(255, 0, 0, 0.95)) brightness(1.4)"
      }
    ],
    "hunt-valstrax-star": [
      {
        "offset": 1,
        "transform": "scale(2.4)",
        "opacity": 0.45
      }
    ],
    "hunt-valstrax-impact-burst": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.08)",
        "filter": "brightness(4)"
      },
      {
        "offset": 0.14,
        "opacity": 1,
        "transform": "scale(.55)",
        "filter": "brightness(2.4)"
      },
      {
        "offset": 0.48,
        "opacity": 0.95,
        "transform": "scale(1.18)",
        "filter": "brightness(1.25)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(1.65)",
        "filter": "brightness(.8)"
      }
    ],
    "hunt-pending-trap-pulse": [
      {
        "offset": 1,
        "opacity": 1,
        "filter": "drop-shadow(0 10px 7px #000) drop-shadow(0 0 13px #fff)"
      }
    ],
    "hunt-triggered-web": [
      {
        "offset": 1,
        "transform": "translateX(-50%) scaleY(.46) scaleX(1.03)",
        "filter": "brightness(1.45)"
      }
    ],
    "hunt-bomb-place": [
      {
        "offset": 0,
        "transform": "translateX(-50%) translateY(-70px) scale(.45)",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "translateX(-50%) scale(1)",
        "opacity": 1
      }
    ],
    "hunt-bomb-burst": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.12)"
      },
      {
        "offset": 0.12,
        "opacity": 1,
        "transform": "scale(1.35)"
      },
      {
        "offset": 0.45,
        "opacity": 0.95,
        "transform": "scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(2.2)"
      }
    ],
    "hunt-bomb-flash": [
      {
        "offset": 0,
        "opacity": 1
      },
      {
        "offset": 0.2,
        "opacity": 1
      },
      {
        "offset": 0.36,
        "filter": "brightness(2.8)"
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-bomb-hit": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.3,
        "transform": "none"
      },
      {
        "offset": 0.38,
        "transform": "translateY(-24px) rotate(-8deg) scale(1.08)"
      },
      {
        "offset": 0.48,
        "transform": "translate(18px,12px) rotate(7deg) scale(.94)"
      },
      {
        "offset": 0.62,
        "transform": "translate(-10px,5px) rotate(-3deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "hunt-bomb-screen-shake": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translate(-18px,10px)"
      },
      {
        "offset": 0.27,
        "transform": "translate(15px,-9px)"
      },
      {
        "offset": 0.43,
        "transform": "translate(-11px,7px)"
      },
      {
        "offset": 0.62,
        "transform": "translate(8px,-5px)"
      },
      {
        "offset": 0.8,
        "transform": "translate(-4px,2px)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "hunt-shock-jitter": [
      {
        "offset": 1,
        "transform": "translate(6px,-3px) scale(1.08)"
      }
    ],
    "hunt-flash-screen": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.2)"
      },
      {
        "offset": 0.12,
        "opacity": 1,
        "transform": "scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(1.35)"
      }
    ],
    "stun-shake": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(-2px, 2px) rotate(-1deg)"
      },
      {
        "offset": 0.4,
        "transform": "translate(-2px, -2px) rotate(1deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(2px, 2px) rotate(0deg)"
      },
      {
        "offset": 0.8,
        "transform": "translate(2px, -2px) rotate(-1deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "hunter-stun-orbit-spin": [
      {
        "offset": 1,
        "transform": "translate(-50%, -50%) rotate(360deg)"
      }
    ],
    "monster-stun-head-orbit": [
      {
        "offset": 0,
        "transform": "translate(-18px,-8px) rotate(-14deg) scale(.92)"
      },
      {
        "offset": 1,
        "transform": "translate(18px,4px) rotate(14deg) scale(1.08)"
      }
    ],
    "monster-knockdown-wiggle": [
      {
        "offset": 0,
        "transform": "rotate(160deg) translate(0, 0)",
        "filter": "drop-shadow(0 0 10px rgba(255, 149, 0, 0.45))"
      },
      {
        "offset": 0.2,
        "transform": "rotate(165deg) translate(-4px, 3px)"
      },
      {
        "offset": 0.4,
        "transform": "rotate(155deg) translate(-2px, -3px)"
      },
      {
        "offset": 0.6,
        "transform": "rotate(165deg) translate(3px, 2px)"
      },
      {
        "offset": 0.8,
        "transform": "rotate(155deg) translate(2px, -2px)"
      },
      {
        "offset": 1,
        "transform": "rotate(160deg) translate(0, 0)",
        "filter": "drop-shadow(0 0 25px rgba(255, 149, 0, 0.85))"
      }
    ],
    "monster-knockdown-sequence": [
      {
        "offset": 0,
        "transform": "rotate(0deg) scale(1) skewX(0)",
        "filter": "brightness(1)"
      },
      {
        "offset": 0.04,
        "transform": "rotate(22deg) scale(1.04,.84) skewX(-18deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.0789,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)"
      },
      {
        "offset": 0.21050000000000002,
        "transform": "rotate(15deg) scale(1.04,.9) skewX(-4deg)"
      },
      {
        "offset": 0.2368,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)"
      },
      {
        "offset": 0.36840000000000006,
        "transform": "rotate(15deg) scale(1.03,.91) skewX(-3deg)"
      },
      {
        "offset": 0.3947,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)"
      },
      {
        "offset": 0.5263,
        "transform": "rotate(15deg) scale(1.04,.89) skewX(-5deg)"
      },
      {
        "offset": 0.5526,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)"
      },
      {
        "offset": 0.6842,
        "transform": "rotate(15deg) scale(1.03,.92) skewX(-2deg)"
      },
      {
        "offset": 0.7105,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)"
      },
      {
        "offset": 0.8421,
        "transform": "rotate(15deg) scale(1.04,.9) skewX(-4deg)"
      },
      {
        "offset": 0.8684000000000001,
        "transform": "rotate(30deg) scale(1.08,.68) skewX(-10deg)",
        "filter": "brightness(.86) drop-shadow(12px 16px 10px #000a)"
      },
      {
        "offset": 0.94,
        "transform": "rotate(18deg) scale(1.02,.9) skewX(-4deg)"
      },
      {
        "offset": 0.98,
        "transform": "rotate(4deg) scale(.99,1.02) skewX(-1deg)"
      },
      {
        "offset": 1,
        "transform": "rotate(0deg) scale(1) skewX(0)",
        "filter": "brightness(1)"
      }
    ],
    "weapon-roll": [
      {
        "offset": 0,
        "transform": "translateY(0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translateY(18px) rotate(-45deg) scale(0.88, 0.72)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(-25px) rotate(-180deg) scale(1.08, 1.18)"
      },
      {
        "offset": 0.8,
        "transform": "translateY(6px) rotate(-320deg) scale(1.04, 0.84)"
      },
      {
        "offset": 1,
        "transform": "translateY(0) rotate(-360deg) scale(1)"
      }
    ],
    "hunter-invincible-jump": [
      {
        "offset": 0,
        "transform": "translateY(0) rotate(0) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.1,
        "transform": "translateY(170px) rotate(10deg) scale(.94)",
        "opacity": 1
      },
      {
        "offset": 0.18,
        "transform": "translateY(760px) rotate(-14deg) scale(.72)",
        "opacity": 0
      },
      {
        "offset": 0.82,
        "transform": "translateY(760px) rotate(14deg) scale(.72)",
        "opacity": 0
      },
      {
        "offset": 0.92,
        "transform": "translateY(160px) rotate(-8deg) scale(.94)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translateY(0) rotate(0) scale(1)",
        "opacity": 1
      }
    ],
    "card-large-shake": [
      {
        "offset": 0
      },
      {
        "offset": 0.1
      },
      {
        "offset": 0.2
      },
      {
        "offset": 0.32
      },
      {
        "offset": 0.46
      },
      {
        "offset": 0.62
      },
      {
        "offset": 0.78
      },
      {
        "offset": 0.9
      },
      {
        "offset": 1
      }
    ],
    "card-small-shake": [
      {
        "offset": 0
      },
      {
        "offset": 0.15
      },
      {
        "offset": 0.32
      },
      {
        "offset": 0.5
      },
      {
        "offset": 0.68
      },
      {
        "offset": 0.84
      },
      {
        "offset": 1
      }
    ],
    "hunt-preview-impact-badge": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.18,
        "opacity": 1
      },
      {
        "offset": 0.58,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "hunter-card-hit-three-shakes": [
      {
        "offset": 0
      },
      {
        "offset": 0.16
      },
      {
        "offset": 0.32
      },
      {
        "offset": 0.48
      },
      {
        "offset": 0.64
      },
      {
        "offset": 0.8
      },
      {
        "offset": 1
      }
    ],
    "hunter-card-guard-one-half-shakes": [
      {
        "offset": 0
      },
      {
        "offset": 0.22
      },
      {
        "offset": 0.44
      },
      {
        "offset": 0.66
      },
      {
        "offset": 1
      }
    ],
    "hunt-damage-number-pop": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(.35)"
      },
      {
        "offset": 0.14,
        "opacity": 1,
        "transform": "translate(-50%, -58%) scale(1.28)"
      },
      {
        "offset": 0.35,
        "transform": "translate(-50%, -62%) scale(1)"
      },
      {
        "offset": 0.78,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -125%) scale(.86)"
      }
    ],
    "hunt-hit-dust": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(.2)"
      },
      {
        "offset": 0.18,
        "opacity": 0.92
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(\r\n            calc(-50% + var(--dust-x)),\r\n            calc(-50% + var(--dust-y))\r\n        ) scale(var(--dust-scale))"
      }
    ],
    "hunt-critical-slash": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(.72)"
      },
      {
        "offset": 0.15,
        "opacity": 1,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(1.04)"
      },
      {
        "offset": 0.62,
        "opacity": 1,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(.96)",
        "filter": "drop-shadow(0 0 2px rgba(255, 67, 61, .3))\r\n            drop-shadow(0 0 7px rgba(220, 0, 8, .25))"
      }
    ],
    "bubble-fade-in": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, 10px)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "translate(-50%, 0)"
      }
    ],
    "bubble-fade-out": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translate(-50%, 0)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -10px)"
      }
    ],
    "ls-spirit-img-pulse-3": [
      {
        "offset": 0,
        "filter": "sepia(1) saturate(30) hue-rotate(300deg) brightness(1.35) drop-shadow(0 0 8px rgba(231, 76, 60, 0.85))"
      },
      {
        "offset": 1,
        "filter": "sepia(1) saturate(42) hue-rotate(300deg) brightness(1.7) drop-shadow(0 0 22px rgba(231, 76, 60, 1.0))"
      }
    ],
    "db-demon-pulse": [
      {
        "offset": 0,
        "filter": "saturate(1) brightness(1)"
      },
      {
        "offset": 1,
        "filter": "saturate(1.5) brightness(1.2)"
      }
    ],
    "db-demon-img-pulse": [
      {
        "offset": 0,
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 1,
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1))"
      }
    ],
    "w-db-dance-demon": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x) * 0.3), calc(var(--attack-y) * 0.3)) rotate(360deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x) * 0.7), calc(var(--attack-y) * 0.7)) rotate(720deg) scaleY(-1) scaleX(1.2)",
        "filter": "sepia(1) saturate(24) hue-rotate(300deg) brightness(1.3) drop-shadow(0 0 10px rgba(231, 76, 60, 0.9))"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * 1.1), calc(var(--attack-y) * 1.1)) rotate(1080deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(var(--attack-x) * 0.4), calc(var(--attack-y) * 0.4)) rotate(1080deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-levi-demon": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.25,
        "transform": "translate(var(--attack-x), var(--attack-y)) rotate(720deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.75,
        "transform": "translate(var(--attack-x), var(--attack-y)) rotate(2520deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "melee-slash": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.5,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -40px)) rotate(var(--attack-rot, 0deg)) scale(1.05)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "hammer-kkt-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.15), calc(var(--attack-y, -30px) * 0.15)) rotate(calc(var(--attack-rot, 0deg) * 0.15 - 5deg))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0) rotate(5deg)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.15), calc(var(--attack-y, -30px) * 0.15)) rotate(calc(var(--attack-rot, 0deg) * 0.15 - 5deg))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0) rotate(5deg)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.4), calc(var(--attack-y, -50px) * 0.4)) rotate(calc(var(--attack-rot, 0deg) * 0.4 - 15deg))"
      },
      {
        "offset": 0.9,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -50px)) rotate(calc(var(--attack-rot, 0deg) + 10deg)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0)"
      }
    ],
    "hammer-sway-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.4 - 40px), calc(var(--attack-y, 0px) * 0.4)) rotate(-5deg) scale(1.02)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.8 + 40px), calc(var(--attack-y, 0px) * 0.8)) rotate(5deg) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0)"
      }
    ],
    "hammer-upper-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x, 0px) * -0.1), calc(var(--attack-y, -40px) * -0.1 + 20px)) rotate(5deg) scale(0.95)"
      },
      {
        "offset": 0.6,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -70px)) rotate(calc(var(--attack-rot, 0deg) - 20deg)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0)"
      }
    ],
    "hammer-smash-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.3), calc(var(--attack-y, -40px) * 0.3)) rotate(calc(var(--attack-rot, 0deg) * 0.3 - 10deg)) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -40px)) rotate(calc(var(--attack-rot, 0deg) + 15deg)) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0)"
      }
    ],
    "hammer-tornado-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.2), calc(var(--attack-y, -40px) * 0.2)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.4), calc(var(--attack-y, -40px) * 0.4)) rotate(720deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.6), calc(var(--attack-y, -40px) * 0.6)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.8), calc(var(--attack-y, -40px) * 0.8)) rotate(1440deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1800deg) scale(1)"
      }
    ],
    "hammer-hit": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x, 0px) * 0.3), calc(var(--attack-y, -30px) * 0.3)) rotate(calc(var(--attack-rot, 0deg) * 0.3 - 8deg))"
      },
      {
        "offset": 0.7,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -30px)) rotate(calc(var(--attack-rot, 0deg) + 8deg))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0)"
      }
    ],
    "gs-charge1-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(1)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--attack-x, 0px) * -0.1), calc(var(--attack-y, -60px) * -0.1 + 15px)) scale(0.95)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 0.75,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -60px)) rotate(var(--attack-rot, 0deg)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) scale(1)"
      }
    ],
    "gs-charge2-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(1)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--attack-x, 0px) * -0.1), calc(var(--attack-y, -80px) * -0.1 + 20px)) scale(0.9) filter(brightness(1.4))"
      },
      {
        "offset": 0.75,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -80px)) rotate(var(--attack-rot, 0deg)) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) scale(1)"
      }
    ],
    "gs-charge3-anim": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x, 0px) * -0.15), calc(var(--attack-y, -110px) * -0.15 + 30px)) scale(0.85)",
        "filter": "brightness(1.6) drop-shadow(0 0 15px rgba(201, 133, 52,0.8))"
      },
      {
        "offset": 0.8,
        "transform": "translate(var(--attack-x, 0px), var(--attack-y, -110px)) rotate(var(--attack-rot, 0deg)) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) scale(1)"
      }
    ],
    "bowgun-recoil": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.12
      },
      {
        "offset": 0.25
      },
      {
        "offset": 0.6
      },
      {
        "offset": 1
      }
    ],
    "monster-paralyzed-pose": [
      {
        "offset": 0,
        "transform": "translateY(34px) rotate(-5deg) scaleY(.88)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(36px) rotate(4deg) scaleY(.84)"
      },
      {
        "offset": 1,
        "transform": "translateY(34px) rotate(-5deg) scaleY(.88)"
      }
    ],
    "monster-sleeping-pose": [
      {
        "offset": 0,
        "transform": "translateY(48px) rotate(9deg) scaleY(.78)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(43px) rotate(7deg) scaleY(.81)"
      },
      {
        "offset": 1,
        "transform": "translateY(48px) rotate(9deg) scaleY(.78)"
      }
    ],
    "monster-flight-high-hover": [
      {
        "offset": 0,
        "transform": "translateY(-235px) rotate(-1.2deg)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(-275px) rotate(1.2deg)"
      },
      {
        "offset": 1,
        "transform": "translateY(-235px) rotate(-1.2deg)"
      }
    ],
    "hunt-part-break-flash": [
      {
        "offset": 0,
        "transform": "scale(1.8)",
        "filter": "brightness(2.2) drop-shadow(0 0 14px #fff)"
      },
      {
        "offset": 1,
        "transform": "scale(1)"
      }
    ],
    "monster-part-break-visual": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.72)"
      },
      {
        "offset": 0.08,
        "opacity": 1,
        "transform": "scale(1.08)"
      },
      {
        "offset": 0.22,
        "opacity": 1,
        "transform": "scale(1)"
      },
      {
        "offset": 0.78,
        "opacity": 1,
        "transform": "scale(1)"
      },
      {
        "offset": 0.88,
        "opacity": 1,
        "transform": "scale(1.04)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(1.12)"
      }
    ],
    "monster-part-break-left": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.72)"
      },
      {
        "offset": 0.2,
        "opacity": 1,
        "transform": "scale(1)"
      },
      {
        "offset": 0.6,
        "opacity": 1,
        "transform": "translate(-34px,18px) rotate(-28deg) scale(1.03)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-52px,42px) rotate(-38deg) scale(.92)"
      }
    ],
    "monster-part-break-right": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.72)"
      },
      {
        "offset": 0.2,
        "opacity": 1,
        "transform": "scale(1)"
      },
      {
        "offset": 0.6,
        "opacity": 1,
        "transform": "translate(34px,18px) rotate(28deg) scale(1.03)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(52px,42px) rotate(38deg) scale(.92)"
      }
    ],
    "monster-aim-settle": [
      {
        "offset": 0,
        "transform": "rotate(var(--narga-aim-deg,0deg))"
      },
      {
        "offset": 0.8,
        "transform": "rotate(var(--narga-aim-deg,0deg))"
      },
      {
        "offset": 0.92,
        "transform": "rotate(0deg)"
      },
      {
        "offset": 1,
        "transform": "rotate(0deg)"
      }
    ],
    "tigrex-charge-stride-flip": [
      {
        "offset": 0,
        "transform": "scaleX(1) translateY(1px)"
      },
      {
        "offset": 0.4999,
        "transform": "scaleX(1) translateY(1px)"
      },
      {
        "offset": 0.5,
        "transform": "scaleX(-1) translateY(-2px)"
      },
      {
        "offset": 1,
        "transform": "scaleX(-1) translateY(-2px)"
      }
    ],
    "monster-beat-stride-flip": [
      {
        "offset": 0,
        "transform": "scaleX(1)"
      },
      {
        "offset": 0.4999,
        "transform": "scaleX(1)"
      },
      {
        "offset": 0.5,
        "transform": "scaleX(-1)"
      },
      {
        "offset": 1,
        "transform": "scaleX(-1)"
      }
    ],
    "hunt-blast-scale-drop": [
      {
        "offset": 0,
        "opacity": 0.9,
        "transform": "translate(calc(-50% + var(--blast-scale-source-x)),var(--blast-scale-source-y)) scale(.68) rotate(-28deg)"
      },
      {
        "offset": 0.48,
        "opacity": 1,
        "transform": "translate(calc(-50% + var(--blast-scale-arc-x)),var(--blast-scale-arc-y)) scale(1.02) rotate(195deg)"
      },
      {
        "offset": 0.82,
        "opacity": 1,
        "transform": "translate(-50%,7px) scale(1.34) rotate(344deg)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "translate(-50%,0) scale(1) rotate(0)"
      }
    ],
    "hunt-blast-scale-warning": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translate(-50%,0) scale(.96)",
        "filter": "brightness(1) drop-shadow(0 7px 7px #000b)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "translate(-50%,-2px) scale(1.12)",
        "filter": "brightness(1.75) drop-shadow(0 0 18px var(--blast-scale-warning-glow,#ff3b16))"
      }
    ],
    "hunt-blast-scale-unheated-pulse": [
      {
        "offset": 0,
        "filter": "brightness(.92)"
      },
      {
        "offset": 1,
        "filter": "brightness(1.18)"
      }
    ],
    "hunt-blast-scale-explode": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translate(-50%,0) scale(1)"
      },
      {
        "offset": 0.18,
        "opacity": 1,
        "transform": "translate(-50%,-12px) scale(2.5)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-42px) scale(5.5)"
      }
    ],
    "monster-motion-bazel-carpet-bombing": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.04,
        "transform": "translateY(18px) scale(.92,1.06)",
        "opacity": 1
      },
      {
        "offset": 0.07,
        "transform": "translate(calc(var(--monster-carpet-opening-x)*.48),calc(var(--monster-carpet-opening-y)*.48)) scale(1.1)",
        "opacity": 1
      },
      {
        "offset": 0.1,
        "transform": "translate(var(--monster-carpet-opening-x),var(--monster-carpet-opening-y)) scale(1.28)",
        "opacity": 1
      },
      {
        "offset": 0.17,
        "transform": "translate(var(--monster-carpet-opening-x),var(--monster-charge-bottom)) scale(1.55)",
        "opacity": 1
      },
      {
        "offset": 0.17010000000000003,
        "transform": "translate(var(--monster-carpet-opening-x),var(--monster-charge-bottom)) scale(1.55)",
        "opacity": 0
      },
      {
        "offset": 0.20989999999999998,
        "transform": "translate(var(--monster-carpet-start-x),var(--monster-carpet-flight-y)) scale(.82)",
        "opacity": 0
      },
      {
        "offset": 0.21,
        "transform": "translate(var(--monster-carpet-start-x),var(--monster-carpet-flight-y)) scale(.82)",
        "opacity": 1
      },
      {
        "offset": 0.63,
        "transform": "translate(var(--monster-carpet-end-x),var(--monster-carpet-flight-y)) scale(.88)",
        "opacity": 1
      },
      {
        "offset": 0.64,
        "transform": "translate(var(--monster-carpet-end-x),var(--monster-carpet-flight-y)) scale(.88)",
        "opacity": 0
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--monster-carpet-end-x),var(--monster-carpet-flight-y)) rotate(-12deg) scale(.86)",
        "opacity": 1
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--monster-carpet-dive-x),var(--monster-carpet-dive-y)) rotate(8deg) scale(1.48,.86)",
        "opacity": 1,
        "filter": "brightness(1.55) drop-shadow(0 24px 16px #000a)"
      },
      {
        "offset": 0.84,
        "transform": "translate(var(--monster-carpet-dive-x),var(--monster-carpet-dive-y)) rotate(3deg) scale(1.18,.92)",
        "opacity": 1,
        "filter": "brightness(.92)"
      },
      {
        "offset": 0.92,
        "transform": "translate(calc(var(--monster-carpet-dive-x)*.45),calc(var(--monster-carpet-dive-y)*.35)) scale(1.02)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1,
        "filter": "none"
      }
    ],
    "monster-motion-close-strike": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--monster-attack-x)*-.12),12px) rotate(-5deg) scale(.92)"
      },
      {
        "offset": 0.48,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(7deg) scale(1.16)"
      },
      {
        "offset": 0.62,
        "transform": "translate(calc(var(--monster-attack-x)*.86),calc(var(--monster-attack-y)*.86)) rotate(-3deg) scale(1.08)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-close-strike-quadruped": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translateY(30px) scale(1.09,.82)"
      },
      {
        "offset": 0.45,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(3deg) scale(1.2,.94)"
      },
      {
        "offset": 0.66,
        "transform": "translate(calc(var(--monster-attack-x)*.78),calc(var(--monster-attack-y)*.72)) rotate(-2deg) scale(1.08)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-close-strike-winged": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.16,
        "transform": "translateY(-30px) rotate(-7deg) scale(.9)"
      },
      {
        "offset": 0.46,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(4deg) scale(1.08)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--monster-attack-x)*.74),calc(var(--monster-attack-y)*.62)) rotate(-5deg) scale(1.03)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-legiana-hop-strike": [
      {
        "offset": 0,
        "transform": "none",
        "filter": "none"
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--monster-attack-x)*-.16),-38px) rotate(-5deg) scale(.92,1.05)"
      },
      {
        "offset": 0.32,
        "transform": "translate(calc(var(--monster-attack-x)*.22),-92px) rotate(5deg) scale(.88,1.08)"
      },
      {
        "offset": 0.56,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-4deg) scale(1.14,.92)",
        "filter": "brightness(1.24)"
      },
      {
        "offset": 0.72,
        "transform": "translate(calc(var(--monster-attack-x)*.72),-34px) rotate(4deg) scale(1.02)"
      },
      {
        "offset": 0.86,
        "transform": "translate(calc(var(--monster-attack-x)*.22),-12px) rotate(-2deg) scale(.98)"
      },
      {
        "offset": 1,
        "transform": "none",
        "filter": "none"
      }
    ],
    "monster-motion-close-strike-serpentine": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translateX(calc(var(--monster-attack-x)*-.16)) rotate(-10deg) scale(.96,1.02)"
      },
      {
        "offset": 0.48,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(5deg) scale(1.06,.98)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--monster-attack-x)*.66),calc(var(--monster-attack-y)*.55)) rotate(-7deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-close-strike-arthropod": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "translate(-28px,18px) rotate(-5deg) scale(1.06,.86)"
      },
      {
        "offset": 0.34,
        "transform": "translate(34px,-8px) rotate(5deg) scale(.96,1.05)"
      },
      {
        "offset": 0.55,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-2deg) scale(1.08)"
      },
      {
        "offset": 0.72,
        "transform": "translate(calc(var(--monster-attack-x)*.7),0) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-ground-charge": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.06,
        "transform": "translateY(24px) scale(.92,1.08)"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*.154),calc(var(--monster-charge-bottom)*.154)) scale(1.16)"
      },
      {
        "offset": 0.34,
        "transform": "translate(calc(var(--monster-attack-x)*.410),calc(var(--monster-charge-bottom)*.410)) scale(1.29)"
      },
      {
        "offset": 0.46,
        "transform": "translate(calc(var(--monster-attack-x)*.718),calc(var(--monster-charge-bottom)*.718)) scale(1.46)"
      },
      {
        "offset": 0.57,
        "transform": "translate(var(--monster-attack-x),var(--monster-charge-bottom)) scale(1.62)",
        "opacity": 1
      },
      {
        "offset": 0.58,
        "transform": "translate(var(--monster-attack-x),var(--monster-charge-bottom)) scale(1.62)",
        "opacity": 0
      },
      {
        "offset": 0.63,
        "transform": "translate(calc(var(--monster-attack-x)*-.28),calc(var(--monster-charge-top)*-1)) scale(.72)",
        "opacity": 0
      },
      {
        "offset": 0.69,
        "transform": "translate(calc(var(--monster-attack-x)*-.22),calc(var(--monster-charge-top)*-1)) scale(.76)",
        "opacity": 1
      },
      {
        "offset": 0.88,
        "transform": "translate(0,-36px) scale(.96)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-ground-charge-stomp-burst": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.06,
        "transform": "translate(-28px,30px) rotate(-7deg) scale(1.07,.84)",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translate(-7px,-6px) rotate(-1deg) scale(.97,1.05)",
        "opacity": 1
      },
      {
        "offset": 0.16,
        "transform": "translate(28px,30px) rotate(7deg) scale(1.07,.84)",
        "opacity": 1
      },
      {
        "offset": 0.22,
        "transform": "translate(7px,-6px) rotate(1deg) scale(.97,1.05)",
        "opacity": 1
      },
      {
        "offset": 0.28,
        "transform": "translateY(38px) scale(1.13,.76)",
        "opacity": 1
      },
      {
        "offset": 0.36,
        "transform": "translateY(-9px) scale(.96,1.06)",
        "opacity": 1
      },
      {
        "offset": 0.47600000000000003,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.62,
        "transform": "translate(var(--monster-charge-first-x),var(--monster-charge-first-y)) scale(1.3)",
        "opacity": 1
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.58)",
        "opacity": 1
      },
      {
        "offset": 0.77,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.58)",
        "opacity": 0
      },
      {
        "offset": 0.83,
        "transform": "translate(var(--monster-charge-return-x),var(--monster-charge-return-y)) scale(.76)",
        "opacity": 0
      },
      {
        "offset": 0.89,
        "transform": "translate(var(--monster-charge-return-x),var(--monster-charge-return-y)) scale(.80)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-ground-charge-cross": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translateX(calc(var(--monster-charge-start-side)*.18)) scale(.92)"
      },
      {
        "offset": 0.18,
        "transform": "translateX(var(--monster-charge-start-side)) scale(1.02)",
        "opacity": 0
      },
      {
        "offset": 0.23,
        "transform": "translateX(var(--monster-charge-start-side)) scale(1.1)",
        "opacity": 1
      },
      {
        "offset": 0.48,
        "transform": "translateX(0) scale(1.34)",
        "opacity": 1
      },
      {
        "offset": 0.72,
        "transform": "translateX(var(--monster-charge-side)) scale(1.58)",
        "opacity": 1
      },
      {
        "offset": 0.73,
        "transform": "translateX(var(--monster-charge-side)) scale(1.58)",
        "opacity": 0
      },
      {
        "offset": 0.8,
        "transform": "translateY(calc(var(--monster-charge-top)*-1)) scale(.75)",
        "opacity": 0
      },
      {
        "offset": 0.85,
        "transform": "translateY(-160px) scale(.82)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-charge-footfall": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.28,
        "opacity": 0.95
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-charge-rumble": [
      {
        "offset": 0
      },
      {
        "offset": 0.35
      },
      {
        "offset": 0.7
      },
      {
        "offset": 1
      }
    ],
    "monster-motion-tail-sweep": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.23,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-8deg) scale(.98)"
      },
      {
        "offset": 0.39,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-18deg) scale(.97)"
      },
      {
        "offset": 0.78,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(342deg) scale(1.12)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg) scale(1)"
      }
    ],
    "monster-motion-tail-sweep-double": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.15,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-8deg) scale(.98)"
      },
      {
        "offset": 0.26,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-18deg) scale(.97)"
      },
      {
        "offset": 0.52,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(162deg) scale(1.12)"
      },
      {
        "offset": 0.59,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(158deg) scale(1.04)"
      },
      {
        "offset": 0.85,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(342deg) scale(1.14)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg) scale(1)"
      }
    ],
    "monster-motion-ground-charge-zigzag": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1,
        "easing": "cubic-bezier(.333,0,.667,.333)"
      },
      {
        "offset": 0.125,
        "transform": "translateX(calc(var(--monster-lane-x)*-.504)) rotate(-9deg) scale(1.01)"
      },
      {
        "offset": 0.177,
        "transform": "translateX(calc(var(--monster-lane-x)*-.92)) rotate(-11deg) scale(1.08)"
      },
      {
        "offset": 0.38799999999999996,
        "transform": "translateX(calc(var(--monster-lane-x)*.78)) translateY(70px) rotate(10deg) scale(1.3)"
      },
      {
        "offset": 0.574,
        "transform": "translateX(calc(var(--monster-lane-x)*-.72)) translateY(120px) rotate(-9deg) scale(1.43)"
      },
      {
        "offset": 0.78,
        "transform": "translateX(calc(var(--monster-lane-x)*.94)) translateY(185px) rotate(8deg) scale(1.58)",
        "opacity": 1
      },
      {
        "offset": 0.79,
        "opacity": 0
      },
      {
        "offset": 0.86,
        "transform": "translateY(-150px) scale(.78)",
        "opacity": 0
      },
      {
        "offset": 0.91,
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-ground-charge-double": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.34,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.55)",
        "opacity": 1
      },
      {
        "offset": 0.35,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.55)",
        "opacity": 0
      },
      {
        "offset": 0.62,
        "transform": "translate(var(--monster-charge-second-x),var(--monster-charge-second-y)) scale(1.25)",
        "opacity": 1
      },
      {
        "offset": 0.78,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.82)",
        "opacity": 1
      },
      {
        "offset": 0.79,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.82)",
        "opacity": 0
      },
      {
        "offset": 0.87,
        "transform": "translate(var(--monster-charge-return-x),var(--monster-charge-return-y)) scale(.84)",
        "opacity": 0
      },
      {
        "offset": 0.92,
        "transform": "translate(calc(var(--monster-charge-return-x)*.35),-55px) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-ground-charge-double-stomp-burst": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.043,
        "transform": "translate(-28px,30px) rotate(-7deg) scale(1.07,.84)",
        "opacity": 1
      },
      {
        "offset": 0.086,
        "transform": "translate(-7px,-6px) rotate(-1deg) scale(.97,1.05)",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translate(28px,30px) rotate(7deg) scale(1.07,.84)",
        "opacity": 1
      },
      {
        "offset": 0.163,
        "transform": "translate(7px,-6px) rotate(1deg) scale(.97,1.05)",
        "opacity": 1
      },
      {
        "offset": 0.20600000000000002,
        "transform": "translateY(38px) scale(1.13,.76)",
        "opacity": 1
      },
      {
        "offset": 0.257,
        "transform": "translateY(-9px) scale(.96,1.06)",
        "opacity": 1
      },
      {
        "offset": 0.317,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.35700000000000004,
        "transform": "translate(var(--monster-charge-first-x),var(--monster-charge-first-y)) scale(1.28)",
        "opacity": 1
      },
      {
        "offset": 0.45299999999999996,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.55)",
        "opacity": 1
      },
      {
        "offset": 0.461,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.55)",
        "opacity": 0
      },
      {
        "offset": 0.611,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.35)",
        "opacity": 1
      },
      {
        "offset": 0.773,
        "transform": "translate(var(--monster-charge-second-x),var(--monster-charge-second-y)) scale(1.25)",
        "opacity": 1
      },
      {
        "offset": 0.903,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.82)",
        "opacity": 1
      },
      {
        "offset": 0.91,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.82)",
        "opacity": 0
      },
      {
        "offset": 0.94,
        "transform": "translate(var(--monster-charge-return-x),var(--monster-charge-return-y)) scale(.84)",
        "opacity": 0
      },
      {
        "offset": 0.97,
        "transform": "translate(calc(var(--monster-charge-return-x)*.35),-55px) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-stomp-dust-anim": [
      {
        "offset": 0,
        "transform": "translate(-50%,-28%) scale(.18,.12)",
        "opacity": 0
      },
      {
        "offset": 0.18,
        "transform": "translate(-50%,-48%) scale(1.05,.72)",
        "opacity": 1
      },
      {
        "offset": 0.48,
        "transform": "translate(calc(-50% + var(--stomp-drift,0px)),-72%) scale(1.52,1.05)",
        "opacity": 0.82
      },
      {
        "offset": 1,
        "transform": "translate(calc(-50% + var(--stomp-drift,0px)),-118%) scale(2.05,1.42)",
        "opacity": 0
      }
    ],
    "monster-motion-ground-charge-triple": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translate(var(--monster-charge-first-x),var(--monster-charge-first-y)) scale(1.18)",
        "opacity": 1
      },
      {
        "offset": 0.29,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.34)",
        "opacity": 1
      },
      {
        "offset": 0.3,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.34)",
        "opacity": 0
      },
      {
        "offset": 0.31,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.34)",
        "opacity": 1
      },
      {
        "offset": 0.43,
        "transform": "translate(var(--monster-charge-second-x),var(--monster-charge-second-y)) scale(1.2)",
        "opacity": 1
      },
      {
        "offset": 0.6,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 0.61,
        "transform": "translate(var(--monster-charge-second-exit-x),var(--monster-charge-second-exit-y)) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 0.74,
        "transform": "translate(var(--monster-charge-third-x),var(--monster-charge-third-y)) scale(1.2)",
        "opacity": 1
      },
      {
        "offset": 0.89,
        "transform": "translate(var(--monster-charge-third-exit-x),var(--monster-charge-third-exit-y)) scale(1.34)",
        "opacity": 1
      },
      {
        "offset": 0.9,
        "transform": "translate(var(--monster-charge-third-exit-x),var(--monster-charge-third-exit-y)) scale(1.34)",
        "opacity": 0
      },
      {
        "offset": 0.94,
        "transform": "translate(0,-95px) scale(.86)",
        "opacity": 0
      },
      {
        "offset": 0.97,
        "transform": "translate(0,-45px) scale(.93)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-lateral-sweep": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "translateX(calc(var(--monster-lane-x)*-.72)) rotate(-8deg) scale(.92)"
      },
      {
        "offset": 0.42,
        "transform": "translateX(calc(var(--monster-lane-x)*.88)) rotate(9deg) scale(1.13)"
      },
      {
        "offset": 0.68,
        "transform": "translateX(calc(var(--monster-lane-x)*-.55)) rotate(-6deg) scale(1.08)"
      },
      {
        "offset": 0.84,
        "transform": "translateX(calc(var(--monster-lane-x)*.22)) rotate(3deg) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-pounce-chain": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.15,
        "transform": "translateX(calc(var(--monster-lane-x)*-.68)) translateY(-45px) rotate(-9deg) scale(.92)"
      },
      {
        "offset": 0.34,
        "transform": "translateX(calc(var(--monster-lane-x)*.46)) translateY(35px) rotate(8deg) scale(1.16)"
      },
      {
        "offset": 0.51,
        "transform": "translateX(calc(var(--monster-lane-x)*.82)) translateY(-65px) rotate(12deg) scale(.98)"
      },
      {
        "offset": 0.7,
        "transform": "translateX(calc(var(--monster-lane-x)*-.48)) translateY(55px) rotate(-11deg) scale(1.2)"
      },
      {
        "offset": 0.86,
        "transform": "translateX(calc(var(--monster-lane-x)*.18)) rotate(4deg) scale(1.04)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-charge-chain": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.06,
        "transform": "translate(var(--tigrex-launch-recoil-x),var(--tigrex-launch-recoil-y))",
        "opacity": 1
      },
      {
        "offset": 0.1,
        "transform": "translate(var(--tigrex-launch-recoil-x),var(--tigrex-launch-recoil-y))",
        "opacity": 1
      },
      {
        "offset": 0.17600000000000002,
        "transform": "translate(var(--tigrex-pass-1-x),var(--tigrex-pass-1-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.29,
        "transform": "translate(var(--tigrex-exit-1-x),var(--tigrex-exit-1-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.37,
        "transform": "translate(var(--tigrex-exit-1-x),var(--tigrex-exit-1-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.483,
        "transform": "translate(var(--tigrex-pass-2-x),var(--tigrex-pass-2-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.722,
        "transform": "translate(var(--tigrex-exit-2-x),var(--tigrex-exit-2-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(var(--tigrex-exit-2-x),var(--tigrex-exit-2-y)) scale(1.12)",
        "opacity": 1
      }
    ],
    "monster-motion-rathian-ground-charge": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.04,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translateY(20px) scale(.94,1.06)",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translateY(-4px) scale(1.02,.98)",
        "opacity": 1,
        "easing": "cubic-bezier(.333,0,.667,.333)"
      },
      {
        "offset": 0.253,
        "transform": "translate(calc(var(--monster-charge-first-x)*.586),calc(var(--monster-charge-first-y)*.586)) scale(1.13)",
        "opacity": 1
      },
      {
        "offset": 0.3,
        "transform": "translate(var(--monster-charge-first-x),var(--monster-charge-first-y)) scale(1.22)",
        "opacity": 1
      },
      {
        "offset": 0.44,
        "transform": "translate(calc(var(--monster-charge-first-x)*.674 + var(--monster-charge-first-exit-x)*.326),calc(var(--monster-charge-first-y)*.674 + var(--monster-charge-first-exit-y)*.326)) scale(1.27)",
        "opacity": 1
      },
      {
        "offset": 0.58,
        "transform": "translate(calc(var(--monster-charge-first-x)*.349 + var(--monster-charge-first-exit-x)*.651),calc(var(--monster-charge-first-y)*.349 + var(--monster-charge-first-exit-y)*.651)) scale(1.33)",
        "opacity": 1
      },
      {
        "offset": 0.73,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.38)",
        "opacity": 1
      },
      {
        "offset": 0.74,
        "transform": "translate(var(--monster-charge-first-exit-x),var(--monster-charge-first-exit-y)) scale(1.38)",
        "opacity": 0
      },
      {
        "offset": 0.82,
        "transform": "translate(var(--monster-charge-return-x),var(--monster-charge-return-y)) scale(.82)",
        "opacity": 0
      },
      {
        "offset": 0.9,
        "transform": "translate(calc(var(--monster-charge-return-x)*.35),-52px) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "tigrex-charge-chain-three": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.055,
        "transform": "translate(var(--tigrex-launch-recoil-x),var(--tigrex-launch-recoil-y))",
        "opacity": 1
      },
      {
        "offset": 0.09,
        "transform": "translate(var(--tigrex-launch-recoil-x),var(--tigrex-launch-recoil-y))",
        "opacity": 1
      },
      {
        "offset": 0.165,
        "transform": "translate(var(--tigrex-pass-1-x),var(--tigrex-pass-1-y)) scale(1.12)"
      },
      {
        "offset": 0.27,
        "transform": "translate(var(--tigrex-exit-1-x),var(--tigrex-exit-1-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.28,
        "transform": "translate(var(--tigrex-exit-1-x),var(--tigrex-exit-1-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.395,
        "transform": "translate(var(--tigrex-pass-2-x),var(--tigrex-pass-2-y)) scale(1.12)"
      },
      {
        "offset": 0.619,
        "transform": "translate(var(--tigrex-exit-2-x),var(--tigrex-exit-2-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.629,
        "transform": "translate(var(--tigrex-exit-2-x),var(--tigrex-exit-2-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.863,
        "transform": "translate(var(--tigrex-pass-3-x),var(--tigrex-pass-3-y)) scale(1.12)"
      },
      {
        "offset": 0.968,
        "transform": "translate(var(--tigrex-exit-3-x),var(--tigrex-exit-3-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(var(--tigrex-exit-3-x),var(--tigrex-exit-3-y)) scale(1.12)",
        "opacity": 1
      }
    ],
    "tigrex-branch-approach": [
      {
        "offset": 0,
        "transform": "translate(var(--tigrex-branch-last-exit-x),var(--tigrex-branch-last-exit-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.9,
        "transform": "translate(var(--tigrex-branch-x),var(--tigrex-branch-y)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(var(--tigrex-branch-x),var(--tigrex-branch-y)) scale(1.12)",
        "opacity": 1
      }
    ],
    "tigrex-exhausted-trip": [
      {
        "offset": 0,
        "transform": "translate(calc(var(--monster-attack-x)*-.9),calc(var(--monster-attack-y)*.18)) rotate(-5deg)"
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*-.45),calc(var(--monster-attack-y)*.38)) rotate(-18deg) scale(1.08,.88)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(var(--monster-attack-x)*-.28),calc(var(--monster-attack-y)*.48)) rotate(-82deg) scale(1.12,.82)"
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--monster-attack-x)*-.28),calc(var(--monster-attack-y)*.48)) rotate(-82deg) scale(1.12,.82)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-rock-hop": [
      {
        "offset": 0,
        "transform": "var(--tigrex-branch-start-transform,translate(var(--tigrex-branch-x),var(--tigrex-branch-y)))"
      },
      {
        "offset": 0.08,
        "transform": "var(--tigrex-branch-start-transform,translate(var(--tigrex-branch-x),var(--tigrex-branch-y)))"
      },
      {
        "offset": 0.22,
        "transform": "translate(0,-68px) scale(.92)"
      },
      {
        "offset": 0.34,
        "transform": "translate(0,0) scale(1.04,.92)"
      },
      {
        "offset": 0.38,
        "transform": "translate(0,0) rotate(10deg) scale(1.1,.9)"
      },
      {
        "offset": 0.58,
        "transform": "translate(-16px,0) rotate(-4deg) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-sliding-spin": [
      {
        "offset": 0,
        "transform": "var(--tigrex-branch-start-transform,translate(var(--tigrex-branch-x),var(--tigrex-branch-y)))"
      },
      {
        "offset": 0.18,
        "transform": "translate(var(--tigrex-branch-x),var(--tigrex-branch-y)) rotate(35deg) scale(1.08)"
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--tigrex-branch-x),var(--tigrex-branch-y)) rotate(360deg) scale(1.16)"
      },
      {
        "offset": 0.82,
        "transform": "translate(var(--tigrex-branch-x),var(--tigrex-branch-y)) rotate(360deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg)"
      }
    ],
    "tigrex-running-double-bite": [
      {
        "offset": 0,
        "transform": "var(--tigrex-branch-start-transform,translate(var(--tigrex-branch-x),var(--tigrex-branch-y)))"
      },
      {
        "offset": 0.34,
        "transform": "translate(var(--tigrex-bite-contact-x),var(--tigrex-bite-contact-y)) rotate(-11deg) scale(1.12)"
      },
      {
        "offset": 0.62,
        "transform": "translate(var(--tigrex-bite-finish-x),var(--tigrex-bite-finish-y)) rotate(10deg) scale(1.14)"
      },
      {
        "offset": 0.82,
        "transform": "translate(var(--tigrex-bite-finish-x),var(--tigrex-bite-finish-y)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(var(--tigrex-bite-finish-x),var(--tigrex-bite-finish-y)) rotate(2deg)"
      }
    ],
    "tigrex-foreleg-slam": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*.45),calc(var(--monster-attack-y)*.38 - 20px)) rotate(-8deg)"
      },
      {
        "offset": 0.56,
        "transform": "translate(calc(var(--monster-attack-x)*.72),calc(var(--monster-attack-y)*.72)) rotate(9deg) scale(1.12,.9)"
      },
      {
        "offset": 0.78,
        "transform": "translate(calc(var(--monster-attack-x)*.35),calc(var(--monster-attack-y)*.3))"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-bite": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*.18),calc(var(--monster-attack-y)*.12)) rotate(7deg) scale(.96)"
      },
      {
        "offset": 0.58,
        "transform": "translate(calc(var(--monster-attack-x)*.82),calc(var(--monster-attack-y)*.78)) rotate(-8deg) scale(1.13)"
      },
      {
        "offset": 0.74,
        "transform": "translate(calc(var(--monster-attack-x)*.7),calc(var(--monster-attack-y)*.66)) rotate(5deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-double-bite": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--tigrex-bite-contact-x)*.3),calc(var(--tigrex-bite-contact-y)*.3)) scale(.95)"
      },
      {
        "offset": 0.43,
        "transform": "translate(var(--tigrex-bite-contact-x),var(--tigrex-bite-contact-y)) rotate(-11deg) scale(1.12)"
      },
      {
        "offset": 0.66,
        "transform": "translate(var(--tigrex-bite-finish-x),var(--tigrex-bite-finish-y)) rotate(10deg) scale(1.14)"
      },
      {
        "offset": 0.79,
        "transform": "translate(var(--tigrex-bite-finish-x),var(--tigrex-bite-finish-y)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-clockwise-spin": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*.18),calc(var(--monster-attack-y)*.14)) rotate(-12deg) scale(.94)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--monster-attack-x)*.82),calc(var(--monster-attack-y)*.78)) rotate(-12deg) scale(1.02)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--monster-attack-x)*.92),calc(var(--monster-attack-y)*.88)) rotate(360deg) scale(1.15)"
      },
      {
        "offset": 0.92,
        "transform": "translate(calc(var(--monster-attack-x)*.68),calc(var(--monster-attack-y)*.62)) rotate(360deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg)"
      }
    ],
    "tigrex-rock-shot": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.28,
        "transform": "translate(calc(var(--monster-attack-x)*.15),calc(var(--monster-attack-y)*.12)) rotate(-12deg) scale(.96)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(var(--monster-attack-x)*.3),calc(var(--monster-attack-y)*.26)) rotate(11deg) scale(1.12,.9)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--monster-attack-x)*.24),calc(var(--monster-attack-y)*.2)) rotate(-4deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "tigrex-leap": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translateY(22px) scale(1.08,.84)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0,-270px) rotate(-7deg) scale(.9,1.12)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--monster-attack-x)*.62),calc(var(--monster-attack-y)*.24 - 300px)) rotate(5deg) scale(.96,1.08)"
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(8deg) scale(1.25,.76)",
        "filter": "brightness(1.32) drop-shadow(0 24px 12px #0009)"
      },
      {
        "offset": 0.78,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(3deg) scale(1.08,.92)"
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--monster-attack-x)*.55),calc(var(--monster-attack-y)*.5))"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-body-spin": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.2,
        "transform": "scale(.9) rotate(-12deg)"
      },
      {
        "offset": 0.62,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y)*.35)) rotate(360deg) scale(1.16)"
      },
      {
        "offset": 0.78,
        "transform": "translate(calc(var(--monster-attack-x)*.7),0) rotate(390deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(390deg) scale(1)"
      }
    ],
    "monster-motion-leap-slam": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translateY(28px) scale(1.08,.84)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--monster-attack-x)*.55),-185px) rotate(-6deg) scale(.88,1.12)"
      },
      {
        "offset": 0.73,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) scale(1.24,.78)",
        "filter": "brightness(1.35) drop-shadow(0 26px 12px #0008)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-aerial-dive": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*-.2),-210px) rotate(-12deg) scale(.72)",
        "filter": "drop-shadow(0 35px 15px #0008)"
      },
      {
        "offset": 0.52,
        "transform": "translate(calc(var(--monster-attack-x)*.4),-250px) rotate(12deg) scale(.8)"
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-8deg) scale(1.26)",
        "filter": "brightness(1.5)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-burrow-enter": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.28,
        "transform": "translateY(18px) rotate(-4deg) scale(1.04)",
        "opacity": 1
      },
      {
        "offset": 0.68,
        "transform": "translateY(210px) rotate(8deg) scale(.92)",
        "opacity": 0.8,
        "filter": "sepia(.35) blur(1px)"
      },
      {
        "offset": 1,
        "transform": "translateY(280px) scale(.82)",
        "opacity": 0,
        "filter": "sepia(.55) blur(3px)"
      }
    ],
    "monster-motion-burrow-emerge": [
      {
        "offset": 0,
        "transform": "translate(var(--monster-burrow-target-x),calc(var(--monster-burrow-target-y) + 250px)) scale(.78)",
        "opacity": 0,
        "filter": "sepia(.55) blur(3px)"
      },
      {
        "offset": 0.24,
        "opacity": 0.35
      },
      {
        "offset": 0.52,
        "transform": "translate(var(--monster-burrow-target-x),var(--monster-burrow-apex-y)) scale(1.25)",
        "opacity": 1,
        "filter": "brightness(1.55)"
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--monster-burrow-target-x),var(--monster-burrow-target-y)) rotate(-5deg) scale(1.18)"
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-local-vortex": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.45) rotate(0)"
      },
      {
        "offset": 0.18,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.45) rotate(0)"
      },
      {
        "offset": 0.28,
        "opacity": 0.68
      },
      {
        "offset": 0.78,
        "opacity": 0.76,
        "transform": "translate(-50%,-50%) scale(1.45) rotate(720deg)"
      },
      {
        "offset": 0.88,
        "opacity": 0
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.45) rotate(0)"
      }
    ],
    "monster-local-wind": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.45)"
      },
      {
        "offset": 0.35,
        "opacity": 0.75
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,80%) scale(1.65)"
      }
    ],
    "monster-local-burrow-cloud": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-8%) scale(.3,.18)"
      },
      {
        "offset": 0.24,
        "opacity": 0.95,
        "transform": "translate(-50%,-35%) scale(1.15,.58)"
      },
      {
        "offset": 0.68,
        "opacity": 0.8,
        "transform": "translate(-50%,-72%) scale(1.9,.9)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-110%) scale(2.5,1.15)"
      }
    ],
    "monster-local-cloud": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-20%) scale(.35)"
      },
      {
        "offset": 0.35,
        "opacity": 0.8
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-75%) scale(1.8)"
      }
    ],
    "monster-local-impact": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.2)"
      },
      {
        "offset": 0.25,
        "opacity": 1,
        "transform": "translate(-50%,-50%) scale(1.3)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(2)"
      }
    ],
    "monster-tail-slam-dust": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-20%) scale(.3)"
      },
      {
        "offset": 0.38,
        "opacity": 0,
        "transform": "translate(-50%,-20%) scale(.3)"
      },
      {
        "offset": 0.48,
        "opacity": 0.82,
        "transform": "translate(-50%,-50%) scale(1.25)"
      },
      {
        "offset": 0.7,
        "opacity": 0,
        "transform": "translate(-50%,-85%) scale(2)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-20%) scale(.3)"
      }
    ],
    "monster-tail-rock-projectile": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(\r\n            calc(-50% + var(--tail-rock-start-x, 0px)),\r\n            calc(-50% + var(--tail-rock-start-y, -180px))\r\n        ) rotate(-80deg) scale(.35)"
      },
      {
        "offset": 0.18,
        "opacity": 1
      },
      {
        "offset": 0.72,
        "opacity": 1,
        "transform": "translate(\r\n            calc(-50% + var(--tail-rock-mid-x, 0px)),\r\n            calc(-50% + var(--tail-rock-mid-y, -70px))\r\n        ) rotate(540deg) scale(1.15)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) rotate(670deg) scale(1.8)"
      }
    ],
    "monster-burrow-dust-fly": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.25)"
      },
      {
        "offset": 0.28,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(calc(-50% + var(--dust-x,45px)),calc(-50% + var(--dust-y,-85px))) scale(2.5)"
      }
    ],
    "monster-burrow-crack": [
      {
        "offset": 0,
        "opacity": 0.25,
        "transform": "translate(-50%,-50%) scale(.45) rotate(-4deg)"
      },
      {
        "offset": 1,
        "opacity": 0.9,
        "transform": "translate(-50%,-50%) scale(1.25) rotate(5deg)"
      }
    ],
    "monster-burrow-track": [
      {
        "offset": 0,
        "transform": "translate(-50%,-50%)",
        "opacity": 0.25
      },
      {
        "offset": 0.12,
        "opacity": 1
      },
      {
        "offset": 0.88,
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(calc(-50% + var(--burrow-track-x)),calc(-50% + var(--burrow-track-y)))",
        "opacity": 0.9
      }
    ],
    "monster-burrow-track-puff": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-30%) scale(.3)"
      },
      {
        "offset": 0.35,
        "opacity": 0.95
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(calc(-50% + var(--dust-x,34px)),calc(-50% + var(--dust-y,-58px))) scale(1.55)"
      }
    ],
    "monster-burrow-track-rumble": [
      {
        "offset": 0,
        "opacity": 0.55,
        "transform": "translate(-50%,-50%) scale(.48) rotate(-3deg)"
      },
      {
        "offset": 1,
        "opacity": 0.9,
        "transform": "translate(-50%,-50%) scale(.72) rotate(3deg)"
      }
    ],
    "monster-tail-slam-sweep": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(-42deg) scale(.54)"
      },
      {
        "offset": 0.18,
        "opacity": 0.9
      },
      {
        "offset": 0.72,
        "opacity": 1,
        "transform": "rotate(8deg) scale(1.03)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(18deg) scale(1.14)"
      }
    ],
    "monster-tail-slam-impact": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.2)"
      },
      {
        "offset": 0.72,
        "opacity": 0,
        "transform": "scale(.2)"
      },
      {
        "offset": 0.78,
        "opacity": 1,
        "transform": "scale(1.25)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(.82)"
      }
    ],
    "monster-part-dust-burst": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(calc(var(--impact-angle,0deg) + var(--dust-angle))) translateX(4px) scale(.25)"
      },
      {
        "offset": 0.18,
        "opacity": 0.95
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(calc(var(--impact-angle,0deg) + var(--dust-angle))) translateX(var(--dust-range)) scale(1.55)"
      }
    ],
    "monster-part-dust-ring": [
      {
        "offset": 0,
        "opacity": 0.9,
        "transform": "scale(.2)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(1.25)"
      }
    ],
    "hunter-target-dust-cloud": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(var(--impact-angle,0deg)) translateX(0) scale(.2)"
      },
      {
        "offset": 0.16,
        "opacity": 0.96,
        "transform": "rotate(var(--impact-angle,0deg)) translateX(10px) scale(.72)"
      },
      {
        "offset": 0.48,
        "opacity": 0.88,
        "transform": "rotate(var(--impact-angle,0deg)) translateX(36px) scale(1.16)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(var(--impact-angle,0deg)) translateX(84px) scale(1.48)"
      }
    ],
    "hunter-target-dust-wave": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-8px) scale(.45)"
      },
      {
        "offset": 0.2,
        "opacity": 0.95
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(46px) scale(1.18)"
      }
    ],
    "monster-part-swing-sketch": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(-5deg) scale(.94)"
      },
      {
        "offset": 0.24,
        "opacity": 0.92,
        "transform": "rotate(1deg) scale(1)"
      },
      {
        "offset": 0.58,
        "opacity": 0.78,
        "transform": "rotate(0) scale(1.025)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(1deg) scale(1.03)"
      }
    ],
    "hunter-interference-wobble": [
      {
        "offset": 0,
        "transform": "translateX(-8px) rotate(-4deg)"
      },
      {
        "offset": 1,
        "transform": "translateX(8px) rotate(4deg)"
      }
    ],
    "hunter-interference-overlay": [
      {
        "offset": 0,
        "transform": "translateX(-5px) rotate(-6deg) scale(.94)"
      },
      {
        "offset": 1,
        "transform": "translateX(5px) rotate(6deg) scale(1.04)"
      }
    ],
    "monster-motion-ranged-cast": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.22,
        "transform": "translate(calc(var(--monster-attack-x)*-.1),12px) scale(.93) rotate(-4deg)"
      },
      {
        "offset": 0.48,
        "transform": "translate(calc(var(--monster-attack-x)*.08),-12px) scale(1.12) rotate(3deg)",
        "filter": "brightness(1.45)"
      },
      {
        "offset": 0.62,
        "transform": "translate(calc(var(--monster-attack-x)*-.04),5px) scale(.98)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-area-burst": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translateY(24px) scale(.82)",
        "filter": "brightness(.7)"
      },
      {
        "offset": 0.48,
        "transform": "translateY(-28px) scale(1.25)",
        "filter": "brightness(1.8) drop-shadow(0 0 40px #fff8)"
      },
      {
        "offset": 0.62,
        "transform": "scale(1.12) rotate(-4deg)"
      },
      {
        "offset": 0.68,
        "transform": "scale(1.18) rotate(4deg)"
      },
      {
        "offset": 0.74,
        "transform": "scale(1.12) rotate(-3deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-roar": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.22,
        "transform": "translateY(18px) scale(.9)"
      },
      {
        "offset": 0.43,
        "transform": "translateY(-18px) scale(1.2)",
        "filter": "brightness(1.45)"
      },
      {
        "offset": 0.52,
        "transform": "translate(-8px,-14px) scale(1.17)"
      },
      {
        "offset": 0.61,
        "transform": "translate(8px,-14px) scale(1.17)"
      },
      {
        "offset": 0.7,
        "transform": "translate(-5px,-10px) scale(1.14)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-bite-contact": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--monster-attack-x)*-.12),-22px) rotate(-7deg) scale(.92)"
      },
      {
        "offset": 0.55,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(8deg) scale(1.16)"
      },
      {
        "offset": 0.68,
        "transform": "translate(calc(var(--monster-attack-x)*.9),calc(var(--monster-attack-y)*.9)) rotate(-5deg) scale(1.08)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-rush-bite": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translateY(-18px) rotate(-5deg) scale(.94)"
      },
      {
        "offset": 0.58,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(7deg) scale(1.26)"
      },
      {
        "offset": 0.69,
        "transform": "translate(calc(var(--monster-attack-x)*1.08),calc(var(--monster-attack-y)*1.08)) rotate(-4deg) scale(1.18)"
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--monster-attack-x)*.24),calc(var(--monster-attack-y)*.2)) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-fireball": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*-.06),15px) rotate(-5deg) scale(.94)"
      },
      {
        "offset": 0.46,
        "transform": "translate(calc(var(--monster-attack-x)*.08),-20px) rotate(4deg) scale(1.14)",
        "filter": "brightness(1.45) drop-shadow(0 0 18px #ff7b32)"
      },
      {
        "offset": 0.62,
        "transform": "translate(calc(var(--monster-attack-x)*-.03),4px) scale(1)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-triple-fireball": [
      {
        "offset": 0,
        "transform": "translateY(-6px)"
      },
      {
        "offset": 0.13,
        "transform": "translate(0,-18px) rotate(-4deg) scale(.96)"
      },
      {
        "offset": 0.26,
        "transform": "translate(-22px,-30px) rotate(5deg) scale(1.12)",
        "filter": "brightness(1.42) drop-shadow(0 0 17px #ff7030)"
      },
      {
        "offset": 0.34,
        "transform": "translate(-8px,-14px) rotate(-2deg) scale(.99)"
      },
      {
        "offset": 0.43,
        "transform": "translate(20px,-28px) rotate(-5deg) scale(1.12)",
        "filter": "brightness(1.48) drop-shadow(0 0 18px #ff7030)"
      },
      {
        "offset": 0.51,
        "transform": "translate(8px,-14px) rotate(2deg) scale(.99)"
      },
      {
        "offset": 0.6,
        "transform": "translate(0,-34px) rotate(3deg) scale(1.14)",
        "filter": "brightness(1.55) drop-shadow(0 0 20px #ff7030)"
      },
      {
        "offset": 0.78,
        "transform": "translate(0,-12px) rotate(0deg) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "translateY(-6px)"
      }
    ],
    "monster-motion-rathalos-step-fireball": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.13,
        "transform": "translateX(calc(var(--monster-lane-x)*-.35)) rotate(-5deg) scale(.95)"
      },
      {
        "offset": 0.25,
        "transform": "translateX(calc(var(--monster-lane-x)*-.28)) translateY(-18px) rotate(4deg) scale(1.1)",
        "filter": "brightness(1.4)"
      },
      {
        "offset": 0.43,
        "transform": "translateX(calc(var(--monster-lane-x)*.24)) translateY(-16px) rotate(-4deg) scale(1.12)",
        "filter": "brightness(1.48)"
      },
      {
        "offset": 0.61,
        "transform": "translateX(calc(var(--monster-lane-x)*-.1)) translateY(-20px) rotate(3deg) scale(1.13)",
        "filter": "brightness(1.52)"
      },
      {
        "offset": 0.84,
        "transform": "translateX(calc(var(--monster-lane-x)*.08)) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-backstep-fireball": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--monster-attack-x)*.08),28px) rotate(4deg) scale(1.05)"
      },
      {
        "offset": 0.44,
        "transform": "translate(calc(var(--monster-attack-x)*-.12),-18px) rotate(-6deg) scale(1.12)",
        "filter": "brightness(1.55) drop-shadow(0 0 20px #ff6a24)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(var(--monster-attack-x)*-.18),-190px) rotate(-10deg) scale(.78)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-claw-dive": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--monster-attack-x)*-.18),-220px) rotate(-13deg) scale(.73)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(var(--monster-attack-x)*.38),-260px) rotate(12deg) scale(.8)"
      },
      {
        "offset": 0.66,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-10deg) scale(1.28)",
        "filter": "brightness(1.5) drop-shadow(0 20px 12px #0009)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--monster-attack-x)*.55),-150px) rotate(7deg) scale(.88)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-air-kick-combo": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--monster-attack-x)*-.2),-205px) rotate(-10deg) scale(.76)"
      },
      {
        "offset": 0.42,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(12deg) scale(1.24)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(var(--monster-attack-x)*.3),-175px) rotate(-12deg) scale(.82)"
      },
      {
        "offset": 0.72,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-9deg) scale(1.29)",
        "filter": "brightness(1.45)"
      },
      {
        "offset": 0.86,
        "transform": "translate(calc(var(--monster-attack-x)*.2),-120px) scale(.9)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-tail-sweep-double": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-12deg) scale(.96)"
      },
      {
        "offset": 0.39,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(168deg) scale(1.13)"
      },
      {
        "offset": 0.48,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(158deg) scale(1.04)"
      },
      {
        "offset": 0.73,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(348deg) scale(1.16)"
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--monster-attack-x)*.35),calc(var(--monster-attack-y)*.28)) rotate(360deg) scale(1.03)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg) scale(1)"
      }
    ],
    "monster-motion-rathalos-flame-sweep": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translateY(-34px) rotate(-6deg) scale(.96)"
      },
      {
        "offset": 0.28,
        "transform": "translateX(calc(var(--monster-lane-x)*-.28)) translateY(-52px) rotate(-12deg) scale(1.08)",
        "filter": "brightness(1.45)"
      },
      {
        "offset": 0.48,
        "transform": "translateX(calc(var(--monster-lane-x)*.3)) translateY(-48px) rotate(12deg) scale(1.14)",
        "filter": "brightness(1.55) drop-shadow(0 0 24px #ff6a24)"
      },
      {
        "offset": 0.68,
        "transform": "translateX(calc(var(--monster-lane-x)*-.18)) translateY(-42px) rotate(-8deg) scale(1.1)"
      },
      {
        "offset": 0.84,
        "transform": "translateY(-25px) scale(1.03)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-stomp": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--monster-attack-x)*.12),-185px) rotate(7deg) scale(.78)"
      },
      {
        "offset": 0.48,
        "transform": "translate(calc(var(--monster-attack-x)*.5),-220px) rotate(-5deg) scale(.84)"
      },
      {
        "offset": 0.7,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(4deg) scale(1.28,.82)",
        "filter": "brightness(1.5) drop-shadow(0 24px 12px #0009)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--monster-attack-x)*.65),calc(var(--monster-attack-y)*.45)) scale(1.06)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathalos-glide": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.16,
        "transform": "translate(calc(var(--monster-attack-x)*-.2),-225px) rotate(-12deg) scale(.73)"
      },
      {
        "offset": 0.43,
        "transform": "translate(calc(var(--monster-attack-x)*.55),calc(var(--monster-attack-y)*.42)) rotate(8deg) scale(1.04)"
      },
      {
        "offset": 0.64,
        "transform": "translate(calc(var(--monster-attack-x)*1.18),calc(var(--monster-attack-y) + 540px)) rotate(-6deg) scale(1.42)",
        "opacity": 1
      },
      {
        "offset": 0.65,
        "opacity": 0
      },
      {
        "offset": 0.75,
        "transform": "translateY(-185px) scale(.78)",
        "opacity": 0
      },
      {
        "offset": 0.82,
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-rathian-triple-fireball": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translateY(13px) rotate(-4deg) scale(.95)"
      },
      {
        "offset": 0.28,
        "transform": "translate(-18px,-17px) rotate(5deg) scale(1.1)",
        "filter": "brightness(1.42) drop-shadow(0 0 17px #ff7030)"
      },
      {
        "offset": 0.35,
        "transform": "translateY(7px) rotate(-2deg) scale(.98)"
      },
      {
        "offset": 0.43,
        "transform": "translate(17px,-16px) rotate(-5deg) scale(1.11)",
        "filter": "brightness(1.48) drop-shadow(0 0 18px #ff7030)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(7px) rotate(2deg) scale(.99)"
      },
      {
        "offset": 0.58,
        "transform": "translate(0,-21px) rotate(3deg) scale(1.13)",
        "filter": "brightness(1.55) drop-shadow(0 0 20px #ff7030)"
      },
      {
        "offset": 0.74,
        "transform": "translateY(4px) rotate(0deg) scale(1)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rathian-tail-sweep-double": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*.55),calc(var(--monster-attack-y)*.55)) rotate(0deg) scale(.98)"
      },
      {
        "offset": 0.22,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-8deg) scale(1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(-26deg) scale(.97)"
      },
      {
        "offset": 0.49,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(70deg) scale(1.08)"
      },
      {
        "offset": 0.57,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(180deg) scale(1.15)",
        "filter": "brightness(1.32) drop-shadow(0 0 16px #b6e06a66)"
      },
      {
        "offset": 0.63,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(200deg) scale(1.05)"
      },
      {
        "offset": 0.67,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(190deg) scale(1)"
      },
      {
        "offset": 0.74,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(270deg) scale(1.08)"
      },
      {
        "offset": 0.81,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(360deg) scale(1.15)",
        "filter": "brightness(1.32) drop-shadow(0 0 16px #b6e06a66)"
      },
      {
        "offset": 0.94,
        "transform": "translate(calc(var(--monster-attack-x)*.42),calc(var(--monster-attack-y)*.35)) rotate(360deg) scale(1.02)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg) scale(1)"
      }
    ],
    "monster-motion-rathian-somersault": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*.10),28px) rotate(0deg) scale(.96,1.05)"
      },
      {
        "offset": 0.36,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(0deg) scale(1.08)"
      },
      {
        "offset": 0.41,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 34px)) rotate(calc(-45deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.48,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(90deg*var(--monster-facing-flip,1))) scale(1.3)",
        "filter": "brightness(1.4) drop-shadow(0 -16px 20px #ff330088)"
      },
      {
        "offset": 0.62,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 140px)) rotate(calc(315deg*var(--monster-facing-flip,1))) scale(1.08)"
      },
      {
        "offset": 0.76,
        "transform": "translate(calc(var(--monster-attack-x)*.30),-70px) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(.93)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(1)"
      }
    ],
    "monster-motion-rathian-somersault-double": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.08,
        "transform": "translate(calc(var(--monster-attack-x)*.10),28px) rotate(0deg) scale(.96,1.05)"
      },
      {
        "offset": 0.2,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(0deg) scale(1.08)"
      },
      {
        "offset": 0.23,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 34px)) rotate(calc(-45deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.27,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(90deg*var(--monster-facing-flip,1))) scale(1.3)",
        "filter": "brightness(1.38) drop-shadow(0 -16px 20px #ff330088)"
      },
      {
        "offset": 0.38,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 135px)) rotate(calc(315deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.54,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(1.08)"
      },
      {
        "offset": 0.59,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 34px)) rotate(calc(315deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.66,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(450deg*var(--monster-facing-flip,1))) scale(1.35)",
        "filter": "brightness(1.45) drop-shadow(0 -16px 20px #ff330088)"
      },
      {
        "offset": 0.78,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 135px)) rotate(calc(675deg*var(--monster-facing-flip,1))) scale(1.08)"
      },
      {
        "offset": 0.9,
        "transform": "translate(calc(var(--monster-attack-x)*.25),-60px) rotate(calc(720deg*var(--monster-facing-flip,1))) scale(.94)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(calc(720deg*var(--monster-facing-flip,1))) scale(1)"
      }
    ],
    "monster-motion-rathian-bite-somersault": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*.50),calc(var(--monster-attack-y)*.48)) rotate(0deg) scale(1.08)"
      },
      {
        "offset": 0.24,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y)*.80)) rotate(0deg) scale(1.15)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 0.48,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(0deg) scale(1.08)"
      },
      {
        "offset": 0.56,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 34px)) rotate(calc(-45deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.65,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(90deg*var(--monster-facing-flip,1))) scale(1.3)",
        "filter": "brightness(1.4) drop-shadow(0 -16px 20px #ff330088)"
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 130px)) rotate(calc(315deg*var(--monster-facing-flip,1))) scale(1.05)"
      },
      {
        "offset": 0.84,
        "transform": "translate(calc(var(--monster-attack-x)*.25),-60px) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(.93)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(1)"
      }
    ],
    "monster-motion-rathian-somersault-glide": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translate(calc(var(--monster-attack-x)*.10),25px) rotate(0deg) scale(.96)",
        "opacity": 1
      },
      {
        "offset": 0.15,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(0deg) scale(1.08)",
        "opacity": 1
      },
      {
        "offset": 0.18,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 34px)) rotate(calc(-45deg*var(--monster-facing-flip,1))) scale(1.05)",
        "opacity": 1
      },
      {
        "offset": 0.22,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 40px)) rotate(calc(90deg*var(--monster-facing-flip,1))) scale(1.28)",
        "filter": "brightness(1.38)",
        "opacity": 1
      },
      {
        "offset": 0.3,
        "transform": "translate(var(--monster-attack-x),calc(var(--monster-attack-y) - 140px)) rotate(calc(315deg*var(--monster-facing-flip,1))) scale(1.0)",
        "opacity": 1
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--monster-glide-x)*.16),-225px) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(.76)",
        "opacity": 1
      },
      {
        "offset": 0.46,
        "transform": "translate(calc(var(--monster-glide-x)*.25 + 52px*var(--monster-facing-flip,1)),calc(var(--monster-glide-y)*.08 - 185px)) rotate(calc(360deg*var(--monster-facing-flip,1) + 4deg)) scale(.80)",
        "opacity": 1
      },
      {
        "offset": 0.52,
        "transform": "translate(calc(var(--monster-glide-x)*.34 + 105px*var(--monster-facing-flip,1)),calc(var(--monster-glide-y)*.18 - 145px)) rotate(calc(360deg*var(--monster-facing-flip,1) + 9deg)) scale(.84)",
        "opacity": 1
      },
      {
        "offset": 0.58,
        "transform": "translate(calc(var(--monster-glide-x)*.52 + 35px*var(--monster-facing-flip,1)),calc(var(--monster-glide-y)*.38 - 100px)) rotate(calc(360deg*var(--monster-facing-flip,1) + 1deg)) scale(.93)",
        "opacity": 1
      },
      {
        "offset": 0.63,
        "transform": "translate(calc(var(--monster-glide-x)*.70 - 80px*var(--monster-facing-flip,1)),calc(var(--monster-glide-y)*.58 - 55px)) rotate(calc(360deg*var(--monster-facing-flip,1) - 8deg)) scale(1.02)",
        "opacity": 1
      },
      {
        "offset": 0.67,
        "transform": "translate(calc(var(--monster-glide-x)*.86 - 30px*var(--monster-facing-flip,1)),calc(var(--monster-glide-y)*.80 - 22px)) rotate(calc(360deg*var(--monster-facing-flip,1) - 2deg)) scale(1.13)",
        "opacity": 1
      },
      {
        "offset": 0.72,
        "transform": "translate(var(--monster-glide-x),var(--monster-glide-y)) rotate(calc(360deg*var(--monster-facing-flip,1) + 3deg)) scale(1.23)",
        "filter": "brightness(1.28)",
        "opacity": 1
      },
      {
        "offset": 0.83,
        "transform": "translate(calc(var(--monster-glide-x)*1.22),calc(var(--monster-glide-y) + 520px)) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(1.42)",
        "opacity": 1
      },
      {
        "offset": 0.84,
        "opacity": 0
      },
      {
        "offset": 0.92,
        "transform": "translate(0,-190px) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(.78)",
        "opacity": 0
      },
      {
        "offset": 0.96,
        "transform": "translate(0,-95px) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(.88)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(calc(360deg*var(--monster-facing-flip,1))) scale(1)",
        "opacity": 1
      }
    ],
    "monster-motion-rathian-glide": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.12,
        "transform": "translate(calc(var(--monster-attack-x)*-.16),-155px) rotate(calc(-8deg*var(--monster-facing-flip,1))) scale(.78)",
        "opacity": 1
      },
      {
        "offset": 0.21,
        "transform": "translate(calc(var(--monster-attack-x)*.06 + 55px*var(--monster-facing-flip,1)),calc(var(--monster-attack-y)*.06 - 138px)) rotate(calc(4deg*var(--monster-facing-flip,1))) scale(.83)",
        "opacity": 1
      },
      {
        "offset": 0.31,
        "transform": "translate(calc(var(--monster-attack-x)*.28 + 115px*var(--monster-facing-flip,1)),calc(var(--monster-attack-y)*.14 - 115px)) rotate(calc(11deg*var(--monster-facing-flip,1))) scale(.88)",
        "opacity": 1
      },
      {
        "offset": 0.41,
        "transform": "translate(calc(var(--monster-attack-x)*.48 + 40px*var(--monster-facing-flip,1)),calc(var(--monster-attack-y)*.32 - 82px)) rotate(calc(2deg*var(--monster-facing-flip,1))) scale(.95)",
        "opacity": 1
      },
      {
        "offset": 0.51,
        "transform": "translate(calc(var(--monster-attack-x)*.66 - 85px*var(--monster-facing-flip,1)),calc(var(--monster-attack-y)*.54 - 48px)) rotate(calc(-10deg*var(--monster-facing-flip,1))) scale(1.02)",
        "opacity": 1
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--monster-attack-x)*.84 - 35px*var(--monster-facing-flip,1)),calc(var(--monster-attack-y)*.78 - 20px)) rotate(calc(-3deg*var(--monster-facing-flip,1))) scale(1.14)",
        "opacity": 1
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(calc(4deg*var(--monster-facing-flip,1))) scale(1.25)",
        "filter": "brightness(1.3)",
        "opacity": 1
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--monster-attack-x)*1.24),calc(var(--monster-attack-y) + 520px)) rotate(calc(-3deg*var(--monster-facing-flip,1))) scale(1.43)",
        "opacity": 1
      },
      {
        "offset": 0.83,
        "opacity": 0
      },
      {
        "offset": 0.91,
        "transform": "translate(0,-185px) scale(.78)",
        "opacity": 0
      },
      {
        "offset": 0.95,
        "transform": "translate(0,-90px) scale(.88)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-nargacuga-dash-bite": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "none"
      },
      {
        "offset": 0.22,
        "transform": "translate(calc(var(--narga-hit-x)*.06),22px) scale(1.10,.86)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--narga-hit-x)*.06),22px) scale(1.10,.86)"
      },
      {
        "offset": 0.36,
        "transform": "translate(calc(var(--narga-hit-x)*.30),calc(var(--narga-hit-y)*.24 - 70px)) scale(.86,1.22)"
      },
      {
        "offset": 0.56,
        "transform": "translate(calc(var(--narga-hit-x)*.72),calc(var(--narga-hit-y)*.62 - 46px)) scale(.90,1.18)"
      },
      {
        "offset": 0.688,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) scale(1.26,.82)",
        "filter": "brightness(1.42) drop-shadow(0 14px 16px #0009)"
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) scale(1.08,.96)"
      },
      {
        "offset": 0.84,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) scale(1.08,.96)"
      },
      {
        "offset": 0.9,
        "transform": "translate(calc(var(--narga-hit-x)*.35),-22px) scale(.90,1.16)"
      },
      {
        "offset": 0.96,
        "transform": "translate(0,0) scale(1.12,.88)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-nargacuga-tail-whip": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.1,
        "transform": "none"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--narga-whip-x)*.08),24px) rotate(0deg) scale(1.10,.86)"
      },
      {
        "offset": 0.24,
        "transform": "translate(calc(var(--narga-whip-x)*.08),24px) rotate(0deg) scale(1.10,.86)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--narga-whip-x)*.45),calc(var(--narga-whip-y)*.42 - 30px)) rotate(0deg) scale(.86,1.20)"
      },
      {
        "offset": 0.37,
        "transform": "translate(var(--narga-whip-x),var(--narga-whip-y)) rotate(0deg) scale(1.16,.88)"
      },
      {
        "offset": 0.47,
        "transform": "translate(var(--narga-whip-x),var(--narga-whip-y)) rotate(22deg) scale(1.04,.98)"
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--narga-whip-x),var(--narga-whip-y)) rotate(-175deg) scale(1)"
      },
      {
        "offset": 0.76,
        "transform": "translate(var(--narga-whip-x),var(--narga-whip-y)) rotate(-175deg) scale(1)"
      },
      {
        "offset": 0.91,
        "transform": "translate(calc(var(--narga-whip-x)*.45),-26px) rotate(0deg) scale(.88,1.18)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-nargacuga-pivot-spin": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.08,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--narga-hit-x)*.06),22px) rotate(0deg) scale(1.10,.86)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--narga-hit-x)*.06),22px) rotate(0deg) scale(1.10,.86)"
      },
      {
        "offset": 0.26,
        "transform": "translate(calc(var(--narga-hit-x)*.34),calc(var(--narga-hit-y)*.30 - 44px)) rotate(0deg) scale(.86,1.20)"
      },
      {
        "offset": 0.31,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.20,.84)"
      },
      {
        "offset": 0.354,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.6920000000000001,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-spin-dir)*375deg)) scale(1.06)",
        "filter": "brightness(1.42)"
      },
      {
        "offset": 0.78,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-spin-dir)*360deg)) scale(1)"
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--narga-hit-x)*.40),calc(var(--narga-hit-y)*.34)) rotate(calc(var(--narga-spin-dir)*360deg)) scale(1)"
      },
      {
        "offset": 0.95,
        "transform": "translate(calc(var(--narga-hit-x)*.12),-14px) rotate(calc(var(--narga-spin-dir)*360deg)) scale(.94,1.10)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(calc(var(--narga-spin-dir)*360deg)) scale(1)"
      }
    ],
    "monster-motion-nargacuga-twin-pivot-spin": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.05,
        "transform": "none"
      },
      {
        "offset": 0.1,
        "transform": "translate(calc(var(--narga-hit-x)*.10),24px) rotate(0deg) scale(1.12,.84)"
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--narga-hit-x)*.45),calc(var(--narga-hit-y)*.38 - 60px)) rotate(0deg) scale(.86,1.20)"
      },
      {
        "offset": 0.17,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.18,.84)"
      },
      {
        "offset": 0.209,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(-20deg) scale(1.06,.96)"
      },
      {
        "offset": 0.409,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(375deg) scale(1.06)",
        "filter": "brightness(1.44)"
      },
      {
        "offset": 0.46,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(360deg) scale(1)"
      },
      {
        "offset": 0.664,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(380deg) scale(1.10,.92)"
      },
      {
        "offset": 0.8640000000000001,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(-15deg) scale(1.06)",
        "filter": "brightness(1.48)"
      },
      {
        "offset": 0.91,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.96,
        "transform": "translate(calc(var(--narga-hit-x)*.35),-20px) rotate(0deg) scale(.90,1.16)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-nargacuga-turn-tail-slam": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.06,
        "transform": "none"
      },
      {
        "offset": 0.1,
        "transform": "translate(calc(var(--narga-hit-x)*.06),24px) rotate(var(--narga-aim-deg,0deg)) scale(1.10,.86)"
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--narga-hit-x)*.06),24px) rotate(var(--narga-aim-deg,0deg)) scale(1.10,.86)"
      },
      {
        "offset": 0.17,
        "transform": "translate(calc(var(--narga-hit-x)*.34),calc(var(--narga-hit-y)*.30 - 60px)) rotate(var(--narga-aim-deg,0deg)) scale(.86,1.20)"
      },
      {
        "offset": 0.21,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 30px)) rotate(var(--narga-aim-deg,0deg)) scale(1.20,.84)"
      },
      {
        "offset": 0.25,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(var(--narga-aim-deg,0deg)) scale(1)"
      },
      {
        "offset": 0.29,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(calc(var(--narga-aim-deg,0deg) + -7deg)) scale(1)"
      },
      {
        "offset": 0.33,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(calc(var(--narga-aim-deg,0deg) + 7deg)) scale(1)"
      },
      {
        "offset": 0.36,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 200px)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(.84,1.36)"
      },
      {
        "offset": 0.4,
        "transform": "translate(var(--narga-slam-x),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.10,1.52)",
        "filter": "brightness(1.48) drop-shadow(0 14px 20px #000a)"
      },
      {
        "offset": 0.945,
        "transform": "translate(var(--narga-slam-x),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.10,1.52)"
      },
      {
        "offset": 0.97,
        "transform": "translate(calc(var(--narga-hit-x)*.45),-16px) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.02,1.18)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-nargacuga-turn-tail-slam-double": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.04,
        "transform": "none"
      },
      {
        "offset": 0.07,
        "transform": "translate(calc(var(--narga-hit-x)*.06),24px) rotate(var(--narga-aim-deg,0deg)) scale(1.10,.86)"
      },
      {
        "offset": 0.1,
        "transform": "translate(calc(var(--narga-hit-x)*.34),calc(var(--narga-hit-y)*.30 - 60px)) rotate(var(--narga-aim-deg,0deg)) scale(.86,1.20)"
      },
      {
        "offset": 0.14,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 30px)) rotate(var(--narga-aim-deg,0deg)) scale(1.20,.84)"
      },
      {
        "offset": 0.17,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(var(--narga-aim-deg,0deg)) scale(1)"
      },
      {
        "offset": 0.21,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(calc(var(--narga-aim-deg,0deg) + -8deg)) scale(1)"
      },
      {
        "offset": 0.24,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 40px)) rotate(calc(var(--narga-aim-deg,0deg) + 8deg)) scale(1)"
      },
      {
        "offset": 0.28,
        "transform": "translate(var(--narga-hit-x),calc(var(--narga-hit-y) - 205px)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(.84,1.36)"
      },
      {
        "offset": 0.325,
        "transform": "translate(var(--narga-slam-x),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.10,1.52)",
        "filter": "brightness(1.48) drop-shadow(0 14px 20px #000a)"
      },
      {
        "offset": 0.36,
        "transform": "translate(var(--narga-slam-x),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.10,1.52)"
      },
      {
        "offset": 0.43,
        "transform": "translate(calc(var(--narga-slam-x) + var(--narga-slam-side)*130px),calc(var(--narga-slam-y) - 190px)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(.86,1.24)"
      },
      {
        "offset": 0.47,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-slam-side)*260px),calc(var(--narga-hit-y) - 40px)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.18,.86)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(var(--narga-slam-x) + var(--narga-slam-side)*260px),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.12,1.54)",
        "filter": "brightness(1.52) drop-shadow(0 14px 20px #000a)"
      },
      {
        "offset": 0.925,
        "transform": "translate(calc(var(--narga-slam-x) + var(--narga-slam-side)*260px),var(--narga-slam-y)) rotate(calc(var(--narga-aim-deg,0deg) + 180deg)) scale(1.12,1.54)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-nargacuga-flank-charge": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.06,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.1,
        "transform": "translate(0,26px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.14,
        "transform": "translate(0,-6px) rotate(0deg) scale(.92,1.12)",
        "opacity": 1,
        "easing": "cubic-bezier(.333,0,.667,.333)"
      },
      {
        "offset": 0.287,
        "transform": "translate(calc(var(--monster-charge-first-x)*0.1492),calc(var(--monster-charge-first-y)*0.1492)) rotate(0deg) scale(1.08,.94)",
        "opacity": 1
      },
      {
        "offset": 0.42,
        "transform": "translate(calc(var(--monster-charge-first-x)*0.4193),calc(var(--monster-charge-first-y)*0.4193)) rotate(0deg) scale(1.14,.92)",
        "opacity": 1
      },
      {
        "offset": 0.706,
        "transform": "translate(var(--monster-charge-first-x),var(--monster-charge-first-y)) rotate(0deg) scale(1.20,.88)",
        "filter": "brightness(1.45)",
        "opacity": 1
      },
      {
        "offset": 0.88,
        "transform": "translate(calc(var(--monster-charge-first-x)*1.3533),calc(var(--monster-charge-first-y)*1.3533)) rotate(0deg) scale(1.16,.90)",
        "opacity": 1
      },
      {
        "offset": 0.9,
        "transform": "translate(calc(var(--monster-charge-first-x)*1.3533),calc(var(--monster-charge-first-y)*1.3533)) rotate(0deg) scale(1.16,.90)",
        "opacity": 0
      },
      {
        "offset": 0.95,
        "transform": "translate(0,-34px) rotate(0deg) scale(.90,1.16)",
        "opacity": 0.5
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "nargacuga-charge-stride-flip": [
      {
        "offset": 0,
        "transform": "scaleX(1) translateY(1px)"
      },
      {
        "offset": 0.4999,
        "transform": "scaleX(1) translateY(1px)"
      },
      {
        "offset": 0.5,
        "transform": "scaleX(-1) translateY(-2px)"
      },
      {
        "offset": 1,
        "transform": "scaleX(-1) translateY(-2px)"
      }
    ],
    "monster-motion-nargacuga-offscreen-charge": [
      {
        "offset": 0.04,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.11,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--narga-exit-x,-620px)*.45),-60px) rotate(0deg) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.165,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 1
      },
      {
        "offset": 0.185,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 0
      },
      {
        "offset": 0.319,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.33899999999999997,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.354,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.429,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.5) drop-shadow(0 0 18px #9b6ad977)",
        "opacity": 1
      },
      {
        "offset": 0.449,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.469,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.499,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.524,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 0.6,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.64,
        "transform": "translate(0,30px) rotate(0deg) scale(1.16,.80)",
        "opacity": 1
      },
      {
        "offset": 0.66,
        "transform": "translate(0,30px) rotate(0deg) scale(1.16,.80)",
        "opacity": 1
      },
      {
        "offset": 0.72,
        "transform": "translate(calc(var(--narga-hit-x)*.45),-330px) rotate(0deg) scale(.82,1.24)",
        "opacity": 1
      },
      {
        "offset": 0.79,
        "transform": "translate(calc(var(--narga-hit-x)*.85),calc(var(--narga-hit-y)*.30 - 300px)) rotate(0deg) scale(.86,1.18)",
        "opacity": 1
      },
      {
        "offset": 0.857,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.30,.78)",
        "filter": "brightness(1.55) drop-shadow(0 18px 22px #000a)",
        "opacity": 1
      },
      {
        "offset": 0.9,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.94,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.97,
        "transform": "translate(calc(var(--narga-hit-x)*.35),-26px) rotate(0deg) scale(.92,1.10)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-nargacuga-leap-ambush": [
      {
        "offset": 0.01,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.1,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.17,
        "transform": "translate(0,26px) rotate(0deg) scale(1.12,.84)",
        "opacity": 1
      },
      {
        "offset": 0.23,
        "transform": "translate(0,26px) rotate(0deg) scale(1.12,.84)",
        "opacity": 1
      },
      {
        "offset": 0.27,
        "transform": "translate(calc(var(--narga-exit-x,-620px)*.45),-60px) rotate(0deg) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.36,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 0
      },
      {
        "offset": 0.53,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.61,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.6920000000000001,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.5)",
        "opacity": 1
      },
      {
        "offset": 0.75,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.8,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.92,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-nargacuga-leap-ambush-triple": [
      {
        "offset": 0.04,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.11,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.14,
        "transform": "translate(calc(var(--narga-exit-x,-620px)*.45),-60px) rotate(0deg) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.165,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 1
      },
      {
        "offset": 0.185,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 0
      },
      {
        "offset": 0.223,
        "transform": "translate(calc(var(--narga-hit1-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit1-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.243,
        "transform": "translate(calc(var(--narga-hit1-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit1-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.258,
        "transform": "translate(calc(var(--narga-hit1-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit1-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.33299999999999996,
        "transform": "translate(var(--narga-hit1-x),var(--narga-hit1-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.5) drop-shadow(0 0 18px #9b6ad977)",
        "opacity": 1
      },
      {
        "offset": 0.353,
        "transform": "translate(var(--narga-hit1-x),var(--narga-hit1-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.373,
        "transform": "translate(var(--narga-hit1-x),var(--narga-hit1-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.40299999999999997,
        "transform": "translate(calc(var(--narga-hit1-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit1-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.428,
        "transform": "translate(calc(var(--narga-hit1-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit1-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 0.466,
        "transform": "translate(calc(var(--narga-hit2-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit2-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.486,
        "transform": "translate(calc(var(--narga-hit2-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit2-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.501,
        "transform": "translate(calc(var(--narga-hit2-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit2-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.5760000000000001,
        "transform": "translate(var(--narga-hit2-x),var(--narga-hit2-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.5) drop-shadow(0 0 18px #9b6ad977)",
        "opacity": 1
      },
      {
        "offset": 0.596,
        "transform": "translate(var(--narga-hit2-x),var(--narga-hit2-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.616,
        "transform": "translate(var(--narga-hit2-x),var(--narga-hit2-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.6459999999999999,
        "transform": "translate(calc(var(--narga-hit2-x) - calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-out)),calc(var(--narga-hit2-y) + var(--narga-ambush-out))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.6709999999999999,
        "transform": "translate(calc(var(--narga-hit2-x) - calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-out)),calc(var(--narga-hit2-y) + var(--narga-ambush-out))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 0.708,
        "transform": "translate(calc(var(--narga-hit3-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit3-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.728,
        "transform": "translate(calc(var(--narga-hit3-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit3-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.743,
        "transform": "translate(calc(var(--narga-hit3-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit3-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.818,
        "transform": "translate(var(--narga-hit3-x),var(--narga-hit3-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.5) drop-shadow(0 0 18px #9b6ad977)",
        "opacity": 1
      },
      {
        "offset": 0.838,
        "transform": "translate(var(--narga-hit3-x),var(--narga-hit3-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.858,
        "transform": "translate(var(--narga-hit3-x),var(--narga-hit3-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.888,
        "transform": "translate(calc(var(--narga-hit3-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit3-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.9129999999999999,
        "transform": "translate(calc(var(--narga-hit3-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit3-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-nargacuga-bite-spin-return": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.06,
        "transform": "none"
      },
      {
        "offset": 0.13,
        "transform": "translate(calc(var(--narga-hit-x)*.06),26px) rotate(0deg) scale(1.12,.84)"
      },
      {
        "offset": 0.19,
        "transform": "translate(calc(var(--narga-hit-x)*.06),26px) rotate(0deg) scale(1.12,.84)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(var(--narga-hit-x)*.50),calc(var(--narga-hit-y)*.34 - 210px)) rotate(0deg) scale(.84,1.24)"
      },
      {
        "offset": 0.36,
        "transform": "translate(calc(var(--narga-hit-x)*.82),calc(var(--narga-hit-y)*.72 - 90px)) rotate(0deg) scale(.90,1.18)"
      },
      {
        "offset": 0.444,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.28,.80)",
        "filter": "brightness(1.44) drop-shadow(0 16px 18px #000a)"
      },
      {
        "offset": 0.52,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.06,.98)"
      },
      {
        "offset": 0.716,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.95,
        "transform": "translate(0,-16px) rotate(360deg) scale(.94,1.10)"
      },
      {
        "offset": 1,
        "transform": "translate(0,0) rotate(360deg) scale(1)"
      },
      {
        "offset": 4.22,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(180deg) scale(1.12,.92)",
        "filter": "brightness(1.38)"
      }
    ],
    "monster-motion-nargacuga-lunge-finish": [
      {
        "offset": 0.03,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.06,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.085,
        "transform": "translate(0,28px) rotate(0deg) scale(1.14,.82)",
        "opacity": 1
      },
      {
        "offset": 0.11,
        "transform": "translate(calc(var(--narga-exit-x,-620px)*.45),-60px) rotate(0deg) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.13,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 1
      },
      {
        "offset": 0.15,
        "transform": "translate(var(--narga-exit-x,-620px),-70px) rotate(0deg) scale(.86,1.14)",
        "opacity": 0
      },
      {
        "offset": 0.196,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.21600000000000003,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.231,
        "transform": "translate(calc(var(--narga-hit-x) + var(--narga-ambush-side)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.306,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.48)",
        "opacity": 1
      },
      {
        "offset": 0.326,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.34600000000000003,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(var(--narga-ambush-side)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.376,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.401,
        "transform": "translate(calc(var(--narga-hit-x) - var(--narga-ambush-side)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(var(--narga-ambush-side)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 0.446,
        "transform": "translate(calc(var(--narga-hit-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.466,
        "transform": "translate(calc(var(--narga-hit-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.48100000000000004,
        "transform": "translate(calc(var(--narga-hit-x) + calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-off)),calc(var(--narga-hit-y) + var(--narga-ambush-off))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.12,.86)",
        "opacity": 1
      },
      {
        "offset": 0.556,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.22,.84)",
        "filter": "brightness(1.48)",
        "opacity": 1
      },
      {
        "offset": 0.5760000000000001,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.596,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.626,
        "transform": "translate(calc(var(--narga-hit-x) - calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(.88,1.16)",
        "opacity": 1
      },
      {
        "offset": 0.6509999999999999,
        "transform": "translate(calc(var(--narga-hit-x) - calc(var(--narga-ambush-side)*-1)*var(--narga-ambush-out)),calc(var(--narga-hit-y) + var(--narga-ambush-out))) rotate(calc(calc(var(--narga-ambush-side)*-1)*135deg)) scale(.88,1.16)",
        "opacity": 0
      },
      {
        "offset": 0.72,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.75,
        "transform": "translate(0,30px) rotate(0deg) scale(1.16,.80)",
        "opacity": 1
      },
      {
        "offset": 0.77,
        "transform": "translate(0,30px) rotate(0deg) scale(1.16,.80)",
        "opacity": 1
      },
      {
        "offset": 0.81,
        "transform": "translate(calc(var(--narga-hit-x)*.45),-330px) rotate(0deg) scale(.82,1.24)",
        "opacity": 1
      },
      {
        "offset": 0.835,
        "transform": "translate(calc(var(--narga-hit-x)*.85),calc(var(--narga-hit-y)*.30 - 300px)) rotate(0deg) scale(.86,1.18)",
        "opacity": 1
      },
      {
        "offset": 0.861,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.30,.78)",
        "filter": "brightness(1.55) drop-shadow(0 18px 22px #000a)",
        "opacity": 1
      },
      {
        "offset": 0.9,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.93,
        "transform": "translate(var(--narga-hit-x),var(--narga-hit-y)) rotate(0deg) scale(1.06,.98)",
        "opacity": 1
      },
      {
        "offset": 0.97,
        "transform": "translate(calc(var(--narga-hit-x)*.35),-26px) rotate(0deg) scale(.92,1.10)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-nargacuga-stance-hop": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.07,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.17,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*-1.0),-240px) scale(.84,1.24)",
        "opacity": 1
      },
      {
        "offset": 0.21,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*-2.6),-430px) scale(.52)",
        "opacity": 0
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*1.1),-150px) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.41,
        "transform": "translate(0,0) scale(1.20,.84)",
        "opacity": 1
      },
      {
        "offset": 0.47,
        "transform": "translate(0,0) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.52,
        "transform": "translate(0,0) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.61,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*-2.6),-440px) scale(.52)",
        "opacity": 0
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*2.6),-440px) scale(.52)",
        "opacity": 0
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(var(--monster-lane-x,120px)*var(--narga-hop-dir,1)*1.1),-155px) scale(.86,1.20)",
        "opacity": 1
      },
      {
        "offset": 0.8,
        "transform": "translate(0,0) scale(1.22,.82)",
        "opacity": 1
      },
      {
        "offset": 0.88,
        "transform": "translate(0,0) scale(1)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-motion-rath-flight-stagger": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.1,
        "transform": "translateY(-24px) rotate(-6deg)"
      },
      {
        "offset": 0.22,
        "transform": "translateY(10px) rotate(7deg) scale(1.03,.94)"
      },
      {
        "offset": 0.36,
        "transform": "translate(-14px,20px) rotate(-8deg) scale(.98,.90)"
      },
      {
        "offset": 0.52,
        "transform": "translate(13px,22px) rotate(7deg) scale(.97,.89)"
      },
      {
        "offset": 0.7,
        "transform": "translate(-8px,18px) rotate(-5deg) scale(.98,.91)"
      },
      {
        "offset": 0.88,
        "transform": "translateY(8px) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-motion-rath-flight-wobble": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.14,
        "transform": "translate(-18px,-120px) rotate(-9deg) scale(.88)"
      },
      {
        "offset": 0.3,
        "transform": "translate(20px,-138px) rotate(11deg) scale(.86)"
      },
      {
        "offset": 0.48,
        "transform": "translate(-23px,-116px) rotate(-12deg) scale(.89)"
      },
      {
        "offset": 0.66,
        "transform": "translate(18px,-90px) rotate(10deg) scale(.92)"
      },
      {
        "offset": 0.84,
        "transform": "translate(-8px,-42px) rotate(-5deg) scale(.96)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-breath-fizzle": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-20%) scale(.35)"
      },
      {
        "offset": 0.2,
        "opacity": 0.85,
        "transform": "translate(-50%,-50%) scale(.85)"
      },
      {
        "offset": 0.55,
        "opacity": 0.72,
        "transform": "translate(-62%,-82%) scale(1.25) rotate(-8deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-78%,-135%) scale(1.75) rotate(9deg)",
        "filter": "blur(4px)"
      }
    ],
    "barioth-ice-tornado": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-42%) scale(.22,.45)"
      },
      {
        "offset": 0.12,
        "opacity": 1,
        "transform": "translate(-50%,-52%) scale(.82,1.08)"
      },
      {
        "offset": 0.38,
        "opacity": 0.96,
        "transform": "translate(-50%,-58%) scale(1.05,1.20)"
      },
      {
        "offset": 0.76,
        "opacity": 0.72,
        "transform": "translate(-50%,-64%) scale(.92,1.32)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-88%) scale(.45,1.55)"
      }
    ],
    "barioth-spring-leap": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.09,
        "transform": "translateY(8px) scale(1.03,.94)"
      },
      {
        "offset": 0.17,
        "transform": "translateY(32px) scale(1.18,.72)"
      },
      {
        "offset": 0.22,
        "transform": "translateY(32px) scale(1.18,.72)"
      },
      {
        "offset": 0.31,
        "transform": "translate(0,-285px) rotate(-7deg) scale(.84,1.22)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--monster-attack-x)*.62),calc(var(--monster-attack-y)*.24 - 310px)) rotate(5deg) scale(.94,1.10)"
      },
      {
        "offset": 0.68,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(8deg) scale(1.28,.74)",
        "filter": "brightness(1.35) drop-shadow(0 24px 12px #0009)"
      },
      {
        "offset": 0.79,
        "transform": "translate(var(--monster-attack-x),var(--monster-attack-y)) rotate(3deg) scale(1.08,.92)"
      },
      {
        "offset": 0.89,
        "transform": "translate(calc(var(--monster-attack-x)*.5),calc(var(--monster-attack-y)*.45))"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "barioth-glide-circle-land": [
      {
        "offset": 0,
        "transform": "none"
      },
      {
        "offset": 0.08,
        "transform": "translateY(24px) scale(1.10,.82)"
      },
      {
        "offset": 0.16,
        "transform": "translate(0,-92px) rotate(-78deg) scale(.78,1.16)"
      },
      {
        "offset": 0.31,
        "transform": "translate(calc(var(--monster-attack-x)*.30),calc(var(--monster-attack-y)*.12 - 170px)) rotate(-84deg) scale(.72,1.22)"
      },
      {
        "offset": 0.48,
        "transform": "translate(calc(var(--monster-attack-x)*.62),calc(var(--monster-attack-y)*.34 - 150px)) rotate(-82deg) scale(.78,1.18)"
      },
      {
        "offset": 0.58,
        "transform": "translate(calc(var(--monster-attack-x)*.82),calc(var(--monster-attack-y)*.60 - 130px)) rotate(-78deg) scale(.90,1.08)"
      },
      {
        "offset": 0.66,
        "transform": "translate(calc(var(--monster-attack-x)*.94 + 55px),calc(var(--monster-attack-y)*.72 - 170px)) rotate(-18deg) scale(1.03,.96)"
      },
      {
        "offset": 0.74,
        "transform": "translate(calc(var(--monster-attack-x) + 125px),calc(var(--monster-attack-y)*.78 - 210px)) rotate(46deg) scale(1.12,.88)",
        "filter": "brightness(1.35) drop-shadow(0 18px 15px #000a)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--monster-attack-x) + 215px),calc(var(--monster-attack-y)*.80 - 240px)) rotate(102deg) scale(1.16,.84)"
      },
      {
        "offset": 0.91,
        "transform": "translate(calc(var(--monster-attack-x) + 245px),calc(var(--monster-attack-y)*.80 - 240px)) rotate(102deg) scale(1.02,.98)"
      },
      {
        "offset": 0.998,
        "transform": "translate(calc(var(--monster-attack-x) + 245px),calc(var(--monster-attack-y)*.80 - 240px)) rotate(102deg) scale(1.02,.98)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "monster-flight-stagger-fx": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.6)"
      },
      {
        "offset": 0.12,
        "opacity": 0.78,
        "transform": "translate(-50%,-50%) scale(1)"
      },
      {
        "offset": 0.28,
        "opacity": 0.62,
        "transform": "translate(-62%,-62%) rotate(-12deg) scale(1.1)"
      },
      {
        "offset": 0.46,
        "opacity": 0.68,
        "transform": "translate(-38%,-48%) rotate(11deg) scale(1.16)"
      },
      {
        "offset": 0.66,
        "opacity": 0.58,
        "transform": "translate(-57%,-58%) rotate(-8deg) scale(1.12)"
      },
      {
        "offset": 0.84,
        "opacity": 0.42,
        "transform": "translate(-44%,-42%) rotate(5deg) scale(1.05)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.6)"
      }
    ],
    "monster-motion-aerial-charge-cross": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translate(var(--monster-charge-start-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(.92)",
        "opacity": 0
      },
      {
        "offset": 0.1,
        "transform": "translate(var(--monster-charge-start-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(.92)",
        "opacity": 1
      },
      {
        "offset": 0.82,
        "transform": "translate(var(--monster-charge-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(1.12)",
        "opacity": 1
      },
      {
        "offset": 0.84,
        "transform": "translate(var(--monster-charge-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(1.12)",
        "opacity": 0
      },
      {
        "offset": 0.94,
        "transform": "none",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "monster-gas-cloud": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(var(--gas-start-x),var(--gas-start-y)) scale(.25) rotate(-12deg)"
      },
      {
        "offset": 0.24,
        "opacity": 0.78
      },
      {
        "offset": 0.72,
        "opacity": 0.64,
        "transform": "translate(var(--gas-x),var(--gas-y)) scale(1.08) rotate(9deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(var(--gas-x),var(--gas-y)) scale(1.42) rotate(18deg)"
      }
    ],
    "hunter-blight-sleep": [
      {
        "offset": 0,
        "transform": "translate(-3px,4px) scale(.85)",
        "opacity": 0.55
      },
      {
        "offset": 0.5,
        "transform": "translate(6px,-8px) scale(1.15)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(-3px,4px) scale(.85)",
        "opacity": 0.55
      }
    ],
    "hunter-blight-pulse": [
      {
        "offset": 0,
        "transform": "scale(.88)"
      },
      {
        "offset": 1,
        "transform": "scale(1.08)"
      }
    ],
    "hunter-blight-fire": [
      {
        "offset": 0,
        "transform": "translateY(5px) scale(.9)"
      },
      {
        "offset": 1,
        "transform": "translateY(-5px) scale(1.12)"
      }
    ],
    "hunter-blight-dragon": [
      {
        "offset": 0,
        "transform": "rotate(-7deg) scale(.9)"
      },
      {
        "offset": 1,
        "transform": "rotate(7deg) scale(1.08)"
      }
    ],
    "monster-motion-legiana-drill-cross": [
      {
        "offset": 0,
        "transform": "none",
        "opacity": 1
      },
      {
        "offset": 0.08,
        "transform": "translate(var(--monster-charge-start-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(.90)",
        "opacity": 0
      },
      {
        "offset": 0.1,
        "transform": "translate(var(--monster-charge-start-side),var(--monster-charge-cross-y)) rotate(var(--monster-charge-tilt)) scale(.90)",
        "opacity": 1
      },
      {
        "offset": 0.82,
        "transform": "translate(var(--monster-charge-side),var(--monster-charge-cross-y)) rotate(calc(var(--monster-charge-tilt) + 1080deg)) scale(1.12)",
        "opacity": 1,
        "filter": "brightness(1.34) drop-shadow(0 0 22px #bdefff)"
      },
      {
        "offset": 0.84,
        "transform": "translate(var(--monster-charge-side),var(--monster-charge-cross-y)) rotate(calc(var(--monster-charge-tilt) + 1080deg)) scale(1.12)",
        "opacity": 0
      },
      {
        "offset": 0.94,
        "transform": "none",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "none",
        "opacity": 1
      }
    ],
    "legiana-ice-charge": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-45%) scale(.45)"
      },
      {
        "offset": 0.3,
        "opacity": 0.94,
        "transform": "translate(-50%,-50%) scale(.82)"
      },
      {
        "offset": 0.72,
        "opacity": 0.78,
        "transform": "translate(-50%,-54%) scale(1.05)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-62%) scale(1.22)"
      }
    ],
    "legiana-rage-ice-release": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-48%) scale(.62) rotate(-5deg)"
      },
      {
        "offset": 0.24,
        "opacity": 0.58,
        "transform": "translate(-50%,-50%) scale(.88) rotate(0)"
      },
      {
        "offset": 0.6,
        "opacity": 0.42,
        "transform": "translate(-50%,-53%) scale(1.02) rotate(3deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-60%) scale(1.16) rotate(7deg)"
      }
    ],
    "legiana-rage-claw-ice": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.5) rotate(-12deg)"
      },
      {
        "offset": 0.24,
        "opacity": 0.82,
        "transform": "translate(-50%,-50%) scale(.86) rotate(-4deg)"
      },
      {
        "offset": 0.68,
        "opacity": 0.64,
        "transform": "translate(-48%,-58%) scale(1.08) rotate(5deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-42%,-76%) scale(1.34) rotate(12deg)"
      }
    ],
    "legiana-rage-tail-ice": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.48) rotate(-18deg)"
      },
      {
        "offset": 0.22,
        "opacity": 0.78,
        "transform": "translate(-50%,-50%) scale(.9) rotate(-8deg)"
      },
      {
        "offset": 0.68,
        "opacity": 0.6,
        "transform": "translate(-54%,-52%) scale(1.16) rotate(9deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-68%,-58%) scale(1.48) rotate(22deg)"
      }
    ],
    "environment-label-pop": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.3)"
      },
      {
        "offset": 0.18,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1)"
      },
      {
        "offset": 0.7,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) translateY(-24px)"
      }
    ],
    "pitfall-open": [
      {
        "offset": 0,
        "transform": "translateX(-50%) scale(.05)",
        "opacity": 0
      },
      {
        "offset": 0.18,
        "transform": "translateX(-50%) scale(1)",
        "opacity": 1
      },
      {
        "offset": 0.82,
        "transform": "translateX(-50%) scale(1)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translateX(-50%) scale(.75)",
        "opacity": 0
      }
    ],
    "pitfall-open-held": [
      {
        "offset": 0,
        "transform": "translateX(-50%) scale(.05)",
        "opacity": 0
      },
      {
        "offset": 1,
        "transform": "translateX(-50%) scale(1)",
        "opacity": 1
      }
    ],
    "pitfall-net-held": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.15) rotate(-18deg)"
      },
      {
        "offset": 1,
        "opacity": 0.9,
        "transform": "translateX(-50%) scale(1) rotate(0)"
      }
    ],
    "hunt-trap-atb-pulse": [
      {
        "offset": 0,
        "opacity": 0.58,
        "filter": "brightness(.9)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "filter": "brightness(1.3)"
      }
    ],
    "pitfall-crack-burst": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.2)"
      },
      {
        "offset": 0.22,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) scale(1.2)"
      }
    ],
    "pitfall-net-catch": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.15) rotate(-18deg)"
      },
      {
        "offset": 0.22,
        "opacity": 0.9,
        "transform": "translateX(-50%) scale(1) rotate(0)"
      },
      {
        "offset": 0.75,
        "opacity": 0.9,
        "transform": "translateX(-50%) scale(1) rotate(0)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.7)"
      }
    ],
    "pitfall-dirt-fly": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(0,0) scale(.4)"
      },
      {
        "offset": 0.18,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(var(--angle)) translateX(175px) translateY(-100px) rotate(240deg)"
      }
    ],
    "rockfall-warning": [
      {
        "offset": 0,
        "opacity": 0.25,
        "transform": "translateX(-50%) scale(.8)"
      },
      {
        "offset": 0.5,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1.15)"
      },
      {
        "offset": 1,
        "opacity": 0.25,
        "transform": "translateX(-50%) scale(.8)"
      }
    ],
    "rockfall-drop": [
      {
        "offset": 0,
        "transform": "translateY(0) rotate(-35deg)",
        "opacity": 0
      },
      {
        "offset": 0.12,
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translateY(510px) rotate(170deg)",
        "opacity": 1
      }
    ],
    "rockfall-impact-ring": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translateX(-50%) scale(.1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) scale(6)"
      }
    ],
    "rockfall-debris-burst": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translate(0,0) rotate(calc(var(--i) * 27deg))"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(calc(var(--i) * 27deg)) translateX(230px) translateY(-120px) rotate(280deg)"
      }
    ],
    "monster-pitfall-caught": [
      {
        "offset": 0,
        "transform": "translateY(0) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translateY(35px) scaleY(.78)"
      },
      {
        "offset": 0.35,
        "transform": "translateY(92px) scaleY(.58)"
      },
      {
        "offset": 0.82,
        "transform": "translateY(92px) scaleY(.58)"
      },
      {
        "offset": 1,
        "transform": "translateY(50px) scaleY(.72)"
      }
    ],
    "monster-pitfall-struggle": [
      {
        "offset": 0,
        "transform": "translateY(50px) rotate(-2deg) scale(1,.72)"
      },
      {
        "offset": 0.18,
        "transform": "translate(-12px,44px) rotate(-7deg) scale(1,.76)"
      },
      {
        "offset": 0.44,
        "transform": "translate(15px,27px) rotate(8deg) scale(1.01,.84)"
      },
      {
        "offset": 0.61,
        "transform": "translate(-10px,23px) rotate(-8deg) scale(1.01,.86)"
      },
      {
        "offset": 0.75,
        "transform": "translate(11px,32px) rotate(6deg) scale(1,.81)"
      },
      {
        "offset": 0.87,
        "transform": "translate(0,59px) rotate(-3deg) scale(.99,.65)"
      },
      {
        "offset": 1,
        "transform": "translateY(50px) rotate(-1deg) scale(1,.72)"
      }
    ],
    "monster-pitfall-release": [
      {
        "offset": 0,
        "transform": "translateY(50px) rotate(-2deg) scale(1,.72)"
      },
      {
        "offset": 0.25,
        "transform": "translate(-7px,44px) rotate(-5deg) scale(1,.76)"
      },
      {
        "offset": 0.55,
        "transform": "translate(7px,31px) rotate(5deg) scale(1.01,.84)"
      },
      {
        "offset": 0.78,
        "transform": "translateY(13px) rotate(-2deg) scale(1.01,.95)"
      },
      {
        "offset": 0.9,
        "transform": "translateY(-8px) rotate(1deg) scale(1,1.04)"
      },
      {
        "offset": 1,
        "transform": "none"
      }
    ],
    "pitfall-close": [
      {
        "offset": 0,
        "opacity": 1
      },
      {
        "offset": 0.58,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) scale(.18)"
      }
    ],
    "pitfall-release-fade": [
      {
        "offset": 0,
        "opacity": 1
      },
      {
        "offset": 0.58,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-rockfall-hit": [
      {
        "offset": 0,
        "transform": "translateY(0) rotate(0)"
      },
      {
        "offset": 0.38,
        "transform": "translateY(0) rotate(0)"
      },
      {
        "offset": 0.44,
        "transform": "translateY(28px) rotate(-9deg) scale(.93)"
      },
      {
        "offset": 0.51,
        "transform": "translateY(10px) rotate(7deg)"
      },
      {
        "offset": 0.6,
        "transform": "translateY(58px) rotate(90deg) scale(.9)"
      },
      {
        "offset": 1,
        "transform": "translateY(58px) rotate(90deg) scale(.9)"
      }
    ],
    "hunt-rockfall-screen-shake": [
      {
        "offset": 0,
        "transform": "translate(0)"
      },
      {
        "offset": 0.15,
        "transform": "translate(-13px,7px)"
      },
      {
        "offset": 0.32,
        "transform": "translate(11px,-8px)"
      },
      {
        "offset": 0.48,
        "transform": "translate(-8px,5px)"
      },
      {
        "offset": 0.65,
        "transform": "translate(6px,-3px)"
      },
      {
        "offset": 0.82,
        "transform": "translate(-3px,2px)"
      },
      {
        "offset": 1,
        "transform": "translate(0)"
      }
    ],
    "monster-ultimate-vignette": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.12,
        "opacity": 1
      },
      {
        "offset": 0.82,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-ultimate-flash": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.2,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-ultimate-title": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateX(-50%) scale(1.5)"
      },
      {
        "offset": 0.14,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1)"
      },
      {
        "offset": 0.68,
        "opacity": 1,
        "transform": "translateX(-50%) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateX(-50%) translateY(-22px) scale(.96)"
      }
    ],
    "monster-ultimate-core": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.1)"
      },
      {
        "offset": 0.24,
        "opacity": 1,
        "transform": "translate(-50%,-50%) scale(1.1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(2.5)"
      }
    ],
    "monster-ultimate-ring": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "scale(.15)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(7)"
      }
    ],
    "monster-ultimate-ring-b": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "scale(.15) rotate(0)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(6) rotate(180deg)"
      }
    ],
    "monster-ultimate-shockwave": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "scale(.2)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(15)"
      }
    ],
    "monster-ultimate-shard": [
      {
        "offset": 0,
        "opacity": 1,
        "transform": "translate(-50%,-50%) rotate(var(--shard-angle)) translateX(35px) scale(.4)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%,-50%) rotate(var(--shard-angle)) translateX(780px) scale(1.4)"
      }
    ],
    "monster-signature-ultimate": [
      {
        "offset": 0,
        "transform": "scale(1)"
      },
      {
        "offset": 0.22,
        "transform": "scale(.72) translateY(-35px)",
        "filter": "brightness(.35)"
      },
      {
        "offset": 0.46,
        "transform": "scale(1.35) translateY(50px)",
        "filter": "brightness(2.2) drop-shadow(0 0 30px var(--fx-color,#ffb020))"
      },
      {
        "offset": 1,
        "transform": "scale(1)",
        "filter": "none"
      }
    ],
    "monster-ultimate-board-shake": [
      {
        "offset": 0,
        "transform": "translate(0)"
      },
      {
        "offset": 0.25,
        "transform": "translate(-8px,5px)"
      },
      {
        "offset": 0.5,
        "transform": "translate(7px,-5px)"
      },
      {
        "offset": 0.75,
        "transform": "translate(-5px,-3px)"
      },
      {
        "offset": 1,
        "transform": "translate(0)"
      }
    ],
    "monster-element-wash": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.18,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "monster-element-muzzle": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) scale(.05) rotate(-60deg)",
        "opacity": 0
      },
      {
        "offset": 0.24,
        "opacity": 1
      },
      {
        "offset": 0.58,
        "transform": "translate(-50%, -50%) scale(1.08) rotate(18deg)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(-50%, -50%) scale(1.55) rotate(55deg)",
        "opacity": 0
      }
    ],
    "monster-element-beam": [
      {
        "offset": 0,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(.02) scaleY(.2)",
        "opacity": 0
      },
      {
        "offset": 0.13,
        "opacity": 1
      },
      {
        "offset": 0.31,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1) scaleY(1.16)",
        "opacity": 1
      },
      {
        "offset": 0.72,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1) scaleY(.88)",
        "opacity": 0.94
      },
      {
        "offset": 1,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1.03) scaleY(.08)",
        "opacity": 0
      }
    ],
    "monster-element-projectile": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) scale(.1)"
      },
      {
        "offset": 0.14,
        "opacity": 1,
        "transform": "translate(-50%,-50%) scale(.82)"
      },
      {
        "offset": 0.78,
        "opacity": 1,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(1.18) rotate(280deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(.35) rotate(360deg)"
      }
    ],
    "monster-element-projectile-quill": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) rotate(calc(var(--fx-angle) - 90deg)) scale(.86)"
      },
      {
        "offset": 0.08,
        "opacity": 1,
        "transform": "translate(-50%,-50%) rotate(calc(var(--fx-angle) - 90deg)) scale(1)"
      },
      {
        "offset": 0.88,
        "opacity": 1,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) rotate(calc(var(--fx-angle) - 90deg)) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) rotate(calc(var(--fx-angle) - 90deg)) scale(.9)"
      }
    ],
    "monster-element-projectile-reduced": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(.72)"
      },
      {
        "offset": 0.2,
        "opacity": 1,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(1)"
      },
      {
        "offset": 0.78,
        "opacity": 1,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(calc(var(--fx-dx) - 50%),calc(var(--fx-dy) - 50%)) scale(.82)"
      }
    ],
    "monster-element-stream": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(.02) scaleY(.35)"
      },
      {
        "offset": 0.16,
        "opacity": 1,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(.28) scaleY(.7)"
      },
      {
        "offset": 0.42,
        "opacity": 1,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1) scaleY(1.08)"
      },
      {
        "offset": 0.72,
        "opacity": 1,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1) scaleY(1.08)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translateY(-50%) rotate(var(--fx-angle)) scaleX(1.04) scaleY(.42)"
      }
    ],
    "monster-element-current": [
      {
        "offset": 0
      },
      {
        "offset": 1
      }
    ],
    "monster-element-head": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) scale(.2)",
        "opacity": 0
      },
      {
        "offset": 0.18,
        "opacity": 1
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--fx-dx) - 50%), calc(var(--fx-dy) - 50%)) scale(1.05)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(calc(var(--fx-dx) - 50%), calc(var(--fx-dy) - 50%)) scale(1.65)",
        "opacity": 0
      }
    ],
    "monster-element-impact": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) scale(.05) rotate(-30deg)",
        "opacity": 0
      },
      {
        "offset": 0.16,
        "opacity": 1
      },
      {
        "offset": 0.42,
        "transform": "translate(-50%, -50%) scale(1.12) rotate(9deg)",
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(-50%, -50%) scale(1.7) rotate(28deg)",
        "opacity": 0,
        "filter": "blur(2px)"
      }
    ],
    "monster-element-particle": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) scale(.1)",
        "opacity": 0
      },
      {
        "offset": 0.2,
        "opacity": 1
      },
      {
        "offset": 1,
        "transform": "translate(calc(var(--p-x) - 50%), calc(var(--p-dy) + var(--p-y) - 50%)) rotate(260deg) scale(.2)",
        "opacity": 0
      }
    ],
    "victory-jump": [
      {
        "offset": 0,
        "transform": "translateY(0)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(-30px) scale(1.05)"
      },
      {
        "offset": 1,
        "transform": "translateY(0)"
      }
    ],
    "victory-bounce": [
      {
        "offset": 0,
        "transform": "translateY(0)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(-12px)"
      },
      {
        "offset": 1,
        "transform": "translateY(0)"
      }
    ],
    "stamp-press": [
      {
        "offset": 0,
        "transform": "scale(4) rotate(-15deg)",
        "opacity": 0,
        "filter": "brightness(3) blur(6px) drop-shadow(0 0 30px rgba(255, 60, 0, 1))"
      },
      {
        "offset": 0.8,
        "transform": "scale(0.92) rotate(2deg)",
        "opacity": 0.95
      },
      {
        "offset": 1,
        "transform": "scale(1) rotate(0deg)",
        "opacity": 1,
        "filter": "brightness(1.1) drop-shadow(0 0 20px rgba(255, 80, 0, 0.95))"
      }
    ],
    "monster-tailspin": [
      {
        "offset": 0,
        "transform": "rotate(0deg) scale(1)"
      },
      {
        "offset": 0.5,
        "transform": "rotate(180deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "rotate(360deg) scale(1)"
      }
    ],
    "roar-vibrate": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(1.05)"
      },
      {
        "offset": 0.1,
        "transform": "translate(-5px, 5px) scale(1.08)"
      },
      {
        "offset": 0.2,
        "transform": "translate(5px, -5px) scale(1.08)"
      },
      {
        "offset": 0.3,
        "transform": "translate(-5px, -5px) scale(1.08)"
      },
      {
        "offset": 0.4,
        "transform": "translate(5px, 5px) scale(1.08)"
      },
      {
        "offset": 0.5,
        "transform": "translate(-5px, 5px) scale(1.08)"
      },
      {
        "offset": 0.6,
        "transform": "translate(5px, -5px) scale(1.08)"
      },
      {
        "offset": 0.7,
        "transform": "translate(-5px, -5px) scale(1.08)"
      },
      {
        "offset": 0.8,
        "transform": "translate(5px, 5px) scale(1.05)"
      },
      {
        "offset": 0.9,
        "transform": "translate(-2px, 2px) scale(1.03)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) scale(1)"
      }
    ],
    "speaker-grow-shake-fade": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) scale(0.3)",
        "opacity": 0
      },
      {
        "offset": 0.15,
        "transform": "translate(-50%, -50%) scale(2.8)",
        "opacity": 0.95,
        "filter": "drop-shadow(0 0 20px #c98534)"
      },
      {
        "offset": 0.2,
        "transform": "translate(-53%, -47%) scale(2.8)",
        "opacity": 0.95
      },
      {
        "offset": 0.35,
        "transform": "translate(-47%, -53%) scale(2.9)",
        "opacity": 0.95
      },
      {
        "offset": 0.5,
        "transform": "translate(-52%, -48%) scale(2.8)",
        "opacity": 0.95
      },
      {
        "offset": 0.65,
        "transform": "translate(-48%, -52%) scale(2.9)",
        "opacity": 0.95
      },
      {
        "offset": 0.8,
        "transform": "translate(-50%, -50%) scale(2.8)",
        "opacity": 0.8
      },
      {
        "offset": 1,
        "transform": "translate(-50%, -50%) scale(1.8)",
        "opacity": 0
      }
    ],
    "monster-charge-slide": [
      {
        "offset": 0,
        "transform": "translateY(0) scale(1)"
      },
      {
        "offset": 0.15,
        "transform": "translateY(-25px) scale(0.95)"
      },
      {
        "offset": 0.35,
        "transform": "translateY(120px) scale(1.3)",
        "filter": "brightness(1.2) drop-shadow(0 15px 25px rgba(255,100,0,0.5))"
      },
      {
        "offset": 0.75,
        "transform": "translateY(120px) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translateY(0) scale(1)"
      }
    ],
    "card-heavy-shake": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.1,
        "transform": "translate(-8px, 6px) rotate(-0.5deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(7px, -7px) rotate(0.5deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(-6px, -5px) rotate(-0.5deg)"
      },
      {
        "offset": 0.4,
        "transform": "translate(5px, 6px) rotate(0.5deg)"
      },
      {
        "offset": 0.5,
        "transform": "translate(-7px, 5px) rotate(-0.5deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(6px, -6px) rotate(0.5deg)"
      },
      {
        "offset": 0.7,
        "transform": "translate(-5px, 4px) rotate(0deg)"
      },
      {
        "offset": 0.8,
        "transform": "translate(4px, 4px) rotate(0.5deg)"
      },
      {
        "offset": 0.9,
        "transform": "translate(-2px, 2px) rotate(0deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "charge-dust-fade": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(0.6)",
        "opacity": 0
      },
      {
        "offset": 0.2,
        "opacity": 0.85
      },
      {
        "offset": 1,
        "transform": "translate(var(--dx), var(--dy)) scale(1.6)",
        "opacity": 0
      }
    ],
    "tailspin-slash-anim": [
      {
        "offset": 0,
        "transform": "translate(-50%, -50%) rotate(0deg) scale(0.6)",
        "opacity": 0
      },
      {
        "offset": 0.15,
        "opacity": 0.95,
        "filter": "drop-shadow(0 0 15px rgba(201, 133, 52,0.6))"
      },
      {
        "offset": 1,
        "transform": "translate(-50%, -50%) rotate(360deg) scale(2.6)",
        "opacity": 0
      }
    ],
    "roar-wave-expand": [
      {
        "offset": 0,
        "opacity": 0
      },
      {
        "offset": 0.15,
        "opacity": 0.85
      },
      {
        "offset": 1,
        "opacity": 0
      }
    ],
    "hunter-roar-vibrate": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(-3px, 2px) rotate(-1deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(3px, -2px) rotate(1deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(-3px, -2px) rotate(-1deg)"
      },
      {
        "offset": 0.4,
        "transform": "translate(3px, 2px) rotate(1deg)"
      },
      {
        "offset": 0.5,
        "transform": "translate(-2px, 2px) rotate(-0.5deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(2px, -2px) rotate(0.5deg)"
      },
      {
        "offset": 0.7,
        "transform": "translate(-2px, -2px) rotate(-0.5deg)"
      },
      {
        "offset": 0.8,
        "transform": "translate(2px, 2px) rotate(0.5deg)"
      },
      {
        "offset": 0.9,
        "transform": "translate(-1px, 1px) rotate(0deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "tigrex-sonic-impact-ring": [
      {
        "offset": 0,
        "transform": "translate(-50%,-50%) scale(.18,.12)",
        "opacity": 0,
        "filter": "blur(1px)"
      },
      {
        "offset": 0.09,
        "opacity": 1
      },
      {
        "offset": 0.42,
        "opacity": 0.92,
        "filter": "blur(0)"
      },
      {
        "offset": 1,
        "transform": "translate(-50%,-50%) scale(10.5,7.4)",
        "opacity": 0,
        "filter": "blur(2px)"
      }
    ],
    "hunt-sever-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-80%, 40%) rotate(-55deg) scale(.4)"
      },
      {
        "offset": 0.35,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(20%, -60%) rotate(35deg) scale(1.45)"
      }
    ],
    "hunt-blunt-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(.15)"
      },
      {
        "offset": 0.55,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(1.7)"
      }
    ],
    "hunt-projectile-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-90%, 20%) rotate(-20deg) scaleX(.2)"
      },
      {
        "offset": 0.25,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(40%, -60%) rotate(-20deg) scaleX(1.6)"
      }
    ],
    "hunt-explosive-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(.1)"
      },
      {
        "offset": 0.4,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -50%) scale(2)",
        "filter": "blur(2px)"
      }
    ],
    "hunt-counter-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(.2)"
      },
      {
        "offset": 0.35,
        "opacity": 1,
        "transform": "translate(-50%, -50%) rotate(45deg) scale(1)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(135deg) scale(1.35)"
      }
    ],
    "hunt-multi-accent": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(0) scale(.3)"
      },
      {
        "offset": 0.3,
        "opacity": 1
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "translate(-50%, -50%) rotate(540deg) scale(1.6)"
      }
    ],
    "w-gs-smash": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(var(--attack-x) * -0.25), calc(var(--attack-y) * -0.2 + 35px)) scale(0.85) rotate(-75deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * 1.15), calc(var(--attack-y) * 1.15)) rotate(110deg) scale(1.35)",
        "filter": "brightness(1.3) drop-shadow(0 0 15px rgba(255, 100, 0, 0.7))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(var(--attack-x) * 1.05), calc(var(--attack-y) * 1.05)) rotate(115deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-ls-slash": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x) * -0.25), calc(var(--attack-y) * -0.1 + 10px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * 1.15), calc(var(--attack-y) * 1.15)) rotate(540deg) scale(1.3) skewX(-15deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x) * 0.5), calc(var(--attack-y) * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-db-dance": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x) * 0.3), calc(var(--attack-y) * 0.3)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x) * 0.7), calc(var(--attack-y) * 0.7)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * 1.1), calc(var(--attack-y) * 1.1)) rotate(1080deg) scale(1.3) filter(brightness(1.3))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(var(--attack-x) * 0.4), calc(var(--attack-y) * 0.4)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-db-levi": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(var(--attack-x), var(--attack-y)) rotate(720deg) scale(1.3)"
      },
      {
        "offset": 0.75,
        "transform": "translate(var(--attack-x), var(--attack-y)) rotate(2520deg) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scale(1)"
      }
    ],
    "w-sns-bash": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(var(--attack-x) * -0.35), calc(var(--attack-y) * -0.2 + 15px)) rotate(-45deg) scale(0.9)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(var(--attack-x) * 0.5), calc(var(--attack-y) * 0.5)) rotate(180deg) scale(1.1)"
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(var(--attack-x) * 1.1), calc(var(--attack-y) * 1.1)) rotate(540deg) scale(1.25)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-hm-spin-smash": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x) * 0.2), calc(var(--attack-y) * 0.2)) rotate(360deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * 0.4), calc(var(--attack-y) * 0.4)) rotate(720deg) scale(0.9)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x) * 1.05), calc(var(--attack-y) * 1.05)) rotate(735deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hh-swing": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(var(--attack-x) * 0.5 - 20px), calc(var(--attack-y) * 0.5 + 20px)) rotate(-25deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * 0.95), calc(var(--attack-y) * 0.95)) rotate(15deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-lc-thrust": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x) * 0.55), calc(var(--attack-y) * 0.55))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(var(--attack-x) * 0.75), calc(var(--attack-y) * 0.75))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x) * 0.95), calc(var(--attack-y) * 0.95)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "w-gl-blast": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(var(--attack-x) * 0.75), calc(var(--attack-y) * 0.75)) rotate(5deg) scale(1.1)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(var(--attack-x) * 0.6), calc(var(--attack-y) * 0.6)) rotate(-8deg) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--attack-x) * 0.78), calc(var(--attack-y) * 0.78)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-sa-morph": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(var(--attack-x) * -0.3), calc(var(--attack-y) * -0.2)) rotate(-50deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * 1.15), calc(var(--attack-y) * 1.15)) rotate(540deg) scale(1.3) skewY(10deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x) * 0.5), calc(var(--attack-y) * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-cb-aed": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x) * -0.25), calc(var(--attack-y) * -0.2 + 20px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * 1.2), calc(var(--attack-y) * 1.2)) rotate(720deg) scale(1.35)",
        "filter": "brightness(1.4) drop-shadow(0 0 25px #ff5500)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(var(--attack-x) * 0.6), calc(var(--attack-y) * 0.6)) rotate(740deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(1)"
      }
    ],
    "w-ig-copter": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x) * 0.4), calc(var(--attack-y) * 0.4 - 20px)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * 0.85), calc(var(--attack-y) * 0.85 - 40px)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(var(--attack-x) * 1.15), calc(var(--attack-y) * 1.15)) rotate(1080deg) scale(1.3) filter(brightness(1.25))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-lbg-shoot": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--attack-rot))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(var(--attack-x) * -0.1), calc(var(--attack-y) * -0.1)) rotate(calc(var(--attack-rot) * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0, 0) rotate(var(--attack-rot)) scale(1.02)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(var(--attack-x) * -0.1), calc(var(--attack-y) * -0.1)) rotate(calc(var(--attack-rot) * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.5,
        "transform": "translate(0, 0) rotate(var(--attack-rot)) scale(1.02)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * -0.15), calc(var(--attack-y) * -0.15)) rotate(calc(var(--attack-rot) * 0.5)) scale(0.94)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(var(--attack-rot) * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hbg-shoot": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.15,
        "transform": "translate(0, 0) rotate(var(--attack-rot))"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(var(--attack-x) * -0.35), calc(var(--attack-y) * -0.35)) rotate(calc(var(--attack-rot) * 0.4)) scale(0.9)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(var(--attack-x) * -0.1), calc(var(--attack-y) * -0.1)) rotate(calc(var(--attack-rot) * 0.6)) scale(0.95)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(var(--attack-rot) * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-bow-shoot": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--bow-base-rot)) scale(1.0)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(var(--attack-x) * -0.05), calc(var(--attack-y) * -0.05)) rotate(var(--bow-base-rot)) scaleX(1.25) scaleY(0.95)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(var(--attack-x) * -0.08), calc(var(--attack-y) * -0.08)) rotate(var(--bow-base-rot)) scaleX(1.3) scaleY(0.9)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(var(--attack-x) * -0.15), calc(var(--attack-y) * -0.15)) rotate(var(--bow-base-rot)) scaleX(0.85) scaleY(1.15)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(var(--attack-x) * -0.02), calc(var(--attack-y) * -0.02)) rotate(calc(var(--bow-base-rot) * 0.5)) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      }
    ],
    "roar-ear-block-pulse": [
      {
        "offset": 0,
        "transform": "scale(0.9)"
      },
      {
        "offset": 1,
        "transform": "scale(1.25)"
      }
    ],
    "crying-shake": [
      {
        "offset": 0,
        "transform": "translateY(0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translateY(-3px) rotate(-1deg)"
      },
      {
        "offset": 0.2,
        "transform": "translateY(1px) rotate(1deg)"
      },
      {
        "offset": 0.3,
        "transform": "translateY(-3px) rotate(-1deg)"
      },
      {
        "offset": 0.4,
        "transform": "translateY(1px) rotate(1deg)"
      },
      {
        "offset": 0.5,
        "transform": "translateY(-3px) rotate(-1deg)"
      },
      {
        "offset": 0.6,
        "transform": "translateY(1px) rotate(1deg)"
      },
      {
        "offset": 0.7,
        "transform": "translateY(-3px) rotate(-1deg)"
      },
      {
        "offset": 0.8,
        "transform": "translateY(1px) rotate(1deg)"
      },
      {
        "offset": 0.9,
        "transform": "translateY(-3px) rotate(-1deg)"
      },
      {
        "offset": 1,
        "transform": "translateY(0) rotate(0deg)"
      }
    ],
    "tear-fall-left": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(45deg) scale(0.5)"
      },
      {
        "offset": 0.15,
        "opacity": 0.95,
        "transform": "rotate(45deg) scale(1)"
      },
      {
        "offset": 0.9,
        "opacity": 0.8
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(45deg) scale(0.6)"
      }
    ],
    "tear-fall-right": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "rotate(45deg) scale(0.5)"
      },
      {
        "offset": 0.15,
        "opacity": 0.95,
        "transform": "rotate(45deg) scale(1)"
      },
      {
        "offset": 0.9,
        "opacity": 0.8
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "rotate(45deg) scale(0.6)"
      }
    ],
    "lobby-particle-fade": [
      {
        "offset": 0,
        "transform": "translate(0, 0) scale(0.5)",
        "opacity": 0
      },
      {
        "offset": 0.15,
        "opacity": 1,
        "transform": "translate(calc(var(--dx) * 0.2), calc(var(--dy) * 0.2)) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(var(--dx), var(--dy)) scale(0.9)",
        "opacity": 0
      }
    ],
    "quest-stamp-impact": [
      {
        "offset": 0,
        "transform": "scale(7) rotate(-25deg)",
        "opacity": 0,
        "filter": "brightness(3) blur(4px)"
      },
      {
        "offset": 0.4,
        "opacity": 1
      },
      {
        "offset": 0.6,
        "transform": "scale(1.84) rotate(-6deg)",
        "filter": "brightness(1.2) blur(0)"
      },
      {
        "offset": 0.75,
        "transform": "scale(2.16) rotate(-3deg)"
      },
      {
        "offset": 0.9,
        "transform": "scale(1.94) rotate(-5deg)"
      },
      {
        "offset": 1,
        "transform": "scale(2) rotate(-4deg)"
      }
    ],
    "w-gs-smash-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(160px * -0.25), calc(-180px * -0.2 + 35px)) scale(0.85) rotate(-75deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * 1.15), calc(-180px * 1.15)) rotate(110deg) scale(1.35)",
        "filter": "brightness(1.3) drop-shadow(0 0 15px rgba(255, 100, 0, 0.7))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(160px * 1.05), calc(-180px * 1.05)) rotate(115deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gs-smash-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(50px * -0.25), calc(-190px * -0.2 + 35px)) scale(0.85) rotate(-75deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * 1.15), calc(-190px * 1.15)) rotate(110deg) scale(1.35)",
        "filter": "brightness(1.3) drop-shadow(0 0 15px rgba(255, 100, 0, 0.7))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(50px * 1.05), calc(-190px * 1.05)) rotate(115deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gs-smash-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-50px * -0.25), calc(-190px * -0.2 + 35px)) scale(0.85) rotate(-75deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * 1.15), calc(-190px * 1.15)) rotate(110deg) scale(1.35)",
        "filter": "brightness(1.3) drop-shadow(0 0 15px rgba(255, 100, 0, 0.7))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-50px * 1.05), calc(-190px * 1.05)) rotate(115deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gs-smash-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-160px * -0.25), calc(-180px * -0.2 + 35px)) scale(0.85) rotate(-75deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * 1.15), calc(-180px * 1.15)) rotate(110deg) scale(1.35)",
        "filter": "brightness(1.3) drop-shadow(0 0 15px rgba(255, 100, 0, 0.7))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-160px * 1.05), calc(-180px * 1.05)) rotate(115deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-ls-slash-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(160px * -0.25), calc(-180px * -0.1 + 10px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * 1.15), calc(-180px * 1.15)) rotate(540deg) scale(1.3) skewX(-15deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(160px * 0.5), calc(-180px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-ls-slash-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(50px * -0.25), calc(-190px * -0.1 + 10px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * 1.15), calc(-190px * 1.15)) rotate(540deg) scale(1.3) skewX(-15deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(50px * 0.5), calc(-190px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-ls-slash-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-50px * -0.25), calc(-190px * -0.1 + 10px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * 1.15), calc(-190px * 1.15)) rotate(540deg) scale(1.3) skewX(-15deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-50px * 0.5), calc(-190px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-ls-slash-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-160px * -0.25), calc(-180px * -0.1 + 10px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * 1.15), calc(-180px * 1.15)) rotate(540deg) scale(1.3) skewX(-15deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-160px * 0.5), calc(-180px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-db-dance-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(160px * 0.3), calc(-180px * 0.3)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(160px * 0.7), calc(-180px * 0.7)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * 1.1), calc(-180px * 1.1)) rotate(1080deg) scale(1.3) filter(brightness(1.3))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(160px * 0.4), calc(-180px * 0.4)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-db-dance-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(50px * 0.3), calc(-190px * 0.3)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(50px * 0.7), calc(-190px * 0.7)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * 1.1), calc(-190px * 1.1)) rotate(1080deg) scale(1.3) filter(brightness(1.3))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(50px * 0.4), calc(-190px * 0.4)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-db-dance-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-50px * 0.3), calc(-190px * 0.3)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-50px * 0.7), calc(-190px * 0.7)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * 1.1), calc(-190px * 1.1)) rotate(1080deg) scale(1.3) filter(brightness(1.3))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-50px * 0.4), calc(-190px * 0.4)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-db-dance-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-160px * 0.3), calc(-180px * 0.3)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-160px * 0.7), calc(-180px * 0.7)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * 1.1), calc(-180px * 1.1)) rotate(1080deg) scale(1.3) filter(brightness(1.3))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-160px * 0.4), calc(-180px * 0.4)) rotate(1080deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-db-levi-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(160px, -180px) rotate(720deg) scale(1.3)"
      },
      {
        "offset": 0.75,
        "transform": "translate(160px, -180px) rotate(2520deg) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scale(1)"
      }
    ],
    "w-db-levi-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(50px, -190px) rotate(720deg) scale(1.3)"
      },
      {
        "offset": 0.75,
        "transform": "translate(50px, -190px) rotate(2520deg) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scale(1)"
      }
    ],
    "w-db-levi-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(-50px, -190px) rotate(720deg) scale(1.3)"
      },
      {
        "offset": 0.75,
        "transform": "translate(-50px, -190px) rotate(2520deg) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scale(1)"
      }
    ],
    "w-db-levi-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(-160px, -180px) rotate(720deg) scale(1.3)"
      },
      {
        "offset": 0.75,
        "transform": "translate(-160px, -180px) rotate(2520deg) scale(1.3)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scale(1)"
      }
    ],
    "w-sns-bash-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(160px * -0.35), calc(-180px * -0.2 + 15px)) rotate(-45deg) scale(0.9)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(160px * 0.5), calc(-180px * 0.5)) rotate(180deg) scale(1.1)"
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(160px * 1.1), calc(-180px * 1.1)) rotate(540deg) scale(1.25)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sns-bash-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(50px * -0.35), calc(-190px * -0.2 + 15px)) rotate(-45deg) scale(0.9)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(50px * 0.5), calc(-190px * 0.5)) rotate(180deg) scale(1.1)"
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(50px * 1.1), calc(-190px * 1.1)) rotate(540deg) scale(1.25)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sns-bash-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(-50px * -0.35), calc(-190px * -0.2 + 15px)) rotate(-45deg) scale(0.9)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(-50px * 0.5), calc(-190px * 0.5)) rotate(180deg) scale(1.1)"
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(-50px * 1.1), calc(-190px * 1.1)) rotate(540deg) scale(1.25)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sns-bash-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(-160px * -0.35), calc(-180px * -0.2 + 15px)) rotate(-45deg) scale(0.9)"
      },
      {
        "offset": 0.55,
        "transform": "translate(calc(-160px * 0.5), calc(-180px * 0.5)) rotate(180deg) scale(1.1)"
      },
      {
        "offset": 0.75,
        "transform": "translate(calc(-160px * 1.1), calc(-180px * 1.1)) rotate(540deg) scale(1.25)",
        "filter": "brightness(1.2)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-hm-spin-smash-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(160px * 0.2), calc(-180px * 0.2)) rotate(360deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * 0.4), calc(-180px * 0.4)) rotate(720deg) scale(0.9)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(160px * 1.05), calc(-180px * 1.05)) rotate(735deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hm-spin-smash-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(50px * 0.2), calc(-190px * 0.2)) rotate(360deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * 0.4), calc(-190px * 0.4)) rotate(720deg) scale(0.9)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(50px * 1.05), calc(-190px * 1.05)) rotate(735deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hm-spin-smash-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-50px * 0.2), calc(-190px * 0.2)) rotate(360deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * 0.4), calc(-190px * 0.4)) rotate(720deg) scale(0.9)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-50px * 1.05), calc(-190px * 1.05)) rotate(735deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hm-spin-smash-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-160px * 0.2), calc(-180px * 0.2)) rotate(360deg)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * 0.4), calc(-180px * 0.4)) rotate(720deg) scale(0.9)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-160px * 1.05), calc(-180px * 1.05)) rotate(735deg) scale(1.25)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hh-swing-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(160px * 0.5 - 20px), calc(-180px * 0.5 + 20px)) rotate(-25deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * 0.95), calc(-180px * 0.95)) rotate(15deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hh-swing-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(50px * 0.5 - 20px), calc(-190px * 0.5 + 20px)) rotate(-25deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * 0.95), calc(-190px * 0.95)) rotate(15deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hh-swing-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-50px * 0.5 - 20px), calc(-190px * 0.5 + 20px)) rotate(-25deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * 0.95), calc(-190px * 0.95)) rotate(15deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hh-swing-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-160px * 0.5 - 20px), calc(-180px * 0.5 + 20px)) rotate(-25deg)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * 0.95), calc(-180px * 0.95)) rotate(15deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-lc-thrust-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(160px * 0.55), calc(-180px * 0.55))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(160px * 0.75), calc(-180px * 0.75))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(160px * 0.95), calc(-180px * 0.95)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "w-lc-thrust-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(50px * 0.55), calc(-190px * 0.55))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(50px * 0.75), calc(-190px * 0.75))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(50px * 0.95), calc(-190px * 0.95)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "w-lc-thrust-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-50px * 0.55), calc(-190px * 0.55))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(-50px * 0.75), calc(-190px * 0.75))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-50px * 0.95), calc(-190px * 0.95)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "w-lc-thrust-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-160px * 0.55), calc(-180px * 0.55))"
      },
      {
        "offset": 0.35,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.5,
        "transform": "translate(calc(-160px * 0.75), calc(-180px * 0.75))"
      },
      {
        "offset": 0.65,
        "transform": "translate(0, 0)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-160px * 0.95), calc(-180px * 0.95)) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0)"
      }
    ],
    "w-gl-blast-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(160px * 0.75), calc(-180px * 0.75)) rotate(5deg) scale(1.1)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(160px * 0.6), calc(-180px * 0.6)) rotate(-8deg) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(160px * 0.78), calc(-180px * 0.78)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gl-blast-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(50px * 0.75), calc(-190px * 0.75)) rotate(5deg) scale(1.1)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(50px * 0.6), calc(-190px * 0.6)) rotate(-8deg) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(50px * 0.78), calc(-190px * 0.78)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gl-blast-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-50px * 0.75), calc(-190px * 0.75)) rotate(5deg) scale(1.1)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(-50px * 0.6), calc(-190px * 0.6)) rotate(-8deg) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(-50px * 0.78), calc(-190px * 0.78)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-gl-blast-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.35,
        "transform": "translate(calc(-160px * 0.75), calc(-180px * 0.75)) rotate(5deg) scale(1.1)"
      },
      {
        "offset": 0.45,
        "transform": "translate(calc(-160px * 0.6), calc(-180px * 0.6)) rotate(-8deg) scale(1.05)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(-160px * 0.78), calc(-180px * 0.78)) rotate(2deg)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-sa-morph-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(160px * -0.3), calc(-180px * -0.2)) rotate(-50deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * 1.15), calc(-180px * 1.15)) rotate(540deg) scale(1.3) skewY(10deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(160px * 0.5), calc(-180px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sa-morph-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(50px * -0.3), calc(-190px * -0.2)) rotate(-50deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * 1.15), calc(-190px * 1.15)) rotate(540deg) scale(1.3) skewY(10deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(50px * 0.5), calc(-190px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sa-morph-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(-50px * -0.3), calc(-190px * -0.2)) rotate(-50deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * 1.15), calc(-190px * 1.15)) rotate(540deg) scale(1.3) skewY(10deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-50px * 0.5), calc(-190px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-sa-morph-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.25,
        "transform": "translate(calc(-160px * -0.3), calc(-180px * -0.2)) rotate(-50deg) scale(0.85)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * 1.15), calc(-180px * 1.15)) rotate(540deg) scale(1.3) skewY(10deg)",
        "filter": "brightness(1.3)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-160px * 0.5), calc(-180px * 0.5)) rotate(560deg) scale(1.1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(720deg) scale(1)"
      }
    ],
    "w-cb-aed-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(160px * -0.25), calc(-180px * -0.2 + 20px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * 1.2), calc(-180px * 1.2)) rotate(720deg) scale(1.35)",
        "filter": "brightness(1.4) drop-shadow(0 0 25px #ff5500)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(160px * 0.6), calc(-180px * 0.6)) rotate(740deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(1)"
      }
    ],
    "w-cb-aed-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(50px * -0.25), calc(-190px * -0.2 + 20px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * 1.2), calc(-190px * 1.2)) rotate(720deg) scale(1.35)",
        "filter": "brightness(1.4) drop-shadow(0 0 25px #ff5500)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(50px * 0.6), calc(-190px * 0.6)) rotate(740deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(1)"
      }
    ],
    "w-cb-aed-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-50px * -0.25), calc(-190px * -0.2 + 20px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * 1.2), calc(-190px * 1.2)) rotate(720deg) scale(1.35)",
        "filter": "brightness(1.4) drop-shadow(0 0 25px #ff5500)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-50px * 0.6), calc(-190px * 0.6)) rotate(740deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(1)"
      }
    ],
    "w-cb-aed-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-160px * -0.25), calc(-180px * -0.2 + 20px)) rotate(-60deg) scale(0.85)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * 1.2), calc(-180px * 1.2)) rotate(720deg) scale(1.35)",
        "filter": "brightness(1.4) drop-shadow(0 0 25px #ff5500)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-160px * 0.6), calc(-180px * 0.6)) rotate(740deg) scale(1.15)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(1)"
      }
    ],
    "w-ig-copter-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(160px * 0.4), calc(-180px * 0.4 - 20px)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * 0.85), calc(-180px * 0.85 - 40px)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(160px * 1.15), calc(-180px * 1.15)) rotate(1080deg) scale(1.3) filter(brightness(1.25))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-ig-copter-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(50px * 0.4), calc(-190px * 0.4 - 20px)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * 0.85), calc(-190px * 0.85 - 40px)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(50px * 1.15), calc(-190px * 1.15)) rotate(1080deg) scale(1.3) filter(brightness(1.25))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-ig-copter-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-50px * 0.4), calc(-190px * 0.4 - 20px)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * 0.85), calc(-190px * 0.85 - 40px)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-50px * 1.15), calc(-190px * 1.15)) rotate(1080deg) scale(1.3) filter(brightness(1.25))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-ig-copter-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-160px * 0.4), calc(-180px * 0.4 - 20px)) rotate(360deg) scale(1.1)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * 0.85), calc(-180px * 0.85 - 40px)) rotate(720deg) scale(1.2)"
      },
      {
        "offset": 0.8,
        "transform": "translate(calc(-160px * 1.15), calc(-180px * 1.15)) rotate(1080deg) scale(1.3) filter(brightness(1.25))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scale(1)"
      }
    ],
    "w-lbg-shoot-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(18deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(160px * -0.1), calc(-180px * -0.1)) rotate(calc(18deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0, 0) rotate(18deg) scale(1.02)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(160px * -0.1), calc(-180px * -0.1)) rotate(calc(18deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.5,
        "transform": "translate(0, 0) rotate(18deg) scale(1.02)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * -0.15), calc(-180px * -0.15)) rotate(calc(18deg * 0.5)) scale(0.94)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(18deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-lbg-shoot-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(6deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(50px * -0.1), calc(-190px * -0.1)) rotate(calc(6deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0, 0) rotate(6deg) scale(1.02)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(50px * -0.1), calc(-190px * -0.1)) rotate(calc(6deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.5,
        "transform": "translate(0, 0) rotate(6deg) scale(1.02)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * -0.15), calc(-190px * -0.15)) rotate(calc(6deg * 0.5)) scale(0.94)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(6deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-lbg-shoot-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(-6deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-50px * -0.1), calc(-190px * -0.1)) rotate(calc(-6deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0, 0) rotate(-6deg) scale(1.02)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-50px * -0.1), calc(-190px * -0.1)) rotate(calc(-6deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.5,
        "transform": "translate(0, 0) rotate(-6deg) scale(1.02)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * -0.15), calc(-190px * -0.15)) rotate(calc(-6deg * 0.5)) scale(0.94)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(-6deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-lbg-shoot-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(-18deg)"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-160px * -0.1), calc(-180px * -0.1)) rotate(calc(-18deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.3,
        "transform": "translate(0, 0) rotate(-18deg) scale(1.02)"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-160px * -0.1), calc(-180px * -0.1)) rotate(calc(-18deg * 0.7)) scale(0.96)"
      },
      {
        "offset": 0.5,
        "transform": "translate(0, 0) rotate(-18deg) scale(1.02)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * -0.15), calc(-180px * -0.15)) rotate(calc(-18deg * 0.5)) scale(0.94)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(-18deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hbg-shoot-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.15,
        "transform": "translate(0, 0) rotate(18deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(160px * -0.35), calc(-180px * -0.35)) rotate(calc(18deg * 0.4)) scale(0.9)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * -0.1), calc(-180px * -0.1)) rotate(calc(18deg * 0.6)) scale(0.95)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(18deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hbg-shoot-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.15,
        "transform": "translate(0, 0) rotate(6deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(50px * -0.35), calc(-190px * -0.35)) rotate(calc(6deg * 0.4)) scale(0.9)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * -0.1), calc(-190px * -0.1)) rotate(calc(6deg * 0.6)) scale(0.95)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(6deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hbg-shoot-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.15,
        "transform": "translate(0, 0) rotate(-6deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-50px * -0.35), calc(-190px * -0.35)) rotate(calc(-6deg * 0.4)) scale(0.9)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * -0.1), calc(-190px * -0.1)) rotate(calc(-6deg * 0.6)) scale(0.95)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(-6deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-hbg-shoot-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg)"
      },
      {
        "offset": 0.15,
        "transform": "translate(0, 0) rotate(-18deg)"
      },
      {
        "offset": 0.3,
        "transform": "translate(calc(-160px * -0.35), calc(-180px * -0.35)) rotate(calc(-18deg * 0.4)) scale(0.9)"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * -0.1), calc(-180px * -0.1)) rotate(calc(-18deg * 0.6)) scale(0.95)"
      },
      {
        "offset": 0.85,
        "transform": "translate(0, 0) rotate(calc(-18deg * 0.3))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg)"
      }
    ],
    "w-bow-shoot-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--bow-base-rot)) scale(1.0)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(160px * -0.05), calc(-180px * -0.05)) rotate(var(--bow-base-rot)) scaleX(1.25) scaleY(0.95)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(160px * -0.08), calc(-180px * -0.08)) rotate(var(--bow-base-rot)) scaleX(1.3) scaleY(0.9)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(160px * -0.15), calc(-180px * -0.15)) rotate(var(--bow-base-rot)) scaleX(0.85) scaleY(1.15)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(160px * -0.02), calc(-180px * -0.02)) rotate(calc(var(--bow-base-rot) * 0.5)) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      }
    ],
    "w-bow-shoot-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--bow-base-rot)) scale(1.0)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(50px * -0.05), calc(-190px * -0.05)) rotate(var(--bow-base-rot)) scaleX(1.25) scaleY(0.95)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(50px * -0.08), calc(-190px * -0.08)) rotate(var(--bow-base-rot)) scaleX(1.3) scaleY(0.9)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(50px * -0.15), calc(-190px * -0.15)) rotate(var(--bow-base-rot)) scaleX(0.85) scaleY(1.15)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(50px * -0.02), calc(-190px * -0.02)) rotate(calc(var(--bow-base-rot) * 0.5)) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      }
    ],
    "w-bow-shoot-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--bow-base-rot)) scale(1.0)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-50px * -0.05), calc(-190px * -0.05)) rotate(var(--bow-base-rot)) scaleX(1.25) scaleY(0.95)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(-50px * -0.08), calc(-190px * -0.08)) rotate(var(--bow-base-rot)) scaleX(1.3) scaleY(0.9)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(-50px * -0.15), calc(-190px * -0.15)) rotate(var(--bow-base-rot)) scaleX(0.85) scaleY(1.15)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-50px * -0.02), calc(-190px * -0.02)) rotate(calc(var(--bow-base-rot) * 0.5)) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      }
    ],
    "w-bow-shoot-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      },
      {
        "offset": 0.1,
        "transform": "translate(0, 0) rotate(var(--bow-base-rot)) scale(1.0)"
      },
      {
        "offset": 0.6,
        "transform": "translate(calc(-160px * -0.05), calc(-180px * -0.05)) rotate(var(--bow-base-rot)) scaleX(1.25) scaleY(0.95)"
      },
      {
        "offset": 0.7,
        "transform": "translate(calc(-160px * -0.08), calc(-180px * -0.08)) rotate(var(--bow-base-rot)) scaleX(1.3) scaleY(0.9)"
      },
      {
        "offset": 0.73,
        "transform": "translate(calc(-160px * -0.15), calc(-180px * -0.15)) rotate(var(--bow-base-rot)) scaleX(0.85) scaleY(1.15)"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-160px * -0.02), calc(-180px * -0.02)) rotate(calc(var(--bow-base-rot) * 0.5)) scale(1.0)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(0deg) scale(1)"
      }
    ],
    "w-db-dance-demon-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(160px * 0.3), calc(-180px * 0.3)) rotate(360deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(160px * 0.7), calc(-180px * 0.7)) rotate(720deg) scaleY(-1) scaleX(1.2)",
        "filter": "sepia(1) saturate(24) hue-rotate(300deg) brightness(1.3) drop-shadow(0 0 10px rgba(231, 76, 60, 0.9))"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(160px * 1.1), calc(-180px * 1.1)) rotate(1080deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(160px * 0.4), calc(-180px * 0.4)) rotate(1080deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-dance-demon-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(50px * 0.3), calc(-190px * 0.3)) rotate(360deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(50px * 0.7), calc(-190px * 0.7)) rotate(720deg) scaleY(-1) scaleX(1.2)",
        "filter": "sepia(1) saturate(24) hue-rotate(300deg) brightness(1.3) drop-shadow(0 0 10px rgba(231, 76, 60, 0.9))"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(50px * 1.1), calc(-190px * 1.1)) rotate(1080deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(50px * 0.4), calc(-190px * 0.4)) rotate(1080deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-dance-demon-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-50px * 0.3), calc(-190px * 0.3)) rotate(360deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-50px * 0.7), calc(-190px * 0.7)) rotate(720deg) scaleY(-1) scaleX(1.2)",
        "filter": "sepia(1) saturate(24) hue-rotate(300deg) brightness(1.3) drop-shadow(0 0 10px rgba(231, 76, 60, 0.9))"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-50px * 1.1), calc(-190px * 1.1)) rotate(1080deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-50px * 0.4), calc(-190px * 0.4)) rotate(1080deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-dance-demon-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.2,
        "transform": "translate(calc(-160px * 0.3), calc(-180px * 0.3)) rotate(360deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 0.4,
        "transform": "translate(calc(-160px * 0.7), calc(-180px * 0.7)) rotate(720deg) scaleY(-1) scaleX(1.2)",
        "filter": "sepia(1) saturate(24) hue-rotate(300deg) brightness(1.3) drop-shadow(0 0 10px rgba(231, 76, 60, 0.9))"
      },
      {
        "offset": 0.65,
        "transform": "translate(calc(-160px * 1.1), calc(-180px * 1.1)) rotate(1080deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.85,
        "transform": "translate(calc(-160px * 0.4), calc(-180px * 0.4)) rotate(1080deg) scaleY(-1) scaleX(1.1)",
        "filter": "sepia(1) saturate(22) hue-rotate(300deg) brightness(1.2) drop-shadow(0 0 8px rgba(231, 76, 60, 0.8))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1440deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-levi-demon-0": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.25,
        "transform": "translate(160px, -180px) rotate(720deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.75,
        "transform": "translate(160px, -180px) rotate(2520deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-levi-demon-1": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.25,
        "transform": "translate(50px, -190px) rotate(720deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.75,
        "transform": "translate(50px, -190px) rotate(2520deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-levi-demon-2": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.25,
        "transform": "translate(-50px, -190px) rotate(720deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.75,
        "transform": "translate(-50px, -190px) rotate(2520deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "w-db-levi-demon-3": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      },
      {
        "offset": 0.25,
        "transform": "translate(-160px, -180px) rotate(720deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.4) drop-shadow(0 0 12px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 0.75,
        "transform": "translate(-160px, -180px) rotate(2520deg) scaleY(-1) scaleX(1.3)",
        "filter": "sepia(1) saturate(25) hue-rotate(300deg) brightness(1.45) drop-shadow(0 0 15px rgba(231, 76, 60, 1.0))"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(3240deg) scaleY(-1) scaleX(1)",
        "filter": "sepia(1) saturate(20) hue-rotate(300deg) brightness(1.1) drop-shadow(0 0 6px rgba(231, 76, 60, 0.7))"
      }
    ],
    "ig-kinsect-extract": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(.92)"
      },
      {
        "offset": 0.18,
        "transform": "translate(calc(var(--attack-x) * .26), calc(var(--attack-y) * .2 + 13px)) rotate(160deg) scale(1.05)"
      },
      {
        "offset": 0.43,
        "transform": "translate(calc(var(--attack-x) * 1.08), calc(var(--attack-y) * 1.03)) rotate(520deg) scale(1.18)",
        "filter": "brightness(1.6) drop-shadow(0 0 13px #65ffe2)"
      },
      {
        "offset": 0.58,
        "transform": "translate(calc(var(--attack-x) * .98), calc(var(--attack-y) * .94)) rotate(620deg) scale(.92)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(var(--attack-x) * .22), calc(var(--attack-y) * .14 - 12px)) rotate(880deg) scale(1.08)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1080deg) scale(.92)"
      }
    ],
    "ig-kinsect-assault": [
      {
        "offset": 0,
        "transform": "translate(0, 0) rotate(0deg) scale(.9)"
      },
      {
        "offset": 0.22,
        "transform": "translate(calc(var(--attack-x) * .28 - 24px), calc(var(--attack-y) * .22 + 18px)) rotate(310deg) scale(1.12)"
      },
      {
        "offset": 0.52,
        "transform": "translate(calc(var(--attack-x) * .92 + 22px), calc(var(--attack-y) * .88 - 15px)) rotate(760deg) scale(1.22)",
        "filter": "brightness(1.45) drop-shadow(0 0 12px #ffd66a)"
      },
      {
        "offset": 0.72,
        "transform": "translate(calc(var(--attack-x) * .55 - 17px), calc(var(--attack-y) * .5 + 12px)) rotate(980deg) scale(1)"
      },
      {
        "offset": 1,
        "transform": "translate(0, 0) rotate(1260deg) scale(.9)"
      }
    ],
    "hunt-loadout-change-flash": [
      {
        "offset": 0,
        "transform": "scale(.92)",
        "filter": "brightness(.9) saturate(.8)"
      },
      {
        "offset": 0.16,
        "transform": "scale(var(--hunt-loadout-change-peak))",
        "filter": "brightness(1.85) saturate(1.55)"
      },
      {
        "offset": 0.42,
        "transform": "scale(var(--hunt-loadout-change-settle))",
        "filter": "brightness(1.45) saturate(1.3)"
      },
      {
        "offset": 1,
        "transform": "none",
        "filter": "none"
      }
    ],
    "hunt-perk-synergy-glow": [
      {
        "offset": 0,
        "filter": "brightness(1)"
      },
      {
        "offset": 1,
        "filter": "brightness(1.12)"
      }
    ],
    "hunt-dung-rainbow": [
      {
        "offset": 1,
        "filter": "hue-rotate(360deg)"
      }
    ],
    "hunt-dung-pulse": [
      {
        "offset": 0,
        "transform": "scale(1)"
      },
      {
        "offset": 1,
        "transform": "scale(1.025)"
      }
    ],
    "hunt-dung-icon-party": [
      {
        "offset": 0,
        "transform": "rotate(-8deg) scale(1)"
      },
      {
        "offset": 1,
        "transform": "rotate(8deg) scale(1.14)"
      }
    ],
    "hunt-tail-drop": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "translate(-50%,-50%) rotate(-70deg) scale(.58)"
      },
      {
        "offset": 0.1,
        "opacity": 1
      },
      {
        "offset": 0.48,
        "opacity": 1,
        "transform": "translate(calc(-50% + var(--tail-flight-mid-x)),calc(-50% + var(--tail-flight-mid-y) - var(--tail-flight-arc))) rotate(610deg) scale(1.18)"
      },
      {
        "offset": 0.82,
        "transform": "translate(calc(-50% + var(--tail-flight-x)),calc(-50% + var(--tail-flight-y) - 12px)) rotate(1040deg) scale(1.08)"
      },
      {
        "offset": 0.92,
        "transform": "translate(calc(-50% + var(--tail-flight-x)),calc(-50% + var(--tail-flight-y) + 8px)) rotate(1100deg) scale(.94,1.08)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "translate(calc(-50% + var(--tail-flight-x)),calc(-50% + var(--tail-flight-y))) rotate(1080deg) scale(1)"
      }
    ],
    "hunt-horn-buff-arrive": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.55)"
      },
      {
        "offset": 1,
        "opacity": 1,
        "transform": "scale(1)"
      }
    ],
    "hunt-loadout-ready-pulse": [
      {
        "offset": 0,
        "filter": "brightness(1)"
      },
      {
        "offset": 0.5,
        "filter": "brightness(1.13)"
      },
      {
        "offset": 1,
        "filter": "brightness(1)"
      }
    ],
    "hunt-guard-impact-shake": [
      {
        "offset": 0,
        "opacity": 0,
        "transform": "scale(.68) rotate(0)"
      },
      {
        "offset": 0.16,
        "opacity": 0.7,
        "transform": "scale(1.08) rotate(-9deg)"
      },
      {
        "offset": 0.34,
        "opacity": 0.62,
        "transform": "scale(1) rotate(8deg)"
      },
      {
        "offset": 0.52,
        "opacity": 0.58,
        "transform": "scale(1.03) rotate(-6deg)"
      },
      {
        "offset": 0.7,
        "opacity": 0.5,
        "transform": "scale(1) rotate(4deg)"
      },
      {
        "offset": 0.86,
        "opacity": 0.36,
        "transform": "scale(.98) rotate(-2deg)"
      },
      {
        "offset": 1,
        "opacity": 0,
        "transform": "scale(.94) rotate(0)"
      }
    ],
    "hunt-hot-join-pulse": [
      {
        "offset": 0,
        "transform": "scale(1.06)"
      },
      {
        "offset": 0.55
      },
      {
        "offset": 1,
        "transform": "scale(1)"
      }
    ],
    "hunt-journey-current-pulse": [
      {
        "offset": 0,
        "transform": "translateY(1px) scale(.96)"
      },
      {
        "offset": 1,
        "transform": "translateY(-4px) scale(1.08)"
      }
    ],
    "hunt-monster-limb-slip": [
      {
        "offset": 0,
        "transform": "translateX(0) rotate(0)"
      },
      {
        "offset": 0.28,
        "transform": "translateX(9%) rotate(9deg)"
      },
      {
        "offset": 0.55,
        "transform": "translateX(15%) rotate(18deg)"
      },
      {
        "offset": 0.78,
        "transform": "translateX(7%) rotate(7deg)"
      },
      {
        "offset": 1,
        "transform": "translateX(0) rotate(0)"
      }
    ],
    "hunt-monster-fatigue-stumble": [
      {
        "offset": 0,
        "transform": "translateX(0) rotate(0)"
      },
      {
        "offset": 0.3,
        "transform": "translateX(7%) rotate(7deg)"
      },
      {
        "offset": 0.58,
        "transform": "translateX(3%) rotate(-5deg)"
      },
      {
        "offset": 0.82,
        "transform": "translateX(6%) rotate(3deg)"
      },
      {
        "offset": 1,
        "transform": "translateX(0) rotate(0)"
      }
    ]
  },
  "profiles": {
    "close-strike": {
      "name": "monster-motion-close-strike",
      "easing": "cubic-bezier(.2,.78,.18,1)",
      "origin": null
    },
    "ground-charge": {
      "name": "monster-motion-ground-charge",
      "easing": "linear",
      "origin": null
    },
    "ground-charge-cross": {
      "name": "monster-motion-ground-charge-cross",
      "easing": "linear",
      "origin": null
    },
    "ground-charge-zigzag": {
      "name": "monster-motion-ground-charge-zigzag",
      "easing": "linear",
      "origin": null
    },
    "ground-charge-double": {
      "name": "monster-motion-ground-charge-double",
      "easing": "linear",
      "origin": null
    },
    "ground-charge-triple": {
      "name": "monster-motion-ground-charge-triple",
      "easing": "linear",
      "origin": null
    },
    "rathian-ground-charge": {
      "name": "monster-motion-rathian-ground-charge",
      "easing": "linear",
      "origin": null
    },
    "aerial-charge-cross": {
      "name": "monster-motion-aerial-charge-cross",
      "easing": "linear",
      "origin": null
    },
    "legiana-drill-cross": {
      "name": "monster-motion-legiana-drill-cross",
      "easing": "linear",
      "origin": null
    },
    "legiana-hop-strike": {
      "name": "monster-motion-legiana-hop-strike",
      "easing": "cubic-bezier(.2,.82,.18,1)",
      "origin": null
    },
    "tail-sweep": {
      "name": "monster-motion-tail-sweep",
      "easing": "cubic-bezier(.2,.75,.2,1)",
      "origin": null
    },
    "tail-sweep-double": {
      "name": "monster-motion-tail-sweep-double",
      "easing": "cubic-bezier(.2,.75,.2,1)",
      "origin": null
    },
    "lateral-sweep": {
      "name": "monster-motion-lateral-sweep",
      "easing": "cubic-bezier(.2,.72,.18,1)",
      "origin": null
    },
    "pounce-chain": {
      "name": "monster-motion-pounce-chain",
      "easing": "cubic-bezier(.18,.8,.2,1)",
      "origin": null
    },
    "tigrex-charge-chain": {
      "name": "tigrex-charge-chain",
      "easing": "linear",
      "origin": null
    },
    "tigrex-branch-approach": {
      "name": "tigrex-branch-approach",
      "easing": "linear",
      "origin": null
    },
    "tigrex-exhausted-trip": {
      "name": "tigrex-exhausted-trip",
      "easing": "ease-out",
      "origin": "55% 72%"
    },
    "tigrex-rock-hop": {
      "name": "tigrex-rock-hop",
      "easing": "cubic-bezier(.2,.72,.16,1)",
      "origin": null
    },
    "tigrex-sliding-spin": {
      "name": "tigrex-sliding-spin",
      "easing": "cubic-bezier(.16,.72,.15,1)",
      "origin": "72% 70%"
    },
    "tigrex-running-double-bite": {
      "name": "tigrex-running-double-bite",
      "easing": "ease-in-out",
      "origin": "43% 72%"
    },
    "tigrex-foreleg-slam": {
      "name": "tigrex-foreleg-slam",
      "easing": "ease-in-out",
      "origin": "72% 70%"
    },
    "tigrex-bite": {
      "name": "tigrex-bite",
      "easing": "ease-in-out",
      "origin": "43% 72%"
    },
    "tigrex-double-bite": {
      "name": "tigrex-double-bite",
      "easing": "ease-in-out",
      "origin": "43% 72%"
    },
    "tigrex-clockwise-spin": {
      "name": "tigrex-clockwise-spin",
      "easing": "cubic-bezier(.18,.72,.14,1)",
      "origin": "72% 70%"
    },
    "tigrex-rock-shot": {
      "name": "tigrex-rock-shot",
      "easing": "ease-in-out",
      "origin": "72% 70%"
    },
    "tigrex-leap": {
      "name": "tigrex-leap",
      "easing": "cubic-bezier(.18,.75,.16,1)",
      "origin": null
    },
    "barioth-spring-leap": {
      "name": "barioth-spring-leap",
      "easing": "linear",
      "origin": null
    },
    "barioth-glide-circle-land": {
      "name": "barioth-glide-circle-land",
      "easing": "linear",
      "origin": "31% 81%"
    },
    "body-spin": {
      "name": "monster-motion-body-spin",
      "easing": "cubic-bezier(.22,.74,.18,1)",
      "origin": null
    },
    "leap-slam": {
      "name": "monster-motion-leap-slam",
      "easing": "cubic-bezier(.18,.82,.2,1)",
      "origin": null
    },
    "aerial-dive": {
      "name": "monster-motion-aerial-dive",
      "easing": "cubic-bezier(.12,.8,.18,1)",
      "origin": null
    },
    "burrow-enter": {
      "name": "monster-motion-burrow-enter",
      "easing": "cubic-bezier(.3,.7,.2,1)",
      "origin": null
    },
    "burrow-emerge": {
      "name": "monster-motion-burrow-emerge",
      "easing": "cubic-bezier(.14,.82,.2,1)",
      "origin": null
    },
    "ranged-cast": {
      "name": "monster-motion-ranged-cast",
      "easing": "cubic-bezier(.18,.8,.2,1)",
      "origin": null
    },
    "area-burst": {
      "name": "monster-motion-area-burst",
      "easing": "cubic-bezier(.12,.8,.18,1)",
      "origin": null
    },
    "roar": {
      "name": "monster-motion-roar",
      "easing": "ease-in-out",
      "origin": null
    },
    "rathalos-bite-contact": {
      "name": "monster-motion-rathalos-bite-contact",
      "easing": "cubic-bezier(.2,.76,.18,1)",
      "origin": null
    },
    "rathalos-rush-bite": {
      "name": "monster-motion-rathalos-rush-bite",
      "easing": "cubic-bezier(.18,.72,.16,1)",
      "origin": null
    },
    "rathalos-fireball": {
      "name": "monster-motion-rathalos-fireball",
      "easing": "ease-in-out",
      "origin": null
    },
    "rathalos-triple-fireball": {
      "name": "monster-motion-rathalos-triple-fireball",
      "easing": "ease-in-out",
      "origin": null
    },
    "rathalos-step-fireball": {
      "name": "monster-motion-rathalos-step-fireball",
      "easing": "cubic-bezier(.2,.72,.18,1)",
      "origin": null
    },
    "rathalos-backstep-fireball": {
      "name": "monster-motion-rathalos-backstep-fireball",
      "easing": "cubic-bezier(.18,.76,.18,1)",
      "origin": null
    },
    "rathalos-claw-dive": {
      "name": "monster-motion-rathalos-claw-dive",
      "easing": "cubic-bezier(.14,.8,.18,1)",
      "origin": null
    },
    "rathalos-air-kick-combo": {
      "name": "monster-motion-rathalos-air-kick-combo",
      "easing": "cubic-bezier(.14,.78,.18,1)",
      "origin": null
    },
    "rathalos-tail-sweep-double": {
      "name": "monster-motion-rathalos-tail-sweep-double",
      "easing": "cubic-bezier(.18,.72,.16,1)",
      "origin": null
    },
    "rathalos-flame-sweep": {
      "name": "monster-motion-rathalos-flame-sweep",
      "easing": "ease-in-out",
      "origin": null
    },
    "rathalos-stomp": {
      "name": "monster-motion-rathalos-stomp",
      "easing": "cubic-bezier(.16,.8,.18,1)",
      "origin": null
    },
    "rathalos-glide": {
      "name": "monster-motion-rathalos-glide",
      "easing": "cubic-bezier(.12,.78,.16,1)",
      "origin": null
    },
    "rathian-triple-fireball": {
      "name": "monster-motion-rathian-triple-fireball",
      "easing": "ease-in-out",
      "origin": "22% 70%"
    },
    "rathian-tail-sweep-double": {
      "name": "monster-motion-rathian-tail-sweep-double",
      "easing": "linear",
      "origin": "58% 62%"
    },
    "rathian-somersault": {
      "name": "monster-motion-rathian-somersault",
      "easing": "cubic-bezier(.18,.72,.16,1)",
      "origin": "58% 62%"
    },
    "rathian-somersault-double": {
      "name": "monster-motion-rathian-somersault-double",
      "easing": "cubic-bezier(.18,.72,.16,1)",
      "origin": "58% 62%"
    },
    "rathian-bite-somersault": {
      "name": "monster-motion-rathian-bite-somersault",
      "easing": "cubic-bezier(.18,.72,.16,1)",
      "origin": "58% 62%"
    },
    "rathian-somersault-glide": {
      "name": "monster-motion-rathian-somersault-glide",
      "easing": "linear",
      "origin": "58% 62%"
    },
    "rathian-glide": {
      "name": "monster-motion-rathian-glide",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-leap-ambush": {
      "name": "monster-motion-nargacuga-leap-ambush",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-leap-ambush-triple": {
      "name": "monster-motion-nargacuga-leap-ambush-triple",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-turn-tail-slam": {
      "name": "monster-motion-nargacuga-turn-tail-slam",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-turn-tail-slam-double": {
      "name": "monster-motion-nargacuga-turn-tail-slam-double",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-tail-whip": {
      "name": "monster-motion-nargacuga-tail-whip",
      "easing": "linear",
      "origin": "50% 82%"
    },
    "nargacuga-pivot-spin": {
      "name": "monster-motion-nargacuga-pivot-spin",
      "easing": "linear",
      "origin": "var(--narga-spin-origin-x) 88%"
    },
    "nargacuga-twin-pivot-spin": {
      "name": "monster-motion-nargacuga-twin-pivot-spin",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-dash-bite": {
      "name": "monster-motion-nargacuga-dash-bite",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-flank-charge": {
      "name": "monster-motion-nargacuga-flank-charge",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-offscreen-charge": {
      "name": "monster-motion-nargacuga-offscreen-charge",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-bite-spin-return": {
      "name": "monster-motion-nargacuga-bite-spin-return",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-lunge-finish": {
      "name": "monster-motion-nargacuga-lunge-finish",
      "easing": "linear",
      "origin": null
    },
    "nargacuga-stance-hop": {
      "name": "monster-motion-nargacuga-stance-hop",
      "easing": "linear",
      "origin": null
    },
    "rath-flight-stagger": {
      "name": "monster-motion-rath-flight-stagger",
      "easing": "ease-in-out",
      "origin": null
    },
    "rath-flight-wobble": {
      "name": "monster-motion-rath-flight-wobble",
      "easing": "ease-in-out",
      "origin": null
    },
    "bazel-carpet-bombing": {
      "name": "monster-motion-bazel-carpet-bombing",
      "easing": "linear",
      "origin": null
    }
  }
};
if(typeof window!=='undefined')window.HUNT_MONSTER_PROFILE_KEYFRAMES=HUNT_MONSTER_PROFILE_KEYFRAMES;
if(typeof module!=='undefined')module.exports=HUNT_MONSTER_PROFILE_KEYFRAMES;

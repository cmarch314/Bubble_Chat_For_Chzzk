// BubbleChat visual-effect catalog.
window.HIVE_VISUAL_CONFIG = window.HIVE_VISUAL_CONFIG || {
    "common": {
        "textWrapLimit": 200,
        "cooldown": 1000
    },
    "usho": {
        "gifPath": "./img/usho.gif",
        "videoPath": "./img/usho.mp4",
        "backgroundVideoPath": "./Video/ushoBack.mp4",
        "opacity": 0.8,
        "duration": 19000,
        "scanPhase": 7500,
        "soundKey": "우쇼"
    },
    "godsong": {
        "soundKey": "갓겜송",
        "duration": 14500,
        "audioPath": "./SFX/Chzzk_Signatures/갓겜합시다FULL.mp3",
        "videoPath": "./Video/GodGame.mp4",
        "videoOpacity": 0.7,
        "beetleDelay": 7000,
        "beetleCount": 50,
        "volume": 0.7,
        "images": [
            {
                "src": "./img/GodGame1.png",
                "width": "35%",
                "top": "30%",
                "slide": "left",
                "left": "-5%",
                "transform": "scaleX(-1)",
                "delay": 5000,
                "exitTime": 9000
            },
            {
                "src": "./img/GodGame1.png",
                "width": "35%",
                "top": "30%",
                "slide": "right",
                "right": "-5%",
                "delay": 5000,
                "exitTime": 9000
            },
            {
                "src": "./img/Godgame2.png",
                "width": "45%",
                "bottom": "-5%",
                "slide": "left",
                "left": "0%",
                "transform": "scaleX(-1)",
                "delay": 3500,
                "exitTime": 9000
            },
            {
                "src": "./img/Godgame2.png",
                "width": "45%",
                "bottom": "-5%",
                "slide": "right",
                "right": "0%",
                "delay": 3500,
                "exitTime": 9000
            }
        ]
    },
    "dolphin": {
        "duration": 7000,
        "soundKey": "돌핀",
        "dolphinDelay": 1400,
        "surferStartOffset": 1000,
        "creatureCount": 30,
        "extraCount": 40,
        "fontSize": "2.5rem",
        "creatureSize": "8rem",
        "nametagColor": "#00ffa3",
        "dolphinScale": 1.2,
        "dolphinRotation": 360,
        "bounceSpeed": 1,
        "surfingEmojis": [
            "🏄",
            "🏄‍♂️",
            "🏄‍♀️"
        ],
        "creaturePool": [
            "🦐",
            "🦀",
            "🐡",
            "🐠",
            "🐟",
            "🦑",
            "🐙",
            "🐚",
            "🦞"
        ]
    },
    "skull": {
        "duration": 12000,
        "soundKey": "해골",
        "floatingTextDuration": 4000,
        "fontSize": "10rem",
        "glitchMinDelay": 260,
        "glitchMaxDelay": 780,
        "textScale": 1.5
    },
    "vergil": {
        "duration": 19000,
        "soundKey": "버질",
        "slashCount": 30,
        "shardCount": 20,
        "textDelay": 10000,
        "slashTrembleTime": 5200,
        "explosionTime": 6200,
        "slashStagger": 0.02,
        "shardSpeedMin": 1.5,
        "shardSpeedMax": 2.5,
        "shardDistance": 600
    },
    "heart": {
        "duration": 18000,
        "soundKey": "하트",
        "emojiCount": 1.5,
        "fontSize": "1.5rem",
        "textScale": 1.3,
        "phaseTiming": 11000,
        "phaseInitialDelay": 800,
        "emojiStartDelay": 11000,
        "rotationRange": 60,
        "emojiPool": [
            [
                128512,
                128591
            ],
            [
                129489,
                129489
            ],
            [
                10084,
                10084
            ],
            [
                128147,
                128159
            ],
            [
                128102,
                128105
            ],
            [
                128139,
                128139
            ]
        ]
    },
    "couple": {
        "duration": 21000,
        "soundKey": "커플",
        "fontSize": "13rem",
        "flashbackDuration": 11800,
        "intermediateScale": 1.5,
        "bgOpacity": 0.3,
        "personEmojiRanges": [
            [
                128512,
                128591
            ],
            [
                128102,
                128128
            ],
            [
                129500,
                129503
            ],
            [
                128112,
                128120
            ]
        ],
        "heartEmojiRanges": [
            [
                128147,
                128159
            ],
            [
                10084,
                10084
            ],
            [
                129505,
                129505
            ],
            [
                129293,
                129294
            ],
            [
                128139,
                128141
            ]
        ]
    },
    "valstrax": {
        "soundKey": "발파",
        "duration": 18000,
        "jetDelay": 5000,
        "flashDelay": 6000,
        "starExplodeDelay": 7300,
        "impactDelay": 9800,
        "textAppearDelay": 10500,
        "cloudHeight": 300,
        "cloudSize": 1000
    },
    "bangjong": {
        "duration": 90000,
        "soundKey": "방종송",
        "teostraPath": "./img/Teostra.png",
        "lunastraPath": "./img/Lunastra.png",
        "characterCount": 2,
        "characterSize": "35rem",
        "flameSpeed": "2s"
    },
    "gazabu": {
        "soundKey": "가자부송",
        "audioOverride": "가자부풀버전틀어주세요",
        "backgroundPath": "./Video/가자부.mp4",
        "duration": 8000,
        "opacity": 0.8
    },
    "mulsulsan": {
        "soundKey": null,
        "audioOverride": null,
        "backgroundPath": "./Video/물설산씨티.mp4",
        "duration": 35200,
        "opacity": 0.9
    },
    "dango": {
        "duration": 19000,
        "videoPath": "./Video/Dango.mp4",
        "soundKey": "당고",
        "emojiPool": [
            "🍡",
            "🍺",
            "🌀",
            "💫",
            "🥴",
            "🤢",
            "😵",
            "🤮"
        ],
        "emojiCount": 25,
        "emojiSize": "6rem",
        "videoWidth": "50vw",
        "videoHeight": "50vh",
        "videoOpacity": 0.7
    },
    "king": {
        "duration": 23000,
        "imagePath": "./img/King_Of_MH.png",
        "soundKey": null,
        "audioPath": "./SFX/Chzzk_Signatures/아들아.mp3",
        "volume": 0.7,
        "emojiPool": [
            "❄️"
        ],
        "emojiCount": 100,
        "emojiSize": "50px",
        "delayedEmojiPool": [
            "💩"
        ],
        "delayedEmojiCount": 60,
        "delayedEmojiDelay": 11000
    },
    "random_dance": {
        "soundKey": "랜덤댄스",
        "duration": 18000,
        "cycleInterval": 6100,
        "videoWidth": "28rem",
        "videoHeight": "50rem",
        "bloomOpacity": 0.5,
        "videoBrightness": 1.03,
        "vignetteOpacity": 0.6,
        "sepiaIntensity": 0.3,
        "filmContrast": 1.25,
        "opacity": 0.9,
        "positions": {
            "left": {
                "x": "22%",
                "y": "50%"
            },
            "right": {
                "x": "78%",
                "y": "50%"
            }
        },
        "videoPool": [
            "rd_001.mp4",
            "rd_002.mp4",
            "rd_003.mp4",
            "rd_004.mp4",
            "rd_005.mp4",
            "rd_006.mp4",
            "rd_007.mp4",
            "rd_008.mp4",
            "rd_009.mp4",
            "rd_010.mp4",
            "rd_011.mp4",
            "rd_012.mp4",
            "rd_013.mp4",
            "rd_014.mp4",
            "rd_015.mp4",
            "rd_016.mp4",
            "rd_017.mp4",
            "rd_018.mp4",
            "rd_019.mp4",
            "rd_020.mp4",
            "rd_021.mp4",
            "rd_022.mp4",
            "rd_023.mp4",
            "rd_024.mp4",
            "rd_025.mp4",
            "rd_026.mp4",
            "rd_027.mp4",
            "rd_028.mp4",
            "rd_029.mp4",
            "rd_030.mp4",
            "rd_031.mp4",
            "rd_032.mp4",
            "rd_033.mp4",
            "rd_034.mp4",
            "rd_035.mp4",
            "rd_036.mp4",
            "rd_037.mp4",
            "rd_038.mp4",
            "rd_039.mp4",
            "rd_040.mp4",
            "rd_041.mp4",
            "rd_042.mp4",
            "rd_043.mp4",
            "rd_044.mp4",
            "rd_045.mp4",
            "rd_046.mp4",
            "rd_047.mp4",
            "rd_048.mp4",
            "rd_049.mp4",
            "rd_050.mp4",
            "rd_051.mp4",
            "rd_052.mp4",
            "rd_053.mp4",
            "rd_054.mp4",
            "rd_055.mp4",
            "rd_056.mp4",
            "rd_057.mp4",
            "rd_058.mp4",
            "rd_059.mp4",
            "rd_060.mp4",
            "rd_061.mp4",
            "rd_062.mp4",
            "rd_063.mp4",
            "rd_064.mp4",
            "rd_065.mp4",
            "rd_066.mp4",
            "rd_067.mp4",
            "rd_068.mp4",
            "rd_069.mp4",
            "rd_070.mp4",
            "rd_071.mp4",
            "rd_072.mp4",
            "rd_073.mp4",
            "rd_074.mp4",
            "rd_075.mp4",
            "rd_076.mp4",
            "rd_077.mp4",
            "rd_078.mp4",
            "rd_079.mp4",
            "rd_080.mp4",
            "rd_081.mp4",
            "rd_082.mp4",
            "rd_083.mp4",
            "rd_084.mp4",
            "rd_085.mp4",
            "rd_086.mp4",
            "rd_087.mp4",
            "rd_088.mp4",
            "rd_089.mp4",
            "rd_090.mp4",
            "rd_091.mp4",
            "rd_092.mp4",
            "rd_093.mp4",
            "rd_094.mp4",
            "rd_095.mp4",
            "rd_096.mp4",
            "rd_097.mp4",
            "rd_098.mp4",
            "rd_099.mp4",
            "rd_100.mp4",
            "rd_101.mp4",
            "rd_102.mp4"
        ]
    }
};

window.HUNT_COMBO_LIST = {
    great_sword: [
        { name: "발차기", dmg: 70, sharp: 0, stun: 20, nextSpeed: "very_fast", soundKey: ["발차기!"], special: "🦶 [발차기] 매우 빠른 발차기로 몬스터의 턱을 걷어찹니다!" },
        { name: "모아베기", dmg: 290, sharp: -8, stun: 10, nextSpeed: "slow", soundKey: ["아주강력해", "기가맥", "개꿀잼"] },
        { name: "강모아베기", dmg: 420, sharp: -10, stun: 20, nextSpeed: "slow", soundKey: ["아주강력해", "성공!", "개꿀잼"], special: "💥 [강모아베기] 더욱 힘을 실은 모아베기로 몬스터를 강하게 내려칩니다!" },
        { name: "참모아베기", dmg: 680, sharp: -15, stun: 30, nextSpeed: "slow", soundKey: ["아주강력해", "성공!", "상쾌해", "개꿀잼"], special: "💥 [역경직] 파괴적인 참모아베기가 몬스터에게 작렬합니다!" }
    ],
    long_sword: [
        { name: "세로베기", dmg: 100, sharp: -3 },
        { name: "기인베기 I", dmg: 140, sharp: -4 },
        { name: "기인베기 II", dmg: 180, sharp: -4 },
        { name: "기인투구깨기", dmg: 480, sharp: -12, special: "⚡ [연타] 붉은 기인 게이지를 격발시켜 투구깨기 찌르기를 먹였습니다!" }
    ],
    sword_shield: [
        { name: "돌진베기", dmg: 70, sharp: -2, stun: 0 },
        { name: "방패치기", dmg: 60, sharp: 0, stun: 60, special: "🛡️ [방패타격] 방패 모서리로 몬스터의 정수리를 강하게 들이받습니다!" },
        { name: "저스트 러시 I", dmg: 120, sharp: -3, stun: 0 },
        { name: "저스트 러시 II", dmg: 160, sharp: -3, stun: 0 },
        { name: "폴배시 (방패강습)", dmg: 380, sharp: -8, stun: 90 }
    ],
    dual_blades: [
        { name: "귀인화 진입", dmg: 60, sharp: -2, special: "👹 [귀인화] 안개를 뿜어내며 기동성과 파괴력을 극대화합니다!" },
        { name: "귀인돌진연참", dmg: 150, sharp: -6 },
        { name: "귀인 난무", dmg: 460, sharp: -16, special: "🌀 [난무] 제자리에서 몬스터의 약점을 잘게 썰어 대량의 출혈을 냅니다!" },
        { name: "공중 회전 난무 (리와이베기)", dmg: 520, sharp: -18, special: "💫 [리와이베기] 공중으로 도약, 몬스터 위에서 고속 회전 난무를 퍼붓습니다!" }
    ],
    hammer: [
        { name: "쿵 쿵 따", dmg: 260, sharp: -6, stun: 50 },
        { name: "키프 스웨이", dmg: 70, sharp: -2, stun: 10, special: "🌀 [키프 스웨이] 해머를 든 채 빠르게 옆으로 회전하며 회피 기동을 실행합니다!" },
        { name: "2차지 어퍼!", dmg: 210, sharp: -5, stun: 60 },
        { name: "3차지 내려치기", dmg: 380, sharp: -8, stun: 90 },
        { name: "회전 회오리!!!", dmg: 620, sharp: -15, stun: 180, special: "🌀 [회전회오리] 온 힘을 실어 공중으로 도약해 해머를 7회 연속 회전시키며 몬스터의 정수리를 분쇄합니다!" }
    ],
    hunting_horn: [
        { name: "음표 공격 I (적)", dmg: 90, sharp: -3, stun: 20, special: "🎵 [자가강화] 신나는 연주로 파티원 전원의 이동 속도를 증가시킵니다." },
        { name: "향음타 (피리 연주 회복)", dmg: 120, sharp: -4, stun: 30, special: "🎵 [피리 연주 회복] 향음 연주를 격발시켜 파티원 전체의 체력을 회복시킵니다! (+25 HP)" },
        { name: "삼중 연주 (공격력 UP)", dmg: 380, sharp: -8, stun: 80, special: "🎺 [공대UP] 공격력 대폭 상승 연주 버프를 아군 전체에 적용합니다!" }
    ],
    charge_blade: [
        { name: "검 모아 2단베기", dmg: 130, sharp: -4, nextSpeed: "very_fast" },
        { name: "방패치기", dmg: 90, sharp: 0, stun: 30, nextSpeed: "very_fast" },
        { name: "병충전", dmg: 0, sharp: 0, nextSpeed: "very_fast", special: "⚡ [병충전] 검 격침 게이지를 병에 주입하여 phial을 모두 충전합니다! (병 5개 충전)" },
        { name: "변형 (검→도끼)", dmg: 150, sharp: -5, special: "⚙️ [속성변형] 검과 방패를 합체하여 거대한 도끼 모드로 변형합니다!", nextSpeed: "slow" },
        { name: "도끼 속성해방베기 I", dmg: 220, sharp: -6, nextSpeed: "slow" },
        { name: "고출력 속성해방베기", dmg: 350, sharp: -8, nextSpeed: "slow", special: "⚡ [고출력] 축적된 에너지를 해방하여 몬스터에게 강한 충격파를 방출합니다!" },
        { name: "초고출력 속성해방베기", dmg: 400, sharp: -15, special: "💥 [초고출력] 병 전량을 일시에 격발해 지면을 내리치며 대자연의 전격을 방출합니다!", nextSpeed: "slow" },
        { name: "변형 (도끼→검)", dmg: 120, sharp: -3, special: "⚙️ [속성변형] 도끼를 분리하여 가벼운 검과 방패의 검 모드로 변형합니다!", nextSpeed: "very_fast" }
    ],
    lance: [
        { name: "중단찌르기", dmg: 100, sharp: -3 },
        { name: "상단찌르기", dmg: 105, sharp: -3 },
        { name: "가드 대시", dmg: 60, sharp: -2, special: "🛡️ [가드 전진] 견고한 대형 방패로 정면을 밀치며 방어 태세를 유지합니다." },
        { name: "돌진 피니시 찌르기", dmg: 350, sharp: -8 }
    ],
    gunlance: [
        { name: "수평찌르기", dmg: 90, sharp: -3 },
        { name: "포격 (방어무시)", dmg: 160, sharp: -6, special: "🔥 [포격] 포신 내 탄약 화염으로 육질을 무시하는 충격파를 입힙니다." },
        { name: "풀버스트", dmg: 480, sharp: -18, special: "💥 [풀버스트] 장전된 잔탄을 일시에 격발해 대규모 화력 폭발을 냅니다!" },
        { name: "용격포", dmg: 680, sharp: -25, special: "💥 [용격포] 전탄 압축 화염을 격발하여 대재앙의 열량을 방출합니다! (30초간 과열)" }
    ],
    switch_axe: [
        { name: "도끼 세로베기", dmg: 120, sharp: -4 },
        { name: "검 변형 2단베기", dmg: 230, sharp: -6 },
        { name: "기 속성 해방 찌르기", dmg: 520, sharp: -12, special: "⚡ [해방] 검날을 쑤셔 넣고 톱니가 구르며 거대한 속성 폭발을 터트립니다!" }
    ],
    insect_glaive: [
        { name: "진액 추출", dmg: 80, sharp: -2, special: "🐝 [진액] 엽충을 부려 몬스터의 몸에서 3색 진액을 모아 도핑합니다." },
        { name: "비원베기", dmg: 180, sharp: -4 },
        { name: "급습찌르기 (강하)", dmg: 420, sharp: -8 }
    ],
    light_bowgun: [
        { name: "일반탄 사격", dmg: 100, ammo: -1 },
        { name: "기폭용탄 설치", dmg: 180, ammo: -1, special: "💣 [기폭용탄] 아군 탄환 공격에 유도 감응하여 기폭되는 유탄 지뢰를놓습니다." },
        { name: "속사 (일반탄)", dmg: 340, ammo: -2 }
    ],
    heavy_bowgun: [
        { name: "기관용탄 장전 (특수)", dmg: 60, ammo: -1 },
        { name: "기관용탄 난사", dmg: 420, ammo: -3, special: "🔫 [기관용탄] 게틀링 총신을 회전시키며 전방에 무수한 철갑탄을 연사합니다!" },
        { name: "용격탄 사격", dmg: 580, ammo: -1, special: "💥 [용격탄] 짧고 무거운 압축 용격포를 격발시켜 적을 충격에 흔듭니다!" }
    ],
    bow: [
        { name: "차지 샷", dmg: 90 },
        { name: "강사", dmg: 160 },
        { name: "용의 화살 (풀 차지)", dmg: 410, special: "🏹 [용의화살] 기를 모아 온 몸을 관통해 나가는 초장거리 회전 화살을 발사합니다!" }
    ]
};

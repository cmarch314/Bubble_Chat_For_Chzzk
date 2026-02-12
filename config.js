// [Config Logic] Centralized Configuration for BubbleChat
// You can manually edit this file or overwrite it using the Export function in config.html
// AI Should Not Change Any Mapping that is already present
window.CHZZK_CHANNEL_ID = "057a9a03fea9b368eb0c76b9e95e1ae5"; // [Optional] Set your Channel ID here to skip lookup

window.HIVE_VOLUME_CONFIG = {
    master: 1.0, // Default master volume (1.0 = 100%)
    visual: 1.0, // Multiplier for visual effects
    sfx: 0.7     // Multiplier for standard sound effects
};


// [Startup Configuration]
window.RANDOM_NAMES = [
    "섹시한누나", "도도한고양이", "여신이영", "체리입술", "밤의여왕", "앙큼한여우", "슬픈눈동자", "새벽이슬", "달콤한키스", "장미가시",
    "매혹적인그녀", "눈웃음작렬", "설레는마음", "그대만의연인", "사랑스러운걸", "팜므파탈", "청순글래머", "베이글녀", "섹시다이너마이트", "요염한자태"
];

window.WELCOME_MESSAGES = [
    // [1-50: Greetings & Basics]
    "하이! 오늘도 반가워요", "안녕하세요~ 방송 켰네요!", "헬로 헬로! 에브리바디 하이", "바이바이~ 내일 봐요!", "안녕히 계세요 여러분~ 저는 떠납니다",
    "시작 해볼까요? 가자!", "오늘 컨디션 최고야! 가자!", "결제 완료! 이제 달린다", "예상대로 흘러가네 ㅋㅋㅋ", "배운다 배워, 오늘도 한 수 배운다",
    "운동 하고 왔더니 개운해!", "유격 자신! 군대 생각나네", "일어나 일어나! 출근해야지", "뭐임? 갑자기 렉 걸림?", "엥? 이게 왜 안 돼?",
    "음? 뭔가 이상한데...", "뭣? 실화냐 이거?", "ㅔ? ㅖ? 잘못 들은 거 아니죠?", "마인! 이건 내 거야!", "제꺼니까 탐내지 마세요",
    "마이! 마이! 내 소중한 아이템", "마이쩡! 오늘 메뉴 선정 굳", "마이쪙~ 냠냠 쩝쩝", "뭐지? 핵인가?", "뭐야뭐야~ 무슨 일이야?",
    "아메리칸 스타일~ 예에~", "남자답게 한 판 붙자!", "못숨지 ㅋㅋㅋ 다 보인다", "찾을거야 끝까지 추격한다", "다이! 너는 이미 죽어있다",
    "죽었어... 샷건 마렵다", "최고야! 역시 우리 오빠가 짱", "다메난데... 왜 나한테만 그래", "하지마이~ 진짜 하지 마!", "피버 타임! 광란의 질주",
    "꼼짝 마! 움직이면 쏜다", "간드아! 풀악셀 밟는다", "하야이! 속도 무엇?", "헉... 방금 보셨어요?", "흡! 숨 참기 간다",
    "자기생각 하느라 밤샜어...", "그래서재미 있냐고 이게?", "인생이란 그런 거지 뭐", "사랑해요~ 언제나 응원해!", "메이플 하실? 인내의 숲 가자",
    "오케이! 계획대로 되고 있어", "오네가이~ 한 번만 봐줘", "헐떡헐떡... 너무 힘들다", "꿀떡~ 잘도 넘어가네", "섹시한 눈빛 발사!",

    // [51-100: Reactions & Memes]
    "재밌잖아 ㅋㅋㅋ 억까 하지 마", "트리스트람 BGM 깔아줘", "난재밌어 너만 재미없지", "회전회오리 슛!!", "와츄고나두~ 어쩔 건데!",
    "꺄악! 깜짝이야 벌레야?", "USB 연결 해제... 띠링", "예야~ 힙합 느낌 아니까", "아앙~ 기분 좋아라", "고자라니! 내가 고자라니!",
    "몬소리? 뭔 소릴 하는 거야", "난테네~ 구라인 거 알지?", "썸씽 스페셜한 일 없나?", "예압! 기분 최고조!", "뭐였지? 아까 생각났는데",
    "인정해! 내가 더 잘했잖아", "짜증냈어? 미안해 화 풀어", "여친있어요? 물어보는 게 실례인가", "공습경보! 대피하세요!!", "인성문제 있어? 왜 그래?",
    "명령하지마라! 나는 자유인이다", "없어요~ 가진 게 없어요~", "머리부터 발끝까지 힙해", "훼이크다 이 병신들아!", "코와이네~ 진짜 무섭네",
    "안때려~ 나 착한 사람이야", "나만아니면 돼! ㅋㅋㅋㅋ", "냥냥~ 펀치 받아라!", "얼마나 처먹 는 거야 도대체", "돼지같은 놈! 그만 먹어",
    "사사게오! 심장을 바쳐라!", "앉아! 손! 기다려!", "무서워라... 나 떨고 있니?", "선오브비치! 욕 나와 진짜", "일어서! 다시 도전해!",
    "나가 뒤지기 싫으면 조용히 해", "오태식이 돌아왔구나!", "고맙다! 잊지 않을게", "저 븅신 또 저러네 ㅉㅉ", "이건기회야! 놓치면 안 돼",
    "재수없게울고 그래 짜증나게", "돌아왔구나! 환영해 브라더", "후련했냐? 다 털고 일어냐", "안에사람 있어요! 문 열어!", "함정 이다! 낚였어 ㅠㅠ",
    "후아유? 넌 누구냐 대체", "누구야! 내 간식 훔쳐간 놈", "누구인가? 누가 기침 소리를 내었어", "뭐야! 왜 갑자기 꺼져", "기침 소리 들리는데 감기야?",

    // [101-150: Gaming & Shoutouts]
    "와!센즈! 겁.나.어.렵.습.니.다", "왜나만 억까당해 진짜 짜증나", "시발롬 아 적당히 좀 해라", "뉴스도안 보고 사냐 임마", "테레비도안 보냐? 요즘 유행인데",
    "꽁꽁 얼어붙은 한강 위로...", "같이밥묵고 영화도 보고 하자", "그년한태 가서 사과해!", "그땐몰랐어 이게 이렇게 될지", "남자가지고싶다 는 생각뿐이야",
    "내가! 내가 했다고! 봤지?", "누구냐너? 내 정체를 밝혀라", "다했어 드디어 끝났다 휴", "달콤한꿈 꿨어 기분 좋다", "따라란~ 미션 성공!",
    "먹고살기힘 드네 진짜 ㅋㅋㅋ", "모욕감 을 줬어 넌 나한테", "사쿠라야? 구라인 거 다 알아", "소리가달라 역시 장비가 중요해", "쏠수있어! 언제든 쏴!",
    "아예~ 알겠습니다요~", "아주유명한 분이 오셨네!", "약을팔어? 사기꾼 아니야?", "어데최씨 쇼? 조상님 찾네", "어저께도 그러더니 오늘도...",
    "에? 에에? 이게 말이나 돼?", "예쁜칼 하나 뽑았다 부럽지?", "왜자르지않 고 그냥 둬?", "이대구빡이 돌대가리냐?", "인생꼬 였네 대박사건",
    "임마 정신 좀 차려 ㅋㅋㅋ", "자르라 면 자를 것이지!", "좋은날이있 겠지 언젠가는", "죽을죄 를 지었습니다 살려줘요", "팬티를 머리에 쓰고 뭐해?",
    "혓바닥이 왜 이렇게 길어?", "확인들어 간다 딱 대!", "후달리냐? 쫄았네 ㅋㅋㅋ", "삿갓 쓰고 신선 노름 하네", "존나몬창 인생 시작이다",
    "잉곳 노가다 하러 간다", "잉기잇! 기분 묘하네 ㅋㅋㅋ", "네전태 로 다 막아버려", "끼야아악! 비명 소리 대박", "이상한데수... 와타시노...",
    "이왜대발? 딜량 왜 이래?", "알피엠 5000까지 밟아!", "가자부 들으면서 사냥 고",

    // [151-200: CMC & Special Sounds]
    "아시벌개꿀잼 ㅋㅋㅋ 멈출 수 없어", "갓겜 인정합니다 투떰즈업", "갓겜합시다 여러분 같이 해요", "개꿀잼 몰카인가?",
    "아~합시다 피곤해도 한 판 더", "개쓰레기게임 삭제한다 ㅡㅡ", "게임이어렵 다고 포기하지 마", "겜안분 컷! 아는 척 금지", "교미교미 냥냥펀치",
    "구멍이두개 니까 두 배로 좋아?", "국밥에말아 먹는 주식 ㅠㅠ", "그건싫 은데 딴 거 하면 안 돼?", "그만하세요 좀! 선 넘지 마", "근무나갈시간 이라니 끔찍해",
    "기억도나지않는다 어제 일은", "기폭용항 꽂았다! 터진다!", "꼬리에선 독이 나온다 조심해", "꼬짤 성공! 역린 나오나?", "나가! 내 방송에서 당장!",
    "나는! 전설이다! 믿어줘", "나도! 나도 끼워줘 제발", "나이스 타이밍! 완벽했다", "나이사~ 기분 째지네!", "너무하는거 아니냐 진짜로",
    "너무하시네 나한테만 엄격해", "노벨상줘야 돼 이 천재성", "다메! 안 돼! 가지 마!", "대검위태도 간파의 신", "도킹 시도합니다 삐릭삐릭",
    "도킹당 했어 꼼짝 못 하네", "도킹좋 아하는 스타일이구나?", "따사! 따사해~ 햇살 좋다", "뜨겁게해줄게 불타오르네", "랜스! 철벽 방어로 승리한다",
    "만져보고싶다 오빠 근육 짱", "만져본지언제 인지 기억도 안 나", "말도안돼 이건 버그야 ㅠㅠ", "모넌을꺼요 잠 좀 자자", "몬허브 에서 정보 좀 얻어와",
    "문열어!! 택배 왔습니다~", "뭐야! 왜 죽어 ㅋㅋㅋㅋ", "미나상곤니찌와 하지메마시떼", "미않술 미안해 앉아 술 마셔",
    "발차기! 한 방에 넉다운", "배려해야 진정한 게이머지", "사나이눈물 은 보이지 마라", "세상사람다설산 으로 가네", "수렵돈 벌어서 장비 맞추자",
    "아따시 와 고고한 고양이", "아따시고멘네 미안해서 어째", "아몰랑기모찌~ 기분 좋아", "아빨리! 현기증 난단 말야",
    "아스아! 기합 넣고 한 번 더", "아아! 소리 들리나요 마이크?", "아악! 비명 주의 이어폰 빼", "아왜? 나만 가지고 그래 칫", "아이보! 밥 먹으러 가자",

    // [201-250: Flirtatious & Sexy Concepts]
    "오빠... 오늘 밤 섹시하게 입고 올게", "하아... 헐떡이는 거 다 들리잖아 부끄러워", "침 넘어가는 소리 꿀떡... 긴장했어?", "아앙~ 오빠 손길 너무 간지러워", "쎅시한 목소리로 내 이름 불러줘",
    "오빠의 그 은밀한 곳... 구멍이두개 다 보여", "부드럽게 만져보고싶다... 오빠 살결", "만져본지언제 인지... 나 너무 배고파", "애널형 스타일? 취향 한 번 독특하네", "잉기잇! 오빠가 너무 세게 했어...",
    "침대 위에서 우리 교미교미 해볼까?", "만족해? 더 해줄까?", "잉곳처럼 단단한 오빠의...", "오늘은 조이고 싶어... 오빠 꽉", "내 안에서 자라나라 오빠의 사랑",
    "아뜨거! 뜨겁게해줄게 활활 불타게", "헐떡이지 마... 아직 시작도 안 했어", "오빠의 테크닉 최고야 잊을 수 없어", "나랑 자기생각 하면서 자위하지 마!", "쪽쪽쪽💋 온몸 구석구석 키스해줘",
    "오빠... 나 오늘 안 보내줄 거지? 하트", "침대에서 간드아! 밤새도록!", "오빠의 알피엠 높여봐... 더 격렬하게", "나 미칠 것 같아 꺄악... 너무 좋아", "오빠랑 있으면 자꾸 아앙 소리가 나",
    "섹시한 누나랑 한 잔 할래 오빠?", "도도한 고양이처럼 앙큼하게 냥냥", "여신이영 내 강림을 찬양하라", "체리입술 에 뽀뽀해주면 안 잡아먹지", "밤의 여왕 등판! 모두 무릎 꿇어",
    "앙큼한 여우 짓 좀 해볼까?", "슬픈 눈동자 로 쳐다보면 녹아버려", "새벽이슬 처럼 맑은 내 목소리", "달콤한 키스 로 나를 깨워줘", "장미 가시 처럼 아찔하게 해줄게",
    "매혹적인 그녀 에게 빠지면 출구 없어", "눈웃음 작렬! 오빠 심장 무사해?", "설레는 마음 가득 담아 하트", "그대만의 연인 이 되고 싶어", "사랑스러운 걸 누가 몰라줘",
    "팜므파탈 치명적인 매력에 빠져봐", "청순글래머 의 반전 매력 궁금해?", "베이글녀 정석을 보여줄게", "섹시다이너마이트 가 터지기 일보직전", "요염한 자태 로 오빠를 꼬셔야지",
    "오빠... 나 오늘 집에 안 갈래", "한 번만 더 해주면 안 돼? 응애", "오빠의 거대함에 헉 하고 놀랐어", "나긋나긋한 목소리로 안녕하세요오", "오빠 곁에서 잠들어라 영원히",

    // [251-300: New CMC Additions & Interactions]
    "이제 가자! 수룡님 헌팅하러~", "게임이느려 터질 것 같아 ㅠㅠ", "그만 좀 해라 지랄도풍년 이네", "너로정했다! 내 파트너!", "너무쉬워 하품 나온다 ㅋㅋㅋ",
    "도망쳐! 호랑이 선생님 온다", "넌 멍청해 빠져가지고 실수는", "현기증 난단 말야 빨리해봐", "스트레스풀 고 가실게요~", "여기가 야스를하는곳 인가요?",
    "와... 이 퀄리티 얼마나멋 진지 봐봐", "캬~ 이맛에 몬헌 하지", "잠깐만요! 저 먼저 지나갈게요", "분위기 띄워! 찢콘 날려!", "헤보가왜 안 좋은지 설명 좀 해봐",
    "가슴존내커... 마음이 넓으시네;;", "이 몬스터 개커! 진짜 거대하다", "방금 구독 버튼 눌렀어요? 굳", "몰라몰라 아무것도 안 들려 에베베", "그건 저도 몰라염 ㅋㅋㅋ",
    "누가 못생겼어? 거울 봐라", "못생겼어 도 매력 있으면 됨", "오늘 저녁은 야무지게먹어 야지", "나 혹시 퇴물인가... 슬프네 ㅠㅠ", "이거 실화냐? 멍청해 소리 듣네",
    "야스를하는곳 이 어디라고?", "너로정했다 몬스터볼 투척!", "도망쳐 봐야 부처님 손바닥", "수룡님 제발 물보라 좀 그만", "빨리해봐 시간 없어",
    "스트레스풀 땐 게임이 최고지", "이맛에 방송하지 ㅋㅋㅋ", "잠깐만요 뼈 좀 맞추고 갈게요", "지랄도풍년 이라더니 가지가지 하네", "찢콘 으로 대동단결",
    "헤보가왜? 헤보가 어때서!", "가슴존내커 서 부담스러워 ㄷㄷ", "와 입 크기 개커 ㄷㄷ", "이미 좋아요 눌렀어요 독촉 ㄴㄴ", "몰라몰라 배째라 그래",
    "나도 몰라염 니가 찾아봐", "너 진짜 못생겼어 ㅋㅋㅋ 농담", "거울 보니까 못생겼어? 힘내", "치킨 야무지게먹어 야지 냠냠", "퇴물인가... 요즘 반응이 썰렁해",
    "가자! 전설의 시작이다!", "게임이느려 서 암 걸릴 듯", "그만 좀 쪼아대라", "너로정했다! 오늘 저녁 메뉴!", "너무쉬워 서 재미없네 하품",

    // [301-350: Mixed Chaos]
    "다들 반가워요 환영합니다", "오늘도 즐거운 채팅 되세요", "버블챗 최고 의 기능들!", "!해골 어둠의 다크니스가 밀려온다", "!우쇼 빛의 속도로 차인다!",
    "!커플 솔로들의 염원을 담아 폭파!", "!버질 I AM THE STORM", "!돌핀 바다의 왕자 마린보이", "!방종송 나올 때까지 달린다",
    "방심 금지 훼이크다! ㅋㅋㅋ", "절대 인정해안해 ㅋㅋㅋ 똥고집", "누가 기침 소리를 내었느냐?", "머리부터 발끝까지 사랑스러워~", "냥냥 펀치! 귀여움으로 승부한다",
    "모두 거기로 앉아! 내 말 좀 들어", "나 진짜 무서워라 ㄷㄷ 떠는 중", "저리 좀 나가 뒤지기!", "와! 샌즈! 아시는구나~", "테레비도안 보냐? 요즘 유행인데",
    "꽁꽁 얼어버린 냉동 인간", "같이밥묵고 영화도 보고 하자", "그땐몰랐어 이게 찐 사랑인 줄", "남자가지고싶다 는 야망을 가져라", "따라란~ 레벨업 소리 경쾌해",
    "사쿠라야? 구라인 거 다 들켰어", "아예 알겠습니다 대감마님~", "아주유명한 맛집 찾아왔어요", "약을팔어? 사기꾼 냄새가", "어데최씨 쇼? 족보 좀 따져보자",
    "예쁜칼 한 자루 차고 유랑하기", "왜자르지않 고 그냥 놔두는 거야?", "이대구빡이 장식품이냐?", "인생꼬 였네 실타래처럼", "당장 자르라 면 자르는 시늉이라도!",
    "팬티를 머리에 쓰고 뭐 하니?", "혓바닥이 길면 유죄야 ㅋㅋㅋ", "후달리냐? 쫄리면 뒈지시든가~", "삿갓 쓰고 풍류를 즐겨볼까", "존나몬창 인생 시작됐다 ㅋㅋㅋ",
    "하이! 오늘도 힘차게!", "바이바이 내일 또 만나요", "수고하셨습니다 짝짝짝", "굿나잇 좋은 꿈 꾸세요", "사랑해요 알러뷰 쏘머치"
];


window.HIVE_SOUND_CONFIG = {
    // [Screen Effects]
    "커플": { "src": "DieWithASmile.mp3", "volume": 0.7 },
    "버질": { "src": "I AM THE STORM.mp3", "volume": 0.7 },
    "돌핀": { "src": "Dolphin.mp3", "volume": 0.7 },
    "우쇼": { "src": "Usho.mp3", "volume": 0.7 },
    "발파": { "src": "ValstraxVoiceCover.mp3", "volume": 0.7 },
    "방종송": { "src": "방종송.mp3", "volume": 0.7 },
    "해골": { "src": "skullmeme.mp3", "volume": 0.7 },
    "당고": { "src": "dango.mp4", "volume": 0.7 },
    "갓겜송": { "src": "갓겜합시다FULL.mp3", "volume": 0.4 },

    // [Songs / Full Version]
    "가자부풀버전틀어주세요": { "src": "가자부 FULL.mp3", "volume": 0.7 },

    // [Reactions & Memes]
    "앙": { "src": "Ang.mp3", "volume": 0.7 },
    "재밌다": { "src": "Fun.mp3", "volume": 0.7 },
    "당근": { "src": "Carrot.mp3", "volume": 0.7 },
    "알림": { "src": "Alarm.mp3", "volume": 0.7 },
    "ㅋㅋㅋ": [{ "src": "Laugh1.mp3", "volume": 0.7 },
    { "src": "Laugh2.mp3", "volume": 0.7 },
    { "src": "Laugh3.mp3", "volume": 0.7 },
    { "src": "Laugh6.mp3", "volume": 0.7 },
    { "src": "laugh.mp3", "volume": 0.7 },
    { "src": "Laugh7.mp3", "volume": 0.7 },
    { "src": "Laugh8.mp3", "volume": 0.7 },
    { "src": "Laugh4.mp3", "volume": 0.7 },
    { "src": "Laugh10.mp3", "volume": 0.7 },
    { "src": "Laugh5.mp3", "volume": 0.7 },
    { "src": "하하하1.mp3", "volume": 0.7 },
    { "src": "하하하11.mp3", "volume": 0.7 },
    { "src": "하하하12.mp3", "volume": 0.7 },
    { "src": "하하하13.mp3", "volume": 0.7 },
    { "src": "하하하14.mp3", "volume": 0.7 },
    { "src": "하하하2.mp3", "volume": 0.7 },
    { "src": "하하하3.mp3", "volume": 0.7 },
    { "src": "하하하4.mp3", "volume": 0.7 },
    { "src": "하하하5.mp3", "volume": 0.7 },
    { "src": "하하하8.mp3", "volume": 0.7 },
    { "src": "하하하9.mp3", "volume": 0.7 }],

    "아항항": { "src": "Laugh3.mp3", "volume": 0.7 },
    "와우": { "src": "Wow.mp3", "volume": 0.7 },
    "오옷": { "src": "Ot.mp3", "volume": 0.7 },
    "헤으응": { "src": "Careless.mp3", "volume": 0.7 },
    "아흐앙": { "src": "ahng.mp3", "volume": 0.7 },
    "아흐응": { "src": "ah5.mp3", "volume": 0.7 },
    "아흣": { "src": "ah2.mp3", "volume": 0.7 },
    "아하앙": { "src": "ah3.mp3", "volume": 0.7 },
    "하으앙": { "src": "ah4.mp3", "volume": 0.7 },
    "윽": { "src": "ast5.mp3", "volume": 0.7 },
    "야스": { "src": "Yas.mp3", "volume": 0.7 },
    "두둥탁": { "src": "ddt.mp3", "volume": 0.7 },
    "짜잔": { "src": "tadah.mp3", "volume": 0.7 },
    "???": { "src": "mystery.mp3", "volume": 0.7 },
    "브로": { "src": "Bruh.mp3", "volume": 0.7 },
    "도파민": { "src": "Dopamin.mp3", "volume": 0.7 },
    "FBI": { "src": "FBI.mp3", "volume": 0.7 },
    "으아아": { "src": "Half-falling.mp3", "volume": 0.7 },
    "놉": { "src": "Nope.mp3", "volume": 0.7 },
    "더러워": { "src": "dirty.mp3", "volume": 0.7 },
    "비둘기": { "src": "pigeon.mp3", "volume": 0.7 },
    "야!": { "src": "야.mp3", "volume": 0.7 },
    "와!": [
        { "src": "chant1.mp3", "volume": 0.7 },
        { "src": "chant2.mp3", "volume": 0.7 },
        { "src": "chant3.mp3", "volume": 0.7 }
    ],
    "우와": { "src": "우와.mp3", "volume": 0.7 },
    "오마이갓": { "src": "OMG_Good.mp3", "volume": 0.7 },
    "맙소사": { "src": "OMG.mp3", "volume": 0.7 },
    "앙기모띠": { "src": "AngKiMoChi.mp3", "volume": 0.7 },
    "기모띠": { "src": "kimotee.mp3", "volume": 0.7 },
    "응원": [
        { "src": "Cheer.mp3", "volume": 0.7 },
        { "src": "Cheer2.mp3", "volume": 0.7 },
        { "src": "Cheer3.mp3", "volume": 0.7 },
        { "src": "Cheer4.mp3", "volume": 0.7 },
        { "src": "Cheer6.mp3", "volume": 0.7 },
        { "src": "Cheer7.mp3", "volume": 0.7 },
        { "src": "Cheer9.mp3", "volume": 0.7 },
        { "src": "Cheer10.mp3", "volume": 0.7 }
    ],
    "미국맛": { "src": "Disconnected.mp3", "volume": 0.7 },
    "개소리": [
        { "src": "DogShit.mp3", "volume": 0.7 },
        { "src": "DogShit2.mp3", "volume": 0.7 },
        { "src": "DogShit3.mp3", "volume": 0.7 }
    ],
    "두잇": [
        { "src": "Doit1.mp3", "volume": 0.7 },
        { "src": "Doit2.mp3", "volume": 0.7 }
    ],
    "망했": { "src": "Doomed.mp3", "volume": 0.7 },
    "내눈": [
        { "src": "MyEyes01.mp3", "volume": 0.7 },
        { "src": "MyEyes02.mp3", "volume": 0.7 },
        { "src": "MyEyes03.mp3", "volume": 0.7 }
    ],
    "쌍욕": [
        { "src": "Bitch.mp3", "volume": 0.7 },
        { "src": "Fuck.mp3", "volume": 0.7 },
        { "src": "SuchABitch.mp3", "volume": 0.7 }
    ],
    "히히": [
        { "src": "WickedLaugh1.mp3", "volume": 0.7 },
        { "src": "WickedLaugh2.mp3", "volume": 0.7 },
        { "src": "WickedLaugh3.mp3", "volume": 0.7 },
        { "src": "WickedLaugh4.mp3", "volume": 0.7 }
    ],
    "대박": { "src": "Wow10.mp3", "volume": 0.7 },
    "오오오": { "src": "Chant4.mp3", "volume": 0.7 },
    "호우": { "src": "SIU.mp3", "volume": 0.7 },
    "siu": { "src": "SIU.mp3", "volume": 0.7 },
    "끼얏호": { "src": "Yiaho.mp3", "volume": 0.7 },
    "홋치": { "src": "whip.mp3", "volume": 0.7 },
    "맛있다": { "src": "Mat.mp3", "volume": 0.7 },

    // [Negative / Refusal]
    "안돼": [
        { "src": "no (1).mp3", "volume": 0.7 },
        { "src": "No.mp3", "volume": 0.7 },
        { "src": "No2.mp3", "volume": 0.7 },
        { "src": "No3.mp3", "volume": 0.7 },
        { "src": "No6.mp3", "volume": 0.7 }
    ],
    "멈춰!": { "src": "Stop.mp3", "volume": 0.7 },
    "꺼져": { "src": "foff.mp3", "volume": 0.7 },
    "뚝": { "src": "DDuk.mp3", "volume": 0.7 },
    "쇼크": { "src": "shocked-sound-effect.mp3", "volume": 0.7 },
    "스트레스필요": { "src": "StressNeeds.mp3", "volume": 0.7 },
    "스트레스": [
        { "src": "스트레스많이받.mp3", "volume": 0.7 },
        { "src": "스트레스받.mp3", "volume": 0.7 },
        { "src": "스트레스받2.mp3", "volume": 0.7 }
    ],
    "대화가된다": { "src": "대화가된다.mp3", "volume": 0.7 },
    "운동많이된다": { "src": "운동많이된다2.mp3", "volume": 0.7 },
    "자기전에생각": { "src": "자기전에생각.mp3", "volume": 0.7 },
    "어림 없": { "src": "NoWay.mp3", "volume": 0.7 },
    "어림없": { "src": "NoWay.mp3", "volume": 0.7 },
    "응 아니야": { "src": "K-Nope.mp3", "volume": 0.7 },
    "죽고 싶지 않": { "src": "Don'tWannaDie.mp3", "volume": 0.7 },
    "장비를 정지": { "src": "Half-Stop.mp3", "volume": 0.7 },
    "너무한": { "src": "TooHarsh.mp3", "volume": 0.7 },
    "안되잖아": { "src": "Half-not-working.mp3", "volume": 0.7 },
    "정지가 안돼": [
        { "src": "Half-not-working2.mp3", "volume": 0.7 },
        { "src": "half-not-working4.mp3", "volume": 0.7 }
    ],

    // [Situation / Alerts]
    "하이": [
        { "src": "Hi1.mp3", "volume": 0.7 },
        { "src": "Hi2.mp3", "volume": 0.7 },
        { "src": "Hi3.mp3", "volume": 0.7 }
    ],
    "안녕하세요": { "src": "Hello1.mp3", "volume": 0.7 },
    "헬로": { "src": "Hello2.mp3", "volume": 0.7 },
    "바이": { "src": "Bye.mp3", "volume": 0.7 },
    "안녕히": { "src": "FareWellEveryone.mp3", "volume": 0.7 },
    "카톡": { "src": "Katalk.mp3", "volume": 0.7 },
    "전화": { "src": "Call.mp3", "volume": 0.7 },
    "보이스콜": { "src": "KakaoCall.mp3", "volume": 0.7 },
    "디코": { "src": "discord.mp3", "volume": 0.7 },
    "잠시후": { "src": "FUmomentsLater.mp3", "volume": 0.7 },
    "장실": { "src": "willBeRightBack.mp3", "volume": 0.7 },
    "부끝": { "src": "willBeRightBack.mp3", "volume": 0.7 },
    "수류탄": { "src": "FireInTheHole.mp3", "volume": 0.7 },
    "탈출": [
        { "src": "Escape.mp3", "volume": 0.7 },
        { "src": "Escape2.mp3", "volume": 0.7 },
        { "src": "Escape3.mp3", "volume": 0.7 },
        { "src": "Escape4.mp3", "volume": 0.7 },
        { "src": "늦기전에도망쳐.mp3", "volume": 0.7 },
        { "src": "어서도망쳐.mp3", "volume": 0.7 }
    ],
    "튀어": { "src": "RUN.mp3", "volume": 0.7 },
    "시작": { "src": "Begin.mp3", "volume": 0.7 },
    "하겠습니다": { "src": "하겠습니다.mp3", "volume": 0.7 },
    "가자!": { "src": "LetsGo.mp3", "volume": 0.7 },
    "결제": { "src": "applepay.mp3", "volume": 0.7 },
    "예상대로": { "src": "Predict.mp3", "volume": 0.7 },
    "배운다": { "src": "Learing.mp3", "volume": 0.6 },
    "운동": { "src": "workouthard.mp3", "volume": 0.6 },
    "유격": { "src": "MohyungTower.mp3", "volume": 0.7 },
    "일어나": [
        { "src": "WakeUp1.mp3", "volume": 0.7 },
        { "src": "WakeUp2.mp3", "volume": 0.7 },
        { "src": "WakeUp3.mp3", "volume": 0.7 },
        { "src": "WakeUp4.mp3", "volume": 0.7 },
        { "src": "WakeUp6.mp3", "volume": 0.7 },
        { "src": "WakeUp7.mp3", "volume": 0.7 },
        { "src": "WakeUp8.mp3", "volume": 0.7 },
        { "src": "WakeUp9.mp3", "volume": 0.7 }
    ],
    "뭐임?": { "src": "WTF.mp3", "volume": 0.7 },
    "엥?": { "src": "Huh.mp3", "volume": 0.7 },
    "음?": { "src": "Huh.mp3", "volume": 0.7 },
    "뭣?": { "src": "Huh.mp3", "volume": 0.7 },
    "ㅔ?": { "src": "Huh.mp3", "volume": 0.7 },
    "ㅖ?": { "src": "Huh.mp3", "volume": 0.7 },
    "마인": { "src": "MineMine.mp3", "volume": 0.7 },
    "제꺼": { "src": "NowMine.mp3", "volume": 0.7 },
    "마이!": [
        { "src": "MineMine.mp3", "volume": 0.7 }
    ],
    "마이쩡": { "src": "SoDelicious.mp3", "volume": 0.7 },
    "마이쪙": { "src": "SoDelicious.mp3", "volume": 0.7 },
    "뭐지": { "src": "WhatIsIT.mp3", "volume": 0.7 },
    "뭐야": { "src": "WhatIsThis.mp3", "volume": 0.7 },

    // [New Additions 2026-01-27]
    "아메리칸": { "src": "Crysis_Amercans.mp3", "volume": 0.7 },
    "남자답게": { "src": "Crysis_Be_A_Man.mp3", "volume": 0.7 },
    "못숨지": { "src": "Crysis_Cant_Hide.mp3", "volume": 0.7 },
    "찾을거야": { "src": "Crysis_Find.mp3", "volume": 0.7 },
    "다이": { "src": "DieYouSOB.mp3", "volume": 0.7 },
    "죽었어": { "src": "Crysis_death.mp3", "volume": 0.7 },
    "최고야": { "src": "AreYouBest.mp3", "volume": 0.7 },
    "하지마이": { "src": "Don'tDoIt.mp3", "volume": 0.7 },
    "피버": { "src": "Fever.mp3", "volume": 0.7 },
    "꼼짝": { "src": "Frozen.mp3", "volume": 0.7 },
    "간드아": { "src": "Ganda.mp3", "volume": 0.7 },
    "하야이": { "src": "Hayay.mp3", "volume": 0.7 },
    "헉": { "src": "Huk.mp3", "volume": 0.7 },
    "흡": { "src": "Hup.mp3", "volume": 0.7 },
    "자기생각": { "src": "Life3.mp3", "volume": 0.7 },
    "그래서재미": { "src": "Life4.mp3", "volume": 0.7 },
    "인생이란": { "src": "Life_is.mp3", "volume": 0.7 },
    "사랑해요": { "src": "LoveYou.mp3", "volume": 0.7 },
    "메이플": { "src": "Maple.mp3", "volume": 0.7 },
    "오케이": [
        { "src": "Okay.mp3", "volume": 0.7 },
        { "src": "Okey1.mp3", "volume": 0.7 }
    ],
    "오네가이": { "src": "OnegaySimasu.mp3", "volume": 0.7 },
    "헐떡": { "src": "Panting.mp3", "volume": 0.7 },
    "꿀떡": { "src": "Swallow.mp3", "volume": 0.7 },
    "섹": { "src": "Sax.mp3", "volume": 0.7 },
    "재밌잖아": { "src": "SoFun.mp3", "volume": 0.7 },
    "트리스트람": { "src": "Stay_awhile.mp3", "volume": 0.7 },
    "난재밌어": { "src": "ToMeIt'sSoFun.mp3", "volume": 0.7 },
    "회전회오리": { "src": "Tornado.mp3", "volume": 0.7 },
    "와츄고나두": { "src": "WaChuGoNaDo.mp3", "volume": 0.7 },
    "꺄악": { "src": "Whilhelm.mp3", "volume": 0.7 },
    "USB": { "src": "Windows 10 USB Disconnect.mp3", "volume": 0.7 },
    "예야": { "src": "Yaeya.mp3", "volume": 0.7 },
    "아앙": { "src": "aang.mp3", "volume": 0.7 },
    "고자라니": { "src": "gozarani1.mp3", "volume": 0.7 },
    "몬소리": [
        { "src": "mon_sound2.mp3", "volume": 0.7 },
        { "src": "mon_sound3.mp3", "volume": 0.7 },
        { "src": "mon_sound1.mp3", "volume": 0.7 },
        { "src": "몬소리야이거.mp3", "volume": 0.7 },
    ],
    "난테네": { "src": "nantene.mp3", "volume": 0.7 },
    "썸씽": { "src": "SomeThingOnYourMind.mp3", "volume": 0.7 },
    "예압": { "src": "Yeap.mp3", "volume": 0.7 },
    "뭐였지": [
        { "src": "what_was_it.mp3", "volume": 0.7 },
        { "src": "what_was_it2.mp3", "volume": 0.7 },
        { "src": "what_was_it_3.mp3", "volume": 0.7 }],

    // [New Additions 2026-01-31]
    "인정해": { "src": "AdmitIt.mp3", "volume": 0.7 },
    "짜증냈어": { "src": "AreYouAnnoyed.mp3", "volume": 0.7 },
    "여친있어요?": { "src": "AreYouSingle.mp3", "volume": 0.7 },
    "공습경보": [
        { "src": "Defcon1.mp3", "volume": 0.7 },
        { "src": "Defcon2.mp3", "volume": 0.7 }],
    "인성문제": { "src": "DoYouHavePersonalityProblem.mp3", "volume": 0.7 },
    "명령하지마라": { "src": "DontGiveMeOrders.mp3", "volume": 0.7 },
    "없어요": [
        { "src": "DontHaveOne.mp3", "volume": 0.7 },
        { "src": "DontHaveOne2.mp3", "volume": 0.7 },
        { "src": "DontHaveOne3.mp3", "volume": 0.7 }
    ],
    "머리부터 발끝": [
        { "src": "FromHeadToToe.mp3", "volume": 0.7 },
        { "src": "FromHeadToToe2.mp3", "volume": 0.7 }
    ],
    "훼이크다": { "src": "ItsFakeYouFools.mp3", "volume": 0.7 },
    "코와이네": { "src": "KoWaYiNe.mp3", "volume": 0.7 },
    "안때려": { "src": "NopeIWontHit.mp3", "volume": 0.7 },
    "나만아니면": { "src": "NotMe.mp3", "volume": 0.7 },
    "냥냥": [{ "src": "NyangNyang.mp3", "volume": 0.2 }, { "src": "냥냥2.mp3", "volume": 0.4 }],
    "얼마나 처먹": { "src": "Pig1.mp3", "volume": 0.7 },
    "돼지같은": { "src": "YouArePig.mp3", "volume": 0.7 },
    "사사게오": [
        { "src": "ShinZoSaSaGeO.mp3", "volume": 0.7 },
        { "src": "ShinZoSaSaGeO2.mp3", "volume": 0.7 },
        { "src": "ShinZoSaSaGeO3.mp3", "volume": 0.7 }
    ],
    "앉아": [
        { "src": "SitDown.mp3", "volume": 0.5 },
        { "src": "SitDown2.mp3", "volume": 0.5 },
        { "src": "SitDown3.mp3", "volume": 0.7 },
        { "src": "SitDown4.mp3", "volume": 0.7 }
    ],
    "무서워라": { "src": "SoScary.mp3", "volume": 0.7 },
    "선오브비치": { "src": "SonOfBitch.mp3", "volume": 0.7 },
    "일어서": { "src": "StandUp.mp3", "volume": 0.7 },
    "나가 뒤지기": { "src": "SunFlower-GetOut.mp3", "volume": 0.7 },
    "오태식이": { "src": "SunFlower-OhMrOh.mp3", "volume": 0.7 },
    "고맙다": { "src": "SunFlower-Thanks.mp3", "volume": 0.7 },
    "저 븅신": { "src": "SunFlower-ThatRetard.mp3", "volume": 0.7 },
    "이건기회야": { "src": "SunFlower-ThisIsMyMoment.mp3", "volume": 0.7 },
    "재수없게울고": { "src": "SunFlower-WhosCrying.mp3", "volume": 0.7 },
    "돌아왔구나": { "src": "SunFlower-YouBack.mp3", "volume": 0.7 },
    "후련했냐": { "src": "SunFlower-areYouSatisfied.mp3", "volume": 0.7 },
    "안에사람": { "src": "ThereArePeopleInThere.mp3", "volume": 0.7 },
    "함정": { "src": "TrapBGM.mp3", "volume": 0.7 },
    "후아유": { "src": "WhoAreYou.mp3", "volume": 0.7 },
    "누구야": { "src": "WhoAreYou1.mp3", "volume": 0.7 },
    "누구인가": { "src": "WhoWasIt.mp3", "volume": 0.7 },
    "뭐야?": { "src": "WTFareYou.mp3", "volume": 0.7 },
    "기침": { "src": "WhoJustCoughed.mp3", "volume": 0.7 },
    "와!센즈": [
        { "src": "WaSands1.mp3", "volume": 0.7 },
        { "src": "WaSands2.mp3", "volume": 0.7 },
        { "src": "WaSands3.mp3", "volume": 0.7 },
        { "src": "WaSands4.mp3", "volume": 0.7 },
        { "src": "WaSandsWin.mp3", "volume": 0.7 }
    ],
    "왜나만": { "src": "WhyJustMe.mp3", "volume": 0.7 },
    "시발": { "src": "Yabal2.mp3", "volume": 0.7 },
    "시발롬": [
        { "src": "Yabal1.mp3", "volume": 0.7 },
        { "src": "YabalFolks2.mp3", "volume": 0.7 },
        { "src": "YabalFolks4.mp3", "volume": 0.7 }
    ],
    "뉴스도안": { "src": "YouDontWatchNews.mp3", "volume": 0.7 },
    "테레비도안": { "src": "YouDontWatchTV.mp3", "volume": 0.7 },
    "꽁꽁": { "src": "itsFrozen.mp3", "volume": 0.7 },

    // [Batch 2 Additions]
    "같이밥묵고": { "src": "같이밥묵고.mp3", "volume": 0.7 },
    "그년한": { "src": "그년한태.mp3", "volume": 0.7 },
    "그땐몰랐어": { "src": "그땐몰랐어.mp3", "volume": 0.7 },
    "남자가지고": { "src": "남자가지고싶다.mp3", "volume": 1 },
    "가지고싶다": { "src": "가지고싶다.mp3", "volume": 0.7 },
    "내가!": { "src": "내가!.mp3", "volume": 0.7 },
    "누구냐너": { "src": "누구냐너.mp3", "volume": 0.7 },
    "다했어": { "src": "다했어.mp3", "volume": 0.7 },
    "달콤한꿈": { "src": "달콤한꿈.mp3", "volume": 0.7 },
    "따라란": { "src": "따라란.mp3", "volume": 0.7 },
    "먹고살기힘": { "src": "먹고살기힘들다.mp3", "volume": 0.7 },
    "모욕감": { "src": "모욕감.mp3", "volume": 0.7 },
    "사쿠라야?": { "src": "사쿠라야.mp3", "volume": 0.7 },
    "소리가달라": { "src": "소리가달라.mp3", "volume": 0.7 },
    "쏠수있어": { "src": "쏠수있어1.mp3", "volume": 0.7 },
    "아예": { "src": "아예.mp3", "volume": 0.7 },
    "아주유명한": { "src": "아주유명한.mp3", "volume": 0.7 },
    "약을팔어": { "src": "약을팔어.mp3", "volume": 0.7 },
    "어데최씨": { "src": "어데최씨.mp3", "volume": 0.7 },
    "어저께도": { "src": "어저께도.mp3", "volume": 0.7 },
    "에?": [
        { "src": "에에.mp3", "volume": 0.7 },
        { "src": "에에2.mp3", "volume": 0.7 },
        { "src": "에에3.mp3", "volume": 0.7 },
        { "src": "에에4.mp3", "volume": 0.7 },
        { "src": "에에5.mp3", "volume": 0.7 },
        { "src": "에에6.mp3", "volume": 0.7 },
        { "src": "에에7.mp3", "volume": 0.7 },
        { "src": "에에8.mp3", "volume": 0.7 }
    ],
    "예쁜칼": { "src": "예쁜칼.mp3", "volume": 0.7 },
    "왜자르지않": { "src": "왜자르지않.mp3", "volume": 0.7 },
    "대구빡이": { "src": "이대구빡이.mp3", "volume": 0.7 },
    "인생꼬": { "src": "인생꼬.mp3", "volume": 0.7 },
    "임마": { "src": "임마.mp3", "volume": 0.7 },
    "짤르라": { "src": "잘르라.mp3", "volume": 0.7 },
    "좋은날": { "src": "좋은날이있.mp3", "volume": 0.7 },
    "죽을죄": { "src": "죽을죄.mp3", "volume": 0.7 },
    "팬티를": { "src": "팬티를.mp3", "volume": 0.7 },
    "혓바닥이": { "src": "혓바닥이.mp3", "volume": 0.7 },
    "확인들어": { "src": "확인들어가.mp3", "volume": 0.7 },
    "후달리냐": { "src": "후달리냐.mp3", "volume": 0.7 },
    "삿갓": { "src": "삿갓이요.mp3", "volume": 0.7 },
    "ㅆㅅㄲ": { "src": "ㅅㅅㄲ.mp3", "volume": 0.7 },
    "찍으십쇼": { "src": "찍으십쇼.mp3", "volume": 0.7 },
    "대공업무": { "src": "대공업무.mp3", "volume": 0.7 },
    "답은콤푸": { "src": "답은콤푸.mp3", "volume": 0.7 },
    "삼습만원": { "src": "삼습만원.mp3", "volume": 0.7 },



    // [CMC음성]
    "존나몬창": { "src": "Johnna MC.mp3", "volume": 0.7 },
    "잉곳": { "src": "ingot.mp3", "volume": 0.7 },
    "잉기잇": { "src": "ingit.mp3", "volume": 0.7 },
    "네전태": { "src": "OKLS.mp3", "volume": 0.7 },
    "끼야": { "src": "Screem.mp3", "volume": 0.7 },
    "데미지가": { "src": "weird.mp3", "volume": 0.7 },
    "이왜대발": { "src": "whydps.mp3", "volume": 0.7 },
    "알피엠": { "src": "5000알피엠.mp3", "volume": 0.7 },
    "가자부": [{ "src": "가자부1.mp3", "volume": 0.7 },
    { "src": "가자부2.mp3", "volume": 0.7 }],
    "가즈아": { "src": "가즈아.mp3", "volume": 0.7 },
    "아시벌개꿀잼": { "src": "아시벌개꿀잼.mp3", "volume": 0.7 },
    "갓겜": [{ "src": "갓겜0.mp3", "volume": 0.7 },
    { "src": "갓겜1.mp3", "volume": 0.7 }],
    "개꿀잼": { "src": "개꿀잼.mp3", "volume": 0.7 },
    "아~합시다": { "src": "아합시다.mp3", "volume": 0.7 },
    "개쓰레기게임": { "src": "개쓰레기게임.mp3", "volume": 0.7 },
    "게임이어렵": { "src": "게임이어렵 [vocals].mp3", "volume": 0.7 },
    "겜안분": { "src": "겜안분.mp3", "volume": 0.7 },
    "교미교미": [{ "src": "교미교미.mp3", "volume": 0.7 },
    { "src": "교미교미2.mp3", "volume": 0.7 },
    { "src": "교미교미3.mp3", "volume": 0.7 }],
    "구멍이두개": { "src": "구멍이두개.mp3", "volume": 0.7 },
    "국밥에말아": { "src": "국밥에말아.mp3", "volume": 0.7 },
    "그건싫": { "src": "그건싫.mp3", "volume": 0.7 },
    "그만하세요": { "src": "그만하세요좀.mp3", "volume": 0.7 },
    "근무나갈시간": { "src": "근무나갈시간.mp3", "volume": 0.7 },
    "기억도나지": { "src": "기억도나지않는다.mp3", "volume": 0.7 },
    "기폭용항": { "src": "기폭용항.mp3", "volume": 0.7 },
    "꼬리에선": { "src": "꼬리에선.mp3", "volume": 0.7 },
    "꼬짤": { "src": "꼬짤.mp3", "volume": 0.7 },
    "나가!": { "src": "나가.mp3", "volume": 0.7 },
    "나는!": [{ "src": "나는!.mp3", "volume": 0.7 },
    { "src": "나는!2.mp3", "volume": 0.7 }],
    "나도!": { "src": "나도.mp3", "volume": 0.7 },
    "나이스": { "src": "나이스.mp3", "volume": 0.7 },
    "나이사": { "src": "나이스아.mp3", "volume": 0.7 },
    "너무하는거": { "src": "너무하는거2.mp3", "volume": 0.7 },
    "너무하시네": { "src": "너무하시네.mp3", "volume": 0.7 },
    "노벨상줘야": { "src": "노벨상줘야.mp3", "volume": 0.7 },
    "다메": { "src": "다메.mp3", "volume": 0.7 },
    "대검위태도": { "src": "대검위태도.mp3", "volume": 0.7 },
    "도킹": { "src": "도킹.mp3", "volume": 0.7 },
    "도킹당": { "src": "도킹당.mp3", "volume": 0.7 },
    "도킹좋": { "src": "도킹좋.mp3", "volume": 0.7 },
    "따사!": { "src": "따사.mp3", "volume": 0.7 },
    "뜨겁게해줄게": { "src": "뜨겁게해줄게.mp3", "volume": 0.7 },
    "랜스!": { "src": "랜스.mp3", "volume": 0.7 },
    "만져보고싶다": { "src": "만져보고싶다.mp3", "volume": 0.7 },
    "만져본지언제": { "src": "만져본지언제.mp3", "volume": 0.7 },
    "말도안돼": [{ "src": "말도안되.mp3", "volume": 0.7 },
    { "src": "아이말도안돼.mp3", "volume": 0.7 }],
    "모넌을꺼요": { "src": "모넌을꺼요.mp3", "volume": 0.7 },
    "몬허브": { "src": "몬허브.mp3", "volume": 0.7 },
    "문열어": { "src": "문열어.mp3", "volume": 0.7 },
    "뭐야!": { "src": "뭐야.mp3", "volume": 0.7 },
    "미나상곤니찌와": { "src": "미나상곤니찌와.mp3", "volume": 0.7 },
    "미않술": { "src": "미않술.mp3", "volume": 0.7 },
    "발차기!": { "src": "발차기.mp3", "volume": 0.7 },
    "배려해야": { "src": "배려해야.mp3", "volume": 0.7 },
    "사나이눈물": { "src": "사나이눈물.mp3", "volume": 0.7 },
    "세상사람다": { "src": "세상사람다설산.mp3", "volume": 0.7 },
    "수렵돈": { "src": "수렵돈.mp3", "volume": 0.7 },
    "아따시": { "src": "아따시.mp3", "volume": 0.7 },
    "아따시고멘네": { "src": "아따시고멘네.mp3", "volume": 0.7 },
    "아몰랑기모찌": { "src": "아몰랑기모찌.mp3", "volume": 0.7 },
    "아빨리!": { "src": "아빨리.mp3", "volume": 0.7 },
    "아스아!": [{ "src": "아스아.mp3", "volume": 0.7 },
    { "src": "아스아2.mp3", "volume": 0.7 }],
    "아아!": { "src": "아아.mp3", "volume": 0.7 },
    "아악!": { "src": "아악.mp3", "volume": 0.7 },
    "아왜?": { "src": "아왜.mp3", "volume": 0.7 },
    "아이보": { "src": "아이보.mp3", "volume": 0.7 },
    "오겡끼데스까": { "src": "오겡끼데스까.mp3", "volume": 0.7 },
    "아잭스": { "src": "아잭스.mp3", "volume": 0.7 },
    "안녕하세요오": { "src": "안녕하세요오.mp3", "volume": 0.7 },
    "안돼안돼": { "src": "안돼안돼.mp3", "volume": 0.7 },
    "앗!": { "src": "앗.mp3", "volume": 0.7 },
    "애널형": { "src": "애널형.mp3", "volume": 0.7 },
    "애널형이어폰": { "src": "애널형이어폰.mp3", "volume": 0.7 },
    "개새끼들아": { "src": "야이개새끼.mp3", "volume": 0.7 },
    "미친놈들아": { "src": "야이미친놈들아.mp3", "volume": 0.7 },
    "어?": [{ "src": "어.mp3", "volume": 0.7 },
    { "src": "어어.mp3", "volume": 0.7 }],
    "어그로끌어야지": { "src": "어그로끌어야지.mp3", "volume": 0.7 },
    "어디가냐": { "src": "어디가냐.mp3", "volume": 0.7 },
    "어예": { "src": "어예.mp3", "volume": 0.7 },
    "어쩌라구요": { "src": "어쩌라구요.mp3", "volume": 0.7 },
    "엿이나드셔": { "src": "엿이나드셔.mp3", "volume": 0.7 },
    "엿이나드셔~": { "src": "엿이나드셔2.mp3", "volume": 0.7 },
    "예스!": { "src": "예스.mp3", "volume": 0.7 },
    "오게이!": { "src": "오게이.mp3", "volume": 0.7 },
    "오늘은기분이": { "src": "오늘은기분이.mp3", "volume": 0.7 },
    "오니짱": { "src": "오니짱.mp3", "volume": 0.7 },
    "오예": [{ "src": "오예.mp3", "volume": 0.7 },
    { "src": "오예2.mp3", "volume": 0.7 },
    { "src": "오예3.mp3", "volume": 0.7 },
    { "src": "오우예.mp3", "volume": 0.7 }],
    "완투": { "src": "완투.mp3", "volume": 0.7 },
    "왜?": { "src": "왜.mp3", "volume": 0.7 },
    "왜나CMC는": { "src": "왜나CMC는.mp3", "volume": 0.7 },
    "왜왜": { "src": "왜왜.mp3", "volume": 0.7 },
    "외출한김에": { "src": "외출한김에.mp3", "volume": 0.7 },
    "욧샤": { "src": "욧샤.mp3", "volume": 0.7 },
    "용조종너무": { "src": "용조종너무.mp3", "volume": 0.7 },
    "위이": [{ "src": "위이.mp3", "volume": 0.7 }, { "src": "Wieeee.mp3", "volume": 0.7 }],
    "응애": { "src": "응애.mp3", "volume": 0.7 },
    "이거실화야": { "src": "이거실화야.mp3", "volume": 0.7 },
    "이걸왜유투브": { "src": "이걸왜유투브.mp3", "volume": 0.7 },
    "이놈": { "src": "이놈.mp3", "volume": 0.7 },
    "건랜서야": [{ "src": "이새낀건랜서.mp3", "volume": 0.7 },
    { "src": "이새낀건랜서2.mp3", "volume": 0.7 }],
    "이안에사람": { "src": "이안에사람2.mp3", "volume": 0.7 },
    "이해가안돼": { "src": "이해가안되.mp3", "volume": 0.7 },
    "인정해안해": { "src": "인정해안해3.mp3", "volume": 0.7 },
    "잠들어라": { "src": "잠들어라.mp3", "volume": 0.7 },
    "장난하지마": [{ "src": "장난하지마.mp3", "volume": 0.7 },
    { "src": "장난하지마2.mp3", "volume": 0.7 }],
    "조룡!": { "src": "조룡!.mp3", "volume": 0.7 },
    "존나재밌어": { "src": "존나재밌어.mp3", "volume": 0.7 },
    "지금문열어": { "src": "지금문열어.mp3", "volume": 0.7 },
    "지금하자": { "src": "지금하자.mp3", "volume": 0.7 },
    "최뱀": { "src": "최뱀1.mp3", "volume": 0.7 },
    "츠지모토상오하": { "src": "츠지모토상오하이오.mp3", "volume": 0.7 },
    "치욕스러워": { "src": "치욕스러워.mp3", "volume": 0.7 },
    "하하하": [{ "src": "하하하1.mp3", "volume": 0.7 },
    { "src": "하하하11.mp3", "volume": 0.7 },
    { "src": "하하하12.mp3", "volume": 0.7 },
    { "src": "하하하13.mp3", "volume": 0.7 },
    { "src": "하하하14.mp3", "volume": 0.7 },
    { "src": "하하하2.mp3", "volume": 0.7 },
    { "src": "하하하3.mp3", "volume": 0.7 },
    { "src": "하하하4.mp3", "volume": 0.7 },
    { "src": "하하하5.mp3", "volume": 0.7 },
    { "src": "하하하8.mp3", "volume": 0.7 },
    { "src": "하하하9.mp3", "volume": 0.7 }],
    "흔들리며산다": { "src": "흔들리며산다.mp3", "volume": 0.7 },
    "쎅": { "src": "쎅.mp3", "volume": 0.7 },
    "니가참조룡": { "src": "니가참조룡.mp3", "volume": 0.7 },
    "좋아?": { "src": "좋아.mp3", "volume": 0.7 },
    "만족해?": { "src": "만족해.mp3", "volume": 0.7 },
    "거짓!": { "src": "거짓!.mp3", "volume": 0.7 },
    "진실!": { "src": "진실!.mp3", "volume": 0.7 },
    "격추": [{ "src": "격추1.mp3", "volume": 0.7 }, { "src": "격추2.mp3", "volume": 0.7 }],
    "냐하하": { "src": "냐하하.mp3", "volume": 0.7 },
    "또수렵": { "src": "또수렵.mp3", "volume": 0.7 },
    "빵빵": { "src": "빵빵.mp3", "volume": 0.7 },
    "빵빵씨": { "src": "빵빵씨.mp3", "volume": 0.7 },
    "딜개못해": { "src": "에에엥 딜 개못해.mp3", "volume": 0.7 },
    "여죽남범": { "src": "여죽남범.mp3", "volume": 0.7 },
    "갓겜합시다": { "src": "갓겜합시다1.mp3", "volume": 0.7 },
    "기쁨이폭발": { "src": "기쁨이폭발.mp3", "volume": 0.7 },
    "나만못해": { "src": "나만못해.mp3", "volume": 0.7 },
    "미안합니다": { "src": "미안합니다.mp3", "volume": 0.7 },
    "설산을할수가": { "src": "설산을할수가.mp3", "volume": 0.7 },
    "용의항문": { "src": "용의항문.mp3", "volume": 0.7 },
    "가자": { "src": "가자.mp3", "volume": 0.7 },
    "게임이느려": { "src": "게임이느려.mp3", "volume": 0.7 },
    "그만": { "src": "그만.mp3", "volume": 0.7 },
    "너로정했다": { "src": "너로정했다.mp3", "volume": 0.7 },
    "너무쉬워": { "src": "너무쉬워.mp3", "volume": 0.7 },
    "도망쳐": { "src": "도망쳐.mp3", "volume": 0.7 },
    "멍청해": { "src": "멍청해.mp3", "volume": 0.7 },
    "빨리해봐": { "src": "빨리해봐.mp3", "volume": 0.7 },
    "수룡님": { "src": "수룡님.mp3", "volume": 0.7 },
    "스트레스풀": { "src": "스트레스풀.mp3", "volume": 0.7 },
    "야스를하는곳": { "src": "야스를하는곳.mp3", "volume": 0.7 },
    "얼마나멋": { "src": "얼마나멋.mp3", "volume": 0.7 },
    "이맛에": { "src": "이맛에.mp3", "volume": 0.7 },
    "잠깐만요": { "src": "잠깐만요.mp3", "volume": 0.7 },
    "지랄도풍년": { "src": "지랄도풍년.mp3", "volume": 0.7 },
    "찢콘": { "src": "찢콘.mp3", "volume": 0.7 },
    "헤보가왜": { "src": "헤보가왜.mp3", "volume": 0.7 },
    "가슴존내커": { "src": "가슴존내커.mp3", "volume": 0.7 },
    "개커": { "src": "개커.mp3", "volume": 0.7 },
    "눌렀어요": { "src": "눌렀어요.mp3", "volume": 0.7 },
    "몰라몰라": { "src": "몰라몰라.mp3", "volume": 0.7 },
    "몰라염": { "src": "몰라염.mp3", "volume": 0.7 },
    "못생겼어": [
        { "src": "못생겼어.mp3", "volume": 0.7 },
        { "src": "못생겼어2.mp3", "volume": 0.7 }
    ],
    "야무지게먹어": { "src": "야무지게먹어.mp3", "volume": 0.7 },
    "퇴물인가": { "src": "퇴물인가.mp3", "volume": 0.7 },

    // [Batch 3 Additions]
    "오올": [{ "src": "오올.mp3", "volume": 0.7 }, { "src": "오올2.mp3", "volume": 0.7 }, { "src": "오올3.mp3", "volume": 0.7 }],
    "왜안들어가": { "src": "왜안들어가.mp3", "volume": 0.7 },
    "우유통": [{ "src": "우유통존나커.mp3", "volume": 0.7 }, { "src": "우유통짱크지.mp3", "volume": 0.7 }],
    "죽는다": { "src": "죽는다.mp3", "volume": 0.7 },

    "C바": [
        { "src": "C바1.mp3", "volume": 0.7 },
        { "src": "C바2.mp3", "volume": 0.7 },
        { "src": "C바3.mp3", "volume": 0.7 }],
    "붕가붕가": { "src": "붕가붕가.mp3", "volume": 0.7 },
    "아아뉴잇": { "src": "아아뉴잇.mp3", "volume": 0.7 },
    "예민하네": { "src": "예민하네.mp3", "volume": 0.7 },
    "왜그러지": { "src": "왜그러지.mp3", "volume": 0.7 },
    "이럴줄": { "src": "이럴줄.mp3", "volume": 0.7 },
    "책없쾌": { "src": "책없쾌.mp3", "volume": 0.7 },
    "카와붕가": { "src": "카와붕가.mp3", "volume": 0.7 },
    "카와이": { "src": "카와이.mp3", "volume": 0.7 },
    "화났네": { "src": "화났네.mp3", "volume": 0.7 },
    "대빵": { "src": "대빵.mp3", "volume": 0.7 },
    "스티커": { "src": "스티커.mp3", "volume": 0.7 },
    "재밌었": { "src": "재밌었.mp3", "volume": 0.7 },
    "번창": { "src": "번창.mp3", "volume": 0.7 },
    "잘생겼": { "src": "잘생겼.mp3", "volume": 0.7 },
    "아나는좋": { "src": "아나는좋.mp3", "volume": 0.7 },
    "타티": { "src": "타티.mp3", "volume": 0.7 },
    "호박고구마": { "src": "호박고구마.mp3", "volume": 0.7 },
    "틀딱": { "src": "틀딱.mp3", "volume": 0.7 },
    "도전": { "src": "도전.mp3", "volume": 0.7 },
    "성공": { "src": "성공.mp3", "volume": 0.7 },
    "실패": { "src": "실패.mp3", "volume": 0.7 },
    "누나나죽어": [
        { "src": "누나나죽어1.mp3", "volume": 0.7 },
        { "src": "누나나죽어2.mp3", "volume": 0.7 }],
    "휘청": { "src": "휘청.mp3", "volume": 0.7 },

    // [Batch 4 Additions]
    "거품": { "src": "거품거품.mp3", "volume": 0.7 },
    "내일출근": { "src": "난내일출근.mp3", "volume": 0.7 },
    "다음": { "src": "다음1.mp3", "volume": 0.7 },
    "무시하지마": { "src": "무시하지마.mp3", "volume": 0.7 },
    "부럽지": { "src": "부럽지.mp3", "volume": 0.7 },
    "소뻑크": { "src": "소뻑크.mp3", "volume": 0.7 },
    "아니": { "src": "아니.mp3", "volume": 0.7 },
    //    "아들아": { "src": "아들아.mp3", "volume": 0.7 }, 비주얼 이팩트로 편입됨
    "여기사람": { "src": "여기사람있.mp3", "volume": 0.7 },
    "오호": { "src": "오호.mp3", "volume": 0.7 },
    "재미있는몬스터": { "src": "재미있는몬스터.mp3", "volume": 0.7 },
    "정말멋져": { "src": "정말멋져.mp3", "volume": 0.7 },
    "샀어": { "src": "샀어.mp3", "volume": 0.7 },
    "선브샀어": { "src": "선브샀어.mp3", "volume": 0.7 },
    "안산줄": { "src": "안산줄알았네.mp3", "volume": 0.7 },
    "꼬리": [
        { "src": "꼬리1.mp3", "volume": 0.7 },
        { "src": "꼬리2.mp3", "volume": 0.7 },
        { "src": "꼬리3.mp3", "volume": 0.7 }
    ],
    "오나즈치": [
        { "src": "오나즈치무시.mp3", "volume": 0.7 },
        { "src": "오나즈치무시2.mp3", "volume": 0.7 }
    ],
    "안샀어": [
        { "src": "안샀어.mp3", "volume": 0.7 },
        { "src": "안샀어1.mp3", "volume": 0.7 }
    ],
    "선브안샀어": [
        { "src": "선브안샀어.mp3", "volume": 0.7 },
        { "src": "선브안샀어2.mp3", "volume": 0.7 },
        { "src": "선브안샀어3.mp3", "volume": 0.7 }
    ],
    "샀어안샀어": { "src": "샀어안샀어.mp3", "volume": 0.7 },
    "선브샀어안샀어": { "src": "선브샀어안샀어.mp3", "volume": 0.7 },
    "오오오오": { "src": "오오오오.mp3", "volume": 0.7 },
    "오오오오오": { "src": "오오오오오.mp3", "volume": 0.7 },

    // [Batch 5 Additions]
    "그당몬": { "src": "그당몬.mp3", "volume": 0.7 },
    "변태야": { "src": "변태야.mp3", "volume": 0.7 },
    "비상": { "src": "비상1.mp3", "volume": 0.7 },
    "아분탕": { "src": "아분탕.mp3", "volume": 0.7 },
    "아종": { "src": "아종.mp3", "volume": 0.7 },
    "이안에기믹": { "src": "이안에기믹.mp3", "volume": 0.7 },
    "특개": { "src": "특개.mp3", "volume": 0.7 },

    // [Batch 6 Additions]
    "돈이복사": { "src": "돈이복사.mp3", "volume": 0.7 },
    "다음몬스터": { "src": "다음몬스터.mp3", "volume": 0.7 },
    "돈내놔": { "src": "돈내놔.mp3", "volume": 0.7 },
    "현기증": { "src": "현기증.mp3", "volume": 0.7 },
    "가만느": { "src": "가만느.mp3", "volume": 0.7 },
    "싸말섹": { "src": "싸말섹.mp3", "volume": 0.7 }
};

// ==========================================
// [3] 비주얼 이펙트 설정 (Visual Effect Config)
// * 이펙트의 지속 시간이나 GIF 경로를 설정합니다.
// ==========================================
window.VISUAL_CONFIG = {
    // ==========================================
    // [공통 설정]
    // 모든 이펙트에 공통적으로 적용되거나 전역적인 설정입니다.
    // ==========================================
    common: {
        textWrapLimit: 200,     // 텍스트 자동 줄바꿈 기준 글자수 (이 길이 넘어가면 <br> 삽입)
        cooldown: 1000          // 이펙트 실행 후 다음 이펙트까지의 최소 대기 시간 (ms)
    },

    // ==========================================
    // [우쇼 이펙트] (GIF 스캔 연출)
    // 화면을 스캔하듯 지나가는 GIF 애니메이션입니다.
    // ==========================================
    usho: {
        gifPath: './img/usho.gif', // 사용할 GIF 이미지 경로
        videoPath: './img/usho.mp4', // [New] 7.2초 후 배경으로 사용할 비디오 경로
        backgroundVideoPath: './Video/ushoBack.mp4', // [New] 전체 배경 비디오 (GIF 대체)
        opacity: 0.8,           // [New] Opacity control (0.0 ~ 1.0)
        duration: 19000,        // 전체 이펙트 지속 시간 (ms)
        scanPhase: 7500,        // 스캔 단계(첫 번째 페이즈) 지속 시간 (ms)
        soundKey: '우쇼'          // 연결된 사운드 키 (config.js의 HIVE_SOUND_CONFIG 참조)
    },

    // ==========================================
    // [갓겜 이펙트] (웅장한 등장)
    // ==========================================
    godsong: {
        soundKey: '갓겜송', // [Fix] Prevent normal chat trigger
        duration: 14500,
        audioPath: './SFX/갓겜합시다FULL.mp3',
        videoPath: './Video/GodGame.mp4', // [Feature] Background Video
        videoOpacity: 0.7, // [Feature] Background Opacity (0.0 ~ 1.0)
        beetleDelay: 7000,   // [New] 🪲 벌레 분수 등장 타이밍 (ms)
        beetleCount: 50,     // [New] 벌레 개수
        volume: 0.7,
        images: [
            // GodGame1 (Center) - 좌우에서 중앙으로
            { src: './img/GodGame1.png', width: '35%', top: '30%', slide: 'left', left: '-5%', transform: 'scaleX(-1)', delay: 5000, exitTime: 9000 },
            { src: './img/GodGame1.png', width: '35%', top: '30%', slide: 'right', right: '-5%', delay: 5000, exitTime: 9000 },
            // Godgame2 (Bottom) - 좌우에서 하단으로 (조금 늦게 등장)
            { src: './img/Godgame2.png', width: '45%', bottom: '-5%', slide: 'left', left: '0%', transform: 'scaleX(-1)', delay: 3500, exitTime: 9000 },
            { src: './img/Godgame2.png', width: '45%', bottom: '-5%', slide: 'right', right: '0%', delay: 3500, exitTime: 9000 }
        ]
    },

    // ==========================================
    // [돌핀 이펙트] (바다 서핑 연출)
    // 화면에 물결이 차오르고 돌핀/서퍼가 지나가는 연출입니다.
    // ==========================================
    dolphin: {
        duration: 21000,        // 전체 이펙트 지속 시간 (ms)
        soundKey: '돌핀',         // 연결된 사운드 키
        dolphinDelay: 6000,     // 메인 돌핀(서퍼/리더)이 등장하기까지의 지연 시간 (ms)
        creatureCount: 30,      // 화면을 돌아다니는 작은 바다 생물(물고기 등)의 개수
        extraCount: 40,         // 화면 아래에서 위로 솟아오르는 추가 생물 개수
        fontSize: '2.5rem',     // [Deprecated] 바다 생물 이모지의 기본 크기 (하위 호환용)
        creatureSize: '8rem', // [New] 바다 생물(물고기, 조개 등)의 크기
        nametagColor: '#00ffa3', // 서퍼 위에 표시될 이름표(닉네임)의 색상

        // [Deep Tuning] - 심화 설정
        dolphinScale: 1.5,      // 돌핀/서퍼의 크기 배율 (기본값: 1.5)
        dolphinRotation: 360,   // 돌핀이 튀어오를 때 회전하는 각도 (클수록 많이 회전)
        bounceSpeed: 1.0,       // [New] 돌핀의 이동 및 반동 속도 배율 (1.0 = 기본, 2.0 = 2배 빠름)
        surfingEmojis: ["🏄", "🏄‍♂️", "🏄‍♀️"], // 서퍼로 사용할 이모지 목록
        creaturePool: ["🦐", "🦀", "🐡", "🐠", "🐟", "🦑", "🐙", "🐚", "🦞"] // 바다 생물로 사용할 이모지 목록
    },

    // ==========================================
    // [해골 이펙트] (공포/글리치 연출)
    // 화면이 어두워지고 글자가 깨지는 듯한(글리치) 효과와 함께 해골이 등장합니다.
    // ==========================================
    skull: {
        duration: 12000,         // 전체 이펙트 지속 시간 (ms)
        soundKey: '해골',         // 연결된 사운드 키
        floatingTextDuration: 4000, // 초반부에 떠다니는 텍스트들이 유지되는 시간 (ms)
        fontSize: '10rem',      // 중앙 해골 이모지의 크기

        // [Deep Tuning] - 심화 설정
        glitchMinDelay: 260,    // 글리치(지지직거림) 효과 최소 간격 (ms)
        glitchMaxDelay: 780,    // 글리치 효과 최대 간격 (ms)
        textScale: 1.5          // 주변에 떠다니는 공포 텍스트의 크기 배율
    },

    // ==========================================
    // [버질 이펙트] (차원참/검기 연출)
    // 화면을 베는 듯한 검기 연출 후 유리가 깨지듯 파편이 튀는 효과입니다.
    // ==========================================
    vergil: {
        duration: 19000,        // 전체 이펙트 지속 시간 (ms)
        soundKey: '버질',         // 연결된 사운드 키
        slashCount: 30,         // 화면에 그어지는 검기(Slash)의 개수
        shardCount: 20,         // 폭발 시 생성되는 파편 조각의 구역당 개수
        textDelay: 10000,       // 파편 폭발 후 메시지가 나타나기까지의 지연 시간 (ms)

        // [Deep Tuning] - 심화 설정
        slashTrembleTime: 5200, // 검기가 그어진 후 부들부들 떨리기 시작하는 시간 (ms)
        explosionTime: 6200,    // 검기가 폭발하며 파편이 튀는 시간 (ms)
        slashStagger: 0.02,     // [New] 검기가 순차적으로 그어질 때의 시간 간격 (초) (작을수록 동시에 그어짐)
        shardSpeedMin: 1.5,     // 파편이 날아가는 최소 속도 (초)
        shardSpeedMax: 2.5,     // 파편이 날아가는 최대 속도 (초)
        shardDistance: 600      // 파편이 날아가는 거리 (px)
    },

    // ==========================================
    // [하트 이펙트] (사랑/분수 연출)
    // 화면 가득 하트와 이모지들이 분수처럼 뿜어져 나오는 연출입니다.
    // ==========================================
    heart: {
        duration: 18000,        // 전체 이펙트 지속 시간 (ms)
        soundKey: '하트',         // 연결된 사운드 키
        emojiCount: 1.5,        // 초당 생성되는 이모지의 개수 (밀도)
        fontSize: '1.5rem',     // 뿜어져 나오는 이모지의 크기

        // [Deep Tuning] - 심화 설정
        textScale: 1.3,         // 초반 텍스트(메시지)의 크기 배율
        phaseTiming: 11000,     // 텍스트 페이즈가 끝나고 본격적인 분수가 시작되는 시점 (ms)
        phaseInitialDelay: 800, // 텍스트 페이즈가 시작되기 전의 초기 대기 시간 (ms)
        emojiStartDelay: 11000, // 이모지 분수가 시작되는 대기 시간 (ms, phaseTiming과 맞추는 것 권장)
        rotationRange: 60,      // [New] 이모지가 회전하는 각도 범위 (+-값)
        emojiPool: [[0x1F600, 0x1F64F], [0x1F9D1, 0x1F9D1], [0x2764, 0x2764], [0x1F493, 0x1F49F], [0x1F466, 0x1F469], [0x1F48B, 0x1F48B]] // 사용할 이모지 범위 (유니코드)
    },

    // ==========================================
    // [커플 이펙트] (로맨틱/합체 연출)
    // 두 개의 이모지가 만나 합체하며 하트가 되는 서사적인 연출입니다.
    // ==========================================
    couple: {
        duration: 21000,        // 전체 이펙트 지속 시간 (ms)
        soundKey: '커플',         // 연결된 사운드 키
        fontSize: '13rem',      // 중앙 메인 이모지(합체 전/후)의 크기
        flashbackDuration: 11800, // 초반 플래시백(메시지 보여주는) 단계의 지속 시간 (ms)

        // [Deep Tuning] - 심화 설정
        intermediateScale: 1.5, // 합체 과정에서 보여지는 중간 단계 이모지들의 크기 배율
        bgOpacity: 0.3,         // [New] 이펙트 시 배경이 얼마나 어두워질지/색이 입혀질지 (0.0 ~ 1.0)
        personEmojiRanges: [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]], // 사람 이모지 범위
        heartEmojiRanges: [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]] // 하트 이모지 범위
    },

    // ==========================================
    // [발파 이펙트 (Valstrax)] (제트기/유성 연출)
    // 3중 구름 파랄락스 -> 제트기 돌파 -> 풍경 전환 -> 흉성 폭발 -> 유성 낙하
    // ==========================================
    // [New] 발파 (Valstrax) 이펙트 설정
    valstrax: {
        soundKey: '발파',       // 연결할 효과음 키워드
        duration: 18000,        // 전체 지속 시간 (18초로 조정)

        // [Phase Timing] - 수정 시 애니메이션 싱크가 깨질 수 있음
        jetDelay: 5000,         // 5초: 제트기 등장
        flashDelay: 6000,       // 6초: 화면 전환 (흰색 플래시)
        starExplodeDelay: 7300, // 7.3초: 붉은 별 폭발 & 유성 진입
        impactDelay: 9800,      // 9.8초: 유성 충돌 (2.5초 애니메이션 싱크)
        textAppearDelay: 10500, // 10.5초: 메시지 등장

        // [Cloud Settings]
        cloudHeight: 300,       // 구름 레이어의 높이 (px)
        cloudSize: 1000          // 구름 패턴의 가로 크기 (px)
    },

    // ==========================================
    // [방종송 이펙트] (강아지 애니메이션 + 화염 테두리)
    // 테오스트라와 루나스트라가 화면을 뛰어다니며, 화면 테두리에 화염 연출이 발생합니다.
    // ==========================================
    bangjong: {
        duration: 90000,        // 전체 지속 시간 (90초)
        soundKey: '방종송',      // 연결된 사운드 키
        teostraPath: './img/Teostra.png',
        lunastraPath: './img/Lunastra.png',
        characterCount: 2,      // 화면에 등장할 캐릭터 총 개수 (테오 1, 나나 1)
        characterSize: '35rem', // 캐릭터 크기
        flameSpeed: '2s'        // 테두리 화염 일렁임 속도
    },

    // ==========================================
    // [가자부 이펙트] (가자부 댄스/배경)
    // 화면 전체에 가자부 GIF가 나타나고 전용 BGM(8초)이 재생됩니다.
    // ==========================================
    gazabu: {
        soundKey: '가자부송',      // 연결된 사운드 키 (!가자부송)
        audioOverride: '가자부풀버전틀어주세요', // [Feature] Override: Play full version instead of short clip
        backgroundPath: './Video/가자부.mp4',
        duration: 8000,
        opacity: 0.8            // [New] Opacity control (0.0 ~ 1.0)
    },
    mulsulsan: {
        soundKey: null,
        audioOverride: null,
        backgroundPath: './Video/물설산씨티.mp4',
        duration: 35200,
        opacity: 0.9
    },

    // ==========================================
    // [당고 이펙트] (비디오 + 회전 이모지)
    // Dango.mp4 비디오가 재생되며 이모지들이 화면을 돌아다닙니다.
    // ==========================================
    dango: {
        duration: 19000,        // 전체 이펙트 지속 시간 (19초)
        videoPath: './Video/Dango.mp4', // 비디오 경로
        soundKey: '당고',        // 연결된 사운드 키
        emojiPool: ["🍡", "🍺", "🌀", "💫", "🥴", "🤢", "😵", "🤮"], // 화면에 뿌려질 이모지 목록
        emojiCount: 25,         // 동시에 화면에 떠다닐 이모지 개수
        emojiSize: '6rem',      // 이모지 크기
        videoWidth: '50vw',    // 비디오 너비 (예: 100vw, 800px)
        videoHeight: '50vh',   // 비디오 높이 (예: 100vh, 600px)
        videoOpacity: 0.7       // 비디오 투명도 (0.0 ~ 1.0)
    },
    king: {
        duration: 23000,        // 오디오 길이 (약 23초)
        imagePath: './img/King_Of_MH.png',
        soundKey: null,         // 별도 오디오 대신 직접 경로 사용 or HIVE_SOUND_CONFIG 미사용
        audioPath: './SFX/아들아.mp3',
        volume: 0.7,
        emojiPool: ["❄️"], // 눈폭풍에 포함될 이모지들
        emojiCount: 100,        // 눈폭풍 개체 수
        emojiSize: '50px',      // 이모지 크기 (기본값: 랜덤이었으나 이제 고정 또는 설정 가능)
        delayedEmojiPool: ["💩"], // 나중에 섞여서 내려올 이모지들
        delayedEmojiCount: 60, // 똥 폭풍 개체 수
        delayedEmojiDelay: 11000  // 똥 폭풍이 시작될 지연 시간 (밀리초, 11초)
    }
};

// ==========================================
// [4] 설정 연결 (System Integration)
// * 이 줄이 있어야 소리 중복 재생을 막아줍니다.
// ==========================================
window.HIVE_VISUAL_CONFIG = window.VISUAL_CONFIG;

// [1] 노말라이저(평준화) 스위치
window.NORMALIZER_CONFIG = {
    enabled: true,  // 전체 기능 켜기/끄기
    visual: true,  // 도네/비주얼 소리는 원음 그대로(웅장하게) -> false 추천
    sfx: true       // 채팅 효과음은 일정하게(귀 보호) -> true 추천
};

// [2] 컴프레서 세부 튜닝 (전문가용)
// 이 숫자를 바꾸면 소리의 '질감'이 바뀝니다.
// [4] 컴프레서 세부 튜닝 (Brick Wall Limiter @ -15dB)
window.COMPRESSOR_SETTINGS = {
    threshold: -15, // [핵심] 천장 높이를 -15dB로 설정
    knee: 0,        // [칼각] 부드러움 없이 칼같이 자름 (Hard Knee)
    ratio: 20,      // [철벽] 20:1 압축 (뚫고 나가지 못하게 꽉 막음)
    attack: 0,      // [즉발] 소리가 튀어나오자마자 0초 만에 잡음
    release: 0.1    // [빠름] 소리가 줄어들면 0.1초 만에 풀어줌
};

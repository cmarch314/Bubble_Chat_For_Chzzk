// ==========================================
// [Class 6.5] Message Router (Controller)
// ==========================================
class MessageRouter {
    constructor(config, eventBus, systemController, audioManager, visualDirector) {
        this.config = config;
        this.eventBus = eventBus;
        this.systemController = systemController;
        this.audioManager = audioManager;
        this.visualDirector = visualDirector;
    }

    route(msgData) {
        // 0. 스트리머 전용 제어 명령어 처리 (Refactored)
        if (this.systemController.handle(msgData)) return;

        // 구독 알람의 경우 메시지가 없으면 기본 문구 삽입 (Protocol V1.0)
        if (msgData.isSubscription && !msgData.message) {
            msgData.message = `${msgData.nickname}님 ${msgData.subMonth}개월 구독`;
        }

        const updatedTrimmedMsg = msgData.message ? msgData.message.trim() : "";

        // [New] 활성 미니게임 메시지 처리 (정답 제출/참여/공격)
        if (this.visualDirector.activeGame) {
            try {
                if (this.visualDirector.activeGame.handleChat(msgData)) {
                    return; // 게임 참여 채팅은 일반 말풍선이나 사운드로 중복 처리하지 않고 스킵
                }
            } catch (e) {
                console.error("❌ activeGame.handleChat error:", e);
            }
        }

        const lowerMsg = updatedTrimmedMsg.toLowerCase();
        if (lowerMsg === '!게임') {
            this.visualDirector.trigger('game_help', { message: updatedTrimmedMsg, nickname: msgData.nickname });
            return;
        }

        // [New] 스트리머 전용 미니게임 기동 명령어 처리
        if (msgData.isStreamer) {
            if (lowerMsg.startsWith('!퀴즈')) {
                this.visualDirector.trigger('sound_quiz', { message: updatedTrimmedMsg, nickname: msgData.nickname });
                return;
            }
            if (lowerMsg.startsWith('!경마')) {
                this.visualDirector.trigger('racing', { message: updatedTrimmedMsg, nickname: msgData.nickname });
                return;
            }
            if (lowerMsg.startsWith('!레이드')) {
                this.visualDirector.trigger('raid', { message: updatedTrimmedMsg, nickname: msgData.nickname });
                return;
            }
            if (lowerMsg.startsWith('!토벌') || lowerMsg.startsWith('!수렵')) {
                this.visualDirector.trigger('hunt', { message: updatedTrimmedMsg, nickname: msgData.nickname });
                return;
            }
        }

        // 0.5 특별 이벤트(구독) 처리
        if (msgData.isSubscription) {
            if (this.visualDirector.alertsEnabled || msgData.isStreamer) {
                this.visualDirector.trigger('dolphin', {
                    message: "!돌핀 " + msgData.message,
                    emotes: msgData.emojis,
                    nickname: msgData.nickname,
                    color: msgData.color,
                    isStreamer: msgData.isStreamer
                });
            }
            return; // 구독은 항상 버블 숨김
        }

        // 1. 비주얼 이펙트 트리거 확인 (VisualDirector 위임)
        let foundKeyword = null;
        const visualMap = this.visualDirector.registry;

        const lowerTrimmedMsg = updatedTrimmedMsg.toLowerCase();
        for (const key in visualMap) {
            if (key === 'dolphin' && !msgData.isStreamer) continue;
            if (key === 'bangjong' && !msgData.isStreamer) continue;
            if (key === 'mulsulsan' && (!msgData.isStreamer && !msgData.isDonation)) continue;
            if (key === 'gazabu' && (!msgData.isStreamer && !msgData.isDonation)) continue;
            if (key === 'random_dance' && (!msgData.isStreamer && !msgData.isDonation)) continue;
            
            const effect = visualMap[key];
            const soundKey = effect.soundKey;
            if (!soundKey) continue;
            const lowerSoundKey = soundKey.toLowerCase();

            // Check "!해골" or "!skull" (case-insensitive)
            const triggerKw = "!" + lowerSoundKey;
            if (msgData.isDonation) {
                if (lowerTrimmedMsg.includes(triggerKw)) {
                    foundKeyword = key;
                    break;
                }
            } else {
                if (lowerTrimmedMsg.startsWith(triggerKw)) {
                    foundKeyword = key;
                    break;
                }
            }
        }

        if (foundKeyword) {
            let shouldTrigger = false;

            if (msgData.isDonation) {
                // 후원은 알람 토글(alertsEnabled) 기준
                if (this.visualDirector.alertsEnabled || msgData.isStreamer) shouldTrigger = true;
            } else {
                // 일반 채팅은 이펙트 토글(enabled) 기준
                if (this.visualDirector.enabled || msgData.isStreamer) shouldTrigger = true;
            }

            if (shouldTrigger) {
                this.visualDirector.trigger(foundKeyword, {
                    message: updatedTrimmedMsg,
                    emotes: msgData.emojis,
                    nickname: msgData.nickname,
                    color: msgData.color,
                    isStreamer: msgData.isStreamer
                });
                return;
            }

            if (msgData.isDonation) {
                this.audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
                return;
            }
        } else {
            const t0 = performance.now();

            // [퀴즈 중 사운드 차단] 퀴즈 진행 중에는 채팅 사운드 재생을 막아 퀴즈 음원과의 혼동을 방지
            const quizActive = this.visualDirector.activeGame && this.visualDirector.activeGame.quizSilence;
            if (!quizActive) {
                this.audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
            }

            if (msgData.isDonation) return;
            
            this.eventBus.emit('chat:render', msgData);

            const t1 = performance.now();
            if ((t1 - t0) > 10) {
                console.warn(`[Slow Render] Took ${(t1 - t0).toFixed(2)}ms`);
            }
        }

    }
}

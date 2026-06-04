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
            this.audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
            if (msgData.isDonation) return;
            
            this.eventBus.emit('chat:render', msgData);

            const t1 = performance.now();
            if ((t1 - t0) > 10) {
                console.warn(`[Slow Render] Took ${(t1 - t0).toFixed(2)}ms`);
            }
        }
    }
}

// [Class 7] Message Queue Manager
// ==========================================
class MessageQueue {
    constructor(eventBus, processor = null) {
        this.eventBus = eventBus;
        this.processor = processor;
        this.queue = [];
        this.isProcessing = false;
        this.lastProcessTime = Date.now();
        this.baseDelay = 50; // 빠른 처리 (원래 300ms에서 단축)
    }

    enqueue(msgData) {
        this.queue.push({
            data: msgData,
            timestamp: Date.now()
        });
        if (!this.isProcessing) {
            console.log("▶ [Queue] Starting Process Loop");
            this._process();
        } else {
            // [Debug] Already processing
            // console.log(`[Queue] Buffered (Current Size: ${this.queue.length})`);
        }
    }

    _process() {
        if (this.queue.length === 0) {
            console.log("⏹ [Queue] Auto-Stop (Empty)");
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const currentItem = this.queue.shift();
        const now = Date.now();

        // [Simpler Adaptive Algorithm]
        // 큐에 있는 메시지 수만큼 속도를 단순 비례로 높입니다.
        // 공식: 300ms base
        const queueSize = this.queue.length + 1;
        let dynamicDelay = 50;

        // [Threshold-based Aggressive Algorithm - Faster]
        if (queueSize >= 5) dynamicDelay = 16;       // 60fps (폭주)
        else if (queueSize >= 3) dynamicDelay = 32;  // Very Fast
        else if (queueSize >= 2) dynamicDelay = 50;  // Fast
        else dynamicDelay = 80;                      // Normal (거의 즉시)

        // 콘솔에 큐 상태 로그 출력 (디버깅용)
        console.log(`[Queue] Proc: "${currentItem.data.message.substring(0, 10)}..." | Size: ${queueSize} | Delay: ${dynamicDelay}ms`);

        try {
            if (this.eventBus) {
                this.eventBus.emit('chat:process', currentItem.data);
            }
        } catch (e) {
            console.error("[Queue] Processor Error:", e);
        }

        setTimeout(() => {
            this._process();
        }, dynamicDelay);
    }
}


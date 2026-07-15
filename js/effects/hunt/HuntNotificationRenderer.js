class HuntNotificationRenderer {
    constructor(owner) { this.owner = owner; }
    get card() { return this.owner.card; }
    get animationTimers() { return this.owner.animationTimers; }

    spawnCombatChatBubble(idx, message) {
        if (!this.card) return;
        
        // Find the parent weapon card or lobby option card
        const parentCard = this.card.querySelector(`#fight-card-${idx}`) || this.card.querySelector(`#hunt-opt-${idx}`);
        if (!parentCard) return;

        // Hide lobby prep bubble immediately if it's currently visible
        const prepBubble = parentCard.querySelector('.lobby-prep-bubble');
        if (prepBubble) {
            prepBubble.classList.remove('visible');
        }

        // Target the weapon image container for rendering the bubble, fallback to parentCard
        const targetEl = parentCard.querySelector('.game-hunt-weapon-img-container') || parentCard;

        // Remove old bubble if exists
        const oldBubble = targetEl.querySelector('.combat-chat-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = 'combat-chat-bubble';
        
        // Escape HTML to prevent XSS
        const escapedMessage = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        bubble.innerHTML = escapedMessage;
        targetEl.appendChild(bubble);

        // Transition in
        this.animationTimers.timeout(() => {
            bubble.classList.add('visible');
        }, 10);

        // Auto remove bubble after 4 seconds
        this.animationTimers.timeout(() => {
            if (bubble.parentNode) {
                bubble.classList.remove('visible');
                this.animationTimers.timeout(() => {
                    if (bubble.parentNode) bubble.remove();
                }, 400);
            }
        }, 4000);
    }

    spawnLobbyNotification(idx, nickname, message, isSubscriber) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#hunt-opt-${idx}`);
        if (!targetEl) return;

        // 1. Notification Bubble
        const oldBubble = targetEl.querySelector('.lobby-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = isSubscriber ? 'lobby-bubble subscriber' : 'lobby-bubble';
        const nameLine = document.createElement('div');
        nameLine.style.cssText = `font-size:0.8rem;font-weight:bold;color:${isSubscriber ? '#00ffa3' : '#c98534'};margin-bottom:2px;`;
        nameLine.textContent = `${isSubscriber ? '👑 ' : ''}${nickname || 'Anonymous'}`;
        const messageLine = document.createElement('div');
        messageLine.style.cssText = 'font-size:0.95rem;font-weight:bold;color:#fff;';
        messageLine.textContent = String(message || '');
        bubble.append(nameLine, messageLine);
        targetEl.appendChild(bubble);

        // 2. Interactive Particles
        const emojis = isSubscriber ? ['👑', '🔥', '⚔️', '✨', '🍗'] : ['⛺', '🍗', '⚔️', '🛡️', '🏹'];
        const numParticles = isSubscriber ? 4 : 2;

        for (let i = 0; i < numParticles; i++) {
            const part = document.createElement('div');
            part.className = 'lobby-particle';
            part.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const rx = (Math.random() - 0.5) * 60;
            part.style.left = `calc(50% + ${rx}px)`;
            part.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
            part.style.setProperty('--dy', `-${65 + Math.random() * 50}px`);

            targetEl.appendChild(part);
            this.animationTimers.timeout(() => part.remove(), 1200);
        }

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(-20px)';
        }, 10);

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-50%) translateY(-35px)';
            this.animationTimers.timeout(() => bubble.remove(), 300);
        }, 2200);
    }

    spawnMaterialBox(idx, materialName) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#fight-card-${idx}`);
        if (!targetEl) return;

        // Remove old material box if exists
        const oldBox = targetEl.querySelector('.carve-material-box');
        if (oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.className = 'carve-material-box';

        let borderClr = '#00ffa3';
        let bgClr = 'rgba(0, 255, 163, 0.12)';
        let textClr = '#00ffa3';
        let rarityLabel = '일반';

        if (materialName.includes('홍옥') || materialName.includes('보옥') || materialName.includes('투기모피') || materialName.includes('대꼬리') || materialName.includes('재생가시')) {
            borderClr = '#ff9500';
            bgClr = 'rgba(255, 149, 0, 0.15)';
            textClr = '#c98534';
            rarityLabel = '🌟 희귀';
        } else if (materialName.includes('그레이트') || materialName.includes('비약') || materialName.includes('귀인약') || materialName.includes('가루')) {
            borderClr = '#af52de';
            bgClr = 'rgba(175, 82, 222, 0.15)';
            textClr = '#bf5af2';
            rarityLabel = '🧪 소비';
        }

        box.innerHTML = `
            <div style="font-size: 0.85rem; font-weight: bold; color: ${borderClr}; opacity: 0.85; margin-bottom: 2px;">${rarityLabel}</div>
            <div style="font-size: 1.45rem; font-weight: bold; color: ${textClr}; text-shadow: 0 0 5px rgba(0,0,0,0.8);">${materialName}</div>
        `;

        box.style.position = 'absolute';
        box.style.bottom = '115%';
        box.style.left = '50%';
        box.style.transform = 'translateX(-50%) translateY(15px)';
        box.style.background = 'rgba(15, 15, 15, 0.95)';
        box.style.border = `1.5px solid ${borderClr}`;
        box.style.padding = '8px 14px';
        box.style.borderRadius = '10px';
        box.style.whiteSpace = 'nowrap';
        box.style.zIndex = '200';
        box.style.opacity = '0';
        box.style.boxShadow = `0 4px 15px ${bgClr}`;
        box.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';

        targetEl.appendChild(box);

        this.animationTimers.timeout(() => {
            box.style.opacity = '1';
            box.style.transform = 'translateX(-50%) translateY(0)';
        }, 30);

        this.animationTimers.timeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translateX(-50%) translateY(-15px)';
            this.animationTimers.timeout(() => box.remove(), 400);
        }, 2500);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntNotificationRenderer;
} else {
    window.HuntNotificationRenderer = HuntNotificationRenderer;
}

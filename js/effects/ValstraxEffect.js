class ValstraxEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.activeStar = null;
    }

    async execute(context) {
        if (!this.config.getVisualConfig().valstrax) return Promise.resolve();
        const conf = this.config.getVisualConfig().valstrax;

        return new Promise(resolve => {
            // 1. 오버레이 생성
            const overlay = document.createElement('div');
            overlay.className = 'valstrax-overlay';
            overlay.style.setProperty('--cloud-height', `${conf.cloudHeight || 180}px`);
            overlay.style.setProperty('--cloud-size', `${conf.cloudSize || 400}px`);
            document.body.appendChild(overlay);

            // 초기 배경 이미지 추가 (6초 전까지)
            const initialBg = document.createElement('div');
            initialBg.className = 'valstrax-initial-bg';
            overlay.appendChild(initialBg);

            // 2. 초기 구름 (바닥 3겹) 생성
            const cloudsContainer = document.createElement('div');
            cloudsContainer.className = 'valstrax-clouds';
            cloudsContainer.innerHTML = `
                <div class="cloud-layer cloud-3"></div>
                <div class="cloud-layer cloud-2"></div>
                <div class="cloud-layer cloud-1"></div>
            `;
            overlay.appendChild(cloudsContainer);

            // 3. 5초: 제트기 (붉은 선 - 두 줄) & 제트운 (흰 선)
            setTimeout(() => {
                const contrailL = document.createElement('div');
                contrailL.className = 'valstrax-contrail valstrax-jet-left contrail-active';
                overlay.appendChild(contrailL);

                const contrailR = document.createElement('div');
                contrailR.className = 'valstrax-contrail valstrax-jet-right contrail-active';
                overlay.appendChild(contrailR);

                const jetL = document.createElement('div');
                jetL.className = 'valstrax-jet valstrax-jet-left jet-active';
                overlay.appendChild(jetL);

                const jetR = document.createElement('div');
                jetR.className = 'valstrax-jet valstrax-jet-right jet-active';
                overlay.appendChild(jetR);
            }, conf.jetDelay);

            // 4. 6초: 시네마틱 구름 서지 (전환 가림막)
            setTimeout(() => {
                const surge = document.createElement('div');
                surge.className = 'valstrax-surge';
                overlay.appendChild(surge);

                // 구름이 화면을 완전히 가리는 피크 시점(약 0.6초 뒤)에 요소 교체
                setTimeout(() => {
                    overlay.querySelectorAll('.valstrax-clouds, .valstrax-jet, .valstrax-contrail, .valstrax-initial-bg').forEach(el => el.remove());

                    const flashLayer = document.createElement('div');
                    flashLayer.className = 'valstrax-flash-layer scene-active';
                    overlay.appendChild(flashLayer);

                    const mountains = document.createElement('div');
                    mountains.className = 'valstrax-mountains';
                    overlay.appendChild(mountains);

                    const star = document.createElement('div');
                    star.className = 'valstrax-star';
                    star.style.opacity = '1';
                    overlay.appendChild(star);

                    this.activeStar = star;
                }, 600); // 0.6s Peak Timing

                // 3초 뒤(페이드아웃 완료 후) 서지 레이어 제거
                setTimeout(() => surge.remove(), 3000);
            }, conf.flashDelay);

            // 5. 7.3초: 별 폭발 & 유성 진입
            setTimeout(() => {
                if (this.activeStar) this.activeStar.style.display = 'none';

                const shaker = document.createElement('div');
                shaker.className = 'valstrax-shaker shaker-active';

                const meteor = document.createElement('div');
                meteor.className = 'valstrax-meteor meteor-active';

                shaker.appendChild(meteor);
                overlay.appendChild(shaker);
            }, conf.starExplodeDelay);

            // 6. 충돌 임팩트 (impactDelay 지점)
            setTimeout(() => {
                const impactFlash = document.createElement('div');
                impactFlash.className = 'valstrax-impact-flash';
                overlay.appendChild(impactFlash);

                setTimeout(() => impactFlash.classList.add('flash-fade-out'), 100);
                setTimeout(() => impactFlash.remove(), 1200);

                overlay.querySelectorAll('.valstrax-clouds, .valstrax-mountains, .valstrax-jet, .valstrax-meteor, .valstrax-star, .valstrax-flash-layer, .valstrax-shaker, .valstrax-contrail').forEach(el => el.remove());

                const finalBg = document.createElement('div');
                finalBg.className = 'valstrax-final-bg';
                overlay.appendChild(finalBg);

                // 충돌과 동시에 구름 등장
                const topClouds = document.createElement('div');
                topClouds.className = 'valstrax-clouds';
                topClouds.style.top = '0';
                topClouds.style.bottom = 'auto';
                topClouds.innerHTML = `
                    <div class="cloud-layer cloud-3 top"></div>
                    <div class="cloud-layer cloud-2 top"></div>
                    <div class="cloud-layer cloud-1 top"></div>
                `;
                overlay.appendChild(topClouds);

                const bottomClouds = document.createElement('div');
                bottomClouds.className = 'valstrax-clouds';
                bottomClouds.innerHTML = `
                    <div class="cloud-layer cloud-3"></div>
                    <div class="cloud-layer cloud-2"></div>
                    <div class="cloud-layer cloud-1"></div>
                `;
                overlay.appendChild(bottomClouds);
            }, conf.impactDelay);

            // 7. 메시지 등장 (textAppearDelay 지점)
            setTimeout(() => {
                let msg = context.message || "";
                msg = msg.replace(/!발파/i, '').trim();

                const msgBox = document.createElement('div');
                msgBox.className = 'valstrax-msg-box';
                msgBox.innerHTML = `<div>${msg}</div>`;
                overlay.appendChild(msgBox);

                // Fade In 효과
                requestAnimationFrame(() => msgBox.classList.add('visible'));
            }, conf.textAppearDelay);

            // 8. 18초: 종료
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, conf.duration);
        });
    }
}

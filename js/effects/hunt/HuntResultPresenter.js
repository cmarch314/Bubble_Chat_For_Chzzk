class HuntResultPresenter {
    static show(effect, container, isVictory, winner = null) {
        effect.isActive = false;
        effect.phase = 'results';
        effect.director.activeGame = null;

        effect.clearAllTimers();

        effect.audioManager.stopBgms();

        // Let the quest jingle establish itself, then let one of the already
        // assigned hunters speak with the same fixed voice used in combat.
        effect.audioManager.timers.timeout(() => {
            const resultHunter = winner || effect.selectedWeapons.find(hunter => hunter.hp > 0) || effect.selectedWeapons[0];
            effect.audioManager.playHunterActionVoice(resultHunter && resultHunter.index, isVictory ? 'victory' : 'cart', {
                force: true,
                volume: isVictory ? 0.5 : 0.46
            });
        }, 1100);

        if (isVictory) {
            try {
                const successBgms = [
                    'BGM/MHW_Quest_Clear.mp3',
                    'BGM/MH_Quest_Clear_Kokoto.mp3',
                    'BGM/MH_Quest_Clear_Pokke.mp3',
                    'BGM/MH_Quest_Clear_Yukumo.mp3',
                    'BGM/MH_Quest_Clear_MH4.mp3',
                    'BGM/MHR_Quest_Clear_Kamura.mp3'
                ];
                const selectedClear = successBgms[Math.floor(Math.random() * successBgms.length)];
                effect.audioManager.winBgm = effect.director.audioManager.createNativeAudio(selectedClear, {
                    type: 'visual', baseVolume: effect.audioManager.huntVolume(0.315)
                });
                effect.audioManager.winBgmPromise = effect.audioManager.winBgm.play().catch(() => {
                    effect.audioManager.playConfiguredSound(effect.config.getSoundConfig()['우승!'] || '우승!');
                });
            } catch (e) {
                effect.audioManager.playConfiguredSound(effect.config.getSoundConfig()['우승!'] || '우승!');
            }
        } else {
            try {
                const failBgms = [
                    'BGM/MH_Quest_Fail_Classic.mp3',
                    'BGM/MHW_Quest_Fail.mp3',
                    'BGM/MHR_Quest_Fail.mp3'
                ];
                const selectedFail = failBgms[Math.floor(Math.random() * failBgms.length)];
                effect.audioManager.winBgm = effect.director.audioManager.createNativeAudio(selectedFail, {
                    type: 'visual', baseVolume: effect.audioManager.huntVolume(0.315)
                });
                effect.audioManager.winBgmPromise = effect.audioManager.winBgm.play().catch(() => {
                    effect.audioManager.playConfiguredSound(effect.config.getSoundConfig()['안돼'] || '안돼');
                });
            } catch (e) {
                effect.audioManager.playConfiguredSound(effect.config.getSoundConfig()['안돼'] || '안돼');
            }
        }

        const card = container.querySelector('.game-hunt-card');
        const topPanel = card.querySelector('#game-hunt-top-panel');
        
        if (isVictory && winner) {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.display = 'none';
            }
            if (topPanel) {
                topPanel.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        margin: 35px 0 35px;
                        box-sizing: border-box;
                    ">
                        <div class="quest-stamp-container quest-complete-stamp">
                            <svg class="quest-svg-border" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
                                <!-- Plaque Backplate -->
                                <path d="M 45 20 L 555 20 C 560 20, 565 25, 565 30 L 565 120 C 565 125, 560 130, 555 130 L 45 130 C 40 130, 35 125, 35 120 L 35 30 C 35 25, 40 20, 45 20 Z" fill="currentColor" fill-opacity="0.05" />
                                
                                <!-- Left/Right Plaque Caps -->
                                <line x1="45" y1="35" x2="45" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />
                                <line x1="555" y1="35" x2="555" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />

                                <!-- TOP BORDER (y=30) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 18 L 77 30 L 65 42 L 53 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 30 L 77 30 M 65 18 L 65 42 M 59 24 L 71 36 M 71 24 L 59 36" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 27 L 265 27 M 85 33 L 265 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw -->
                                <path d="M 300 18 C 304 22, 306 28, 301 42 C 297 28, 296 22, 300 18 Z" fill="currentColor" />
                                <path d="M 288 20 C 291 23, 290 29, 283 39 C 283 29, 285 23, 288 20 Z" fill="currentColor" />
                                <path d="M 312 20 C 309 23, 310 29, 317 39 C 317 29, 315 23, 312 20 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 27 L 515 27 M 335 33 L 515 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 18 L 547 30 L 535 42 L 523 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 30 L 547 30 M 535 18 L 535 42 M 529 24 L 541 36 M 541 24 L 529 36" stroke="currentColor" stroke-width="1.2" />


                                <!-- BOTTOM BORDER (y=120) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 108 L 77 120 L 65 132 L 53 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 120 L 77 120 M 65 108 L 65 132 M 59 114 L 71 126 M 71 114 L 59 126" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 117 L 265 117 M 85 123 L 265 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw (mirrored vertically to point up) -->
                                <path d="M 300 132 C 304 128, 306 122, 301 108 C 297 122, 296 128, 300 132 Z" fill="currentColor" />
                                <path d="M 288 130 C 291 127, 290 121, 283 111 C 283 121, 285 127, 288 130 Z" fill="currentColor" />
                                <path d="M 312 130 C 309 127, 310 121, 317 111 C 317 121, 315 127, 312 130 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 117 L 515 117 M 335 123 L 515 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 108 L 547 120 L 535 132 L 523 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 120 L 547 120 M 535 108 L 535 132 M 529 114 L 541 126 M 541 114 L 529 126" stroke="currentColor" stroke-width="1.2" />
                            </svg>
                            <div class="quest-gothic-text">QUEST COMPLETE</div>
                        </div>
                    </div>
                `;
            }

            const playCarveSound = (materialName) => {
                if (materialName.includes('홍옥') || materialName.includes('보옥') || materialName.includes('투기모피') || materialName.includes('대꼬리') || materialName.includes('재생가시')) {
                    effect.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found (rarest).mp3', null, 0.5);
                } else if (materialName.includes('그레이트') || materialName.includes('비약') || materialName.includes('귀인약') || materialName.includes('가루')) {
                    effect.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found (rare).mp3', null, 0.5);
                } else {
                    effect.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found.mp3', null, 0.5);
                }
            };
            
            // 기절한 헌터들은 기절 상태 유지, 생존자들은 3회 갈무리 슥슥 시작
            effect.victoryEmojiTimeouts = [];
            effect.selectedWeapons.forEach((w, i) => {
                const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                if (!weaponCard) return;

                if (w.hp > 0) {
                    w.isCarving = true; // 갈무리(채집) 상태 활성화
                    const tag = card.querySelector(`#status-tag-${w.index}`);
                    
                    weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                    void weaponCard.offsetWidth;
                    weaponCard.classList.add('victory-bounce');
                    if (tag) tag.remove();

                    // Stagger delay based on hunter index in selectedWeapons array (0, 1.2s, 2.4s, 3.6s)
                    const staggerDelay = i * 1200;

                    const material1 = effect.getMonsterMaterialName(effect.selectedMonster.nameKO, w.personality);
                    const material2 = effect.getMonsterMaterialName(effect.selectedMonster.nameKO, w.personality);
                    const material3 = effect.getMonsterMaterialName(effect.selectedMonster.nameKO, w.personality);

                    // 1차 갈무리 (staggerDelay): 둥근 감정표현 버블로 칼질 이모지 띄우기
                    const t1 = effect.timers.timeout(() => {
                        if (effect.phase === 'results' && w.hp > 0) {
                            effect.renderer.spawnVictoryEmoji(w.index, '🔪');
                        }
                    }, staggerDelay);
                    effect.victoryEmojiTimeouts.push(t1);

                    // 2차 갈무리 (staggerDelay + 2000): 칼질 이모지 버블 팝 & 1차 소재 사운드 & 소재 메시지 박스 표현
                    const t2 = effect.timers.timeout(() => {
                        if (effect.phase === 'results' && w.hp > 0) {
                            effect.renderer.spawnVictoryEmoji(w.index, '🔪');
                            playCarveSound(material1);
                            effect.renderer.spawnMaterialBox(w.index, material1);
                            effect.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material1}]을(를) 획득했습니다.`);
                        }
                    }, staggerDelay + 2000);
                    effect.victoryEmojiTimeouts.push(t2);

                    // 3차 갈무리 (staggerDelay + 4000): 칼질 이모지 버블 팝 & 2차 소재 사운드 & 소재 메시지 박스 표현
                    const t3 = effect.timers.timeout(() => {
                        if (effect.phase === 'results' && w.hp > 0) {
                            effect.renderer.spawnVictoryEmoji(w.index, '🔪');
                            playCarveSound(material2);
                            effect.renderer.spawnMaterialBox(w.index, material2);
                            effect.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material2}]을(를) 획득했습니다.`);
                        }
                    }, staggerDelay + 4000);
                    effect.victoryEmojiTimeouts.push(t3);

                    // 갈무리 완료 (staggerDelay + 6000): 갈무리 상태 해제 & 3차 소재 사운드 & 획득 완료 이모지 버블 & 소재 메시지 박스 표현
                    const t4 = effect.timers.timeout(() => {
                        if (effect.phase === 'results' && w.hp > 0) {
                            w.isCarving = false; // 갈무리 완수! 감정표현 차단 해제!
                            playCarveSound(material3);
                            effect.renderer.spawnMaterialBox(w.index, material3);
                            effect.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material3}]을(를) 획득했습니다.`);
                            effect.renderer.spawnVictoryEmoji(w.index, '💎');
                        }
                    }, staggerDelay + 6000);
                    effect.victoryEmojiTimeouts.push(t4);

                } else {
                    weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                    void weaponCard.offsetWidth;
                    weaponCard.style.transform = 'rotate(180deg)';
                    const tag = card.querySelector(`#status-tag-${w.index}`);
                    if (tag) {
                        tag.textContent = '💀 기절 (수레)';
                        tag.className = 'game-hunt-status-tag fainted';
                    }
                }
            });

            // 생존자 Victory 감정표현 루프 시작 (각 헌터마다 4~6초 주기로 반복)
            const livingHunters = effect.selectedWeapons.filter(w => w.hp > 0);
            if (livingHunters.length > 0) {
                livingHunters.forEach((hunter, idx) => {
                    const originalIdx = effect.selectedWeapons.findIndex(w => w.index === hunter.index);
                    const staggerDelay = originalIdx >= 0 ? originalIdx * 1200 : idx * 1200;

                    const runHunterEmojiLoop = () => {
                        if (effect.phase !== 'results') return;
                        
                        // 채집(갈무리) 중에는 감정표현 금지!
                        if (hunter.isCarving || hunter.isGathering) {
                            const delay = 1000; // 1초 뒤에 다시 시도
                            const timeoutId = effect.timers.timeout(runHunterEmojiLoop, delay);
                            effect.victoryEmojiTimeouts.push(timeoutId);
                            return;
                        }

                        const personality = hunter.personality || 'normal';
                        const pool = effect.victoryEmojiMap[personality] || effect.victoryEmojiMap.normal;
                        const randomEmoji = pool[Math.floor(Math.random() * pool.length)];

                        effect.renderer.spawnVictoryEmoji(hunter.index, randomEmoji);

                        const delay = 4000 + Math.random() * 2000;
                        const timeoutId = effect.timers.timeout(runHunterEmojiLoop, delay);
                        effect.victoryEmojiTimeouts.push(timeoutId);
                    };

                    // 갈무리가 6초 동안 수행되므로, 최초 Stagger 지연을 staggerDelay + 6.5s ~ 8.5s로 주어 갈무리 직후부터 감정표현 루프가 돌게 만듭니다!
                    const initialDelay = staggerDelay + 6500 + Math.random() * 2000;
                    const initialTimeoutId = effect.timers.timeout(runHunterEmojiLoop, initialDelay);
                    effect.victoryEmojiTimeouts.push(initialTimeoutId);
                });
            }
        } else {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.display = 'none';
            }
            if (topPanel) {
                const actionLabel = effect.monsterTier === 'elder' ? '토벌' : '수렵';
                topPanel.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        margin: 35px 0 35px;
                        box-sizing: border-box;
                    ">
                        <div class="quest-stamp-container quest-failed-stamp">
                            <svg class="quest-svg-border" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
                                <!-- Plaque Backplate -->
                                <path d="M 45 20 L 555 20 C 560 20, 565 25, 565 30 L 565 120 C 565 125, 560 130, 555 130 L 45 130 C 40 130, 35 125, 35 120 L 35 30 C 35 25, 40 20, 45 20 Z" fill="currentColor" fill-opacity="0.05" />
                                
                                <!-- Left/Right Plaque Caps -->
                                <line x1="45" y1="35" x2="45" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />
                                <line x1="555" y1="35" x2="555" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />

                                <!-- TOP BORDER (y=30) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 18 L 77 30 L 65 42 L 53 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 30 L 77 30 M 65 18 L 65 42 M 59 24 L 71 36 M 71 24 L 59 36" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 27 L 265 27 M 85 33 L 265 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw -->
                                <path d="M 300 18 C 304 22, 306 28, 301 42 C 297 28, 296 22, 300 18 Z" fill="currentColor" />
                                <path d="M 288 20 C 291 23, 290 29, 283 39 C 283 29, 285 23, 288 20 Z" fill="currentColor" />
                                <path d="M 312 20 C 309 23, 310 29, 317 39 C 317 29, 315 23, 312 20 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 27 L 515 27 M 335 33 L 515 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 18 L 547 30 L 535 42 L 523 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 30 L 547 30 M 535 18 L 535 42 M 529 24 L 541 36 M 541 24 L 529 36" stroke="currentColor" stroke-width="1.2" />


                                <!-- BOTTOM BORDER (y=120) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 108 L 77 120 L 65 132 L 53 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 120 L 77 120 M 65 108 L 65 132 M 59 114 L 71 126 M 71 114 L 59 126" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 117 L 265 117 M 85 123 L 265 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw (mirrored vertically to point up) -->
                                <path d="M 300 132 C 304 128, 306 122, 301 108 C 297 122, 296 128, 300 132 Z" fill="currentColor" />
                                <path d="M 288 130 C 291 127, 290 121, 283 111 C 283 121, 285 127, 288 130 Z" fill="currentColor" />
                                <path d="M 312 130 C 309 127, 310 121, 317 111 C 317 121, 315 127, 312 130 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 117 L 515 117 M 335 123 L 515 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 108 L 547 120 L 535 132 L 523 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 120 L 547 120 M 535 108 L 535 132 M 529 114 L 541 126 M 541 114 L 529 126" stroke="currentColor" stroke-width="1.2" />
                            </svg>
                            <div class="quest-gothic-text">QUEST FAILED</div>
                        </div>
                        <div style="font-size:1.4rem; color:#ccc; margin-top: 4px; text-align: center; line-height: 1.4;">
                            3번의 수레 탑승 누적으로 ${actionLabel} 퀘스트에 실패했습니다.<br>
                            <span style="font-size:1.25rem; color:#888;">${effect.selectedMonster.nameKO}은(는) 유유히 떠났습니다.</span>
                        </div>
                    </div>
                `;
            }
 
            effect.selectedWeapons.forEach(w => {
                const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                if (weaponCard) {
                    if (w.hp > 0) {
                        weaponCard.classList.add('crying-hunter');
                        const tearDrops = document.createElement('div');
                        tearDrops.className = 'tear-drops';
                        tearDrops.innerHTML = `
                            <div class="tear tear-left"></div>
                            <div class="tear tear-right"></div>
                        `;
                        weaponCard.appendChild(tearDrops);
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = '훌쩍 훌쩍...';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    } else {
                        weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                        void weaponCard.offsetWidth;
                        weaponCard.classList.add('dead');
                        weaponCard.style.transform = 'rotate(180deg)';
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = '💀 기절 (수레)';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    }
                }
            });
        }
 
        const displayDuration = isVictory ? 30000 : 15000;
        // [FIX] 이전 수렵 UI 파괴 버그 방지를 위해 멤버 변수로 타이머 추적
        effect.endGameFadeoutTimer = effect.timers.timeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            effect.endGameFadeoutTimer = effect.timers.timeout(() => {
                effect.renderer.removeContainer();
                document.body.classList.remove('in-hunt');
                effect.audioManager.stopBgms();
                if (effect.resolveGame) {
                    effect.resolveGame();
                    effect.resolveGame = null;
                }
                effect.endGameFadeoutTimer = null;
            }, 500);
        }, displayDuration);
    }
}

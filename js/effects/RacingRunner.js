class RacingRunner {
    static start(effect, resolve) {
        effect.phase = 'racing';
        
        // 안전 장치: 혹시라도 남아있을 기존 BGM 완전 정리
        if (effect.bettingBgm) {
            const bgm = effect.bettingBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (effect.bettingBgmPlayPromise) {
                effect.bettingBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            effect.bettingBgm = null;
            effect.bettingBgmPlayPromise = null;
        }
        if (effect.raceBgm) {
            const bgm = effect.raceBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (effect.raceBgmPlayPromise) {
                effect.raceBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            effect.raceBgm = null;
            effect.raceBgmPlayPromise = null;
        }

        // 1. 질주 배경 BGM 로딩 및 재생 (소개 페이즈부터 시작)
        try {
            effect.raceBgm = effect.director.audioManager.createNativeAudio('BGM/William Tell.mp3', {
                type: 'visual', baseVolume: 0.45
            });
            effect.raceBgmPlayPromise = effect.raceBgm.play().catch(e => console.warn("Race BGM playback blocked:", e));
        } catch (e) {
            console.warn("Failed to load racing BGM:", e);
        }

        const track = document.createElement('div');
        track.className = 'game-racetrack-container';
        track.innerHTML = `
            <div class="game-title" style="font-size:3.5rem; text-align:center; margin-bottom: 8px;">
                <img class="emoji" alt="🏇" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c7.svg" style="width:3.5rem; height:3.5rem; vertical-align:middle; display:inline-block;" /> 실시간 경마 레이스! <img class="emoji" alt="🏁" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c1.svg" style="width:3.5rem; height:3.5rem; vertical-align:middle; display:inline-block;" />
            </div>
            <div style="font-size:2.0rem; text-align:center; color:#00d2ff; margin-bottom:20px; font-weight:bold;">
                채팅창에 번호(1~4) 또는 이모지를 쳐서 응원선수에게 부스트(⚡)를 주세욧!
            </div>
            <div class="game-racing-finish-line"></div>
            ${effect.racers.map(r => `
                <div class="game-lane-track" id="racer-lane-${r.id}">
                    <div class="game-lane-num-badge">${r.id + 1}</div>
                    <div class="game-racer-wrapper" id="wrapper-${r.id}" style="left: 80px;">
                        <div class="game-racer-status-bubble" id="status-bubble-${r.id}"></div>
                        <div class="game-racer-avatar" id="avatar-${r.id}">
                            <img class="emoji" alt="${r.emoji}" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${r.code}.svg" style="width:clamp(70px, 8.4vh, 140px); height:clamp(70px, 8.4vh, 140px); display:block;" />
                        </div>
                        <div class="game-racer-label" id="label-${r.id}">${r.name}</div>
                    </div>
                </div>
            `).join('')}
            <div class="game-commentary-bar" id="game-commentary"><img class="emoji" alt="🎤" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3a4.svg" style="width:2.0rem; height:2.0rem; vertical-align:middle; display:inline-block;" /> [중계진] 경기 신호와 함께 힘차게 출발했습니다! 초반 기선 제압이 중요합니다!</div>
        `;
        document.body.appendChild(track);

        const width = window.innerWidth * 0.9;
        const finishX = width - 220; // Finish line boundary (adjusted for 2x larger racers)

        const commentaryEl = track.querySelector('#game-commentary');
        const updateCommentary = (text) => {
            if (commentaryEl) {
                commentaryEl.innerHTML = parseEmojisToImages(text, '2.0rem');
            }
        };

        // 13초 소개 타이머 세팅
        let introTicks = Math.round(13 * 1000 / 60); // 13초 = 217 ticks
        const INTRO_TEXTS = window.RACING_INTRO_TEXTS;

        let ticks = 0;
        let bgmDuration = 42; // loadedmetadata 전 폴백 시간
        let runDuration = Math.max(5, bgmDuration - 13); // 실 주행 시간 (BGM 시간 - 소개 시간 13초)
        let totalTicks = runDuration * 1000 / 60;
        let targetAvgSpeed = 100 / totalTicks;

        if (effect.raceBgm) {
            const onMetadataLoaded = () => {
                bgmDuration = effect.raceBgm.duration || 42;
                runDuration = Math.max(5, bgmDuration - 13);
                totalTicks = runDuration * 1000 / 60;
                targetAvgSpeed = 100 / totalTicks;
            };
            if (effect.raceBgm.readyState >= 1) {
                onMetadataLoaded();
            } else {
                effect.raceBgm.addEventListener('loadedmetadata', onMetadataLoaded);
            }
        }

        const interval = effect.runtime.interval(() => {
            if (!effect.isActive) {
                effect.runtime.clear(interval);
                return;
            }
            let finished = false;
            let winnerId = -1;
            ticks++;

            // 1. 소개(인트로) 상태 처리 (13초 = 217 ticks 동안)
            if (introTicks > 0) {
                introTicks--;
                const elapsedMs = ticks * 60;
                const elapsedSec = elapsedMs / 1000;
                const activeRacerIdx = Math.floor(elapsedSec / 3); // 3초마다 1마리씩

                effect.racers.forEach((r, idx) => {
                    const av = track.querySelector(`#avatar-${r.id}`);
                    const bubble = track.querySelector(`#status-bubble-${r.id}`);

                    if (idx === activeRacerIdx && elapsedSec < 12) {
                        // 소개 대상 말: 1.8배로 줌인
                        r.scale = 1.8;
                        r.statusText = INTRO_TEXTS[r.emoji] || `${r.emoji} ${r.name}, 출발 준비 완료!`;
                        
                        // 매 3초가 시작될 때마다 말 울음소리/시작 CMC 연동
                        if (Math.abs(elapsedMs % 3000 - 60) < 30) {
                            effect.playRaceSound('win'); // "대박" 등 활기찬 목소리로 소개
                            updateCommentary(`🎤 [중계진] ${idx + 1}번 마, ${r.name} 선수가 온몸의 힘을 충전하며 긴장감을 올립니다!`);
                        }
                    } else if (elapsedSec >= 12 && elapsedSec < 13) {
                        // 카운트다운 기간 (12~13초)
                        r.scale = 1.0;
                        r.statusText = '🏁 게이트 정렬!';
                        if (Math.abs(elapsedMs % 12000 - 60) < 30) {
                            effect.playRaceSound('start'); // "시작!" 등 사운드
                            updateCommentary(`🎤 [중계진] 모든 선수 준비 완료! 게이트가 닫히고 출발 신호를 대기합니다!`);
                        }
                    } else {
                        // 소개받지 않는 다른 말들: scale 다운하여 줌인 효과 강조
                        r.scale = 0.85;
                        r.statusText = '';
                    }

                    if (av) {
                        av.style.transform = `scale(${r.scale})`;
                    }
                    if (bubble) {
                        if (r.statusText) {
                            bubble.innerHTML = parseEmojisToImages(r.statusText, '1.2rem');
                            bubble.classList.add('visible');
                        } else {
                            bubble.classList.remove('visible');
                        }
                    }
                });

                if (introTicks === 0) {
                    // 소개 상태 복원
                    effect.racers.forEach(r => {
                        r.scale = 1.0;
                        r.statusText = '';
                        const av = track.querySelector(`#avatar-${r.id}`);
                        const bubble = track.querySelector(`#status-bubble-${r.id}`);
                        if (av) av.style.transform = `scale(1.0)`;
                        if (bubble) bubble.classList.remove('visible');
                    });
                    
                    effect.playRaceSound('start');
                    updateCommentary(`🎤 [중계진] 탕! 신호와 함께 전설적인 레이스가 시작됩니다!!!`);
                    ticks = 0; // 달리기를 위한 틱 카운트 초기화
                }
                return;
            }

            // 2. 실제 달리기 처리
            // Periodic commentary updates every 90 ticks (~5.4s)
            if (ticks % 90 === 0) {
                const sorted = RacingRules.standings(effect.racers);
                const leader = sorted[0];
                const second = sorted[1];
                const last = sorted[3];

                const comments = [
                    `🎤 [중계진] 현재 1위는 ${leader.emoji} ${leader.name}! 선두를 굳건히 지키고 있습니다!`,
                    `🎤 [중계진] ${second.emoji} ${second.name} 선수가 선두 ${leader.name}를 바짝 압박 중입니다!`,
                    `🎤 [중계진] 힘을 내야 합니다! ${last.emoji} ${last.name} 선수가 하위권에서 역전을 노립니다!`,
                    `🎤 [중계진] 경기장 열기가 뜨겁습니다! 과연 어떤 말이 우승을 차지할까요?`
                ];
                updateCommentary(comments[Math.floor(Math.random() * comments.length)]);
            }

            effect.racers.forEach(r => {
                if (finished) return;

                // Decrement stun ticks
                if (r.stunTicks > 0) {
                    r.stunTicks--;
                    if (r.stunTicks === 0) {
                        r.rotate = 0;
                        r.scale = 1.0;
                    }
                }

                // Decrement shield ticks
                if (r.shieldTicks > 0) {
                    r.shieldTicks--;
                }

                // Decrement status timer
                if (r.statusTimer > 0) {
                    r.statusTimer--;
                    if (r.statusTimer === 0) {
                        r.statusText = '';
                    }
                }

                // Decrement event cooldown ticks
                if (r.eventCooldownTicks > 0) {
                    r.eventCooldownTicks--;
                }

                // Item check 1 (At 35% distance)
                if (r.pos >= 35 && !r.hasItem1 && (!r.eventCooldownTicks || r.eventCooldownTicks === 0)) {
                    r.hasItem1 = true;
                    r.eventCooldownTicks = 50; // 3 seconds cooldown
                    effect.triggerItemEvent(r, updateCommentary);
                }

                // Item check 2 (At 70% distance)
                if (r.pos >= 70 && !r.hasItem2 && (!r.eventCooldownTicks || r.eventCooldownTicks === 0)) {
                    r.hasItem2 = true;
                    r.eventCooldownTicks = 50; // 3 seconds cooldown
                    effect.triggerItemEvent(r, updateCommentary);
                }

                // Random event trigger: 0.8% chance per tick (21 rich random events!)
                if (r.stunTicks === 0 && r.pos > 5 && r.pos < 90 && (!r.eventCooldownTicks || r.eventCooldownTicks === 0) && Math.random() < 0.008) {
                    r.eventCooldownTicks = 50; // 3 seconds cooldown
                    const eventRoll = Math.random();
                    if (eventRoll < 0.05 && r.shieldTicks === 0) {
                        // 1. Slipped on banana!
                        r.stunTicks = 25; 
                        r.rotate = 360;
                        r.scale = 0.9;
                        r.statusText = '🍌 바나나 밟음!';
                        r.statusTimer = 25;
                        effect.playRaceSound('slip');
                        updateCommentary(`🎤 [중계진] 앗! ${r.name} 선수가 누군가 버린 바나나 껍질에 미끄러집니다!!!`);
                    } else if (eventRoll < 0.10) {
                        // 2. Struck by lightning!
                        r.boost += 4.0;
                        r.scale = 1.35;
                        r.statusText = '⚡ 벼락 돌진!';
                        r.statusTimer = 20;
                        effect.playRaceSound('lightning');
                        updateCommentary(`🎤 [중계진] 쿠르릉 쾅! ${r.name} 선수, 마른하늘에 날벼락을 맞고 초고속 돌진!!!`);
                    } else if (eventRoll < 0.15 && r.shieldTicks === 0) {
                        // 3. Tripped!
                        r.stunTicks = 18; 
                        r.rotate = -90;
                        r.statusText = '🤕 엎어짐!';
                        r.statusTimer = 18;
                        effect.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 아이쿠! ${r.name} 선수, 턱에 걸려 꼴사납게 엎어집니다!`);
                    } else if (eventRoll < 0.20) {
                        // 4. Exhausted / Sleepy!
                        r.stunTicks = 15;
                        r.scale = 0.8;
                        r.statusText = '💤 졸음 비틀';
                        r.statusTimer = 15;
                        effect.playRaceSound('sleep');
                        updateCommentary(`🎤 [중계진] ${r.name} 선수, 밤샘 수렵으로 졸음 비틀 상태에 빠집니다!`);
                    } else if (eventRoll < 0.25) {
                        // 5. Overdrive!
                        r.boost += 6.0;
                        r.statusText = '🔥 부스터 폭발!';
                        r.statusTimer = 25;
                        effect.playRaceSound('overdrive');
                        updateCommentary(`🎤 [중계진] ${r.name} 선수, 엉덩이에 부스터 점화! 무서운 속도입니다!`);
                    } else if (eventRoll < 0.30) {
                        // 6. Portal Teleport!
                        r.pos += 4.0;
                        r.statusText = '🌀 차원 관통!';
                        r.statusTimer = 20;
                        effect.playRaceSound('portal');
                        updateCommentary(`🎤 [중계진] 공간 왜곡! ${r.name} 선수가 포탈을 타고 훌쩍 앞서나갑니다!`);
                    } else if (eventRoll < 0.35) {
                        // 7. Wind Gust!
                        r.boost += 3.0;
                        r.statusText = '🌪️ 순풍 탑승!';
                        r.statusTimer = 20;
                        effect.playRaceSound('wind');
                        updateCommentary(`🎤 [중계진] 대기 흐름 가동! ${r.name} 선수, 순풍을 타고 매끄럽게 속도를 올립니다!`);
                    } else if (eventRoll < 0.40 && r.shieldTicks === 0) {
                        // 8. Stumble/Dizzy!
                        r.stunTicks = 12;
                        r.rotate = 360;
                        r.statusText = '💫 어지러움!';
                        r.statusTimer = 15;
                        effect.playRaceSound('dizzy');
                        updateCommentary(`🎤 [중계진] 아차차! ${r.name} 선수, 발이 꼬이며 제자리 360도 턴을 돕니다!`);
                    } else if (eventRoll < 0.45) {
                        // 9. Gravity Inversion!
                        r.boost += 4.6;
                        r.scale = 1.25;
                        r.statusText = '🎈 반중력 부상!';
                        r.statusTimer = 25;
                        effect.playRaceSound('gravity');
                        updateCommentary(`🎤 [중계진] 중력 상실! ${r.name} 선수가 가볍게 떠오르며 트랙 마찰을 무시하고 질주합니다!`);
                    } else if (eventRoll < 0.50) {
                        // 10. Rivalry / Fire in Eyes!
                        r.boost += 6.6;
                        r.statusText = '🔥 승부욕 폭발!';
                        r.statusTimer = 20;
                        effect.playRaceSound('fire');
                        updateCommentary(`🎤 [중계진] 눈빛 교환! ${r.name} 선수가 엄청난 열정을 내뿜으며 앞서나갑니다!`);
                    } else if (eventRoll < 0.55 && r.shieldTicks === 0) {
                        // 11. Mud Puddle!
                        r.stunTicks = 16;
                        r.statusText = '💩 진흙 함정!';
                        r.statusTimer = 16;
                        effect.playRaceSound('mud');
                        updateCommentary(`🎤 [중계진] 앗! ${r.name} 선수가 질척이는 진흙 웅덩이에 빠져 버둥거립니다!`);
                    } else if (eventRoll < 0.60 && r.shieldTicks === 0) {
                        // 12. Hypnosis / Reverse Run!
                        r.pos = Math.max(0, r.pos - 5.0);
                        r.statusText = '🌀 최면 역주행!';
                        r.statusTimer = 15;
                        effect.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 이런! ${r.name} 선수가 최면에 걸려 잠시 역주행을 시도합니다!`);
                    } else if (eventRoll < 0.65) {
                        // 13. Gold Rush / Coin Shower!
                        r.boost += 3.3;
                        r.statusText = '🪙 황금 샤워!';
                        r.statusTimer = 20;
                        effect.playRaceSound('carrot');
                        updateCommentary(`🎤 [중계진] 보너스 타임! ${r.name} 선수가 트랙에 떨어진 금화를 주우며 전진합니다!`);
                    } else if (eventRoll < 0.70 && r.shieldTicks === 0) {
                        // 14. EMP Blast!
                        r.stunTicks = 14;
                        r.statusText = '🔌 EMP 타격!';
                        r.statusTimer = 14;
                        effect.playRaceSound('missile');
                        updateCommentary(`🎤 [중계진] 피잉! 전자기 펄스가 발생해 ${r.name} 선수의 전자 제어가 일시 정지됩니다!`);
                    } else if (eventRoll < 0.75) {
                        // 15. Adrenaline Rush!
                        r.boost += 8.3;
                        r.statusText = '⚡ 아드레날린!';
                        r.statusTimer = 22;
                        effect.playRaceSound('overdrive');
                        updateCommentary(`🎤 [중계진] 호르몬 폭발! ${r.name} 선수가 폭발적인 아드레날린 분출로 달리기 시작합니다!`);
                    } else if (eventRoll < 0.80) {
                        // 16. Tornado fling!
                        r.pos += 5.0;
                        r.stunTicks = 10;
                        r.rotate = 720;
                        r.statusText = '🌪️ 회오리 탑승!';
                        r.statusTimer = 20;
                        effect.playRaceSound('wind');
                        updateCommentary(`🎤 [중계진] 거센 토네이도! ${r.name} 선수가 회오리에 휘말려 앞으로 날아갔지만 비틀거립니다!`);
                    } else if (eventRoll < 0.85) {
                        // 17. Sneezing!
                        r.pos += 2.0;
                        r.rotate = 30;
                        r.statusText = '🤧 재채기 뿜!';
                        r.statusTimer = 15;
                        effect.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 에취! ${r.name} 선수가 강력한 재채기 추진력으로 앞으로 살짝 밀려납니다!`);
                    } else if (eventRoll < 0.90) {
                        // 18. Shadow Clone!
                        r.boost += 4.3;
                        r.statusText = '🥷 분신 분열!';
                        r.statusTimer = 20;
                        effect.playRaceSound('ghost');
                        updateCommentary(`🎤 [중계진] 인법 분신술! ${r.name} 선수가 잔상을 남기며 앞으로 빠르게 가속합니다!`);
                    } else if (eventRoll < 0.95) {
                        // 19. Giant Weight Stomp!
                        r.stunTicks = 8;
                        r.scale = 1.6;
                        r.statusText = '🏋️ 무게 초과!';
                        r.statusTimer = 20;
                        effect.playRaceSound('tackle');
                        updateCommentary(`🎤 [중계진] 쿵! ${r.name} 선수가 대형화되며 엄청난 무게로 바닥을 찍고 비틀댑니다!`);
                    } else if (r.shieldTicks === 0) {
                        // 20. Panic run!
                        r.boost += 5.0;
                        r.rotate = 45;
                        r.statusText = '😱 패닉 질주!';
                        r.statusTimer = 20;
                        effect.playRaceSound('slip');
                        updateCommentary(`🎤 [중계진] 깜짝이야! ${r.name} 선수가 갑자기 공포에 질려 비명을 지르며 뛰어갑니다!`);
                    } else {
                        // 21. Blessing of the Goddess!
                        r.shieldTicks = 120;
                        r.boost += 3.6;
                        r.statusText = '😇 여신의 가호!';
                        r.statusTimer = 25;
                        effect.playRaceSound('shield');
                        updateCommentary(`🎤 [중계진] 성스러운 보호! ${r.name} 선수가 긴 시간 무적 가호를 얻고 안정적으로 스피드를 냅니다!`);
                    }
                }

                // Interaction check: tackle/push a nearby opponent (0.25% chance per tick)
                if (r.stunTicks === 0 && r.pos > 10 && r.pos < 85 && (!r.eventCooldownTicks || r.eventCooldownTicks === 0) && Math.random() < 0.0025) {
                    const target = effect.racers.find(o => o.id !== r.id && Math.abs(o.pos - r.pos) < 6 && o.stunTicks === 0 && (!o.eventCooldownTicks || o.eventCooldownTicks === 0));
                    if (target) {
                        r.eventCooldownTicks = 50; // Set cooldown for attacker
                        target.eventCooldownTicks = 50; // Set cooldown for target
                        if (target.shieldTicks > 0) {
                            target.statusText = '🛡️ 공격 방어!';
                            target.statusTimer = 15;
                            effect.playRaceSound('shield');
                            updateCommentary(`🎤 [중계진] ${r.name}가 밀쳐보려 했으나 ${target.name}의 방어막에 튕겨나갑니다!`);
                        } else {
                            r.boost += 1.3;
                            r.statusText = '💢 몸싸움 승리!';
                            r.statusTimer = 15;
  
                            target.pos = Math.max(0, target.pos - 5);
                            target.stunTicks = 10;
                            target.rotate = 15;
                            target.statusText = '💥 밀려남!';
                            target.statusTimer = 15;
                            
                            effect.playRaceSound('tackle');
                            updateCommentary(`🎤 [중계진] 쾅! ${r.name} 선수의 격렬한 몸싸움! ${target.name} 선수를 밀쳐냅니다!`);
                        }
                    }
                }

                // BGM 시간 기준 속도 자동 보정 (William Tell 재생 시간에 따라)
                const currentTime = effect.raceBgm ? effect.raceBgm.currentTime : 0;
                const duration = effect.raceBgm ? effect.raceBgm.duration : 42;
                
                // 남은 시간 4초 미만 시 가속하여 부드럽고 자연스러운 피니시 연출
                let speedMultiplier = 1.0;
                if (duration - currentTime < 4.0 && duration > 5) {
                    speedMultiplier = 1.8;
                }

                // Calculate move speed based on targetAvgSpeed
                let baseSpeed = 0;
                if (r.stunTicks === 0) {
                    baseSpeed = targetAvgSpeed * (0.35 + Math.random() * 0.50) * speedMultiplier;
                } else {
                    if (r.statusText.includes('바나나') || r.statusText.includes('어지러움') || r.statusText.includes('빙결') || r.statusText.includes('스퍼트') || r.statusText.includes('회오리') || r.statusText.includes('최면') || r.statusText.includes('패닉')) {
                        r.rotate = (r.rotate + 15) % 360;
                    }
                }

                // 동적 러버밴드(Rubber-banding) 보정: BGM 재생률과 말의 위치 싱크 맞추기
                const elapsedSec = ticks * 0.06; // 1틱 = 60ms = 0.06초
                // BGM 시간 기준 위치 비율 목표치 (최대 0.95까지 유도 후 막판 스퍼트)
                const targetPosRatio = Math.min(0.95, elapsedSec / runDuration);
                const currentPosRatio = r.pos / 100;
                const diff = targetPosRatio - currentPosRatio;
                
                let minFactor = 0.15;
                if (r.statusText && (r.statusText.includes('돌진') || r.statusText.includes('부스터') || r.statusText.includes('당근') || r.statusText.includes('산삼') || r.statusText.includes('아드레날린') || r.statusText.includes('가속') || r.statusText.includes('순풍') || r.statusText.includes('스퍼트'))) {
                    minFactor = 0.6; // 버프 질주 중일 때는 감속 제약을 완화
                }
                
                let rubberBandFactor = 1.0;
                if (diff > 0) {
                    rubberBandFactor = 1.0 + (diff * 2.2); // 뒤처진 상태: 가속 유도 (최대 약 3배 속도)
                } else {
                    rubberBandFactor = Math.max(minFactor, 1.0 + (diff * 2.5)); // 너무 앞서간 상태: 감속 제어
                }

                // 남은 시간이 4초 미만인 피니시 구간에서는 감속 제약을 풀고 피니시 골인 가속
                if (duration - currentTime < 4.0 && duration > 5) {
                    rubberBandFactor = Math.max(rubberBandFactor, 1.3); // 감속 제약 해제 및 최소 1.3배 가속 유지
                }

                const boostDecay = r.boost * 0.15;
                let currentMove = (baseSpeed + boostDecay) * rubberBandFactor;
                r.boost = Math.max(0, r.boost - boostDecay); // consume boost

                // BGM 재생 진행도가 90% 미만인데 말이 결승선 근처(92% 이상)에 진입했다면,
                // 완전히 멈추지 않고 아주 미세하게 전진(꼬물거림) 하도록 속도를 0.015 ~ 0.035 범위로 극소화
                if (targetPosRatio < 0.90 && r.pos >= 92) {
                    currentMove = 0.015 + Math.random() * 0.02;
                }

                r.pos += currentMove;

                // BGM 진행도가 90% 미만일 때는 어떠한 경우에도 골인하지 않도록 96.5%에서 이동을 제한하며 꼬물거리게 처리
                if (targetPosRatio < 0.90) {
                    r.pos = Math.min(96.5, r.pos);
                }

                const visualLeft = Math.min(finishX, 80 + (r.pos / 100) * (finishX - 80));

                const wrapper = track.querySelector(`#wrapper-${r.id}`);
                const av = track.querySelector(`#avatar-${r.id}`);
                const bubble = track.querySelector(`#status-bubble-${r.id}`);

                if (wrapper) {
                    wrapper.style.left = `${visualLeft}px`;
                }

                if (av) {
                    let rotation = r.rotate;
                    let scale = r.scale;
                    let translateY = 0;

                    // Running animation (bounce and wiggle merged into transform)
                    if (r.stunTicks === 0 && r.pos > 0 && r.pos < 100) {
                        const wiggle = Math.sin(Date.now() / 80) * 10;
                        rotation += wiggle;
                        translateY = -Math.abs(Math.sin(Date.now() / 80)) * 6;
                    }

                    // Reset opacity and filters first
                    av.style.opacity = '1.0';
                    av.style.filter = 'none';

                    // Apply visual styling based on status
                    if (r.shieldTicks > 0) {
                        av.style.filter = 'drop-shadow(0 0 10px #00d2ff) brightness(1.2)';
                    }
                    if (r.statusText.includes('유체 이탈') || r.statusText.includes('유령') || r.statusText.includes('분열')) {
                        av.style.opacity = '0.45';
                        av.style.filter = 'drop-shadow(0 0 12px #d800ff) brightness(1.3)';
                    }
                    if (r.statusText.includes('최면')) {
                        scale = -scale; // Flip horizontally
                        av.style.filter = 'drop-shadow(0 0 12px #ff007c) hue-rotate(180deg)';
                    }
                    if (r.statusText.includes('빙결') || r.statusText.includes('꽁꽁')) {
                        av.style.filter = 'drop-shadow(0 0 12px #00e5ff) brightness(1.1) saturate(1.5)';
                        rotation = 0;
                        translateY = 0;
                    }

                    av.style.transform = `rotate(${rotation}deg) scale(${scale}) translateY(${translateY}px)`;
                }


                if (bubble) {
                    if (r.statusText) {
                        bubble.innerHTML = parseEmojisToImages(r.statusText, '1.2rem');
                        bubble.classList.add('visible');
                    } else {
                        bubble.classList.remove('visible');
                    }
                }

                if (r.pos >= 100) {
                    finished = true;
                    winnerId = r.id;
                }
            });

            // BGM 종료 시점 도달 시 1위 강제 골인 보정 (완벽 동기화 보장)
            const currentTime = effect.raceBgm ? effect.raceBgm.currentTime : 0;
            const duration = effect.raceBgm ? effect.raceBgm.duration : 42;
            if (effect.raceBgm && (effect.raceBgm.ended || (currentTime >= duration - 0.2 && duration > 5))) {
                const leader = RacingRules.leader(effect.racers);
                if (leader && leader.pos < 100) {
                    leader.pos = 100;
                    finished = true;
                    winnerId = leader.id;
                }
            }

            if (finished) {
                effect.runtime.clear(interval);
                effect.phase = 'ended'; // 채팅 부스트 중단

                // 골인 즉시 우승 효과음 재생
                effect.playRaceSound('win');

                const winner = effect.racers[winnerId];
                updateCommentary(`🎤 [중계진] 🏁 골인!!! ${winner.emoji} ${winner.name} 선수가 가장 먼저 결승선을 통과하며 우승을 차지합니다!!!`);

                // 3.5초(3500ms) 동안 최종 주행 라인을 보여준 후 결과창으로 전환
                effect.runtime.timeout(() => {
                    effect.endRace(track, winnerId, resolve);
                }, 3500);
            }
        }, 60); // 60ms tick rate
    }
}

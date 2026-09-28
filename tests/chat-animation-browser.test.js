'use strict';

// CHAT_ANIMATION_PREVIEW_URL points to chat-animation-preview.html on an
// agent-specific preview server. Requires Playwright and installed Chrome.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const cases = [
    ['vibrate-text', 'ㅂㄷㅂㄷ', ['vibrate-laugh']],
    ['diagonal', '유격', ['slideDiagonal'], 'diagonal'],
    ['shrink-x', '조이고', ['shrinkX']],
    ['squeeze', '압축 테스트', ['squeeze']],
    ['grow-y', '자라나라', ['growY']],
    ['hip', '춤 ))', ['hipDance']],
    ['hip-reverse', '춤 ((', ['hipDanceReverse']],
    ['death', '나죽어', ['death']],
    ['fall-fade', '흡!', ['fadeOutFall']],
    ['heaven', '성불', ['toHeaven']],
    ['scout', '갔냐?', ['scout']],
    ['balls', '덜렁', ['balls']],
    ['wave', '파도~', ['wave']],
    ['up-down', '앗', ['upDown']],
    ['yes', 'ㅇㅇ', ['yes']],
    ['question', '뭐지?', ['shake4']],
    ['greeting', '안녕', ['shake4']],
    ['long-greeting', '안녕 긴 메시지로 양 끝 칸에서 흔들리는 범위를 확인합니다', ['shake4']],
    ['shout', '해', ['shake3']],
    ['fear', 'ㄷㄷ', ['fear']],
    ['cry', 'ㅠㅠ', ['crying']],
    ['no', 'ㄴㄴ', ['nope']],
    ['laugh', 'ㅋㅋ', ['vibrate-laugh']],
    ['walk', 'ㄱㄱ', ['walking']],
    ['shy', '헤으응', ['shrink', 'shy']],
    ['surprise', 'ㄴㅇㄱ', ['surprised']],
    ['fall', '...', ['fall']],
    ['spin', '히오스', ['Hots']],
    ['beat', '둠칫둠칫', ['beat', 'beat']],
    ['plead', '제발', ['shake3', 'shake2']],
    ['old', '틀', ['fear', 'shake3', 'shake3']],
    ['pass-left', '지나갑니다', ['passThroughLtoR'], 'left', 0.75],
    ['pass-right', '지나갑니다', ['passThroughRtoL'], 'right', 0.25],
    ['drop', '나락', ['passThrough2'], 'down', 0.99999],
    ['rise', '극락', ['passThrough3'], 'up', 0.99999],
    ['drop-wide-right', '!나락 긴 문장을 화면 오른쪽 끝에서 내려 보냅니다', ['passThrough2'], 'down', 0.99999],
    ['drop-wide-left', '!나락 긴 문장을 화면 왼쪽 끝에서 내려 보냅니다', ['passThrough2'], 'down', 0],
    ['rise-wide-right', '!극락 긴 문장을 화면 오른쪽 끝에서 올려 보냅니다', ['passThrough3'], 'up', 0.99999],
    ['rise-wide-left', '!극락 긴 문장을 화면 왼쪽 끝에서 올려 보냅니다', ['passThrough3'], 'up', 0],
    ['glow', '빛', ['glow']],
    ['rainbow', '무지개', ['rainbow']]
];

(async () => {
    assert.ok(process.env.CHAT_ANIMATION_PREVIEW_URL, 'Set CHAT_ANIMATION_PREVIEW_URL');
    const output = path.resolve(__dirname, '../scratch/chat-animation-audit');
    fs.mkdirSync(output, { recursive: true });
    const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/ChatRenderer.js'), 'utf8');
    assert.deepStrictEqual([...new Set(cases.flatMap(item => item[2]))].sort(),
        [...new Set((rendererSource.match(/chat-hvn-[\w-]+/g) || []).map(name => name.replace('chat-hvn-', '')))].sort(),
        'every animation dispatched by the production renderer needs an audit scenario');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(process.env.CHAT_ANIMATION_PREVIEW_URL);
        await page.waitForFunction(() => document.documentElement.dataset.previewReady === 'true');
        const results = [];
        for (const columns of [5, 6, 7, 8]) {
            const slots = columns === 7 ? [0, 1, 2, 3, 4, 5, 6] : [0, Math.floor(columns / 2), columns - 1];
            for (const [id, message, expected, travel, random] of cases) {
                for (const slot of travel ? [0] : slots) {
                    await page.evaluate(args => showAnimation(args), { message, columns, slot, random });
                    const result = await page.evaluate(() => {
                        const box = document.querySelector('.chat-box');
                        const targets = [box, box.querySelector('.chat-line-inner'), box.querySelector('.name-box'), box.querySelector('.message')];
                        const rect = element => {
                            const r = element.getBoundingClientRect();
                            return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
                        };
                        const animations = box.getAnimations({ subtree: true }).filter(a => a.animationName?.startsWith('chat-hvn-'));
                        animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
                        const originalTransforms = targets.map(target => [target.style.getPropertyValue('transform'), target.style.getPropertyPriority('transform')]);
                        targets.forEach(target => target.style.setProperty('transform', 'none', 'important'));
                        const base = targets.map(rect);
                        targets.forEach((target, index) => {
                            const [value, priority] = originalTransforms[index];
                            if (value) target.style.setProperty('transform', value, priority);
                            else target.style.removeProperty('transform');
                        });
                        const phases = [...new Set([0, 0.125, 0.22, 0.3, 0.5, 0.7, 0.85, 0.95, 0.9999,
                            ...animations.flatMap(animation => animation.effect.getKeyframes().map(frame => Math.min(frame.computedOffset, 0.9999)))])].sort((a, b) => a - b);
                        const frames = phases.map(phase => {
                            animations.forEach(animation => { animation.currentTime = Number(animation.effect.getTiming().duration) * phase; });
                            return { phase, rects: targets.map(rect), transforms: targets.map(target => getComputedStyle(target).transform) };
                        });
                        const result = { names: animations.map(a => a.animationName.replace('chat-hvn-', '')), base, frames,
                            allocatedSlot: box.dataset.chatSlotStart ?? null,
                            timeout: auditTimeouts[0], durations: animations.map(a => Number(a.effect.getTiming().duration)),
                            liveBefore: document.querySelectorAll('.chat-box').length };
                        auditRenderer.dispose();
                        result.liveAfter = document.querySelectorAll('.chat-box').length;
                        return result;
                    });
                    assert.deepStrictEqual([...result.names].sort(), [...expected].sort(), `${id}: wrong effect dispatched`);
                    assert.strictEqual(result.liveBefore, 1);
                    if (!process.env.CHAT_AUDIT_BASELINE) {
                        assert.strictEqual(result.liveAfter, 0, `${id}: disposal must remove slot-free effects too`);
                        if (travel) {
                            assert.strictEqual(result.allocatedSlot, null);
                            assert.ok(result.timeout >= Math.max(...result.durations), `${id}: finish motion before expiring`);
                            const first = result.frames[0].rects[0];
                            const last = result.frames.at(-1).rects[0];
                            const intersects = r => r.right > 0 && r.x < 1920 && r.bottom > 0 && r.y < 1080;
                            assert.ok(result.frames.some(frame => intersects(frame.rects[0])), `${id}: must cross the visible screen`);
                            if (travel === 'left') assert.ok(first.right <= 1 && last.x >= 1919, `${id}: horizontal endpoints`);
                            if (travel === 'right') assert.ok(first.x >= 1919 && last.right <= 1, `${id}: horizontal endpoints`);
                            if (travel === 'diagonal') assert.ok(first.right <= 1 && first.bottom <= 1 && last.x >= 1919 && last.y >= 1079, `${id}: diagonal endpoints`);
                            if (travel === 'down' || travel === 'up') {
                                assert.ok(result.frames.every(frame => frame.rects[0].x >= -0.1 && frame.rects[0].right <= 1920.1), `${id}: no random horizontal clipping`);
                                if (travel === 'down') assert.ok(first.bottom <= 1 && last.y >= 1079, `${id}: vertical endpoints`);
                                else assert.ok(first.y >= 1079 && last.bottom <= 1, `${id}: vertical endpoints`);
                            }
                        } else {
                            assert.strictEqual(Number(result.allocatedSlot), slot);
                            assert.ok(Math.abs(result.base[0].x + result.base[0].width / 2 - (slot + 0.5) * 1920 / columns) < 1,
                                `${id}: slot center drift`);
                        }
                    }
                    results.push({ id, columns, slot, travel, ...result });
                }
            }
        }
        fs.writeFileSync(path.join(output, process.env.CHAT_AUDIT_BASELINE ? 'before.json' : 'after.json'), JSON.stringify({ errors, cases: cases.length, results }));
        let maxNormalizedError = 0;
        if (!process.env.CHAT_AUDIT_BASELINE) {
            for (const result of results.filter(r => !r.travel)) {
                const original = results.find(r => r.id === result.id && r.columns === 5 && r.slot === 0);
                for (let frame = 0; frame < result.frames.length; frame++) {
                    for (let target = 0; target < result.base.length; target++) {
                        for (const axis of ['x', 'y', 'width', 'height']) {
                            const expected = original.frames[frame].rects[target][axis] - original.base[target][axis];
                            const actual = (result.frames[frame].rects[target][axis] - result.base[target][axis]) / (5 / result.columns);
                            const error = Math.abs(actual - expected);
                            maxNormalizedError = Math.max(maxNormalizedError, error);
                            assert.ok(error < 4, `${result.id}/${result.columns}/${result.slot}/${frame}/${target}/${axis}: local motion changed by ${error.toFixed(2)} design pixels`);
                        }
                    }
                }
                if (result.id === 'scout') {
                    assert.ok(result.frames.find(f => f.phase === 0.22).rects[0].y < 1080,
                        'scout must peek above the screen edge before its final return');
                }
            }
            await page.evaluate(async () => {
                await showAnimation({ message: '유격' });
                for (const message of ['지나갑니다', '나락', '극락']) auditRenderer.render({ nickname: '자연 종료', message });
            });
            await page.waitForTimeout(4700);
            assert.deepStrictEqual(await page.evaluate(() => ({ dom: document.querySelectorAll('.chat-box').length,
                live: auditRenderer.liveBubbles.size, timers: auditRenderer.timers.activeCount })), { dom: 0, live: 0, timers: 0 },
                'travel effects must clean up after their natural lifetime');
        }
        // Visual evidence uses production rendering and seeks its CSS animations.
        for (const columns of [5, 7, 8]) {
            await page.evaluate(async columns => {
                const messages = ['안녕', '갔냐?', '히오스', '둠칫둠칫', '춤 ))', '덜렁', '파도~', 'ㄴㅇㄱ'];
                await showAnimation({ message: messages[0], columns });
                for (let slot = 1; slot < columns; slot++) auditRenderer.render({ uid: 'audit', color: '#8cd0bd', nickname: messages[slot], message: messages[slot] });
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                document.querySelectorAll('.chat-box').forEach((box, slot) => box.getAnimations({ subtree: true }).forEach(animation => {
                    if (!animation.animationName) return;
                    animation.pause();
                    animation.currentTime = Number(animation.effect.getTiming().duration) * (slot === 1 ? 0.7 : 0.22);
                }));
            }, columns);
            await page.screenshot({ path: path.join(output, `local-${columns}.png`) });
        }
        for (const [id, message, , , random] of cases.filter(item => ['diagonal', 'pass-left', 'pass-right', 'drop-wide-right', 'rise-wide-left'].includes(item[0]))) {
            await page.evaluate(async args => {
                await showAnimation(args);
                document.querySelector('.chat-box').getAnimations({ subtree: true }).forEach(animation => {
                    if (!animation.animationName) return;
                    animation.pause();
                    animation.currentTime = Number(animation.effect.getTiming().duration) * 0.3;
                });
            }, { message, columns: 7, random });
            await page.screenshot({ path: path.join(output, `${id}-7.png`) });
        }
        console.log(JSON.stringify({ animations: new Set(results.flatMap(r => r.names)).size, cases: cases.length,
            scenarios: results.length, sampledFrames: results.reduce((sum, result) => sum + result.frames.length, 0), maxNormalizedError }));
        assert.deepStrictEqual(errors, []);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

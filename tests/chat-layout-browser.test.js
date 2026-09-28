'use strict';

// Start scripts/serve-hunt-ui-preview.js on an agent-specific port, then run with
// CHAT_LAYOUT_PREVIEW_URL=http://127.0.0.1:<port>/tests/fixtures/chat-layout-preview.html
// Playwright + Chrome are required. CHAT_TEST_MEDIA_ROOT may point to an existing
// AI CMC directory when testing a worktree without private media. Never copy it.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
    const previewUrl = process.env.CHAT_LAYOUT_PREVIEW_URL;
    assert.ok(previewUrl, 'Set CHAT_LAYOUT_PREVIEW_URL to the running preview fixture');
    const output = path.resolve(__dirname, '../scratch/chat-layout-qa');
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ channel: 'chrome', headless: true,
        args: ['--autoplay-policy=no-user-gesture-required'] });
    try {
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://chat-layout.test/**', route => route.fulfill({ status: 204 }));
        if (process.env.CHAT_TEST_MEDIA_ROOT) {
            await page.route('**/AI%20CMC/**', route => {
                const filename = path.basename(decodeURIComponent(new URL(route.request().url()).pathname));
                return route.fulfill({ path: path.join(process.env.CHAT_TEST_MEDIA_ROOT, filename), contentType: 'video/mp4' });
            });
        }
        const measurements = {};
        for (const columns of [5, 6, 7, 8]) {
            await page.goto(`${previewUrl}?columns=${columns}`);
            await page.waitForFunction(() => document.documentElement.dataset.previewReady === 'true'
                && document.querySelector('video')?.readyState >= 2);
            assert.strictEqual(await page.locator('.chat-box').count(), columns);
            if (columns >= 6) {
                assert.notStrictEqual(await page.locator('.chat-box').nth(5).evaluate(box => getComputedStyle(box).animationName), 'none',
                    'shared scaling must preserve the existing outer animation');
            }
            // Measure stable geometry separately from the authored motion envelope.
            await page.addStyleTag({ content: '.chat-box, .chat-box * { animation: none !important; transition: none !important; }' });
            measurements[columns] = await page.evaluate(() => {
                const rect = element => {
                    if (!element) return null;
                    const r = element.getBoundingClientRect();
                    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
                };
                return [...document.querySelectorAll('.chat-box')].map(box => ({
                    slot: Number(box.dataset.chatSlotStart), box: rect(box),
                    content: rect(box.querySelector('.chat-line')), name: rect(box.querySelector('.user-name')),
                    message: rect(box.querySelector('.message')), badge: rect(box.querySelector('.badges img')),
                    emote: rect(box.querySelector('.emote_chzzk_inline')), video: rect(box.querySelector('video'))
                }));
            });
            for (const bubble of measurements[columns]) {
                assert.ok(Math.abs(bubble.box.x - bubble.slot * 1920 / columns) < 1);
                assert.ok(bubble.box.right <= (bubble.slot + 1) * 1920 / columns + 1, 'content must fit its slot');
                assert.ok(bubble.content.bottom <= 1080, 'visible content must remain above the screen edge');
            }
            if (columns > 5) {
                for (let index = 0; index < 5; index++) {
                    for (const kind of ['content', 'name', 'message', 'badge', 'emote', 'video']) {
                        const original = measurements[5][index][kind];
                        const resized = measurements[columns][index][kind];
                        if (!original) continue;
                        for (const axis of ['width', 'height']) {
                            assert.ok(Math.abs(resized[axis] - original[axis] * 5 / columns) < Math.max(1.25, original[axis] * 0.025),
                                `${columns} columns, ${index}/${kind}/${axis} must shrink uniformly (${original[axis]} → ${resized[axis]})`);
                        }
                    }
                }
            }
            await page.screenshot({ path: path.join(output, `${columns}-columns.png`) });
            const lifecycle = await page.evaluate(() => {
                const retiredVideo = document.querySelector('video');
                for (let index = 0; index < renderer.columns + 2; index++) {
                    renderer.render({ uid: 'burst', nickname: '교체', message: '새 채팅으로 슬롯 교체' });
                }
                const result = { count: document.querySelectorAll('.chat-box').length,
                    paused: retiredVideo.paused, unloaded: !retiredVideo.hasAttribute('src'),
                    activeVideos: window._activeVideoCount };
                renderer.dispose();
                result.remaining = document.querySelectorAll('.chat-box').length;
                return result;
            });
            assert.deepStrictEqual(lifecycle, { count: columns, paused: true, unloaded: true, activeVideos: 0, remaining: 0 });
        }
        assert.deepStrictEqual(errors, []);
        fs.writeFileSync(path.join(output, 'geometry.json'), JSON.stringify(measurements, null, 2));
        console.log('[test] 1920×1080 chat geometry, uniform 5/6/7/8 scaling, media eviction and disposal passed.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

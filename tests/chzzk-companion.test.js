const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const {
    createServer,
    isAllowedChzzkUrl,
    isTrustedLocalAuthority,
    readJsonBody,
    readNumericOption,
    resolveStaticPath
} = require('../tools/chzzk-companion');

assert.strictEqual(isAllowedChzzkUrl(
    'https://api.chzzk.naver.com/polling/v2/channels/057a9a03fea9b368eb0c76b9e95e1ae5/live-status?_t=1'
), true);
assert.strictEqual(isAllowedChzzkUrl(
    'https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=N2XCXJ&chatType=STREAMING&_t=1'
), true);
assert.strictEqual(isAllowedChzzkUrl('https://example.com/steal'), false);
assert.strictEqual(isAllowedChzzkUrl('https://api.chzzk.naver.com/other'), false);

const root = path.resolve(__dirname, '..');
const gatewaySource = fs.readFileSync(path.join(root, 'js/ChzzkGateway.js'), 'utf8');
const configPageSource = fs.readFileSync(path.join(root, 'config.html'), 'utf8');
const debugControllerSource = fs.readFileSync(path.join(root, 'js/DebugController.js'), 'utf8');
assert.doesNotMatch(gatewaySource, /allorigins|cors\.lol|corsfix|thingproxy|corsproxy|codetabs/i);
assert.match(configPageSource, /buildSafeFileOpsCommand/);
assert.doesNotMatch(configPageSource, /renameSync\('SFX\/\$\{op\./);
assert.doesNotMatch(configPageSource, /echo Deleted: \$\{winPath\}/);
assert.match(debugControllerSource, /BUBBLECHAT_ENABLE_DEBUG === true/);
assert.strictEqual(resolveStaticPath('/'), path.join(root, 'index.html'));
assert.strictEqual(resolveStaticPath('/index.html'), path.join(root, 'index.html'));
assert.strictEqual(resolveStaticPath('/../outside.txt'), null);
assert.strictEqual(resolveStaticPath('/%2e%2e/outside.txt'), null);
assert.strictEqual(resolveStaticPath('/.runtime/hunt-profiles.sqlite'), null);
assert.strictEqual(resolveStaticPath('/.git/config'), null);
assert.strictEqual(resolveStaticPath('/package.json'), null);
assert.strictEqual(resolveStaticPath('/scratch/codex-mh-map/node_modules'), null);
assert.strictEqual(readNumericOption(['--obs-parent', '1234'], '--obs-parent'), 1234);
assert.strictEqual(readNumericOption(['--obs-parent', 'invalid'], '--obs-parent'), null);
assert.strictEqual(isTrustedLocalAuthority('evil.example', 17890), false);
assert.strictEqual(isTrustedLocalAuthority('127.0.0.1:17890', 17890), true);

(async () => {
    const oversized = new PassThrough();
    const oversizedResult = readJsonBody(oversized, 4).then(
        () => null,
        error => error
    );
    oversized.write('12345');
    oversized.end('this must be discarded');
    assert.strictEqual((await oversizedResult).status, 413);

    const records = new Map();
    const fakeStore = {
        get: identity => records.get(identity.uid || identity.nickname) || null,
        upsert: (identity, profile) => {
            records.set(identity.uid || identity.nickname, profile);
            return profile;
        },
        getRun: channelKey => records.get(`run:${channelKey}`) || null,
        saveRun: (channelKey, state, expectedRevision) => {
            const saved = { ...state, revision: Number(expectedRevision || 0) + 1 };
            records.set(`run:${channelKey}`, saved);
            return saved;
        },
        deleteRun: channelKey => records.delete(`run:${channelKey}`)
    };
    const sessionToken = 'test-session-token';
    const server = createServer({ profileStore: fakeStore, sessionToken });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const sessionHeaders = {
        Cookie: `bubblechat_session=${sessionToken}`,
        Origin: base
    };
    try {
        const landing = await fetch(`${base}/index.html`);
        assert.match(landing.headers.get('set-cookie') || '', /bubblechat_session=/);
        assert.match(landing.headers.get('content-security-policy') || '', /default-src 'self'/);
        assert.strictEqual((await fetch(`${base}/.runtime/hunt-profiles.sqlite`)).status, 404);
        assert.strictEqual((await fetch(`${base}/.git/config`)).status, 404);
        assert.strictEqual((await fetch(`${base}/package.json`)).status, 404);
        assert.strictEqual((await fetch(`${base}/api/hunt-profile?uid=viewer-1`)).status, 401);
        assert.strictEqual((await fetch(`${base}/api/hunt-profile?uid=viewer-1`, {
            headers: { ...sessionHeaders, Origin: 'https://evil.example' }
        })).status, 403);
        const saved = await fetch(`${base}/api/hunt-profile`, {
            method: 'POST',
            headers: { ...sessionHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: 'viewer-1', nickname: '헌터', profile: { weaponId: 'long_sword' } })
        });
        assert.strictEqual(saved.status, 200);
        assert.strictEqual(saved.headers.get('access-control-allow-origin'), null);
        const loaded = await fetch(`${base}/api/hunt-profile?uid=viewer-1&nickname=%ED%97%8C%ED%84%B0`, {
            headers: sessionHeaders
        });
        assert.deepStrictEqual((await loaded.json()).profile, { weaponId: 'long_sword' });
        const denied = await fetch(`${base}/index.html`, { method: 'POST' });
        assert.strictEqual(denied.status, 405, 'POST must stay limited to the profile endpoint');
        const runSaved = await fetch(`${base}/api/hunt-run?channelKey=channel-a`, {
            method: 'POST', headers: { ...sessionHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: { runId: 'run-a' }, expectedRevision: 0 })
        });
        assert.strictEqual((await runSaved.json()).state.revision, 1);
        const runLoaded = await fetch(`${base}/api/hunt-run?channelKey=channel-a`, { headers: sessionHeaders });
        assert.strictEqual((await runLoaded.json()).state.runId, 'run-a');
        assert.strictEqual((await fetch(`${base}/api/hunt-run?channelKey=channel-a`, {
            method: 'DELETE',
            headers: sessionHeaders
        })).status, 200);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }

    const degradedToken = 'degraded-session-token';
    const degradedServer = createServer({
        sessionToken: degradedToken,
        createProfileStore: () => { throw new Error('sqlite unavailable'); }
    });
    await new Promise(resolve => degradedServer.listen(0, '127.0.0.1', resolve));
    const degradedBase = `http://127.0.0.1:${degradedServer.address().port}`;
    try {
        const unavailable = await fetch(`${degradedBase}/api/hunt-profile?uid=viewer-1`, {
            headers: {
                Cookie: `bubblechat_session=${degradedToken}`,
                Origin: degradedBase
            }
        });
        assert.strictEqual(unavailable.status, 503);
        const staticPage = await fetch(`${degradedBase}/index.html`);
        assert.strictEqual(staticPage.status, 200, 'profile storage failure must not disable the OBS overlay companion');
    } finally {
        await new Promise(resolve => degradedServer.close(resolve));
    }
    console.log('Chzzk local companion safety contract passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

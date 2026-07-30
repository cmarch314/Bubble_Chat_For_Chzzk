const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const crypto = require('crypto');
const HuntProfileContract = require('../js/effects/hunt/HuntProfileContract');
const HuntRunState = require('../js/effects/hunt/HuntRunState');
const LocalCompanionEndpoint = require('../js/runtime/LocalCompanionEndpoint');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const DEFAULT_PORT = Number(new URL(LocalCompanionEndpoint.DEFAULT_ORIGIN).port);
const MAX_UPSTREAM_BYTES = 2 * 1024 * 1024;
const MAX_PROFILE_BYTES = 16 * 1024;
const MAX_RUN_BYTES = HuntRunState.MAX_BYTES + 2048;
const SESSION_COOKIE = 'bubblechat_session';
const STATIC_ROOTS = new Set([
    'AI CMC',
    'BGM',
    'MonsterHunter_Soundtracks',
    'SFX',
    'Video',
    'config',
    'config.js',
    'img',
    'index.html',
    'js',
    'local_assets',
    'style.css',
    'styles'
]);

const MIME_TYPES = {
    '.aac': 'audio/aac',
    '.css': 'text/css; charset=utf-8',
    '.flac': 'audio/flac',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.ogg': 'audio/ogg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.webm': 'video/webm'
};

function isAllowedChzzkUrl(value) {
    let target;
    try {
        target = new URL(value);
    } catch (_) {
        return false;
    }

    if (target.protocol !== 'https:') return false;
    if (target.hostname === 'api.chzzk.naver.com') {
        return /^\/polling\/v2\/channels\/[a-f0-9]{32}\/live-status$/.test(target.pathname);
    }
    if (target.hostname === 'comm-api.game.naver.com') {
        return target.pathname === '/nng_main/v1/chats/access-token'
            && /^[A-Za-z0-9_-]+$/.test(target.searchParams.get('channelId') || '')
            && target.searchParams.get('chatType') === 'STREAMING';
    }
    return false;
}

function resolveStaticPath(pathname) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch (_) {
        return null;
    }
    const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
    const firstSegment = relative.split(/[\\/]/, 1)[0];
    if (!STATIC_ROOTS.has(firstSegment)) return null;
    const absolute = path.resolve(ROOT, relative);
    if (absolute !== ROOT && !absolute.startsWith(`${ROOT}${path.sep}`)) return null;
    if (!fs.existsSync(absolute)) return absolute;
    try {
        const realRoot = fs.realpathSync.native(ROOT);
        const realPath = fs.realpathSync.native(absolute);
        return realPath === realRoot || realPath.startsWith(`${realRoot}${path.sep}`) ? absolute : null;
    } catch (_) {
        return null;
    }
}

function securityHeaders() {
    return {
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "media-src 'self' blob: https:",
            "connect-src 'self' https://api.chzzk.naver.com https://comm-api.game.naver.com wss://kr-ss1.chat.naver.com",
            "font-src 'self' data: https://cdn.jsdelivr.net",
            "object-src 'none'",
            "base-uri 'none'",
            "frame-ancestors 'none'"
        ].join('; '),
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff'
    };
}

function sendJson(response, status, payload, extraHeaders = {}) {
    const body = Buffer.from(JSON.stringify(payload));
    response.writeHead(status, {
        'Cache-Control': 'no-store',
        'Content-Length': body.length,
        'Content-Type': 'application/json; charset=utf-8',
        ...securityHeaders(),
        ...extraHeaders
    });
    response.end(body);
}

function readJsonBody(request, maxBytes = MAX_PROFILE_BYTES) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let settled = false;
        const onData = chunk => {
            if (settled) return;
            size += chunk.length;
            if (size > maxBytes) {
                settled = true;
                chunks.length = 0;
                request.removeListener('data', onData);
                request.resume();
                reject(Object.assign(new Error('Profile request is too large'), { status: 413 }));
                return;
            }
            chunks.push(chunk);
        };
        request.on('data', onData);
        request.on('end', () => {
            if (settled) return;
            settled = true;
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
            } catch (_) {
                reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }));
            }
        });
        request.on('error', reject);
    });
}

function isTrustedLocalAuthority(authority, localPort) {
    try {
        const parsed = new URL(`http://${authority}`);
        const hostname = parsed.hostname.toLowerCase();
        const port = Number(parsed.port || 80);
        return (hostname === HOST || hostname === 'localhost') && port === localPort;
    } catch (_) {
        return false;
    }
}

function isTrustedLocalOrigin(origin, localPort) {
    try {
        const parsed = new URL(origin);
        const hostname = parsed.hostname.toLowerCase();
        const port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));
        return parsed.protocol === 'http:'
            && (hostname === HOST || hostname === 'localhost')
            && port === localPort;
    } catch (_) {
        return false;
    }
}

function hasSessionCookie(request, sessionToken) {
    const cookies = String(request.headers.cookie || '').split(';');
    const value = cookies
        .map(entry => entry.trim().split('='))
        .find(([name]) => name === SESSION_COOKIE)?.slice(1).join('=') || '';
    const actual = Buffer.from(value);
    const expected = Buffer.from(sessionToken);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function fetchUpstream(targetUrl, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        const request = https.get(targetUrl, {
            headers: {
                Accept: 'application/json',
                Referer: 'https://chzzk.naver.com/',
                'User-Agent': 'BubbleChat-OBS-Companion/1.0'
            }
        }, upstream => {
            const chunks = [];
            let size = 0;
            upstream.on('data', chunk => {
                size += chunk.length;
                if (size > MAX_UPSTREAM_BYTES) {
                    request.destroy(new Error('Upstream response exceeded the safety limit'));
                    return;
                }
                chunks.push(chunk);
            });
            upstream.on('end', () => resolve({
                status: upstream.statusCode || 502,
                body: Buffer.concat(chunks)
            }));
        });
        request.setTimeout(timeoutMs, () => request.destroy(new Error('Upstream request timed out')));
        request.on('error', reject);
    });
}

async function serveChzzkProxy(requestUrl, response) {
    const targetUrl = requestUrl.searchParams.get('url') || '';
    if (!isAllowedChzzkUrl(targetUrl)) {
        sendJson(response, 400, { error: 'Unsupported Chzzk endpoint' });
        return;
    }

    try {
        const upstream = await fetchUpstream(targetUrl);
        response.writeHead(upstream.status, {
            'Cache-Control': 'no-store',
            'Content-Length': upstream.body.length,
            'Content-Type': 'application/json; charset=utf-8',
            ...securityHeaders()
        });
        response.end(upstream.body);
    } catch (error) {
        sendJson(response, 502, { error: error.message });
    }
}

function serveStatic(request, response, pathname, sessionToken) {
    const absolute = resolveStaticPath(pathname);
    if (!absolute || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
        sendJson(response, 404, { error: 'File not found' });
        return;
    }

    const stat = fs.statSync(absolute);
    const contentType = MIME_TYPES[path.extname(absolute).toLowerCase()] || 'application/octet-stream';
    const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    let start = 0;
    let end = stat.size - 1;
    let status = 200;

    if (range) {
        start = range[1] ? Number(range[1]) : 0;
        end = range[2] ? Number(range[2]) : end;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= stat.size) {
            response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
            response.end();
            return;
        }
        end = Math.min(end, stat.size - 1);
        status = 206;
    }

    const headers = {
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        ...securityHeaders()
    };
    if (absolute === path.join(ROOT, 'index.html')) {
        headers['Set-Cookie'] = `${SESSION_COOKIE}=${sessionToken}; HttpOnly; SameSite=Strict; Path=/`;
    }
    if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    response.writeHead(status, headers);
    if (request.method === 'HEAD') {
        response.end();
        return;
    }
    fs.createReadStream(absolute, { start, end }).pipe(response);
}

function createServer(options = {}) {
    const sessionToken = options.sessionToken || crypto.randomBytes(32).toString('hex');
    let profileStore = options.profileStore || null;
    let ownsProfileStore = false;
    const getProfileStore = () => {
        if (!profileStore) {
            try {
                const createProfileStore = options.createProfileStore || (() => {
                    const { HuntProfileStore } = require('./hunt-profile-store');
                    return new HuntProfileStore(options.profileDbPath);
                });
                profileStore = createProfileStore();
                ownsProfileStore = true;
            } catch (error) {
                const unavailable = new Error(`Local hunt profile storage is unavailable: ${error.message}`);
                unavailable.status = 503;
                throw unavailable;
            }
        }
        return profileStore;
    };
    const server = http.createServer(async (request, response) => {
        const requestUrl = new URL(request.url, `http://${HOST}`);
        const localPort = Number(request.socket.localPort || 0);
        const requestHost = String(request.headers.host || '');
        if (!isTrustedLocalAuthority(requestHost, localPort)) {
            sendJson(response, 403, { error: 'Untrusted Host header' });
            return;
        }
        const origin = String(request.headers.origin || '');
        if (origin && !isTrustedLocalOrigin(origin, localPort)) {
            sendJson(response, 403, { error: 'Cross-origin requests are not allowed' });
            return;
        }
        const isProfileRequest = requestUrl.pathname === HuntProfileContract.ENDPOINT_PATH;
        const isRunRequest = requestUrl.pathname === HuntRunState.ENDPOINT_PATH;
        const isWritableApi = isProfileRequest || isRunRequest;
        const allowedMethods = isRunRequest
            ? ['GET', 'HEAD', 'POST', 'DELETE', 'OPTIONS']
            : isProfileRequest ? ['GET', 'HEAD', 'POST', 'OPTIONS'] : ['GET', 'HEAD', 'OPTIONS'];
        if (!allowedMethods.includes(request.method)) {
            sendJson(response, 405, { error: 'Method not allowed' });
            return;
        }
        if (isWritableApi && !hasSessionCookie(request, sessionToken)) {
            sendJson(response, 401, { error: 'Local companion session is required' });
            return;
        }
        if (request.method === 'OPTIONS') {
            const corsHeaders = origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
            response.writeHead(204, {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': isRunRequest ? 'GET, HEAD, POST, DELETE, OPTIONS'
                    : isWritableApi ? 'GET, HEAD, POST, OPTIONS' : 'GET, HEAD, OPTIONS',
                ...securityHeaders(),
                ...corsHeaders
            });
            response.end();
            return;
        }

        if (requestUrl.pathname === '/api/chzzk') {
            await serveChzzkProxy(requestUrl, response);
            return;
        }
        if (isProfileRequest) {
            const identity = {
                uid: requestUrl.searchParams.get('uid'),
                nickname: requestUrl.searchParams.get('nickname')
            };
            try {
                if (request.method === 'POST') {
                    const body = await readJsonBody(request);
                    const saved = getProfileStore().upsert({ uid: body.uid, nickname: body.nickname }, body.profile);
                    sendJson(response, 200, { profile: saved });
                } else {
                    const profile = getProfileStore().get(identity);
                    if (request.method === 'HEAD') {
                        response.writeHead(profile ? 200 : 404, { 'Cache-Control': 'no-store', ...securityHeaders() });
                        response.end();
                    } else {
                        sendJson(response, 200, { profile });
                    }
                }
            } catch (error) {
                sendJson(response, error.status || 400, { error: error.message });
            }
            return;
        }
        if (isRunRequest) {
            const channelKey = requestUrl.searchParams.get('channelKey');
            try {
                if (request.method === 'POST') {
                    const body = await readJsonBody(request, MAX_RUN_BYTES);
                    const state = getProfileStore().saveRun(channelKey, body.state, body.expectedRevision);
                    sendJson(response, 200, { state });
                } else if (request.method === 'DELETE') {
                    getProfileStore().deleteRun(channelKey);
                    sendJson(response, 200, { state: null });
                } else {
                    const state = getProfileStore().getRun(channelKey);
                    if (request.method === 'HEAD') {
                        response.writeHead(state ? 200 : 404, { 'Cache-Control': 'no-store', ...securityHeaders() });
                        response.end();
                    } else sendJson(response, 200, { state });
                }
            } catch (error) {
                sendJson(response, error.status || 400, { error: error.message });
            }
            return;
        }
        serveStatic(request, response, requestUrl.pathname, sessionToken);
    });
    server.on('close', () => {
        if (ownsProfileStore && profileStore) profileStore.close();
    });
    return server;
}

function readNumericOption(args, name) {
    const index = args.indexOf(name);
    if (index < 0) return null;
    const value = Number(args[index + 1]);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function bindToParentProcess(server, parentPid, intervalMs = 5000) {
    if (!parentPid) return null;
    // On Windows, process.kill(pid, 0) can report a false negative for OBS
    // depending on how OBS and the hidden child were launched. The Lua owner
    // already calls the controller's stop action on script/OBS unload, so a
    // second watchdog here must not tear down a healthy overlay server.
    if (process.platform === 'win32') return null;
    const monitor = setInterval(() => {
        try {
            process.kill(parentPid, 0);
        } catch (_) {
            clearInterval(monitor);
            server.close(() => process.exit(0));
            setTimeout(() => process.exit(0), 2000).unref();
        }
    }, intervalMs);
    server.on('close', () => clearInterval(monitor));
    return monitor;
}

if (require.main === module) {
    const port = Number(process.env.BUBBLECHAT_PORT) || DEFAULT_PORT;
    const server = createServer();
    const parentPid = readNumericOption(process.argv.slice(2), '--obs-parent');
    bindToParentProcess(server, parentPid);
    server.listen(port, HOST, () => {
        console.log(`BubbleChat OBS companion: http://${HOST}:${port}/index.html`);
        console.log('Keep this window open while OBS is using the overlay.');
    });
}

module.exports = {
    bindToParentProcess,
    createServer,
    hasSessionCookie,
    isAllowedChzzkUrl,
    isTrustedLocalAuthority,
    isTrustedLocalOrigin,
    readJsonBody,
    readNumericOption,
    resolveStaticPath
};

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const DEFAULT_PORT = 17890;
const MAX_UPSTREAM_BYTES = 2 * 1024 * 1024;

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
    const absolute = path.resolve(ROOT, relative);
    return absolute === ROOT || absolute.startsWith(`${ROOT}${path.sep}`) ? absolute : null;
}

function sendJson(response, status, payload) {
    const body = Buffer.from(JSON.stringify(payload));
    response.writeHead(status, {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Content-Length': body.length,
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(body);
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
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            'Content-Length': upstream.body.length,
            'Content-Type': 'application/json; charset=utf-8'
        });
        response.end(upstream.body);
    } catch (error) {
        sendJson(response, 502, { error: error.message });
    }
}

function serveStatic(request, response, pathname) {
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
        'Content-Type': contentType
    };
    if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    response.writeHead(status, headers);
    if (request.method === 'HEAD') {
        response.end();
        return;
    }
    fs.createReadStream(absolute, { start, end }).pipe(response);
}

function createServer() {
    return http.createServer(async (request, response) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
            sendJson(response, 405, { error: 'Method not allowed' });
            return;
        }
        if (request.method === 'OPTIONS') {
            response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' });
            response.end();
            return;
        }

        const requestUrl = new URL(request.url, `http://${HOST}`);
        if (requestUrl.pathname === '/api/chzzk') {
            await serveChzzkProxy(requestUrl, response);
            return;
        }
        serveStatic(request, response, requestUrl.pathname);
    });
}

function readNumericOption(args, name) {
    const index = args.indexOf(name);
    if (index < 0) return null;
    const value = Number(args[index + 1]);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function bindToParentProcess(server, parentPid, intervalMs = 5000) {
    if (!parentPid) return null;
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

module.exports = { bindToParentProcess, createServer, isAllowedChzzkUrl, readNumericOption, resolveStaticPath };

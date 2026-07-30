#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Math.max(1024, Math.min(65535, Number(process.argv[2]) || 8080));
const DEFAULT_ENTRY = String(process.argv[3] || 'tests/fixtures/hunt-quest-board-preview.html').replace(/^\/+/, '');
const MIME = Object.freeze({
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg'
});

function resolveRequestPath(requestUrl) {
    const pathname = decodeURIComponent(new URL(requestUrl, `http://127.0.0.1:${PORT}`).pathname);
    const relative = pathname === '/' ? DEFAULT_ENTRY : pathname.replace(/^\/+/, '');
    const target = path.resolve(ROOT, relative);
    if (target !== ROOT && !target.startsWith(`${ROOT}${path.sep}`)) return null;
    return target;
}

const server = http.createServer((request, response) => {
    const target = resolveRequestPath(request.url || '/');
    if (!target) {
        response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Forbidden');
        return;
    }
    fs.readFile(target, (error, content) => {
        if (error) {
            response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end(error.code === 'ENOENT' ? 'Not Found' : 'Preview server error');
            return;
        }
        response.writeHead(200, {
            'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        response.end(content);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[hunt-ui-preview] http://127.0.0.1:${PORT}/${DEFAULT_ENTRY}`);
});

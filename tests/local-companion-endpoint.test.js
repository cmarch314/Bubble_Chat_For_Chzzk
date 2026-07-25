const assert = require('assert');
const LocalCompanionEndpoint = require('../js/runtime/LocalCompanionEndpoint');

assert.strictEqual(LocalCompanionEndpoint.url('/api/chzzk', { url: 'https://example.test/a?b=1' }, {}),
    'http://127.0.0.1:17890/api/chzzk?url=https%3A%2F%2Fexample.test%2Fa%3Fb%3D1');
assert.strictEqual(LocalCompanionEndpoint.origin({ BUBBLECHAT_COMPANION_ORIGIN: 'http://localhost:19000/' }),
    'http://localhost:19000');
assert.strictEqual(LocalCompanionEndpoint.origin({ BUBBLECHAT_COMPANION_ORIGIN: 'https://evil.example' }),
    LocalCompanionEndpoint.DEFAULT_ORIGIN, 'the companion override must stay on localhost');
assert.strictEqual(LocalCompanionEndpoint.origin({
    location: { protocol: 'http:', hostname: '127.0.0.1', origin: 'http://127.0.0.1:20000' }
}), 'http://127.0.0.1:20000');

console.log('[test] Shared local companion endpoint contract passed.');

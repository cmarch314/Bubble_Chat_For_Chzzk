// Application composition and lifecycle are isolated in BubbleChatApp.
const app = new BubbleChatApp();
app.start();
if (/(?:^|[?&])huntSimulation=1(?:&|$)/.test(String(window.location?.search || ''))) {
    // Same-origin review tooling may drive the real app lifecycle without
    // exposing the production app globally during an ordinary OBS session.
    window.__bubbleChatSimulationApp = app;
}

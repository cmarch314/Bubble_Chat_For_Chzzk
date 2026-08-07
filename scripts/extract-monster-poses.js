// 기존 키프레임에서 자세 프리셋을 추출한다.
// scale을 자세(비율 x/y)와 원근(크기 sqrt(x*y)) 두 축으로 분해해 군집화한다.
// 이 둘을 묶어두면 같은 자세인데 거리가 다르다는 이유로 매번 다른 숫자가 되어,
// 실제로 scale 조합이 139가지까지 늘어나 있었다. 분리하면 13가지다.
//
// 이전이 끝난 뒤에도 버리지 않는다. 새 비트가 기존 그림과 같은지 비교하는
// 회귀 검사로 쓴다.
//   node scripts/extract-monster-poses.js
const fs = require('fs');
const css = fs.readFileSync(require('path').join(__dirname,'..','styles','hunt-runtime.css'), 'utf8');

const blocks = [];
const re = /@keyframes (monster-motion-[\w-]+)\s*\{/g;
let m;
while ((m = re.exec(css))) {
    const open = css.indexOf('{', m.index);
    let depth = 0, i = open;
    for (; i < css.length; i++) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') { depth--; if (depth === 0) break; }
    }
    blocks.push({ name: m[1], body: css.slice(open + 1, i) });
}

const samples = [];
for (const b of blocks) {
    const body = b.body.replace(/\/\*[\s\S]*?\*\//g, '');
    const frameRe = /([^{}]+)\{([^{}]*)\}/g;
    let f;
    while ((f = frameRe.exec(body))) {
        const d = f[2];
        const sc = d.match(/scale\(\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
        if (!sc) continue;
        const x = parseFloat(sc[1]);
        const y = sc[2] !== undefined ? parseFloat(sc[2]) : x;
        samples.push({ motion: b.name, x, y, r: x / y, s: Math.sqrt(x * y), bright: /brightness\(/.test(d) });
    }
}

// 비율만 군집화
const TOL = 0.05;
const clusters = [];
for (const s of samples.slice().sort((a, b) => a.r - b.r)) {
    const hit = clusters.find(c => Math.abs(c.r - s.r) <= TOL);
    if (hit) { hit.n++; hit.rSum += s.r; hit.r = hit.rSum / hit.n; hit.bright += s.bright ? 1 : 0; hit.motions.add(s.motion); hit.depths.push(s.s); }
    else clusters.push({ r: s.r, rSum: s.r, n: 1, bright: s.bright ? 1 : 0, motions: new Set([s.motion]), depths: [s.s] });
}
clusters.sort((a, b) => b.n - a.n);

console.log(`프레임 ${samples.length}개 / 비율 군집 ${clusters.length}개 (오차 ±${TOL})\n`);
const name = c => {
    if (Math.abs(c.r - 1) < .05) return '균등(자세 없음 · 원근만)';
    if (c.r > 1.35) return 'land  강한 압축';
    if (c.r > 1.18) return c.bright / c.n > .35 ? 'lunge 접촉' : 'crouch 압축';
    if (c.r > 1.04) return 'settle/brace 약압축';
    if (c.r < .70) return 'stretch 강한 뻗음';
    return 'stretch 뻗음';
};
let cum = 0;
clusters.forEach((c, i) => {
    cum += c.n;
    const dMin = Math.min(...c.depths).toFixed(2), dMax = Math.max(...c.depths).toFixed(2);
    if (i < 12) console.log(
        `${String(i + 1).padStart(2)}. 비율 ${c.r.toFixed(3)}`.padEnd(18)
        + `${String(c.n).padStart(4)}회  누적 ${(cum / samples.length * 100).toFixed(1).padStart(5)}%  `
        + `모션 ${String(c.motions.size).padStart(2)}개  원근 ${dMin}~${dMax}  ${name(c)}`);
});
for (const k of [5, 6, 7, 8]) {
    const cov = clusters.slice(0, k).reduce((a, c) => a + c.n, 0) / samples.length * 100;
    console.log(`상위 ${k}개 커버리지: ${cov.toFixed(1)}%`);
}
// 원근이 독립 축인지: 균등 군집의 원근 분포
const uni = clusters.find(c => Math.abs(c.r - 1) < .05);
if (uni) {
    const d = uni.depths.slice().sort((a, b) => a - b);
    console.log(`\n균등 군집의 원근 값 분포: ${d[0].toFixed(2)} ~ ${d[d.length - 1].toFixed(2)} (${uni.n}개)`);
    console.log(`  -> 원근이 ${(d[d.length - 1] / d[0]).toFixed(1)}배 범위로 퍼져 있다. 자세와 분리해야 하는 독립 축이다.`);
}

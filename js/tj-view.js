import { D, esc, srcLinks, dateLabel } from './data.js';
import { t, L, fmt, range } from './i18n.js';

const MAX = 4;
const score = (v, c) => `<span class="score" aria-label="${v}/${MAX}" style="--c:${c}">${[1, 2, 3, 4].map(i => `<i class="${i <= v ? 'f' : ''}"></i>`).join('')}</span>`;
export const pillarScore = p => p.indicators.reduce((s, i) => s + i.score, 0) / p.indicators.length;
// STJPI: weighted mean of pillar scores (0–4), scaled to 0–100
export const composite = T => T.pillars.reduce((s, p) => s + pillarScore(p) * p.weight, 0) / T.pillars.reduce((s, p) => s + p.weight, 0) / MAX * 100;

// Radial overview: one spoke per pillar, length = pillar score (0–4)
function radar(pillars) {
  const R = 110, cx = 150, cy = 140, n = pillars.length;
  const pt = (i, r) => [cx + r * Math.sin(2 * Math.PI * i / n), cy - r * Math.cos(2 * Math.PI * i / n)];
  const rings = [1, 2, 3, 4].map(k => `<polygon points="${pillars.map((_, i) => pt(i, R * k / MAX).join(',')).join(' ')}" fill="none" stroke="var(--border)"/>`).join('');
  const shape = pillars.map((p, i) => pt(i, R * pillarScore(p) / MAX).join(',')).join(' ');
  const labels = pillars.map((p, i) => {
    const [x, y] = pt(i, R + 22);
    return `<text x="${x}" y="${y}" text-anchor="middle" style="font-family:inherit;font-size:11px;fill:${p.color};font-weight:700">${esc(L(p))}</text>
      <text x="${x}" y="${y + 13}" text-anchor="middle" font-size="9.5">${pillarScore(p).toFixed(1)}/${MAX} · ${p.weight}%</text>`;
  }).join('');
  const dots = pillars.map((p, i) => { const [x, y] = pt(i, R * pillarScore(p) / MAX); return `<circle cx="${x}" cy="${y}" r="4" fill="${p.color}"/>`; }).join('');
  return `<svg class="chart-svg" viewBox="-60 0 420 290" style="max-width:430px;margin:auto" role="img" aria-label="${t('avg')}">
    ${rings}<polygon points="${shape}" fill="rgba(200,148,31,.18)" stroke="var(--accent)" stroke-width="2"/>${dots}${labels}</svg>`;
}

// Headline gauge: composite as a bar with its uncertainty band and the qualitative bands
function indexCard(T) {
  const c = composite(T), u = T.uncertainty, band = T.bands.find(b => c <= b.max);
  const lo = Math.max(0, Math.round(c - u)), hi = Math.min(100, Math.round(c + u));
  const ticks = T.bands.map(b => `<span style="inset-inline-start:${b.max}%"></span>`).join('');
  return `<div class="panel index-card">
    <div class="flabel">${esc(L(T.name))}</div>
    <div class="index-row"><b class="num" id="stjpiValue">${Math.round(c)}</b><span class="num muted">/100</span>
      <span class="index-band">${esc(L(band))}</span></div>
    <div class="index-bar" aria-hidden="true"><div class="index-range" style="inset-inline-start:${lo}%;width:${hi - lo}%"></div>
      <div class="index-pt" style="inset-inline-start:${c}%"></div>${ticks}</div>
    <div class="index-legend">${T.bands.map(b => `<span>${esc(L(b))}</span>`).join('')}</div>
    <p class="muted" style="margin-top:8px">${t('stjpiRange')} <span class="num">${range(lo, hi)}</span> · ${t('stjpiNote')}</p>
  </div>`;
}

export function renderTJ() {
  const T = D.tjIndicators;
  const pc = Object.fromEntries(T.pillars.map(p => [p.id, p.color]));
  const keyStats = D.stats.filter(s => ['disappeared_regime', 'torture_deaths', 'missing_range', 'graves_range', 'dna_ids', 'tj_cases', 'former_personnel_detained', 'trials_target'].includes(s.key));
  const nInd = T.pillars.reduce((n, p) => n + p.indicators.length, 0);
  document.getElementById('tjRoot').innerHTML = `
    <h1>${t('tj_t')}</h1><p class="lede">${t('tj_p').replace('{n}', nInd)}</p>
    <div class="disclaimer">⚖ ${esc(L(T.disclaimer))} · <span class="num">${T.asOf}</span></div>
    ${indexCard(T)}
    <div class="grid2" style="margin-top:14px">
      <div class="panel">${radar(T.pillars)}</div>
      <div class="panel"><div class="flabel">${t('numbers')}</div><div class="sgrid">${keyStats.map(s => `
        <a class="scard" href="${esc(D.sources[s.src[0]]?.url || '#')}" target="_blank" rel="noopener" style="border-inline-start:3px solid ${s.color}">
        <div class="scard-n num" style="color:${s.color}">${s.value != null ? fmt(s.value) + (s.plus ? '+' : '') : range(s.low, s.high)}</div>
        <div class="scard-l">${s.target ? `<b>${t('target')}</b> · ` : ''}${esc(L(s))}<br>${esc(L(s, 'def'))}</div></a>`).join('')}</div></div>
    </div>
    <div class="section-t">${T.pillars.length} · ${nInd} ${t('ind')}</div>
    <div class="pillars">${T.pillars.map(p => `
      <section class="pillar" style="--c:${p.color}">
        <div class="pillar-h"><h3>${esc(L(p))}</h3><span class="muted num">${pillarScore(p).toFixed(1)}/${MAX} · ${t('weight')} ${p.weight}%</span></div>
        ${p.indicators.map(i => `<div class="ind">
          <div class="ind-h"><span class="ind-n">${esc(L(i))}</span>${score(i.score, p.color)}</div>
          <div class="ind-s">${esc(L(T.scale[i.score]))} · <span class="ind-type">${esc(L(T.types[i.type]))}</span>${i.confidence === 'low' ? ' · ?' : ''}</div>
          <div class="ind-e">${esc(L(i, 'ev'))}</div>
          <div class="ind-src"><span class="num">${i.date}</span> · ${srcLinks(i.src)}</div></div>`).join('')}
      </section>`).join('')}</div>
    <div class="grid2" style="margin-top:14px">
      <div class="panel"><div class="flabel">${t('milestones')}</div><div class="ms">${T.milestones.map(m => `
        <div class="ms-i" style="--c:${pc[m.pillar]}"><div class="ms-d">${dateLabel(m.date)}</div><div class="ms-t">${esc(L(m))}</div>
        <div class="ind-src">${srcLinks(m.src)}</div></div>`).join('')}</div></div>
      <div class="panel"><div class="flabel">${t('gaps')}</div><ul class="gaps">${T.gaps.map(g => `<li>${esc(L(g))}</li>`).join('')}</ul>
        <div class="flabel" style="margin-top:18px">${t('framework')}</div><p class="ind-e">${esc(L(T.framework))}</p>
        <div class="ind-src">${srcLinks(T.framework.src)}</div>
        <div class="flabel" style="margin-top:14px">${t('history')}</div>
        <p class="ind-e">${T.history.map(h => `<span class="num">${h.date}</span>: ${esc(L(h, 'note'))} (${h.value ?? Math.round(composite(T))}/100)`).join('<br>')}</p></div>
    </div>`;
}

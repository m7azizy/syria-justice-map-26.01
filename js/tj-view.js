import { D, esc, srcLinks, dateLabel } from './data.js';
import { t, L, fmt } from './i18n.js';

const score = (v, c) => `<span class="score" aria-label="${v}/3" style="--c:${c}">${[1, 2, 3].map(i => `<i class="${i <= v ? 'f' : ''}"></i>`).join('')}</span>`;

// Radial overview: one spoke per pillar, length = mean indicator score (0–3)
function radar(pillars) {
  const R = 110, cx = 150, cy = 140, n = pillars.length;
  const pt = (i, r) => [cx + r * Math.sin(2 * Math.PI * i / n), cy - r * Math.cos(2 * Math.PI * i / n)];
  const rings = [1, 2, 3].map(k => `<polygon points="${pillars.map((_, i) => pt(i, R * k / 3).join(',')).join(' ')}" fill="none" stroke="var(--border)"/>`).join('');
  const avg = p => p.indicators.reduce((s, i) => s + i.score, 0) / p.indicators.length;
  const shape = pillars.map((p, i) => pt(i, R * avg(p) / 3).join(',')).join(' ');
  const labels = pillars.map((p, i) => {
    const [x, y] = pt(i, R + 22);
    return `<text x="${x}" y="${y}" text-anchor="middle" style="font-family:inherit;font-size:11px;fill:${p.color};font-weight:700">${esc(L(p))}</text>
      <text x="${x}" y="${y + 13}" text-anchor="middle" font-size="9.5">${avg(p).toFixed(1)}/3</text>`;
  }).join('');
  const dots = pillars.map((p, i) => { const [x, y] = pt(i, R * avg(p) / 3); return `<circle cx="${x}" cy="${y}" r="4" fill="${p.color}"/>`; }).join('');
  return `<svg class="chart-svg" viewBox="-50 0 400 290" style="max-width:420px;margin:auto" role="img" aria-label="${t('avg')}">
    ${rings}<polygon points="${shape}" fill="rgba(200,148,31,.18)" stroke="var(--accent)" stroke-width="2"/>${dots}${labels}</svg>`;
}

export function renderTJ() {
  const T = D.tjIndicators;
  const pc = Object.fromEntries(T.pillars.map(p => [p.id, p.color]));
  const keyStats = D.stats.filter(s => ['disappeared_regime', 'torture_deaths', 'missing_range', 'graves_range', 'dna_ids', 'tj_cases'].includes(s.key));
  document.getElementById('tjRoot').innerHTML = `
    <h1>${t('tj_t')}</h1><p class="lede">${t('tj_p')}</p>
    <div class="disclaimer">⚖ ${esc(L(T.disclaimer))} · <span class="num">${T.asOf}</span></div>
    <div class="grid2">
      <div class="panel">${radar(T.pillars)}</div>
      <div class="panel"><div class="flabel">${t('numbers')}</div><div class="sgrid">${keyStats.map(s => `
        <a class="scard" href="${esc(D.sources[s.src[0]]?.url || '#')}" target="_blank" rel="noopener" style="border-inline-start:3px solid ${s.color}">
        <div class="scard-n num" style="color:${s.color}">${s.value != null ? fmt(s.value) + (s.plus ? '+' : '') : fmt(s.low) + '–' + fmt(s.high)}</div>
        <div class="scard-l">${esc(L(s))}<br>${esc(L(s, 'def'))}</div></a>`).join('')}</div></div>
    </div>
    <div class="section-t">${T.pillars.length} · ${T.pillars.reduce((n, p) => n + p.indicators.length, 0)} ${t('ind')}</div>
    <div class="pillars">${T.pillars.map(p => `
      <section class="pillar" style="--c:${p.color}">
        <div class="pillar-h"><h3>${esc(L(p))}</h3><span class="muted num">${(p.indicators.reduce((s, i) => s + i.score, 0) / p.indicators.length).toFixed(1)}/3</span></div>
        ${p.indicators.map(i => `<div class="ind">
          <div class="ind-h"><span class="ind-n">${esc(L(i))}</span>${score(i.score, p.color)}</div>
          <div class="ind-s">${esc(L(T.scale[i.score]))}${i.confidence === 'low' ? ' · ?' : ''}</div>
          <div class="ind-e">${esc(L(i, 'ev'))}</div>
          <div class="ind-src"><span class="num">${i.date}</span> · ${srcLinks(i.src)}</div></div>`).join('')}
      </section>`).join('')}</div>
    <div class="grid2" style="margin-top:14px">
      <div class="panel"><div class="flabel">${t('milestones')}</div><div class="ms">${T.milestones.map(m => `
        <div class="ms-i" style="--c:${pc[m.pillar]}"><div class="ms-d">${dateLabel(m.date)}</div><div class="ms-t">${esc(L(m))}</div>
        <div class="ind-src">${srcLinks(m.src)}</div></div>`).join('')}</div></div>
      <div class="panel"><div class="flabel">${t('gaps')}</div><ul class="gaps">${T.gaps.map(g => `<li>${esc(L(g))}</li>`).join('')}</ul>
        <div class="flabel" style="margin-top:18px">${t('framework')}</div><p class="ind-e">${esc(L(T.framework))}</p>
        <div class="ind-src">${srcLinks(T.framework.src)}</div></div>
    </div>`;
}

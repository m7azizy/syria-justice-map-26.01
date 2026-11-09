import { D, esc, srcLinks, siteName, dateLabel } from './data.js';
import { t, L, fmt, getLang, COUNTRIES, STATUS_COLOR } from './i18n.js';

const F = { status: 'all', jur: 'all', country: 'all' };
let goToSite = () => {};

const sorted = () => [...D.trials].sort((a, b) => b.date.localeCompare(a.date));
const pass = tr => (F.status === 'all' || tr.status === F.status) && (F.jur === 'all' || tr.jurisdiction === F.jur) && (F.country === 'all' || tr.country === F.country);

function kpis() {
  const tr = D.trials;
  const k = [
    [tr.length, t('k_cases')], [tr.filter(x => x.status === 'convicted').length, t('k_conv')],
    [tr.filter(x => x.status === 'ongoing').length, t('k_ongoing')], [new Set(tr.map(x => x.country)).size, t('k_countries')],
    [new Set(tr.flatMap(x => x.accused.map(a => a.en))).size, t('k_named')],
  ];
  return k.map(([n, l]) => `<div class="kpi"><b class="num">${fmt(n)}</b><span>${l}</span></div>`).join('');
}

// Horizontal stacked bars: cases per country, split by status
function countryChart() {
  const by = {};
  D.trials.forEach(tr => { (by[tr.country] ||= { convicted: 0, ongoing: 0, indicted: 0, closed: 0 })[tr.status]++; });
  const rows = Object.entries(by).sort((a, b) => sum(b[1]) - sum(a[1]));
  const W = 460, rowH = 26, lab = 110, mx = Math.max(...rows.map(r => sum(r[1])));
  const unit = (W - lab - 30) / mx;
  const svg = rows.map(([c, v], i) => {
    let x = lab;
    const segs = ['convicted', 'ongoing', 'indicted', 'closed'].filter(s => v[s]).map(s => {
      const w = v[s] * unit, r = `<rect x="${x}" y="${i * rowH + 5}" width="${w - 2}" height="16" rx="3" fill="${STATUS_COLOR[s]}"><title>${t('st_' + s)}: ${v[s]}</title></rect>`;
      x += w; return r;
    }).join('');
    return `<text x="${lab - 8}" y="${i * rowH + 17}" text-anchor="end" style="font-family:inherit;font-size:11px;fill:var(--text-2)">${esc(L(COUNTRIES[c]))}</text>${segs}
      <text x="${x + 4}" y="${i * rowH + 17}" font-size="10">${sum(v)}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${rows.length * rowH + 6}" role="img" aria-label="${t('byCountry')}" direction="ltr">${svg}</svg>`;
}
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

// Dot timeline of verdicts and openings, 2020–2026
function timeChart() {
  const y0 = 2020, y1 = 2027, W = 460, H = 150, pad = 24;
  const x = d => { const [y, m = 6] = d.split('-').map(Number); return pad + ((y + (m - 1) / 12) - y0) / (y1 - y0) * (W - 2 * pad); };
  const lanes = { national: 40, universal: 85, extraterritorial: 120 };
  const axis = Array.from({ length: y1 - y0 }, (_, i) => y0 + i).map(y =>
    `<line x1="${x(y + '-01')}" x2="${x(y + '-01')}" y1="20" y2="${H - 14}" stroke="var(--border)"/><text x="${x(y + '-01') + 3}" y="${H - 2}" font-size="9">${y}</text>`).join('');
  const lane = Object.entries(lanes).map(([k, yy]) => `<text x="${pad}" y="${yy - 12}" style="font-family:inherit;font-size:10px">${t('j_' + k)}</text>`).join('');
  const dots = D.trials.map(tr => `<circle cx="${x(tr.date)}" cy="${lanes[tr.jurisdiction]}" r="6" fill="${STATUS_COLOR[tr.status]}" stroke="var(--bg-panel)" stroke-width="1.5">
    <title>${esc(L(tr))} — ${tr.date}</title></circle>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('overTime')}" direction="ltr">${axis}${lane}${dots}</svg>
    <div class="filters-row" style="margin-top:6px">${Object.entries(STATUS_COLOR).map(([s, c]) => `<span class="legend-row"><span class="dot" style="background:${c}"></span>${t('st_' + s)}</span>`).join('')}</div>`;
}

function filters() {
  const btn = (k, v, label) => `<button class="chip plain" data-tf="${k}" data-tv="${v}" aria-pressed="${F[k] === v}">${label}</button>`;
  return `<div class="filters-row">${btn('status', 'all', t('allStatus'))}${['convicted', 'ongoing', 'indicted', 'closed'].map(s => btn('status', s, t('st_' + s))).join('')}</div>
    <div class="filters-row">${btn('jur', 'all', t('allJur'))}${['universal', 'extraterritorial', 'national'].map(s => btn('jur', s, t('j_' + s))).join('')}</div>
    <div class="filters-row">${btn('country', 'all', t('all'))}${Object.keys(COUNTRIES).filter(c => D.trials.some(x => x.country === c)).map(c => btn('country', c, L(COUNTRIES[c]))).join('')}</div>`;
}

function cards() {
  const list = sorted().filter(pass);
  return list.map(tr => {
    const sites = tr.facilityIds.map(id => D.sites.get(id)).filter(Boolean);
    const place = [L(COUNTRIES[tr.country]), tr.city && (getLang() === 'ar' ? tr.cityAr : tr.city)].filter(Boolean).join(' · ');
    return `<article class="trial-card" style="--c:${STATUS_COLOR[tr.status]}">
      <div class="trial-meta"><span class="status" style="background:${STATUS_COLOR[tr.status]}">${t('st_' + tr.status)}</span>
        <span>${esc(place)}</span><span>· ${t('j_' + tr.jurisdiction)}</span><span>· ${dateLabel(tr.date)}</span></div>
      <h3>${esc(L(tr))}</h3>
      <div class="trial-v">${esc(L(tr, 'verdict'))}</div>
      <div class="muted" style="margin-top:4px">${t('accused')}: ${tr.accused.map(a => esc(L(a))).join(getLang() === 'ar' ? '، ' : ', ')}</div>
      <div class="trial-links">${sites.map(s => `<button class="link-btn" data-site="${s.id}">📍 ${esc(siteName(s))}</button>`).join('')}
        <span class="muted">${t('source')}: ${srcLinks(tr.src)}</span></div></article>`;
  }).join('') || `<p class="muted">—</p>`;
}

export function renderTrials() {
  document.getElementById('trialsRoot').innerHTML = `
    <h1>${t('tr_t')}</h1><p class="lede">${t('tr_p')}</p>
    <div class="kpis">${kpis()}</div>
    <div class="grid2" style="margin-top:14px">
      <div class="panel"><div class="flabel">${t('byCountry')}</div>${countryChart()}</div>
      <div class="panel"><div class="flabel">${t('overTime')}</div>${timeChart()}</div></div>
    <div class="section-t">${t('k_cases')}</div>
    <div id="trialFilters">${filters()}</div>
    <div id="trialCards">${cards()}</div>
    <p class="note">${t('tr_note')} ${srcLinks(['HRW first verdicts', 'TRIAL UJAR 2026', 'JusticeInfo trials'])}</p>`;
}
export function initTrials(onSite) {
  goToSite = onSite;
  renderTrials();
  document.getElementById('view-trials').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tf) {
      F[b.dataset.tf] = b.dataset.tv;
      document.getElementById('trialFilters').innerHTML = filters();
      document.getElementById('trialCards').innerHTML = cards();
    } else if (b.dataset.site) goToSite(+b.dataset.site);
  });
}

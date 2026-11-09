import { D, esc, srcLinks, siteName } from './data.js';
import { t, L, fmt, range, getLang, AGENCIES } from './i18n.js';

const YEAR_MIN = 2011, YEAR_MAX = 2026;
const ALL_AG = Object.keys(AGENCIES);
const S = {
  agencies: new Set(ALL_AG), gov: 'all', v: 'all', conf: 'all', q: '',
  year: 2011, allYears: true, playing: null,
  layers: { facilities: true, graves: true, transfers: false, cluster: true, size: true },
};
let map, facLayer, graveLayer, flowLayer, markers = new Map(), sidebarOpen = true;
const $ = s => document.querySelector(s);

export const markerSize = f => S.layers.size && f.iiim?.experiences ? Math.min(30, 9 + 2.4 * Math.sqrt(f.iiim.experiences)) : 11;

export function facilityIcon(f, extra = '') {
  const c = AGENCIES[f.agency].c, sz = markerSize(f);
  const cls = ['mk', f.caesar ? 'caesar' : '', f.needsVerification ? 'verify' : '', extra].join(' ');
  return L_.divIcon({ className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
    html: `<div class="${cls}" style="--c:${c};width:${sz}px;height:${sz}px;background:${c}"></div>` });
}
export const graveIcon = (extra = '') => L_.divIcon({ className: '', iconSize: [16, 16], iconAnchor: [8, 8], html: `<div class="gmk ${extra}"></div>` });
const L_ = window.L;

const yearOk = s => S.allYears || (s.yearActive <= S.year && s.yearClosed >= S.year);
export function isVisible(f) {
  return S.agencies.has(f.agency) &&
    (S.gov === 'all' || f.govAr === S.gov) &&
    (S.v === 'all' || (S.v === 'caesar' ? f.caesar : f.violations.includes(S.v))) &&
    (S.conf === 'all' || f.conf === S.conf) && yearOk(f);
}
// Graves are their own layer: agency/violation/confidence filters don't apply, governorate and year do
export const graveVisible = g => (S.gov === 'all' || g.govAr === S.gov) && yearOk(g);

// POPUPS ---------------------------------------------------------------------------------
const vtag = v => `<span class="vtag vt-${v}">${t(v)}</span>`;
const period = s => `\u2066${s.yearActive}–${s.yearClosed === 2024 ? t('regimeFall') : s.yearClosed >= 2026 ? t('present') : s.yearClosed}\u2069`;
export function popupHtml(s) {
  const isGrave = s.agency === 'GRAVE';
  const ag = isGrave ? { c: '#7B1C1C', ar: t('grave'), en: t('grave') } : AGENCIES[s.agency];
  const other = getLang() === 'ar' ? s.nameEn : s.nameAr;
  const rows = [
    [t('p_gov'), L(s, 'gov')],
    [t('p_period'), `<span class="num">${period(s)}</span>`],
    isGrave ? [t('g_status'), t('gs_' + s.status)] : [t('p_conf'), `${t(s.conf.toLowerCase())}${s.geoSource === 'IIIM' ? ' · IIIM' : ''}`],
    ...(isGrave ? [[t('p_verif'), t('vr_' + s.verification)], ['', s.protected ? '🛡 ' + t('p_protected') : '⚠ ' + t('p_unprotected')]] : []),
  ].map(([k, v]) => `<div class="prow"><span>${k}</span><span>${v}</span></div>`).join('');
  const iiim = s.iiim?.experiences ? `<div class="box box-iiim"><div class="box-h">${t('p_iiim')}</div>
    <span class="num">${s.iiim.experiences}</span> ${t('p_exp')}${s.iiim.torture != null ? ` · <span class="num">${s.iiim.torture}</span> ${t('p_tortureN')} · <span class="num">${s.iiim.inhumane}</span> ${t('p_inhumane')}` : ''}
    ${s.iiim.parent ? `<div class="muted">${t('p_parent')}: <span title="${esc(s.iiim.parent)}">${esc(L(s.iiim, 'parent') || s.iiim.parent)}</span></div>` : ''}</div>` : '';
  const caesar = s.caesar && s.caesarVictims ? `<div class="box box-caesar"><div class="box-h">📁 ${t('p_caesar')}</div>
    <span class="num">${fmt(s.caesarVictims)}</span> ${t('victims')}${s.caesarImgs ? ` · <span class="num">${fmt(s.caesarImgs)}</span> ${t('imgs')}` : ''}</div>` : '';
  const trials = (D.trialsBySite.get(s.id) || []).map(tr =>
    `<div><span class="num muted">${tr.date.slice(0, 7)}</span> ${esc(L(tr))} — <b>${esc(L(tr, 'verdict'))}</b></div>`).join('');
  const acc = (s.accountability || []).map(a => `<div>• <b>${t('acc_' + a.type)}</b> <span class="num muted">${a.date}</span> — ${esc(L(a))} <span class="muted">(${srcLinks(a.src, ', ')})</span></div>`).join('');
  const reloc = s.relocation ? `<div class="muted" style="margin-top:6px">↪ ${esc(L(s.relocation))}</div>` : '';
  return `<div class="pw" dir="${getLang() === 'ar' ? 'rtl' : 'ltr'}">
    <span class="pbadge" style="background:${ag.c}22;color:${ag.c}">● ${esc(L(ag))}</span>
    <div class="pt">${esc(siteName(s))}</div><div class="pst">${esc(other)}</div>
    ${rows}
    <div class="pd">${esc(L(s, 'detail'))}</div>
    ${s.violations?.length || s.caesar ? `<div class="vtags">${(s.violations || []).map(vtag).join('')}${s.caesar ? vtag('caesar') : ''}</div>` : ''}
    ${iiim}${caesar}${reloc}
    ${acc ? `<div class="box box-acc"><div class="box-h">◉ ${t('p_acc')}</div>${acc}</div>` : ''}
    ${trials ? `<div class="box box-trial"><div class="box-h">⚖ ${t('p_trials')}</div>${trials}</div>` : ''}
    ${s.needsVerification ? `<div class="box box-warn">⚠ ${t('p_verify')}</div>` : ''}
    <div class="pfoot"><button class="share" data-share="${s.id}">🔗 ${t('share')}</button>
      📍 <span class="num">${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}</span>
      ${s.coordNote ? `<div>${esc(L(s.coordNote))}</div>` : ''}
      <div style="margin-top:4px">${t('p_sources')}: ${srcLinks(s.sources)}</div></div></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-share]');
  if (!b) return;
  const url = `${location.origin}${location.pathname}#map&site=${b.dataset.share}`;
  (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => { b.textContent = '✓ ' + t('copied'); }, () => { prompt(t('share'), url); });
});

// RENDER ---------------------------------------------------------------------------------
function render() {
  facLayer.clearLayers(); graveLayer.clearLayers(); flowLayer.clearLayers(); markers.clear();
  const visible = D.facilities.filter(isVisible);
  if (S.layers.facilities) for (const f of visible) {
    const m = L_.marker([f.lat, f.lng], { icon: facilityIcon(f), title: siteName(f) });
    m.bindTooltip(siteName(f), { direction: 'top' });
    m.bindPopup(() => popupHtml(f), { maxWidth: 320 });
    facLayer.addLayer(m); markers.set(f.id, m);
  }
  const graves = S.layers.graves ? D.graves.filter(graveVisible) : [];
  for (const g of graves) {
    if (g.coordPrecision === 'generalised')
      L_.circle([g.lat, g.lng], { radius: 2000, color: '#C0392B', weight: 1.5, fillOpacity: .08, className: 'grave-area', interactive: false }).addTo(graveLayer);
    const m = L_.marker([g.lat, g.lng], { icon: graveIcon(), title: siteName(g), zIndexOffset: 500 });
    m.bindTooltip(siteName(g), { direction: 'top' });
    m.bindPopup(() => popupHtml({ ...g, agency: 'GRAVE' }), { maxWidth: 320 });
    graveLayer.addLayer(m); markers.set(g.id, m);
  }
  if (S.layers.transfers) drawFlows(flowLayer);
  updateStats(visible, graves);
  renderList();
  const n = visible.length + graves.length;
  $('#tlCount').textContent = fmt(n);
  document.querySelectorAll('[data-count="shown"]').forEach(el => { el.textContent = fmt(n); });
}

export function drawFlows(layer, onlyIds) {
  const col = { bodies: '#C8941F', burial: '#C0392B', relocation: '#7B1C1C' };
  for (const e of D.transfers.edges) {
    if (onlyIds && !(onlyIds.has(e.from) || onlyIds.has(e.to))) continue;
    const a = D.sites.get(e.from), b = D.sites.get(e.to);
    // Gentle curve: offset the midpoint perpendicular to the segment
    const mx = (a.lat + b.lat) / 2, my = (a.lng + b.lng) / 2, dx = b.lat - a.lat, dy = b.lng - a.lng;
    const pts = [[a.lat, a.lng], [mx - dy * 0.15, my + dx * 0.15], [b.lat, b.lng]];
    L_.polyline(pts, { color: col[e.kind], weight: 2.5, opacity: .85, className: 'flow', smoothFactor: 2 })
      .bindTooltip(`<b>${e.years}</b> · ${esc(L(e))}<br><span class="muted">${srcLinks(e.src)}</span>`, { sticky: true })
      .addTo(layer);
  }
}

function bars(el, entries, colors, names) {
  const mx = Math.max(1, ...entries.map(e => e[1]));
  el.innerHTML = entries.map(([k, n]) => `<div class="bar"><div class="bar-top"><span style="color:${colors[k]}">${names(k)}</span><span class="num">${n}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${n / mx * 100}%;background:${colors[k]}"></div></div></div>`).join('');
}
function updateStats(visible, graves) {
  $('#stSites').textContent = fmt(visible.length + graves.length);
  $('#stExp').textContent = fmt(visible.reduce((s, f) => s + (f.iiim?.experiences || 0), 0));
  $('#stCaesar').textContent = fmt(visible.filter(f => f.caesar).length);
  $('#stGovs').textContent = fmt(new Set(visible.map(f => f.govAr)).size);
  $('#stYear').textContent = S.allYears ? t('allSitesEv') : `${S.year}`;
  const ag = {}; visible.forEach(f => { ag[f.agency] = (ag[f.agency] || 0) + 1; });
  bars($('#agBars'), Object.entries(ag).sort((a, b) => b[1] - a[1]), Object.fromEntries(ALL_AG.map(k => [k, AGENCIES[k].c])), k => L(AGENCIES[k]));
  const vc = { torture: 0, disappear: 0, death: 0, caesar: 0 };
  visible.forEach(f => { f.violations.forEach(v => { if (v in vc) vc[v]++; }); if (f.caesar) vc.caesar++; });
  bars($('#vBars'), Object.entries(vc).sort((a, b) => b[1] - a[1]), { torture: '#C0392B', disappear: '#2471A3', death: '#922B21', caesar: '#8B5C1A' }, t);
}
function renderRef() {
  $('#refStats').innerHTML = D.stats.slice(0, 8).map(s => {
    const src = D.sources[s.src[0]];
    const val = s.value != null ? fmt(s.value) + (s.plus ? '+' : '') : range(s.low, s.high);
    return `<a class="scard" href="${esc(src?.url || '#')}" target="_blank" rel="noopener" style="border-inline-start:3px solid ${s.color}" title="${esc(L(s, 'def'))}">
      <div class="scard-n num" style="color:${s.color}">${val}</div><div class="scard-l">${esc(L(s))} · ${esc(src?.org || '')}</div></a>`;
  }).join('');
}

function renderList() {
  const q = S.q.trim().toLowerCase();
  const list = D.facilities.filter(f => isVisible(f) && (!q || [f.nameAr, f.nameEn.toLowerCase(), f.govAr, f.govEn.toLowerCase()].some(x => x.includes(q))));
  $('#rcnt').textContent = `${fmt(list.length)} ${t('sites')}`;
  $('#flist').innerHTML = list.map(f => `<div class="fi" role="button" tabindex="0" data-fly="${f.id}">
    <div class="fi-hd"><span class="dot" style="background:${AGENCIES[f.agency].c}"></span><div><div class="fi-n">${esc(siteName(f))}</div>
    <div class="fi-s">${esc(getLang() === 'ar' ? f.nameEn : f.nameAr)}</div></div></div>
    <div class="fi-meta"><span class="tag">${esc(L(f, 'gov'))}</span><span class="tag num">${f.yearActive}–${f.yearClosed}</span>
    ${f.iiim?.experiences ? `<span class="tag">IIIM ${f.iiim.experiences}</span>` : ''}${D.trialsBySite.has(f.id) ? '<span class="tag">⚖</span>' : ''}${f.accountability ? '<span class="tag">◉</span>' : ''}
    ${f.needsVerification ? '<span class="tag warn">⚠</span>' : ''}</div></div>`).join('');
  $('#unmapped').innerHTML = D.unmappedFacilities.map(u => `<div class="legend-row"><span class="dot" style="background:var(--border-dark)"></span>
    <span>${esc(L(u, 'name'))}${u.experiences ? ` <span class="num muted">(${u.experiences})</span>` : ''}</span></div>`).join('') +
    D.gravesUnmapped.map(g => `<div class="legend-row"><span class="diamond" style="transform:rotate(45deg) scale(.8)"></span>
    <span>${esc(L(g, 'name'))} — <span class="muted">${esc(L(g, 'status'))}</span></span></div>`).join('');
}

// FILTER UI -----------------------------------------------------------------------------
function buildFilters() {
  $('#agencyChips').innerHTML = ALL_AG.map(k => `<button class="chip" data-ag="${k}" aria-pressed="true" style="--c:${AGENCIES[k].c}">
    <span class="dot" style="background:${AGENCIES[k].c}"></span><span data-agname="${k}">${L(AGENCIES[k])}</span></button>`).join('');
  const govs = [...new Map(D.facilities.map(f => [f.govAr, f])).values()].sort((a, b) => a.govEn.localeCompare(b.govEn));
  $('#govChips').innerHTML = `<button class="chip plain" data-gov="all" aria-pressed="true" data-i18n="all">${t('all')}</button>` +
    govs.map(f => `<button class="chip plain" data-gov="${f.govAr}" data-gov-en="${f.govEn}" aria-pressed="false">${L(f, 'gov')}</button>`).join('');
  paintChips();
}
function paintChips() {
  document.querySelectorAll('[data-ag]').forEach(b => {
    const on = S.agencies.has(b.dataset.ag);
    b.setAttribute('aria-pressed', on);
    b.style.background = on ? AGENCIES[b.dataset.ag].c : '';
  });
  document.querySelectorAll('[data-gov]').forEach(b => b.setAttribute('aria-pressed', b.dataset.gov === S.gov));
  document.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.v));
  document.querySelectorAll('[data-conf]').forEach(b => b.setAttribute('aria-pressed', b.dataset.conf === S.conf));
  document.querySelectorAll('[data-layer]').forEach(b => b.setAttribute('aria-checked', S.layers[b.dataset.layer]));
}
function wireUI() {
  document.addEventListener('click', e => {
    const b = e.target.closest('button,[data-fly]');
    if (!b || !b.closest('#view-map')) return;
    if (b.dataset.ag) {
      const k = b.dataset.ag;
      if (S.agencies.has(k) && S.agencies.size > 1) S.agencies.delete(k); else S.agencies.add(k);
    } else if (b.dataset.gov) S.gov = b.dataset.gov;
    else if (b.dataset.v) S.v = b.dataset.v;
    else if (b.dataset.conf) S.conf = b.dataset.conf;
    else if (b.dataset.layer) {
      S.layers[b.dataset.layer] = !S.layers[b.dataset.layer];
      if (b.dataset.layer === 'cluster') rebuildFacLayer();
    } else if (b.dataset.tab) { switchTab(b.dataset.tab); return; }
    else if (b.dataset.fly) { showSite(+b.dataset.fly); return; }
    else if (b.id === 'resetBtn') { Object.assign(S, { agencies: new Set(ALL_AG), gov: 'all', v: 'all', conf: 'all' }); }
    else if (b.id === 'stoggle') { toggleSidebar(); return; }
    else if (b.id === 'playBtn') { togglePlay(); return; }
    else if (b.id === 'allYearsBtn') { setAllYears(!S.allYears); return; }
    else if (b.dataset.year) { setYear(+b.dataset.year); return; }
    else return;
    paintChips(); render();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.dataset?.fly) showSite(+e.target.dataset.fly);
  });
  $('#sbox').addEventListener('input', e => { S.q = e.target.value; renderList(); });
}
function switchTab(id) {
  document.querySelectorAll('#view-map .tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id));
  document.querySelectorAll('#view-map .tab-body').forEach(b => b.classList.toggle('active', b.id === 'tab-' + id));
}
export function toggleSidebar(force) {
  sidebarOpen = typeof force === 'boolean' ? force : !sidebarOpen;
  const sb = $('#sidebar'), tg = $('#stoggle');
  sb.classList.toggle('closed', !sidebarOpen);
  tg.style.insetInlineStart = sidebarOpen ? sb.offsetWidth + 'px' : '0';
  const rtl = document.documentElement.dir === 'rtl';
  tg.textContent = (sidebarOpen === rtl) ? '▶' : '◀';
  setTimeout(() => map.invalidateSize(), 250);
}

// TIMELINE -------------------------------------------------------------------------------
function buildTimeline() {
  const years = []; for (let y = YEAR_MIN; y <= YEAR_MAX; y++) years.push(y);
  $('#ticks').innerHTML = years.map(y => `<button class="tick${y > 2024 ? ' post' : ''}" data-year="${y}">${y}</button>`).join('');
  const track = $('#track');
  const fromX = x => { const r = track.getBoundingClientRect(); return Math.round(YEAR_MIN + Math.max(0, Math.min(1, (x - r.left) / r.width)) * (YEAR_MAX - YEAR_MIN)); };
  let drag = false;
  track.addEventListener('pointerdown', e => { drag = true; track.setPointerCapture(e.pointerId); setYear(fromX(e.clientX)); });
  track.addEventListener('pointermove', e => { if (drag) { const y = fromX(e.clientX); if (y !== S.year || S.allYears) setYear(y); } });
  track.addEventListener('pointerup', () => { drag = false; });
}
function paintTimeline() {
  const pct = (S.year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN) * 100;
  $('#trackFill').style.width = pct + '%';
  $('#thumb').style.left = pct + '%';
  $('#timeline').classList.toggle('all', S.allYears);
  $('#allYearsBtn').classList.toggle('on', S.allYears);
  $('#allYearsBtn').setAttribute('aria-pressed', S.allYears);
  $('#yearDisplay').textContent = S.allYears ? t('all') : S.year;
  document.querySelectorAll('.tick').forEach(b => b.classList.toggle('cur', !S.allYears && +b.dataset.year === S.year));
  const ev = D.timeline.find(e => e.year === S.year);
  $('#tlEvent').textContent = S.allYears ? t('allSitesEv') : (ev ? L(ev) : '');
}
export function setYear(y) { S.year = y; S.allYears = false; paintTimeline(); render(); }
export function setAllYears(on) { S.allYears = on; if (on && S.playing) togglePlay(); paintTimeline(); render(); }
function togglePlay() {
  if (S.playing) { clearInterval(S.playing); S.playing = null; $('#playBtn').textContent = '▶'; return; }
  if (S.allYears || S.year >= YEAR_MAX) setYear(YEAR_MIN);
  $('#playBtn').textContent = '⏸';
  S.playing = setInterval(() => {
    if (S.year >= YEAR_MAX) { togglePlay(); return; }
    setYear(S.year + 1);
  }, 1300);
}

// PUBLIC ---------------------------------------------------------------------------------
function rebuildFacLayer() {
  if (facLayer) map.removeLayer(facLayer);
  facLayer = S.layers.cluster && L_.markerClusterGroup
    ? L_.markerClusterGroup({ maxClusterRadius: 32, disableClusteringAtZoom: 11, showCoverageOnHover: false, spiderfyOnMaxZoom: false })
    : L_.layerGroup();
  facLayer.addTo(map);
}
export function initMap() {
  map = L_.map('map', { center: [34.9, 38.4], zoom: 7, zoomControl: false, attributionControl: false, minZoom: 5 });
  L_.control.zoom({ position: 'bottomright' }).addTo(map);
  L_.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  L_.control.attribution({ prefix: false, position: 'bottomleft' })
    .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · IIIM/UN').addTo(map);
  flowLayer = L_.layerGroup().addTo(map);
  rebuildFacLayer();
  graveLayer = L_.layerGroup().addTo(map);
  if (window.matchMedia('(max-width:768px)').matches) { sidebarOpen = false; map.setZoom(6); }
  buildFilters(); buildTimeline(); wireUI(); renderRef();
  paintTimeline(); render(); toggleSidebar(sidebarOpen);
}
export function refreshMap() {
  if (!map) return;
  document.querySelectorAll('[data-agname]').forEach(el => { el.textContent = L(AGENCIES[el.dataset.agname]); });
  document.querySelectorAll('[data-gov-en]').forEach(el => { el.textContent = getLang() === 'ar' ? el.dataset.gov : el.dataset.govEn; });
  renderRef(); paintTimeline(); render(); toggleSidebar(sidebarOpen);
}
export function invalidate() { map?.invalidateSize(); }
export function showSite(id) {
  const s = D.sites.get(id);
  if (!s) return;
  if (s.agency !== 'GRAVE' && !isVisible(s)) { Object.assign(S, { agencies: new Set(ALL_AG), gov: 'all', v: 'all', conf: 'all', allYears: true }); paintChips(); paintTimeline(); render(); }
  if (s.agency === 'GRAVE' && (!S.layers.graves || !graveVisible(s))) { Object.assign(S, { gov: 'all', allYears: true }); S.layers.graves = true; paintChips(); paintTimeline(); render(); }
  if (window.matchMedia('(max-width:768px)').matches) toggleSidebar(false);
  map.flyTo([s.lat, s.lng], 14, { duration: 1 });
  map.once('moveend', () => {
    const m = markers.get(id);
    if (!m) return;
    if (facLayer.zoomToShowLayer && facLayer.hasLayer(m)) facLayer.zoomToShowLayer(m, () => m.openPopup());
    else m.openPopup();
  });
}

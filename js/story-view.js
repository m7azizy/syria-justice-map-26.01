import { D, esc, srcLinks, siteName } from './data.js';
import { t, L } from './i18n.js';
import { facilityIcon, graveIcon, drawFlows, popupHtml } from './map-view.js';

const L_ = window.L;
let map, layer, current = -2, observer;

function buildChapters() {
  const box = document.getElementById('storyText');
  box.innerHTML = `<section class="chapter story-intro on" data-i="-1">
      <div class="k">${t('story_k')}</div><h2>${t('story_t')}</h2><p>${t('story_p')}</p><div class="src">${t('scroll')}</div></section>` +
    D.story.map((c, i) => `<section class="chapter" data-i="${i}">
      <div class="k">${t('chapter')} ${i + 1} · <span class="num">${c.year}</span></div>
      <h2>${esc(L(c, 'title'))}</h2><p>${esc(L(c, 'text'))}</p>
      <div class="src">${srcLinks(c.src)}</div></section>`).join('');
  document.getElementById('storyProgress').innerHTML = D.story.map(() => '<i></i>').join('');
  observer?.disconnect();
  observer = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach(e => show(+e.target.dataset.i));
  }, { root: box, threshold: 0.55 });
  box.querySelectorAll('.chapter').forEach(el => observer.observe(el));
}

function show(i) {
  if (i === current) return;
  current = i;
  document.querySelectorAll('#storyText .chapter').forEach(el => el.classList.toggle('on', +el.dataset.i === i));
  document.querySelectorAll('#storyProgress i').forEach((el, k) => el.classList.toggle('on', k <= i));
  const c = D.story[i] || { year: 2026, view: { center: [34.9, 38.4], zoom: 7 }, highlight: [], layers: ['facilities', 'graves'] };
  const hl = new Set(c.highlight);
  layer.clearLayers();
  if (c.layers.includes('transfers')) {
    drawFlows(layer, hl.size ? new Set(hl) : null);
    // Light up both ends of every path drawn for this chapter
    D.transfers.edges.filter(e => hl.has(e.from) || hl.has(e.to)).forEach(e => { hl.add(e.from); hl.add(e.to); });
  }
  for (const f of D.facilities) {
    if (f.yearActive > c.year) continue;
    const extra = hl.size ? (hl.has(f.id) ? 'hl' : 'dim') : '';
    const m = L_.marker([f.lat, f.lng], { icon: facilityIcon(f, extra), zIndexOffset: hl.has(f.id) ? 1000 : 0 });
    m.bindTooltip(siteName(f), { direction: 'top' }).bindPopup(() => popupHtml(f), { maxWidth: 320 }).addTo(layer);
  }
  if (c.layers.includes('graves')) for (const g of D.graves) {
    if (g.yearActive > c.year) continue;
    L_.marker([g.lat, g.lng], { icon: graveIcon(hl.has(g.id) ? 'hl' : ''), zIndexOffset: 900 })
      .bindTooltip(siteName(g), { direction: 'top' }).bindPopup(() => popupHtml({ ...g, agency: 'GRAVE' }), { maxWidth: 320 }).addTo(layer);
  }
  const small = window.matchMedia('(max-width:768px)').matches;
  map.flyTo(c.view.center, c.view.zoom - (small ? 1 : 0), { duration: 1.4 });
}

export function initStory() {
  map = L_.map('storyMap', { center: [34.9, 38.4], zoom: 7, zoomControl: false, attributionControl: false, scrollWheelZoom: false });
  L_.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  L_.control.zoom({ position: 'bottomright' }).addTo(map);
  layer = L_.layerGroup().addTo(map);
  buildChapters();
  show(-1);
}
export function refreshStory() {
  if (!map) return;
  const keep = current; current = -2;
  buildChapters(); show(keep);
}
export function invalidateStory() { map?.invalidateSize(); }

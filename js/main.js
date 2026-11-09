import { loadData } from './data.js';
import { setLang, onLang, initialLang, getLang, t } from './i18n.js';
import { initMap, refreshMap, invalidate, showSite } from './map-view.js';
import { initStory, refreshStory, invalidateStory } from './story-view.js';
import { initTrials, renderTrials } from './trials-view.js';
import { renderTJ } from './tj-view.js';

const VIEWS = ['map', 'story', 'trials', 'tj'];
const ready = new Set();

function parseHash() {
  const [view, ...params] = location.hash.replace(/^#/, '').split('&');
  const p = Object.fromEntries(params.map(x => x.split('=')));
  return { view: VIEWS.includes(view) ? view : 'map', site: p.site ? +p.site : null };
}

function show(view) {
  VIEWS.forEach(v => {
    document.getElementById('view-' + v).classList.toggle('active', v === view);
    document.querySelector(`[data-mode="${v}"]`).setAttribute('aria-selected', v === view);
  });
  if (!ready.has(view)) {
    ready.add(view);
    if (view === 'story') initStory();
    if (view === 'trials') initTrials(id => { location.hash = `map&site=${id}`; });
    if (view === 'tj') renderTJ();
  }
  if (view === 'map') setTimeout(invalidate, 30);
  if (view === 'story') setTimeout(invalidateStory, 30);
}

function route() {
  const { view, site } = parseHash();
  show(view);
  if (view === 'map' && site) setTimeout(() => showSite(site), 120);
}

function setTheme(th) {
  if (th) document.documentElement.dataset.theme = th; else delete document.documentElement.dataset.theme;
  try { th ? localStorage.setItem('sjm-theme', th) : localStorage.removeItem('sjm-theme'); } catch (e) { /* storage unavailable */ }
}

async function boot() {
  try { const th = localStorage.getItem('sjm-theme'); if (th) setTheme(th); } catch (e) { /* storage unavailable */ }
  setLang(initialLang());
  try {
    await loadData();
  } catch (err) {
    document.getElementById('loadError').hidden = false;
    console.error(err);
    return;
  }
  document.getElementById('loading').remove();
  initMap();
  ready.add('map');
  onLang(() => {
    refreshMap();
    if (ready.has('story')) refreshStory();
    if (ready.has('trials')) renderTrials();
    if (ready.has('tj')) renderTJ();
  });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.mode; }));
  document.getElementById('langBtn').addEventListener('click', () => setLang(getLang() === 'ar' ? 'en' : 'ar'));
  document.getElementById('themeBtn').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(dark ? 'light' : 'dark');
  });
  window.addEventListener('hashchange', route);
  route();
}
boot();
export { t };

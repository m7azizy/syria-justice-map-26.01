import { L, getLang } from './i18n.js';

const FILES = ['facilities', 'graves', 'unmapped-facilities', 'graves-unmapped', 'sources', 'trials', 'stats', 'tj-indicators', 'transfers', 'story', 'timeline'];
export const D = {};

export async function loadData() {
  const res = await Promise.all(FILES.map(f => fetch(`data/${f}.json`).then(r => {
    if (!r.ok) throw new Error(`data/${f}.json: ${r.status}`);
    return r.json();
  })));
  FILES.forEach((f, i) => { D[f.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = res[i]; });
  D.sites = new Map([...D.facilities, ...D.graves.map(g => ({ ...g, agency: 'GRAVE' }))].map(s => [s.id, s]));
  D.trialsBySite = new Map();
  for (const tr of D.trials) for (const id of tr.facilityIds) {
    if (!D.trialsBySite.has(id)) D.trialsBySite.set(id, []);
    D.trialsBySite.get(id).push(tr);
  }
  return D;
}

export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Renders source keys as links (org name, with the title as tooltip)
export function srcLinks(keys, sep = ' · ') {
  // Group links by displayed organisation so one outlet cited twice reads "SJAC 1, 2", not "SJAC · SJAC"
  const groups = new Map();
  for (const k of keys || []) {
    const s = D.sources[k];
    if (!s?.url) { groups.set(k, null); continue; }
    const org = (getLang() === 'ar' && s.orgAr) || s.org;
    if (!groups.has(org)) groups.set(org, []);
    groups.get(org).push(s);
  }
  const a = (s, txt) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(txt)}</a>`;
  return [...groups].map(([org, list]) => !list ? esc(org)
    : list.length === 1 ? a(list[0], org)
    : `${esc(org)} <sup class="num">${list.map((s, i) => a(s, i + 1)).join(',')}</sup>`).join(sep);
}

export const siteName = s => L(s, 'name');
export const dateLabel = d => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  if (!m) return y;
  const date = new Date(Date.UTC(+y, +m - 1, +(day || 1)));
  return date.toLocaleDateString(getLang() === 'ar' ? 'ar-SY-u-nu-latn' : 'en-GB',
    day ? { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' } : { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

// Sanity checks for data/*.json. Usage: node tools/validate-data.js
const fs = require('fs');
const path = require('path');
const load = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));

const facilities = load('facilities.json');
const graves = load('graves.json');
const sources = load('sources.json');
const trials = load('trials.json');
const stats = load('stats.json');
const tj = load('tj-indicators.json');
const transfers = load('transfers.json');
const story = load('story.json');
const timeline = load('timeline.json');

const errors = [];
const err = m => errors.push(m);
const AGENCIES = ['MI', 'AFI', 'GID', 'PSD', 'MoI', 'MP', 'HOSP', 'ARMY'];
const inSyria = (lat, lng) => lat >= 32.3 && lat <= 37.4 && lng >= 35.6 && lng <= 42.5;
const srcOk = (where, keys) => (keys || []).forEach(k => { if (!sources[k]) err(`${where}: unknown source "${k}"`); });

const ids = new Set();
for (const f of facilities) {
  for (const k of ['id', 'nameAr', 'nameEn', 'agency', 'govAr', 'govEn', 'lat', 'lng', 'conf', 'violations', 'caesar', 'yearActive', 'yearClosed', 'detailAr', 'detailEn', 'sources', 'geoSource'])
    if (f[k] === undefined) err(`facility #${f.id}: missing ${k}`);
  if (ids.has(f.id)) err(`facility #${f.id}: duplicate id`);
  ids.add(f.id);
  if (!AGENCIES.includes(f.agency)) err(`facility #${f.id}: unknown agency ${f.agency}`);
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(f.conf)) err(`facility #${f.id}: bad conf`);
  if (!inSyria(f.lat, f.lng)) err(`facility #${f.id}: coordinates outside Syria`);
  if (f.yearActive > f.yearClosed) err(`facility #${f.id}: yearActive after yearClosed`);
  if (f.violations.includes('caesar')) err(`facility #${f.id}: caesar belongs in the caesar flag`);
  if (f.geoSource === 'IIIM' && !f.iiim) err(`facility #${f.id}: IIIM geolocation without iiim block`);
  if (f.geoSource !== 'IIIM' && !f.needsVerification) err(`facility #${f.id}: non-IIIM location must be flagged needsVerification`);
}
for (const g of graves) {
  if (ids.has(g.id)) err(`grave #${g.id}: id clashes with a facility`);
  ids.add(g.id);
  if (!inSyria(g.lat, g.lng)) err(`grave #${g.id}: coordinates outside Syria`);
}
for (const t of trials) {
  for (const k of ['id', 'country', 'jurisdiction', 'status', 'date', 'ar', 'en', 'accused', 'verdictAr', 'verdictEn', 'facilityIds', 'src'])
    if (t[k] === undefined) err(`trial ${t.id}: missing ${k}`);
  // Names of people appear only when tied to an official proceeding with a cited source
  if (t.accused.length && !t.src.length) err(`trial ${t.id}: named accused without a source`);
  t.facilityIds.forEach(id => { if (!ids.has(id)) err(`trial ${t.id}: unknown facility ${id}`); });
  srcOk(`trial ${t.id}`, t.src);
}
for (const s of stats) {
  if (!s.date || !s.src?.length) err(`stat ${s.key}: every figure needs a date and a source`);
  srcOk(`stat ${s.key}`, s.src);
}
for (const p of tj.pillars) for (const i of p.indicators) {
  if (![0, 1, 2, 3].includes(i.score)) err(`indicator ${i.id}: score must be 0–3`);
  if (!i.date || !i.src?.length) err(`indicator ${i.id}: needs date and source`);
  srcOk(`indicator ${i.id}`, i.src);
}
tj.milestones.forEach(m => srcOk(`milestone ${m.date}`, m.src));
for (const e of transfers.edges) {
  if (!ids.has(e.from) || !ids.has(e.to)) err(`transfer ${e.from}->${e.to}: unknown site`);
  srcOk(`transfer ${e.from}->${e.to}`, e.src);
}
for (const c of story) {
  c.highlight.forEach(id => { if (!ids.has(id)) err(`story ${c.id}: unknown site ${id}`); });
  srcOk(`story ${c.id}`, c.src);
}
if (timeline.some(t => !t.ar || !t.en)) err('timeline: missing text');

const unlinked = [...new Set(facilities.flatMap(f => f.sources))].filter(k => !sources[k]);
console.log(`${facilities.length} facilities (${facilities.filter(f => f.geoSource === 'IIIM').length} IIIM-geolocated), ${graves.length} graves, ${Object.keys(sources).length} sources, ${trials.length} trials, ${stats.length} stats, ${tj.pillars.reduce((n, p) => n + p.indicators.length, 0)} TJ indicators, ${transfers.edges.length} transfer paths`);
if (unlinked.length) console.log('Facility sources shown without a link:', unlinked.join(', '));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('OK');

// Generates the open-data downloads in data/open/ from data/*.json.
// Usage: node tools/export-open-data.js   (re-run after any data change)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const load = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const OUT = path.join(ROOT, 'data', 'open');
fs.mkdirSync(OUT, { recursive: true });

const facilities = load('facilities.json');
const graves = load('graves.json');
const trials = load('trials.json');
const sources = load('sources.json');

const cell = v => {
  const s = Array.isArray(v) ? v.join('; ') : v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// UTF-8 BOM so spreadsheet apps open the Arabic text correctly
const csv = (rows, cols) => '﻿' + [cols.map(c => c[0]).join(','), ...rows.map(r => cols.map(c => cell(c[1](r))).join(','))].join('\n') + '\n';
const srcUrls = keys => keys.map(k => sources[k]?.url || k);

const facCols = [
  ['id', f => f.id], ['name_ar', f => f.nameAr], ['name_en', f => f.nameEn], ['agency', f => f.agency],
  ['governorate_ar', f => f.govAr], ['governorate_en', f => f.govEn], ['lat', f => f.lat], ['lng', f => f.lng],
  ['location_confidence', f => f.conf], ['geolocation_source', f => f.geoSource], ['needs_verification', f => !!f.needsVerification],
  ['iiim_name', f => f.iiim?.name], ['iiim_experiences', f => f.iiim?.experiences], ['iiim_torture', f => f.iiim?.torture],
  ['iiim_inhumane', f => f.iiim?.inhumane], ['iiim_parent_unit', f => f.iiim?.parent], ['iiim_category', f => f.iiim?.category],
  ['violations', f => f.violations], ['caesar_linked', f => f.caesar], ['caesar_victims', f => f.caesarVictims],
  ['year_active', f => f.yearActive], ['year_closed', f => f.yearClosed], ['detail_ar', f => f.detailAr], ['detail_en', f => f.detailEn],
  ['sources', f => f.sources], ['source_urls', f => srcUrls(f.sources)],
];
fs.writeFileSync(path.join(OUT, 'facilities.csv'), csv(facilities, facCols));

const trialCols = [
  ['id', t => t.id], ['country', t => t.country], ['city', t => t.city], ['jurisdiction', t => t.jurisdiction], ['status', t => t.status],
  ['start', t => t.start], ['date', t => t.date], ['title_ar', t => t.ar], ['title_en', t => t.en],
  ['accused_en', t => t.accused.map(a => a.en)], ['accused_ar', t => t.accused.map(a => a.ar)],
  ['verdict_ar', t => t.verdictAr], ['verdict_en', t => t.verdictEn], ['facility_ids', t => t.facilityIds], ['source_urls', t => srcUrls(t.src)],
];
fs.writeFileSync(path.join(OUT, 'trials.csv'), csv(trials, trialCols));

const feature = (f, kind) => ({
  type: 'Feature', geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
  properties: { kind, ...Object.fromEntries(Object.entries(f).filter(([k]) => !['lat', 'lng'].includes(k))), source_urls: srcUrls(f.sources) },
});
const geo = {
  type: 'FeatureCollection',
  metadata: { title: 'Syria Justice Map — detention facilities and mass graves (2011–2024)', publisher: 'Caesar Families Association', updated: '2026-11-09',
    note: 'Coordinates may mark the general location of a facility rather than an exact pinpoint (IIIM Annex B, fn. 3). See methodology.html.' },
  features: [...facilities.map(f => feature(f, 'facility')), ...graves.map(g => feature(g, 'mass_grave'))],
};
fs.writeFileSync(path.join(OUT, 'syria-justice-map.geojson'), JSON.stringify(geo) + '\n');
console.log(`wrote ${facilities.length} facilities, ${trials.length} trials, ${geo.features.length} features to data/open/`);

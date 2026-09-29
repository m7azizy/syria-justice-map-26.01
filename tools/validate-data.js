// Sanity checks for the data embedded in syria-justice-map-01-2026.html.
// Usage: node tools/validate-data.js
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'syria-justice-map-01-2026.html'), 'utf8');
const grab = re => eval('(' + html.match(re)[1] + ')');
const facilities = grab(/const facilities = (\[[\s\S]*?\n\]);/);
const SOURCES = grab(/const SOURCES=(\{[\s\S]*?\n\});/);
const trials = grab(/const trials=(\[[\s\S]*?\n\]);/);

const errors = [];
const REQUIRED = ['id', 'nameAr', 'nameEn', 'agency', 'govAr', 'govEn', 'lat', 'lng', 'conf', 'violations', 'caesar', 'yearActive', 'yearClosed', 'detailAr', 'detailEn', 'sources'];
const AGENCIES = ['MI', 'AFI', 'GID', 'PSD', 'MoI', 'MP', 'HOSP', 'GRAVE'];
const ids = new Set();
for (const f of facilities) {
  for (const k of REQUIRED) if (f[k] === undefined) errors.push(`#${f.id}: missing ${k}`);
  if (ids.has(f.id)) errors.push(`#${f.id}: duplicate id`);
  ids.add(f.id);
  if (!AGENCIES.includes(f.agency)) errors.push(`#${f.id}: unknown agency ${f.agency}`);
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(f.conf)) errors.push(`#${f.id}: bad conf ${f.conf}`);
  // Syria bounding box
  if (f.lat < 32.3 || f.lat > 37.4 || f.lng < 35.6 || f.lng > 42.5) errors.push(`#${f.id}: coordinates outside Syria`);
  if (f.yearActive > f.yearClosed) errors.push(`#${f.id}: yearActive after yearClosed`);
  if (f.violations.includes('caesar')) errors.push(`#${f.id}: 'caesar' belongs in the caesar flag, not violations`);
  if (f.caesarVictims && !f.caesar) errors.push(`#${f.id}: caesarVictims without caesar flag`);
}
for (const t of trials) {
  if (!SOURCES[t.src]) errors.push(`trial ${t.en}: unknown source ${t.src}`);
  for (const id of t.facilityIds) if (!ids.has(id)) errors.push(`trial ${t.en}: unknown facility ${id}`);
}
const unlinked = [...new Set(facilities.flatMap(f => f.sources))].filter(k => !SOURCES[k]);

console.log(`${facilities.length} facilities, ${Object.keys(SOURCES).length} sources, ${trials.length} trials`);
if (unlinked.length) console.log('Sources shown without link:', unlinked.join(', '));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('OK');

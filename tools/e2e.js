// End-to-end checks in a real browser.
// Usage: node tools/e2e.js [screenshot-dir]
// Needs Playwright (npm i -g playwright, or set PLAYWRIGHT_MODULE). If the CDNs are unreachable,
// set LIBS_DIR to a folder holding node_modules/leaflet and node_modules/leaflet.markercluster.
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const pw = require(process.env.PLAYWRIGHT_MODULE || (() => {
  try { return require.resolve('playwright'); } catch (e) { return path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'); }
})());
const SHOTS = process.argv[2];
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.csv': 'text/csv', '.geojson': 'application/geo+json' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };

async function open(browser, base, w, h, hash = '') {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  const libs = process.env.LIBS_DIR && path.join(process.env.LIBS_DIR, 'node_modules');
  if (libs) {
    const map = [[/leaflet\.min\.js/, 'leaflet/dist/leaflet.js'], [/leaflet\.min\.css/, 'leaflet/dist/leaflet.css'],
      [/leaflet\.markercluster\.min\.js/, 'leaflet.markercluster/dist/leaflet.markercluster.js'],
      [/MarkerCluster\.Default\.min\.css/, 'leaflet.markercluster/dist/MarkerCluster.Default.css'], [/MarkerCluster\.min\.css/, 'leaflet.markercluster/dist/MarkerCluster.css']];
    await page.route(/cdnjs\.cloudflare\.com/, route => {
      const hit = map.find(([re]) => re.test(route.request().url()));
      return hit ? route.fulfill({ path: path.join(libs, hit[1]) }) : route.abort();
    });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  }
  await page.goto(`${base}/index.html${hash}`);
  await page.waitForSelector('#loading', { state: 'detached', timeout: 15000 });
  await page.waitForTimeout(700);
  return page;
}
const shot = (page, name) => SHOTS && page.screenshot({ path: path.join(SHOTS, name + '.png') });

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const facilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/facilities.json')));
  const graves = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/graves.json')));
  const trials = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/trials.json')));
  const browser = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

  // Desktop, Arabic
  let p = await open(browser, base, 1280, 800);
  const count = () => p.evaluate(() => +document.getElementById('tlCount').textContent.replace(/\D/g, ''));
  ok(await count() === facilities.length + graves.length, `all years shows every site (${facilities.length} + ${graves.length})`);
  await shot(p, 'map-ar-1280');
  await p.click('[data-gov="الرقة"]');
  ok(await count() === facilities.filter(f => f.govEn === 'Raqqa').length + graves.filter(g => g.govEn === 'Raqqa').length, 'Raqqa filter (graves too)');
  await p.click('#resetBtn');
  await p.click('[data-year="2016"]');
  const in2016 = facilities.filter(f => f.yearActive <= 2016 && f.yearClosed >= 2016).length + graves.filter(g => g.yearActive <= 2016).length;
  ok(await count() === in2016, `year 2016 shows ${in2016} sites`);
  await p.click('#allYearsBtn');
  await p.click('[data-tab="layers"]');
  await p.click('[data-layer="transfers"]');
  await p.waitForTimeout(300);
  ok(await p.locator('#map path.flow').count() > 0, 'transfer paths drawn');
  const unsecured = graves.filter(g => !g.protected).length;
  ok(await p.locator('#map path.grave-area').count() === unsecured, `${unsecured} unsecured graves drawn as generalised areas`);
  await p.click('[data-tab="list"]');
  await p.fill('#sbox', 'Palestine');
  ok(/1/.test(await p.textContent('#rcnt')), 'search by English name');
  await p.goto(`${base}/index.html#map&site=71`);
  await p.waitForTimeout(2200);
  const pop = await p.textContent('.leaflet-popup-content').catch(() => '');
  ok(/عاطف نجيب/.test(pop) && pop.includes('هيومن رايتس ووتش'), 'deep link opens Daraa Political Security popup with trial and source');
  await shot(p, 'popup-ar-1280');

  await p.goto(`${base}/index.html#map&site=1`);
  await p.waitForTimeout(2200);
  const pop251 = await p.textContent('.leaflet-popup-content').catch(() => '');
  ok(/المساءلة/.test(pop251), 'Branch 251 popup shows the accountability box');
  ok(pop251.includes('إدارة المخابرات العامة') && !pop251.includes('General Intelligence Directorate'), 'IIIM parent unit is in Arabic in the Arabic popup');
  ok(await p.evaluate(() => [...document.querySelectorAll('.leaflet-popup-content .ind-src, .leaflet-popup-content div')].every(el => {
    const names = [...el.children].filter(c => c.tagName === 'A').map(a => a.textContent);
    return new Set(names).size === names.length;
  })), 'no organisation repeated in a popup source line');
  // Graves follow the governorate filter: Damascus keeps Tadamon, drops the Rif Dimashq graves
  await p.evaluate(() => document.querySelector('#govChips [data-gov="دمشق"]').click()); await p.waitForTimeout(400);
  const gDam = graves.filter(g => g.govAr === 'دمشق').length;
  ok(await p.locator('#map .gmk').count() === gDam, `governorate filter applies to graves (${gDam} in Damascus)`);
  await p.evaluate(() => document.querySelector('#govChips [data-gov="all"]').click()); await p.waitForTimeout(300);
  await p.goto(`${base}/index.html#trials`); await p.waitForTimeout(500);
  ok(await p.locator('.trial-card').count() === trials.length, `${trials.length} trial cards`);
  await p.click('[data-tf="country"][data-tv="AT"]');
  ok(await p.locator('.trial-card').count() === trials.filter(t => t.country === 'AT').length, 'country filter');
  await shot(p, 'trials-ar-1280');
  await p.click('.trial-card [data-site]');
  await p.waitForTimeout(2200);
  ok(p.url().includes('#map&site=87') && /الحلبي/.test(await p.textContent('.leaflet-popup-content').catch(() => '')), 'trial links to its facility on the map');

  await p.goto(`${base}/index.html#tj`); await p.waitForTimeout(500);
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tj-indicators.json')));
  const nInd = tj.pillars.reduce((n, q) => n + q.indicators.length, 0);
  ok(await p.locator('.pillar').count() === tj.pillars.length && await p.locator('.ind').count() === nInd, `${tj.pillars.length} pillars, ${nInd} indicators`);
  const avg = q => q.indicators.reduce((a, i) => a + i.score, 0) / q.indicators.length;
  const expected = Math.round(tj.pillars.reduce((a, q) => a + avg(q) * q.weight, 0) / 4);
  ok(+(await p.textContent('#stjpiValue')) === expected, `STJPI composite shows ${expected}/100`);
  await shot(p, 'tj-ar-1280');

  await p.goto(`${base}/index.html#story`); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('#storyText .chapter[data-i="3"]').scrollIntoView());
  await p.waitForTimeout(2200);
  ok(await p.locator('#storyMap .mk.hl').count() > 0 && await p.locator('#storyMap path.flow').count() > 0, 'story chapter highlights sites and draws paths');
  await shot(p, 'story-ar-1280');

  await p.click('#langBtn'); await p.waitForTimeout(400);
  ok(await p.getAttribute('html', 'dir') === 'ltr' && (await p.textContent('[data-mode="trials"]')).includes('Trials'), 'switches to English');
  await p.goto(`${base}/index.html#map`); await p.waitForTimeout(800);
  await shot(p, 'map-en-1280');
  await p.click('#themeBtn'); await p.waitForTimeout(300);
  await shot(p, 'map-en-dark-1280');
  ok(p.errs.length === 0, 'no page errors on desktop' + (p.errs.length ? ': ' + p.errs.join(' | ') : ''));
  await p.close();

  // Mobile
  p = await open(browser, base, 375, 760);
  ok(await p.evaluate(() => document.getElementById('sidebar').classList.contains('closed')), 'sidebar starts closed on mobile');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow on mobile');
  await shot(p, 'map-ar-375');
  for (const v of ['story', 'trials', 'tj']) {
    await p.goto(`${base}/index.html#${v}`); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no horizontal overflow on mobile (${v})`);
    await shot(p, `${v}-ar-375`);
  }
  ok(p.errs.length === 0, 'no page errors on mobile' + (p.errs.length ? ': ' + p.errs.join(' | ') : ''));
  await p.close();

  const m = await browser.newPage();
  await m.goto(`${base}/syria-justice-map-01-2026.html#trials`);
  await m.waitForURL(/index\.html#trials/);
  ok(true, 'old v1 address redirects and keeps the hash');
  await m.goto(`${base}/methodology.html`); await m.waitForTimeout(500);
  ok(await m.textContent('[data-count="points"]') === String(facilities.length), 'methodology counts filled from data');
  await m.click('#langBtn'); await m.waitForTimeout(200);
  ok(await m.getAttribute('html', 'dir') === 'ltr' && await m.isVisible('[data-lang="en"] h1') && !(await m.isVisible('[data-lang="ar"] h1')), 'methodology switches to a full English version');
  ok(await m.evaluate(() => localStorage.getItem('sjm-lang')) === 'en', 'methodology language is shared with the app');

  await browser.close(); server.close();
  console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
  process.exit(failed ? 1 : 0);
})();

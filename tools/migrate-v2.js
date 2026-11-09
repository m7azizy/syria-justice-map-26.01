// One-off migration to the v2 data layout (November 2026).
// Reads the data embedded in syria-justice-map-01-2026.html plus the extracted
// IIIM Annex B table (data/raw/iiim-annex-b.json) and writes data/*.json.
// Already run; kept for provenance. It needs the v1 single-file map from git history
// (git show caee063:syria-justice-map-01-2026.html > syria-justice-map-01-2026.html).
// Edit data/*.json directly from now on.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'syria-justice-map-01-2026.html'), 'utf8');
const grab = re => eval('(' + html.match(re)[1] + ')');
const facilities = grab(/const facilities = (\[[\s\S]*?\n\]);/);
const SOURCES = grab(/const SOURCES=(\{[\s\S]*?\n\});/);
const tlEvents = grab(/const tlEvents = (\{[\s\S]*?\n\});/);
const annex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw/iiim-annex-b.json'), 'utf8')).rows;

const byId = Object.fromEntries(facilities.map(f => [f.id, f]));
const annexKey = r => r.iiim_name + (r.location ? ` #${r.location}` : '');

// IIIM row -> existing facility id. Rows not listed here become new facilities (NEW below).
const MATCH = {
  'Adra Central Prison': 14, 'Air Force Intelligence Branch Bab Touma': 43, 'Air Force Intelligence Branch Deir-Ezzor': 38,
  'Air Force Intelligence Branch Harasta': 15, 'Air Force Intelligence Branch Homs': 20, 'Air Force Intelligence Facilities Mezzeh Airbase': 9,
  'Air Force Intelligence Information Branch': 44, 'Air Force Intelligence Section Aleppo': 24, 'Air Force Intelligence Section Lattakia': 76,
  'Aleppo Central Prison': 23, 'Al-Hasakah Central Prison': 92, 'Criminal Security Branch Aleppo': 62, 'Criminal Security Branch Damascus': 12,
  'Criminal Security Branch Harasta': 55, 'Daraa Central Prison': 72, 'Deir-Ezzor Air Base': 86, 'First Military Prison': 13,
  'General Intelligence Branch 251 Internal Branch': 1, 'General Intelligence Branch 285 Investigation Branch': 6,
  'General Intelligence Branch 315 Daraa': 70, 'General Intelligence Branch 318 Homs': 56, 'General Intelligence Branch 320 Hama #2': 27,
  'General Intelligence Branch 322 Aleppo': 61, 'General Intelligence Branch 335 Raqqa': 87, 'General Intelligence Branch 327 Deir-Ezzor': 81,
  'General Intelligence Branch 325 Lattakia': 75, 'Hama Central Prison': 28, 'Hanano Prison': 64, 'Harasta Military Hospital': 16,
  'Homs Central Prison': 57, 'Idlib Central Prison': 32, 'Lattakia Civilian Prison #2': 77, 'Military Hospital 601': 11,
  'Military Intelligence Branch 216 Patrols Branch': 41, 'Military Intelligence Branch 219 Hama': 26, 'Military Intelligence Branch 220 Quneitra #2': 42,
  'Military Intelligence Branch 221 Tadmur/Badia': 60, 'Military Intelligence Branch 223 Lattakia': 33, 'Military Intelligence Branch 227 Damascus': 3,
  'Military Intelligence Branch 235 Palestine Branch': 4, 'Military Intelligence Branch 243 Deir-Ezzor': 37,
  'Military Intelligence Branch 248 Investigation Branch': 5, 'Military Intelligence Branch 261 Homs': 17, 'Military Intelligence Branch 265 Suweida': 39,
  'Military Intelligence Section Daraa': 29, 'Military Intelligence Branch 271 Idlib': 31, 'Military Intelligence Branch 290 Aleppo': 22,
  'Military Intelligence Branch 291': 7, 'Military Intelligence Unit 215 Raids/Assaults': 2, 'Military Police Branch Aleppo': 63,
  'Military Police Branch Hama': 67, 'Military Police Facilities al- Qaboun, Damascus': 45, 'Military Police Qatana #2': 49, 'Nairab Air Base': 65,
  'Police Station Kafr Susah': 46, 'Political Security Branch Damascus': 8, 'Political Security Branch Daraa': 71,
  'Political Security Branch Deir- Ezzor': 82, 'Political Security Branch Hama': 68, 'Political Security Department Investigation Branch': 48,
  'Raqqa Central Prison': 90, 'Rukn al-Din Police Station': 47, 'Second Military Prison': 18, 'Suweida Central Prison': 40,
  'Tartus Central Prison': 36, 'Third Military Prison': 19, 'Tishreen Military Hospital': 10,
};

const G = {
  Damascus: ['دمشق', 'Damascus'], Rif: ['ريف دمشق', 'Rif Dimashq'], Homs: ['حمص', 'Homs'], Aleppo: ['حلب', 'Aleppo'],
  Hama: ['حماة', 'Hama'], Daraa: ['درعا', 'Daraa'], Idlib: ['إدلب', 'Idlib'], Lattakia: ['اللاذقية', 'Lattakia'],
  Tartus: ['طرطوس', 'Tartus'], DeZ: ['دير الزور', 'Deir ez-Zor'], Raqqa: ['الرقة', 'Raqqa'],
};
// New IIIM facilities: [agency, governorate, Arabic name, English name, extra]
const NEW = {
  'Air Force Command': ['ARMY', 'Damascus', 'قيادة القوى الجوية والدفاع الجوي (آمرية الطيران)', 'Air Force and Air Defence Command (Amiriya al-Tayran)'],
  'Air Force Intelligence Section Daraa': ['AFI', 'Daraa', 'المخابرات الجوية — قسم درعا', 'AFI Section — Daraa'],
  'Air Force Intelligence Section Hama': ['AFI', 'Hama', 'المخابرات الجوية — قسم حماة', 'AFI Section — Hama'],
  'Air Force Intelligence Section Raqqa': ['AFI', 'Raqqa', 'المخابرات الجوية — قسم الرقة', 'AFI Section — Raqqa'],
  'Al-Mojtahed Hospital': ['HOSP', 'Damascus', 'مشفى المجتهد (مشفى دمشق)', 'Al-Mojtahed Hospital (Damascus Hospital)'],
  'Counter Narcotics Branch Deir- Ezzor': ['MoI', 'DeZ', 'فرع مكافحة المخدرات — دير الزور', 'Counter Narcotics Branch — Deir ez-Zor'],
  'Criminal Security Branch Daraa': ['MoI', 'Daraa', 'فرع الأمن الجنائي — درعا', 'Criminal Security — Daraa'],
  'Criminal Security Branch Deir- Ezzor': ['MoI', 'DeZ', 'فرع الأمن الجنائي — دير الزور', 'Criminal Security — Deir ez-Zor'],
  'Criminal Security Branch Hama': ['MoI', 'Hama', 'فرع الأمن الجنائي — حماة', 'Criminal Security — Hama'],
  'Criminal Security Branch Lattakia': ['MoI', 'Lattakia', 'فرع الأمن الجنائي — اللاذقية', 'Criminal Security — Lattakia'],
  'Criminal Security Branch Raqqa': ['MoI', 'Raqqa', 'فرع الأمن الجنائي — الرقة', 'Criminal Security — Raqqa'],
  'Deir-Ezzor Central Prison': ['MoI', 'DeZ', 'سجن دير الزور المركزي', 'Deir ez-Zor Central Prison'],
  'Deir-Ezzor Military Hospital': ['HOSP', 'DeZ', 'المشفى العسكري — دير الزور', 'Deir ez-Zor Military Hospital'],
  'General Intelligence Branch 275 Administrative Branch': ['GID', 'Damascus', 'فرع 275 — الفرع الإداري (المخابرات العامة)', 'GID Branch 275 (Administrative)'],
  'General Intelligence Branch 279 External Branch': ['GID', 'Damascus', 'فرع 279 — الفرع الخارجي (المخابرات العامة)', 'GID Branch 279 (External)'],
  'General Intelligence Branch 295 Raids Branch': ['GID', 'Rif', 'فرع 295 — فرع المداهمة (المخابرات العامة)', 'GID Branch 295 (Raids)'],
  'Lattakia Civilian Prison #1': ['MoI', 'Lattakia', 'سجن اللاذقية المركزي — الموقع الأول', 'Lattakia Central Prison — Location 1'],
  'Military Intelligence Branch 220 Quneitra #1': ['MI', 'Rif', 'فرع 220 — سعسع (الموقع الأول)', "MI Branch 220 (Sa'sa) — Location 1"],
  'Military Intelligence Branch 293 Officers’ Affairs Branch': ['MI', 'Damascus', 'فرع 293 — شؤون الضباط', 'MI Branch 293 (Officers’ Affairs)'],
  'Raqqa Detachment, Military Intelligence Branch 243 Deir- Ezzor': ['MI', 'Raqqa', 'مفرزة الرقة — الفرع 243', 'Raqqa Detachment — MI Branch 243'],
  'Military Police Branch Deir-Ezzor': ['MP', 'DeZ', 'الشرطة العسكرية — دير الزور', 'Military Police — Deir ez-Zor'],
  'Military Police Branch Homs': ['MP', 'Homs', 'الشرطة العسكرية — حمص', 'Military Police — Homs'],
  'Military Police Branch Idlib': ['MP', 'Idlib', 'الشرطة العسكرية — إدلب', 'Military Police — Idlib'],
  'Military Police Branch Raqqa': ['MP', 'Raqqa', 'الشرطة العسكرية — الرقة', 'Military Police — Raqqa'],
  'Military Police Branch Tartus': ['MP', 'Tartus', 'الشرطة العسكرية — طرطوس', 'Military Police — Tartus'],
  'Military Police Qatana #1': ['MP', 'Rif', 'الشرطة العسكرية — قطنا (الموقع الأول)', 'Military Police — Qatana, Location 1'],
  'Political Security Branch Aleppo': ['PSD', 'Aleppo', 'فرع الأمن السياسي — حلب', 'Political Security — Aleppo'],
  'Political Security Branch Homs': ['PSD', 'Homs', 'فرع الأمن السياسي — حمص', 'Political Security — Homs'],
  'Political Security Branch Lattakia': ['PSD', 'Lattakia', 'فرع الأمن السياسي — اللاذقية', 'Political Security — Lattakia'],
  'Section 40, General Intelligence Branch 251 Internal Branch': ['GID', 'Damascus', 'القسم 40 — فرع 251 (فرع الأربعين)', 'Section 40 — GID Branch 251 (al-Arbaeen)'],
};
// Areas that left regime control: last year a facility there could operate.
const LOST = { Raqqa: 2013, Idlib: 2015 };

const iiimBlock = r => ({
  name: r.iiim_name, location: r.location, conf: r.conf, geoSources: r.sources,
  experiences: r.experiences, torture: r.torture, inhumane: r.inhumane, parent: r.parent, category: r.category,
});

const out = [];
const usedIds = new Set();
let nextId = 100;
for (const r of annex) {
  const key = annexKey(r);
  const id = MATCH[key] ?? MATCH[r.iiim_name];
  if (id && !(r.location && !(key in MATCH))) {
    const f = { ...byId[id] };
    usedIds.add(id);
    f.lat = r.lat; f.lng = r.lng; f.conf = r.conf; f.geoSource = 'IIIM';
    f.iiim = iiimBlock(r);
    delete f.casesIIIM;
    out.push(f);
    continue;
  }
  const n = NEW[key] || NEW[r.iiim_name];
  if (!n) throw new Error('Unmapped IIIM row: ' + key);
  const [agency, g, nameAr, nameEn] = n;
  const tortured = (r.torture || 0) > 0;
  out.push({
    id: nextId++, nameAr, nameEn, agency, govAr: G[g][0], govEn: G[g][1], lat: r.lat, lng: r.lng,
    conf: r.conf, geoSource: 'IIIM', iiim: iiimBlock(r),
    violations: tortured ? ['torture'] : [], caesar: false,
    yearActive: 2011, yearClosed: LOST[g] || 2024,
    detailAr: r.experiences
      ? `منشأة حدّدتها الآلية الدولية (IIIM): ${r.experiences} تجربة احتجاز موثقة بشهادات، منها ${r.torture} حالة تعذيب أو سوء معاملة و${r.inhumane} حالة ظروف احتجاز لاإنسانية.`
      : 'منشأة حدّدتها الآلية الدولية (IIIM) ووثّقت موقعها، دون شهادات تفصيلية ضمن عيّنة التحليل.',
    detailEn: r.experiences
      ? `Facility identified by IIIM: ${r.experiences} documented detention experiences, including ${r.torture} of torture/ill-treatment and ${r.inhumane} of inhumane conditions.`
      : 'Facility identified and geolocated by IIIM, without detailed testimony in its analysed sample.',
    sources: ['IIIM'],
  });
}

// Fixes and notes on specific facilities ------------------------------------------------
const F = id => out.find(f => f.id === id);
F(18).nameAr = 'سجن تدمر العسكري (السجن العسكري الثاني)';
F(18).nameEn = 'Tadmur Military Prison (Second Military Prison)';
F(13).nameAr = 'سجن صيدنايا العسكري (السجن العسكري الأول)';
F(13).nameEn = 'Saydnaya Military Prison (First Military Prison)';
F(42).yearActive = 2013;
F(27).coordNote = { ar: 'الإحداثيات للموقع بعد 2012 حسب IIIM؛ الموقع السابق غير محدد', en: 'Coordinates are the post-2012 location per IIIM; the earlier site is not identified' };
F(42).nameAr = 'فرع 220 — سعسع (الموقع الثاني)';
F(42).nameEn = "MI Branch 220 (Sa'sa) — Location 2";
const relocated = (newName, oldId, ar, en) => {
  const n = out.find(f => f.nameEn === newName);
  n.relocation = { group: oldId, ar, en };
  F(oldId).relocation = { group: oldId, ar, en };
};
relocated("MI Branch 220 (Sa'sa) — Location 1", 42, 'نُقل الفرع إلى موقع ثانٍ عام 2013 (IIIM).', 'Branch relocated to a second site in 2013 (IIIM).');
out.find(f => f.nameEn === "MI Branch 220 (Sa'sa) — Location 1").yearClosed = 2013;
relocated('Lattakia Central Prison — Location 1', 77, 'للسجن موقعان خلال الفترة؛ تاريخ الانتقال غير محدد (IIIM).', 'Two locations during the period; relocation date not specified (IIIM).');
relocated('Military Police — Qatana, Location 1', 49, 'للمنشأة موقعان خلال الفترة؛ تاريخ الانتقال غير محدد (IIIM).', 'Two locations during the period; relocation date not specified (IIIM).');
// Hanano and Nairab are army/air-force units in IIIM's categorisation
F(64).agency = 'ARMY';
F(65).agency = 'ARMY';
const s40 = out.find(f => f.nameEn.startsWith('Section 40'));
s40.detailAr = 'القسم 40 التابع لفرع 251. أدانت محكمة كوبلنز إياد الغريب (فبراير 2021، 4.5 سنوات) بالمساعدة في اعتقال متظاهرين ونقلهم إلى الفرع 251. ' + s40.detailAr;
s40.detailEn = 'Section 40, subordinate to Branch 251. Koblenz court convicted Eyad al-Gharib (Feb 2021, 4.5 years) for helping arrest protesters and transfer them to Branch 251. ' + s40.detailEn;
s40.sources.push('Koblenz Court');
s40.violations = ['torture', 'disappear'];
F(1).detailAr = 'أدين رئيس قسم التحقيق فيه أنور رسلان في كوبلنز (يناير 2022، مؤبد) بالمشاركة في 4,000 حالة تعذيب و27 جريمة قتل.';
F(1).detailEn = 'Head of investigations Anwar Raslan convicted in Koblenz (Jan 2022, life) as accomplice to 4,000 cases of torture and 27 murders.';
F(87).detailAr = 'فرع المخابرات العامة في الرقة (سقط 2013). رئيسه خالد الحلبي (2011–2013) أدانته محكمة في فيينا بالتعذيب (يوليو 2026، 8 سنوات).';
F(87).detailEn = 'GID branch in Raqqa (fell 2013). Its head Khaled al-Halabi (2011–2013) was convicted of torture by a Vienna court (July 2026, 8 years).';
F(87).sources.push('Halabi Vienna');
F(4).detailAr = 'من أكثر الفروع رهبةً، و98 تجربة احتجاز موثقة لدى IIIM هي الأعلى بين أفرع المخابرات. طوابق تحت الأرض للتعذيب. 128 ضحية في صور قيصر. تُركت ملفات المعتقلين مبعثرة فيه بعد سقوط النظام.';
F(4).detailEn = 'One of the most feared branches; its 98 IIIM-documented detention experiences are the highest of any intelligence branch. Underground torture cells. 128 Caesar victims. Detainee files were left scattered inside after the regime fell.';

// Facilities kept from v1 that IIIM does not geolocate
for (const id of [58, 73, 91, 93]) {
  const f = { ...byId[id] };
  f.casesIIIM && (f.iiim = { experiences: f.casesIIIM, note: 'listed in IIIM facility table without coordinates' });
  delete f.casesIIIM;
  f.geoSource = 'other';
  f.conf = 'LOW';
  f.needsVerification = true;
  f.coordNote = { ar: 'إحداثيات تقريبية من مصادر مفتوحة؛ لم تحدّد IIIM موقع هذه المنشأة', en: 'Approximate open-source coordinates; IIIM did not geolocate this facility' };
  if (id === 58) { f.sources = ['COI']; delete f.iiim; }
  out.push(f);
  usedIds.add(id);
}
// MI Branch 256 (id 35) carried Tartus Central Prison's coordinates: it moves to the unmapped list.
usedIds.add(35);

const graveIds = [50, 51, 52, 53];
const leftover = facilities.filter(f => !usedIds.has(f.id) && !graveIds.includes(f.id));
if (leftover.length) throw new Error('Unhandled facilities: ' + leftover.map(f => f.id));

// Facilities in IIIM's names table without coordinates (shown as a list, not on the map)
const unmapped = [
  ['12th Armoured Brigade', 'اللواء 12 دبابات', 2], ['3rd Armoured Division', 'الفرقة الثالثة دبابات', 2], ['4th Armoured Division', 'الفرقة الرابعة دبابات', 7],
  ['52nd Mechanised Brigade', 'اللواء 52 ميكا', null], ['9th Armoured Division', 'الفرقة التاسعة دبابات', 2],
  ['Air Force Intelligence Directorate (HQ)', 'إدارة المخابرات الجوية', 2], ['AFI Investigation Branch (Mezzeh airbase)', 'فرع التحقيق — المخابرات الجوية (مطار المزة)', 15],
  ['AFI Special Tasks Branch (Mezzeh airbase)', 'فرع المهام الخاصة — المخابرات الجوية (مطار المزة)', 2], ['AFI al-Tabqa Section', 'المخابرات الجوية — قسم الطبقة', 1],
  ['Criminal Security Directorate', 'إدارة الأمن الجنائي', 2], ['GID Branch 331 — Idlib', 'فرع 331 — إدلب (المخابرات العامة)', 3],
  ['MI Branch 211 (Signals)', 'فرع 211 — الإشارة', 1], ['MI al-Suqaylabiyah Detachment (Branch 219)', 'مفرزة السقيلبية — الفرع 219', 4],
  ['MI Branch 222 — Qamishli', 'فرع 222 — القامشلي', 1], ['MI al-Thawrah Detachment (Branch 243)', 'مفرزة الثورة — الفرع 243', 1],
  ['MI Branch 256 — Tartus', 'فرع 256 — طرطوس', 3], ['Military Police — Damascus', 'الشرطة العسكرية — دمشق', 24], ['Military Police — Daraa', 'الشرطة العسكرية — درعا', 2],
  ['Military Police — Lattakia', 'الشرطة العسكرية — اللاذقية', 4], ['Military Police — Qamishli', 'الشرطة العسكرية — القامشلي', 1],
  ['Political Security — Raqqa', 'الأمن السياسي — الرقة', null], ['Political Security — Tartus', 'الأمن السياسي — طرطوس', 1],
].map(([en, ar, exp]) => ({ nameEn: en, nameAr: ar, experiences: exp, source: 'IIIM' }));

// Mass graves --------------------------------------------------------------------------
const graves = graveIds.map(id => {
  const f = byId[id];
  return {
    id, nameAr: f.nameAr, nameEn: f.nameEn, govAr: f.govAr, govEn: f.govEn, lat: f.lat, lng: f.lng,
    coordPrecision: 'approximate', yearActive: f.yearActive, yearClosed: 2026,
    status: { 50: 'relocated', 51: 'suspected', 52: 'documented', 53: 'secured' }[id],
    detailAr: f.detailAr, detailEn: f.detailEn, sources: f.sources,
    ...(f.coordNote ? { coordNote: f.coordNote } : {}),
  };
});
graves.find(g => g.id === 52).status = 'exhumation';

const timeline = Object.entries(tlEvents).map(([year, e]) => ({ year: +year, ar: e.ar, en: e.en }));

out.sort((a, b) => a.id - b.id);
const write = (name, data) => fs.writeFileSync(path.join(ROOT, 'data', name), JSON.stringify(data, null, 1) + '\n');
write('facilities.json', out);
write('unmapped-facilities.json', unmapped);
write('graves.json', graves);
write('timeline.json', timeline);
write('sources.json', SOURCES);
console.log(`facilities ${out.length} (IIIM-geolocated ${out.filter(f => f.geoSource === 'IIIM').length}), unmapped ${unmapped.length}, graves ${graves.length}`);

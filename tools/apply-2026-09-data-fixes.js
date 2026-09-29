// One-off migration: applies the September 2026 research corrections to the
// `facilities` array in syria-justice-map-01-2026.html (see docs/research-2026-09.md).
// Each facility sits on its own line, so we rewrite matching lines in place and
// keep the section comments intact.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'syria-justice-map-01-2026.html');
let html = fs.readFileSync(FILE, 'utf8');

const ser = o => JSON.stringify(o).replace(/"(\w+)":/g, '$1:');

const patches = {
  1: f => ({ ...f,
    detailAr: 'أدين رئيس قسم التحقيق فيه أنور رسلان في كوبلنز (يناير 2022، مؤبد) بالمشاركة في 4,000 حالة تعذيب و27 جريمة قتل. القسم 40 التابع له: إدانة إياد الغريب (فبراير 2021، 4.5 سنوات).',
    detailEn: 'Head of investigations Anwar Raslan convicted in Koblenz (Jan 2022, life) as accomplice to 4,000 cases of torture and 27 murders. Subordinate Section 40: Eyad al-Gharib convicted (Feb 2021, 4.5 years).',
    sources: ['IIIM', 'HRW', 'ECCHR', 'Koblenz Court'] }),
  2: f => ({ ...f, caesarVictims: 3556,
    detailAr: 'أكثر فروع المخابرات العسكرية دموية ("فرع الموت"). 3,556 ضحية في صور قيصر وفق تصنيف رابطة عائلات المعتقلين والمفقودين. الفرعان 215 و227 وحدهما يمثلان أكثر من 80% من الجثث.',
    detailEn: 'Most lethal MI branch ("Branch of Death"). 3,556 victims in the Caesar photos per SAFMCD breakdown. Branches 215 and 227 alone account for over 80% of bodies.',
    sources: [...f.sources, 'SAFMCD'] }),
  3: f => ({ ...f, caesarVictims: 2047,
    detailAr: 'ثاني أكبر مصدر في صور قيصر: 2,047 ضحية وفق رابطة عائلات المعتقلين والمفقودين.',
    detailEn: 'Second largest Caesar source: 2,047 victims per SAFMCD.',
    sources: [...f.sources, 'SAFMCD'] }),
  4: f => ({ ...f, caesarVictims: 128,
    detailAr: 'من أكثر الفروع رهبةً — 98 حالة موثقة لدى IIIM. طوابق تحت الأرض للتعذيب. 128 ضحية في صور قيصر. شهادات عنه أمام محكمة كوبلنز في محاكمة اليرموك (منذ نوفمبر 2025).',
    detailEn: 'One of the most feared branches — 98 IIIM cases. Underground torture cells. 128 Caesar victims. Testimony about it before Koblenz court in the Yarmouk trial (since Nov 2025).',
    sources: [...f.sources, 'SAFMCD', 'SJAC Yarmouk'] }),
  41: f => ({ ...f, caesarVictims: 297,
    detailAr: 'فرع الدوريات. 297 ضحية في صور قيصر وفق رابطة عائلات المعتقلين والمفقودين.',
    detailEn: 'Patrols Branch. 297 Caesar victims per SAFMCD.',
    sources: [...f.sources, 'SAFMCD'] }),
  9: f => ({ ...f,
    nameAr: 'المخابرات الجوية — سجن مطار المزة العسكري',
    nameEn: 'AFI Investigation Branch — Mezzeh Military Airport',
    detailAr: 'فرع التحقيق وسجن مطار المزة. وثّق مركز العدالة والمساءلة أكثر من 1,150 وفاة ومقبرتين جماعيتين مشتبهاً بهما داخل المطار، وحمتهما الهيئة الوطنية للمفقودين (سبتمبر 2026). محكمة باريس حكمت غيابياً بالمؤبد على جميل حسن وعبد السلام محمود في قضية الدباغ (مايو 2024)، ولائحة اتهام أمريكية بحقهما. تنسب رابطة عائلات المعتقلين نحو 350 ضحية في صور قيصر إلى المخابرات الجوية.',
    detailEn: 'Mezzeh airport investigation branch and prison. SJAC documented 1,150+ deaths and two suspected mass graves inside the airport, protected by the National Commission for the Missing (Sep 2026). Paris court sentenced Jamil Hassan and Abdel Salam Mahmoud to life in absentia in the Dabbagh case (May 2024); US indictment against both. SAFMCD attributes ~350 Caesar victims to AFI.',
    sources: ['IIIM', 'HRW', 'SJAC Mezzeh', 'Dabbagh Paris', 'US DOJ', 'Enab Baladi Mezzeh'] }),
  10: f => ({ ...f, yearClosed: 2018,
    detailAr: 'أحد المستشفيين الرئيسيين لتسجيل جثث قيصر (2011–2013). شهادة "حفّار القبور": نُقلت منه الجثث بشاحنات مبرّدة إلى نجها والقطيفة حتى 2018.',
    detailEn: 'One of the two main hospitals for Caesar registrations (2011–2013). "Gravedigger" testimony: bodies trucked in refrigerated lorries to Najha and Qutayfah until 2018.',
    sources: [...f.sources, 'MEE'] }),
  11: f => ({ ...f, yearClosed: 2018,
    detailAr: 'المستشفى الرئيسي لتسجيل الجثث في ملف قيصر (2011–2013). مرتبط بمحاكمة د. علاء م. (مؤبد، فرانكفورت 16 يونيو 2025). استمر نقل الجثث منه إلى المقابر حتى 2018.',
    detailEn: 'Main hospital for Caesar registrations (2011–2013). Linked to Dr. Alaa M. (life, Frankfurt 16 June 2025). Bodies continued to be trucked to graves until 2018.',
    sources: [...f.sources, 'MEE'] }),
  16: f => ({ ...f, yearClosed: 2018,
    detailAr: 'استُخدم لتسجيل جثث ضحايا فرع 251. من المستشفيات التي نُقلت منها الجثث إلى نجها والقطيفة حتى 2018.',
    detailEn: 'Used to register Branch 251 victims. One of the hospitals from which bodies were trucked to Najha and Qutayfah until 2018.',
    sources: [...f.sources, 'MEE'] }),
  17: f => ({ ...f,
    detailAr: 'من أسوأ مراكز الاحتجاز. خلايا 1×1.5م تحوي 5 محتجزين. عمل فيه الطبيب علاء م. إلى جانب المستشفى العسكري 608 في حمص (حكم مؤبد، فرانكفورت يونيو 2025).',
    detailEn: 'One of the worst sites. Cells 1×1.5m holding 5 detainees. Dr. Alaa M. worked here and at Military Hospital 608 in Homs (life sentence, Frankfurt June 2025).',
    sources: [...f.sources, 'Frankfurt Court'] }),
  37: f => ({ ...f, yearClosed: 2024, needsVerification: true,
    detailAr: 'احتفظ النظام بنصف مدينة دير الزور طوال حصار داعش (2014–2017)، فاستمرت فروعه الأمنية فيه حتى 2024. يحتاج موقع الفرع الدقيق ضمن الأحياء المحاصرة إلى تحقق.',
    detailEn: 'The regime held half of Deir ez-Zor city throughout the ISIS siege (2014–2017), so its security branches kept operating until 2024. Exact branch location within the besieged districts needs verification.',
    sources: [...f.sources, 'Deir ez-Zor siege'] }),
  38: f => ({ ...f, yearClosed: 2024, needsVerification: true,
    detailAr: 'فرع المنطقة الشرقية للمخابرات الجوية. بقي في القسم الخاضع للنظام خلال الحصار (2014–2017).',
    detailEn: 'AFI Eastern Region branch. Remained in the regime-held part of the city during the siege (2014–2017).',
    sources: [...f.sources, 'Deir ez-Zor siege'] }),
  81: f => ({ ...f, yearClosed: 2024, needsVerification: true,
    detailAr: 'فرع المخابرات العامة (أمن الدولة) في دير الزور. استمر خلال الحصار (2014–2017) بقيادة دعاس حسن علي.',
    detailEn: 'GID (State Security) branch in Deir ez-Zor. Kept operating through the siege (2014–2017) under Daas Hassan Ali.',
    sources: [...f.sources, 'Deir ez-Zor siege'] }),
  82: f => ({ ...f, yearClosed: 2024, needsVerification: true,
    detailAr: 'فرع الأمن السياسي في دير الزور. بقي في القسم الخاضع للنظام خلال الحصار (2014–2017).',
    detailEn: 'Political Security branch in Deir ez-Zor. Remained in the regime-held part of the city during the siege (2014–2017).',
    sources: [...f.sources, 'Deir ez-Zor siege'] }),
  86: f => ({ ...f, yearClosed: 2024,
    detailAr: 'مطار دير الزور العسكري. صمد تحت حصار داعش (2014–2017) وبقي بيد النظام حتى 2024.',
    detailEn: 'Deir ez-Zor military airbase. Held out under the ISIS siege (2014–2017) and stayed in regime hands until 2024.',
    sources: [...f.sources, 'Deir ez-Zor siege'] }),
  87: f => ({ ...f, govAr: 'الرقة', govEn: 'Raqqa' }),
  90: f => ({ ...f, govAr: 'الرقة', govEn: 'Raqqa' }),
  91: f => ({ ...f, yearClosed: 2024,
    detailAr: 'فرع المخابرات العسكرية في القامشلي، ضمن "المربع الأمني" الذي احتفظ به النظام وسط مناطق قسد حتى ديسمبر 2024.',
    detailEn: 'MI Branch 222 in Qamishli, inside the regime "security square" held amid SDF-controlled areas until December 2024.',
    sources: [...f.sources, 'Enab Baladi Qamishli'] }),
  50: f => ({ ...f, yearClosed: 2026,
    detailAr: 'من أكبر المقابر الجماعية. تقدّر منظمة فريق الطوارئ السوري (SETF) وجود 100,000 جثة على الأقل. نُقل جزء كبير منها سراً إلى الضمير في "عملية نقل التراب" (2019–2021) وفق تحقيق رويترز.',
    detailEn: 'One of the largest mass graves. Syrian Emergency Task Force (SETF) estimates at least 100,000 bodies. Large parts secretly moved to Dhumair in "Operation Move Earth" (2019–2021) per Reuters.',
    sources: ['SETF', 'Reuters', 'Stephen Rapp'] }),
  51: f => ({ ...f, yearClosed: 2026,
    detailAr: 'مقبرة جنوب دمشق — عشرات الآلاف من الجثث في خنادق بعمق 3 أمتار وطول يصل إلى 90 متراً. نُقلت إليها الجثث من مستشفيات تشرين والمزة وحرستا حتى 2018.',
    detailEn: 'Mass grave south of Damascus — tens of thousands of bodies in trenches 3m deep and up to 90m long. Bodies trucked from Tishreen, Mezzeh and Harasta hospitals until 2018.',
    sources: [...f.sources, 'MEE'] }),
  52: f => ({ ...f, yearClosed: 2026,
    detailAr: 'مجزرة 16 أبريل 2013. يُظهر الفيديو المسرّب إعدام 41 شخصاً على الأقل، وتقدّر مصادر أخرى عدد الضحايا بنحو 288. زارت هيومن رايتس ووتش الموقع في ديسمبر 2024 ووجدت رفاتاً بشرية.',
    detailEn: 'April 16, 2013 massacre. Leaked video shows the execution of at least 41 people; other sources estimate around 288 victims. HRW visited in December 2024 and found human remains.',
    sources: ['Ugur Umit Ungor', 'HRW Tadamon', 'COI'] }),
  53: f => ({ ...f, yearClosed: 2026,
    coordNote: { ar: 'رويترز لم تنشر الموقع الدقيق؛ الإحداثيات تقديرية لمنطقة الضمير', en: 'Reuters withheld the exact site; coordinates approximate the Dhumair area' },
    detailAr: 'موقع إعادة دفن الجثث المنقولة من القطيفة (2019–2021): 34 خندقاً على الأقل بطول كيلومترين. أمّنته الحكومة وفتحت تحقيقاً جنائياً (ديسمبر 2025)، والنبش مقرر في 2027.',
    detailEn: 'Reburial site for bodies moved from al-Qutayfah (2019–2021): at least 34 trenches, 2 km long. Secured by the government with a criminal investigation opened (Dec 2025); exhumation scheduled for 2027.',
    sources: ['Reuters', 'Reuters Dhumair 2025'] }),
  71: f => ({ ...f,
    detailAr: 'أول مراكز احتجاز متظاهري درعا مارس 2011. رئيسه عاطف نجيب أُدين في أول محاكمة سورية لجرائم النظام (دمشق، 11 أغسطس 2026) وحُكم عليه بالإعدام مع سبعة آخرين غيابياً منهم بشار الأسد.',
    detailEn: 'First detention center for Daraa protesters, March 2011. Its head Atef Najib was convicted in Syria’s first trial of regime crimes (Damascus, 11 Aug 2026) and sentenced to death alongside seven others in absentia, including Bashar al-Assad.',
    sources: [...f.sources, 'Najib Damascus'] }),
};

const NEW = [
  { id: 93, nameAr: 'المخابرات الجوية — سجن مطار حماة العسكري', nameEn: 'AFI — Hama Military Airport Prison', agency: 'AFI',
    govAr: 'حماة', govEn: 'Hama', lat: 35.1183, lng: 36.7111, conf: 'LOW', needsVerification: true,
    violations: ['torture', 'death', 'disappear'], caesar: false, casesIIIM: 0, yearActive: 2011, yearClosed: 2024,
    detailAr: 'حوّلت المخابرات الجوية حظائر المطار إلى سجن مكتظ بالمحتجزين. الإحداثيات لموقع المطار العام؛ لم تتسنَّ مطابقتها بملحق IIIM بعد.',
    detailEn: 'Air Force Intelligence turned airport hangars into an overcrowded prison. Coordinates mark the airbase; not yet matched against IIIM Annex B.',
    sources: ['Naharnet Hama'] },
];

let changed = 0;
html = html.replace(/^(\s*)\{id:(\d+),.*\},?\s*$/gm, (line, indent, id) => {
  const p = patches[+id];
  if (!p) return line;
  const obj = eval('(' + line.trim().replace(/,$/, '') + ')');
  changed++;
  return indent + ser(p(obj)) + ',';
});
if (changed !== Object.keys(patches).length) throw new Error(`patched ${changed}/${Object.keys(patches).length}`);

// Caesar is a body of evidence, not a violation type: flag lives in `caesar`.
html = html.replace(/violations:\[([^\]]*)\]/g, (m, list) =>
  'violations:[' + list.split(',').filter(v => v.trim() !== '"caesar"').join(',') + ']');

// Append new sites before the closing of the array.
html = html.replace(/(\n\];\n\n\/\/ TIMELINE EVENTS)/,
  '\n  // ADDED 2026-09 (see docs/research-2026-09.md)\n' + NEW.map(n => '  ' + ser(n) + ',').join('\n') + '$1');

fs.writeFileSync(FILE, html);
console.log('patched', changed, 'facilities; added', NEW.length);

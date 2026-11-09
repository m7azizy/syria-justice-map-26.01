// UI strings. Data text lives in data/*.json with ar/en pairs.
const STR = {
  ar: {
    title: 'خريطة العدالة في سوريا', subtitle: 'Syria Justice Map · رابطة عائلات قيصر',
    m_map: 'الخريطة', m_story: 'مسار الضحية', m_trials: 'المحاكمات', m_tj: 'العدالة الانتقالية', methodology: 'المنهجية والبيانات',
    t_filters: 'فلاتر', t_layers: 'طبقات', t_stats: 'إحصاء', t_list: 'قائمة', t_legend: 'مفتاح',
    agency: 'الجهاز', governorate: 'المحافظة', violation: 'نوع الانتهاك', confidence: 'دقة الموقع (IIIM)', all: 'الكل',
    torture: 'تعذيب', disappear: 'اختفاء قسري', death: 'وفاة', caesar: 'ملف قيصر', high: 'عالية', medium: 'متوسطة', low: 'منخفضة',
    reset: '↺ إعادة تعيين', l_facilities: 'مراكز الاحتجاز', l_graves: 'المقابر الجماعية', l_transfers: 'مسارات النقل الموثقة', l_cluster: 'تجميع النقاط المتقاربة',
    l_size: 'حجم الدائرة حسب عدد الشهادات',
    shown: 'موقع معروض', iiimExp: 'تجربة احتجاز موثقة (IIIM)', caesarSites: 'موقع مرتبط بقيصر', govs: 'محافظة',
    byAgency: 'المواقع حسب الجهاز', byViolation: 'أنواع الانتهاكات', ref: 'أرقام عامة مرجعية',
    search: 'ابحث عن فرع أو مدينة…', sites: 'موقع', unmappedT: 'منشآت حدّدتها IIIM دون إحداثيات',
    legendAg: 'الأجهزة', legendSym: 'الرموز', symCaesar: 'حلقة ذهبية: مرتبط بصور قيصر', symVerify: 'حد متقطع: الموقع بحاجة إلى تحقق', symGrave: 'معيّن: مقبرة جماعية', symTrial: 'نقطة نابضة: موقع مرتبط بمحاكمة',
    allYears: 'كل السنوات', allSitesEv: 'كل المواقع الموثقة 2011–2026', activeYear: 'موقع نشط في السنة',
    p_gov: 'المحافظة', p_period: 'فترة النشاط', p_conf: 'دقة الموقع', p_exp: 'تجارب احتجاز (IIIM)', p_parent: 'الجهة الأعلى',
    p_iiim: 'بيانات الآلية الدولية', p_tortureN: 'تعذيب أو سوء معاملة', p_inhumane: 'ظروف لاإنسانية', p_caesar: 'ملف قيصر', victims: 'ضحية', imgs: 'صورة',
    p_trials: 'محاكمات مرتبطة', p_verify: 'بحاجة إلى تحقق إضافي من الموقع أو الفترة', p_sources: 'المصادر', share: 'نسخ الرابط', copied: 'تم النسخ',
    regimeFall: '2024 (سقط النظام)', present: 'حتى الآن', grave: 'مقبرة جماعية', g_status: 'الحالة',
    gs_relocated: 'نُقلت الجثث منها جزئياً', gs_suspected: 'مقبرة مؤكدة لم تُنبش', gs_documented: 'موثقة', gs_secured: 'مؤمّنة وقيد التحقيق', gs_exhumation: 'زارتها جهات توثيق ووُجدت رفات',
    story_k: 'رواية تفاعلية', story_t: 'من الاعتقال إلى المقبرة، ومن المقبرة إلى المحكمة', story_p: 'سبعة فصول تتبع مسار الضحية في منظومة الاحتجاز، وما كشفته الأدلة، وما تحقق من العدالة حتى اليوم. مرّر للأسفل لتتحرك الخريطة مع النص.', scroll: 'مرّر للأسفل ↓',
    chapter: 'الفصل',
    tr_t: 'متتبع المحاكمات', tr_p: 'كل الإجراءات القضائية المعروفة ضد مسؤولين وعناصر في النظام السابق والميليشيات الموالية له: في المحاكم الأوروبية والأمريكية بموجب الولاية القضائية العالمية، وفي المحاكم السورية منذ 2026.',
    k_cases: 'قضية', k_conv: 'إدانة', k_ongoing: 'جارية', k_countries: 'دولة', k_named: 'متهماً بالاسم',
    st_convicted: 'إدانة', st_ongoing: 'جارية', st_indicted: 'لائحة اتهام', st_closed: 'مغلقة',
    j_universal: 'ولاية عالمية', j_extraterritorial: 'ولاية خارج الإقليم', j_national: 'قضاء وطني',
    byCountry: 'القضايا حسب الدولة', overTime: 'الأحكام عبر الزمن', allStatus: 'كل الحالات', allJur: 'كل أنواع الولاية',
    showOnMap: 'على الخريطة', source: 'المصدر', accused: 'المتهمون',
    tr_note: 'تظهر الأسماء فقط لمن صدر بحقهم حكم أو اتهام رسمي في إجراء قضائي موثق. الأحكام السورية تشمل أحكاماً بالإعدام ومحاكمات غيابية وجلسات سرية، وقد انتقدت منظمات حقوقية هذه الجوانب.',
    tj_t: 'لوحة قياس العدالة الانتقالية', tj_p: 'أين وصل ملف العدالة في سوريا بعد سقوط النظام؟ عشرون مؤشراً في ست ركائز، لكل مؤشر دليله ومصدره وتاريخه.',
    milestones: 'محطات منذ سقوط النظام', gaps: 'ما الذي ينقص', framework: 'الإطار والمنهجية', ind: 'مؤشر', avg: 'متوسط الركيزة',
    numbers: 'الأرقام الكبرى',
    footer: 'بيانات مصادر مفتوحة لأغراض التوثيق والمساءلة. تحديث نوفمبر 2026.',
    otherLang: 'EN', theme: 'تبديل الوضع الليلي', loading: 'جارٍ تحميل البيانات…', loadError: 'تعذّر تحميل البيانات. أعد تحميل الصفحة.',
  },
  en: {
    title: 'Syria Justice Map', subtitle: 'خريطة العدالة · Caesar Families Association',
    m_map: 'Map', m_story: "Victim's path", m_trials: 'Trials', m_tj: 'Transitional justice', methodology: 'Methodology & data',
    t_filters: 'Filters', t_layers: 'Layers', t_stats: 'Stats', t_list: 'List', t_legend: 'Legend',
    agency: 'Agency', governorate: 'Governorate', violation: 'Violation', confidence: 'Location confidence (IIIM)', all: 'All',
    torture: 'Torture', disappear: 'Disappearance', death: 'Death', caesar: 'Caesar files', high: 'High', medium: 'Medium', low: 'Low',
    reset: '↺ Reset', l_facilities: 'Detention facilities', l_graves: 'Mass graves', l_transfers: 'Documented transfer paths', l_cluster: 'Cluster nearby points',
    l_size: 'Circle size by number of testimonies',
    shown: 'sites shown', iiimExp: 'documented detention experiences (IIIM)', caesarSites: 'Caesar-linked sites', govs: 'governorates',
    byAgency: 'Sites by agency', byViolation: 'Violations', ref: 'Reference figures',
    search: 'Search branch or city…', sites: 'sites', unmappedT: 'IIIM facilities without coordinates',
    legendAg: 'Agencies', legendSym: 'Symbols', symCaesar: 'Gold ring: linked to the Caesar photos', symVerify: 'Dashed border: location needs verification', symGrave: 'Diamond: mass grave', symTrial: 'Pulsing: linked to a trial',
    allYears: 'All years', allSitesEv: 'All documented sites 2011–2026', activeYear: 'sites active this year',
    p_gov: 'Governorate', p_period: 'Active period', p_conf: 'Location confidence', p_exp: 'Detention experiences (IIIM)', p_parent: 'Parent unit',
    p_iiim: 'IIIM data', p_tortureN: 'torture / ill-treatment', p_inhumane: 'inhumane conditions', p_caesar: 'Caesar files', victims: 'victims', imgs: 'images',
    p_trials: 'Related trials', p_verify: 'Location or period needs further verification', p_sources: 'Sources', share: 'Copy link', copied: 'Copied',
    regimeFall: '2024 (regime fall)', present: 'present', grave: 'Mass grave', g_status: 'Status',
    gs_relocated: 'Bodies partly moved away', gs_suspected: 'Confirmed grave, not exhumed', gs_documented: 'Documented', gs_secured: 'Secured, under investigation', gs_exhumation: 'Visited by investigators; remains found',
    story_k: 'Interactive story', story_t: 'From arrest to the grave, and from the grave to the courtroom', story_p: "Seven chapters following a victim's path through the detention system, what the evidence revealed, and what justice has been achieved so far. Scroll down and the map moves with the text.", scroll: 'Scroll ↓',
    chapter: 'Chapter',
    tr_t: 'Trials tracker', tr_p: 'Every known judicial proceeding against officials and members of the former regime and its allied militias: in European and US courts under universal jurisdiction, and in Syrian courts since 2026.',
    k_cases: 'cases', k_conv: 'convictions', k_ongoing: 'ongoing', k_countries: 'countries', k_named: 'named accused',
    st_convicted: 'Convicted', st_ongoing: 'Ongoing', st_indicted: 'Indicted', st_closed: 'Closed',
    j_universal: 'Universal jurisdiction', j_extraterritorial: 'Extraterritorial', j_national: 'Domestic court',
    byCountry: 'Cases by country', overTime: 'Verdicts over time', allStatus: 'All statuses', allJur: 'All jurisdictions',
    showOnMap: 'On the map', source: 'Source', accused: 'Accused',
    tr_note: 'Names appear only for people convicted or formally charged in a documented proceeding. Syrian judgments include death sentences, trials in absentia and closed hearings, which rights groups have criticised.',
    tj_t: 'Transitional justice dashboard', tj_p: 'Where does justice in Syria stand after the fall of the regime? Twenty indicators across six pillars, each with its evidence, source and date.',
    milestones: 'Milestones since the fall', gaps: "What's missing", framework: 'Framework & method', ind: 'indicator', avg: 'pillar average',
    numbers: 'Key figures',
    footer: 'Open-source data for documentation and accountability. Updated November 2026.',
    otherLang: 'عربي', theme: 'Toggle dark mode', loading: 'Loading data…', loadError: 'Could not load the data. Please reload.',
  },
};

export const AGENCIES = {
  MI: { c: '#C0392B', ar: 'المخابرات العسكرية', en: 'Military Intelligence' },
  AFI: { c: '#D35400', ar: 'المخابرات الجوية', en: 'Air Force Intelligence' },
  GID: { c: '#2471A3', ar: 'المخابرات العامة', en: 'General Intelligence' },
  PSD: { c: '#6C3483', ar: 'الأمن السياسي', en: 'Political Security' },
  MoI: { c: '#1E7E4A', ar: 'وزارة الداخلية والسجون', en: 'Interior & prisons' },
  MP: { c: '#566073', ar: 'الشرطة العسكرية', en: 'Military Police' },
  HOSP: { c: '#943D5A', ar: 'المستشفيات', en: 'Hospitals' },
  ARMY: { c: '#8A7A2E', ar: 'وحدات الجيش والقوى الجوية', en: 'Army & air force units' },
};
export const COUNTRIES = {
  DE: { ar: 'ألمانيا', en: 'Germany' }, FR: { ar: 'فرنسا', en: 'France' }, NL: { ar: 'هولندا', en: 'Netherlands' },
  SE: { ar: 'السويد', en: 'Sweden' }, AT: { ar: 'النمسا', en: 'Austria' }, CH: { ar: 'سويسرا', en: 'Switzerland' },
  US: { ar: 'الولايات المتحدة', en: 'United States' }, SY: { ar: 'سوريا', en: 'Syria' },
};
export const STATUS_COLOR = { convicted: '#1E7E4A', ongoing: '#D38B1F', indicted: '#2471A3', closed: '#7A819D' };

let lang = 'ar';
const listeners = [];
export const getLang = () => lang;
export const t = k => STR[lang][k] ?? k;
export const L = (o, base) => o?.[base ? base + (lang === 'ar' ? 'Ar' : 'En') : lang] ?? '';
export const fmt = n => n == null ? '—' : n.toLocaleString(lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en-US');
export const onLang = fn => listeners.push(fn);
export function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.title = `${t('title')} | ${STR[l === 'ar' ? 'en' : 'ar'].title}`;
  try { localStorage.setItem('sjm-lang', l); } catch (e) { /* storage unavailable */ }
  listeners.forEach(fn => fn(l));
}
export function initialLang() {
  try { return localStorage.getItem('sjm-lang') || 'ar'; } catch (e) { return 'ar'; }
}

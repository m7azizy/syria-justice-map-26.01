# مراجعة بيانات خريطة العدالة — سبتمبر 2026

هذه الوثيقة تسجّل نتائج البحث الذي أُجري في سبتمبر 2026 لمطابقة بيانات الخريطة مع أحدث المصادر، وما عُدّل بناءً عليه في `syria-justice-map-01-2026.html`.

**حدود البحث:** المصادر الأصلية مثل موقع الآلية الدولية
(iiim.un.org)
والشبكة السورية
(snhr.org)
لم تكن متاحة من بيئة العمل، فاعتمد البحث على ملخصات نتائج محركات البحث. لذلك لم تُطابَق إحداثيات الملحق
(Annex B)
صفاً بصف بعد. هذه الخطوة هي الأولى في قائمة المتابعة أدناه.

---

## أولاً: تصحيحات طُبّقت على البيانات

| المعرّف | الموقع | التصحيح | المصدر |
|---|---|---|---|
| 87، 90 | فرع 335 وسجن الرقة | المحافظة: الرقة بدل دير الزور | — |
| 37، 38، 81، 82، 86 | فروع دير الزور ومطارها | نهاية النشاط 2024 بدل 2014، لأن النظام احتفظ بنصف المدينة طوال حصار داعش (2014–2017) | Atlantic Council، Wikipedia |
| 91 | الفرع 222، القامشلي | نهاية النشاط 2024، لأن "المربع الأمني" بقي حتى سقوط النظام | Enab Baladi |
| 10، 11، 16 | مستشفيات تشرين و601 وحرستا | نهاية النشاط 2018 بدل 2013. صور قيصر تغطي 2011–2013 فقط، ونقل الجثث إلى المقابر استمر حتى 2018 | Middle East Eye |
| 2، 3، 41، 4 | الفروع 215، 227، 216، 235 | ضحايا قيصر: 3,556 و2,047 و297 و128 | رابطة عائلات المعتقلين والمفقودين عبر HRW |
| 4 | فرع فلسطين | حذف عبارة "أكثر منشأة ذكرتها IIIM"، لأن سجن عدرا مسجّل بـ204 حالات | تناقض داخلي |
| 50 | القطيفة | تقدير 100,000 منسوب إلى SETF، مع حذف كلمة "متحفظ" | CNN / SETF |
| 52 | التضامن | 41 ضحية موثقة بالفيديو، وتقديرات أخرى بنحو 288 | HRW، Wikipedia |
| 53 | الضمير | تأمين الموقع وفتح تحقيق جنائي (ديسمبر 2025)، والنبش مقرر في 2027، مع ملاحظة أن الإحداثيات تقديرية | Reuters |
| 9 | مطار المزة | أكثر من 1,150 وفاة ومقبرتان مشتبه بهما، وقضية الدباغ، ولائحة الاتهام الأمريكية | SJAC، HRW، DOJ |
| 1، 17، 71 | الفرع 251، الفرع 261، الأمن السياسي في درعا | ربطها بأحكام الغريب ورسلان وعلاء م. وعاطف نجيب | SJAC، HRW |
| جميع المواقع | — | فصل "ملف قيصر" عن أنواع الانتهاك، فأصبح حقلاً مستقلاً `caesar` | — |

**موقع جديد:** سجن مطار حماة العسكري (المعرّف 93، المخابرات الجوية)، مع علامة "بحاجة إلى تحقق".

**أحداث الشريط الزمني:**
- صُحّح حدث 2016 عن صيدنايا، إذ تقدّر العفو الدولية سعته بين 10 و20 ألف محتجز.
- صُحّح حدث 2022، فأول إدانة كانت لإياد الغريب عام 2021.
- حُدّث حدث 2024: الإفراج عن 24,200 محتجز، وبقاء 112,414 مفقوداً.
- أُضيف عاما 2025 و2026.

## ثانياً: أرقام مرجعية

| الرقم | المعنى | المصدر |
|---|---|---|
| 160,123 | معتقل ومختفٍ لدى النظام السابق (من أصل 181,312 لدى جميع الأطراف)، 2011 إلى أغسطس 2025 | SNHR، التقرير السنوي الرابع عشر |
| 45,342 | وفاة تحت التعذيب | SNHR، يونيو 2025 |
| 24,200 / 112,414 | أُفرج عنهم في ديسمبر 2024 / بقوا مفقودين | SNHR، 28 ديسمبر 2024 |
| 6,786+ | ضحية في 28,707 صورة من صور قيصر | HRW 2015 |
| 111 / 94 / 332 | منشأة محددة / منها بإحداثيات / شاهداً | IIIM، ديسمبر 2024 |
| 2,000+ / 550+ | شهادة / مقابلة مع ناجين من التعذيب | COI، "شبكة العذاب"، يناير 2025 |
| 66 | موقع مقبرة جماعية مشتبه به | ICMP |
| ~63 | مقبرة وثّقتها الهيئة الوطنية للمفقودين حتى منتصف 2025 | NCMP عبر Syria Direct وEnab Baladi |
| 13,000 | أُعدموا شنقاً في صيدنايا (2011–2015) | Amnesty 2017 |

الرقم 177,057 الذي كان في الواجهة استُبدل بالرقم 160,123 لأنه موثق ويخص النظام تحديداً. والرقم 6,821 استُبدل بـ6,786+ لأن مصدره غير واضح.

## ثالثاً: المحاكمات المرتبطة بالمواقع

| التاريخ | القضية | الحكم | الموقع |
|---|---|---|---|
| 2021-02-24 | إياد الغريب، كوبلنز | 4.5 سنوات | 1 |
| 2022-01-13 | أنور رسلان، كوبلنز | مؤبد | 1 |
| 2024-05-24 | قضية الدباغ، باريس (غيابياً) | مؤبد لمملوك وحسن ومحمود | 9 |
| 2024-12 | لائحة اتهام أمريكية | اتهام | 9 |
| 2025-06-16 | علاء م.، فرانكفورت | مؤبد | 11، 17 |
| 2025-11-19 | محاكمة اليرموك، كوبلنز | جارية | 4 |
| 2026-05-04 | محمود س.، سولنا (السويد) | مؤبد | — |
| 2026-08-11 | عاطف نجيب وآخرون، دمشق | إعدام للثمانية | 71 |

قضية رفعت الأسد في سويسرا أُغلقت في مارس 2026 بعد وفاته، ولا ترتبط بمواقع الخريطة (مجزرة حماة 1982).

## رابعاً: قائمة المتابعة (بحاجة إلى تحقق)

1. **مطابقة الملحق B صفاً بصف:** أسماء المنشآت الـ94 وإحداثياتها ومستويات الثقة، مقابل الخريطة. هذا سيكشف المنشآت الناقصة (الخريطة فيها 76 موقعاً).
2. **مواقع فروع دير الزور** ضمن الأحياء التي بقيت تحت سيطرة النظام، مثل الجورة والقصور. المواقع 37 و38 و81 و82 معلّمة بـ`needsVerification`.
3. **سجن الحسكة المركزي** (المعرّف 92): متى خرج من يد النظام؟
4. **مواقع دون إحداثيات موثوقة، لم تُضف بعد:**
   - المستشفى العسكري 608 في حمص.
   - القسم 40.
   - المقبرتان داخل مطار المزة: أرسل مركز العدالة والمساءلة إحداثياتهما للهيئة الوطنية ولم تُنشر.
   - مقبرة مزرعة الراهب في ريف حلب.
   - مقابر درعا (أكثر من 12 موقعاً).
5. **إحداثيات مقبرة الضمير:** تقديرية، لأن رويترز لم تنشر الموقع الدقيق.
6. **أعداد صور قيصر لكل فرع** (الحقل `caesarImgs`): تحتاج مصدراً صريحاً.
7. **رقم 23 مقبرة في 2026:** مصدره المرصد السوري
   (SOHR)
   فلا يُعتمد قبل تأكيده من مصدر آخر.
8. **مصادر بلا رابط بعد:** VDC، OFAC، ADMSP، Mapping MENA، SHRC، متحف سجون سوريا، AP.

## أدوات

- `node tools/validate-data.js`: يتحقق من سلامة البيانات، أي المعرّفات والحقول والإحداثيات داخل حدود سوريا وروابط المحاكمات بالمصادر.
- `tools/apply-2026-09-data-fixes.js`: سكربت الترحيل الذي طبّق التصحيحات أعلاه، ويبقى للمرجعية فقط.

## المصادر

- IIIM — Detention Report (Dec 2024): https://iiim.un.org/the-syrian-government-detention-system-as-a-tool-of-violent-repression/
- IIIM — Annex B: https://iiim.un.org/wp-content/uploads/2024/12/IIIM_DetentionReport_Public_Annex-B_Mapping-Geolocation-1.pdf
- OHCHR/COI — Web of Agony (Jan 2025): https://www.ohchr.org/en/hr-bodies/hrc/iici-syria/web-agony
- SNHR — 14th Annual Report on Enforced Disappearances: https://snhr.org/blog/2025/08/30/fourteenth-annual-report-on-enforced-disappearances-in-syria-on-the-occasion-of-the-international-day-of-the-victims-of-enforced-disappearances/
- SNHR — 45,342 torture deaths: https://snhr.org/blog/2025/06/26/on-the-international-day-in-support-of-victims-of-torture-new-information-reveals-the-deaths-of-thousands-of-forcibly-disappeared-persons-in-the-detention-centers-of-the-former-syrian-regime-raising/
- SNHR — 112,414 still missing: https://snhr.org/blog/2024/12/28/opening-detention-centers-has-revealed-the-still-going-humanitarian-catastrophe-over-112414-individuals-are-still-forcibly-disappeared-at-the-hands-of-the-assad-regime/
- HRW — If the Dead Could Speak: https://www.hrw.org/report/2015/12/16/if-dead-could-speak/mass-deaths-and-torture-syrias-detention-facilities
- HRW — Tadamon mass grave: https://www.hrw.org/news/2024/12/16/syria-mass-grave-damascus-should-be-protected-investigated
- HRW — Dabbagh case: https://www.hrw.org/news/2024/05/27/syrian-officials-convicted-crimes-against-humanity-france
- HRW — Q&A on first Assad-era trials (Aug 2026): https://www.hrw.org/news/2026/08/23/questions-answers-syrias-first-and-future-trials-for-assad-era-crimes
- Amnesty — Human Slaughterhouse: https://www.amnesty.org/en/documents/mde24/5415/2017/en/
- Reuters — Operation Move Earth: https://www.usnews.com/news/world/articles/2025-10-14/exclusive-assad-government-secretly-moved-mass-grave-to-cover-up-killings-reuters-investigation-finds
- Reuters — Dhumair secured: https://www.usnews.com/news/world/articles/2025-12-29/syria-secures-assad-era-mass-grave-revealed-by-reuters-and-opens-criminal-investigation
- Reuters — Mezzeh airport graves: https://www.usnews.com/news/world/articles/2026-09-12/syrian-private-airport-plans-spark-outcry-over-mass-graves-land-rights
- The New Arab — Mezzeh graves protected: https://www.newarab.com/news/syria-moves-protect-mass-grave-sites-mezzeh-airport
- Enab Baladi — Mezzeh airport deaths: https://english.enabbaladi.net/archives/2025/02/a-thousand-detainees-killed-at-mezzeh-military-airport-in-syria/
- Enab Baladi — Qamishli security square: https://english.enabbaladi.net/archives/2024/08/after-al-hasakah-sdf-lifts-siege-on-security-square-in-qamishli/
- Enab Baladi — NCMP finds remains (May 2026): https://english.enabbaladi.net/archives/2026/05/national-commission-for-the-missing-finds-remains-near-damascus/
- Syria Direct — Mass graves: https://syriadirect.org/in-search-of-closure-syrians-work-to-unearth-the-secrets-of-assads-mass-graves/
- Middle East Eye — How bodies were moved: https://www.middleeasteye.net/news/how-assad-syria-moved-bodies-victims
- CNN — SETF estimate: https://www.cnn.com/2024/12/17/middleeast/syria-assad-regime-mass-graves-intl/index.html
- SJAC — Alaa M. verdict: https://syriaaccountability.org/frankfurt-court-sentences-syrian-doctor-alaa-m-to-life-imprisonment/
- SJAC — Raslan / al-Gharib: https://syriaaccountability.org/the-trial-of-anwar-raslan-and-eyad-al-gharib/
- SJAC — Yarmouk (Sweden): https://syriaaccountability.org/a-landmark-conviction-for-yarmouk-in-sweden-comes-with-lessons/
- FBI/DOJ — Charges against Jamil Hassan & Abdel Salam Mahmoud: https://fbi.gov/news/press-releases/criminal-charges-unsealed-against-two-former-high-ranking-syrian-government-intelligence-officials-for-war-crimes-against-americans-and-other-civilians
- Al Jazeera — Najib verdict: https://www.aljazeera.com/news/2026/8/11/bashar-al-assad-atef-najib-sentenced-to-death-in-landmark-syria-trial
- Atlantic Council — Siege of Deir ez-Zor: https://www.atlanticcouncil.org/blogs/syriasource/inside-isis-s-siege-on-deir-ezzor/
- Naharnet/AFP — Hama airport prison: https://m.naharnet.com/stories/en/58939-syrian-activists-hama-military-airport-turned-into-feared-prison
- MaGPIE — Mapping Mass Graves in Syria: https://magpie.bournemouth.ac.uk/mapping-mass-graves-in-syria/
- TRIAL International — Rifaat al-Assad: https://trialinternational.org/case/rifaat-al-assad/

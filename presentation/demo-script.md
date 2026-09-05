# سيناريو العرض المباشر — New Muslim Stories

**الإطار:** عرض تقني مدته 60 دقيقة؛ الحصة المخصصة للعرض المباشر **حوالي 11 دقيقة**، مع خطة ضغط إلى **حوالي 6 دقائق** (تشغيل المسار الحرج فقط).
**الجمهور:** فريق تقني.
**اللغة:** نثر عربي، والمصطلحات التقنية بالإنجليزية.

> قبل الصعود إلى المسرح: تأكد أن الأوامر التالية مذكورة في `package.json` وأنها تعمل (قائمة التحقق في الفقرة 1 أدناه).

---

## الخريطة الزمنية (11 دقيقة — 7 مقاطع)

| # | المقطع | الوقت | مسار حرج في الضغط؟ |
|---|--------|-------|---------------------|
| 1 | Preflight | 1 دقيقة | نعم |
| 2 | Routing / URL state | 2 دقيقة | نعم |
| 3 | Local state + reload (مع مقدمة Hydration) | 2 دقيقة | نعم |
| 4 | Story page processing | 1.5 دقيقة | نعم |
| 5 | Markdown source edit (HMR) | 1.5 دقيقة | **لا** (اختياري) |
| 6 | Production build + PWA/offline | 2 دقيقة | نعم |
| 7 | Hydration deep-dive | 1 دقيقة | **لا** (يُدمج في 3) |

**المجموع: 1 + 2 + 2 + 1.5 + 1.5 + 2 + 1 = 11 دقيقة** ✔

---

## المقطع 1 — Preflight (دقيقة واحدة)

**يفتح في الطرفية:** terminal جاهز في جذر المشروع.

**النص (ما يقوله المتحدث):**

> هذه أوامر ما قبل العرض، وهي الأوامر الفعلية الموجودة في `package.json`. الخطوة الأولى هي تثبيت الاعتماديات: `pnpm install` — هذا هو المثبّت القياسي لـ pnpm وليس scriptًا داخل الحزمة. ثم أتحقق من صحة الاختبارات والجودة قبل أي شيء على المسرح.

**الأوامر (موجودة في `package.json`):**

```bash
pnpm install          # المثبّت القياسي (ليس في scripts؛ قاعدة pnpm)
pnpm test             # = vitest run → 5 ملفات / 29 اختبارًا (مؤكّد)
pnpm lint             # eslint . --max-warnings=999
pnpm dev              # dev server على http://localhost:3000
```

> كل هذه أوامر عرضية (cross-platform) ولا تشترط بيئة Linux خاصة.

**دليل خارجي ثم رابط داخلي:** نذكر أن `pnpm test` يمر (5/5 ملفات، 29/29 اختبارًا) كما سُجّل في مهمة Task 1، والأهم أننا سنجرّب هذا فعليًا الآن. سنجري في المقطع 4/6 بعض الاختبارات المفيدة (sanitize) النابعة من `src/lib/__tests__/`.

**ملاحظة للحدّ الصدق:** `pnpm build` و`pnpm start` لا ننفّذهما هنا في preflight (سنفعل في المقطع 6 لبيان PWA من build إنتاجي). الـ preflight هنا يثبت فقط أن الاختبارات وlinter يعملان.

---

## المقطع 2 — Routing / URL state (دقيقتان)

**يفتح في المتصفح:** `http://localhost:3000/en`.

**النص (ما يقوله المتحدث):**

> المشروع ثنائي اللغة en/ar عبر `next-intl` مع معالجة App Router. الـ routing هنا ليس مكوّنًا داخل صفحة، بل عبر `defineRouting` الذي يعلن عن قائمة الـ locales والـ default. دعني أفتح `/en` ثم أعدّل اللغة من المبدّل.

**دليل خارجي ثم رابط داخلي:**
- تعريف الـ locales: `src/i18n/routing.ts:5` (locales en/ar) و`:8` (defaultLocale en).
- الوسيط (middleware في Next 16 عبر `proxy.ts`): `src/proxy.ts:3-9` يعيد توجيه الطلبات ويضيف الـ locale تلقائيًا، و`src/proxy.ts:14` يحدّد الـ matcher باستثناء `api|_next` والملفات الثابتة — أي لا يوجد تداخل مع أي routing داخلي.

**تفعيل URL state:**

1. من داخل `/en`، اضغط على مبدّل اللغة (Language switcher) لتتحول إلى العربية.
2. لاحظ أن الرابط تغيّر فعليًا إلى `/ar` (URL state حقيقي في المتصفح، وليس مجرد نص).
3. لاحظ انقلاب الاتجاه: `src/app/[locale]/layout.tsx:40` يحسب `dir = locale === 'ar' ? 'rtl' : 'ltr'` ويطبّقه على عنصر `<html>` في `:43`.
4. جرّب عنوانًا صعبًا: `http://localhost:3000/ar/stories/<slug>` (اختر slug موجودًا مثل `omar-story`). لاحظ أن المتصفح يعرض النسخة العربية من القصة مباشرة لأن الـ routing يلتقط الـ locale من الـ pathname.

**خلاصة (يقال):**
> الـ routing هو "URL state": اللغة جزء من العنوان، والتبديل بين اللغتين يعبّر عن نفسه في الرابط وفي اتجاه الصفحة.

---

## المقطع 3 — Local state + reload (دقيقتان) — يشمل مقدمة Hydration

**يفتح في المتصفح:** الموقع الحالي (أي locale).

**النص (ما يقوله المتحدث):**

> الآن نضرب على Local state ونعيد تحميل الصفحة. أولاً الـ theme: أبدّل dark/light من مبدّل الثيم، ثم أعيد تحميل السطر (reload). يبقى الثيم محفوظًا لأن `next-themes` يخزّنه (تفضيل النظام/الفرد وليس في الـ render مباشرة).

**دليل داخلي (theme):**
- الـ mounted gate يحمي الـ render الأول للزر حتى لا يظهر وميضًا: `src/components/ThemeToggle.tsx:48` (`const mounted = useHasMounted()`)، `:57` (`disabled={!mounted}`)، `:50` (isDark فقط بعد mounted).
- الـ hook نفسه: `src/hooks/useHasMounted.ts:1-12` يقلب `hasMounted` إلى true داخل `useEffect` — وهذا هو النمط الآمن لتفادي mismatch.
- في الـ layout نحفظ السمة عبر `src/app/[locale]/layout.tsx:45-50` مع `defaultTheme="light"` عند `:47` و`suppressHydrationWarning` عند `:43` (لأن الـ theme script يغير الفئة قبل hydration).

**دليل داخلي (locale):**
- تبديل اللغة وإعادة التحميل يحفظ اللغة أيضًا: `src/components/LocalePersist.tsx:8` يكتب `localStorage.setItem('locale', locale)` داخل `useEffect` (`:6-12`)، مع `try/catch` لمعالجة تعذّر توفر localStorage.

**مقدمة Hydration (يقولها المتحدث باختصار):**

> هذا العرض المزدوج (theme + locale بعد reload) هو في الحقيقة مثال Hydration: الـ HTML الأولي الذي يصل من الـ server مطابق لما سيرسمه الـ client. لو لم نفعّل الـ mounted gate، لقرأنا localStorage أثناء الـ render مباشرة، فيأتي الـ server بقيمة (dark افتراضيًا أو light) والـ client بقيمة أخرى فيشتعل mismatch. سنفصّل هذا في المقطع 7.

**ملاحظة صدق:** لا يوجد بحث من جهة الخادم ولا صفحة بحث؛ توجد فلترة عميلة في الذاكرة في الصفحة الرئيسية (وليس هذا المقطع — هذا مقطع "local state and reload" كما هو مطلوب).

---

## المقطع 4 — Story page processing (1.5 دقيقة)

**يفتح في المتصفح:** قصة من القائمة (مثال `/en/stories/omar-story`).

**النص (ما يقوله المتحدث):**

> هذه هي "معالجة المحتوى الأساسية" (core processing) — وهي props من الـ Markdown إلى العرض. كل قصة تُعرض في ثلاثة أقسام: قبل الإسلام / لحظة الهداية / انعكاسات. تقسيم الأقسام ليس بحروف ثابتة، بل بتحليل الـ HTML الناتج عن الـ headings.

**دليل خارجي ثم رابط داخلي:**
- آلية التقسيم: `src/lib/story-sections.ts:12-28` — `getStorySections` يقسم على `<h2/h3>` ويجمع جسم كل قسم بدون الاعتماد على فهارس ثابتة (يتحمل headings إضافية/ناقصة) عند `:16-21`.
- التنقّل prev/next: `src/app/[locale]/stories/[slug]/page.tsx:77-79` يجد فهرس القصة الحالية في القائمة المرتّبة ويحدد السابق والتالي (index > 0 → prev؛ index < length-1 → next).
- الأمان: قبل عرض الـ HTML، يُنقّى عبر `src/lib/sanitize.ts` (DOMPurify بقائمةtags وattrs محددة عند `:17-44`)، والاستدعاء يكون عند `src/lib/story-parser.ts:88`.

> أريد أن أكون صريحًا: لا يوجد بحث من جهة الخادم ولا فهرس بحث ولا /search؛ توجد فلترة عميلة للقصص المحمّلة على الرئيسية (`FeaturedStories.tsx`). ولا توجد API routes ولا قاعدة بيانات؛ سطر `robots.txt` يُنشأ عبر `src/app/robots.ts`. ما نعرضه هنا هو "core processing": تقسيم القصة وتنقيتها وعرضها.

---

## المقطع 5 — Markdown source edit / HMR (1.5 دقيقة) — اختياري في الضغط

**يفتح:** محرر في `src/stories/<slug>.md` بجانب المتصفح.

**النص (ما يقوله المتحدث):**

> البيانات هنا هي Markdown — ليس قاعدة بيانات. أعدّل سطرًا من frontmatter أو body، أحفظ، ويلتقط dev server التغيير عبر fast refresh ويرسم الصفحة فورًا. هذا يوضح أن المحتوى "قاعدة بيانات Markdown".

**خطوات (تغيير صغير قابل للتراجع):**
1. افتح `src/stories/omar-story.md` (النسخة الإنجليزية) — frontmatter من `:1-13` والـ body من `:15`.
2. عدّل مؤقتًا سطرًا في العنوان (مثال: أضف كلمة) في `:2`.
3. احفظ، لاحظ تحديث المتصفح.
4. **أعد التغيير** فورًا واحفظ (تراجع) — لا نريد إبقاء تعديل عشوائي في المستودع.

**دليل داخلي:**
- مسار المعالجة من الملف إلى HTML: `src/lib/story-parser.ts:74-91` (`parseStoryFile`) — يقرأ الملف (`:78`)، يحلل frontmatter بـ gray-matter (`:81`)، يحول الـ Markdown إلى HTML بـ remark/remark-html (`:86`)، ثم ينقّي (`:88`).

**ملاحظة صدق (يقال):**
> هذا يعمل لأنه SSG (static generation): في الإنتاج يُعاد بناء القصة في زمن البناء (build time)، وليس عند كل طلب. التعديل السريع هذا خاص بيئة التطوير عبر fast refresh.

---

## المقطع 6 — Production build + PWA/offline (دقيقتان)

**يفتح في الطرفية ثم المتصفح.**

**النص (ما يقوله المتحدث):**

> الآن ننتقل إلى إنتاج حقيقي. التطبيق PWA، ولكن يجب توضيح مهم: **service worker يكاد يكون غير فعّال في وضع التطوير** (`next dev` لا يقدّم `public/sw.js` بآلية التخزين المؤقت الإنتاجية)، لذلك نُظهر الـ offline من **build إنتاجي** (`pnpm build` ثم `pnpm start`).

**الأوامر (موجودة في `package.json`):**

```bash
pnpm build        # next build → SSG للصفحات
pnpm start        # next start → خادم إنتاج على http://localhost:3000
```

**دليل خارجي ثم رابط داخلي:**
- الـ manifest وقابلية التثبيت: افتح `public/manifest.json` (name عند `:2`، display standalone عند `:6`، icons عند `:13-26`).
- الـ service worker مرتكز على رقم الإصدار: `public/sw.js:1` (`CACHE_NAME = 'new-muslim-stories-v0.1.0'`)، ويحذف الإصدارات القديمة في activate عند `:25-37`.
- استراتيجيات التخزين المؤقت:
  - **Network-first** للتنقّل (HTML): `public/sw.js:40-78` — يجرب الشبكة أولًا ويخزّن، وعند الفشل يعيد من الـ cache أو صفحة offline عند `:66-70`.
  - **Stale-while-revalidate** للمحتوى/القصص: `public/sw.js:80-122` — يعيد النسخة المخزّنة فورًا ثم يحدّثها في الخلفية (`:88-100`).
  - **Cache-first** للموارد الثابتة (CSS/JS/صور/`/_next/`): `public/sw.js:124-164`.
- التسجيل: `src/components/ServiceWorkerRegistration.tsx:5-37` يسجّل `/sw.js` بنطاق `'/'` عند `:10-12` ويتعامل مع التحديثات عند `:17-26`.
- صفحة offline: `src/app/offline/page.tsx` — تكتشف الـ locale من `localStorage.getItem('locale')` عند `:54` (مع fallback إلى `navigator.language` عند `:59`).

**خطوات العرض:**
1. نفّذ `pnpm build` ثم `pnpm start` (من build إنتاجي).
2. افتح الموقع، تحقق من الـ manifest وقابلية التثبيت (بعد تفعيل beforeinstallprompt عبر `PWAInstall`).
3. من DevTools > Network، فعّل **Offline**.
4. أعد تحميل صفحة قصة تمت زيارتها — ستظل تُعرض من الـ cache (استراتيجية stale-while-revalidate للقصص).
5. اذهب إلى رابط غير مخزّن — ستظهر **صفحة offline** (`src/app/offline/page.tsx`).

**ملاحظات صدق:**
- الـ offline locale detection والـ caching يعملان فقط في الإنتاج، وليس في dev.
- لا توجد قاعدة بيانات ولا env vars مطلوبة هنا؛ "المزامنة" التطبيقية هي استمرار state محليًا (theme/locale) والـ offline caching، وليس مزامنة سيرفر.

---

## المقطع 7 — Hydration deep-dive (دقيقة واحدة) — يُدمج في 3 عند الضغط

**يفتح في المتصفح + طرفية (curl أو View Source).**

**النص (ما يقوله المتحدث):**

> أريد أن أُبين أن الـ HTML الأولي مشغّل Server-side. أفتح المصدر أو أنفّذ curl على الصفحة وأراه مكتملًا قبل تحميل أي JS. ثم يتبعه الـ client hydration الذي يُرفق الـ event handlers.

**دليل خارجي ثم رابط داخلي:**
- اعرض مصدر الصفحة (View Source) أو: `curl -s http://localhost:3000/en` في الطرفية — تُرى قصة/هيكل HTML كامل بدون JS.
- الـ hydrate يحافظ على هذا الـ HTML لأنه مطابق بإعداد `suppressHydrationWarning` و`defaultTheme="light"` في `src/app/[locale]/layout.tsx:43,47`.
- النمط الآمن للـ mismatch: `src/hooks/useHasMounted.ts:1-12` + التطبيق في `src/components/ThemeToggle.tsx:48-57`.

**ملاحظة صدق:** هذا المقطع هو أول ما نحذفه أو ندمجه في المقطع 3 عند الضغط إلى 6 دقائق، لأن جوهر الـ Hydration (الـ mounted gate والـ mismatch) مغطّى بالفعل في المقطع 3.

---

## الخطة المكثّفة (إلى ~6 دقائق)

تشغيل **المسار الحرج فقط:** المقطعات 1، 2، 3، 4، 6 بالكامل؛ حذف/تخفيف المقطع 5 (إلى لقطة أو ذكر واحد) ودمج المقطع 7 في المقطع 3؛ تكثيف الكلام.

| # | المقطع | الوقت |
|---|--------|-------|
| 1 | Preflight (اختصار: `pnpm test` + `pnpm dev`) | 0.5 دقيقة |
| 2 | Routing / URL state | 1.5 دقيقة |
| 3 | Local state + reload + مقدمة Hydration | 2 دقيقة |
| 4 | Story processing (تقسيم/تنقية) | 0.5 دقيقة |
| 5 | (لقطة Markdown، غير مشغّل) | — |
| 6 | Build + PWA/offline | 1.5 دقيقة |
| 7 | (مدمج في 3) | — |

**المجموع: 0.5 + 1.5 + 2 + 0.5 + 0 + 1.5 + 0 = 6 دقائق** ✔. **مفتاح الضغط:** اجعل الـ build (m6) يعمل مسبقًا على جهاز ثانٍ أو في خانة متوازية، واعرض PWA/offline دون انتظار `pnpm build` أمام الجمهور. المقطع 5 يُستبدل بلقطة شاشة جاهزة، والمقطع 7 أُدمج في المقطع 3.

> **مهم:** لا تترك المقطع 5 كتنفيذ عند الضغط؛ استبدله بلقطة شاشة جاهزة تبيّن `.md` بجانب المتصفح.

---

## شرح Hydration — النقاط العشر المطلوبة (موجز للإشارة، مفصل في العروض 20-24)

1. **حدود الـ server render:** الـ server لا يملك `window`/`document`/`localStorage`؛ لذلك أي قراءة لهذه أثناء $render محظور.
2. **أول ما يصل هو HTML:** الـ server يرسل HTML كامل (يُثبت بـ View Source/curl) — هذا "أول paint".
3. **يجب أن يطابق أول render للـ client HTML الأولي:** وإلا mismatch.
4. **Hydration = إرفاق الـ handlers، وليس إعادة رسم من DOM فارغ:** React يستعيد شجرة DOM الموجودة ويرفق الأحداث بدل إعادة الإنشاء.
5. **الـ effects تعمل بعد الـ commit:** `useEffect` يعمل بعد الـ hydration، فلا يمكن الاعتماد عليه لحساب أول render.
6. **مثال الخطأ:** لو قرأنا localStorage أثناء الـ render مباشرة (`const theme = localStorage.getItem('theme')` خارج useEffect): الـ server يرى (light افتراضيًا)، والـ client يرى مخزّنًا مختلفًا → mismatch.
7. **النتيجة:** إما فشل/تصحيح React أو وميض (flash) — وهو ما نمنعه بالـ mounted gate والـ `suppressHydrationWarning`.
8. **النمط الصحيح في هذا المشروع:** `defaultTheme="light"` + `suppressHydrationWarning` في `src/app/[locale]/layout.tsx:43,47`، والـ mounted gate `src/hooks/useHasMounted.ts:1-12` التطبيق في `src/components/ThemeToggle.tsx:48-57`.
9. **التمييز mismatch vs post-useEffect:** mismatch يحدث لو اختلف أول render للـ client عن HTML الـ server؛ بينما تغيير الـ DOM بعد `useEffect` (مثل تبديل class) هو سلوك جائز ولا يشكّل mismatch، لأن `useEffect` يجري بعد الـ commit.
10. **الربط بـ hooks الاختبار:** نمطنا يتحقق به test حقيقي وليس ادعاءً: `src/lib/__tests__/theme-console-filter.test.ts` يثبت أننا نفلتر فقط تحذير script-tag وتحدّد الاختبارات (`:12-40`). وأيضًا `src/lib/__tests__/sanitize.test.ts` يثبت تنقية الـ HTML (`:6-26`) — وهو ما يحمي محتوى القصص.

**تضمين mismatch + safe-pattern:** المثال الخطأ (نقطة 6) والمثال الآمن (نقطة 8) كلاهما حاضر أعلاه.

---

## خطة الطوارئ (Fallback)

لا توجد قاعدة بيانات ولا env vars مطلوبة، لذا السيناريوهات المحتملة:

1. **فشل `pnpm build`** — لا تجعل الجمهور ينتظر. بدّل فورًا إلى dev server (`pnpm dev`) واضبطها على المقدمة، واعرض لقطات شاشة جاهزة للمقطع 6 (الـ offline من build إنتاجي سابق). جهّز لقطة بنية جاهزة قبل العرض.
2. **الـ build ناجح لكن لا وقت للعرض أمام الحضور** — اجعل الـ build يعمل على جهاز/عملية ثانوية قبل العرض (أو استخدم build مخزّن). عند الضغط (6 دقائق) اعتمد على هذه اللقطة أو build مسبق.
3. **الحظر على `localStorage`** (خاص/امتلاء التخزين) — theme/locale لن يُحفظا عند reload، وصفحة offline ستقع في fallback إلى `navigator.language` (`src/app/offline/page.tsx:59`). عندها صِف السلوك بدل التنفيذ: "السلوك المتوقع محفوظ؛ هنا التخزين محجوب فسنصفه". المحاولات مغلّفة بـ `try/catch` (مثال `LocalePersist.tsx:9-11`) فلا تنكسر الصفحة.
4. **DevTools offline لا يفعّل** — اشرح المنطق نظريًا واعرض اللقطة الجاهزة للمقطع 6.
5. **المبدّل/الثيم لا يستجب** — أعد تحميل الصفحة وجرّب مرة؛ إن استمر، انتقل للمقطع 4/6 وارجع إليه لاحقًا. لا تتوقف.

**قاعدة عامة:** أي خطوة لا تُعرض بسلاسة، تحوّل إليها عرضها النظري (دليل داخلي `file:line`) أو لقطة جاهزة، ولا تتوقف أمام الجمهور.

---

## عبارات يُقال (وما لا يُقال)

### يُسمح بالقول — بدليل:
- الـ routing لغة عبر URL state، والتبديل يظهر في العنوان والاتجاه (دليل: `routing.ts`, `proxy.ts`, `layout.tsx:40`).
- الـ theme والـ locale يُحفظان بعد reload (دليل: `ThemeToggle.tsx`, `LocalePersist.tsx`).
- القصص تُنقّى قبل العرض عبر DOMPurify (دليل: `sanitize.ts`) وتُقسّم إلى ثلاثة أقسام (`story-sections.ts`).
- المشروع PWA في **الإنتاج** (SW يعمل من build إنتاجي، وليس في dev) مع استراتيجيات caching وفيرة (دليل: `sw.js:40-164`).
- لا يوجد بحث من جهة الخادم ولا فهرس بحث ولا API ولا قاعدة بيانات — توجد فلترة عميلة في الذاكرة فقط (`FeaturedStories.tsx`) — نعرض "معالجة المحتوى" وليس ذلك.
- الـ hydration آمن بسبب النمط (mounted gate + suppressHydrationWarning) ويُثبت باختبارات (`theme-console-filter.test.ts`, `sanitize.test.ts`).

### يُمنع القول (لا دليل له / overclaim):
- ❌ "نظام آمن بالكامل / fully secure" — نحن ننقّي HTML لكن لا نجرّب كل الهجمات؛ لا ميزة شاملة.
- ❌ "لا مشاكل Hydration أبدًا / no hydration issues ever" — نحن نمنع mismatch بالنمط والاختبار، لكن لا نعد بالمطلق.
- ❌ "يتوسّع لملايين المستخدمين / scales to millions" — لا يوجد اختبار تحميل/قياس؛ هذا ادعاء خاطئ.
- ❌ "بحث فوري عن القصص من جهة الخادم / بحث بفهرس" — لا تدّعِ بحثاً كاملاً بفهرسٍ أو بحثاً من الخادم — توجد فلترة عميلة في الذاكرة فقط.
- ❌ "API/route handler يزامن قاعدة بيانات" — **لا يوجد API ولا DB**؛ لا تصف ما لا يوجد.
- ❌ "الـ offline يعمل في التطوير" — فقط من build إنتاجي؛ لا تصف العكس.
- ❌ "قاعدة بيانات محتوى قابلة للاستعلام" — المحتوى Markdown يُبنى وقت الـ build (SSG)، وليس استعلامًا حيًا.

---

## ملخص للتحقق الذاتي (Self-check للمقدّم قبل العرض)
- [ ] `pnpm install`، `pnpm test`، `pnpm lint`، `pnpm dev` كلها تمر (المقطع 1).
- [ ] `pnpm build` ثم `pnpm start` متاحان لتشغيل PWA/offline (المقطع 6).
- [ ] كل `file:line` المذكورة أعيد فتحها وتأكيدها في المصدر (راجع الفترات أعلاه).
- [ ] توقيت 11 دقيقة والمدة المكثّفة يطابقان (الجدولان أعلاه).
- [ ] النقاط العشر للـ Hydration + مثال mismatch + نمط آمن حاضرون.
- [ ] كل كتلة كود متوازنة الافتتاح والإغلاق (مطابقة ترايبل backtick).

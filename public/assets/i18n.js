// نظام ثنائي اللغة (عربي / ألماني) لكل صفحات الموقع العامة.
// Zweisprachiges System (Arabisch / Deutsch) für alle öffentlichen Seiten.

const I18N = {
  ar: {
    nav_home: 'الرئيسية', nav_home_student: 'منصة الطالب', nav_errors: 'أخطائي',
    nav_speaking: 'مساعد TELC', profile_link: 'ملفي', nav_logout: 'خروج',
    nav_services: 'الخدمات', nav_plans: 'الخطط', nav_about: 'عن المنصة', nav_access: 'الدخول', nav_contact: 'اتصل بنا', nav_mock: 'امتحان تجريبي', nav_speaking_ai: 'Sprechen AI',
    footer: 'TELC Voll — منصة تدريب B1 · B2 · C1',
    loading: 'جارٍ التحميل…',
    chat_page_title: 'مساعد TELC', chat_tag: 'TELC Voll AI',
    chat_title: 'مساعد TELC للدراسة',
    chat_desc: 'اسألني عن امتحان TELC أو أي شيء يساعدك في التحضير له: الشرح، التمارين، النصوص، الكتابة، التحدث، القواعد والمفردات.',
    chat_welcome_title: 'مساعد TELC',
    chat_welcome_desc: 'أنا هنا لمساعدتك في الدراسة والتحضير لامتحان TELC. اكتب سؤالك وسأجيبك أو أساعدك في إنشاء ما تحتاجه للتدريب.',
    chat_placeholder: 'اكتب سؤالك عن امتحان TELC…', chat_send: 'إرسال ↑', chat_sending: 'جارٍ الإجابة…',
    chat_note: 'مساعدك الدراسي مخصص لمواضيع TELC والتحضير للامتحان والدراسة المرتبطة به.',
    chat_error: 'تعذر الحصول على إجابة من المساعد.', chat_unknown_error: 'حدث خطأ غير معروف.',
    chat_float_label: 'مساعد TELC',

    hero_tag: 'منصة تدريب TELC Voll',
    hero_title: 'تدرّب بذكاء. ادخل الامتحان بثقة.',
    hero_desc: 'منصة تدريب احترافية لمحاكاة امتحان TELC Voll والتدرب على Lesen وHören وSprachbausteine وSchreiben وSprechen.',
    hero_cta1: 'ابدأ باستخدام رمز الدخول', hero_cta2: 'اكتشف الخدمات',
    hero_img_alt: 'طلاب يستعدون لامتحان TELC Voll',

    services_title: 'كل ما تحتاجه للنجاح في مكان واحد',
    services_desc: 'أدوات عملية، واجهة واضحة، وتجربة تدريب قريبة من الامتحان الحقيقي.',
    feature1_title: 'محاكاة الامتحان', feature1_desc: 'اختبارات منظمة مع وقت مستقل لكل Teil ونتيجة مباشرة بعد التصحيح.',
    feature2_title: 'التدريب حسب المهارة', feature2_desc: 'تدرب على Lesen وHören وSprachbausteine وSchreiben وSprechen بشكل منفصل.',
    feature3_title: 'Meine Fehler', feature3_desc: 'احتفظ بالأخطاء المتكررة وراجع الإجابة الصحيحة والتفسير عند توفره.',
    feature4_title: 'Sprechen AI', feature4_desc: 'سجّل إجابتك واحصل على تحليل AI للنص أو الموضوع الذي تتدرب عليه.',
    feature5_title: 'Zusammenfassungen & Strategien', feature5_desc: 'كلمات مهمة واستراتيجيات وأخطاء شائعة تساعدك على المراجعة.',
    feature6_title: 'متابعة التقدم', feature6_desc: 'لوحة شخصية تجمع الامتحانات والتمارين والتقدم في مكان واحد.',

    studentexp_tag: 'تجربة الطالب', studentexp_title: 'لوحة تحكم مصممة للدراسة اليومية',
    studentexp_desc: 'انتقل بين المستويات والمهارات والتمارين بسهولة، وواصل من حيث توقفت دون تعقيد.',
    studentexp_card_title: 'تقدّمك محفوظ دائماً', studentexp_card_desc: 'كل إجابة وكل نتيجة تُسجَّل تلقائياً، ويمكنك متابعة تطورك في أي وقت من لوحة التحكم.',
    studentexp_img_alt: 'طالب يستعد لامتحان TELC Voll',

    plans_title: 'خطتك تبدأ من هنا',
    plans_desc: 'اختر الخطة المناسبة لك؛ الأسعار والمحتوى يحددهما المشرف.',
    plans_loading: 'جارٍ تحميل الخطط…', plans_featured: 'الأكثر اختياراً', plans_day: 'يوم',
    plans_attempts: '{n} محاولة', plans_attempts_unlimited: 'محاولات حسب الإتاحة',
    plans_ai_included: 'يشمل Sprechen AI', plans_basic: 'التدريب الأساسي', plans_use_btn: 'استخدم رمز هذه الخطة',
    plans_none_title: 'لا توجد خطط منشورة حالياً', plans_none_desc: 'يمكن للمشرف إنشاء الخطط من لوحة التحكم.',
    plans_error_title: 'الخطط',

    access_tag: 'دخول الطالب', access_title: 'أدخل رمز الوصول',
    access_desc: 'استخدم رمز الوصول الذي حصلت عليه من المشرف للدخول إلى المنصة.',
    access_label: 'رمز الوصول', access_btn: 'دخول إلى المنصة',
    access_error: 'رمز الدخول غير صالح أو تم نقل الجلسة إلى جهاز آخر.',

    about_title: 'تدريب عملي على امتحان TELC Voll',
    about_desc: 'منصة مخصصة للتدريب والتحضير لمستويات B1 وB2 وC1، وليست الموقع الرسمي لـ telc ولا تمثل جهة الامتحان الرسمية.',

    dash_hero_tag: 'لوحة الطالب', dash_welcome: 'مرحباً {name}',
    dash_active: 'حسابك نشط. تابع التدريب من هنا.',
    dash_progress_title: 'تقدّمك في TELC Voll B2', dash_progress_desc: 'نفّذ الامتحانات، راجع أخطاءك، وواصل التدريب حسب كل مهارة.',
    dash_img_alt: 'متابعة التقدم',
    dash_exam_section: 'محاكاة الامتحان', dash_no_exam_title: 'لا يوجد امتحان منشور',
    dash_no_exam_desc: 'سيظهر هنا عندما ينشر المشرف امتحاناً.', dash_exam_desc: 'محاكاة امتحان كاملة',
    dash_exam_start: 'بدء الامتحان', dash_training_section: 'التدريب', dash_training_start: 'بدء التدريب',
    dash_no_exercises: 'لا توجد تمارين متاحة حالياً.',

    exam_page_title: 'محاكاة الامتحان', exam_no_task: 'لا توجد مهمة مرتبطة',
    exam_start_btn: 'بدء — {min} دقيقة',
    exam_desc: 'لكل Teil مؤقت خاص به. يتم اختيار التمارين من المهام التي حددها المشرف.',

    ex_correct: 'صحيح', ex_wrong: 'خطأ', ex_your_answer: 'إجابتك', ex_solution: 'الحل',
    ex_my_errors_btn: 'أخطائي', ex_retry_btn: 'إعادة', ex_translation: 'الترجمة',
    ex_correct_btn: 'تصحيح', ex_cancel_btn: 'إلغاء', ex_answer_placeholder: 'إجابتك',
    ex_page_title: 'تمرين',

    sp_page_title: 'Sprechen AI', sp_title: 'تدريب Sprechen بشكل فردي',
    sp_desc: 'يمكن للمتصفح تسجيل إجابتك، ثم تنفيذ تحليل AI على الخادم.',
    sp_topic_placeholder: 'الموضوع أو المقال أو نص الممتحن',
    sp_start_btn: 'بدء التسجيل', sp_stop_btn: 'إيقاف', sp_ai_btn: 'تحليل بواسطة AI', sp_analyzing: 'جارٍ التحليل…',

    sum_page_title: 'الملخصات', sum_keywords: 'الكلمات:', sum_strategy: 'الاستراتيجية:',
    sum_errors: 'الأخطاء الشائعة:', sum_none: 'لا توجد ملخصات بعد.',

    err_page_title: 'أخطائي', err_your_answer: 'إجابتك:', err_correct: 'صحيح:',
    err_count: '{n} خطأ', err_none: 'لا توجد أخطاء محفوظة بعد.',

    install_desc: 'يُنفَّذ مرة واحدة فقط لإنشاء حساب المشرف. بعد ذلك احذف هذه الصفحة أو أزل SETUP_KEY.',
    install_password_ph: 'كلمة مرور قوية (8 أحرف على الأقل)', install_btn: 'تثبيت',
  },
  de: {
    nav_home: 'Startseite', nav_home_student: 'Schülerbereich', nav_errors: 'Meine Fehler',
    nav_speaking: 'Sprechen AI', profile_link: 'Mein Profil', nav_logout: 'Abmelden',
    nav_services: 'Leistungen', nav_plans: 'Pläne', nav_about: 'Über uns', nav_access: 'Zugang', nav_contact: 'Kontakt', nav_mock: 'Prüfungssimulation', nav_speaking_ai: 'Sprechen AI',
    footer: 'TELC Voll – Übungsplattform für B1 · B2 · C1',
    loading: 'Wird geladen…',
    chat_page_title: 'TELC Lernassistent', chat_tag: 'TELC Voll AI',
    chat_title: 'TELC Lernassistent',
    chat_desc: 'Frage mich zur TELC-Prüfung und zu allem, was dir bei der Vorbereitung hilft: Erklärungen, Übungen, Texte, Schreiben, Sprechen, Grammatik und Wortschatz.',
    chat_welcome_title: 'TELC Lernassistent',
    chat_welcome_desc: 'Ich helfe dir beim Lernen und bei der Vorbereitung auf die TELC-Prüfung. Stelle deine Frage – ich antworte oder erstelle dir passende Übungsmaterialien.',
    chat_placeholder: 'Deine Frage zur TELC-Prüfung…', chat_send: 'Senden ↑', chat_sending: 'Antwort wird erstellt…',
    chat_note: 'Der Lernassistent ist für TELC, Prüfungsvorbereitung und damit verbundene Lernfragen gedacht.',
    chat_error: 'Der Assistent konnte keine Antwort liefern.', chat_unknown_error: 'Ein unbekannter Fehler ist aufgetreten.',
    chat_float_label: 'TELC Lernassistent',

    hero_tag: 'TELC Voll Übungsplattform',
    hero_title: 'Übe smarter. Bestehe die Prüfung mit Vertrauen.',
    hero_desc: 'Eine professionelle Plattform für die TELC Voll-Prüfung mit Training in Lesen, Hören, Sprachbausteinen, Schreiben und Sprechen.',
    hero_cta1: 'Mit Zugangscode starten', hero_cta2: 'Leistungen entdecken',
    hero_img_alt: 'Studierende bereiten sich auf die TELC Voll-Prüfung vor',

    services_title: 'Alles für deinen Prüfungserfolg an einem Ort',
    services_desc: 'Praktische Werkzeuge, klare Oberfläche und prüfungsnahes Training.',
    feature1_title: 'Prüfungssimulation', feature1_desc: 'Strukturierte Tests mit eigener Zeit für jeden Teil und sofortigem Ergebnis nach der Korrektur.',
    feature2_title: 'Training nach Fertigkeit', feature2_desc: 'Übe Lesen, Hören, Sprachbausteine, Schreiben und Sprechen einzeln.',
    feature3_title: 'Meine Fehler', feature3_desc: 'Wiederholte Fehler werden gespeichert; überprüfe die richtige Antwort und ggf. die Erklärung.',
    feature4_title: 'Sprechen AI', feature4_desc: 'Nimm deine Antwort auf und erhalte eine KI-Analyse zum Text oder Thema, das du übst.',
    feature5_title: 'Zusammenfassungen & Strategien', feature5_desc: 'Wichtige Wörter, Strategien und häufige Fehler für deine Wiederholung.',
    feature6_title: 'Fortschritt verfolgen', feature6_desc: 'Ein persönliches Dashboard, das Prüfungen, Übungen und Fortschritt an einem Ort vereint.',

    studentexp_tag: 'Lernerfahrung', studentexp_title: 'Ein Dashboard für das tägliche Lernen',
    studentexp_desc: 'Wechsle einfach zwischen Niveaus, Fertigkeiten und Übungen und setze dein Training ohne Umwege fort.',
    studentexp_card_title: 'Dein Fortschritt wird immer gespeichert', studentexp_card_desc: 'Jede Antwort und jedes Ergebnis wird automatisch erfasst, sodass du deine Entwicklung jederzeit im Dashboard verfolgen kannst.',
    studentexp_img_alt: 'Ein Student bereitet sich auf die TELC Voll-Prüfung vor',

    plans_title: 'Dein Plan beginnt hier',
    plans_desc: 'Wähle den passenden Plan; Preise und Inhalte werden vom Administrator festgelegt.',
    plans_loading: 'Pläne werden geladen…', plans_featured: 'Am beliebtesten', plans_day: 'Tag(e)',
    plans_attempts: '{n} Versuch(e)', plans_attempts_unlimited: 'Versuche je nach Verfügbarkeit',
    plans_ai_included: 'Inklusive Sprechen AI', plans_basic: 'Grundtraining', plans_use_btn: 'Code für diesen Plan verwenden',
    plans_none_title: 'Derzeit keine veröffentlichten Pläne', plans_none_desc: 'Der Administrator kann Pläne im Kontrollpanel erstellen.',
    plans_error_title: 'Pläne',

    access_tag: 'Anmeldung', access_title: 'Zugangscode eingeben',
    access_desc: 'Verwende den Zugangscode, den du vom Administrator erhalten hast, um dich anzumelden.',
    access_label: 'Zugangscode', access_btn: 'Zur Plattform anmelden',
    access_error: 'Der Zugangscode ist ungültig, oder die Sitzung wurde auf ein anderes Gerät übertragen.',

    about_title: 'Praktisches Training für die TELC Voll-Prüfung',
    about_desc: 'Eine unabhängige Trainingsplattform für B1, B2 und C1; sie ist nicht die offizielle telc-Website und vertritt nicht die offizielle Prüfungsinstanz.',

    dash_hero_tag: 'Schülerbereich', dash_welcome: 'Hallo {name}',
    dash_active: 'Dein Konto ist aktiv. Setze dein Training hier fort.',
    dash_progress_title: 'Dein Fortschritt in TELC Voll B2', dash_progress_desc: 'Mache Prüfungen, überprüfe deine Fehler und trainiere jede Fertigkeit weiter.',
    dash_img_alt: 'Fortschritt verfolgen',
    dash_exam_section: 'Prüfungssimulation', dash_no_exam_title: 'Keine veröffentlichte Prüfung',
    dash_no_exam_desc: 'Erscheint hier, sobald der Administrator eine Prüfung veröffentlicht.', dash_exam_desc: 'Vollständige Prüfungssimulation',
    dash_exam_start: 'Prüfung starten', dash_training_section: 'Training', dash_training_start: 'Training starten',
    dash_no_exercises: 'Derzeit keine Übungen verfügbar.',

    exam_page_title: 'Prüfungssimulation', exam_no_task: 'Keine verknüpfte Aufgabe',
    exam_start_btn: 'Start – {min} Min.',
    exam_desc: 'Jeder Teil hat einen eigenen Timer. Die Übungen werden aus den vom Administrator zugewiesenen Aufgaben ausgewählt.',

    ex_correct: 'Richtig', ex_wrong: 'Falsch', ex_your_answer: 'Deine Antwort', ex_solution: 'Lösung',
    ex_my_errors_btn: 'Meine Fehler', ex_retry_btn: 'Wiederholen', ex_translation: 'Übersetzung',
    ex_correct_btn: 'Korrigieren', ex_cancel_btn: 'Abbrechen', ex_answer_placeholder: 'Deine Antwort',
    ex_page_title: 'Übung',

    sp_page_title: 'Sprechen AI', sp_title: 'Individuelles Sprechen-Training',
    sp_desc: 'Der Browser kann deine Antwort aufnehmen; anschließend erfolgt die KI-Analyse auf dem Server.',
    sp_topic_placeholder: 'Thema, Text oder Prüferaussage',
    sp_start_btn: 'Aufnahme starten', sp_stop_btn: 'Stopp', sp_ai_btn: 'KI-Analyse', sp_analyzing: 'Analyse läuft…',

    sum_page_title: 'Zusammenfassungen', sum_keywords: 'Wörter:', sum_strategy: 'Strategie:',
    sum_errors: 'Häufige Fehler:', sum_none: 'Noch keine Zusammenfassungen.',

    err_page_title: 'Meine Fehler', err_your_answer: 'Deine Antwort:', err_correct: 'Richtig:',
    err_count: '{n} Fehler', err_none: 'Noch keine gespeicherten Fehler.',

    install_desc: 'Wird nur einmal ausgeführt, um das Admin-Konto zu erstellen. Danach diese Seite löschen oder SETUP_KEY entfernen.',
    install_password_ph: 'Starkes Passwort (mind. 8 Zeichen)', install_btn: 'Installieren',
  },
};

const LANG_KEY = 'telc_lang';
const THEME_KEY = 'telc_theme';

const ICON_GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'ar';
}

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyFavicon(theme = getTheme()) {
  const lightSvg = '/assets/favicon-light.svg';
  const darkSvg = '/assets/favicon-dark.svg';
  let link = document.querySelector('link[data-telc-dynamic-favicon]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.dataset.telcDynamicFavicon = '1';
    document.head.appendChild(link);
  }
  link.href = theme === 'dark' ? darkSvg : lightSvg;
  document.querySelectorAll('link[rel~="icon"][media]').forEach(x => x.disabled = true);
}

function applyTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  applyFavicon(theme);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    const label = theme === 'dark'
      ? (getLang() === 'ar' ? 'التبديل إلى الوضع النهاري' : 'Zum hellen Modus wechseln')
      : (getLang() === 'ar' ? 'التبديل إلى الوضع الليلي' : 'Zum dunklen Modus wechseln');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
}

function t(key, vars) {
  const lang = getLang();
  let str = (I18N[lang] && I18N[lang][key]) ?? (I18N.ar[key] ?? key);
  if (vars) {
    for (const k in vars) str = str.replace('{' + k + '}', vars[k]);
  }
  return str;
}

function applyI18n(root) {
  const scope = root || document;
  const lang = getLang();
  document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'de');
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.body?.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  scope.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  scope.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
  });
  const titleKey = document.body?.getAttribute('data-i18n-title');
  if (titleKey) document.title = t(titleKey);

  updateLangBtnLabel();
}

function updateLangBtnLabel() {
  const btn = document.getElementById('langSwitchBtn');
  if (!btn) return;
  const lang = getLang();
  const label = lang === 'ar' ? 'Auf Deutsch anzeigen' : 'عرض المنصة بالعربية';
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyI18n();
  applyTheme();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

// تُنشئ زر الترجمة (تبديل اللغة) وزر الوضع الليلي/النهاري معاً داخل الهيدر،
// بحيث يبقى مكانهما ثابتاً فيزيائياً في كل صفحات الموقع بغض النظر عن اللغة الحالية.
function initHeaderActions() {
  const nav = document.querySelector('.top nav');
  if (!nav || document.getElementById('langSwitchBtn')) return;

  const wrap = document.createElement('span');
  wrap.className = 'header-actions';

  const langBtn = document.createElement('button');
  langBtn.id = 'langSwitchBtn';
  langBtn.type = 'button';
  langBtn.className = 'icon-btn';
  langBtn.innerHTML = ICON_GLOBE;
  langBtn.onclick = () => setLang(getLang() === 'ar' ? 'de' : 'ar');
  wrap.appendChild(langBtn);

  const themeBtn = document.createElement('button');
  themeBtn.id = 'themeToggleBtn';
  themeBtn.type = 'button';
  themeBtn.className = 'icon-btn';
  themeBtn.onclick = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  wrap.appendChild(themeBtn);

  const top = nav.closest('.top');
  if (top?.classList.contains('exercise-topbar')) { nav.appendChild(wrap); } else { (top || nav).appendChild(wrap); }
  updateLangBtnLabel();
  applyTheme();
}

// طبّق فوراً لتفادي وميض المحتوى، ثم أعد التطبيق عند اكتمال الصفحة.
applyI18n();
applyTheme();
document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  initHeaderActions();
});

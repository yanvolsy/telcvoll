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
    hero_desc: 'منصة تدريب احترافية لمحاكاة امتحان TELC ',
    hero_cta1: 'ابدأ التدريب الآن', hero_cta2: 'اكتشف الخدمات',
    hero_img_alt: 'طلاب يستعدون لامتحان TELC Voll',

    services_title: 'كل ما تحتاجه للنجاح في مكان واحد',
    services_desc: 'أدوات عملية، واجهة واضحة، وتجربة تدريب قريبة من الامتحان الحقيقي.',
    feature1_title: 'جميع المواضيع المسربة الصحيحة مع الحل', feature1_desc: 'تدرّب على مواضيع TELC المتوفرة مع الحلول والتصحيح لتعرف كيف تُجاب الأسئلة بالشكل الصحيح.',
    feature2_title: 'محاكاة حقيقية لامتحان TELC', feature2_desc: 'محاكاة منظمة بوقت وتقسيم قريب من تجربة الامتحان الفعلية، مع نتيجة واضحة في النهاية.',
    feature3_title: 'Meine Fehler', feature3_desc: 'احتفظ بالأخطاء المتكررة وراجع الإجابة الصحيحة والتفسير عند توفره.',
    feature4_title: 'مساعد TELC بالذكاء الاصطناعي', feature4_desc: 'مساعد متخصص للبحث والحوار وتعلّم اللغة الألمانية، مع أدوات تساعدك أثناء التدريب.',
    feature6_title: 'تصحيح المواضيع بالذكاء الاصطناعي', feature6_desc: 'حلّل أخطاءك، افهم سبب الخطأ، واحصل على إجابة نموذجية تساعدك على تحسين مستواك.',

    studentexp_tag: 'تجربة الطالب', studentexp_title: 'لوحة تحكم مصممة للدراسة اليومية',
    studentexp_desc: 'تدرّب، حاكي الامتحان، استخدم المساعد الذكي وتابع أخطاءك وتقدمك من واجهة واحدة واضحة.',
    studentexp_card_title: 'تقدّمك محفوظ دائماً', studentexp_card_desc: 'كل إجابة وكل نتيجة تُسجَّل تلقائياً، ويمكنك متابعة تطورك في أي وقت من لوحة التحكم.',
    studentexp_img_alt: 'طالب يستعد لامتحان TELC Voll',

    home_plans_tag: 'الخطط', home_plans_title: 'اختر المدة التي تناسب تدريبك', home_plans_desc: 'خطط واضحة، وصول شامل إلى مستويات B1 وB2 وC1، ومحاكاة الامتحان والمساعد الذكي.', home_plans_fallback: 'تعذر تحميل الأسعار الآن.',
    home_ai_tag: 'مساعد TELC', home_ai_title: 'ذكاء اصطناعي يفهم هدفك.', home_ai_desc: 'ابحث، اسأل، حاور، واطلب شرحًا أو تدريبًا مخصصًا. الواجهة مصممة لتشعر كأن المساعد جزء طبيعي من رحلتك داخل TELC Voll.', home_ai_point1: 'بحث وفهم سريع للسؤال', home_ai_point2: 'حوار وتدريب باللغة الألمانية', home_ai_point3: 'شرح وأمثلة وتمارين قابلة للتخصيص', home_ai_live: 'متصل الآن', home_ai_q: 'اشرح لي الفرق بين weil و denn', home_ai_a: 'weil و denn يربطان السبب، لكن ترتيب الكلمات يختلف. سأعطيك مثالين ثم تدريبًا قصيرًا.', home_ai_q2: 'ومتى أستخدم weil ومتى أستخدم denn؟', home_ai_a2: 'استخدم weil عندما يأتي الفعل في نهاية الجملة، بينما مع denn يبقى الفعل في المرتبة الثانية. سأعطيك مثالًا بسيطًا لكل منهما.' home_ai_placeholder: 'اكتب سؤالك…',
    home_studio_tag: 'Sprechen Studio', home_studio_title: 'تدرّب على التحدث وكأنك داخل الامتحان', home_studio_desc: 'سجّل إجابتك، راقب الموجة الصوتية، ثم احصل على تحليل واضح يساعدك على تحسين النطق والبنية وطريقة الإجابة.', home_studio_point1: 'تسجيل الإجابة داخل المتصفح', home_studio_point2: 'تحليل AI للنتيجة ونقاط التحسين', home_studio_point3: 'توجيه عملي قبل المحاولة التالية', home_studio_topic: 'Thema: Meinung und Alltag', home_studio_score: 'تحليل جاهز', home_studio_feedback1: 'النطق', home_studio_feedback2: 'البنية',
    home_final_tag: 'ابدأ الآن', home_final_title: 'كل أدوات TELC Voll أمامك في مكان واحد', home_final_desc: 'ابدأ بحساب مجاني وتعرّف على تجربة التدريب قبل الاشتراك.',
    plans_title: 'خطتك تبدأ من هنا',
    plans_desc: 'اختر الخطة المناسبة لك؛ الأسعار والمحتوى يحددهما المشرف.',
    plans_loading: 'جارٍ تحميل الخطط…', plans_featured: 'الأكثر اختياراً', plans_day: 'يوم',
    plans_attempts: '{n} محاولة', plans_attempts_unlimited: 'محاولات حسب الإتاحة',
    plans_ai_included: 'يشمل Sprechen AI', plans_basic: 'التدريب الأساسي', plans_use_btn: 'ابدأ بهذه الخطة',
    plans_none_title: 'لا توجد خطط منشورة حالياً', plans_none_desc: 'يمكن للمشرف إنشاء الخطط من لوحة التحكم.',
    plans_error_title: 'الخطط',

    access_tag: 'حساب الطالب', access_title: 'سجّل الدخول إلى حسابك',
    access_desc: 'سجّل الدخول بحسابك للوصول إلى المنصة.',
    access_label: 'البريد الإلكتروني', access_btn: 'دخول إلى المنصة',
    access_error: 'بيانات تسجيل الدخول غير صالحة أو انتهت الجلسة.',

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
    time_left: 'الوقت المتبقي',

    ex_correct: 'صحيح', ex_wrong: 'خطأ', ex_your_answer: 'إجابتك', ex_solution: 'الحل',
    ex_my_errors_btn: 'أخطائي', ex_retry_btn: 'إعادة', ex_translation: 'الترجمة',
    ex_correct_btn: 'تصحيح', ex_cancel_btn: 'إلغاء', ex_answer_placeholder: 'إجابتك',
    ex_page_title: 'تمرين',

    sp_page_title: 'Sprechen AI', sp_title: 'تدريب Sprechen بشكل فردي',
    sp_desc: 'يمكن للمتصفح تسجيل إجابتك، ثم تنفيذ تحليل AI على الخادم.',
    sp_topic_placeholder: 'الموضوع أو المقال أو نص الممتحن',
    sp_start_btn: 'بدء التسجيل', sp_stop_btn: 'إيقاف', sp_ai_btn: 'تحليل بواسطة AI', sp_analyzing: 'جارٍ التحليل…',

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
    hero_desc: 'Eine professionelle Plattform für die TELC',
    hero_cta1: 'Jetzt mit dem Training starten', hero_cta2: 'Leistungen entdecken',
    hero_img_alt: 'Studierende bereiten sich auf die TELC Voll-Prüfung vor',

    services_title: 'Alles für deinen Prüfungserfolg an einem Ort',
    services_desc: 'Praktische Werkzeuge, klare Oberfläche und prüfungsnahes Training.',
    feature1_title: 'Alle verfügbaren TELC-Themen mit Lösungen', feature1_desc: 'Trainiere mit den richtigen verfügbaren Themen und Lösungen, um Fragen gezielt zu üben und die passende Antwortweise zu verstehen.',
    feature2_title: 'Realistische TELC-Prüfungssimulation', feature2_desc: 'Eine Prüfungssimulation mit Zeitvorgaben und klarer Struktur, die der echten TELC-Prüfung möglichst nahekommt.',
    feature3_title: 'Meine Fehler', feature3_desc: 'Wiederholte Fehler werden gespeichert; überprüfe die richtige Antwort und ggf. die Erklärung.',
    feature4_title: 'TELC-Assistent mit KI', feature4_desc: 'Eine spezialisierte KI für Recherche, Dialog und Deutschlernen, die dich während des Trainings begleitet.',
    feature6_title: 'KI-Korrektur für deine Texte', feature6_desc: 'Verstehe deine Fehler, erfahre warum sie entstehen und erhalte eine Musterantwort zur Verbesserung deiner Übungen.',

    studentexp_tag: 'Lernerfahrung', studentexp_title: 'Ein Dashboard für das tägliche Lernen',
    studentexp_desc: 'Wechsle einfach zwischen Niveaus, Fertigkeiten und Übungen und setze dein Training ohne Umwege fort.',
    studentexp_card_title: 'Dein Fortschritt wird immer gespeichert', studentexp_card_desc: 'Jede Antwort und jedes Ergebnis wird automatisch erfasst, sodass du deine Entwicklung jederzeit im Dashboard verfolgen kannst.',
    studentexp_img_alt: 'Ein Student bereitet sich auf die TELC Voll-Prüfung vor',

    home_plans_tag: 'Pläne', home_plans_title: 'Wähle die Trainingsdauer, die zu dir passt', home_plans_desc: 'Klare Tarife mit vollständigem Zugang zu B1, B2, C1, Prüfungssimulation und KI-Assistent.', home_plans_fallback: 'Preise können gerade nicht geladen werden.',
    home_ai_tag: 'TELC Assistent', home_ai_title: 'KI, die dein Ziel versteht.', home_ai_desc: 'Recherchiere, frage, dialogiere und fordere Erklärungen oder personalisierte Übungen an. Die Oberfläche fühlt sich wie ein natürlicher Teil deiner TELC-Voll-Lernreise an.', home_ai_point1: 'Schnelle Suche und Verständnis', home_ai_point2: 'Dialog und Training auf Deutsch', home_ai_point3: 'Erklärungen, Beispiele und anpassbare Übungen', home_ai_live: 'Jetzt verbunden', home_ai_q: 'Erkläre mir den Unterschied zwischen weil und denn', home_ai_a: 'weil und denn verbinden einen Grund, aber die Wortstellung ist unterschiedlich. Ich zeige dir zwei Beispiele und danach eine kurze Übung.', home_ai_placeholder: 'Deine Frage…',
    home_studio_tag: 'Sprechen Studio', home_studio_title: 'Trainiere das Sprechen wie in der Prüfung', home_studio_desc: 'Nimm deine Antwort auf, beobachte die Sprachwelle und erhalte eine klare Analyse zu Aussprache, Struktur und Antwortstrategie.', home_studio_point1: 'Antwort direkt im Browser aufnehmen', home_studio_point2: 'KI-Analyse mit konkreten Verbesserungen', home_studio_point3: 'Praktisches Feedback für den nächsten Versuch', home_studio_topic: 'Thema: Meinung und Alltag', home_studio_score: 'Analyse bereit', home_studio_feedback1: 'Aussprache', home_studio_feedback2: 'Struktur',
    home_final_tag: 'Jetzt starten', home_final_title: 'Alle TELC-Voll-Werkzeuge an einem Ort', home_final_desc: 'Erstelle ein kostenloses Konto und entdecke die Trainingsoberfläche vor dem Abonnement.',
    plans_title: 'Dein Plan beginnt hier',
    plans_desc: 'Wähle den passenden Plan; Preise und Inhalte werden vom Administrator festgelegt.',
    plans_loading: 'Pläne werden geladen…', plans_featured: 'Am beliebtesten', plans_day: 'Tag(e)',
    plans_attempts: '{n} Versuch(e)', plans_attempts_unlimited: 'Versuche je nach Verfügbarkeit',
    plans_ai_included: 'Inklusive Sprechen AI', plans_basic: 'Grundtraining', plans_use_btn: 'Mit diesem Plan starten',
    plans_none_title: 'Derzeit keine veröffentlichten Pläne', plans_none_desc: 'Der Administrator kann Pläne im Kontrollpanel erstellen.',
    plans_error_title: 'Pläne',

    access_tag: 'Anmeldung', access_title: 'In dein Konto einloggen',
    access_desc: 'Melde dich mit deinem Konto an, um die Plattform zu nutzen.',
    access_label: 'E-Mail-Adresse', access_btn: 'Zur Plattform anmelden',
    access_error: 'Die Anmeldedaten sind ungültig oder die Sitzung ist abgelaufen.',

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
    time_left: 'Verbleibende Zeit',

    ex_correct: 'Richtig', ex_wrong: 'Falsch', ex_your_answer: 'Deine Antwort', ex_solution: 'Lösung',
    ex_my_errors_btn: 'Meine Fehler', ex_retry_btn: 'Wiederholen', ex_translation: 'Übersetzung',
    ex_correct_btn: 'Korrigieren', ex_cancel_btn: 'Abbrechen', ex_answer_placeholder: 'Deine Antwort',
    ex_page_title: 'Übung',

    sp_page_title: 'Sprechen AI', sp_title: 'Individuelles Sprechen-Training',
    sp_desc: 'Der Browser kann deine Antwort aufnehmen; anschließend erfolgt die KI-Analyse auf dem Server.',
    sp_topic_placeholder: 'Thema, Text oder Prüferaussage',
    sp_start_btn: 'Aufnahme starten', sp_stop_btn: 'Stopp', sp_ai_btn: 'KI-Analyse', sp_analyzing: 'Analyse läuft…',

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
  return localStorage.getItem(THEME_KEY) || 'dark';
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
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    if (!themeColorMeta.dataset.lightThemeColor) themeColorMeta.dataset.lightThemeColor = themeColorMeta.content || '#f7faf9';
    themeColorMeta.content = theme === 'dark' ? '#080808' : themeColorMeta.dataset.lightThemeColor;
  }
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
  if (document.getElementById('langSwitchBtn')) return;

  const header = document.querySelector('.top, .auth-nav, .admin-nav, .exercise-topbar, header');
  if (!header) return;

  let wrap = header.querySelector('.header-actions');
  const isNew = !wrap;
  if (!wrap) {
    wrap = document.createElement('span');
    wrap.className = 'header-actions';
  }

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

  if (isNew) {
    header.appendChild(wrap);
  }
  updateLangBtnLabel();
  applyTheme();
}

window.text = window.text || function(ar, de) {
  return (typeof getLang === 'function' && getLang() === 'de') ? de : ar;
};

// طبّق فوراً لتفادي وميض المحتوى، ثم أعد التطبيق عند اكتمال الصفحة.
applyI18n();
applyTheme();
document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  initHeaderActions();
});

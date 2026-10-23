// My gym's own strings, Arabic first, English as the fallback for every other app language.
// Kept apart from openGym's locale packs (src/locales) so an upstream update never conflicts
// with them, and so check-source-strings.mjs (which reads the string in every t() call) does
// not ask every openGym language for strings only this fork shows. Keys are short ids.

import { getLang } from '../lib/i18n.js'

const AR = {
  appName: 'My gym',
  // tabs
  'tab.today': 'اليوم', 'tab.library': 'المكتبة', 'tab.start': 'ابدأ', 'tab.resume': 'استأنف', 'tab.progress': 'التقدّم', 'tab.joints': 'المفاصل',
  // sessions
  'session.A': 'علوي: سحب وقوة + شادو', 'session.B': 'سفلي + لياقة', 'session.C': 'علوي: شكل V + كيس', 'session.D': 'سفلي انفجاري + جاهزية النزال', 'session.E': 'ملاكمة ولياقة + ذراعين',
  'session.day': 'اليوم {0}', 'session.optional': 'اختيارية', 'session.min': '≈ {0} دقيقة', 'session.exercises': '{0} تمارين',
  'routine.name': '{0}. {1}',
  // today
  'today.hello': 'أهلاً', 'today.go': 'يلّا', 'today.suggested': 'مقترح اليوم', 'today.start': 'ابدأ', 'today.resume': 'استأنف الجلسة',
  'today.week': 'التزامك هذا الأسبوع', 'today.ofSessions': 'من 4 جلسات', 'today.days': 'أيام البرنامج', 'today.done': 'تم', 'today.notYet': 'لم يبدأ', 'today.next': 'التالي',
  'today.last': 'آخر تمرين: {0}', 'today.empty': 'لا توجد جلسات بعد', 'today.emptyHint': 'سجلّك يبدأ مع أول تمرين. ابدأ باليوم A، ويأخذ تقريباً 45 دقيقة.',
  'today.programWeek': 'الأسبوع {0} · {1}', 'today.free': 'نشاط حر', 'today.freeHint': 'حبل أو شادو أو مشي خارج البرنامج',
  'today.optionalCard': 'الجلسة E اختيارية', 'today.optionalHint': 'ملاكمة ولياقة وذراعين. لا تؤثر على الدور إذا تركتها.',
  'phase.foundation': 'الأساس', 'phase.build': 'البناء', 'phase.deload': 'أسبوع تخفيف', 'phase.power': 'القوة والانفجار',
  'deload.banner': 'أسبوع تخفيف: نصف المجموعات، ونفس الأوزان، وجهد أسهل. لا يُحسب للتطور.',
  'deload.early': 'تخفيف مبكر لسبعة أيام: نصف المجموعات، ونفس الأوزان، وجهد أسهل. بعدها يعود البرنامج كما كان.',
  'deload.signTitle': 'علامة تخفيف مبكر', 'deload.signPain': 'سجّلت ألماً 4 أو أكثر في آخر جلستين. خفّف سبعة أيام، وراقب المفصل في صفحة المفاصل.',
  'deload.start': 'خفّف 7 أيام', 'deload.title': 'تخفيف مبكر', 'deload.signs': 'خفّف قبل موعده إذا ظهرت علامة من هذه:', 'deload.until': 'التخفيف يعمل حتى {0}',
  'deload.s1': 'تراجعت الأوزان أو التكرارات في 3 تمارين أو أكثر، جلستين متتاليتين', 'deload.s2': 'نوم أسوأ من المعتاد، أو تعب دائم، لمدة أسبوع',
  'deload.s3': 'ألم مفصل 4 أو أكثر يتكرر في جلستين', 'deload.s4': 'الجهد المطلوب لم يعد ممكناً رغم الراحة، جلستين',
  'ready.again': 'مرّت سنة على أسئلة الصحة', 'ready.againHint': 'أجب عنها مرة أخرى، تأخذ دقيقة',
  'return.week': 'عدت بعد أسبوع: نفس الأوزان، واجعل الجهد أسهل بتكرار.', 'return.weeks': 'عدت بعد انقطاع: الأوزان −10% ومجموعة أقل في كل تمرين لمدة أسبوع.', 'return.month': 'عدت بعد أكثر من 4 أسابيع: الأوزان −20%، وأعد الاختبارات هذا الأسبوع.',
  'backup.title': 'خذ نسخة احتياطية', 'backup.body': 'بياناتك على هذا الجهاز فقط. آخر نسخة: {0}.', 'backup.never': 'لم تأخذ نسخة بعد', 'backup.now': 'احفظ نسخة الآن', 'backup.later': 'لاحقاً', 'backup.done': 'تم حفظ النسخة الاحتياطية',
  'backup.restore': 'الاستعادة: الإعدادات ← البيانات والنسخ الاحتياطي ← استيراد نسخة احتياطية', 'backup.days': 'قبل {0} يوم',
  'tests.due': 'وقت الاختبارات الدورية', 'tests.dueHint': 'الأسبوع {0}: قوة ولياقة ومرونة والخصر. 10 دقائق تقريباً.', 'tests.open': 'افتح الاختبارات',
  // session screen
  'block.warmup': 'إحماء وحماية المفاصل', 'block.boxing': 'ملاكمة', 'block.work': 'تمارين المقاومة', 'block.inRest': 'في الراحة', 'block.finish': 'لياقة وحماية', 'block.stretch': 'إطالة', 'block.ankle': 'تأهيل الكاحل (المرحلة {0})',
  'kind.shadow-light': 'شادو خفيف بدون نط', 'kind.rope-or-shadow': 'حبل خفيف أو شادو خفيف', 'kind.shadow': 'شادو تقني', 'kind.bag': 'كيس: درس الأسبوع والقوة', 'kind.bag-intervals': 'كيس: مراجعة بفترات',
  'kind.conditioning': 'لياقة بفترات', 'kind.circuit': 'دائرة النزال', 'kind.protect': 'حماية الركبة', 'kind.mobility': 'سلسلة حركة قصيرة',
  'start.session': 'ابدأ الجلسة', 'start.timer': 'ابدأ المؤقت', 'session.lesson': 'درس الأسبوع: {0}', 'session.review': 'مراجعة الدروس التي أنهيتها',
  'wraps': 'لفّ اليدين والقفاز قبل الكيس', 'brace': 'الدعامة أو الشريط على الكاحل في أيام القفز والكيس',
  'mark.done': 'تم', 'dose.sets': '{0} × {1}', 'dose.side': 'لكل جهة', 'dose.each': 'لكل اتجاه', 'dose.min': '{0} د', 'dose.sec': '{0} ث',
  'rest.sec': 'راحة {0} ث', 'during': 'أثناء راحة {0}',
  // notes in routines (ladders, gates)
  'note.band-heavy': 'شريط قوي', 'note.band-light': 'شريط خفيف', 'note.slow-negative': 'نزول بطيء 5 ث', 'note.eccentric-only': 'نزول فقط 3 ث', 'note.band-heavy-partial': 'شريط قوي، مدى جزئي',
  'note.pause-2s': 'ثبات ثانيتين في الأسفل', 'note.wall-hand': 'يد على الحائط (مرحلة الكاحل 1)', 'note.wall-hand-2w': 'يد على الحائط أول أسبوعين', 'note.slow': 'ببطء', 'note.no-jump': 'بدون قفز',
  'note.light-band': 'شريط خفيف', 'note.floor-by-wall': 'على الأرض بجانب الحائط', 'note.eyes-closed-or-pillow': 'عينان مغمضتان أو على وسادة', 'note.stronger-band': 'شريط أقوى', 'note.each-direction': 'لكل اتجاه', 'note.stick-landing': 'ثبات في الهبوط',
  'gate.phase': 'مرحلة الكاحل {0}: {1}',
  // timer
  'timer.work': 'عمل', 'timer.rest': 'راحة', 'timer.round': 'الجولة {0} من {1}', 'timer.next': 'بعدها: {0}', 'timer.pause': 'إيقاف مؤقت', 'timer.resume': 'استئناف', 'timer.stop': 'إنهاء',
  'timer.done': 'انتهت الجولات', 'timer.effort': 'كم كان الجهد من 10؟', 'timer.guard': 'بقيت الحراسة مرفوعة؟', 'timer.save': 'احفظ', 'timer.saved': 'الجولات المسجّلة: {0}', 'timer.lesson': 'افتح الدرس', 'timer.bursts': '3 × 20 ث سرعة',
  'box.round': 'المرة القادمة: جولة إضافية', 'box.length': 'المرة القادمة: الجولة أطول 30 ث', 'box.difficulty': 'المرة القادمة: نفس الجولات بتركيبة أصعب', 'box.same': 'المرة القادمة: نفس المستوى', 'rope.next': 'الحبل المرة القادمة: المستوى {0}',
  'timer.ankle': 'ألم الكاحل الآن (0 إلى 10)', 'timer.locked': 'الحبل يعود في المرحلة 3 للكاحل. البديل: {0}', 'timer.circuit': '30 ث لكل حركة',
  'yes': 'نعم', 'no': 'لا', 'close': 'إغلاق', 'back': 'رجوع', 'save': 'حفظ', 'cancel': 'إلغاء', 'example': 'مثال', 'open': 'افتح', 'nOf': '{0} من {1}', 'sep': '، ',
  // footwork
  'foot.flat': 'القدمان على الأرض، بدون نط، خطوات صغيرة', 'foot.step-drag': 'خطوة وسحب، ودوران خفيف على القدم الأمامية', 'foot.light-bounce': 'نطّ خفيف على مقدمة القدم', 'foot.full': 'حركة قدمين كاملة',
  // library
  'lib.exercises': 'التمارين', 'lib.lessons': 'دروس الملاكمة', 'lib.lessonsHint': 'درس جديد كل أسبوع. قيّم تحكمك 7 من 10 أو أكثر لينفتح الدرس التالي.',
  'lesson.week': 'الأسبوع {0}', 'lesson.steps': 'الخطوات', 'lesson.mistake': 'أشهر خطأ', 'lesson.ring': 'فائدته في الحلبة', 'lesson.defense': 'فائدته في الدفاع عن النفس',
  'lesson.rate': 'قيّم تحكمك في هذا الدرس', 'lesson.learned': 'أنهيت هذا الدرس', 'lesson.current': 'درس هذا الأسبوع', 'lesson.locked': 'يفتح لاحقاً', 'lesson.ankle': 'يحتاج مرحلة الكاحل {0}', 'lesson.practice': 'ابدأ التدريب', 'lesson.bag': 'طبّق درس الأسبوع على الكيس بخفة وتحكم',
  // progress
  'prog.title': 'التقدّم', 'prog.weight': 'متوسط الوزن الأسبوعي', 'prog.rate': '{0}% أسبوعياً', 'prog.rateHint': 'الهدف: خسارة 0.5 إلى 0.7% أسبوعياً', 'prog.waist': 'محيط الخصر',
  'prog.tests': 'الاختبارات الدورية', 'prog.noTests': 'لا توجد اختبارات بعد', 'prog.logWeight': 'سجّل الوزن', 'prog.logWaist': 'سجّل الخصر', 'prog.details': 'الإحصائيات التفصيلية', 'prog.history': 'السجل',
  'prog.ladders': 'السلالم', 'prog.ankle': 'مرحلة الكاحل', 'prog.week': 'أسبوع البرنامج', 'prog.up': 'تقدّم', 'prog.same': 'ثبات', 'prog.down': 'تراجع',
  'ladder.pullup': 'سلّم العقلة', 'ladder.pushup': 'سلّم الضغط', 'ladder.knee': 'حماية الركبة', 'ladder.goblet': 'السكوات', 'ladder.rung': 'الدرجة {0} من {1}',
  'ladder.due': 'وصلت لأعلى الدرجة جلستين متتاليتين. انتقل للدرجة التالية: {0}', 'ladder.move': 'انتقل', 'ladder.stay': 'ابقَ',
  'light.title': 'وصلت لأثقل دمبل (24 كغ)', 'light.body': 'الخطوات بالترتيب: تكرارات حتى 20، ثم نزول 3–4 ث، ثم توقف ثانيتين، ثم تكرار ونصف، ثم يد أو رجل واحدة، ثم البديل الأصعب.',
  'test.pullups': 'أقصى عدد عقلة (أو ثوانٍ تعلق)', 'test.pushups': 'أقصى عدد ضغط', 'test.hrRecovery': 'هبوط النبض بعد دقيقة من 3 د شادو سريع', 'test.ropeMinute': 'نطات الحبل في دقيقة', 'test.broadJump': 'القفز الطويل من الثبات',
  'test.kneeWallL': 'الركبة إلى الحائط، اليسرى', 'test.kneeWallR': 'الركبة إلى الحائط، اليمنى', 'test.thomas': 'اختبار توماس: الفخذ يلمس السطح', 'test.toeTouch': 'لمس الأرض واقفاً (سم من الأرض)', 'test.backScratch': 'خدش الظهر (سم بين اليدين)', 'test.waist': 'محيط الخصر عند السرة',
  'unit.reps': 'تكرار', 'unit.bpm': 'نبضة', 'unit.jumps': 'نطة', 'unit.cm': 'سم', 'unit.pass': 'نعم/لا', 'unit.kg': 'كغ',
  'tests.title': 'الاختبارات الدورية', 'tests.save': 'احفظ النتائج', 'tests.saved': 'حُفظت النتائج', 'tests.hint': 'اترك أي اختبار لا تستطيع إجراءه اليوم فارغاً.',
  // joints
  'joints.title': 'صحة المفاصل', 'joints.log': 'سجّل الألم', 'joints.today': 'ألم اليوم', 'joints.plan': 'خطة الحماية', 'joints.flags': 'علامات تستوجب التوقف ومراجعة مختص', 'joints.rule': 'قاعدة الألم',
  'joint.shoulder': 'الكتف', 'joint.wrist': 'الرسغ واليد', 'joint.elbow': 'المرفق', 'joint.neck': 'الرقبة', 'joint.back': 'أسفل الظهر', 'joint.hip': 'الورك', 'joint.knee': 'الركبة', 'joint.ankle': 'الكاحل',
  'zone.ok': 'مقبول: استمر، بشرط أن يعود لطبيعته صباحاً', 'zone.ease': 'خفّف: قلّل المدى أو الوزن، أو بدّل بالبديل', 'zone.stop': 'أوقف التمرين الذي سبّب الألم اليوم',
  'pain.ctx': 'متى؟', 'pain.ctx.during': 'أثناء التمرين', 'pain.ctx.morning': 'صباح اليوم التالي', 'pain.ctx.rest': 'وقت الراحة', 'pain.saved': 'سُجّل الألم', 'pain.none': 'لا يوجد تسجيل',
  'morning.step-back': 'الألم أعلى من المعتاد: ارجع خطوة في التمرين الذي سبّبه.', 'morning.carry-on': 'مثل المعتاد: استمر.', 'morning.see-specialist-if-it-stays': 'ألم 6 أو أكثر: إذا استمر، راجع مختصاً.',
  'risk.shoulder': 'تكرار اللكم للأمام والضغط', 'risk.wrist': 'ضرب الكيس بزاوية خاطئة أو بدون لفّ', 'risk.elbow': 'فرد الذراع بعنف في الشادو، وكثرة العقلة', 'risk.neck': 'الضربات وحركة الرأس، والجلوس الطويل',
  'risk.back': 'أخطاء الرفعة الرومانية والسوينغ مع التعب', 'risk.hip': 'الوقفة القتالية والدوران، والجلوس الطويل', 'risk.knee': 'الهبوط من القفز، وانهيار الركبة في الاندفاع', 'risk.ankle': 'الحبل والقفز ودوران القدم في الملاكمة',
  'flag.new-sprain-cannot-walk': 'التواء جديد ولا تستطيع المشي 4 خطوات، أو ألم عند الضغط على عظم الكاحل: راجع طبيباً اليوم',
  'flag.gives-way-twice': 'الكاحل «يخون» مرتين أو أكثر خلال أسبوعين رغم التأهيل', 'flag.unstable-after-3-months': 'بقاء عدم الثبات بعد 3 أشهر من التأهيل المنتظم',
  'flag.sharp-pain-pop': 'ألم حاد مفاجئ، أو صوت طقطقة مع ألم', 'flag.swelling-growing': 'تورّم يزيد بدل أن يقل', 'flag.numb-weak-cold': 'تنميل، أو ضعف مفاجئ، أو برودة في اليد أو القدم',
  'flag.locks': 'المفصل ينقفل', 'flag.night-pain-or-2-weeks': 'ألم ليلي يوقظك، أو ألم يستمر أكثر من أسبوعين رغم التخفيف', 'flag.chest-dizzy-breath': 'ألم في الصدر، أو دوخة، أو ضيق نفس غير طبيعي: توقف فوراً واطلب مساعدة',
  'ankle.title': 'تأهيل الكاحل', 'ankle.phase': 'المرحلة {0} من 4', 'ankle.p1': 'تحكم وقوة أساسية', 'ankle.p2': 'توازن وقوة', 'ankle.p3': 'قفز تدريجي', 'ankle.p4': 'عودة كاملة ووقاية',
  'ankle.test': 'اختبار الانتقال', 'ankle.testHint': 'أجرِ الاختبار عندما تشعر أنك جاهز، مرة في الأسبوع على الأكثر.', 'ankle.pass': 'نجحت! انتقلت إلى المرحلة {0}.', 'ankle.fail': 'لم تكتمل الشروط بعد. ركّز على: {0}', 'ankle.final': 'المرحلة الأخيرة: استمر بالتوازن ورفع السمانة للوقاية.',
  'ankle.sprain': 'التوى كاحلي من جديد', 'ankle.sprainDone': 'رجعت للمرحلة 1. إذا لم تستطع المشي 4 خطوات، راجع طبيباً اليوم.', 'ankle.drills': 'تمارين المرحلة', 'ankle.allowed': 'المسموح في مرحلتك',
  'crit.pain': 'الألم (0 إلى 10)', 'crit.holdOpen': 'الوقوف على المصابة، عينان مفتوحتان (ث)', 'crit.holdClosed': 'الوقوف على المصابة، عينان مغمضتان (ث)', 'crit.calfInjured': 'رفع السمانة على المصابة (عدد)', 'crit.calfOther': 'رفع السمانة على السليمة (عدد)',
  'crit.kneeWallDiff': 'فرق الركبة إلى الحائط بين الرجلين (سم)', 'crit.reachDiff': 'فرق الوصول في 3 اتجاهات (سم، أسوأ اتجاه)', 'crit.confidence': 'ثقتك بالكاحل (0 إلى 10)',
  'crit.sideHopInjured': 'القفز الجانبي على المصابة: 10 قفزات فوق خط 30 سم (ث)', 'crit.sideHopOther': 'القفز الجانبي على السليمة (ث)', 'crit.sideHopFear': 'شعرت بخوف أو تردد في القفز', 'crit.ropeMinutes': 'دقائق حبل متصلة بدون ألم',
  'allow.bulgarian': 'سكوات بلغاري', 'allow.lunge': 'اندفاع خلفي', 'allow.rope': 'الحبل', 'allow.burpee': 'بيربي', 'allow.slrdl': 'ديدلفت برجل واحدة',
  // readiness / onboarding
  'ready.title': 'قبل أن نبدأ', 'ready.disclaimer': 'هذا التطبيق برنامج تمارين عام، وليس بديلاً عن الطبيب. لا يشخّص ولا يعالج.', 'ready.intro': 'سبعة أسئلة قصيرة عن صحتك، مبنية على موضوعات استبيان PAR-Q+.',
  'ready.official': 'الاستبيان الرسمي PAR-Q+', 'ready.next': 'التالي', 'ready.start': 'ابدأ البرنامج',
  'q.heart': 'هل قال لك طبيب إن عندك مشكلة في القلب أو ارتفاعاً في ضغط الدم؟', 'q.chest-pain': 'هل تشعر بألم في الصدر وأنت مرتاح، أو في يومك العادي، أو أثناء النشاط؟',
  'q.dizzy': 'هل فقدت توازنك بسبب دوخة، أو فقدت الوعي، في آخر 12 شهراً؟', 'q.chronic': 'هل عندك مرض مزمن آخر شخّصه طبيب؟', 'q.medication': 'هل تأخذ أدوية لمرض مزمن؟',
  'q.joint': 'هل عندك الآن (أو في آخر 12 شهراً) مشكلة في عظم أو مفصل أو عضلة قد تزيد مع النشاط؟', 'q.supervised': 'هل قال لك طبيب ألا تتمرن إلا تحت إشراف طبي؟',
  'ready.clear': 'لا شيء يمنع البدء. ابدأ بهدوء، وراقب جسمك.', 'ready.joint-only': 'عندك مشكلة مفصل (الكاحل). البرنامج فيه تأهيل لها، لكن استشر أخصائي علاج طبيعي إذا لم تفعل بعد.',
  'ready.see-doctor': 'أجبت بنعم على سؤال أو أكثر. استشر طبيبك قبل أن تبدأ أو تزيد شدة التمرين.',
  'base.title': 'نقطة البداية', 'base.pullup': 'العقلة الآن', 'base.pushup': 'الضغط الآن (عدد متصل بشكل صحيح)',
  'base.pull.0': 'لا أستطيع التعلق 20 ثانية', 'base.pull.1': 'أتعلق، لكن لا أستطيع عقلة', 'base.pull.4': '1 إلى 4 عقلات', 'base.pull.5': '5 أو أكثر',
  'base.push.0': 'أقل من 5', 'base.push.1': '5 إلى 11', 'base.push.2': '12 إلى 19', 'base.push.3': '20 أو أكثر',
  'base.ankle': 'الكاحل الآن', 'base.ankle.1': 'يؤلمني في المشي أو الدرج، أو التواء حديث', 'base.ankle.2': 'لا ألم في المشي، لكن أشعر بعدم ثبات',
  'base.ankleHint': 'تبدأ بالمرحلة 1 في الحالتين. إذا نجحت في اختبارها من أول جلسة، تنتقل للثانية مباشرة.',
  // free activity
  'free.title': 'نشاط حر', 'free.rope': 'حبل', 'free.shadow': 'شادو', 'free.walk': 'مشي', 'free.minutes': '{0} د', 'free.saved': 'سُجّل: {0} {1} دقيقة', 'free.ropeLocked': 'الحبل بعد المرحلة 3 للكاحل',
  // settings / about
  'about.based': 'مبني على openGym', 'about.source': 'الكود المصدري لهذه النسخة', 'about.licence': 'AGPL-3.0',
  'minibar.resume': 'ارجع للجلسة',
}

const EN = {
  appName: 'My gym',
  'tab.today': 'Today', 'tab.library': 'Library', 'tab.start': 'Start', 'tab.resume': 'Resume', 'tab.progress': 'Progress', 'tab.joints': 'Joints',
  'session.A': 'Upper: pull & strength + shadow', 'session.B': 'Lower + conditioning', 'session.C': 'Upper: V-shape + bag', 'session.D': 'Explosive lower + fight readiness', 'session.E': 'Boxing, conditioning + arms',
  'session.day': 'Day {0}', 'session.optional': 'Optional', 'session.min': '≈ {0} min', 'session.exercises': '{0} exercises', 'routine.name': '{0}. {1}',
  'today.hello': 'Hello', 'today.go': 'Let’s go', 'today.suggested': 'Today’s session', 'today.start': 'Start', 'today.resume': 'Resume session',
  'today.week': 'This week', 'today.ofSessions': 'of 4 sessions', 'today.days': 'Programme days', 'today.done': 'Done', 'today.notYet': 'Not started', 'today.next': 'Next',
  'today.last': 'Last workout: {0}', 'today.empty': 'No sessions yet', 'today.emptyHint': 'Your log starts with the first workout. Start with day A, about 45 minutes.',
  'today.programWeek': 'Week {0} · {1}', 'today.free': 'Free activity', 'today.freeHint': 'Rope, shadow boxing or a walk outside the programme',
  'today.optionalCard': 'Session E is optional', 'today.optionalHint': 'Boxing, conditioning and arms. Skipping it does not hold up the rotation.',
  'phase.foundation': 'Foundation', 'phase.build': 'Build', 'phase.deload': 'Deload week', 'phase.power': 'Strength & power',
  'deload.banner': 'Deload week: half the sets, same weights, easier effort. It does not count for progression.',
  'deload.early': 'Early deload for seven days: half the sets, same weights, easier effort. Then the programme carries on as before.',
  'deload.signTitle': 'A sign to deload early', 'deload.signPain': 'You logged pain of 4 or more in the last two sessions. Deload for seven days and keep an eye on the joint in Joints.',
  'deload.start': 'Deload 7 days', 'deload.title': 'Early deload', 'deload.signs': 'Deload before it is due when one of these shows:', 'deload.until': 'Deload runs until {0}',
  'deload.s1': 'Loads or reps went down in 3 or more exercises, two sessions in a row', 'deload.s2': 'Sleep worse than usual, or tired all the time, for a week',
  'deload.s3': 'Joint pain of 4 or more, twice', 'deload.s4': 'The target effort is out of reach despite rest, two sessions',
  'ready.again': 'A year since the health questions', 'ready.againHint': 'Answer them again, it takes a minute',
  'return.week': 'Back after a week: same weights, one rep easier.', 'return.weeks': 'Back after a break: weights −10% and one set fewer for a week.', 'return.month': 'Back after more than 4 weeks: weights −20%; redo the tests this week.',
  'backup.title': 'Take a backup', 'backup.body': 'Your data is on this device only. Last backup: {0}.', 'backup.never': 'none yet', 'backup.now': 'Save a backup now', 'backup.later': 'Later', 'backup.done': 'Backup saved',
  'backup.restore': 'Restore: Settings → Data & backup → Import backup', 'backup.days': '{0} days ago',
  'tests.due': 'Time for the periodic tests', 'tests.dueHint': 'Week {0}: strength, fitness, mobility and waist. About 10 minutes.', 'tests.open': 'Open the tests',
  'block.warmup': 'Warm-up & joint care', 'block.boxing': 'Boxing', 'block.work': 'Resistance', 'block.inRest': 'During rests', 'block.finish': 'Conditioning & protection', 'block.stretch': 'Stretch', 'block.ankle': 'Ankle rehab (phase {0})',
  'kind.shadow-light': 'Light shadow boxing, no bounce', 'kind.rope-or-shadow': 'Light rope or shadow', 'kind.shadow': 'Technical shadow boxing', 'kind.bag': 'Bag: lesson of the week & power', 'kind.bag-intervals': 'Bag: review in intervals',
  'kind.conditioning': 'Intervals', 'kind.circuit': 'Fight circuit', 'kind.protect': 'Knee protection', 'kind.mobility': 'Short mobility flow',
  'start.session': 'Start session', 'start.timer': 'Start timer', 'session.lesson': 'Lesson of the week: {0}', 'session.review': 'Review the lessons you finished',
  'wraps': 'Wrap your hands and glove up before the bag', 'brace': 'Ankle brace or tape on rope, jumping and bag days',
  'mark.done': 'Done', 'dose.sets': '{0} × {1}', 'dose.side': 'per side', 'dose.each': 'each way', 'dose.min': '{0} min', 'dose.sec': '{0} s', 'rest.sec': 'Rest {0} s', 'during': 'During the {0} rests',
  'note.band-heavy': 'heavy band', 'note.band-light': 'light band', 'note.slow-negative': '5 s lowering', 'note.eccentric-only': 'lowering only, 3 s', 'note.band-heavy-partial': 'heavy band, partial range',
  'note.pause-2s': '2 s pause at the bottom', 'note.wall-hand': 'hand on the wall (ankle phase 1)', 'note.wall-hand-2w': 'hand on the wall for 2 weeks', 'note.slow': 'slowly', 'note.no-jump': 'no jumping',
  'note.light-band': 'light band', 'note.floor-by-wall': 'on the floor by a wall', 'note.eyes-closed-or-pillow': 'eyes closed or on a pillow', 'note.stronger-band': 'stronger band', 'note.each-direction': 'each direction', 'note.stick-landing': 'stick the landing',
  'gate.phase': 'Ankle phase {0}: {1}',
  'timer.work': 'Work', 'timer.rest': 'Rest', 'timer.round': 'Round {0} of {1}', 'timer.next': 'Next: {0}', 'timer.pause': 'Pause', 'timer.resume': 'Resume', 'timer.stop': 'Finish',
  'timer.done': 'Rounds done', 'timer.effort': 'Effort out of 10?', 'timer.guard': 'Guard up the whole time?', 'timer.save': 'Save', 'timer.saved': 'Rounds logged: {0}', 'timer.lesson': 'Open the lesson', 'timer.bursts': '3 × 20 s fast',
  'box.round': 'Next time: one more round', 'box.length': 'Next time: rounds 30 s longer', 'box.difficulty': 'Next time: same rounds, a harder combination', 'box.same': 'Next time: same level', 'rope.next': 'Rope next time: level {0}',
  'timer.ankle': 'Ankle pain now (0 to 10)', 'timer.locked': 'The rope comes back in ankle phase 3. Instead: {0}', 'timer.circuit': '30 s per move',
  'yes': 'Yes', 'no': 'No', 'close': 'Close', 'back': 'Back', 'save': 'Save', 'cancel': 'Cancel', 'example': 'Example', 'open': 'Open', 'nOf': '{0} of {1}', 'sep': ', ',
  'foot.flat': 'Feet on the floor, no bounce, small steps', 'foot.step-drag': 'Step and drag, light pivots on the front foot', 'foot.light-bounce': 'Light bounce on the balls of the feet', 'foot.full': 'Full footwork',
  'lib.exercises': 'Exercises', 'lib.lessons': 'Boxing lessons', 'lib.lessonsHint': 'A new lesson every week. Rate your control 7 or more to open the next one.',
  'lesson.week': 'Week {0}', 'lesson.steps': 'Steps', 'lesson.mistake': 'Most common mistake', 'lesson.ring': 'In the ring', 'lesson.defense': 'In self-defence',
  'lesson.rate': 'Rate your control of this lesson', 'lesson.learned': 'Lesson finished', 'lesson.current': 'This week’s lesson', 'lesson.locked': 'Opens later', 'lesson.ankle': 'Needs ankle phase {0}', 'lesson.practice': 'Practise', 'lesson.bag': 'Work this week’s lesson on the bag, light and controlled',
  'prog.title': 'Progress', 'prog.weight': 'Weekly average weight', 'prog.rate': '{0}% a week', 'prog.rateHint': 'Goal: lose 0.5 to 0.7% a week', 'prog.waist': 'Waist',
  'prog.tests': 'Periodic tests', 'prog.noTests': 'No tests yet', 'prog.logWeight': 'Log weight', 'prog.logWaist': 'Log waist', 'prog.details': 'Detailed stats', 'prog.history': 'History',
  'prog.ladders': 'Ladders', 'prog.ankle': 'Ankle phase', 'prog.week': 'Programme week', 'prog.up': 'Up', 'prog.same': 'Same', 'prog.down': 'Down',
  'ladder.pullup': 'Pull-up ladder', 'ladder.pushup': 'Push-up ladder', 'ladder.knee': 'Knee protection', 'ladder.goblet': 'Squat', 'ladder.rung': 'Rung {0} of {1}',
  'ladder.due': 'Top of the rung two sessions in a row. Next rung: {0}', 'ladder.move': 'Move up', 'ladder.stay': 'Stay',
  'light.title': 'You reached your heaviest dumbbell (24 kg)', 'light.body': 'Steps in order: reps up to 20, then 3–4 s lowering, then a 2 s pause, then one-and-a-half reps, then one arm or leg, then the harder alternative.',
  'test.pullups': 'Max pull-ups (or seconds hanging)', 'test.pushups': 'Max push-ups', 'test.hrRecovery': 'Heart-rate drop one minute after 3 min fast shadow', 'test.ropeMinute': 'Rope jumps in one minute', 'test.broadJump': 'Standing broad jump',
  'test.kneeWallL': 'Knee to wall, left', 'test.kneeWallR': 'Knee to wall, right', 'test.thomas': 'Thomas test: thigh touches the surface', 'test.toeTouch': 'Standing toe touch (cm from the floor)', 'test.backScratch': 'Back scratch (cm between hands)', 'test.waist': 'Waist at the navel',
  'unit.reps': 'reps', 'unit.bpm': 'bpm', 'unit.jumps': 'jumps', 'unit.cm': 'cm', 'unit.pass': 'yes/no', 'unit.kg': 'kg',
  'tests.title': 'Periodic tests', 'tests.save': 'Save results', 'tests.saved': 'Results saved', 'tests.hint': 'Leave any test you cannot do today empty.',
  'joints.title': 'Joint health', 'joints.log': 'Log pain', 'joints.today': 'Pain today', 'joints.plan': 'Protection plan', 'joints.flags': 'Stop and see a specialist if', 'joints.rule': 'Pain rule',
  'joint.shoulder': 'Shoulder', 'joint.wrist': 'Wrist & hand', 'joint.elbow': 'Elbow', 'joint.neck': 'Neck', 'joint.back': 'Lower back', 'joint.hip': 'Hip', 'joint.knee': 'Knee', 'joint.ankle': 'Ankle',
  'zone.ok': 'Fine: carry on, as long as it settles by the next morning', 'zone.ease': 'Ease off: less range or load, or the alternative', 'zone.stop': 'Stop the exercise that caused it, today',
  'pain.ctx': 'When?', 'pain.ctx.during': 'During training', 'pain.ctx.morning': 'Next morning', 'pain.ctx.rest': 'At rest', 'pain.saved': 'Pain logged', 'pain.none': 'Nothing logged',
  'morning.step-back': 'Worse than usual: one step back in the exercise that caused it.', 'morning.carry-on': 'As usual: carry on.', 'morning.see-specialist-if-it-stays': 'Pain of 6 or more: if it stays, see a specialist.',
  'risk.shoulder': 'Repeated forward punching and pressing', 'risk.wrist': 'Hitting the bag at a bad angle or without wraps', 'risk.elbow': 'Snapping the arm straight in shadow boxing, lots of pull-ups', 'risk.neck': 'Head movement and hits, long sitting',
  'risk.back': 'Romanian deadlift and swing form when tired', 'risk.hip': 'Fighting stance and rotation, long sitting', 'risk.knee': 'Jump landings, knee caving in lunges', 'risk.ankle': 'Rope, jumping and pivots',
  'flag.new-sprain-cannot-walk': 'A new sprain and you cannot walk 4 steps, or the ankle bone hurts to press: see a doctor today',
  'flag.gives-way-twice': 'The ankle gives way twice or more in two weeks despite the rehab', 'flag.unstable-after-3-months': 'Still unstable after 3 months of regular rehab',
  'flag.sharp-pain-pop': 'Sudden sharp pain, or a pop with pain', 'flag.swelling-growing': 'Swelling that grows instead of going down', 'flag.numb-weak-cold': 'Numbness, sudden weakness, or a cold hand or foot',
  'flag.locks': 'The joint locks', 'flag.night-pain-or-2-weeks': 'Pain that wakes you at night, or lasts over two weeks despite easing off', 'flag.chest-dizzy-breath': 'Chest pain, dizziness or unusual breathlessness: stop at once and get help',
  'ankle.title': 'Ankle rehab', 'ankle.phase': 'Phase {0} of 4', 'ankle.p1': 'Control & basic strength', 'ankle.p2': 'Balance & strength', 'ankle.p3': 'Gradual jumping', 'ankle.p4': 'Full return & prevention',
  'ankle.test': 'Phase test', 'ankle.testHint': 'Take the test when you feel ready, at most once a week.', 'ankle.pass': 'Passed! You are now in phase {0}.', 'ankle.fail': 'Not there yet. Work on: {0}', 'ankle.final': 'Last phase: keep balance and calf raises for prevention.',
  'ankle.sprain': 'I sprained my ankle again', 'ankle.sprainDone': 'Back to phase 1. If you cannot walk 4 steps, see a doctor today.', 'ankle.drills': 'Phase drills', 'ankle.allowed': 'Allowed in your phase',
  'crit.pain': 'Pain (0 to 10)', 'crit.holdOpen': 'Standing on the injured leg, eyes open (s)', 'crit.holdClosed': 'Standing on the injured leg, eyes closed (s)', 'crit.calfInjured': 'Calf raises on the injured leg', 'crit.calfOther': 'Calf raises on the healthy leg',
  'crit.kneeWallDiff': 'Knee-to-wall difference between legs (cm)', 'crit.reachDiff': '3-direction reach difference (cm, worst direction)', 'crit.confidence': 'Confidence in the ankle (0 to 10)',
  'crit.sideHopInjured': 'Side hop, injured leg: 10 hops over a 30 cm line (s)', 'crit.sideHopOther': 'Side hop, healthy leg (s)', 'crit.sideHopFear': 'I hesitated or felt afraid hopping', 'crit.ropeMinutes': 'Continuous rope minutes without pain',
  'allow.bulgarian': 'Bulgarian split squat', 'allow.lunge': 'Reverse lunge', 'allow.rope': 'Jump rope', 'allow.burpee': 'Burpee', 'allow.slrdl': 'Single-leg deadlift',
  'ready.title': 'Before we start', 'ready.disclaimer': 'This app is a general training programme, not a substitute for a doctor. It does not diagnose or treat.', 'ready.intro': 'Seven short health questions, based on the topics of the PAR-Q+ questionnaire.',
  'ready.official': 'The official PAR-Q+', 'ready.next': 'Next', 'ready.start': 'Start the programme',
  'q.heart': 'Has a doctor told you that you have a heart condition or high blood pressure?', 'q.chest-pain': 'Do you feel chest pain at rest, in daily life, or during activity?',
  'q.dizzy': 'Have you lost balance from dizziness, or lost consciousness, in the last 12 months?', 'q.chronic': 'Do you have another long-term condition diagnosed by a doctor?', 'q.medication': 'Do you take medication for a long-term condition?',
  'q.joint': 'Do you have (or had in the last 12 months) a bone, joint or muscle problem that activity could make worse?', 'q.supervised': 'Has a doctor told you to exercise only under medical supervision?',
  'ready.clear': 'Nothing stops you starting. Start easy and listen to your body.', 'ready.joint-only': 'You have a joint problem (the ankle). The programme includes rehab for it, but see a physiotherapist if you have not yet.',
  'ready.see-doctor': 'You answered yes to one or more questions. Check with your doctor before you start or train harder.',
  'base.title': 'Starting point', 'base.pullup': 'Pull-ups now', 'base.pushup': 'Push-ups now (in a row, good form)',
  'base.pull.0': 'I cannot hang for 20 seconds', 'base.pull.1': 'I can hang but not do a pull-up', 'base.pull.4': '1 to 4 pull-ups', 'base.pull.5': '5 or more',
  'base.push.0': 'Under 5', 'base.push.1': '5 to 11', 'base.push.2': '12 to 19', 'base.push.3': '20 or more',
  'base.ankle': 'The ankle now', 'base.ankle.1': 'It hurts walking or on stairs, or a recent sprain', 'base.ankle.2': 'No pain walking, but it feels unstable',
  'base.ankleHint': 'You start in phase 1 either way. Pass its test in the first session and you move to phase 2 at once.',
  'free.title': 'Free activity', 'free.rope': 'Rope', 'free.shadow': 'Shadow', 'free.walk': 'Walk', 'free.minutes': '{0} min', 'free.saved': 'Logged: {0}, {1} minutes', 'free.ropeLocked': 'Rope after ankle phase 3',
  'about.based': 'Based on openGym', 'about.source': 'Source code of this version', 'about.licence': 'AGPL-3.0',
  'minibar.resume': 'Back to the session',
}

const PACKS = { ar: AR, en: EN }

export const isArabic = () => (getLang() || '').split('-')[0] === 'ar'

/** My gym's translator: Arabic when the app is in Arabic, English otherwise. */
export function mt(key, ...args) {
  const pack = isArabic() ? AR : EN
  let s = pack[key] ?? EN[key] ?? key
  if (args.length) s = s.replace(/\{(\d+)\}/g, (m, i) => (args[i] != null ? String(args[i]) : m))
  return s
}

/** A { ar, en } pair from the content files, in the app language. */
export const pick = pair => (pair ? (isArabic() ? pair.ar : pair.en) ?? pair.en ?? pair.ar : '')

export const _packs = PACKS

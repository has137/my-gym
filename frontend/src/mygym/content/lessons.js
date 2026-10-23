// My gym: boxing technique lessons for a beginner, in order (program.md §7). Written for this
// app, in plain words. `week` is the programme week the lesson opens in; `ankle` the ankle phase
// it needs; `ids` the catalogue exercises whose animation shows the movement.

export const LESSONS = [
  {
    id: 'stance', week: 1, ankle: 1, ids: [],
    title: { ar: 'الوقفة والحراسة', en: 'Stance and guard' },
    steps: {
      ar: ['قف والقدمان بعرض الكتفين، والقدم اليسرى للأمام إذا كنت تستخدم اليمنى أكثر.', 'اثنِ الركبتين قليلاً، ووزنك على مقدمة القدمين بالتساوي.', 'اليدان أمام الوجه: القبضة الأمامية بمستوى العين، والخلفية عند الخد.', 'المرفقان قريبان من الجسم يحميان الضلوع، والذقن منخفض.'],
      en: ['Feet shoulder-width apart, left foot forward if you are right-handed.', 'Knees slightly bent, weight evenly on the balls of the feet.', 'Hands up: lead fist at eye level, rear fist at the cheek.', 'Elbows close to the body over the ribs, chin down.'],
    },
    mistake: { ar: 'إنزال اليد الخلفية عند اللكم باليد الأمامية.', en: 'Dropping the rear hand while the lead hand punches.' },
    ring: { ar: 'كل لكمة ودفاع يبدأ من هنا. الوقفة الثابتة تعطيك قوة وتوازناً.', en: 'Every punch and defence starts here. A solid stance gives power and balance.' },
    defense: { ar: 'اليدان أمام الوجه تحميانك من ضربة مفاجئة، والوقفة الجانبية تجعلك هدفاً أصغر.', en: 'Hands in front of the face protect you from a surprise hit, and a side-on stance makes you a smaller target.' },
  },
  {
    id: 'footwork', week: 1, ankle: 1, ids: [],
    title: { ar: 'حركة القدمين: خطوة وسحب', en: 'Footwork: step and drag' },
    steps: {
      ar: ['للأمام: حرّك القدم الأمامية خطوة صغيرة، ثم اسحب الخلفية بنفس المسافة.', 'للخلف: القدم الخلفية أولاً، ثم الأمامية.', 'للجانب: القدم التي في اتجاه الحركة أولاً.', 'لا تقاطع القدمين، وحافظ على المسافة بينهما.'],
      en: ['Forward: small step with the lead foot, then drag the rear foot the same distance.', 'Back: rear foot first, then the lead.', 'Sideways: the foot on the side you move to goes first.', 'Never cross your feet; keep the gap between them.'],
    },
    mistake: { ar: 'خطوات كبيرة تكسر التوازن.', en: 'Big steps that break your balance.' },
    ring: { ar: 'تتحكم بالمسافة: تقترب لتضرب، وتبتعد لتتفادى.', en: 'You control distance: step in to hit, step out to avoid.' },
    defense: { ar: 'الخروج من المسافة أهم مهارة دفاعية. خطوة للخلف أو للجانب تبعدك عن الخطر.', en: 'Getting out of range is the most important defensive skill. One step back or to the side takes you out of danger.' },
  },
  {
    id: 'jab', week: 2, ankle: 1, ids: ['2272'],
    title: { ar: 'الجاب (1)', en: 'The jab (1)' },
    steps: {
      ar: ['مدّ اليد الأمامية مستقيمة من الحراسة، ولفّ القبضة في آخر الحركة.', 'الكتف يرتفع ليحمي الذقن.', 'أرجع اليد في نفس الخط بسرعة إلى الوجه.', 'للجسم: اثنِ الركبتين وانزل، ولا تنحنِ للأمام.'],
      en: ['Extend the lead hand straight from the guard, turning the fist at the end.', 'The shoulder rises to cover the chin.', 'Bring the hand back on the same line, fast, to the face.', 'To the body: bend the knees to drop level; do not lean forward.'],
    },
    mistake: { ar: 'إرجاع اليد للأسفل بدل الوجه.', en: 'Bringing the hand back low instead of to the face.' },
    ring: { ar: 'أسرع لكمة وأقربها. تقيس المسافة وتفتح الطريق للكمات الأخرى.', en: 'Your fastest and closest punch. It measures distance and opens the way for others.' },
    defense: { ar: 'تبقي الشخص بعيداً عنك وتمنعه من الاقتراب.', en: 'It keeps someone at a distance and stops them closing in.' },
  },
  {
    id: 'cross', week: 2, ankle: 1, ids: ['2273'],
    title: { ar: 'الكروس (2)', en: 'The cross (2)' },
    steps: {
      ar: ['ادفع الأرض بالقدم الخلفية، ولفّ الكعب للخارج.', 'لفّ الورك ثم الكتف، ومدّ اليد الخلفية مستقيمة.', 'اليد الأمامية تبقى عند الوجه.', 'أرجع اليد بسرعة، والوزن يعود للوسط.'],
      en: ['Push the floor with the rear foot and turn the heel out.', 'Turn the hip, then the shoulder, and extend the rear hand straight.', 'The lead hand stays at the face.', 'Bring the hand back fast; weight returns to the centre.'],
    },
    mistake: { ar: 'اللكم بالذراع وحدها بدون لفّ الورك.', en: 'Punching with the arm only, without turning the hip.' },
    ring: { ar: 'أقوى لكمة مستقيمة، والقوة تأتي من الرجلين والورك.', en: 'Your strongest straight punch; the power comes from the legs and hip.' },
    defense: { ar: 'ضربة واحدة قوية تكفي لتصنع فرصة للهروب.', en: 'One strong shot is enough to make room to get away.' },
  },
  {
    id: 'one-two', week: 3, ankle: 1, ids: ['2272', '2273'],
    title: { ar: 'التركيبة 1-2', en: 'The 1-2' },
    steps: {
      ar: ['جاب، ثم كروس فور عودة الجاب.', 'الجاب يقيس المسافة، والكروس يصل لنفس النقطة.', 'ابدأ ببطء حتى يصبح الإيقاع منتظماً، ثم أسرع.', 'بعد التركيبة: يداك عند الوجه، أو خطوة للخلف.'],
      en: ['Jab, then the cross as the jab comes back.', 'The jab finds the distance; the cross lands on the same spot.', 'Start slowly until the rhythm is even, then speed up.', 'After the combination: hands at the face, or a step back.'],
    },
    mistake: { ar: 'الكروس قبل أن تعود اليد الأمامية.', en: 'Throwing the cross before the lead hand is back.' },
    ring: { ar: 'أساس كل التركيبات.', en: 'The base of every combination.' },
    defense: { ar: 'لكمتان سريعتان ثم ابتعاد: أبسط ما تحتاجه لتفتح مخرجاً.', en: 'Two fast punches then out: the simplest way to open an exit.' },
  },
  {
    id: 'hook', week: 4, ankle: 1, ids: ['2271'],
    title: { ar: 'الخطاف الأمامي (3)، ثم 1-2-3', en: 'Lead hook (3), then 1-2-3' },
    steps: {
      ar: ['المرفق بمستوى القبضة، والذراع على شكل زاوية قائمة تقريباً.', 'لفّ القدم الأمامية والورك معاً، والذراع تتبع الجسم.', 'لا تفتح الذراع للخلف قبل اللكمة.', 'بعد الكروس: الوزن انتقل للأمام، فالخطاف يعيده للوسط.'],
      en: ['Elbow level with the fist, the arm bent at about a right angle.', 'Turn the lead foot and hip together; the arm follows the body.', 'Do not pull the arm back before the punch.', 'After the cross your weight is forward; the hook brings it back to the centre.'],
    },
    mistake: { ar: 'تحريك الذراع بدون لفّ الجسم.', en: 'Swinging the arm without turning the body.' },
    ring: { ar: 'يصل من الجانب حيث لا يرى الخصم، وقوي من مسافة قريبة.', en: 'Lands from the side, out of view, and hits hard at close range.' },
    defense: { ar: 'مفيد عندما يقترب منك أحد ولا مجال للكمة مستقيمة.', en: 'Useful when someone is close and there is no room for a straight punch.' },
  },
  {
    id: 'uppercut', week: 5, ankle: 1, ids: ['2275', '2274'],
    title: { ar: 'الأبركت (5 و6)، ثم 1-6-3', en: 'Uppercuts (5, 6), then 1-6-3' },
    steps: {
      ar: ['انزل قليلاً بثني الركبتين.', 'ادفع بالرجلين ولفّ الورك، واليد تصعد قريبة من الجسم.', 'القبضة تتجه للأعلى، والكف نحوك.', 'لا تُنزل يدك قبل أن تصعد.'],
      en: ['Dip slightly by bending the knees.', 'Drive with the legs and turn the hip; the hand rises close to the body.', 'Fist travels upward, palm facing you.', 'Do not drop the hand before it rises.'],
    },
    mistake: { ar: 'إنزال اليد بعيداً قبل اللكمة، فيراها الخصم.', en: 'Dropping the hand far before the punch, so it shows it coming.' },
    ring: { ar: 'يصل تحت الحراسة من مسافة قريبة.', en: 'Comes up under the guard at close range.' },
    defense: { ar: 'إذا انحنى أحد نحوك للإمساك بك، الأبركت يصل إليه.', en: 'If someone ducks in to grab you, the uppercut reaches them.' },
  },
  {
    id: 'block', week: 6, ankle: 1, ids: ['4581'],
    title: { ar: 'الصد والإبعاد باليد', en: 'Block and parry' },
    steps: {
      ar: ['للمستقيمة: أبعدها بحركة صغيرة من كفك، ولا تمدّ يدك نحوها.', 'للخطاف: ارفع الساعد إلى جانب الرأس والمرفق للأسفل.', 'للجسم: انزل المرفق ليغطي الضلوع.', 'عد للحراسة فوراً، وردّ بلكمة.'],
      en: ['Straight punches: deflect with a small move of the palm; do not reach for them.', 'Hooks: raise the forearm to the side of the head, elbow down.', 'Body shots: drop the elbow over the ribs.', 'Back to the guard at once, and answer with a punch.'],
    },
    mistake: { ar: 'إغلاق العينين وقت الصد.', en: 'Closing your eyes as you block.' },
    ring: { ar: 'يحميك وأنت قريب بما يكفي للرد.', en: 'Protects you while staying close enough to answer.' },
    defense: { ar: 'أول ما تفعله يدك أمام ضربة قادمة.', en: 'The first thing your hands do against an incoming hit.' },
  },
  {
    id: 'slip', week: 7, ankle: 1, ids: [],
    title: { ar: 'المراوغة الجانبية (slip)', en: 'Slip' },
    steps: {
      ar: ['لفّ الكتف والورك قليلاً، فيتحرك رأسك خارج خط اللكمة.', 'الحركة صغيرة: بضعة سنتيمترات تكفي.', 'اثنِ الركبتين قليلاً، ولا تنحنِ من الخصر.', 'من المراوغة تكون جاهزاً للكمة مضادة.'],
      en: ['Turn the shoulder and hip slightly so the head moves off the punch line.', 'Small move: a few centimetres are enough.', 'Bend the knees a little; do not bend at the waist.', 'From the slip you are loaded for a counter.'],
    },
    mistake: { ar: 'حركة كبيرة تُخرجك من التوازن.', en: 'A big move that takes you off balance.' },
    ring: { ar: 'تتفادى وتبقى قريباً، فتردّ فوراً.', en: 'You avoid the punch and stay close, so you can answer at once.' },
    defense: { ar: 'إبعاد الرأس عن الضربة أفضل من صدها.', en: 'Moving the head away beats blocking the hit.' },
  },
  {
    id: 'roll', week: 8, ankle: 1, ids: [],
    title: { ar: 'الانحناء تحت الخطاف (roll)', en: 'Roll under the hook' },
    steps: {
      ar: ['اثنِ الركبتين وانزل بشكل حرف U تحت اللكمة.', 'الظهر مستقيم والعينان على الخصم.', 'اصعد في الجهة الأخرى ويداك عند الوجه.', 'ابدأ ببطء، ثم مع لكمة بعد الصعود.'],
      en: ['Bend the knees and drop in a U shape under the punch.', 'Back straight, eyes on the opponent.', 'Come up on the other side with the hands at the face.', 'Start slowly, then add a punch as you come up.'],
    },
    mistake: { ar: 'الانحناء من الظهر والنظر للأرض.', en: 'Bending from the back and looking at the floor.' },
    ring: { ar: 'تتفادى الخطاف وتصل لزاوية الرد.', en: 'You avoid the hook and land at an angle to counter.' },
    defense: { ar: 'يفيد عندما تأتيك ضربة واسعة من الجانب.', en: 'Useful when a wide swing comes from the side.' },
  },
  {
    id: 'pivot', week: 10, ankle: 2, ids: [],
    title: { ar: 'الدوران والزوايا (pivot)', en: 'Pivot and angles' },
    steps: {
      ar: ['ادفع بالقدم الخلفية ولفّ على مقدمة القدم الأمامية.', 'جسمك يدور ربع دورة، فتصير بجانب الخصم.', 'يداك تبقيان عند الوجه طوال الدوران.', 'ابدأ بربع دورة بطيئة، ثم بعد 1-2.'],
      en: ['Push with the rear foot and turn on the ball of the lead foot.', 'Your body turns a quarter, putting you beside the opponent.', 'Hands stay at the face throughout.', 'Start with a slow quarter turn, then after a 1-2.'],
    },
    mistake: { ar: 'الدوران على الكعب.', en: 'Turning on the heel.' },
    ring: { ar: 'يُخرجك من أمام الخصم إلى زاويته.', en: 'Takes you out of the opponent’s line to their side.' },
    defense: { ar: 'يُبعدك عن الحائط أو الزاوية إذا حُشرت فيها.', en: 'Gets you off a wall or out of a corner when pinned.' },
  },
  {
    id: 'body', week: 11, ankle: 1, ids: ['2272', '2271'],
    title: { ar: 'لكمات الجسم', en: 'Body shots' },
    steps: {
      ar: ['انزل بثني الركبتين، لا بالانحناء.', 'جاب للجسم ثم ارجع للوجه.', 'خطاف للجسم: المرفق للأسفل والقبضة نحو الضلوع.', 'بعد لكمة الجسم، اصعد بلكمة للرأس أو اخرج.'],
      en: ['Drop by bending the knees, not by leaning.', 'Jab to the body, then back to the face.', 'Hook to the body: elbow low, fist into the ribs.', 'After a body shot, come up to the head or get out.'],
    },
    mistake: { ar: 'خفض الرأس واليدين معاً.', en: 'Dropping the head and both hands together.' },
    ring: { ar: 'تُتعب الخصم وتُنزل حراسته.', en: 'They tire the opponent and bring the guard down.' },
    defense: { ar: 'هدف كبير وقريب إذا كان الوجه محمياً.', en: 'A big, close target when the face is covered.' },
  },
  {
    id: 'counter', week: 12, ankle: 1, ids: [],
    title: { ar: 'الرد بعد الدفاع', en: 'Counter after defending' },
    steps: {
      ar: ['مراوغة خارج الجاب، ثم كروس.', 'صد الخطاف، ثم خطافك من نفس الجهة.', 'الرد فوري، قبل أن يعود الخصم للحراسة.', 'ركّز على لكمة واحدة نظيفة، لا على عدد كبير.'],
      en: ['Slip outside the jab, then a cross.', 'Block the hook, then your hook on the same side.', 'Answer at once, before the opponent is back in guard.', 'One clean punch, not many.'],
    },
    mistake: { ar: 'الانتظار بعد الدفاع.', en: 'Waiting after the defence.' },
    ring: { ar: 'الخصم المهاجم مكشوف لحظة هجومه.', en: 'An attacking opponent is open in the moment of attack.' },
    defense: { ar: 'تحويل الدفاع إلى فرصة للخروج.', en: 'Turning defence into a chance to get out.' },
  },
  {
    id: 'move-combos', week: 13, ankle: 2, ids: ['2272', '2273', '2271'],
    title: { ar: 'تركيبات مع الحركة', en: 'Combinations on the move' },
    steps: {
      ar: ['1-2 ثم خطوة للخلف أو للجانب.', '1-2-3-2 ثم خروج بزاوية.', 'في المرحلة 2 للكاحل: خطوة وسحب فقط. من المرحلة 3: نطّ خفيف.', 'كل تركيبة تنتهي بالحراسة أو بالخروج.'],
      en: ['1-2 then a step back or to the side.', '1-2-3-2 then out at an angle.', 'Ankle phase 2: step and drag only. From phase 3: a light bounce.', 'Every combination ends in guard or out of range.'],
    },
    mistake: { ar: 'البقاء في المكان بعد التركيبة.', en: 'Staying put after the combination.' },
    ring: { ar: 'تضرب ولا تُضرب.', en: 'Hit and do not get hit.' },
    defense: { ar: 'تضرب لتصنع مسافة، ثم تخرج.', en: 'Strike to make space, then leave.' },
  },
  {
    id: 'self-defense', week: 14, ankle: 1, ids: [],
    title: { ar: 'أساسيات الدفاع عن النفس', en: 'Self-defence basics' },
    steps: {
      ar: ['المسافة: ابقَ أبعد من مدّ ذراع الشخص الآخر.', 'اليدان أمامك مفتوحتان وهادئتان: تحميان وجهك بدون أن تبدو مهاجماً.', 'الكلام أولاً، والابتعاد هو الهدف.', 'إذا اضطررت: 1-2 لتصنع مسافة، ثم اخرج فوراً.'],
      en: ['Distance: stay further than the other person’s reach.', 'Open, calm hands in front of you: they cover your face without looking aggressive.', 'Talk first; leaving is the goal.', 'If you must: a 1-2 to make space, then get out at once.'],
    },
    mistake: { ar: 'البقاء للقتال بعد أن صار الخروج ممكناً.', en: 'Staying to fight once leaving is possible.' },
    ring: { ar: 'نفس الحراسة والمسافة التي تدربت عليها.', en: 'The same guard and distance you have trained.' },
    defense: { ar: 'أفضل نتيجة هي أن تخرج سالماً.', en: 'The best outcome is walking away unhurt.' },
  },
]

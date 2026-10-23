// My gym: the training programme (program.md v2, approved 2026-10-23).
//
// Data only. Exercise ids are openGym catalogue ids (catalogue/exercises/<id>.json); names,
// pictures and muscles come from the catalogue, so nothing here repeats them. program.test.js
// fails if an id stops existing, becomes an alias or loses its Arabic name after an upstream
// update, and every slot carries alternatives the app falls back to if one disappears.
//
// Reps follow openGym's own conventions (lib/rep-range.js, lib/history.js):
//   - double progression: `reps` is the top of the range, `repsMin` the bottom
//   - per side (`side: true`): reps count both sides together, so 8–12 per side is 16–24
//   - bodyweight work climbs from `reps` one rep per clean session; the ladder rule
//     (lib/ladder.js) moves it to the next exercise once the top of the rung is reached
//   - timed holds use `mode: 'time'` and `sec`

export const DUMBBELLS_KG = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]

// The four sessions the rotation cycles through. E is optional and started from its own card.
export const ROTATION = ['A', 'B', 'C', 'D']
export const SESSION_KEYS = ['A', 'B', 'C', 'D', 'E']

// Equipment profile for openGym's filter (lib/equipment.js names).
export const EQUIPMENT = ['dumbbell', 'band', 'resistance band', 'rope', 'body weight', 'bench', 'pull-up bar']

// Ladders: bodyweight progressions and what to do once the dumbbells run out (program.md §7).
// Each rung is a routine entry plus `top`, the rep (or second) count every set must reach in two
// sessions in a row before the next rung is suggested.
export const LADDERS = {
  pullup: [
    { id: '5055', mode: 'time', sets: 3, sec: 20, top: 30, prog: 'time' },
    { id: '0970', sets: 3, reps: 6, top: 8, prog: 'double', note: 'band-heavy' },
    { id: '4725', sets: 3, reps: 3, top: 5, prog: 'double', note: 'slow-negative' },
    { id: '0970', sets: 3, reps: 5, top: 8, prog: 'double', note: 'band-light' },
    { id: '0652', neutral: '0651', sets: 3, reps: 3, top: 5, prog: 'double' },
    { id: '0652', neutral: '0651', sets: 4, reps: 6, top: 8, prog: 'double' },
    { id: '0841', sets: 4, reps: 8, repsMin: 5, top: null, prog: 'double', loaded: true },
  ],
  pushup: [
    { id: '0493', sets: 3, reps: 8, top: 15, prog: 'double' },
    { id: '0662', sets: 3, reps: 5, top: 12, prog: 'double' },
    { id: '0662', sets: 3, reps: 12, top: 20, prog: 'double' },
    { id: '1274', sets: 3, reps: 8, top: 15, prog: 'double' },
    { id: '0279', sets: 3, reps: 8, top: 15, prog: 'double' },
    { id: '3294', sets: 3, reps: 10, top: 16, side: true, prog: 'double' },
    { id: '1273', sets: 4, reps: 5, top: null, prog: 'double' },
  ],
  knee: [
    { id: '3395', sets: 2, reps: 5, top: 6, prog: 'double', note: 'eccentric-only' },
    { id: '3395', sets: 2, reps: 6, top: 8, prog: 'double' },
    { id: '3395', sets: 2, reps: 10, top: 12, prog: 'double' },
    { id: '4204', sets: 2, reps: 3, top: 5, prog: 'double', note: 'band-heavy-partial' },
    { id: '4204', sets: 2, reps: 4, top: 6, prog: 'double', note: 'band-light' },
    { id: '7746', sets: 2, reps: 3, top: 5, prog: 'double' },
  ],
  // Dumbbell ladders start only once the heaviest bell (24 kg) is the working weight.
  goblet: [
    { id: '1760', sets: 4, reps: 12, repsMin: 8, prog: 'double', top: 12 },
    { id: '4816', sets: 4, reps: 12, repsMin: 8, prog: 'double', top: 12, note: 'pause-2s' },
    { id: '2966', sets: 4, reps: 12, repsMin: 8, prog: 'double', top: 12 },
  ],
}

// Exercises that depend on the ankle phase (program.md §5). The routine always holds the
// exercise for the current phase; phases 1–4 index the map.
export const ANKLE_GATES = {
  bulgarian: { 1: '2960', 2: '2290', 3: '2290', 4: '2290', note: { 1: 'wall-hand', 2: 'wall-hand-2w' } },
  lunge: { 1: '2960', 2: '0381', 3: '0381', 4: '0381', note: { 2: 'slow' } },
  rope: { 1: '0630', 2: '0630', 3: '2612', 4: '2612', note: { 1: 'slow', 2: 'no-jump' } },
  burpee: { 1: '5039', 2: '5039', 3: '1160', 4: '1160' },
  slrdl: { 1: '4757', 2: '4757', 3: '1757', 4: '1757' },
}

const item = (id, dose, extra = {}) => ({ id, dose, ...extra })

export const SESSIONS = {
  A: {
    key: 'A', minutes: 45, emoji: 'pullup',
    warmup: [
      item(null, { min: 2 }, { kind: 'shadow-light' }),
      item('8361', { sets: 2, reps: 15 }, { joint: 'shoulder' }),
      item('5607', { sets: 2, reps: 15 }, { joint: 'shoulder' }),
      item('1428', { reps: 10, each: 'direction' }, { joint: 'wrist' }),
      { kind: 'ankle' },
    ],
    boxing: { kind: 'shadow', ids: ['2272', '2273', '2271', '2274'], lessons: true },
    work: [
      { slot: 'A1', ladder: 'pullup', sg: 'A1', restSec: 90, rir: '2', pattern: 'vpull', alt: { easier: '0970', harder: '0841', joint: '0905' } },
      { slot: 'A2', id: '0289', sets: 3, reps: 10, repsMin: 6, prog: 'double', sg: 'A1', restSec: 90, rir: '2', pattern: 'hpush', alt: { easier: '2982', harder: '3333', joint: '0352' } },
      { slot: 'B1', id: '0327', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'A2', restSec: 90, rir: '1–2', pattern: 'hpull', alt: { easier: '3121', harder: '3320', joint: '0930' } },
      { slot: 'B2', id: '0405', sets: 3, reps: 12, repsMin: 8, prog: 'double', sg: 'A2', restSec: 90, rir: '2', pattern: 'vpush', alt: { easier: '0997', harder: '11016', joint: '0404' } },
    ],
    inRest: [
      item('0364', { sets: 1, reps: 15 }, { joint: 'wrist', during: 'A1' }),
      item('10780', { sets: 1, reps: 10 }, { joint: 'neck', during: 'A1' }),
      item('10781', { sets: 1, reps: 10 }, { joint: 'neck', during: 'A1' }),
      item('0979', { sets: 2, sec: '20–30', side: true }, { core: 'anti-rotation', during: 'A2' }),
    ],
    finish: [],
    stretch: [item('1802', { sec: 30, side: true }), item('1781', { sec: 30 })],
  },
  B: {
    key: 'B', minutes: 56, emoji: 'legs',
    warmup: [
      item('1368', { reps: 10, each: 'direction' }, { joint: 'ankle' }),
      item('4555', { reps: 8 }, { joint: 'hip' }),
      item('2471', { sets: 1, reps: 12 }, { joint: 'hip' }),
      item('1241', { reps: 6, side: true }, { joint: 'back' }),
      item('0276', { sets: 2, reps: '6–10', side: true }, { core: 'anti-extension' }),
      { kind: 'ankle' },
    ],
    work: [
      { slot: 'A1', ladder: 'goblet', restSec: 90, rir: '2', pattern: 'squat', alt: { easier: '10168', harder: '4816', joint: '0291' } },
      { slot: 'B1', id: '1459', sets: 4, reps: 12, repsMin: 8, prog: 'double', restSec: 90, rir: '2', pattern: 'hinge', alt: { easier: '4605', harder: '4757', joint: '3335' } },
      { slot: 'C1', gate: 'bulgarian', sets: 3, reps: 24, repsMin: 16, side: true, prog: 'double', restSec: 60, rir: '2', pattern: 'single-leg', alt: { easier: '2960', harder: '2957', joint: '1175' } },
      { slot: 'D1', id: '2917', mode: 'time', sets: 3, sec: 40, prog: 'time', restSec: 60, pattern: 'carry', alt: { easier: '2133', harder: '2911', joint: '2910' } },
    ],
    inRest: [
      item('1775', { sets: 2, sec: '15–25', side: true }, { joint: 'hip', during: 'B1' }),
    ],
    finish: [{ kind: 'conditioning', gate: 'rope', maxLevel: 5 }],
    stretch: [item('1053', { sec: 30, side: true }), item('0789', { sec: 30, side: true })],
  },
  C: {
    key: 'C', minutes: 53, emoji: 'boxing',
    warmup: [
      item('1503', { sets: 2, reps: 15 }, { joint: 'shoulder' }),
      item('5607', { sets: 2, reps: 15 }, { joint: 'shoulder' }),
      item('1428', { reps: 10, each: 'direction' }, { joint: 'wrist' }),
      item('4573', { sets: 2, reps: 8, side: true }, { core: 'rotation' }),
      item(null, { min: 1.5 }, { kind: 'shadow-light' }),
      { kind: 'ankle' },
    ],
    boxing: { kind: 'bag', ids: ['4582', '4583', '4584'], lessons: true, wraps: true, maxRounds: 4 },
    work: [
      { slot: 'A1', ladder: 'pullup', neutral: true, sg: 'C1', restSec: 90, rir: '2', pattern: 'vpull', alt: { easier: '0970', harder: '3293', joint: '1013' } },
      { slot: 'A2', id: '0314', sets: 3, reps: 12, repsMin: 8, prog: 'double', sg: 'C1', restSec: 90, rir: '2', pattern: 'hpush', alt: { easier: '4544', harder: '1281', joint: '0324' } },
      { slot: 'B1', id: '0292', sets: 3, reps: 24, repsMin: 16, side: true, prog: 'double', sg: 'C2', restSec: 60, rir: '2', pattern: 'hpull', alt: { easier: '0327', harder: '10329', joint: '0930' } },
      { slot: 'B2', id: '0396', sets: 4, reps: 20, repsMin: 12, prog: 'double', sg: 'C2', restSec: 60, rir: '1', pattern: 'delts', alt: { easier: '0907', harder: '0323', joint: '0356' } },
    ],
    inRest: [item('10817', { sets: 1, reps: 10 }, { joint: 'elbow', during: 'C2' })],
    finish: [],
    stretch: [item('4559', { sec: 30 }), item('0561', { sec: 30 })],
  },
  D: {
    key: 'D', minutes: 48, emoji: 'legs',
    warmup: [
      item('3502', { reps: 10, side: true }, { joint: 'hip' }),
      item('4633', { reps: 5, side: true }, { joint: 'hip' }),
      item('3149', { reps: 10 }, { joint: 'neck' }),
      item('0715', { sets: 2, sec: '20–40', side: true }, { core: 'anti-lateral', joint: 'back' }),
      { kind: 'ankle' },
    ],
    work: [
      { slot: 'A1', id: '3368', sets: 4, reps: 15, repsMin: 10, prog: 'double', restSec: 60, rir: '3', pattern: 'hinge-power', alt: { easier: '3335', harder: '3397', joint: '2760' } },
      { slot: 'B1', gate: 'lunge', sets: 3, reps: 20, repsMin: 16, side: true, prog: 'double', sg: 'D1', restSec: 60, rir: '2', pattern: 'single-leg', alt: { easier: '2960', harder: '10096', joint: '0431' } },
      { slot: 'B2', ladder: 'pushup', sg: 'D1', restSec: 60, rir: '2', pattern: 'hpush', alt: { easier: '0493', harder: '1274', joint: '1182' } },
      { slot: 'C1', id: '0334', sets: 3, reps: 20, repsMin: 12, prog: 'double', restSec: 45, rir: '1–2', pattern: 'delts', alt: { easier: '0907', harder: '0323', joint: '0356' } },
    ],
    inRest: [],
    finish: [
      { kind: 'circuit', moves: [{ gate: 'burpee' }, { id: '0630' }, { id: '0699', dependsOn: 'pushup' }, { id: '2272' }], rounds: 3, workSec: 120, restSec: 60 },
      { kind: 'protect', ladder: 'knee', joint: 'knee', restSec: 60 },
    ],
    stretch: [item('4557', { sec: 30, side: true }), item('1377', { sec: 30, side: true })],
  },
  E: {
    key: 'E', minutes: 57, emoji: 'boxing', optional: true,
    warmup: [
      item(null, { min: 3 }, { kind: 'rope-or-shadow' }),
      { kind: 'ankle' },
    ],
    boxing: { kind: 'bag-intervals', ids: ['4582', '4583'], review: true, wraps: true, maxRounds: 5 },
    work: [
      { slot: 'A1', id: '0313', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'E1', restSec: 45, pattern: 'arms', alt: { easier: '0005', harder: '0320', joint: '0298' } },
      { slot: 'A2', id: '0430', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'E1', restSec: 45, pattern: 'arms', alt: { easier: '0333', harder: '0351', joint: '0259' } },
      { slot: 'B1', id: '2487', sets: 3, reps: 20, repsMin: 12, prog: 'double', sg: 'E2', restSec: 45, pattern: 'delts', alt: { easier: '0993', harder: '3694', joint: '0348' } },
      { slot: 'B2', id: '0334', sets: 3, reps: 20, repsMin: 12, prog: 'double', sg: 'E2', restSec: 45, pattern: 'delts', alt: { easier: '0907', harder: '0323', joint: '0356' } },
    ],
    inRest: [],
    finish: [
      { kind: 'conditioning', gate: 'rope', maxLevel: 7 },
      item('5145', { sets: 2, sec: '20–30' }, { joint: 'neck' }),
      item('5055', { sets: 2, sec: '20–30' }, { joint: 'shoulder' }),
    ],
    stretch: [{ kind: 'mobility', min: 4 }],
  },
}

// Optional ten-minute mobility flow for rest days (program.md §6).
export const MOBILITY_FLOW = [
  item('1051', { reps: 8 }),
  item('4633', { reps: 5, side: true }),
  item('4555', { reps: 8 }),
  item('1969', { reps: 10, side: true }),
  item('1812', { reps: 6, side: true }),
  item('4557', { sec: 30, side: true }),
]

// Free activity kinds: two taps, logged as a workout that does not move the rotation.
export const FREE_KINDS = {
  rope: { id: '2612', mode: 'cardio' },
  shadow: { id: '2272', mode: 'cardio' },
  walk: { id: '2258', mode: 'cardio' },
}

// Periodic tests (program.md §8): weeks counted from the programme's start.
export const TEST_WEEKS = [0, 5, 9, 14]

// Every exercise id the programme names, for the catalogue guard test.
export function programIds() {
  const ids = new Set()
  const add = id => { if (typeof id === 'string') ids.add(id) }
  for (const s of Object.values(SESSIONS)) {
    for (const block of [s.warmup, s.inRest, s.stretch, s.finish]) {
      for (const x of block || []) {
        add(x.id)
        for (const m of x.moves || []) add(m.id)
      }
    }
    for (const id of s.boxing?.ids || []) add(id)
    for (const w of s.work) {
      add(w.id)
      for (const a of Object.values(w.alt || {})) add(a)
    }
  }
  for (const rungs of Object.values(LADDERS)) for (const r of rungs) { add(r.id); add(r.neutral) }
  for (const g of Object.values(ANKLE_GATES)) for (const p of [1, 2, 3, 4]) add(g[p])
  for (const x of MOBILITY_FLOW) add(x.id)
  for (const f of Object.values(FREE_KINDS)) add(f.id)
  return [...ids]
}

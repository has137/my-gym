// My gym: ankle rehabilitation after a partial ligament tear with recurring sprains
// (program.md §5, research.md S14–S16, S40–S45). Pure: phase data, which drills a session shows,
// whether a set of test results moves you on, and which exercise a phase allows.

export const PHASES = [1, 2, 3, 4]

// Drills per phase. A session shows two of them, rotating so the week covers the whole list.
export const PHASE_DRILLS = {
  1: [
    { id: '3127', sets: 2, reps: 15, note: 'light-band' },
    { id: '10734', sets: 3, sec: 30, side: true, note: 'floor-by-wall' },
    { id: '1373', sets: 2, reps: 15 },
    { id: '3128', sets: 2, reps: 15 },
    { id: '10003', sets: 2, reps: 15 },
    { id: '1368', sets: 1, reps: 10, note: 'each-direction' },
  ],
  2: [
    { id: '1387', sets: 2, reps: 15, side: true },
    { id: '10734', sets: 3, sec: 30, side: true, note: 'eyes-closed-or-pillow' },
    { id: '11790', sets: 3, reps: 5, side: true },
    { id: '10859', sets: 2, reps: 15 },
    { id: '3127', sets: 2, reps: 15, note: 'stronger-band' },
    { id: '10294', sets: 2, sec: 20 },
  ],
  3: [
    { id: '1698', sets: 3, reps: 8 },
    { id: '0409', sets: 2, reps: 12, side: true },
    { id: '5153', sets: 3, reps: 10 },
    { id: '10734', sets: 2, sec: 30, side: true, note: 'eyes-closed-or-pillow' },
    { id: '11647', sets: 2, reps: 10, side: true },
    { id: '5482', sets: 2, reps: 6, side: true, note: 'stick-landing' },
  ],
  4: [
    { id: '9066', sets: 2, reps: 4, side: true },
    { id: '0409', sets: 2, reps: 15, side: true },
    { id: '7455', sets: 2, reps: 8, side: true },
    { id: '10734', sets: 2, sec: 30, side: true, note: 'eyes-closed-or-pillow' },
  ],
}

const SESSION_OFFSET = { A: 0, B: 2, C: 4, D: 1, E: 3 }

/** The two drills a session shows for a phase. Different sessions start at different points. */
export function drillsFor(phase, sessionKey) {
  const list = PHASE_DRILLS[clampPhase(phase)]
  const start = (SESSION_OFFSET[sessionKey] ?? 0) % list.length
  return [list[start], list[(start + 1) % list.length]]
}

export const clampPhase = p => Math.min(4, Math.max(1, Math.round(Number(p)) || 1))

// The tests that move you from one phase to the next. Each check reads one field of a results
// object and says whether it passes; the UI asks exactly these fields.
//   pain         0–10 in walking and stairs (phase 1) or the morning after (later phases)
//   holdOpen     seconds standing on the injured leg, eyes open
//   holdClosed   seconds standing on the injured leg, eyes closed
//   calfInjured  single-leg calf raises on the injured side; calfOther on the healthy side
//   kneeWallDiff cm difference between the legs in the knee-to-wall test
//   reachDiff    cm difference between the legs in the 3-direction reach (worst direction)
//   confidence   0–10, how much you trust the ankle
//   sideHopInjured / sideHopOther  seconds for 10 hops over a 30 cm line
//   sideHopFear  true when the side hop made you hesitate
//   ropeMinutes  continuous jump-rope minutes without pain
export const CRITERIA = {
  1: [
    { key: 'pain', test: r => num(r.pain) <= 2 },
    { key: 'holdOpen', test: r => num(r.holdOpen) >= 30 },
    { key: 'calfInjured', test: r => num(r.calfInjured) >= 15 },
    { key: 'kneeWallDiff', test: r => num(r.kneeWallDiff, Infinity) <= 2 },
  ],
  2: [
    { key: 'calfInjured', test: r => num(r.calfInjured) >= 25 && num(r.calfInjured) >= 0.9 * num(r.calfOther) },
    { key: 'holdClosed', test: r => num(r.holdClosed) >= 20 },
    { key: 'reachDiff', test: r => num(r.reachDiff, Infinity) <= 4 },
    { key: 'confidence', test: r => num(r.confidence) >= 7 },
    { key: 'pain', test: r => num(r.pain) <= 2 },
  ],
  3: [
    { key: 'sideHopInjured', test: r => num(r.sideHopInjured, Infinity) < 13 && r.sideHopFear !== true },
    { key: 'sideHopOther', test: r => sideHopSymmetric(r) },
    { key: 'ropeMinutes', test: r => num(r.ropeMinutes) >= 3 },
    { key: 'confidence', test: r => num(r.confidence) >= 8 },
    { key: 'pain', test: r => num(r.pain) <= 2 },
  ],
  4: [],
}

function num(v, fallback = 0) {
  const n = Number(v)
  return v === '' || v == null || !Number.isFinite(n) ? fallback : n
}

// Slower on the injured side by at most 10 %. A faster injured side passes too.
function sideHopSymmetric(r) {
  const inj = num(r.sideHopInjured, Infinity), other = num(r.sideHopOther, Infinity)
  if (!Number.isFinite(inj) || !Number.isFinite(other) || other <= 0) return false
  return inj <= other * 1.1
}

/** { pass, failed: [keys] } for a phase's exit test. Phase 4 has no exit: it is maintenance. */
export function evaluatePhase(phase, results = {}) {
  const p = clampPhase(phase)
  const checks = CRITERIA[p]
  if (!checks.length) return { pass: false, failed: [], final: true }
  const failed = checks.filter(c => !c.test(results)).map(c => c.key)
  return { pass: failed.length === 0, failed, final: false }
}

/**
 * The phase after a test. Passing moves on one phase; a new sprain or pain of 6 or more sends you
 * back to phase 1, because the tissue has to settle again before it is loaded.
 */
export function phaseAfter(phase, results = {}, { newSprain = false } = {}) {
  const p = clampPhase(phase)
  if (newSprain || num(results.pain) >= 6) return 1
  const { pass } = evaluatePhase(p, results)
  return pass ? Math.min(4, p + 1) : p
}

/** The exercise id a gate allows in a phase, and the note that goes with it. */
export function gated(gate, phase) {
  if (!gate) return null
  const p = clampPhase(phase)
  return { id: gate[p], note: gate.note?.[p] || null }
}

/** Jumping, rope and single-leg hops: phase 3 onwards. Broad jumps and jump squats: phase 4. */
export const canJump = phase => clampPhase(phase) >= 3
export const canPower = phase => clampPhase(phase) >= 4
export const ropeLevelCap = phase => (clampPhase(phase) >= 4 ? 7 : clampPhase(phase) === 3 ? 3 : 0)

/** Footwork rules for shadow and bag rounds in each phase (program.md §5). */
export const FOOTWORK = { 1: 'flat', 2: 'step-drag', 3: 'light-bounce', 4: 'full' }

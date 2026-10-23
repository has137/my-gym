// My gym: round and interval timers, and how boxing rounds and jump rope progress
// (program.md §7). Pure: plans are lists of segments, and the timer's state is worked out from
// timestamps (Date.now), never from a ticking counter, so it stays right when the phone sleeps.

/** Segments for `rounds` rounds of work with rest between them (none after the last). */
export function roundPlan({ rounds, workSec, restSec, kind = 'work', labels = [] }) {
  const out = []
  const n = Math.max(1, Math.round(rounds) || 1)
  for (let i = 0; i < n; i++) {
    out.push({ type: 'work', sec: workSec, round: i + 1, of: n, kind, label: labels[i % (labels.length || 1)] ?? null })
    if (i < n - 1 && restSec > 0) out.push({ type: 'rest', sec: restSec, round: i + 1, of: n, kind })
  }
  return out
}

export const planSeconds = plan => (plan || []).reduce((sum, s) => sum + (s.sec || 0), 0)

/**
 * Where a running plan is: `startedAt` when it began, `pausedMs` paused time so far, `pausedAt`
 * when it is paused right now (or null). { index, seg, left, elapsed, done }.
 */
export function timerAt(plan, { startedAt, now, pausedMs = 0, pausedAt = null }) {
  const end = pausedAt != null ? pausedAt : now
  const elapsed = Math.max(0, (end - startedAt - pausedMs) / 1000)
  let t = elapsed
  for (let i = 0; i < plan.length; i++) {
    if (t < plan[i].sec) return { index: i, seg: plan[i], left: plan[i].sec - t, elapsed, done: false }
    t -= plan[i].sec
  }
  return { index: plan.length, seg: null, left: 0, elapsed, done: true }
}

/** Work seconds completed by the time the plan stopped, per round (for logging). */
export function workDone(plan, state) {
  const out = []
  let t = state.elapsed
  for (const seg of plan) {
    const used = Math.max(0, Math.min(seg.sec, t))
    if (seg.type === 'work' && used > 0) out.push({ round: seg.round, sec: Math.round(used) })
    t -= seg.sec
    if (t <= 0) break
  }
  return out
}

// Boxing rounds by programme phase (program.md §7). `cap` is the most rounds a session takes
// without passing 60 minutes (session C stops at 4; its fifth round is E's).
export const BOXING_BY_PHASE = {
  foundation: { rounds: 3, workSec: 120, restSec: 60, maxRounds: 3, maxSec: 120 },
  build: { rounds: 4, workSec: 120, restSec: 60, maxRounds: 4, maxSec: 150 },
  deload: { rounds: 2, workSec: 120, restSec: 60, maxRounds: 2, maxSec: 120 },
  power: { rounds: 4, workSec: 180, restSec: 60, maxRounds: 5, maxSec: 180 },
}

/** The rounds for a session, its saved level clamped to the phase and the session's cap. */
export function boxingRounds(phase, saved = null, cap = 5, roundsDelta = 0) {
  const base = BOXING_BY_PHASE[phase] || BOXING_BY_PHASE.foundation
  const maxRounds = Math.min(base.maxRounds, cap)
  const rounds = Math.max(1, Math.min(maxRounds, (saved?.rounds ?? base.rounds) + roundsDelta))
  const workSec = Math.max(60, Math.min(base.maxSec, saved?.workSec ?? base.workSec))
  return { rounds, workSec, restSec: base.restSec }
}

/**
 * The next level after a session. Everything done with the guard up at effort 7 or less: change
 * one thing, a round first, then 30 s more per round. Anything less: same again.
 */
export function nextBoxing(current, { completed, effort, guardUp = true }, phase, cap = 5) {
  const base = BOXING_BY_PHASE[phase] || BOXING_BY_PHASE.foundation
  const maxRounds = Math.min(base.maxRounds, cap)
  if (!completed || !guardUp || !(effort <= 7)) return { ...current, changed: null }
  if (current.rounds < maxRounds) return { ...current, rounds: current.rounds + 1, changed: 'round' }
  if (current.workSec < base.maxSec) return { ...current, workSec: Math.min(base.maxSec, current.workSec + 30), changed: 'length' }
  return { ...current, changed: 'difficulty' }
}

// Jump rope levels (program.md §7).
export const ROPE_LEVELS = [
  null,
  { level: 1, rounds: 6, workSec: 30, restSec: 30 },
  { level: 2, rounds: 8, workSec: 30, restSec: 30 },
  { level: 3, rounds: 6, workSec: 45, restSec: 15 },
  { level: 4, rounds: 5, workSec: 60, restSec: 30 },
  { level: 5, rounds: 3, workSec: 120, restSec: 60 },
  { level: 6, rounds: 3, workSec: 180, restSec: 60 },
  { level: 7, rounds: 3, workSec: 180, restSec: 60, bursts: 3 },
]

/** The rope level a session uses: saved level, within the ankle's cap and the session's. */
export function ropeLevel(saved, ankleCap, sessionCap = 7) {
  if (!(ankleCap > 0)) return 0
  return Math.max(1, Math.min(saved || 1, ankleCap, sessionCap))
}

/**
 * The next rope level. Up one when the effort was 7 or less and ankle pain stayed at 2 or less
 * during the session and the next morning; down one with pain of 4 or more. The weekly jumping
 * time may grow by 10 % at most, so a step that adds more than that waits.
 */
export function nextRope(level, { effort, pain = 0, morningPain = 0, weekMinutes = null, lastWeekMinutes = null }, ankleCap) {
  if (!(ankleCap > 0)) return 0
  if (pain >= 4 || morningPain >= 4) return Math.max(1, level - 1)
  if (!(effort <= 7) || pain > 2 || morningPain > 2) return level
  const next = Math.min(ankleCap, level + 1)
  if (next > level && weekMinutes != null && lastWeekMinutes > 0) {
    const add = ropeMinutes(next) - ropeMinutes(level)
    if (weekMinutes + add > lastWeekMinutes * 1.1) return level
  }
  return next
}

export const ropeMinutes = level => {
  const l = ROPE_LEVELS[level]
  return l ? (l.rounds * l.workSec) / 60 : 0
}

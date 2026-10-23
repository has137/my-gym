// My gym: the ladder rule (program.md §7). openGym's engine holds a lift at the heaviest
// dumbbell and keeps adding reps to bodyweight work; it never moves you to a harder exercise.
// This reads the logged sessions of the current rung and says when the next one is due.
//
// A rung is due for a step up when the last two counting sessions of its exercise both have
// every planned work set done at or above the rung's top. For a dumbbell rung the working weight
// must also be the heaviest bell you own: until then openGym's double progression adds load.

import { isWarmupRow } from '../../lib/workout-model.js'

const workRows = entry => (entry?.sets || []).filter(s => s && !isWarmupRow(s))
const counts = (w, e) => !(w?.excludeFromProgression === true || e?.noProg === true)

/** The last `n` counting entries of an exercise, newest first. */
export function lastEntries(workouts, exId, n = 2) {
  const out = []
  for (let i = (workouts || []).length - 1; i >= 0 && out.length < n; i--) {
    const w = workouts[i]
    for (const e of w?.entries || []) {
      if (e?.id === exId && counts(w, e)) { out.push(e); break }
    }
  }
  return out
}

/** Whether one logged entry reached the rung: enough sets, each done at the top. */
export function reachedTop(entry, rung) {
  if (!rung || rung.top == null) return false
  const rows = workRows(entry)
  const need = Math.max(1, rung.sets || 1)
  const done = rows.filter(s => s.done)
  if (done.length < need) return false
  const value = s => (rung.mode === 'time' ? Number(s.sec) || 0 : Number(s.r) || 0)
  return done.slice(0, need).every(s => value(s) >= rung.top)
}

/** The heaviest load logged in an entry's done work sets. */
const topLoad = entry => Math.max(0, ...workRows(entry).filter(s => s.done).map(s => Number(s.w) || 0))

/**
 * { due, from, to, reason } for one ladder. `index` is the current rung, `owned` the dumbbells
 * (needed only for loaded rungs). `sessions` how many sessions in a row must reach the top.
 */
export function ladderAdvice(workouts, ladder, index, { owned = [], sessions = 2, neutral = false } = {}) {
  const i = Math.max(0, Math.min((ladder?.length || 1) - 1, Math.round(Number(index)) || 0))
  const rung = ladder?.[i]
  const none = { due: false, from: i, to: i, reason: null }
  if (!rung) return none
  if (i >= ladder.length - 1) return { ...none, reason: 'last' }
  const id = neutral && rung.neutral ? rung.neutral : rung.id
  const recent = lastEntries(workouts, id, sessions)
  if (recent.length < sessions) return { ...none, reason: 'not-enough' }
  if (!recent.every(e => reachedTop(e, rung))) return { ...none, reason: 'not-at-top' }
  if (rung.loaded || isDumbbellRung(rung)) {
    const heaviest = owned.length ? Math.max(...owned) : Infinity
    if (!recent.every(e => topLoad(e) >= heaviest)) return { ...none, reason: 'not-at-heaviest' }
  }
  return { due: true, from: i, to: i + 1, reason: 'top-reached' }
}

const DUMBBELL_RUNGS = new Set(['1760', '4816', '2966'])
const isDumbbellRung = rung => DUMBBELL_RUNGS.has(rung.id)

/**
 * For a dumbbell lift that is not on a ladder: what to do once the heaviest bell is the working
 * weight (program.md §7, "when the dumbbells get light"). Steps run in order; each lasts until
 * the top of its range is reached in two sessions.
 */
export const LIGHT_DUMBBELL_STEPS = ['reps-20', 'slow-lowering', 'pause', 'one-and-a-half', 'one-side', 'harder-alternative']

export function lightDumbbellStep(workouts, exId, { owned = [], topReps = 12 } = {}) {
  const heaviest = owned.length ? Math.max(...owned) : Infinity
  const recent = lastEntries(workouts, exId, 2)
  if (recent.length < 2) return null
  const atHeaviest = recent.every(e => topLoad(e) >= heaviest)
  const atTop = recent.every(e => workRows(e).filter(s => s.done).every(s => (Number(s.r) || 0) >= topReps))
  return atHeaviest && atTop ? LIGHT_DUMBBELL_STEPS[0] : null
}

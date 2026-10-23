// My gym: coming back after missed sessions (program.md §8). openGym's progression does not
// know you were away, so the first week back would open at the old weights. Pure: the gap since
// the last workout, the return plan for that gap, and the session entries adjusted by it.

import { isWarmupRow } from '../../lib/workout-model.js'

const DAY = 86400000
const parse = iso => Date.parse(String(iso) + 'T12:00:00')

/** Whole days from the last logged workout before `todayISO` to today, or null with none. */
export function gapDays(workouts, todayISO) {
  const days = (workouts || []).map(w => w?.d).filter(d => typeof d === 'string' && d < todayISO).sort()
  if (!days.length) return null
  return Math.round((parse(todayISO) - parse(days.at(-1))) / DAY)
}

// The gap is counted in days since the last session. Four to five sessions a week means two or
// three days is normal, and up to a week is one or two missed sessions.
export const RETURN_PLANS = [
  { key: 'none', maxDays: 7, loadFactor: 1, dropSets: 0, rirBonus: 0, roundsDelta: 0, ropeDelta: 0, restartWeek: null, retest: false },
  { key: 'week', maxDays: 14, loadFactor: 1, dropSets: 0, rirBonus: 1, roundsDelta: 0, ropeDelta: 0, restartWeek: null, retest: false },
  { key: 'weeks', maxDays: 28, loadFactor: 0.9, dropSets: 1, rirBonus: 1, roundsDelta: -1, ropeDelta: -1, restartWeek: null, retest: false },
  { key: 'month', maxDays: Infinity, loadFactor: 0.8, dropSets: 1, rirBonus: 1, roundsDelta: -1, ropeDelta: -2, restartWeek: 3, retest: true },
]

export function returnPlanFor(days) {
  if (days == null || !Number.isFinite(days)) return RETURN_PLANS[0]
  return RETURN_PLANS.find(p => days <= p.maxDays) || RETURN_PLANS.at(-1)
}

/**
 * The plan in force today. A return from two weeks or more lasts seven days from the first
 * session back (`saved` holds { since, key } once started), so it is not lost after that
 * session closes the gap. A one-week return applies to the first session only.
 */
export function activeReturn(workouts, todayISO, saved = null) {
  const gap = gapDays(workouts, todayISO)
  const fresh = returnPlanFor(gap)
  if (fresh.key !== 'none') return { ...fresh, since: todayISO, gap }
  if (saved && saved.key && saved.key !== 'none' && saved.key !== 'week') {
    const plan = RETURN_PLANS.find(p => p.key === saved.key)
    const age = Math.round((parse(todayISO) - parse(saved.since)) / DAY)
    if (plan && age >= 0 && age < 7) return { ...plan, since: saved.since, gap }
  }
  return { ...RETURN_PLANS[0], since: null, gap }
}

/** The heaviest owned weight at or below `w`, or `w` rounded down to `step` without a list. */
export function snapDown(w, owned = [], step = 2) {
  if (!(w > 0)) return w
  if (owned.length) {
    const fit = owned.filter(x => x <= w + 1e-9)
    return fit.length ? Math.max(...fit) : Math.min(...owned)
  }
  return Math.max(step, Math.floor(w / step) * step)
}

/**
 * Session entries adjusted for a return plan: work-set loads scaled and snapped to the bells you
 * own, the last `dropSets` work sets removed (never below one), and a note of why. Warm-up rows
 * and bodyweight rows (w 0) keep their load. Pure: returns new entries.
 */
export function applyReturn(entries, plan, owned = []) {
  if (!plan || plan.key === 'none') return entries
  return (entries || []).map(entry => {
    const rows = entry.sets || []
    const work = rows.filter(s => !isWarmupRow(s))
    const keep = Math.max(1, work.length - (plan.dropSets || 0))
    let seen = 0
    const sets = []
    for (const s of rows) {
      if (isWarmupRow(s)) { sets.push(s); continue }
      seen++
      if (seen > keep) continue
      sets.push(s.w > 0 && plan.loadFactor < 1 ? { ...s, w: snapDown(s.w * plan.loadFactor, owned) } : s)
    }
    return { ...entry, sets, mgReturn: plan.key }
  })
}

/**
 * Session entries for a deload week: half the work sets (rounded up), loads kept, and built
 * without progression (`noProg`) so the next normal week continues from the last counting one.
 */
export function applyDeload(entries) {
  return (entries || []).map(entry => {
    const rows = entry.sets || []
    const work = rows.filter(s => !isWarmupRow(s))
    const keep = Math.max(1, Math.ceil(work.length / 2))
    let seen = 0
    const sets = rows.filter(s => isWarmupRow(s) || ++seen <= keep)
    return { ...entry, sets, noProg: true, mgDeload: true }
  })
}

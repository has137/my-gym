// My gym: where in the programme you are (program.md §8). Pure: the week from the start date,
// the phase that week belongs to, deload and test weeks, and how a phase shapes a routine entry.

const DAY = 86400000
const parse = iso => Date.parse(String(iso) + 'T12:00:00')

/** Programme week: 1 on the start day and the six after it. 0 before the start. */
export function programWeek(startISO, todayISO) {
  if (!startISO || !todayISO) return 1
  const days = Math.floor((parse(todayISO) - parse(startISO)) / DAY)
  if (!Number.isFinite(days) || days < 0) return 0
  return Math.floor(days / 7) + 1
}

// Weeks 1–14 are the first cycle. After it a new cycle starts at the build phase (week 5), so
// week 15 behaves as week 5, week 24 as week 14, and so on.
export function cycleWeek(week) {
  const w = Math.max(1, Math.round(Number(week)) || 1)
  return w <= 14 ? w : 5 + ((w - 15) % 10)
}

/** 'foundation' (1–4), 'build' (5–8), 'deload' (9, 14), 'power' (10–13). */
export function phaseOf(week) {
  const w = cycleWeek(week)
  if (w <= 4) return 'foundation'
  if (w <= 8) return 'build'
  if (w === 9 || w === 14) return 'deload'
  return 'power'
}

/** Target reps in reserve for the week (program.md §8). */
export function rirFor(week) {
  const w = cycleWeek(week)
  const phase = phaseOf(week)
  if (phase === 'deload') return 3
  if (phase === 'foundation') return w <= 2 ? 3 : 2
  if (phase === 'build') return 2
  return 1
}

/** Test weeks: the start (week 0/1), then 5, 9 and 14 of every cycle. */
export function isTestWeek(week) {
  const w = Math.max(0, Math.round(Number(week)) || 0)
  if (w <= 1) return true
  const c = cycleWeek(w)
  return c === 5 || c === 9 || c === 14
}

/**
 * A routine entry shaped by the phase: foundation starts four-set lifts at three. A deload week
 * is applied to the session when it starts (layoff.js applyDeload), not to the routine, so the
 * routine and its progression history stay the same across the week.
 */
export function shapeForPhase(entry, phase) {
  const out = { ...entry }
  if (phase === 'foundation' && out.sets >= 4) out.sets = 3
  return out
}

/**
 * Signs that call for an early deload (program.md §8). `signals` are counts the app keeps:
 *   regressions  exercises whose load or reps went down in the last two sessions
 *   badSleepDays days in the last 7 you rated sleep as poor
 *   painRepeats  joint pain logs of 4 or more in the last two sessions
 *   effortMissed sessions in a row where the target effort was out of reach
 */
export function earlyDeload(signals = {}) {
  const reasons = []
  if ((signals.regressions || 0) >= 3) reasons.push('regressions')
  if ((signals.badSleepDays || 0) >= 5) reasons.push('sleep')
  if ((signals.painRepeats || 0) >= 2) reasons.push('pain')
  if ((signals.effortMissed || 0) >= 2) reasons.push('effort')
  return { due: reasons.length > 0, reasons }
}

export const EARLY_DELOAD_DAYS = 7

/** Whether an early deload started on `fromISO` still runs on `todayISO`: seven days from it. */
export function inEarlyDeload(fromISO, todayISO, days = EARLY_DELOAD_DAYS) {
  if (!fromISO) return false
  const age = (Date.parse(todayISO + 'T12:00:00') - Date.parse(fromISO + 'T12:00:00')) / 86400000
  return age >= 0 && age < days
}

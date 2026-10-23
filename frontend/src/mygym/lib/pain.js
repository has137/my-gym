// My gym: joint pain logging and the pain rule (program.md §5, research.md S17). Pure.

export const JOINTS = ['shoulder', 'wrist', 'elbow', 'neck', 'back', 'hip', 'knee', 'ankle']

/** 'ok' 0–3, 'ease' 4–5, 'stop' 6 and over. */
export function painZone(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  if (n <= 3) return 'ok'
  if (n <= 5) return 'ease'
  return 'stop'
}

/** A pain entry as stored: { d, at, joint, v, ctx } with v clamped to 0–10. */
export function painEntry({ joint, v, ctx = null, d, at }) {
  if (!JOINTS.includes(joint)) throw new Error('unknown joint ' + joint)
  const n = Math.max(0, Math.min(10, Math.round(Number(v) || 0)))
  return { d, at, joint, v: n, ...(ctx ? { ctx } : {}) }
}

/** The log with an entry added, newest last, at most `max` entries kept. */
export function addPain(log, entry, max = 500) {
  return [...(log || []), entry].slice(-max)
}

/** The latest entry for a joint, or null. */
export const latestPain = (log, joint) => [...(log || [])].reverse().find(e => e.joint === joint) || null

/**
 * The next-morning check (program.md §5): pain or swelling above the usual means one step back
 * in the exercise that caused it. `usual` is the joint's typical score from the last two weeks.
 */
export function morningAdvice(morning, usual) {
  const m = Number(morning), u = Number(usual) || 0
  if (!Number.isFinite(m)) return null
  if (m >= 6) return 'see-specialist-if-it-stays'
  if (m > u && m > 2) return 'step-back'
  return 'carry-on'
}

/** The typical score for a joint: the median of the last `days` days' entries, 0 with none. */
export function usualPain(log, joint, todayISO, days = 14) {
  const from = shift(todayISO, -days)
  const vals = (log || []).filter(e => e.joint === joint && e.d >= from && e.d < todayISO).map(e => e.v).sort((a, b) => a - b)
  if (!vals.length) return 0
  const mid = Math.floor(vals.length / 2)
  return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2
}

/** Logs of 4 or more for any joint across the last `sessions` training days (early deload sign). */
export function painRepeats(log, trainingDays) {
  const days = new Set(trainingDays)
  return (log || []).filter(e => days.has(e.d) && e.v >= 4).length
}

/** One row per joint: latest score, its zone, and the number of logs in the last 7 days. */
export function jointSummary(log, todayISO) {
  const week = shift(todayISO, -7)
  return JOINTS.map(joint => {
    const last = latestPain(log, joint)
    return { joint, last: last?.v ?? null, d: last?.d ?? null, zone: last ? painZone(last.v) : null, week: (log || []).filter(e => e.joint === joint && e.d >= week).length }
  })
}

function shift(iso, days) {
  const t = Date.parse(iso + 'T12:00:00') + days * 86400000
  return new Date(t).toISOString().slice(0, 10)
}

// Signs that call for stopping and seeing a specialist (program.md §5). Content for the screen;
// the keys are translated in mygym/i18n.js.
export const RED_FLAGS = [
  'new-sprain-cannot-walk',
  'gives-way-twice',
  'unstable-after-3-months',
  'sharp-pain-pop',
  'swelling-growing',
  'numb-weak-cold',
  'locks',
  'night-pain-or-2-weeks',
  'chest-dizzy-breath',
]

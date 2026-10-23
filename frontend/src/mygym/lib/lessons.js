// My gym: which boxing lesson is the week's (program.md §7). One new lesson a week; the next one
// opens only once you rate your control of the current one 7 or more. A lesson that needs a
// higher ankle phase waits, and the next one allowed goes first. Pure.

export const LEARNED_AT = 7

export function isLearned(ratings, id) {
  return (Number(ratings?.[id]) || 0) >= LEARNED_AT
}

/**
 * { lesson, review, waiting } for the week. `lesson` is the one to practise (null in a deload
 * week or when everything open is learned), `waiting` the lessons held back by the ankle phase.
 */
export function weekLesson(lessons, { week, anklePhase = 1, ratings = {}, deload = false }) {
  const learned = lessons.filter(l => isLearned(ratings, l.id))
  const waiting = []
  if (deload) return { lesson: null, review: true, waiting, learned }
  for (const l of lessons) {
    if (isLearned(ratings, l.id)) continue
    if (l.week > Math.max(1, week)) break
    if (anklePhase < (l.ankle || 1)) { waiting.push(l); continue }
    return { lesson: l, review: false, waiting, learned }
  }
  return { lesson: null, review: true, waiting, learned }
}

/** Lessons open for review (learned ones), in order, for session E and the library. */
export const reviewList = (lessons, ratings) => lessons.filter(l => isLearned(ratings, l.id))

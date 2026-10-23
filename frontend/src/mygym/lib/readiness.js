// My gym: health readiness before the first session. Seven yes/no questions written for this
// app, based on the topics of the PAR-Q+ general health questions (research.md S31). They are
// not the official form: the screen links to it at eparmedx.com. A "yes" never locks the app;
// it says to check with a doctor first, and the app stays a training log, not medical advice.

export const QUESTIONS = ['heart', 'chest-pain', 'dizzy', 'chronic', 'medication', 'joint', 'supervised']

/** { complete, yes: [keys], advice } where advice is 'clear', 'see-doctor' or 'joint-only'. */
export function readinessResult(answers = {}) {
  const complete = QUESTIONS.every(q => answers[q] === true || answers[q] === false)
  const yes = QUESTIONS.filter(q => answers[q] === true)
  let advice = 'clear'
  if (yes.length === 1 && yes[0] === 'joint') advice = 'joint-only'
  else if (yes.length) advice = 'see-doctor'
  return { complete, yes, advice }
}

/** The record kept in state once answered. A year later the questions are asked again. */
export function readinessRecord(answers, d) {
  const r = readinessResult(answers)
  return { d, yes: r.yes, advice: r.advice }
}

export function readinessDue(record, todayISO) {
  if (!record?.d) return true
  const age = (Date.parse(todayISO + 'T12:00:00') - Date.parse(record.d + 'T12:00:00')) / 86400000
  return !(age >= 0 && age < 365)
}

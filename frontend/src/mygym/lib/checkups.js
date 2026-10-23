// My gym: the periodic tests (program.md §8) and the weekly backup reminder. Pure.

import { programWeek, isTestWeek } from './phases.js'

// What a test session records. `ankle` limits a test to an ankle phase; units for the screen.
export const TESTS = [
  { key: 'pullups', group: 'strength', unit: 'reps' },
  { key: 'pushups', group: 'strength', unit: 'reps' },
  { key: 'hrRecovery', group: 'fitness', unit: 'bpm' },
  { key: 'ropeMinute', group: 'fitness', unit: 'jumps', ankle: 4 },
  { key: 'broadJump', group: 'power', unit: 'cm', ankle: 4 },
  { key: 'kneeWallL', group: 'mobility', unit: 'cm' },
  { key: 'kneeWallR', group: 'mobility', unit: 'cm' },
  { key: 'thomas', group: 'mobility', unit: 'pass' },
  { key: 'toeTouch', group: 'mobility', unit: 'cm' },
  { key: 'backScratch', group: 'mobility', unit: 'cm' },
  { key: 'waist', group: 'body', unit: 'cm' },
]

export const testsFor = anklePhase => TESTS.filter(t => !t.ankle || anklePhase >= t.ankle)

/** Whether tests are due today: a test week, with no test logged in that week yet. */
export function testsDue(startISO, todayISO, records = []) {
  const week = programWeek(startISO, todayISO)
  if (!isTestWeek(week)) return { due: false, week }
  const done = (records || []).some(r => programWeek(startISO, r.d) === week)
  return { due: !done, week }
}

/** Weekly averages of the weigh-ins: [{ week: 'YYYY-MM-DD' (its first day), avg, n }]. */
export function weeklyAverages(bodyweight, weekStart = 6) {
  const by = new Map()
  for (const b of bodyweight || []) {
    if (!b?.d || !(b.w > 0)) continue
    const key = weekStartISO(b.d, weekStart)
    const g = by.get(key) || { sum: 0, n: 0 }
    g.sum += b.w; g.n++
    by.set(key, g)
  }
  return [...by.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([week, g]) => ({ week, avg: Math.round((g.sum / g.n) * 10) / 10, n: g.n }))
}

/** Change of the weekly average as a % of body weight per week, over the last `weeks`. */
export function weeklyRate(avgs, weeks = 4) {
  const tail = (avgs || []).slice(-(weeks + 1))
  if (tail.length < 2) return null
  const first = tail[0].avg, last = tail.at(-1).avg
  const spanWeeks = tail.length - 1
  return Math.round(((last - first) / first / spanWeeks) * 1000) / 10
}

function weekStartISO(iso, weekStart) {
  const d = new Date(iso + 'T12:00:00')
  const back = (d.getDay() - weekStart + 7) % 7
  d.setDate(d.getDate() - back)
  return d.toISOString().slice(0, 10)
}

// The backup reminder: data lives only on the phone, so once a week the Today screen asks.
export const BACKUP_EVERY_DAYS = 7

export function backupDue(lastAt, now, firstUseAt = null, days = BACKUP_EVERY_DAYS) {
  const ref = Number(lastAt) || Number(firstUseAt) || 0
  if (!ref) return false
  return now - ref >= days * 86400000
}

export const backupFileName = todayISO => 'mygym-backup-' + todayISO + '.json'

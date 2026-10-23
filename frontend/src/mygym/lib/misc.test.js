import { describe, it, expect } from 'vitest'
import { painZone, painEntry, addPain, latestPain, morningAdvice, usualPain, painRepeats, jointSummary, JOINTS } from './pain.js'
import { freeActivityWorkout, roundsEntry, ropeEntry } from './free-activity.js'
import { readinessResult, readinessRecord, readinessDue, QUESTIONS } from './readiness.js'
import { testsDue, weeklyAverages, weeklyRate, backupDue, backupFileName, testsFor } from './checkups.js'
import { weekLesson, isLearned, reviewList } from './lessons.js'
import { LESSONS } from '../content/lessons.js'
import { workoutVolume } from '../../lib/history.js'

describe('the pain rule', () => {
  it('splits 0–3, 4–5 and 6+', () => {
    expect([0, 3, 4, 5, 6, 10].map(painZone)).toEqual(['ok', 'ok', 'ease', 'ease', 'stop', 'stop'])
    expect(painZone(-1)).toBe(null)
    expect(painZone('x')).toBe(null)
  })
  it('stores a clamped entry for a known joint only', () => {
    expect(painEntry({ joint: 'ankle', v: 12, d: '2026-10-24', at: 1 })).toEqual({ d: '2026-10-24', at: 1, joint: 'ankle', v: 10 })
    expect(() => painEntry({ joint: 'toe', v: 1 })).toThrow()
  })
  it('keeps the log bounded and finds the latest per joint', () => {
    let log = []
    for (let i = 0; i < 5; i++) log = addPain(log, { d: '2026-10-2' + i, joint: i % 2 ? 'knee' : 'ankle', v: i }, 4)
    expect(log).toHaveLength(4)
    expect(latestPain(log, 'ankle').v).toBe(4)
    expect(latestPain(log, 'neck')).toBe(null)
  })
  it('says to step back when the morning is worse than usual', () => {
    expect(morningAdvice(3, 1)).toBe('step-back')
    expect(morningAdvice(2, 1)).toBe('carry-on')
    expect(morningAdvice(6, 6)).toBe('see-specialist-if-it-stays')
  })
  it('reads the usual pain as the median of two weeks, and counts repeats', () => {
    const log = [{ d: '2026-10-15', joint: 'ankle', v: 1 }, { d: '2026-10-18', joint: 'ankle', v: 3 }, { d: '2026-10-20', joint: 'ankle', v: 2 }, { d: '2026-09-01', joint: 'ankle', v: 9 }]
    expect(usualPain(log, 'ankle', '2026-10-24')).toBe(2)
    expect(painRepeats([{ d: '2026-10-20', v: 4 }, { d: '2026-10-22', v: 5 }, { d: '2026-10-22', v: 2 }], ['2026-10-20', '2026-10-22'])).toBe(2)
  })
  it('summarises every joint', () => {
    expect(jointSummary([], '2026-10-24').map(r => r.joint)).toEqual(JOINTS)
  })
})

describe('free activity', () => {
  const at = Date.parse('2026-10-24T18:00:00')
  it('builds a finished workout without routines, out of progression', () => {
    const w = freeActivityWorkout({ kind: 'rope', minutes: 20, now: at, id: 'f1', d: '2026-10-24', name: 'Rope' })
    expect(w).toMatchObject({ id: 'f1', d: '2026-10-24', start: at - 20 * 60000, end: at, routineIds: [], routineId: null, mgFree: 'rope', excludeFromProgression: true })
    expect(w.entries).toEqual([{ id: '2612', sets: [{ min: 20, done: true, at }], topW: null, target: { id: '2612', mode: 'cardio', sets: 1, min: 20 }, noProg: true }])
    expect(workoutVolume(w)).toBe(0)
  })
  it('logs shadow boxing and walking too, and refuses an unknown kind', () => {
    expect(freeActivityWorkout({ kind: 'shadow', minutes: 10, now: at, id: 'f2', d: '2026-10-24' }).entries[0].id).toBe('2272')
    expect(freeActivityWorkout({ kind: 'walk', minutes: 30, now: at, id: 'f3', d: '2026-10-24' }).entries[0].id).toBe('2258')
    expect(() => freeActivityWorkout({ kind: 'swim', minutes: 30, now: at })).toThrow()
  })
  it('turns timed rounds into an entry for the running session', () => {
    expect(roundsEntry({ exId: '4582', rounds: [{ round: 1, sec: 120 }, { round: 2, sec: 90 }], at })).toEqual({
      id: '4582', target: { id: '4582', mode: 'time', sets: 2, sec: 120 },
      sets: [{ sec: 120, w: 0, done: true, at }, { sec: 90, w: 0, done: true, at }], noProg: true, mgRounds: true,
    })
    expect(roundsEntry({ exId: '4582', rounds: [], at })).toBe(null)
    expect(ropeEntry({ workSec: 180, at }).sets[0].min).toBe(3)
  })
})

describe('readiness questions', () => {
  const all = v => Object.fromEntries(QUESTIONS.map(q => [q, v]))
  it('is clear with all no, and needs every answer', () => {
    expect(readinessResult(all(false))).toEqual({ complete: true, yes: [], advice: 'clear' })
    expect(readinessResult({ heart: false }).complete).toBe(false)
  })
  it('treats a joint problem alone apart from the other answers', () => {
    expect(readinessResult({ ...all(false), joint: true }).advice).toBe('joint-only')
    expect(readinessResult({ ...all(false), joint: true, heart: true }).advice).toBe('see-doctor')
  })
  it('asks again after a year', () => {
    const r = readinessRecord(all(false), '2026-10-24')
    expect(readinessDue(r, '2027-10-23')).toBe(false)
    expect(readinessDue(r, '2027-10-25')).toBe(true)
    expect(readinessDue(null, '2026-10-24')).toBe(true)
  })
})

describe('periodic tests and the backup reminder', () => {
  it('is due in a test week until a test is logged that week', () => {
    expect(testsDue('2026-10-24', '2026-10-24', [])).toEqual({ due: true, week: 1 })
    expect(testsDue('2026-10-24', '2026-10-24', [{ d: '2026-10-24' }]).due).toBe(false)
    expect(testsDue('2026-10-24', '2026-11-05', []).due).toBe(false)
    expect(testsDue('2026-10-24', '2026-11-22', [{ d: '2026-10-24' }])).toEqual({ due: true, week: 5 })
  })
  it('leaves the jumping tests out before ankle phase 4', () => {
    expect(testsFor(3).map(t => t.key)).not.toContain('broadJump')
    expect(testsFor(4).map(t => t.key)).toContain('broadJump')
  })
  it('averages weigh-ins by week and gives the weekly rate', () => {
    const bw = [{ d: '2026-10-17', w: 96 }, { d: '2026-10-18', w: 96.4 }, { d: '2026-10-24', w: 95.4 }, { d: '2026-10-25', w: 95.6 }]
    const avgs = weeklyAverages(bw, 6)
    expect(avgs).toEqual([{ week: '2026-10-17', avg: 96.2, n: 2 }, { week: '2026-10-24', avg: 95.5, n: 2 }])
    expect(weeklyRate(avgs)).toBe(-0.7)
    expect(weeklyRate([])).toBe(null)
  })
  it('reminds after seven days, counted from the first use when no backup was made', () => {
    const day = 86400000
    expect(backupDue(null, 10 * day, 2 * day)).toBe(true)
    expect(backupDue(5 * day, 10 * day)).toBe(false)
    expect(backupDue(3 * day, 10 * day)).toBe(true)
    expect(backupDue(null, 10 * day, null)).toBe(false)
    expect(backupFileName('2026-10-24')).toBe('mygym-backup-2026-10-24.json')
  })
})

describe('boxing lessons', () => {
  it('opens the first lesson in week 1', () => {
    expect(weekLesson(LESSONS, { week: 1 }).lesson.id).toBe('stance')
  })
  it('moves to the next lesson only once the current one is rated 7 or more', () => {
    expect(weekLesson(LESSONS, { week: 2, ratings: { stance: 6 } }).lesson.id).toBe('stance')
    expect(weekLesson(LESSONS, { week: 2, ratings: { stance: 7 } }).lesson.id).toBe('footwork')
  })
  it('does not open a lesson before its week', () => {
    const ratings = { stance: 8, footwork: 8 }
    expect(weekLesson(LESSONS, { week: 1, ratings })).toMatchObject({ lesson: null, review: true })
    expect(weekLesson(LESSONS, { week: 2, ratings }).lesson.id).toBe('jab')
  })
  it('holds back a lesson the ankle is not ready for and goes on with the next', () => {
    const ratings = Object.fromEntries(LESSONS.slice(0, 10).map(l => [l.id, 9]))
    const r = weekLesson(LESSONS, { week: 11, ratings, anklePhase: 1 })
    expect(r.waiting.map(l => l.id)).toEqual(['pivot'])
    expect(r.lesson.id).toBe('body')
  })
  it('teaches nothing new in a deload week', () => {
    expect(weekLesson(LESSONS, { week: 9, deload: true })).toMatchObject({ lesson: null, review: true })
  })
  it('lists learned lessons for review, and every lesson has both reasons', () => {
    expect(reviewList(LESSONS, { stance: 7, jab: 6 }).map(l => l.id)).toEqual(['stance'])
    expect(isLearned({}, 'stance')).toBe(false)
    for (const l of LESSONS) {
      expect(l.ring.ar && l.defense.ar && l.ring.en && l.defense.en).toBeTruthy()
      expect(l.steps.ar.length).toBeGreaterThanOrEqual(3)
    }
  })
})

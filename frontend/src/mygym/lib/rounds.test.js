import { describe, it, expect } from 'vitest'
import { roundPlan, planSeconds, timerAt, workDone, boxingRounds, nextBoxing, ropeLevel, nextRope, ropeMinutes, ROPE_LEVELS } from './rounds.js'

describe('round plans', () => {
  it('puts rest between rounds and none after the last', () => {
    const p = roundPlan({ rounds: 3, workSec: 120, restSec: 60 })
    expect(p.map(s => s.type)).toEqual(['work', 'rest', 'work', 'rest', 'work'])
    expect(planSeconds(p)).toBe(480)
  })
})

describe('the timer works from timestamps', () => {
  const p = roundPlan({ rounds: 2, workSec: 120, restSec: 60 })
  const t0 = 1_000_000
  it('finds the segment and the time left', () => {
    expect(timerAt(p, { startedAt: t0, now: t0 + 30_000 })).toMatchObject({ index: 0, left: 90, done: false })
    expect(timerAt(p, { startedAt: t0, now: t0 + 150_000 })).toMatchObject({ index: 1, left: 30 })
    expect(timerAt(p, { startedAt: t0, now: t0 + 300_000 })).toMatchObject({ index: 3, done: true })
  })
  it('stays right when the screen sleeps for minutes (no ticks needed)', () => {
    expect(timerAt(p, { startedAt: t0, now: t0 + 200_000 }).index).toBe(2)
  })
  it('subtracts paused time and freezes while paused', () => {
    expect(timerAt(p, { startedAt: t0, now: t0 + 60_000, pausedMs: 30_000 }).left).toBe(90)
    const paused = timerAt(p, { startedAt: t0, now: t0 + 999_000, pausedAt: t0 + 30_000 })
    expect(paused).toMatchObject({ index: 0, left: 90 })
  })
  it('logs the work done per round when stopped early', () => {
    const st = timerAt(p, { startedAt: t0, now: t0 + 200_000 })
    expect(workDone(p, st)).toEqual([{ round: 1, sec: 120 }, { round: 2, sec: 20 }])
  })
})

describe('boxing rounds', () => {
  it('follows the phase and the session cap', () => {
    expect(boxingRounds('foundation')).toEqual({ rounds: 3, workSec: 120, restSec: 60 })
    expect(boxingRounds('power', { rounds: 5, workSec: 180 }, 4)).toEqual({ rounds: 4, workSec: 180, restSec: 60 })
    expect(boxingRounds('build', { rounds: 4, workSec: 150 }, 5, -1)).toEqual({ rounds: 3, workSec: 150, restSec: 60 })
  })
  it('changes one thing at a time: a round first, then length', () => {
    const done = { completed: true, effort: 7, guardUp: true }
    expect(nextBoxing({ rounds: 3, workSec: 120 }, done, 'build')).toMatchObject({ rounds: 4, changed: 'round' })
    expect(nextBoxing({ rounds: 4, workSec: 120 }, done, 'build')).toMatchObject({ rounds: 4, workSec: 150, changed: 'length' })
    expect(nextBoxing({ rounds: 4, workSec: 150 }, done, 'build')).toMatchObject({ changed: 'difficulty' })
    expect(nextBoxing({ rounds: 4, workSec: 180 }, done, 'power', 4)).toMatchObject({ changed: 'difficulty' })
  })
  it('stays the same when a round was cut short, the guard dropped or the effort was high', () => {
    expect(nextBoxing({ rounds: 3, workSec: 120 }, { completed: false, effort: 5 }, 'build').changed).toBe(null)
    expect(nextBoxing({ rounds: 3, workSec: 120 }, { completed: true, effort: 8 }, 'build').changed).toBe(null)
    expect(nextBoxing({ rounds: 3, workSec: 120 }, { completed: true, effort: 6, guardUp: false }, 'build').changed).toBe(null)
  })
})

describe('jump rope', () => {
  it('stays at 0 before ankle phase 3 and inside the caps after', () => {
    expect(ropeLevel(5, 0)).toBe(0)
    expect(ropeLevel(5, 3)).toBe(3)
    expect(ropeLevel(7, 7, 5)).toBe(5)
    expect(ropeLevel(null, 7)).toBe(1)
  })
  it('moves up with easy effort and no pain, down with pain of 4', () => {
    expect(nextRope(2, { effort: 6 }, 7)).toBe(3)
    expect(nextRope(3, { effort: 6 }, 3)).toBe(3)
    expect(nextRope(3, { effort: 6, morningPain: 3 }, 7)).toBe(3)
    expect(nextRope(3, { effort: 5, pain: 4 }, 7)).toBe(2)
    expect(nextRope(1, { effort: 5, pain: 5 }, 7)).toBe(1)
  })
  it('keeps the weekly jumping time within 10 % growth', () => {
    expect(ropeMinutes(4)).toBe(5)
    expect(ropeMinutes(5)).toBe(6)
    expect(nextRope(4, { effort: 6, weekMinutes: 10.5, lastWeekMinutes: 10 }, 7)).toBe(4)
    expect(nextRope(4, { effort: 6, weekMinutes: 10, lastWeekMinutes: 12 }, 7)).toBe(5)
  })
  it('has seven levels', () => {
    expect(ROPE_LEVELS.filter(Boolean).map(l => l.level)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
})

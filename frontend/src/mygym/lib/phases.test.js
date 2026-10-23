import { describe, it, expect } from 'vitest'
import { programWeek, cycleWeek, phaseOf, rirFor, isTestWeek, shapeForPhase, earlyDeload, inEarlyDeload } from './phases.js'

describe('programme week', () => {
  it('counts week 1 from the start day', () => {
    expect(programWeek('2026-10-24', '2026-10-24')).toBe(1)
    expect(programWeek('2026-10-24', '2026-10-30')).toBe(1)
    expect(programWeek('2026-10-24', '2026-10-31')).toBe(2)
    expect(programWeek('2026-10-24', '2026-10-20')).toBe(0)
  })
  it('restarts later cycles at the build phase', () => {
    expect(cycleWeek(14)).toBe(14)
    expect(cycleWeek(15)).toBe(5)
    expect(cycleWeek(24)).toBe(14)
    expect(cycleWeek(25)).toBe(5)
  })
})

describe('phases', () => {
  it('maps weeks to foundation, build, deload and power', () => {
    expect([1, 4, 5, 8, 9, 10, 13, 14, 15, 19].map(phaseOf)).toEqual(['foundation', 'foundation', 'build', 'build', 'deload', 'power', 'power', 'deload', 'build', 'deload'])
  })
  it('sets the effort per week', () => {
    expect([1, 2, 3, 5, 9, 10].map(rirFor)).toEqual([3, 3, 2, 2, 3, 1])
  })
  it('marks the test weeks: start, 5, 9, 14, then 5 and 9 and 14 of each later cycle', () => {
    expect([0, 1, 2, 5, 9, 14, 15, 19, 24].map(isTestWeek)).toEqual([true, true, false, true, true, true, true, true, true])
  })
})

describe('shaping an entry for the phase', () => {
  it('starts four-set lifts at three in the foundation and leaves others alone', () => {
    expect(shapeForPhase({ sets: 4 }, 'foundation').sets).toBe(3)
    expect(shapeForPhase({ sets: 3 }, 'foundation').sets).toBe(3)
    expect(shapeForPhase({ sets: 4 }, 'build').sets).toBe(4)
    expect(shapeForPhase({ sets: 4 }, 'deload').sets).toBe(4)
  })
})

describe('early deload signs', () => {
  it('needs at least one strong sign', () => {
    expect(earlyDeload({}).due).toBe(false)
    expect(earlyDeload({ regressions: 3 })).toEqual({ due: true, reasons: ['regressions'] })
    expect(earlyDeload({ painRepeats: 2, badSleepDays: 5 }).reasons).toEqual(['sleep', 'pain'])
    expect(earlyDeload({ painRepeats: 1 }).due).toBe(false)
  })
})

describe('an early deload', () => {
  it('runs seven days from the day it was taken', () => {
    expect(inEarlyDeload(null, '2026-10-24')).toBe(false)
    expect(inEarlyDeload('2026-10-24', '2026-10-24')).toBe(true)
    expect(inEarlyDeload('2026-10-24', '2026-10-30')).toBe(true)
    expect(inEarlyDeload('2026-10-24', '2026-10-31')).toBe(false)
    expect(inEarlyDeload('2026-10-24', '2026-10-23')).toBe(false)
  })
})

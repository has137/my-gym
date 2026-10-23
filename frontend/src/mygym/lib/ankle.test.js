import { describe, it, expect } from 'vitest'
import { drillsFor, evaluatePhase, phaseAfter, gated, canJump, canPower, ropeLevelCap, clampPhase, PHASE_DRILLS } from './ankle.js'
import { ANKLE_GATES } from '../program/data.js'

describe('ankle phase tests', () => {
  const p1 = { pain: 2, holdOpen: 30, calfInjured: 15, kneeWallDiff: 2 }
  it('passes phase 1 at the thresholds', () => {
    expect(evaluatePhase(1, p1)).toEqual({ pass: true, failed: [], final: false })
  })
  it('names every failed check', () => {
    expect(evaluatePhase(1, { ...p1, pain: 3, holdOpen: 29 }).failed).toEqual(['pain', 'holdOpen'])
  })
  it('treats a missing knee-to-wall number as not passed', () => {
    expect(evaluatePhase(1, { ...p1, kneeWallDiff: '' }).failed).toEqual(['kneeWallDiff'])
  })
  it('needs 25 calf raises and 90 % of the other side in phase 2', () => {
    const base = { calfInjured: 25, calfOther: 27, holdClosed: 20, reachDiff: 4, confidence: 7, pain: 1 }
    expect(evaluatePhase(2, base).pass).toBe(true)
    expect(evaluatePhase(2, { ...base, calfOther: 30 }).failed).toEqual(['calfInjured'])
  })
  it('needs a side hop under 13 s without fear, within 10 % of the other leg, in phase 3', () => {
    const base = { sideHopInjured: 12, sideHopOther: 11, ropeMinutes: 3, confidence: 8, pain: 0 }
    expect(evaluatePhase(3, base).pass).toBe(true)
    expect(evaluatePhase(3, { ...base, sideHopInjured: 13 }).failed).toContain('sideHopInjured')
    expect(evaluatePhase(3, { ...base, sideHopFear: true }).failed).toContain('sideHopInjured')
    expect(evaluatePhase(3, { ...base, sideHopInjured: 12.5, sideHopOther: 11 }).failed).toEqual(['sideHopOther'])
  })
  it('has no exit from phase 4', () => {
    expect(evaluatePhase(4, {})).toEqual({ pass: false, failed: [], final: true })
  })
})

describe('moving between phases', () => {
  it('moves on one phase when the test passes, and stays otherwise', () => {
    expect(phaseAfter(1, { pain: 0, holdOpen: 40, calfInjured: 20, kneeWallDiff: 1 })).toBe(2)
    expect(phaseAfter(1, { pain: 0, holdOpen: 10, calfInjured: 20, kneeWallDiff: 1 })).toBe(1)
  })
  it('goes back to phase 1 after a new sprain or pain of 6', () => {
    expect(phaseAfter(3, {}, { newSprain: true })).toBe(1)
    expect(phaseAfter(4, { pain: 6 })).toBe(1)
  })
})

describe('what each phase allows', () => {
  it('keeps the rope and jumping out until phase 3, and power jumps until phase 4', () => {
    expect([1, 2, 3, 4].map(canJump)).toEqual([false, false, true, true])
    expect([1, 2, 3, 4].map(canPower)).toEqual([false, false, false, true])
    expect([1, 2, 3, 4].map(ropeLevelCap)).toEqual([0, 0, 3, 7])
  })
  it('swaps gated exercises by phase', () => {
    expect(gated(ANKLE_GATES.rope, 2)).toEqual({ id: '0630', note: 'no-jump' })
    expect(gated(ANKLE_GATES.rope, 3)).toEqual({ id: '2612', note: null })
    expect(gated(ANKLE_GATES.burpee, 1).id).toBe('5039')
    expect(gated(ANKLE_GATES.slrdl, 2).id).toBe('4757')
    expect(gated(null, 2)).toBe(null)
  })
  it('clamps odd phase values', () => {
    expect(clampPhase(0)).toBe(1)
    expect(clampPhase('3')).toBe(3)
    expect(clampPhase(9)).toBe(4)
  })
})

describe('the two drills a session shows', () => {
  it('returns two different drills of the phase', () => {
    for (const p of [1, 2, 3, 4]) {
      for (const k of ['A', 'B', 'C', 'D', 'E']) {
        const [a, b] = drillsFor(p, k)
        expect(PHASE_DRILLS[p]).toContain(a)
        expect(PHASE_DRILLS[p]).toContain(b)
        expect(a).not.toBe(b)
      }
    }
  })
  it('covers every drill of a phase across the main sessions', () => {
    const seen = new Set(['A', 'B', 'C', 'D', 'E'].flatMap(k => drillsFor(1, k)))
    expect(seen.size).toBe(PHASE_DRILLS[1].length)
  })
  it('never shows a jumping drill before phase 3', () => {
    const jumps = new Set(['1698', '5153', '11647', '5482', '9066', '7455'])
    for (const p of [1, 2]) for (const d of PHASE_DRILLS[p]) expect(jumps.has(d.id)).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { ladderAdvice, reachedTop, lastEntries, lightDumbbellStep } from './ladder.js'
import { LADDERS, DUMBBELLS_KG } from '../program/data.js'

const sets = (reps, { w = 0, done = true, warm = 0 } = {}) => [
  ...Array.from({ length: warm }, () => ({ w: 0, r: 5, done: true, phase: 'warmup' })),
  ...reps.map(r => ({ w, r, done })),
]
const wk = (d, entries, extra = {}) => ({ id: 'w' + d, d, entries, ...extra })
const e = (id, s, extra = {}) => ({ id, sets: s, ...extra })

describe('reading a rung', () => {
  const rung = LADDERS.pushup[1] // 0662, 3 sets, top 12
  it('needs every planned set done at the top', () => {
    expect(reachedTop(e('0662', sets([12, 12, 12])), rung)).toBe(true)
    expect(reachedTop(e('0662', sets([12, 12, 11])), rung)).toBe(false)
    expect(reachedTop(e('0662', sets([12, 12]) ), rung)).toBe(false)
  })
  it('ignores warm-up rows and unticked sets', () => {
    expect(reachedTop(e('0662', sets([12, 12, 12], { warm: 2 })), rung)).toBe(true)
    expect(reachedTop(e('0662', [...sets([12, 12]), { w: 0, r: 12, done: false }]), rung)).toBe(false)
  })
  it('reads seconds for a timed rung', () => {
    const hang = LADDERS.pullup[0]
    expect(reachedTop(e('5055', [{ sec: 30, done: true }, { sec: 31, done: true }, { sec: 30, done: true }]), hang)).toBe(true)
    expect(reachedTop(e('5055', [{ sec: 30, done: true }, { sec: 25, done: true }, { sec: 30, done: true }]), hang)).toBe(false)
  })
})

describe('the ladder rule', () => {
  const push = LADDERS.pushup
  it('steps up after two sessions in a row at the top', () => {
    const ws = [wk('2026-10-20', [e('0662', sets([12, 12, 12]))]), wk('2026-10-24', [e('0662', sets([13, 13, 13]))])]
    expect(ladderAdvice(ws, push, 1)).toEqual({ due: true, from: 1, to: 2, reason: 'top-reached' })
  })
  it('waits for a second session', () => {
    expect(ladderAdvice([wk('2026-10-24', [e('0662', sets([12, 12, 12]))])], push, 1).due).toBe(false)
  })
  it('does not count a deload or excluded session', () => {
    const ws = [
      wk('2026-10-17', [e('0662', sets([12, 12, 12]))]),
      wk('2026-10-20', [e('0662', sets([12, 12, 12]), { noProg: true })]),
      wk('2026-10-24', [e('0662', sets([12, 12, 12]))]),
    ]
    expect(lastEntries(ws, '0662').length).toBe(2)
    expect(ladderAdvice(ws, push, 1).due).toBe(true)
    const excluded = [wk('2026-10-20', [e('0662', sets([12, 12, 12]))], { excludeFromProgression: true }), wk('2026-10-24', [e('0662', sets([12, 12, 12]))])]
    expect(ladderAdvice(excluded, push, 1).reason).toBe('not-enough')
  })
  it('holds at the last rung', () => {
    expect(ladderAdvice([], push, push.length - 1).reason).toBe('last')
  })
  it('reads the neutral-grip variant in session C', () => {
    const ws = [wk('2026-10-20', [e('0651', sets([5, 5, 5]))]), wk('2026-10-24', [e('0651', sets([5, 5, 5]))])]
    expect(ladderAdvice(ws, LADDERS.pullup, 4, { neutral: true }).due).toBe(true)
    expect(ladderAdvice(ws, LADDERS.pullup, 4).due).toBe(false)
  })
  it('moves a dumbbell ladder only at the heaviest bell', () => {
    const at = w => [wk('2026-10-20', [e('1760', sets([12, 12, 12, 12], { w }))]), wk('2026-10-24', [e('1760', sets([12, 12, 12, 12], { w }))])]
    expect(ladderAdvice(at(22), LADDERS.goblet, 0, { owned: DUMBBELLS_KG }).reason).toBe('not-at-heaviest')
    expect(ladderAdvice(at(24), LADDERS.goblet, 0, { owned: DUMBBELLS_KG }).due).toBe(true)
  })
  it('clamps a rung index out of range', () => {
    expect(ladderAdvice([], push, 99).reason).toBe('last')
    expect(ladderAdvice([], push, -3).from).toBe(0)
  })
})

describe('when the dumbbells get light', () => {
  it('starts the steps only at the heaviest bell and the top of the range', () => {
    const two = w => [wk('2026-10-20', [e('0289', sets([10, 10, 10], { w }))]), wk('2026-10-24', [e('0289', sets([10, 10, 10], { w }))])]
    expect(lightDumbbellStep(two(24), '0289', { owned: DUMBBELLS_KG, topReps: 10 })).toBe('reps-20')
    expect(lightDumbbellStep(two(22), '0289', { owned: DUMBBELLS_KG, topReps: 10 })).toBe(null)
  })
})

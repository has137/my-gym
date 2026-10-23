import { describe, it, expect } from 'vitest'
import { gapDays, returnPlanFor, activeReturn, snapDown, applyReturn, applyDeload } from './layoff.js'
import { DUMBBELLS_KG } from '../program/data.js'

const w = d => ({ id: d, d, entries: [] })

describe('the gap since the last workout', () => {
  it('counts days to the last workout before today', () => {
    expect(gapDays([w('2026-10-01'), w('2026-10-10')], '2026-10-24')).toBe(14)
    expect(gapDays([w('2026-10-24')], '2026-10-24')).toBe(null)
    expect(gapDays([], '2026-10-24')).toBe(null)
  })
})

describe('return plans', () => {
  it('changes nothing for one or two missed sessions', () => {
    expect(returnPlanFor(3).key).toBe('none')
    expect(returnPlanFor(7).key).toBe('none')
    expect(returnPlanFor(null).key).toBe('none')
  })
  it('keeps the weights after a week and makes the effort easier', () => {
    expect(returnPlanFor(10)).toMatchObject({ key: 'week', loadFactor: 1, dropSets: 0, rirBonus: 1 })
  })
  it('takes 10 % off and one set out after two to four weeks', () => {
    expect(returnPlanFor(15)).toMatchObject({ key: 'weeks', loadFactor: 0.9, dropSets: 1, roundsDelta: -1, ropeDelta: -1 })
    expect(returnPlanFor(28).key).toBe('weeks')
  })
  it('takes 20 % off, restarts at week 3 and asks for the tests after more than four weeks', () => {
    expect(returnPlanFor(29)).toMatchObject({ key: 'month', loadFactor: 0.8, restartWeek: 3, retest: true })
  })
})

describe('the plan in force', () => {
  const ws = [w('2026-09-20')]
  it('starts on the first day back', () => {
    expect(activeReturn(ws, '2026-10-10')).toMatchObject({ key: 'weeks', since: '2026-10-10', gap: 20 })
  })
  it('lasts the first week back once started', () => {
    const back = [...ws, w('2026-10-10')]
    expect(activeReturn(back, '2026-10-12', { key: 'weeks', since: '2026-10-10' }).key).toBe('weeks')
    expect(activeReturn(back, '2026-10-17', { key: 'weeks', since: '2026-10-10' }).key).toBe('none')
  })
  it('applies a one-week return to the first session only', () => {
    const back = [w('2026-10-01'), w('2026-10-12')]
    expect(activeReturn(back, '2026-10-14', { key: 'week', since: '2026-10-12' }).key).toBe('none')
  })
})

describe('adjusting a session', () => {
  const entry = { id: '0289', sets: [{ w: 10, r: 8, phase: 'warmup' }, { w: 22, r: 10 }, { w: 22, r: 10 }, { w: 22, r: 10 }] }
  it('snaps a scaled load down to a bell you own', () => {
    expect(snapDown(22 * 0.9, DUMBBELLS_KG)).toBe(18)
    expect(snapDown(24 * 0.8, DUMBBELLS_KG)).toBe(18)
    expect(snapDown(1, DUMBBELLS_KG)).toBe(2)
    expect(snapDown(0, DUMBBELLS_KG)).toBe(0)
    expect(snapDown(9, [])).toBe(8)
  })
  it('scales the work sets, drops one and keeps the warm-up', () => {
    const [out] = applyReturn([entry], returnPlanFor(20), DUMBBELLS_KG)
    expect(out.sets).toEqual([{ w: 10, r: 8, phase: 'warmup' }, { w: 18, r: 10 }, { w: 18, r: 10 }])
    expect(out.mgReturn).toBe('weeks')
  })
  it('never leaves an exercise without a set, and leaves bodyweight at 0', () => {
    const [out] = applyReturn([{ id: '0662', sets: [{ w: 0, r: 10 }] }], returnPlanFor(40), DUMBBELLS_KG)
    expect(out.sets).toEqual([{ w: 0, r: 10 }])
  })
  it('is a no-op with no plan', () => {
    const list = [entry]
    expect(applyReturn(list, returnPlanFor(2), DUMBBELLS_KG)).toBe(list)
  })
  it('halves the work sets for a deload and keeps it out of progression', () => {
    const [out] = applyDeload([entry])
    expect(out.sets).toEqual([{ w: 10, r: 8, phase: 'warmup' }, { w: 22, r: 10 }, { w: 22, r: 10 }])
    expect(out.noProg).toBe(true)
  })
})

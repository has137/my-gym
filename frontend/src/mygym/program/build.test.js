import { describe, it, expect } from 'vitest'
import { slotEntry, sessionEntries, applyProgram, needsRebuild, firstKnown } from './build.js'
import { SESSIONS, DUMBBELLS_KG } from './data.js'
import { queueView } from '../../lib/queue.js'

const names = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }
let n = 0
const uid = () => 'r' + (++n)
const TODAY = '2026-10-24'
const NOW = Date.parse(TODAY + 'T10:00:00')
const fresh = () => ({ routines: [], workouts: [], week: {}, dayPlan: {}, queue: null, rotation: null, equipProfiles: [] })

describe('slot entries', () => {
  it('builds a dumbbell slot with its rep range, rest, superset and alternatives', () => {
    const e = slotEntry(SESSIONS.A.work[1], { anklePhase: 1, phase: 'build' })
    expect(e).toMatchObject({ id: '0289', sets: 3, reps: 10, repsMin: 6, prog: 'double', restSec: 90, sg: 'A1' })
    expect(e.subs).toEqual(['2982', '3333', '0352'])
  })

  it('takes the current rung of a ladder', () => {
    const slot = SESSIONS.A.work[0]
    expect(slotEntry(slot, { rungs: { pullup: 1 } })).toMatchObject({ id: '0970', sets: 3, reps: 6 })
    expect(slotEntry(slot, { rungs: { pullup: 4 } })).toMatchObject({ id: '0652', reps: 3 })
  })

  it('uses the neutral-grip variant of the pull-up rung in session C', () => {
    expect(slotEntry(SESSIONS.C.work[0], { rungs: { pullup: 4 } }).id).toBe('0651')
  })

  it('builds the first pull-up rung as a timed hang', () => {
    expect(slotEntry(SESSIONS.A.work[0], { rungs: { pullup: 0 } })).toMatchObject({ id: '5055', mode: 'time', sec: 20, prog: 'time' })
  })

  it('swaps a one-leg exercise for the ankle phase', () => {
    const bulgarian = SESSIONS.B.work[2]
    expect(slotEntry(bulgarian, { anklePhase: 1 }).id).toBe('2960')
    expect(slotEntry(bulgarian, { anklePhase: 2 }).id).toBe('2290')
    const lunge = SESSIONS.D.work[1]
    expect(slotEntry(lunge, { anklePhase: 1 }).id).toBe('2960')
    expect(slotEntry(lunge, { anklePhase: 3 }).id).toBe('0381')
  })

  it('keeps per-side reps as the total of both sides', () => {
    expect(slotEntry(SESSIONS.C.work[2], {})).toMatchObject({ id: '0292', side: true, reps: 24, repsMin: 16 })
  })

  it('starts four-set lifts at three in the foundation weeks', () => {
    expect(slotEntry(SESSIONS.B.work[1], { phase: 'foundation' }).sets).toBe(3)
    expect(slotEntry(SESSIONS.B.work[1], { phase: 'build' }).sets).toBe(4)
  })

  it('falls back to the first known alternative when an id is gone', () => {
    const slot = { ...SESSIONS.A.work[1], id: '99999' }
    expect(slotEntry(slot, {}).id).toBe('2982')
    expect(firstKnown('99999', '0289')).toBe('0289')
  })

  it('gives every session at most four entries', () => {
    for (const key of Object.keys(SESSIONS)) expect(sessionEntries(key, {}).length).toBeLessThanOrEqual(4)
  })
})

describe('applying the programme to openGym state', () => {
  it('creates five routines, the A–D rotation, the equipment profile and the dumbbell list', () => {
    const s = fresh()
    applyProgram(s, { anklePhase: 1, phase: 'foundation' }, { names, uid, today: TODAY, now: NOW })
    expect(s.routines).toHaveLength(5)
    expect(Object.keys(s.mg.routineIds).sort()).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(s.rotation.sequence).toEqual(['A', 'B', 'C', 'D'].map(k => s.mg.routineIds[k]))
    expect(s.scheduleMode).toBe('rotation')
    expect(queueView(s, TODAY)).toBeTruthy()
    expect(s.activeEquipId).toBe('mg-home')
    expect(s.dumbbells.kg.weights).toEqual(DUMBBELLS_KG)
  })

  it('rebuilds in place: same routine ids, same rotation pass', () => {
    const s = fresh()
    applyProgram(s, { anklePhase: 1, phase: 'foundation' }, { names, uid, today: TODAY, now: NOW })
    const ids = { ...s.mg.routineIds }
    const since = s.queue.since
    applyProgram(s, { anklePhase: 2, phase: 'build' }, { names, uid, today: '2026-11-20', now: NOW + 86400000 * 27 })
    expect(s.mg.routineIds).toEqual(ids)
    expect(s.routines).toHaveLength(5)
    expect(s.queue.since).toBe(since)
    const b = s.routines.find(r => r.id === ids.B)
    expect(b.ex.map(e => e.id)).toContain('2290')
  })

  it('says when a rebuild is due', () => {
    const s = fresh()
    expect(needsRebuild(s, {})).toBe(true)
    applyProgram(s, { anklePhase: 1, phase: 'foundation', rungs: {} }, { names, uid, today: TODAY, now: NOW })
    expect(needsRebuild(s, { anklePhase: 1, phase: 'foundation', rungs: {} })).toBe(false)
    expect(needsRebuild(s, { anklePhase: 2, phase: 'foundation', rungs: {} })).toBe(true)
    expect(needsRebuild(s, { anklePhase: 1, phase: 'build', rungs: {} })).toBe(true)
    expect(needsRebuild(s, { anklePhase: 1, phase: 'deload', rungs: {} })).toBe(true)
    expect(needsRebuild(s, { anklePhase: 1, phase: 'foundation', rungs: { pushup: 1 } })).toBe(true)
  })
})

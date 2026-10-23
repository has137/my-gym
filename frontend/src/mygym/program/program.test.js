import { describe, it, expect } from 'vitest'
import { EXIDX, canonicalExId } from '../../lib/exercises.js'
import AR_NAMES from '../../exercise-names/ar.js'
import { SESSIONS, ROTATION, LADDERS, ANKLE_GATES, programIds } from './data.js'

// The guard for upstream catalogue updates (openGym v1.4.x and later). After "Sync fork" these
// fail with the id that broke, so the programme is fixed before it reaches the phone.
describe('every exercise the programme names is in the openGym catalogue', () => {
  const ids = programIds()

  it('names a real set of exercises', () => {
    expect(ids.length).toBeGreaterThan(100)
  })

  it.each(ids)('%s exists', id => {
    expect(EXIDX[id], `catalogue/exercises/${id}.json is missing`).toBeTruthy()
  })

  it.each(ids)('%s is its own exercise, not an alias of another', id => {
    expect(canonicalExId(id)).toBe(id)
  })

  it.each(ids)('%s has an Arabic name', id => {
    expect(AR_NAMES[id], `no Arabic name for ${id} in catalogue/i18n/ar.json`).toBeTruthy()
  })
})

describe('programme shape', () => {
  it('has at most four resistance exercises per session', () => {
    for (const s of Object.values(SESSIONS)) expect(s.work.length).toBeLessThanOrEqual(4)
  })

  it('rotates A, B, C, D and keeps E out of the rotation', () => {
    expect(ROTATION).toEqual(['A', 'B', 'C', 'D'])
    expect(SESSIONS.E.optional).toBe(true)
  })

  it('gives every work slot three alternatives: easier, harder and a joint-friendly one', () => {
    for (const s of Object.values(SESSIONS)) {
      for (const w of s.work) {
        expect(Object.keys(w.alt || {}).sort()).toEqual(['easier', 'harder', 'joint'])
      }
    }
  })

  it('has one one-arm or one-leg resistance exercise per session at most', () => {
    for (const s of Object.values(SESSIONS)) {
      const sided = s.work.filter(w => w.side)
      expect(sided.length).toBeLessThanOrEqual(1)
    }
  })

  it('pulls at least as many weekly sets as it pushes (main sessions)', () => {
    const sets = w => w.sets ?? (w.ladder ? LADDERS[w.ladder][4]?.sets ?? 3 : 3)
    let push = 0, pull = 0
    for (const key of ROTATION) {
      for (const w of SESSIONS[key].work) {
        if (w.pattern === 'hpush' || w.pattern === 'vpush') push += sets(w)
        if (w.pattern === 'hpull' || w.pattern === 'vpull') pull += sets(w)
      }
    }
    expect(pull).toBeGreaterThanOrEqual(push)
  })

  it('gates every jumping or one-leg exercise by ankle phase, with no jumping before phase 3', () => {
    expect(ANKLE_GATES.rope[1]).not.toBe('2612')
    expect(ANKLE_GATES.rope[2]).not.toBe('2612')
    expect(ANKLE_GATES.burpee[1]).toBe('5039')
    expect(ANKLE_GATES.burpee[2]).toBe('5039')
    expect(ANKLE_GATES.bulgarian[1]).toBe('2960')
    expect(ANKLE_GATES.lunge[1]).toBe('2960')
  })
})

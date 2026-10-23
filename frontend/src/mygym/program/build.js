// My gym: the programme as openGym routines (program.md §3). Pure: from the programme data and
// where you are (ankle phase, ladder rungs, programme phase) to the routine entries openGym
// trains, logs and progresses. `applyProgram` writes them into the store state in place, so
// routine ids, history and the rotation carry on when the phase or a rung changes.

import { SESSIONS, ROTATION, LADDERS, ANKLE_GATES, DUMBBELLS_KG, EQUIPMENT } from './data.js'
import { gated, clampPhase } from '../lib/ankle.js'
import { shapeForPhase } from '../lib/phases.js'
import { saveRotation } from '../../lib/rotation.js'
import { canonicalExId, EXIDX } from '../../lib/exercises.js'

const exists = id => !!EXIDX[canonicalExId(id)]

/** The first id of `ids` the catalogue knows, canonicalised; null when none does. */
export function firstKnown(...ids) {
  for (const id of ids) if (typeof id === 'string' && exists(id)) return canonicalExId(id)
  return null
}

/** One routine entry for a work slot. `ctx` = { anklePhase, rungs, phase }. */
export function slotEntry(slot, ctx = {}) {
  const ankle = clampPhase(ctx.anklePhase || 1)
  let base, note = null
  if (slot.ladder) {
    const ladder = LADDERS[slot.ladder]
    const i = Math.max(0, Math.min(ladder.length - 1, ctx.rungs?.[slot.ladder] ?? 0))
    const rung = ladder[i]
    const id = slot.neutral && rung.neutral ? rung.neutral : rung.id
    base = { ...rung, id }
    note = rung.note || null
    delete base.top; delete base.neutral; delete base.note; delete base.loaded
  } else if (slot.gate) {
    const g = gated(ANKLE_GATES[slot.gate], ankle)
    base = { id: g.id, sets: slot.sets, reps: slot.reps, repsMin: slot.repsMin, side: slot.side, prog: slot.prog }
    note = g.note
  } else {
    base = { id: slot.id, sets: slot.sets, reps: slot.reps, repsMin: slot.repsMin, side: slot.side, prog: slot.prog, mode: slot.mode, sec: slot.sec }
  }
  // An id an upstream catalogue update removed falls back to the slot's alternatives.
  const alts = Object.values(slot.alt || {})
  const id = firstKnown(base.id, ...alts)
  const entry = { id, sets: base.sets || 3, weight: 0, restSec: slot.restSec }
  if (base.mode === 'time') {
    Object.assign(entry, { mode: 'time', sec: base.sec || 30, prog: 'time', inc: 5 })
  } else {
    entry.reps = base.reps
    if (base.repsMin != null) entry.repsMin = base.repsMin
    entry.prog = base.prog || 'double'
  }
  if (base.side) entry.side = true
  if (slot.sg) entry.sg = slot.sg
  const subs = [...new Set(alts.map(a => firstKnown(a)).filter(a => a && a !== id))]
  if (subs.length) entry.subs = subs
  const shaped = shapeForPhase(entry, ctx.phase)
  const noteText = ctx.noteText || (k => k)
  const tags = [slot.slot, slot.rir ? 'RIR ' + slot.rir : null, note ? noteText(note) : null].filter(Boolean)
  shaped.note = tags.join(' · ')
  return shaped
}

/** All work entries of a session. */
export const sessionEntries = (key, ctx) => SESSIONS[key].work.map(slot => slotEntry(slot, ctx))

/**
 * Write the programme into `s` (an openGym state draft): five routines (A–E, ids kept in
 * s.mg.routineIds), the A–D rotation, the home equipment profile and the dumbbell list.
 * `names` maps a session key to its routine name; `now`/`today` for the rotation's stamps.
 */
export function applyProgram(s, ctx, { names, uid, today, now }) {
  s.mg = s.mg || {}
  const ids = { ...(s.mg.routineIds || {}) }
  for (const key of Object.keys(SESSIONS)) {
    const ex = sessionEntries(key, ctx)
    const existing = ids[key] && (s.routines || []).find(r => r.id === ids[key])
    if (existing) {
      existing.ex = ex
      existing.name = names[key]
    } else {
      const r = { id: uid(), name: names[key], emoji: SESSIONS[key].emoji, ex }
      s.routines = [...(s.routines || []), r]
      ids[key] = r.id
    }
  }
  s.mg.routineIds = ids
  s.mg.builtFor = { anklePhase: clampPhase(ctx.anklePhase || 1), rungs: { ...(ctx.rungs || {}) }, phase: ctx.phase || 'foundation' }
  // The rotation: A, B, C, D. Saved only when it is not already this sequence, so a rebuild
  // keeps the running pass and what it has already ticked.
  const seq = ROTATION.map(k => ids[k])
  const same = s.rotation && Array.isArray(s.rotation.sequence) && s.rotation.sequence.join() === seq.join() && s.queue
  if (!same) saveRotation(s, seq, 'My gym', today, now)
  s.scheduleMode = 'rotation'
  // Home equipment, so the library and swaps only offer what you own.
  const profiles = s.equipProfiles || []
  let home = profiles.find(p => p.id === 'mg-home')
  if (!home) {
    home = { id: 'mg-home', name: 'My gym', equipment: [...EQUIPMENT], accV: 1 }
    s.equipProfiles = [...profiles, home]
  }
  s.activeEquipId = 'mg-home'
  s.equipFilterOn = true
  // The dumbbells you own: progression, deloads and the +/− land only on these.
  s.dumbbells = { ...(s.dumbbells || {}), kg: { weights: [...DUMBBELLS_KG], _ts: now } }
  s.unit = 'kg'
  return s
}

/** Whether the routines need rebuilding for the current context. */
export function needsRebuild(s, ctx) {
  const b = s?.mg?.builtFor
  if (!b || !s.mg.routineIds) return true
  if (b.anklePhase !== clampPhase(ctx.anklePhase || 1)) return true
  if ((b.phase === 'foundation') !== (ctx.phase === 'foundation')) return true
  const rungs = ctx.rungs || {}
  return Object.keys(LADDERS).some(k => (b.rungs?.[k] ?? 0) !== (rungs[k] ?? 0))
}

// My gym's slice of the openGym state (S.mg) and the actions the screens call. Everything is
// written through openGym's own store update (store/useStore.js), so it persists, stamps and
// backs up like the rest of the profile. The decisions themselves are the pure helpers in lib/.

import { useStore } from '../store/useStore.js'
import { todayISO, uid } from '../lib/format.js'
import { beginWorkout } from '../sheets.jsx'
import { workoutVolume } from '../lib/history.js'
import { buildCompletedWorkout } from '../lib/finish-workout.js'
import { stampWorkout } from '../lib/sync-merge.js'
import { queueView } from '../lib/queue.js'
import { applyProgram, needsRebuild } from './program/build.js'
import { SESSIONS, LADDERS, DUMBBELLS_KG } from './program/data.js'
import { programWeek, phaseOf, inEarlyDeload } from './lib/phases.js'
import { clampPhase, phaseAfter } from './lib/ankle.js'
import { activeReturn, applyReturn, applyDeload } from './lib/layoff.js'
import { painEntry, addPain } from './lib/pain.js'
import { freeActivityWorkout, roundsEntry, ropeEntry } from './lib/free-activity.js'
import { readinessRecord } from './lib/readiness.js'
import { backupFileName } from './lib/checkups.js'
import { mt } from './i18n.js'
import { normalizeMeasurementEntry } from '../lib/measurements.js'

export const MG_VERSION = 1

export const defaultMg = () => ({
  v: MG_VERSION,
  startedAt: null,          // ISO date the programme started (week 1)
  firstUseAt: null,         // ms, for the first backup reminder
  readiness: null,          // { d, yes, advice }
  ankle: { phase: 1, tests: [] },
  pain: [],
  tests: [],
  lessons: { ratings: {} },
  rungs: { pullup: 1, pushup: 0, knee: 0, goblet: 0 },
  boxing: {},               // per session key: { rounds, workSec }
  rope: { level: 1, history: [] },
  backupAt: null,           // ms of the last backup taken
  returnPlan: null,         // { key, since } while a return from a break is in force
  deloadFrom: null,         // ISO date an early deload was taken (seven days)
})

const S = () => useStore.getState().S
const update = fn => useStore.getState().update(fn)

/** S.mg with every default filled in (older or partial copies included). */
export function mgOf(st) {
  const m = st?.mg || {}
  const d = defaultMg()
  return { ...d, ...m, ankle: { ...d.ankle, ...(m.ankle || {}) }, lessons: { ...d.lessons, ...(m.lessons || {}) }, rungs: { ...d.rungs, ...(m.rungs || {}) }, rope: { ...d.rope, ...(m.rope || {}) } }
}

export const useMg = () => mgOf(useStore(s => s.S))

/** Whether the first-use questions and the programme setup are done. */
export const isSetUp = st => !!(st?.mg?.startedAt && st?.mg?.routineIds)

/**
 * Where you are: programme week and phase, ankle phase and ladder rungs. An early deload makes
 * the phase 'deload' for its seven days; `basePhase` is the calendar's, which the routines are
 * built for, so a deload taken early does not rebuild them.
 */
export function contextOf(st, today = todayISO()) {
  const m = mgOf(st)
  const week = m.startedAt ? programWeek(m.startedAt, today) : 1
  const basePhase = phaseOf(Math.max(1, week))
  const early = inEarlyDeload(m.deloadFrom, today)
  return { week, phase: early ? 'deload' : basePhase, basePhase, earlyDeload: early, anklePhase: clampPhase(m.ankle.phase), rungs: m.rungs }
}

export const routineNames = () => Object.fromEntries(Object.keys(SESSIONS).map(k => [k, mt('routine.name', k, mt('session.' + k))]))

const noteText = k => mt('note.' + k)

// The routines are built for the calendar's phase, never an early deload's.
const buildCtx = (st, today) => { const c = contextOf(st, today); return { ...c, phase: c.basePhase, noteText } }

/** Rebuild the routines when the phase, the ankle or a rung changed since the last build. */
export function ensureProgram(today = todayISO()) {
  const st = S()
  if (!st.mg?.startedAt) return false
  const ctx = buildCtx(st, today)
  if (!needsRebuild(st, ctx)) return false
  update(s => { applyProgram(s, ctx, { names: routineNames(), uid, today, now: Date.now() }) })
  return true
}

/** First use: record the answers and the starting point, then build the programme. */
export function setUp({ answers, pullRung, pushRung, ankleStart = null }) {
  const today = todayISO()
  update(s => {
    const m = mgOf(s)
    m.readiness = readinessRecord(answers, today)
    m.startedAt = m.startedAt || today
    m.firstUseAt = m.firstUseAt || Date.now()
    m.rungs = { ...m.rungs, pullup: pullRung ?? m.rungs.pullup, pushup: pushRung ?? m.rungs.pushup }
    // Both answers start at phase 1 (program.md §5); the answer is kept for the ankle's history.
    if (ankleStart != null) m.ankle = { ...m.ankle, start: ankleStart }
    s.mg = m
    applyProgram(s, buildCtx(s, today), { names: routineNames(), uid, today, now: Date.now() })
  })
}

/** The health questions again, a year on: only the answers change. */
export function renewReadiness(answers) {
  update(s => { const m = mgOf(s); m.readiness = readinessRecord(answers, todayISO()); s.mg = m })
}

/** Deload now, for seven days, when the signs say so (program.md §8). */
export function startEarlyDeload(today = todayISO()) {
  update(s => { const m = mgOf(s); m.deloadFrom = today; s.mg = m })
}

/** The session key of a routine id, or null. */
export function keyOf(st, routineId) {
  const ids = st?.mg?.routineIds || {}
  return Object.keys(ids).find(k => ids[k] === routineId) || null
}

/** The rotation's next session key (A–D), and which keys are done in this pass. */
export function rotationState(st, today = todayISO()) {
  const view = queueView(st, today)
  if (!view) return { next: 'A', done: [], view: null }
  const next = view.items.find(i => i.state === 'next')
  return {
    next: next ? keyOf(st, next.id) : null,
    done: view.items.filter(i => i.state === 'done').map(i => keyOf(st, i.id)).filter(Boolean),
    view,
  }
}

/**
 * Start a session through openGym (sheets.jsx beginWorkout), then shape it for the week: a
 * deload halves the sets out of progression, a return from a break lightens it.
 */
export function startSession(key, today = todayISO()) {
  const st = S()
  if (st.active) return 'resumed'
  ensureProgram(today)
  const rid = S().mg?.routineIds?.[key]
  if (!rid) return null
  beginWorkout([rid], null)
  const ctx = contextOf(S(), today)
  const plan = activeReturn(S().workouts, today, S().mg?.returnPlan)
  update(s => {
    if (!s.active) return
    let entries = s.active.entries
    if (ctx.phase === 'deload') entries = applyDeload(entries)
    else if (plan.key !== 'none') entries = applyReturn(entries, plan, DUMBBELLS_KG)
    s.active.entries = entries
    s.active.mgKey = key
    const m = mgOf(s)
    if (plan.key !== 'none' && plan.key !== 'week') m.returnPlan = { key: plan.key, since: plan.since }
    if (plan.restartWeek && m.startedAt) m.startedAt = shiftISO(today, -7 * (plan.restartWeek - 1))
    s.mg = m
  })
  return 'started'
}

function shiftISO(iso, days) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Add logged rounds to the running session, or save them as their own workout. */
export function logRounds({ exId, rounds, rope = false, name }) {
  const at = Date.now()
  const entry = rope ? ropeEntry({ exId, workSec: rounds.reduce((a, r) => a + r.sec, 0), at }) : roundsEntry({ exId, rounds, at })
  if (!entry) return false
  update(s => {
    if (s.active && !s.active.editingWorkoutId && !s.active.backfill) {
      s.active.entries.push({ ...entry, plan: { policy: 'off', kind: 'off' } })
      return
    }
    const active = { id: uid(), d: todayISO(), start: at - rounds.reduce((a, r) => a + r.sec, 0) * 1000, name, routineIds: [], bw: null, entries: [entry] }
    const w = buildCompletedWorkout(active, { end: at })
    w.vol = workoutVolume(w)
    w.mgFree = rope ? 'rope' : 'rounds'
    stampWorkout(w)
    s.workouts.push(w)
  })
  return true
}

export function saveBoxingLevel(key, level) {
  update(s => { const m = mgOf(s); m.boxing = { ...m.boxing, [key]: { rounds: level.rounds, workSec: level.workSec } }; s.mg = m })
}

export function saveRopeLevel(level, minutes) {
  update(s => {
    const m = mgOf(s)
    m.rope = { level, history: [...(m.rope.history || []), { d: todayISO(), min: minutes }].slice(-60) }
    s.mg = m
  })
}

/** Free activity in two taps. */
export function logFree(kind, minutes) {
  const now = Date.now()
  update(s => {
    const w = freeActivityWorkout({ kind, minutes, now, id: uid(), d: todayISO(), name: mt('today.free') + ': ' + mt('free.' + kind) })
    w.vol = workoutVolume(w)
    stampWorkout(w)
    s.workouts.push(w)
  })
}

export function logPain(joint, v, ctx = null) {
  update(s => {
    const m = mgOf(s)
    m.pain = addPain(m.pain, painEntry({ joint, v, ctx, d: todayISO(), at: Date.now() }))
    s.mg = m
  })
}

/** Record an ankle test; returns the phase after it. A new sprain sends you back to phase 1. */
export function recordAnkleTest(results, { newSprain = false } = {}) {
  let next = 1
  update(s => {
    const m = mgOf(s)
    const from = clampPhase(m.ankle.phase)
    next = phaseAfter(from, results, { newSprain })
    m.ankle = { phase: next, tests: [...(m.ankle.tests || []), { d: todayISO(), from, to: next, results, newSprain }].slice(-50) }
    s.mg = m
  })
  ensureProgram()
  return next
}

export function rateLesson(id, rating) {
  update(s => { const m = mgOf(s); m.lessons = { ratings: { ...m.lessons.ratings, [id]: rating } }; s.mg = m })
}

export function setRung(ladder, index) {
  const max = LADDERS[ladder].length - 1
  update(s => { const m = mgOf(s); m.rungs = { ...m.rungs, [ladder]: Math.max(0, Math.min(max, index)) }; s.mg = m })
  ensureProgram()
}

export function saveTests(values) {
  const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v != null && !Number.isNaN(v)))
  if (!Object.keys(clean).length) return false
  update(s => {
    const m = mgOf(s)
    m.tests = [...(m.tests || []), { d: todayISO(), ...clean }]
    s.mg = m
    // The waist goes into openGym's own measurements too, so its chart shows it.
    if (clean.waist > 0) {
      const day = todayISO()
      const list = (s.measurements || []).filter(x => x.d !== day)
      const prev = (s.measurements || []).find(x => x.d === day) || {}
      const entry = normalizeMeasurementEntry({ ...prev, d: day, waist: Number(clean.waist), t: Date.now() }, s.customMeasurements || [])
      s.measurements = [...list, entry].sort((a, b) => (a.d < b.d ? -1 : 1))
    }
  })
  return true
}

/** The weekly backup: the same JSON file openGym's Settings export writes, then the date stamp. */
export async function backupNow() {
  const json = JSON.stringify(S(), null, 2)
  const name = backupFileName(todayISO())
  const file = typeof File === 'function' ? new File([json], name, { type: 'application/json' }) : null
  let saved = false
  try {
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: name })
      saved = true
    }
  } catch (e) {
    if (e?.name === 'AbortError') return false
  }
  if (!saved) {
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 60000)
  }
  markBackup()
  return true
}

export function markBackup() {
  update(s => { const m = mgOf(s); m.backupAt = Date.now(); s.mg = m }, false)
}

export function snoozeBackup() {
  update(s => { const m = mgOf(s); m.backupSnooze = Date.now(); s.mg = m }, false)
}

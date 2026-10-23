// My gym: free activity in two taps (jump rope, shadow boxing or a walk outside the programme).
// Pure: builds a finished workout in openGym's own shape (lib/finish-workout.js), with no routine
// ids, so it shows in History, the heatmap and Stats but never ticks the rotation or feeds
// progression.

import { buildCompletedWorkout } from '../../lib/finish-workout.js'
import { FREE_KINDS } from '../program/data.js'

export const FREE_MINUTES = [10, 20, 30, 45]

export function freeActivityWorkout({ kind, minutes, now, id, d, name }) {
  const k = FREE_KINDS[kind]
  if (!k) throw new Error('unknown activity ' + kind)
  const min = Math.max(1, Math.round(Number(minutes) || 0))
  const end = now
  const start = end - min * 60000
  const active = {
    id, d, start, name,
    routineIds: [],
    bw: null,
    entries: [{
      id: k.id,
      target: { id: k.id, mode: k.mode, sets: 1, min },
      sets: [{ min, done: true, at: end }],
      noProg: true,
    }],
  }
  const w = buildCompletedWorkout(active, { end })
  return { ...w, mgFree: kind }
}

/** Timed rounds (boxing on the bag, shadow boxing) as an entry to add to a running session. */
export function roundsEntry({ exId, rounds, at }) {
  const sets = (rounds || []).filter(r => r.sec > 0).map(r => ({ sec: r.sec, w: 0, done: true, at }))
  if (!sets.length) return null
  return {
    id: exId,
    target: { id: exId, mode: 'time', sets: sets.length, sec: Math.max(...sets.map(s => s.sec)) },
    sets,
    noProg: true,
    mgRounds: true,
  }
}

/** Jump rope intervals as a cardio entry: the minutes actually jumped. */
export function ropeEntry({ exId = '2612', workSec, at }) {
  const min = Math.round((Number(workSec) || 0) / 6) / 10
  if (!(min > 0)) return null
  return {
    id: exId,
    target: { id: exId, mode: 'cardio', sets: 1, min },
    sets: [{ min, done: true, at }],
    noProg: true,
    mgRounds: true,
  }
}

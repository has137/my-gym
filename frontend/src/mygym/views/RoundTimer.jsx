// The round timer (design: "مؤقت الجولات"): full screen, red for work and blue for rest, the
// round, what to do in it, the technique, and what comes next. Time is read from timestamps
// (lib/rounds.js timerAt), so it stays right with the screen off; the screen is kept awake while
// it runs, and a short tone marks each change. When it ends, the rounds go into the running
// session (or a workout of their own) and the next level is worked out.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { todayISO } from '../../lib/format.js'
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import { beep } from '../../lib/sound.js'
import { useWakeLock } from '../../lib/wakelock.js'
import Icon from '../../components/Icon.jsx'
import { SESSIONS, ANKLE_GATES } from '../program/data.js'
import { mt, pick } from '../i18n.js'
import { mgOf, contextOf, logRounds, saveBoxingLevel, saveRopeLevel, logPain } from '../state.js'
import { roundPlan, timerAt, workDone, boxingRounds, nextBoxing, ROPE_LEVELS, ropeLevel, nextRope } from '../lib/rounds.js'
import { gated, canJump, ropeLevelCap, FOOTWORK } from '../lib/ankle.js'
import { activeReturn } from '../lib/layoff.js'
import { weekLesson } from '../lib/lessons.js'
import { LESSONS } from '../content/lessons.js'
import PainScale from '../components/PainScale.jsx'

const clock = s => { const v = Math.max(0, Math.ceil(s)); return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0') }
const nameOf = id => (EXIDX[id] ? exerciseNameFor(EXIDX[id]) : id)

// The plan for a block of a session, with what each work segment asks for.
function buildPlan(key, block, S, today) {
  const sess = SESSIONS[key]
  const m = mgOf(S)
  const ctx = contextOf(S, today)
  const ret = activeReturn(S.workouts, today, m.returnPlan)
  if (block === 'boxing') {
    const box = boxingRounds(ctx.phase, m.boxing[key], sess.boxing.maxRounds || 5, ret.roundsDelta)
    const lw = weekLesson(LESSONS, { week: Math.max(1, ctx.week), anklePhase: ctx.anklePhase, ratings: m.lessons.ratings, deload: ctx.phase === 'deload' })
    const lesson = lw.lesson
    const bag = sess.boxing.kind !== 'shadow'
    const labels = Array.from({ length: box.rounds }, (_, i) => {
      if (sess.boxing.review) return { title: mt('session.review'), body: mt('foot.' + FOOTWORK[ctx.anklePhase]) }
      if (i === 0 && lesson) return { title: pick(lesson.title), body: bag ? mt('lesson.bag') : pick(lesson.steps)?.[0], lesson: lesson.id }
      if (i === box.rounds - 1 && bag) return { title: '1-2', body: mt('kind.bag') }
      return { title: i === 1 && lesson ? pick(lesson.title) : '', body: mt('foot.' + FOOTWORK[ctx.anklePhase]) }
    })
    return { kind: 'boxing', exId: sess.boxing.ids[0], title: mt('kind.' + sess.boxing.kind), level: box, plan: roundPlan({ ...box, labels }) }
  }
  if (block === 'rope') {
    const fin = sess.finish.find(f => f.kind === 'conditioning')
    const g = gated(ANKLE_GATES.rope, ctx.anklePhase)
    if (!canJump(ctx.anklePhase)) {
      return { kind: 'alt', exId: g.id, title: nameOf(g.id), plan: roundPlan({ rounds: 6, workSec: 30, restSec: 30, labels: [{ title: nameOf(g.id), body: mt('note.' + (g.note || 'no-jump')) }] }) }
    }
    const level = ropeLevel(m.rope.level, ropeLevelCap(ctx.anklePhase), fin?.maxLevel || 7)
    const ropeDown = Math.max(1, level + (ret.ropeDelta || 0))
    const L = ROPE_LEVELS[ropeDown]
    return { kind: 'rope', exId: '2612', title: nameOf('2612'), ropeLevel: ropeDown, capLevel: Math.min(ropeLevelCap(ctx.anklePhase), fin?.maxLevel || 7), plan: roundPlan({ rounds: L.rounds, workSec: L.workSec, restSec: L.restSec, labels: [{ title: nameOf('2612'), body: L.bursts ? mt('timer.bursts') : null }] }) }
  }
  // circuit: four moves of 30 s in each round, a minute's rest between rounds
  const c = sess.finish.find(f => f.kind === 'circuit')
  const moves = c.moves.map(mv => mv.gate ? gated(ANKLE_GATES[mv.gate], ctx.anklePhase).id : mv.id)
  const plan = []
  for (let r = 0; r < c.rounds; r++) {
    moves.forEach((id, j) => plan.push({ type: 'work', sec: 30, round: r + 1, of: c.rounds, label: { title: nameOf(id), body: id === '0699' && (m.rungs.pushup ?? 0) < 2 ? mt('note.wall-hand') : null } , move: j }))
    if (r < c.rounds - 1) plan.push({ type: 'rest', sec: c.restSec, round: r + 1, of: c.rounds })
  }
  return { kind: 'circuit', exId: '2272', title: mt('kind.circuit'), plan }
}

export default function RoundTimer() {
  const { key = 'A', block = 'boxing' } = useParams()
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const today = todayISO()
  const spec = useMemo(() => buildPlan(key, block, S, today), [key, block])   // fixed once opened
  const [run, setRun] = useState(null)   // { startedAt, pausedMs, pausedAt }
  const [now, setNow] = useState(Date.now())
  const [ended, setEnded] = useState(null)
  const [effort, setEffort] = useState(6)
  const [guard, setGuard] = useState(true)
  const [pain, setPain] = useState(null)
  const lastIdx = useRef(-1)
  const sound = S.sound !== false
  useWakeLock(!!run && !ended)

  useEffect(() => {
    if (!run || ended) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [run, ended])

  const st = run ? timerAt(spec.plan, { startedAt: run.startedAt, now, pausedMs: run.pausedMs, pausedAt: run.pausedAt }) : null
  useEffect(() => {
    if (!st) return
    if (st.index !== lastIdx.current) {
      if (lastIdx.current >= 0) beep(sound, st.seg?.type === 'rest' ? 660 : 990, 0.25)
      lastIdx.current = st.index
    }
    if (st.done && !ended) { beep(sound, 1320, 0.4); setEnded(st) }
  }, [st?.index, st?.done])

  // A rest still counting from the resistance work would beep over the rounds: the rounds are the rest of it.
  const start = () => { useUI.getState().stopRest(); lastIdx.current = -1; setRun({ startedAt: Date.now(), pausedMs: 0, pausedAt: null }); setNow(Date.now()) }
  const pause = () => setRun(r => (r.pausedAt ? { ...r, pausedMs: r.pausedMs + (Date.now() - r.pausedAt), pausedAt: null } : { ...r, pausedAt: Date.now() }))
  const stop = () => setEnded(timerAt(spec.plan, { startedAt: run.startedAt, now: Date.now(), pausedMs: run.pausedMs, pausedAt: run.pausedAt }))

  const save = () => {
    const rounds = workDone(spec.plan, ended)
    const name = spec.title
    const byRound = Object.values(rounds.reduce((acc, r) => { (acc[r.round] = acc[r.round] || { round: r.round, sec: 0 }).sec += r.sec; return acc }, {}))
    logRounds({ exId: spec.exId, rounds: byRound, rope: spec.kind === 'rope', name })
    const completed = ended.done
    let what = null   // what changes next time, said in the toast
    if (spec.kind === 'boxing') {
      const ctx = contextOf(useStore.getState().S, today)
      const next = nextBoxing(spec.level, { completed, effort, guardUp: guard }, ctx.phase, SESSIONS[key].boxing.maxRounds || 5)
      saveBoxingLevel(key, next)
      what = mt('box.' + (next.changed || 'same'))
    }
    if (spec.kind === 'rope') {
      const minutes = byRound.reduce((a, r) => a + r.sec, 0) / 60
      const week = (mgOf(useStore.getState().S).rope.history || []).filter(h => h.d >= shift(today, -7)).reduce((a, h) => a + h.min, 0)
      const lastWeek = (mgOf(useStore.getState().S).rope.history || []).filter(h => h.d >= shift(today, -14) && h.d < shift(today, -7)).reduce((a, h) => a + h.min, 0)
      const next = completed ? nextRope(spec.ropeLevel, { effort, pain: pain || 0, weekMinutes: week + minutes, lastWeekMinutes: lastWeek || null }, spec.capLevel) : spec.ropeLevel
      saveRopeLevel(next, Math.round(minutes * 10) / 10)
      what = mt('rope.next', next)
    }
    if (pain != null) logPain('ankle', pain, 'during')
    useUI.getState().toast(mt('timer.saved', byRound.length) + (what ? ' · ' + what : ''))
    nav(-1)
  }

  const seg = st?.seg
  const cls = 'mg-timer ' + (!run || ended ? 'idle' : seg?.type === 'rest' ? 'rest' : 'work')
  const nextWork = st ? spec.plan.slice(st.index + 1).find(s => s.type === 'work') : null
  const pct = seg ? 100 - (st.left / seg.sec) * 100 : 0

  return <div className={cls} role="timer" aria-live="off">
    <div className="top">
      <button className="mg-iconbtn" onClick={() => nav(-1)} aria-label={mt('close')}><Icon name="xmark" /></button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div className="rnd">{seg ? mt('timer.round', seg.round, seg.of) : spec.title}</div>
        <div className="kind">{seg ? (seg.type === 'rest' ? mt('timer.rest') : mt('timer.work')) : mt('session.day', key)}</div>
      </div>
      <span style={{ width: 48 }} />
    </div>

    {!run && <>
      <div className="clock">{clock(spec.plan.reduce((a, s) => a + s.sec, 0))}</div>
      <div className="what"><b>{spec.title}</b>{spec.plan.filter(s => s.type === 'work').length} × {clock(spec.plan.find(s => s.type === 'work').sec)}</div>
      {spec.kind === 'alt' && <div className="mg-note" style={{ marginTop: 16 }}><Icon name="info" /><span>{mt('timer.locked', spec.title)}</span></div>}
      {spec.kind === 'circuit' && <div className="after">{mt('timer.circuit')}</div>}
      <div className="ctl"><button className="pp" style={{ background: 'var(--acc)', color: '#fff' }} onClick={start} aria-label={mt('start.timer')}><Icon name="play" /></button></div>
    </>}

    {run && !ended && <>
      <div className="clock" aria-label={clock(st.left)}>{clock(st.left)}</div>
      <div className="bar" aria-hidden="true"><i style={{ width: pct + '%' }} /></div>
      {seg?.type === 'work' && seg.label && <div className="what" style={{ marginTop: 18 }}>
        {seg.label.title && <b>{seg.label.title}</b>}
        {seg.label.body}
        {seg.label.lesson && <div style={{ marginTop: 10 }}><button className="btn sm" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }} onClick={() => nav('/lesson/' + seg.label.lesson)}>{mt('timer.lesson')}</button></div>}
      </div>}
      {nextWork && <div className="after">{mt('timer.next', nextWork.label?.title || mt('timer.work'))}</div>}
      <div className="ctl">
        <button className="sm" onClick={stop} aria-label={mt('timer.stop')}><Icon name="skipForward" /></button>
        <button className="pp" onClick={pause} aria-label={run.pausedAt ? mt('timer.resume') : mt('timer.pause')}><Icon name={run.pausedAt ? 'play' : 'pause'} /></button>
        <span style={{ width: 56 }} />
      </div>
    </>}

    {ended && <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 className="mg-display" style={{ margin: 0, fontSize: 28 }}>{mt('timer.done')}</h2>
      <div className="card">
        <div style={{ marginBottom: 8, fontWeight: 600 }}>{mt('timer.effort')}</div>
        <div className="mg-scale">{[3, 4, 5, 6, 7, 8, 9, 10].map(v => <button key={v} type="button" aria-pressed={effort === v} className={v <= 7 ? 'z-ok' : 'z-ease'} onClick={() => setEffort(v)}>{v}</button>)}</div>
      </div>
      {spec.kind === 'boxing' && <div className="card">
        <div style={{ fontWeight: 600 }}>{mt('timer.guard')}</div>
        <div className="mg-yn"><button aria-pressed={guard} onClick={() => setGuard(true)}>{mt('yes')}</button><button aria-pressed={!guard} onClick={() => setGuard(false)}>{mt('no')}</button></div>
      </div>}
      {(spec.kind === 'rope' || spec.kind === 'circuit' || spec.kind === 'alt') && <div className="card">
        <div style={{ marginBottom: 8, fontWeight: 600 }}>{mt('timer.ankle')}</div>
        <PainScale value={pain} onChange={setPain} label={mt('timer.ankle')} />
      </div>}
      <button className="btn primary mg-big-btn" onClick={save}>{mt('timer.save')}</button>
    </div>}
  </div>
}

function shift(iso, days) {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10)
}

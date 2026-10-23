// A session's overview (design: "اليوم"): warm-up and joint care, boxing or power work, the
// resistance exercises with their sets, rests and openGym progression, what to do during the
// rests, the finisher and the stretches. Start hands the resistance part to openGym's workout
// screen; the boxing, rope and circuit rows open the round timer.
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { todayISO } from '../../lib/format.js'
import { navToWorkout } from '../../lib/nav.js'
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import Icon from '../../components/Icon.jsx'
import ExRow, { doseText } from '../components/ExRow.jsx'
import { SESSIONS, LADDERS, ANKLE_GATES, DUMBBELLS_KG } from '../program/data.js'
import { mt, pick } from '../i18n.js'
import { mgOf, contextOf, startSession, setRung, rotationState } from '../state.js'
import { drillsFor, gated, canJump, FOOTWORK } from '../lib/ankle.js'
import { boxingRounds } from '../lib/rounds.js'
import { activeReturn } from '../lib/layoff.js'
import { ladderAdvice, lightDumbbellStep } from '../lib/ladder.js'
import { weekLesson } from '../lib/lessons.js'
import { LESSONS } from '../content/lessons.js'

const clockMin = sec => (sec % 60 ? (sec / 60).toFixed(1) : String(sec / 60))

export default function Session() {
  const { key = 'A' } = useParams()
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const sess = SESSIONS[key] || SESSIONS.A
  const m = mgOf(S)
  const today = todayISO()
  const ctx = contextOf(S, today)
  const ret = activeReturn(S.workouts, today, m.returnPlan)
  const routine = (S.routines || []).find(r => r.id === m.routineIds?.[key])
  const entries = routine?.ex || []
  const rot = rotationState(S, today)
  const lessonWeek = weekLesson(LESSONS, { week: Math.max(1, ctx.week), anklePhase: ctx.anklePhase, ratings: m.lessons.ratings, deload: ctx.phase === 'deload' })
  const box = sess.boxing ? boxingRounds(ctx.phase, m.boxing[key], sess.boxing.maxRounds || 5, ret.roundsDelta) : null
  const drills = drillsFor(ctx.anklePhase, key)
  const active = S.active
  const doneIds = new Set((active?.entries || []).filter(e => (e.sets || []).some(x => x.done)).map(e => e.id))
  const total = entries.length
  const doneCount = entries.filter(e => doneIds.has(e.id)).length

  const start = () => {
    if (active) { navToWorkout(); return }
    startSession(key, today)
  }

  return <div className="narrow mg-session">
    <header className="mg-hdr" style={{ alignItems: 'center' }}>
      <button className="mg-iconbtn" onClick={() => nav('/home')} aria-label={mt('back')}><Icon name="chevronLeft" /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="d mg-display">{mt('session.day', key)}{sess.optional ? ' · ' + mt('session.optional') : ''}</div>
        <h1 className="mg-display" style={{ fontSize: 26 }}>{mt('session.' + key)}</h1>
      </div>
      <span className="mg-chip ghost mg-num">{mt('session.min', sess.minutes)}</span>
    </header>

    {active && <div aria-label={doneCount + '/' + total}>
      <div className="row between"><span style={{ fontWeight: 600 }}>{mt('nOf', doneCount, total)}</span></div>
      <div className="mg-seg" style={{ gridTemplateColumns: `repeat(${Math.max(1, total)},minmax(0,1fr))` }}>
        {entries.map((e, i) => <span key={i} className={doneIds.has(e.id) ? 'd' : i === active.cur ? 'c' : ''} />)}
      </div>
    </div>}

    {ctx.phase === 'deload' && <div className="mg-note"><Icon name="info" /><span>{mt('deload.banner')}</span></div>}
    {ret.key !== 'none' && <div className="mg-note pain"><Icon name="warning" /><span>{mt('return.' + ret.key)}</span></div>}
    {!sess.optional && rot.next && rot.next !== key && <div className="mg-note"><Icon name="info" /><span>{mt('today.next')}: {mt('session.day', rot.next)}</span></div>}

    <h3 className="mg-sec">{mt('block.warmup')}</h3>
    {sess.warmup.map((w, i) => w.kind === 'ankle'
      ? <div key={i}>
        <div className="mg-muted mg-small" style={{ margin: '8px 2px 6px' }}>{mt('block.ankle', ctx.anklePhase)}</div>
        {drills.map((d, j) => <ExRow key={'a' + j} id={d.id} sub={d.note ? mt('note.' + d.note) : null} amount={doseText({ sets: d.sets, reps: d.reps, sec: d.sec, side: d.side })} tag={mt('joint.ankle')} tagClass="pain" />)}
      </div>
      : w.id ? <ExRow key={i} id={w.id} amount={doseText(w.dose)} tag={w.joint ? mt('joint.' + w.joint) : w.core ? mt('block.work') : null} tagClass={w.joint ? 'pain' : 'guide'} />
        : <ExRow key={i} title={mt('kind.' + w.kind)} sub={mt('foot.' + FOOTWORK[ctx.anklePhase])} amount={w.dose?.min ? mt('dose.min', w.dose.min) : null} />)}

    {sess.boxing && box && <>
      <h3 className="mg-sec">{mt('block.boxing')}</h3>
      {sess.boxing.wraps && <div className="mg-note"><Icon name="info" /><span>{mt('wraps')}. {mt('brace')}.</span></div>}
      <ExRow title={mt('kind.' + sess.boxing.kind)} sub={mt('foot.' + FOOTWORK[ctx.anklePhase])}
        amount={box.rounds + ' × ' + mt('dose.min', clockMin(box.workSec))} tag={mt('start.timer')} tagClass="act"
        onClick={() => nav('/timer/' + key + '/boxing')} />
      {sess.boxing.lessons && (lessonWeek.lesson
        ? <ExRow title={mt('session.lesson', pick(lessonWeek.lesson.title))} sub={mt('lesson.week', lessonWeek.lesson.week)} tag={mt('open')} tagClass="guide" onClick={() => nav('/lesson/' + lessonWeek.lesson.id)} />
        : <ExRow title={mt('session.review')} tag={mt('open')} tagClass="guide" onClick={() => nav('/library?tab=lessons')} />)}
      {sess.boxing.review && <ExRow title={mt('session.review')} tag={mt('open')} tagClass="guide" onClick={() => nav('/library?tab=lessons')} />}
    </>}

    <h3 className="mg-sec">{mt('block.work')}</h3>
    {entries.map((e, i) => <WorkRow key={i} e={e} i={i} sess={sess} S={S} m={m} ctx={ctx} done={doneIds.has(e.id)} />)}

    {sess.inRest.length > 0 && <>
      <h3 className="mg-sec">{mt('block.inRest')}</h3>
      {sess.inRest.map((x, i) => <ExRow key={i} id={x.id} sub={mt('during', x.during)} amount={doseText(x.dose)} tag={x.joint ? mt('joint.' + x.joint) : null} tagClass="pain" />)}
    </>}

    {sess.finish.filter(f => f.kind !== 'protect').length > 0 && <>
      <h3 className="mg-sec">{mt('block.finish')}</h3>
      {sess.finish.map((f, i) => {
        if (f.kind === 'conditioning') {
          const g = gated(ANKLE_GATES[f.gate], ctx.anklePhase)
          const ex = EXIDX[g.id]
          return <ExRow key={i} title={mt('kind.conditioning') + (ex ? ': ' + exerciseNameFor(ex) : '')} sub={canJump(ctx.anklePhase) ? null : mt('timer.locked', ex ? exerciseNameFor(ex) : '')} tag={mt('start.timer')} tagClass="act" onClick={() => nav('/timer/' + key + '/rope')} />
        }
        if (f.kind === 'circuit') {
          const names = f.moves.map(mv => mv.gate ? gated(ANKLE_GATES[mv.gate], ctx.anklePhase).id : mv.id).map(id => EXIDX[id] ? exerciseNameFor(EXIDX[id]) : id)
          return <ExRow key={i} title={mt('kind.circuit')} sub={names.join(mt('sep'))} amount={f.rounds + ' × ' + mt('dose.min', f.workSec / 60)} tag={mt('start.timer')} tagClass="act" onClick={() => nav('/timer/' + key + '/circuit')} />
        }
        if (f.kind === 'protect') return null
        return f.id ? <ExRow key={i} id={f.id} amount={doseText(f.dose)} tag={f.joint ? mt('joint.' + f.joint) : null} tagClass="pain" /> : null
      })}
    </>}

    <h3 className="mg-sec">{mt('block.stretch')}</h3>
    {sess.stretch.map((x, i) => x.kind === 'mobility'
      ? <ExRow key={i} title={mt('kind.mobility')} amount={mt('dose.min', x.min)} onClick={() => nav('/joints#mobility')} />
      : <ExRow key={i} id={x.id} amount={doseText(x.dose)} />)}

    <div className="mg-bottom">
      <button className="btn primary mg-big-btn" onClick={start}><Icon name="play" />{active ? mt('today.resume') : mt('start.session')}</button>
    </div>
  </div>
}

function WorkRow({ e, i, sess, S, m, ctx, done }) {
  const slot = sess.work[i] || {}
  const ex = EXIDX[e.id]
  const reps = e.mode === 'time' ? mt('dose.sec', e.sec) : (e.side ? (e.repsMin ? e.repsMin / 2 + '–' : '') + e.reps / 2 + ' ' + mt('dose.side') : (e.repsMin ? e.repsMin + '–' : '') + e.reps)
  const sub = [e.note, e.restSec ? mt('rest.sec', e.restSec) : null].filter(Boolean).join(' · ')
  const ladderKey = slot.ladder || (e.mgProtect ? 'knee' : null)
  const advice = ladderKey ? ladderAdvice(S.workouts, LADDERS[ladderKey], m.rungs[ladderKey] ?? 0, { owned: DUMBBELLS_KG, neutral: !!slot.neutral }) : null
  const light = !ladderKey && e.prog === 'double' && ex?.eq === 'dumbbell' ? lightDumbbellStep(S.workouts, e.id, { owned: DUMBBELLS_KG, topReps: e.reps }) : null
  const nextRung = advice?.due ? LADDERS[ladderKey][advice.to] : null
  const gate = slot.gate ? gated(ANKLE_GATES[slot.gate], ctx.anklePhase) : null
  return <>
    <ExRow id={e.id} num={e.mgProtect ? 'P' : i + 1} state={done ? 'done' : ''} sub={sub}
      amount={e.sets + ' × ' + reps} tag={e.mgProtect ? mt('kind.protect') : null} tagClass="pain" />
    {gate && ctx.anklePhase < 3 && <div className="mg-muted mg-small" style={{ margin: '-4px 4px 8px' }}>{mt('gate.phase', ctx.anklePhase, gate.note ? mt('note.' + gate.note) : exerciseNameFor(EXIDX[gate.id]))}</div>}
    {nextRung && <div className="mg-note">
      <Icon name="arrowUp" />
      <span style={{ flex: 1 }}>{mt('ladder.due', exerciseNameFor(EXIDX[nextRung.neutral && slot.neutral ? nextRung.neutral : nextRung.id]))}</span>
      <button className="btn sm primary" onClick={() => setRung(ladderKey, advice.to)}>{mt('ladder.move')}</button>
    </div>}
    {light && <div className="mg-note"><Icon name="info" /><span><b>{mt('light.title')}</b><br />{mt('light.body')}</span></div>}
  </>
}

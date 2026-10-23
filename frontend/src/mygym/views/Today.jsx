// Today: the suggested session, the week, the programme days, free activity, and the reminders
// that matter on a phone-only setup (backup, periodic tests). Built to the Claude Design
// handoff ("Ring Night"), on openGym's data: the rotation picks the session, the workouts fill
// the week.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { todayISO } from '../../lib/format.js'
import { dateLocale, t } from '../../lib/i18n.js'
import { navToWorkout } from '../../lib/nav.js'
import Icon from '../../components/Icon.jsx'
import { SESSIONS, ROTATION } from '../program/data.js'
import { mt } from '../i18n.js'
import { mgOf, contextOf, rotationState, logFree, backupNow, snoozeBackup, ensureProgram, startEarlyDeload } from '../state.js'
import { backupDue, testsDue } from '../lib/checkups.js'
import { activeReturn } from '../lib/layoff.js'
import { canJump } from '../lib/ankle.js'
import { earlyDeload } from '../lib/phases.js'
import { painRepeats, trainingDays } from '../lib/pain.js'
import { readinessDue } from '../lib/readiness.js'
import { FREE_MINUTES } from '../lib/free-activity.js'

const WEEK_AR = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']
const WEEK_EN = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
const iso = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x.toISOString().slice(0, 10) }

function weekDays(today) {
  const d = new Date(today + 'T12:00:00')
  const back = (d.getDay() - 6 + 7) % 7
  d.setDate(d.getDate() - back)
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x })
}

export default function Today() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const m = mgOf(S)
  const today = todayISO()
  useEffect(() => { ensureProgram(today) }, [today])
  const ctx = contextOf(S, today)
  const rot = rotationState(S, today)
  const next = rot.next || 'A'
  const ids = m.routineIds || {}
  const rotationIds = new Set(ROTATION.map(k => ids[k]))
  const ar = (document.documentElement.lang || '').startsWith('ar')
  const days = weekDays(today)
  const trainedOn = new Set(S.workouts.filter(w => (w.routineIds || []).some(id => rotationIds.has(id))).map(w => w.d))
  const anyOn = new Set(S.workouts.map(w => w.d))
  const weekDone = days.filter(d => trainedOn.has(iso(d))).length
  const last = [...S.workouts].sort((a, b) => (a.d < b.d ? -1 : 1)).at(-1)
  const empty = S.workouts.length === 0
  const ret = activeReturn(S.workouts, today, m.returnPlan)
  const tests = m.startedAt ? testsDue(m.startedAt, today, m.tests) : { due: false }
  const backup = backupDue(m.backupAt, Date.now(), m.firstUseAt) && !(m.backupSnooze && Date.now() - m.backupSnooze < 86400000)
  const s = SESSIONS[next]
  const lastWorkout = key => [...S.workouts].reverse().find(w => (w.routineIds || []).includes(ids[key]))
  const doneInPass = new Set(rot.done)
  // Pain of 4 or more on each of the last two training days: deload early (program.md §8).
  const painSign = ctx.phase !== 'deload' && earlyDeload({ painRepeats: painRepeats(m.pain, trainingDays(S.workouts, 2)) }).due
  const askAgain = !!m.readiness && readinessDue(m.readiness, today)

  return <div className="narrow mg-today">
    <header className="mg-hdr">
      <div>
        <div className="d">{new Date().toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 className="mg-display">{empty ? mt('today.hello') : mt('today.go')}</h1>
      </div>
      <button className="mg-iconbtn" onClick={() => nav('/settings')} aria-label={t('Settings')}><Icon name="gear" /></button>
    </header>

    {ctx.phase === 'deload' && <div className="mg-note"><Icon name="info" /><span>{mt(ctx.earlyDeload ? 'deload.early' : 'deload.banner')}</span></div>}
    {painSign && <section className="card" aria-label={mt('deload.signTitle')}>
      <div className="row" style={{ gap: 10, marginBottom: 8 }}><Icon name="warning" /><b>{mt('deload.signTitle')}</b></div>
      <div className="mg-muted mg-small" style={{ marginBottom: 10 }}>{mt('deload.signPain')}</div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn primary" onClick={() => startEarlyDeload(today)}>{mt('deload.start')}</button>
        <button className="btn" style={{ width: 'auto' }} onClick={() => nav('/joints')}>{mt('tab.joints')}</button>
      </div>
    </section>}
    {askAgain && <button type="button" className="card mg-row" style={{ minHeight: 64 }} onClick={() => nav('/readiness')}>
      <span className="num"><Icon name="heart" /></span>
      <span className="txt"><span className="ttl">{mt('ready.again')}</span><span className="sub">{mt('ready.againHint')}</span></span>
      <Icon name="chevronRight" />
    </button>}
    {ret.key !== 'none' && <div className="mg-note pain"><Icon name="warning" /><span>{mt('return.' + ret.key)}</span></div>}

    {backup && <section className="card" aria-label={mt('backup.title')}>
      <div className="row" style={{ gap: 10, marginBottom: 8 }}><Icon name="download" /><b>{mt('backup.title')}</b></div>
      <div className="mg-muted mg-small" style={{ marginBottom: 10 }}>{mt('backup.body', m.backupAt ? mt('backup.days', Math.floor((Date.now() - m.backupAt) / 86400000)) : mt('backup.never'))}</div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn primary" onClick={async () => { if (await backupNow()) useUI.getState().toast(mt('backup.done')) }}>{mt('backup.now')}</button>
        <button className="btn" style={{ width: 'auto' }} onClick={snoozeBackup}>{mt('backup.later')}</button>
      </div>
      <div className="mg-muted mg-small" style={{ marginTop: 8 }}>{mt('backup.restore')}</div>
    </section>}

    {tests.due && <button type="button" className="card mg-row" style={{ minHeight: 64 }} onClick={() => nav('/progress?tests=1')}>
      <span className="num"><Icon name="clipboard" /></span>
      <span className="txt"><span className="ttl">{mt('tests.due')}</span><span className="sub">{mt('tests.dueHint', tests.week)}</span></span>
      <Icon name="chevronRight" />
    </button>}

    <section className="card" aria-label={mt('today.week')}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 600 }}>{mt('today.week')}</span>
        <span className="row" style={{ gap: 4 }}><b className="mg-display" style={{ fontSize: 26, color: weekDone ? 'var(--mg-up)' : 'var(--label-2)' }}>{weekDone}</b><span className="mg-muted mg-small">{mt('today.ofSessions')}</span></span>
      </div>
      <div className="mg-week">
        {days.map((d, i) => {
          const di = iso(d)
          const done = anyOn.has(di)
          return <div className="day" key={di}>
            <span>{(ar ? WEEK_AR : WEEK_EN)[i]}</span>
            <span className={'dot' + (done ? ' done' : '') + (di === today && !done ? ' today' : '')} aria-label={di + (done ? ' ✓' : '')}>{done ? <Icon name="check" /> : d.getDate()}</span>
          </div>
        })}
      </div>
      <div className="mg-muted mg-small" style={{ marginTop: 10 }}>{mt('today.programWeek', Math.max(1, ctx.week), mt('phase.' + ctx.phase))}</div>
    </section>

    <section className="mg-hero" aria-label={mt('today.suggested')}>
      <div className="lines"><div className="mg-rules" aria-hidden="true"><i /><i /><i /></div></div>
      <div className="in">
        <div className="row between"><span className="mg-chip act">{mt('today.suggested')}</span></div>
        <div>
          <div className="kick">{mt('session.day', next)} · {mt('nOf', ROTATION.indexOf(next) + 1, ROTATION.length)}</div>
          <h2>{mt('session.' + next)}</h2>
        </div>
        <div className="chips">
          <span className="mg-chip">{mt('session.min', s.minutes)}</span>
          <span className="mg-chip">{mt('session.exercises', s.work.length)}</span>
          {s.boxing && <span className="mg-chip">{mt('kind.' + s.boxing.kind)}</span>}
          <span className="mg-chip">{mt('block.ankle', ctx.anklePhase)}</span>
        </div>
        {S.active
          ? <button className="btn primary" onClick={navToWorkout}><Icon name="play" />{mt('today.resume')}</button>
          : <button className="btn primary" onClick={() => nav('/session/' + next)}><Icon name="play" />{mt('today.start')}</button>}
      </div>
    </section>

    {empty ? <section className="mg-empty" aria-label={mt('today.empty')}>
      <span className="ic"><Icon name="chartLine" /></span>
      <b className="mg-display" style={{ fontSize: 20 }}>{mt('today.empty')}</b>
      <span className="mg-muted mg-small" style={{ maxWidth: 280, lineHeight: 1.6 }}>{mt('today.emptyHint')}</span>
    </section> : last && <button type="button" className="mg-row" onClick={() => nav('/history')}>
      <span className="num"><Icon name="calendar" /></span>
      <span className="txt"><span className="sub">{mt('today.last', new Date(last.d + 'T12:00:00').toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'short' }))}</span><span className="ttl">{last.name}</span></span>
      {last.end && last.start ? <span className="amt"><b>{Math.round((last.end - last.start) / 60000)} {mt('dose.min', '').trim()}</b></span> : null}
    </button>}

    <h3 className="mg-sec">{mt('today.days')}</h3>
    {[...ROTATION, 'E'].map(key => {
      const w = lastWorkout(key)
      const sug = key === next
      const done = doneInPass.has(key)
      return <button type="button" key={key} className={'mg-day' + (sug ? ' sug' : done ? ' done' : '')} onClick={() => nav('/session/' + key)}>
        <span className="n">{key}</span>
        <span className="t"><b>{mt('session.' + key)}</b><span>{mt('session.min', SESSIONS[key].minutes)}{SESSIONS[key].optional ? ' · ' + mt('session.optional') : ''}</span></span>
        <span className={'mg-chip ' + (sug ? 'act' : done ? 'up' : '')}>{sug ? mt('today.next') : done ? mt('today.done') : w ? new Date(w.d + 'T12:00:00').toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' }) : mt('today.notYet')}</span>
      </button>
    })}

    <FreeActivity anklePhase={ctx.anklePhase} />
  </div>
}

function FreeActivity({ anklePhase }) {
  const [kind, setKind] = useState(null)
  const kinds = ['rope', 'shadow', 'walk']
  const save = min => {
    logFree(kind, min)
    useUI.getState().toast(mt('free.saved', mt('free.' + kind), min))
    setKind(null)
  }
  return <section className="card" aria-label={mt('today.free')} style={{ marginTop: 6 }}>
    <h2 style={{ fontSize: 15, color: 'var(--label)', fontWeight: 600, marginBottom: 4 }}>{mt('today.free')}</h2>
    <div className="mg-muted mg-small" style={{ marginBottom: 10 }}>{mt('today.freeHint')}</div>
    <div className="mg-free" role="group" aria-label={mt('free.title')}>
      {kinds.map(k => {
        const locked = k === 'rope' && !canJump(anklePhase)
        return <button key={k} type="button" aria-pressed={kind === k} disabled={locked} title={locked ? mt('free.ropeLocked') : undefined} onClick={() => setKind(kind === k ? null : k)}>
          <Icon name={k === 'rope' ? 'repeat' : k === 'shadow' ? 'boxing' : 'figureRun'} />
          <span>{mt('free.' + k)}</span>
        </button>
      })}
    </div>
    {!canJump(anklePhase) && <div className="mg-muted mg-small" style={{ marginTop: 6 }}>{mt('free.ropeLocked')}</div>}
    {kind && <div className="mg-free" style={{ marginTop: 8, gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
      {FREE_MINUTES.map(min => <button key={min} type="button" onClick={() => save(min)}><b className="mg-display" style={{ fontSize: 18 }}>{min}</b><span className="mg-small">{mt('dose.min', '').trim()}</span></button>)}
    </div>}
  </section>
}

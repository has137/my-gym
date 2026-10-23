// Progress (design: "التقدّم"): where you are in the programme, the ladders, weekly average weight
// against the fat-loss goal, the waist, the periodic tests, and openGym's weekly muscle volume.
// The detailed charts, records and history stay openGym's own screens, one tap away.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { todayISO, fmtNum } from '../../lib/format.js'
import { dateLocale } from '../../lib/i18n.js'
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import { latestMeasurement } from '../../lib/measurements.js'
import { bwSheet } from '../../sheets.jsx'
import { WeeklyPlanVolume } from '../../views/Stats.jsx'
import Icon from '../../components/Icon.jsx'
import { LADDERS, DUMBBELLS_KG } from '../program/data.js'
import { mt } from '../i18n.js'
import { mgOf, contextOf, saveTests, setRung, startEarlyDeload } from '../state.js'
import { weeklyAverages, weeklyRate, testsFor, testsDue } from '../lib/checkups.js'
import { ladderAdvice } from '../lib/ladder.js'

const fmtDay = d => new Date(d + 'T12:00:00').toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })
const shiftDay = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10) }

export default function Progress() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const S = useStore(s => s.S)
  const m = mgOf(S)
  const today = todayISO()
  const ctx = contextOf(S, today)
  const [showTests, setShowTests] = useState(params.get('tests') === '1')
  const avgs = weeklyAverages(S.bodyweight)
  const rate = weeklyRate(avgs)
  const waist = latestMeasurement(S, 'waist')
  const due = m.startedAt ? testsDue(m.startedAt, today, m.tests) : { due: false }

  return <div className="narrow">
    <div className="hdr"><div><h1>{mt('prog.title')}</h1><div className="sub">{mt('today.programWeek', Math.max(1, ctx.week), mt('phase.' + ctx.phase))}</div></div></div>

    <section className="card">
      <div className="row between">
        <div><div className="mg-muted mg-small">{mt('prog.week')}</div><b className="mg-display" style={{ fontSize: 30 }}>{Math.max(1, ctx.week)}</b></div>
        <div><div className="mg-muted mg-small">{mt('prog.ankle')}</div><b className="mg-display" style={{ fontSize: 30 }}>{ctx.anklePhase}<span className="mg-muted" style={{ fontSize: 16 }}> {mt('nOf', '', 4).trim()}</span></b></div>
        <button className="btn sm" onClick={() => nav('/joints')}>{mt('open')}</button>
      </div>
    </section>

    <section className="card">
      <h2>{mt('prog.ladders')}</h2>
      {Object.keys(LADDERS).map(k => {
        const i = m.rungs[k] ?? 0
        const rung = LADDERS[k][i]
        const adv = ladderAdvice(S.workouts, LADDERS[k], i, { owned: DUMBBELLS_KG })
        return <div key={k} className="mg-field">
          <label><b>{mt('ladder.' + k)}</b><br /><span className="mg-muted mg-small">{mt('ladder.rung', i + 1, LADDERS[k].length)} · {EXIDX[rung.id] ? exerciseNameFor(EXIDX[rung.id]) : rung.id}</span></label>
          {adv.due ? <button className="btn sm primary" onClick={() => setRung(k, adv.to)}><Icon name="arrowUp" />{mt('ladder.move')}</button>
            : <span className="mg-chip steady">= {mt('prog.same')}</span>}
        </div>
      })}
    </section>

    <section className="card">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{mt('prog.weight')}</h2>
        <button className="btn sm" onClick={() => bwSheet()}><Icon name="plus" />{mt('prog.logWeight')}</button>
      </div>
      {avgs.length ? <>
        <div className="row" style={{ gap: 10, alignItems: 'baseline' }}>
          <b className="mg-display mg-num" style={{ fontSize: 34 }}>{fmtNum(avgs.at(-1).avg)}</b><span className="mg-muted">{mt('unit.kg')}</span>
          {rate != null && <span className={'mg-chip ' + (rate <= -0.5 && rate >= -0.7 ? 'up' : 'steady')}>{rate < 0 ? '↓' : rate > 0 ? '↑' : '='} {mt('prog.rate', fmtNum(Math.abs(rate)))}</span>}
        </div>
        <div className="mg-muted mg-small" style={{ margin: '6px 0 10px' }}>{mt('prog.rateHint')}</div>
        <table className="mg-table"><tbody>
          {avgs.slice(-6).reverse().map(a => <tr key={a.week}><td>{fmtDay(a.week)}</td><td className="mg-num"><b>{fmtNum(a.avg)}</b> {mt('unit.kg')}</td><td className="mg-muted">{a.n}×</td></tr>)}
        </tbody></table>
      </> : <div className="mg-muted mg-small">{mt('prog.noTests')}</div>}
    </section>

    <section className="card">
      <div className="row between">
        <div><h2 style={{ margin: 0 }}>{mt('prog.waist')}</h2>
          {waist ? <div style={{ marginTop: 6 }}><b className="mg-display mg-num" style={{ fontSize: 28 }}>{fmtNum(waist.value)}</b> <span className="mg-muted">{mt('unit.cm')} · {fmtDay(waist.entry.d)}</span></div> : <div className="mg-muted mg-small" style={{ marginTop: 6 }}>—</div>}
        </div>
        <button className="btn sm" onClick={() => nav('/measurements')}><Icon name="ruler" />{mt('prog.logWaist')}</button>
      </div>
    </section>

    <section className="card" id="tests">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{mt('prog.tests')}</h2>
        <button className={'btn sm' + (due.due ? ' primary' : '')} onClick={() => setShowTests(v => !v)}><Icon name="clipboard" />{mt('tests.open')}</button>
      </div>
      {showTests && <TestForm anklePhase={ctx.anklePhase} onDone={() => setShowTests(false)} />}
      <TestHistory tests={m.tests} />
    </section>

    <section className="card" aria-label={mt('deload.title')}>
      <h2>{mt('deload.title')}</h2>
      {ctx.phase === 'deload'
        ? <div className="mg-muted mg-small">{ctx.earlyDeload ? mt('deload.until', fmtDay(shiftDay(m.deloadFrom, 6))) : mt('deload.banner')}</div>
        : <>
          <div className="mg-muted mg-small" style={{ marginBottom: 6 }}>{mt('deload.signs')}</div>
          <ul className="mg-small" style={{ margin: '0 0 10px', paddingInlineStart: 18, lineHeight: 1.7 }}>
            {['s1', 's2', 's3', 's4'].map(k => <li key={k}>{mt('deload.' + k)}</li>)}
          </ul>
          <button className="btn sm" onClick={() => startEarlyDeload(today)}>{mt('deload.start')}</button>
        </>}
    </section>

    <WeeklyPlanVolume S={S} />

    <div className="row" style={{ gap: 8 }}>
      <button className="btn" onClick={() => nav('/stats')}><Icon name="chart" />{mt('prog.details')}</button>
      <button className="btn" onClick={() => nav('/history')}><Icon name="history" />{mt('prog.history')}</button>
    </div>
  </div>
}

function TestForm({ anklePhase, onDone }) {
  const [v, setV] = useState({})
  const list = testsFor(anklePhase)
  const set = (k, val) => setV(x => ({ ...x, [k]: val }))
  return <div style={{ margin: '4px 0 14px' }}>
    <div className="mg-muted mg-small" style={{ marginBottom: 6 }}>{mt('tests.hint')}</div>
    {list.map(t => <div className="mg-field" key={t.key}>
      <label htmlFor={'t-' + t.key}>{mt('test.' + t.key)} <span className="mg-muted mg-small">({mt('unit.' + t.unit)})</span></label>
      {t.unit === 'pass'
        ? <input id={'t-' + t.key} type="checkbox" checked={v[t.key] === 1} onChange={e => set(t.key, e.target.checked ? 1 : 0)} />
        : <input id={'t-' + t.key} type="number" inputMode="decimal" min="0" value={v[t.key] ?? ''} onChange={e => set(t.key, e.target.value === '' ? '' : Number(e.target.value))} />}
    </div>)}
    <button className="btn primary" style={{ marginTop: 10 }} onClick={() => { if (saveTests(v)) { useUI.getState().toast(mt('tests.saved')); onDone() } }}>{mt('tests.save')}</button>
  </div>
}

function TestHistory({ tests }) {
  const last = (tests || []).slice(-4)
  if (!last.length) return <div className="mg-muted mg-small">{mt('prog.noTests')}</div>
  const keys = [...new Set(last.flatMap(t => Object.keys(t).filter(k => k !== 'd')))]
  return <div style={{ overflowX: 'auto' }}>
    <table className="mg-table">
      <thead><tr><th>{mt('prog.tests')}</th>{last.map(t => <th key={t.d} className="mg-num">{fmtDay(t.d)}</th>)}</tr></thead>
      <tbody>{keys.map(k => <tr key={k}><td>{mt('test.' + k)}</td>{last.map((t, i) => {
        const prev = i > 0 ? last[i - 1][k] : null
        const cur = t[k]
        const better = prev != null && cur != null && (k === 'toeTouch' || k === 'backScratch' || k === 'waist' ? cur < prev : cur > prev)
        const worse = prev != null && cur != null && cur !== prev && !better
        return <td key={t.d} className="mg-num">{cur ?? '–'}{better ? ' ↑' : worse ? ' ↓' : ''}</td>
      })}</tr>)}</tbody>
    </table>
  </div>
}

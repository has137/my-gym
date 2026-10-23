// Joint health (design: "الإصابة", widened to every joint): log pain per joint with the pain
// rule, the ankle's phase with its drills, what the phase allows and its exit test, the
// protection plan for each joint, the warning signs, and the rest-day mobility flow.
import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { todayISO } from '../../lib/format.js'
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import Icon from '../../components/Icon.jsx'
import ExRow, { doseText } from '../components/ExRow.jsx'
import PainScale from '../components/PainScale.jsx'
import { ANKLE_GATES, MOBILITY_FLOW } from '../program/data.js'
import { mt } from '../i18n.js'
import { mgOf, logPain, recordAnkleTest } from '../state.js'
import { JOINTS, jointSummary, morningAdvice, usualPain, RED_FLAGS } from '../lib/pain.js'
import { PHASE_DRILLS, CRITERIA, evaluatePhase, gated, clampPhase } from '../lib/ankle.js'

const nameOf = id => (EXIDX[id] ? exerciseNameFor(EXIDX[id]) : id)

// The protection plan (program.md §5): each joint's biggest risk and its exercises.
const PLAN = [
  { joint: 'shoulder', ids: ['8361', '5607', '1503'], sessions: ['A', 'C'] },
  { joint: 'wrist', ids: ['1428', '0364'], sessions: ['A', 'C'] },
  { joint: 'elbow', ids: ['10817', '0313'], sessions: ['C', 'E'] },
  { joint: 'neck', ids: ['3149', '10780', '10781', '5145'], sessions: ['A', 'D', 'E'] },
  { joint: 'back', ids: ['1241', '0276', '0715'], sessions: ['B', 'D'] },
  { joint: 'hip', ids: ['4555', '1775', '1053'], sessions: ['B', 'D'] },
  { joint: 'knee', ids: ['3395', '4204'], sessions: ['D'] },
  { joint: 'ankle', ids: ['3127', '10734', '1387'], sessions: ['A', 'B', 'C', 'D', 'E'] },
]

export default function Joints() {
  const S = useStore(s => s.S)
  const m = mgOf(S)
  const today = todayISO()
  const phase = clampPhase(m.ankle.phase)
  const summary = jointSummary(m.pain, today)
  return <div className="narrow">
    <div className="hdr"><div><h1>{mt('joints.title')}</h1><div className="sub">{mt('ankle.phase', phase)} · {mt('ankle.p' + phase)}</div></div></div>
    <PainLog m={m} today={today} />

    <section className="card">
      <h2>{mt('joints.today')}</h2>
      {summary.map(r => <div key={r.joint} className="mg-field">
        <label>{mt('joint.' + r.joint)}</label>
        {r.last == null ? <span className="mg-muted mg-small">{mt('pain.none')}</span>
          : <span className={'mg-chip ' + (r.zone === 'ok' ? 'up' : 'pain')}>{r.zone === 'ok' ? '●' : '▲'} {r.last}/10</span>}
      </div>)}
    </section>

    <Ankle m={m} phase={phase} />

    <section className="card">
      <h2>{mt('joints.plan')}</h2>
      <table className="mg-table">
        <tbody>{PLAN.map(p => <tr key={p.joint}>
          <td><b>{mt('joint.' + p.joint)}</b><br /><span className="mg-muted mg-small">{mt('risk.' + p.joint)}</span></td>
          <td className="mg-small">{p.ids.map(nameOf).join(mt('sep'))}<br /><span className="mg-muted">{p.sessions.join(mt('sep'))}</span></td>
        </tr>)}</tbody>
      </table>
    </section>

    <section className="card">
      <h2>{mt('joints.rule')}</h2>
      {['ok', 'ease', 'stop'].map(z => <div key={z} className={'mg-note' + (z === 'ok' ? '' : ' pain')}><span aria-hidden="true">{z === 'ok' ? '●' : '▲'}</span><span><b>{z === 'ok' ? '0–3' : z === 'ease' ? '4–5' : '6+'}</b> {mt('zone.' + z)}</span></div>)}
    </section>

    <section className="card">
      <h2>{mt('joints.flags')}</h2>
      <ul className="mg-list">{RED_FLAGS.map(f => <li key={f}>{mt('flag.' + f)}</li>)}</ul>
    </section>

    <h3 className="mg-sec" id="mobility">{mt('kind.mobility')}</h3>
    {MOBILITY_FLOW.map((x, i) => <ExRow key={i} id={x.id} amount={doseText(x.dose)} />)}
  </div>
}

function PainLog({ m, today }) {
  const [joint, setJoint] = useState('ankle')
  const [v, setV] = useState(null)
  const [ctx, setCtx] = useState('during')
  const [advice, setAdvice] = useState(null)
  const save = () => {
    if (v == null) return
    if (ctx === 'morning') setAdvice(morningAdvice(v, usualPain(m.pain, joint, today)))
    logPain(joint, v, ctx)
    useUI.getState().toast(mt('pain.saved'))
    setV(null)
  }
  return <section className="card">
    <h2>{mt('joints.log')}</h2>
    <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 12 }} role="group" aria-label={mt('joints.log')}>
      {JOINTS.map(j => <button key={j} type="button" className={'mg-chip' + (joint === j ? ' act' : '')} aria-pressed={joint === j} onClick={() => setJoint(j)} style={{ minHeight: 40 }}>{mt('joint.' + j)}</button>)}
    </div>
    <PainScale value={v} onChange={setV} label={mt('joint.' + joint)} />
    <div style={{ margin: '12px 0 6px', fontWeight: 600 }}>{mt('pain.ctx')}</div>
    <div className="mg-free" role="group" aria-label={mt('pain.ctx')}>
      {['during', 'morning', 'rest'].map(c => <button key={c} type="button" aria-pressed={ctx === c} onClick={() => setCtx(c)}>{mt('pain.ctx.' + c)}</button>)}
    </div>
    <button className="btn primary" style={{ marginTop: 12 }} disabled={v == null} onClick={save}>{mt('save')}</button>
    {advice && <div className={'mg-note' + (advice === 'carry-on' ? '' : ' pain')} style={{ marginTop: 10 }}><Icon name={advice === 'carry-on' ? 'checkCircle' : 'warning'} /><span>{mt('morning.' + advice)}</span></div>}
  </section>
}

function Ankle({ m, phase }) {
  const [vals, setVals] = useState({})
  const [msg, setMsg] = useState(null)
  const checks = CRITERIA[phase]
  const extra = phase === 2 ? ['calfOther'] : []
  const fields = [...new Set([...checks.map(c => c.key), ...extra, ...(phase === 3 ? ['sideHopFear'] : [])])]
  const set = (k, val) => setVals(x => ({ ...x, [k]: val }))
  const test = () => {
    const r = evaluatePhase(phase, vals)
    const next = recordAnkleTest(vals)
    setMsg(r.pass ? { ok: true, text: mt('ankle.pass', next) } : { ok: false, text: mt('ankle.fail', r.failed.map(k => mt('crit.' + k)).join(mt('sep'))) })
    setVals({})
  }
  const sprain = () => {
    recordAnkleTest({}, { newSprain: true })
    setMsg({ ok: false, text: mt('ankle.sprainDone') })
  }
  return <section className="card" aria-label={mt('ankle.title')}>
    <h2>{mt('ankle.title')} · {mt('ankle.phase', phase)}</h2>
    <b className="mg-display" style={{ fontSize: 22 }}>{mt('ankle.p' + phase)}</b>
    <div className="mg-note" style={{ marginTop: 10 }}><Icon name="info" /><span>{mt('brace')}.</span></div>

    <div style={{ margin: '14px 0 6px', fontWeight: 600 }}>{mt('ankle.drills')}</div>
    {PHASE_DRILLS[phase].map((d, i) => <ExRow key={i} id={d.id} sub={d.note ? mt('note.' + d.note) : null} amount={doseText({ sets: d.sets, reps: d.reps, sec: d.sec, side: d.side })} />)}

    <div style={{ margin: '14px 0 6px', fontWeight: 600 }}>{mt('ankle.allowed')}</div>
    <table className="mg-table"><tbody>
      {Object.keys(ANKLE_GATES).map(g => { const x = gated(ANKLE_GATES[g], phase); return <tr key={g}><td>{mt('allow.' + g)}</td><td>{nameOf(x.id)}{x.note ? ' · ' + mt('note.' + x.note) : ''}</td></tr> })}
    </tbody></table>

    {checks.length ? <>
      <div style={{ margin: '16px 0 4px', fontWeight: 600 }}>{mt('ankle.test')}</div>
      <div className="mg-muted mg-small" style={{ marginBottom: 6 }}>{mt('ankle.testHint')}</div>
      {fields.map(k => <div className="mg-field" key={k}>
        <label htmlFor={'c-' + k}>{mt('crit.' + k)}</label>
        {k === 'sideHopFear'
          ? <input id={'c-' + k} type="checkbox" checked={vals[k] === true} onChange={e => set(k, e.target.checked)} />
          : <input id={'c-' + k} type="number" inputMode="decimal" min="0" value={vals[k] ?? ''} onChange={e => set(k, e.target.value === '' ? '' : Number(e.target.value))} />}
      </div>)}
      <button className="btn primary" style={{ marginTop: 10 }} onClick={test}>{mt('save')}</button>
    </> : <div className="mg-note" style={{ marginTop: 12 }}><Icon name="checkCircle" /><span>{mt('ankle.final')}</span></div>}
    {msg && <div className={'mg-note' + (msg.ok ? '' : ' pain')} style={{ marginTop: 10 }} role="status"><Icon name={msg.ok ? 'checkCircle' : 'warning'} /><span>{msg.text}</span></div>}
    <button className="btn" style={{ marginTop: 10 }} onClick={sprain}><Icon name="warning" />{mt('ankle.sprain')}</button>
  </section>
}

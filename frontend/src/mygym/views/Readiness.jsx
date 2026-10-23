// First use (design: "أول استخدام"): the notice that the app is no substitute for a doctor, seven
// health-readiness questions, what the answers mean, and the starting point that places you on
// the pull-up and push-up ladders. Then the programme is built into openGym's routines.
// `again`: the questions a year on (/readiness), which only renew the answers.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import { QUESTIONS, readinessResult } from '../lib/readiness.js'
import { mt } from '../i18n.js'
import { setUp, renewReadiness } from '../state.js'

const PULL = [0, 1, 4, 5]
const PUSH = [0, 1, 2, 3]

export default function Readiness({ again = false }) {
  const nav = useNavigate()
  const [step, go] = useState(0)
  // Each step, and Today after the last one, opens at its top rather than where the long list left off.
  const setStep = n => { go(n); window.scrollTo(0, 0) }
  const [a, setA] = useState({})
  const [pull, setPull] = useState(null)
  const [push, setPush] = useState(null)
  const [ankle, setAnkle] = useState(null)
  const r = readinessResult(a)
  return <div className="narrow" style={{ paddingTop: 12 }}>
    <div className="mg-rules" aria-hidden="true" style={{ marginBottom: 14 }}><i /><i /><i /></div>
    <h1 className="mg-display" style={{ fontSize: 34, margin: '0 0 6px' }}>{step < 2 ? mt('ready.title') : mt('base.title')}</h1>

    {step === 0 && <>
      <div className="mg-note pain"><Icon name="warning" /><span>{mt('ready.disclaimer')}</span></div>
      <div className="mg-muted" style={{ marginBottom: 12, lineHeight: 1.6 }}>{mt('ready.intro')} <a href="https://eparmedx.com/" target="_blank" rel="noopener">{mt('ready.official')}</a></div>
      {QUESTIONS.map((q, i) => <section className="card" key={q}>
        <div style={{ lineHeight: 1.6 }}><b className="mg-num">{i + 1}.</b> {mt('q.' + q)}</div>
        <div className="mg-yn" role="group" aria-label={mt('q.' + q)}>
          <button type="button" aria-pressed={a[q] === true} onClick={() => setA(x => ({ ...x, [q]: true }))}>{mt('yes')}</button>
          <button type="button" aria-pressed={a[q] === false} onClick={() => setA(x => ({ ...x, [q]: false }))}>{mt('no')}</button>
        </div>
      </section>)}
      <button className="btn primary mg-big-btn" disabled={!r.complete} onClick={() => setStep(1)}>{mt('ready.next')}</button>
    </>}

    {step === 1 && <>
      <div className={'mg-note' + (r.advice === 'clear' ? '' : ' pain')} role="status">
        <Icon name={r.advice === 'clear' ? 'checkCircle' : 'warning'} /><span>{mt('ready.' + r.advice)}</span>
      </div>
      <div className="mg-note pain"><Icon name="info" /><span>{mt('ready.disclaimer')}</span></div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn" style={{ width: 'auto' }} onClick={() => setStep(0)}>{mt('back')}</button>
        {again
          ? <button className="btn primary mg-big-btn" onClick={() => { renewReadiness(a); nav('/home'); window.scrollTo(0, 0) }}>{mt('save')}</button>
          : <button className="btn primary mg-big-btn" onClick={() => setStep(2)}>{mt('ready.next')}</button>}
      </div>
    </>}

    {step === 2 && <>
      <Choice title={mt('base.pullup')} options={PULL.map(v => [v, mt('base.pull.' + v)])} value={pull} onChange={setPull} />
      <Choice title={mt('base.pushup')} options={PUSH.map(v => [v, mt('base.push.' + v)])} value={push} onChange={setPush} />
      <Choice title={mt('base.ankle')} options={[[1, mt('base.ankle.1')], [2, mt('base.ankle.2')]]} value={ankle} onChange={setAnkle} />
      <div className="mg-note"><Icon name="info" /><span>{mt('base.ankleHint')}</span></div>
      <button className="btn primary mg-big-btn" disabled={pull == null || push == null || ankle == null}
        onClick={() => { setUp({ answers: a, pullRung: pull, pushRung: push, ankleStart: ankle }); window.scrollTo(0, 0) }}><Icon name="play" />{mt('ready.start')}</button>
    </>}
  </div>
}

function Choice({ title, options, value, onChange }) {
  return <section className="card">
    <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="radiogroup" aria-label={title}>
      {options.map(([v, label]) => <button key={v} type="button" role="radio" aria-checked={value === v} className="mg-row" style={{ minHeight: 48, marginBottom: 0, ...(value === v ? { border: '2px solid var(--acc)' } : {}) }} onClick={() => onChange(v)}>
        <span className="txt"><span className="ttl" style={{ fontSize: 15 }}>{label}</span></span>
        {value === v && <Icon name="checkCircle" />}
      </button>)}
    </div>
  </section>
}

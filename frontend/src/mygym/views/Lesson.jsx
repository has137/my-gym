// One boxing lesson (design: "صفحة الدرس"): the steps, the most common mistake, why it matters in
// the ring and in self-defence, the catalogue animation of the punch, and the rating that opens
// the next lesson.
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { EXIDX } from '../../lib/exercises.js'
import Icon from '../../components/Icon.jsx'
import ExRow from '../components/ExRow.jsx'
import { LESSONS } from '../content/lessons.js'
import { LEARNED_AT } from '../lib/lessons.js'
import { mt, pick } from '../i18n.js'
import { mgOf, rateLesson } from '../state.js'

export default function Lesson() {
  const { id } = useParams()
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const m = mgOf(S)
  const l = LESSONS.find(x => x.id === id) || LESSONS[0]
  const rating = m.lessons.ratings[l.id] ?? null
  return <div className="narrow">
    <header className="mg-hdr" style={{ alignItems: 'center' }}>
      <button className="mg-iconbtn" onClick={() => nav(-1)} aria-label={mt('back')}><Icon name="chevronLeft" /></button>
      <div style={{ flex: 1 }}>
        <div className="d">{mt('lesson.week', l.week)}{l.ankle > 1 ? ' · ' + mt('lesson.ankle', l.ankle) : ''}</div>
        <h1 className="mg-display" style={{ fontSize: 26 }}>{pick(l.title)}</h1>
      </div>
    </header>

    {l.ids.filter(x => EXIDX[x]).map(x => <ExRow key={x} id={x} />)}

    <section className="card">
      <h2>{mt('lesson.steps')}</h2>
      <ol className="mg-list">{(pick(l.steps) || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
    </section>
    <div className="mg-note pain"><Icon name="warning" /><span><b>{mt('lesson.mistake')}: </b>{pick(l.mistake)}</span></div>
    <section className="card">
      <h2>{mt('lesson.ring')}</h2>
      <div style={{ lineHeight: 1.7 }}>{pick(l.ring)}</div>
    </section>
    <section className="card">
      <h2>{mt('lesson.defense')}</h2>
      <div style={{ lineHeight: 1.7 }}>{pick(l.defense)}</div>
    </section>

    <section className="card">
      <h2>{mt('lesson.rate')}</h2>
      <div className="mg-scale" role="group" aria-label={mt('lesson.rate')}>
        {Array.from({ length: 11 }, (_, v) => <button key={v} type="button" className={v >= LEARNED_AT ? 'z-ok' : 'z-ease'} aria-pressed={rating === v} onClick={() => rateLesson(l.id, v)}>{v}</button>)}
      </div>
      {rating != null && rating >= LEARNED_AT && <div className="mg-note" style={{ marginTop: 10 }}><Icon name="checkCircle" /><span>{mt('lesson.learned')}</span></div>}
    </section>
    <button className="btn primary mg-big-btn" onClick={() => nav('/session/A')}><Icon name="boxing" />{mt('lesson.practice')}</button>
  </div>
}

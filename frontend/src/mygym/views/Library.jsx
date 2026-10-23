// The library tab: openGym's exercise library as it is, beside the boxing lessons.
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { todayISO } from '../../lib/format.js'
import OgLibrary from '../../views/Library.jsx'
import Icon from '../../components/Icon.jsx'
import { LESSONS } from '../content/lessons.js'
import { weekLesson, isLearned } from '../lib/lessons.js'
import { mt, pick } from '../i18n.js'
import { mgOf, contextOf } from '../state.js'

export default function MgLibrary() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'lessons' ? 'lessons' : 'exercises'
  const set = t => setParams(t === 'lessons' ? { tab: 'lessons' } : {}, { replace: true })
  return <div className="mg-library">
    <div className="narrow" style={{ paddingTop: 4 }}>
      <div className="mg-tabs" role="tablist" aria-label={mt('tab.library')}>
        <button role="tab" aria-selected={tab === 'exercises'} onClick={() => set('exercises')}>{mt('lib.exercises')}</button>
        <button role="tab" aria-selected={tab === 'lessons'} onClick={() => set('lessons')}>{mt('lib.lessons')}</button>
      </div>
    </div>
    {tab === 'exercises' ? <OgLibrary /> : <Lessons />}
  </div>
}

function Lessons() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const m = mgOf(S)
  const ctx = contextOf(S, todayISO())
  const cur = weekLesson(LESSONS, { week: Math.max(1, ctx.week), anklePhase: ctx.anklePhase, ratings: m.lessons.ratings, deload: ctx.phase === 'deload' }).lesson
  return <div className="narrow">
    <div className="hdr"><div><h1>{mt('lib.lessons')}</h1><div className="sub">{mt('lib.lessonsHint')}</div></div></div>
    {LESSONS.map((l, i) => {
      const learned = isLearned(m.lessons.ratings, l.id)
      const isCur = cur?.id === l.id
      const locked = !learned && !isCur && l.week > Math.max(1, ctx.week)
      const ankleWait = !learned && ctx.anklePhase < (l.ankle || 1)
      return <button key={l.id} type="button" className={'mg-row' + (isCur ? ' cur' : learned ? ' done' : '')} onClick={() => nav('/lesson/' + l.id)}>
        <span className="num">{learned ? <Icon name="check" /> : i + 1}</span>
        <span className="txt">
          <span className="ttl">{pick(l.title)}</span>
          <span className="sub">{mt('lesson.week', l.week)}{ankleWait ? ' · ' + mt('lesson.ankle', l.ankle) : ''}</span>
        </span>
        <span className={'mg-chip ' + (isCur ? 'act' : learned ? 'up' : 'steady')}>{isCur ? mt('lesson.current') : learned ? mt('lesson.learned') : locked ? mt('lesson.locked') : mt('open')}</span>
      </button>
    })}
  </div>
}

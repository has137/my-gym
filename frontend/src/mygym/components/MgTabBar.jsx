// My gym's tab bar: Today, Library, Start/Resume in the middle, Progress, Joints. Same element
// and classes as openGym's (#tabbar), so its layout rules, safe-area padding and the page's
// bottom room apply unchanged; only the tabs and what Start does are this fork's.
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import Icon from '../../components/Icon.jsx'
import Elapsed from '../../components/Elapsed.jsx'
import { navToWorkout } from '../../lib/nav.js'
import { mt } from '../i18n.js'
import { rotationState } from '../state.js'

function Tab({ active, icon, label, onClick }) {
  return (
    <button className={active ? 'on' : ''} onClick={onClick} aria-current={active ? 'page' : undefined}>
      <span className="tab-ic"><Icon name={icon} /></span><span>{label}</span>
    </button>
  )
}

export default function MgTabBar() {
  const nav = useNavigate()
  const loc = useLocation()
  const S = useStore(s => s.S)
  const cur = loc.pathname.split('/')[1] || 'home'
  const on = keys => keys.includes(cur)
  const running = !!S.active && !S.active.editingWorkoutId && !S.active.backfill && S.active.start > 0
  // Start opens the next session's overview (warm-up, boxing, exercises) rather than jumping
  // straight into the sets; with a session running it goes back to it.
  const start = () => {
    if (S.active) { navToWorkout(); return }
    const { next } = rotationState(S)
    nav('/session/' + (next || 'A'))
  }
  return (
    <nav id="tabbar" aria-label={mt('appName')}>
      <Tab active={on(['home', 'session'])} icon="house" label={mt('tab.today')} onClick={() => nav('/home')} />
      <Tab active={on(['library', 'lesson', 'muscles'])} icon="dumbbell" label={mt('tab.library')} onClick={() => nav('/library')} />
      <button className={'start' + (S.active ? ' rec' : '')} onClick={start} aria-label={running ? mt('tab.resume') : mt('tab.start')}>
        <span className="cir"><Icon name="play" /></span>
        {running ? <span className="tab-time"><Elapsed start={S.active.start} /></span> : <span>{S.active ? mt('tab.resume') : mt('tab.start')}</span>}
      </button>
      <Tab active={on(['progress', 'stats', 'history', 'measurements'])} icon="chartLine" label={mt('tab.progress')} onClick={() => nav('/progress')} />
      <Tab active={on(['joints'])} icon="shield" label={mt('tab.joints')} onClick={() => nav('/joints')} />
    </nav>
  )
}

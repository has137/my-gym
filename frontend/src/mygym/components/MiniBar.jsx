// The mini bar: while a session runs and you are on another tab, a bar above the tabs shows the
// session, the exercise you were on and the time. A tap goes back to the workout. A rest that
// runs shows in openGym's own rest bar, and the mini bar moves up above it (theme.css).
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import { navToWorkout } from '../../lib/nav.js'
import Icon from '../../components/Icon.jsx'
import Elapsed from '../../components/Elapsed.jsx'
import { mt } from '../i18n.js'

export default function MiniBar() {
  const loc = useLocation()
  const active = useStore(s => s.S.active)
  const show = !!active && !active.editingWorkoutId && !active.backfill && active.start > 0 && loc.pathname !== '/workout' && !loc.pathname.startsWith('/timer')
  useEffect(() => {
    document.body.classList.toggle('mg-mini', show)
    return () => document.body.classList.remove('mg-mini')
  }, [show])
  if (!show) return null
  const entry = active.entries?.[active.cur] || active.entries?.[0]
  const ex = entry ? EXIDX[entry.id] : null
  return (
    <button id="mg-minibar" type="button" onClick={navToWorkout} aria-label={mt('minibar.resume') + ': ' + active.name}>
      <span className="ic" aria-hidden="true"><Icon name="play" /></span>
      <span className="tx">
        <b>{active.name}</b>
        <span>{ex ? exerciseNameFor(ex) : mt('minibar.resume')}</span>
      </span>
      <span className="tm"><Elapsed start={active.start} /></span>
    </button>
  )
}

// My gym's screens and shell pieces, handed to App.jsx in one import.
import { useEffect } from 'react'
import { Route } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import Today from './views/Today.jsx'
import Session from './views/Session.jsx'
import RoundTimer from './views/RoundTimer.jsx'
import MgLibrary from './views/Library.jsx'
import Lesson from './views/Lesson.jsx'
import Progress from './views/Progress.jsx'
import Joints from './views/Joints.jsx'
import Readiness from './views/Readiness.jsx'
import MgTabBar from './components/MgTabBar.jsx'
import MiniBar from './components/MiniBar.jsx'
import { isSetUp } from './state.js'
import './theme.css'

export { MgTabBar, MiniBar, Readiness }

/** The routes My gym adds or takes over. `/home` and `/library` replace openGym's. */
export const mgRoutes = () => [
  <Route key="home" path="/home" element={<Today />} />,
  <Route key="session" path="/session/:key" element={<Session />} />,
  <Route key="timer" path="/timer/:key/:block" element={<RoundTimer />} />,
  <Route key="library" path="/library" element={<MgLibrary />} />,
  <Route key="lesson" path="/lesson/:id" element={<Lesson />} />,
  <Route key="progress" path="/progress" element={<Progress />} />,
  <Route key="joints" path="/joints" element={<Joints />} />,
  <Route key="readiness" path="/readiness" element={<Readiness again />} />,
]

/** Marks the document so theme.css applies, and says whether first use is still to do. */
export function useMgShell(on) {
  const ready = useStore(s => isSetUp(s.S))
  useEffect(() => {
    if (!on) return
    document.documentElement.dataset.mg = ''
    document.title = 'My gym'
  }, [on])
  return { needsSetup: on && !ready }
}

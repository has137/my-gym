// One exercise as a row: openGym's thumbnail and translated name, the dose, and a tap that opens
// openGym's own exercise sheet (animation, steps, muscles). The pictures are openGym's 180 px
// Gym visual media, shown by id exactly as openGym shows them.
import { EXIDX } from '../../lib/exercises.js'
import { exerciseNameFor } from '../../lib/i18n.js'
import { Thumb } from '../../components/Media.jsx'
import { exerciseDetailSheet } from '../../sheets.jsx'
import { mt } from '../i18n.js'

export function doseText(dose = {}) {
  if (!dose) return ''
  const parts = []
  const each = dose.side ? ' ' + mt('dose.side') : dose.each ? ' ' + mt('dose.each') : ''
  if (dose.min) parts.push(mt('dose.min', dose.min))
  else if (dose.sec) parts.push((dose.sets ? dose.sets + ' × ' : '') + mt('dose.sec', dose.sec) + each)
  else if (dose.reps) parts.push((dose.sets ? dose.sets + ' × ' : '') + dose.reps + each)
  return parts.join(' ')
}

export default function ExRow({ id, title, sub, amount, tag, tagClass = '', num, state = '', onClick }) {
  const ex = id ? EXIDX[id] : null
  const open = onClick || (ex ? () => exerciseDetailSheet(ex) : undefined)
  return (
    <button type="button" className={'mg-row ' + state} onClick={open} disabled={!open}>
      {num != null && <span className="num">{state === 'done' ? '✓' : num}</span>}
      {ex && <span className="thumb"><Thumb ex={ex} /></span>}
      <span className="txt">
        <span className="ttl">{title || (ex ? exerciseNameFor(ex) : '')}</span>
        {sub && <span className="sub">{sub}</span>}
      </span>
      {(amount || tag) && <span className="amt">
        {amount && <b>{amount}</b>}
        {tag && <span className={'mg-chip ' + tagClass}>{tag}</span>}
      </span>}
    </button>
  )
}

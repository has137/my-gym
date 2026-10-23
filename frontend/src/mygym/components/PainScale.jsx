// The 0–10 pain scale: 0–3 green, 4–5 light orange, 6+ full orange, with the rule's message
// below. Colour is never the only cue: the message names the zone.
import { painZone } from '../lib/pain.js'
import { mt } from '../i18n.js'

export default function PainScale({ value, onChange, label }) {
  const zone = value == null ? null : painZone(value)
  return (
    <div role="group" aria-label={label}>
      <div className="mg-scale">
        {Array.from({ length: 11 }, (_, v) => (
          <button key={v} type="button" className={'z-' + painZone(v)} aria-pressed={value === v} onClick={() => onChange(v)}>{v}</button>
        ))}
      </div>
      {zone && <div className={'mg-note' + (zone === 'ok' ? '' : ' pain')} style={{ marginTop: 10 }} role="status">
        <span aria-hidden="true">{zone === 'ok' ? '●' : '▲'}</span>
        <span>{mt('zone.' + zone)}</span>
      </div>}
    </div>
  )
}

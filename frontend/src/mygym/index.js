// My gym: the one place openGym's own files import this fork from (App.jsx, store/useStore.js,
// views/Settings.jsx). Everything else lives under src/mygym, so pulling an upstream openGym
// release touches only the handful of marked lines that call in here.
//
// On by default in this fork; VITE_MYGYM=0 builds plain openGym, and the test run sets it to 0
// (vite.config.js) so openGym's own suites keep testing openGym exactly as upstream ships it.

export const MG = ((import.meta.env || {}).VITE_MYGYM ?? '1') !== '0'

// Where this version's source code is offered (AGPL-3.0 §13) and where it comes from.
export const SOURCE_URL = 'https://github.com/has137/my-gym'
export const UPSTREAM_URL = 'https://github.com/DuarteSantos8/openGym'

/** What a copy started fresh on this device gets: Arabic, the device's light or dark, the red accent. */
export function freshDefaults(s) {
  s.lang = 'ar'
  s.langAuto = false
  s.theme = 'system'
  s.accent = 'red'
  s.unit = 'kg'
  s.weighIn = false
  s.effort = 'rir'
  s.workoutView = 'cards'
  // Arabic names without the English one in brackets: a Latin run inside right-to-left text
  // breaks its brackets across lines. Settings → Language turns it back on.
  s.enParens = { ar: false }
  return s
}

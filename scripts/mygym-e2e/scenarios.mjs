// The delivery scenarios, in Arabic at 390 px, driven through the real screens: a full session,
// a partial one, a swap, an added set, leaving a session and coming back to it, free activity,
// boxing rounds (in a session and on their own). After each, what the app suggests next is read
// back: the rotation's next day on Today, and the sets openGym prefills the next time.
import { open, goto, state, shot, sleep, assert, firstRun } from './lib.mjs'

const { EXDB } = await import('../../frontend/src/lib/exercises-data.js')
const EQ = Object.fromEntries(EXDB.map(e => [e.id, e.eq]))
const START_KG = 10
const day = n => new Date(Date.UTC(2026, 9, 24 + n, 15, 0, 0))   // Sat 24 Oct 2026 + n days

const { browser, page, errors } = await open({ time: day(0) })
const S = () => state(page)
const log = (...a) => console.log('     ', ...a)
const setsOf = e => e.sets.filter(x => !x.warm).map(x => (x.w ?? 0) + '×' + (x.r ?? x.sec ?? '?')).join(' ')

async function toDay(n) {
  await page.clock.setSystemTime(day(n))
  await goto(page, '/home')
  await sleep(400)
}

async function nextOnToday() {
  await goto(page, '/home'); await sleep(300)
  return (await page.locator('.mg-day.sug .n').first().textContent())?.trim()
}

async function startSession(key) {
  await goto(page, '/session/' + key); await sleep(300)
  if (await page.locator('#modal-root.open').count()) { await shot(page, 'sc-modal-' + key); console.log('      (open sheet:', (await page.locator('#modal-root').innerText()).slice(0, 160).replace(/\n/g, ' / '), ')') }
  await page.locator('.mg-bottom button').click(); await sleep(700)
  assert(page.url().endsWith('#/workout'), `session ${key}: Start opens the workout screen`)
  return (await S()).active
}

// The blocks of the unit on screen: a superset's members, or the lone exercise.
async function unitBlocks() {
  const ss = page.locator('.ss-ex[data-exidx]')
  const n = await ss.count()
  if (n) {
    const out = []
    for (let i = 0; i < n; i++) out.push({ idx: Number(await ss.nth(i).getAttribute('data-exidx')), el: ss.nth(i) })
    return out
  }
  return [{ idx: (await S()).active.cur, el: page.locator('#root') }]
}

// Work the unit on screen: weights for dumbbell lifts still at 0, then tick `ticks[idx]` sets
// of each exercise (all when not given).
async function workUnit(ticks = {}) {
  const active = (await S()).active
  for (const { idx, el } of await unitBlocks()) {
    const e = active.entries[idx]
    const rows = el.locator('.setrow')
    const n = await rows.count()
    if (EQ[e.id] === 'dumbbell') {
      for (let i = 0; i < n; i++) {
        const inp = rows.nth(i).locator('.stp.w input')
        if (await inp.count() && Number(await inp.inputValue() || 0) === 0) await inp.fill(String(START_KG))
      }
    }
    const want = ticks[idx] ?? n
    for (let i = 0; i < Math.min(want, n); i++) {
      const box = rows.nth(i).locator('button.chk')
      if ((await box.getAttribute('aria-checked')) !== 'true') { await box.click(); await sleep(120) }
    }
  }
}

async function goUnit(u) {
  await page.locator('.wchips .wchip').nth(u).click()
  await sleep(350)
}

// Every unit in turn, until openGym's "that's the whole workout" card comes up.
async function doAll() {
  for (let u = 0; u < await unitsCount(); u++) {
    if (await page.locator('#modal-root.open').count()) break
    await goUnit(u); await workUnit()
  }
}

async function unitsCount() { return page.locator('.wchips .wchip').count() }

// Every set ticked: openGym's own "all done" card offers Finish. Otherwise the header's Finish.
async function finish({ sheetOpen = false } = {}) {
  const allDone = page.locator('#modal-root').getByText('إنهاء التمرين', { exact: true })
  if (sheetOpen) { /* the Finish sheet is already up */ }
  else if (await allDone.isVisible().catch(() => false)) await allDone.click()
  else await page.locator('.whdr-finish').click()
  await sleep(300)
  const save = page.locator('#modal-root').getByText('إنهاء وحفظ', { exact: true })
  if (await save.isVisible().catch(() => false)) { await save.click(); await sleep(300) }
  await sleep(600)
  // openGym's summary (time, volume, records): its button goes back to Today
  const nice = page.locator('#modal-root').getByRole('button', { name: 'رائع!', exact: true })
  if (await nice.isVisible().catch(() => false)) { await shot(page, 'sc-summary-' + (await S()).workouts.length); await nice.click(); await sleep(400) }
}

async function discard() {
  await page.locator('.whdr-finish').click(); await sleep(250)
  await page.locator('#modal-root').getByText('تجاهل التمرين', { exact: true }).click(); await sleep(250)
  await page.locator('#modal-root').getByRole('button', { name: 'تجاهل', exact: true }).click(); await sleep(500)
  assert(!(await S()).active, 'discarded: no session left running')
}

// What openGym prefills for a session started now, then the session is thrown away again.
async function peek(key) {
  const a = await startSession(key)
  // keyed by id, plus the session's order (ids like "0289" would sort numerically as keys)
  const out = Object.fromEntries(a.entries.map(e => [e.id, { w: e.sets[0]?.w ?? 0, r: e.sets[0]?.r ?? e.sets[0]?.sec, sets: e.sets.filter(x => !x.warm).length, all: setsOf(e) }]))
  Object.defineProperty(out, 'order', { value: a.entries.map(e => e.id) })
  await discard()
  return out
}

process.on('uncaughtException', async e => { console.error(e.message.split('\n')[0]); await shot(page, 'sc-fail').catch(() => {}); process.exit(1) })
const fmt = p => p.order.map(id => id + ' ' + p[id].all).join(' | ')
const lastWorkout = async () => (await S()).workouts.at(-1)

// --------------------------------------------------------------------------- day 0: first use
await firstRun(page)
assert((await nextOnToday()) === 'A', 'first use: Today suggests day A')
const before = { A: await peek('A') }
log('A before:', fmt(before.A))

// --------------------------------------------------------------------------- 1. full session A
console.log('\n1. Full session (A)')
await startSession('A')
await doAll()
await shot(page, 'sc-1-full-A')
{
  const a = (await S()).active
  const done = a.entries.flatMap(e => e.sets).filter(x => x.done).length
  const total = a.entries.flatMap(e => e.sets).length
  assert(done === total && total > 0, `all ${total} sets ticked`)
}
await finish()
{
  const w = await lastWorkout()
  assert(!!w && !(await S()).active, 'saved as a workout, nothing left running')
  log('logged:', w.entries.map(e => e.id + ' ' + setsOf(e)).join(' | '))
}
assert((await nextOnToday()) === 'B', 'next suggestion after A: day B')

// --------------------------------------------------------------------------- 2. partial session B
console.log('\n2. Partial session (B): first exercise complete, one set of the second, nothing else')
await toDay(1)
const bBefore = await peek('B')
log('B before:', fmt(bBefore))
{
  await startSession('B')
  const a = (await S()).active
  await goUnit(0); await workUnit()
  await goUnit(1); await workUnit({ 1: 1 })
  await shot(page, 'sc-2-partial-B')
  const done = a.entries.length && (await S()).active.entries.map(e => e.sets.filter(x => x.done).length)
  log('done per exercise:', done.join(' '))
  await page.locator('.whdr-finish').click(); await sleep(250)
  log('finish sheet:', (await page.locator('#modal-root').innerText()).split('\n').slice(0, 2).join(' / '))
  await finish({ sheetOpen: true })
}
assert((await nextOnToday()) === 'C', 'next suggestion after a partial B: day C (the session counts, the rotation moves on)')

// --------------------------------------------------------------------------- 3. swap + add set + exit/return (C)
console.log('\n3. Swap an exercise, add a set, leave the session and come back (C)')
await toDay(2)
const cBefore = await peek('C')
log('C before:', fmt(cBefore))
let swappedFrom, swappedTo, addedTo
{
  const a0 = await startSession('C')
  // swap the first unit's second exercise (A2) for its first planned backup
  await goUnit(0)
  const blocks = await unitBlocks()
  const target = blocks[1] || blocks[0]
  swappedFrom = a0.entries[target.idx].id
  await target.el.locator('button[aria-label="أكثر"]').first().click(); await sleep(250)
  await page.locator('#modal-root').getByText('استبدال التمرين', { exact: true }).click(); await sleep(500)
  await shot(page, 'sc-3-swap-picker')
  const backups = page.getByText('بدائلك', { exact: true })
  assert(await backups.count() > 0, 'the swap picker lists the planned backups first')
  // the first row after the "Your backups" heading: its quick-swap button
  await page.locator('h4.sec:has-text("بدائلك") + .item button.chev').first().click(); await sleep(600)
  const a1 = (await S()).active
  swappedTo = a1.entries[target.idx].id
  assert(swappedTo !== swappedFrom && (a0.entries[target.idx].target?.subs || []).includes(swappedTo), `swapped ${swappedFrom} → ${swappedTo}, one of the slot's backups`)
  await workUnit()
  // add a set to the second unit's last exercise, then do every set of that unit
  await goUnit(1)
  const b2 = (await unitBlocks()).at(-1)
  addedTo = a1.entries[b2.idx].id
  const n0 = (await S()).active.entries[b2.idx].sets.length
  await b2.el.getByText('إضافة مجموعة', { exact: true }).click(); await sleep(300)
  const n1 = (await S()).active.entries[b2.idx].sets.length
  assert(n1 === n0 + 1, `added a set to ${addedTo}: ${n0} → ${n1}`)
  await workUnit({ [b2.idx - 1]: 1 })
  const doneBefore = (await S()).active.entries.flatMap(e => e.sets).filter(x => x.done).length
  // leave: Minimize, the mini bar and Today's Resume
  await page.getByRole('button', { name: 'تصغير' }).click(); await sleep(500)
  assert(page.url().endsWith('#/home'), 'Minimize goes back to Today')
  assert(await page.locator('#mg-minibar').isVisible(), 'the mini bar shows while the session runs')
  await shot(page, 'sc-3-minibar')
  assert(/استأنف/.test(await page.locator('.mg-hero').textContent()), 'Today offers Resume')
  await goto(page, '/progress'); await sleep(300)
  assert(await page.locator('#mg-minibar').isVisible(), 'the mini bar follows to other tabs')
  await page.locator('#mg-minibar').click(); await sleep(600)
  assert(page.url().endsWith('#/workout'), 'the mini bar returns to the workout')
  const doneAfter = (await S()).active.entries.flatMap(e => e.sets).filter(x => x.done).length
  assert(doneAfter === doneBefore, `ticked sets kept across leaving and returning (${doneAfter})`)
  // and once more through a reload, the way a phone drops a backgrounded tab
  await page.reload({ waitUntil: 'networkidle' }); await sleep(500)
  assert(!!(await S()).active, 'the session survives a reload')
  await goto(page, '/home'); await sleep(300)
  await page.locator('#tabbar button.start').click(); await sleep(600)
  assert(page.url().endsWith('#/workout'), 'the centre tab resumes the running session')
}

// --------------------------------------------------------------------------- 4. boxing rounds inside C
console.log('\n4. Boxing rounds inside the running session (C, bag)')
{
  const m0 = (await S()).mg.boxing?.C
  await goto(page, '/timer/C/boxing'); await sleep(400)
  const plan = await page.locator('.what').textContent()
  log('timer before start:', plan.trim())
  await page.locator('.ctl .pp').click(); await sleep(300)
  await shot(page, 'sc-4-timer-running')
  await page.clock.fastForward('20:00'); await sleep(600)
  assert(await page.getByText('انتهت الجولات').isVisible(), 'all rounds run to the end')
  await page.locator('.mg-scale button', { hasText: /^6$/ }).click()
  await shot(page, 'sc-4-timer-done')
  const n0 = (await S()).active.entries.length
  await page.locator('button.mg-big-btn').click(); await sleep(300)
  const toast = (await page.locator('#toast').textContent().catch(() => '')).trim()
  log('toast:', toast)
  await sleep(300)
  const a = (await S()).active
  log('active entries now:', a.entries.map(e => e.id + (e.target?.mode ? '(' + e.target.mode + ')' : '')).join(' '))
  assert(a.entries.length === n0 + 1 && a.entries.at(-1).plan?.policy === 'off', 'the rounds went into the running session, outside progression')
  const m1 = (await S()).mg.boxing?.C
  log('boxing level C:', JSON.stringify(m0 || 'default'), '→', JSON.stringify(m1))
  // Foundation weeks hold 3 × 2 min (program.md §7): a clean session changes the difficulty only
  assert(m1 && m1.rounds === 3 && m1.workSec === 120 && /تركيبة أصعب/.test(toast), 'clean rounds in the foundation phase: same 3 × 2:00, a harder combination next')
}
await goto(page, '/workout'); await sleep(400)
await doAll()
await finish()
assert((await nextOnToday()) === 'D', 'next suggestion after C: day D')

// --------------------------------------------------------------------------- 5. free activity
console.log('\n5. Free activity in two taps')
await toDay(3)
{
  const n0 = (await S()).workouts.length
  await page.locator('.mg-free button', { hasText: 'مشي' }).first().click(); await sleep(150)
  await page.locator('.mg-free').nth(1).locator('button').nth(1).click(); await sleep(400)
  await shot(page, 'sc-5-free')
  const w = await lastWorkout()
  assert((await S()).workouts.length === n0 + 1, 'free activity saved as its own workout')
  log('free workout:', w.name, w.entries.map(e => e.id + ' ' + JSON.stringify(e.sets[0])).join(' '))
  assert(!(w.routineIds || []).length, 'it is not a programme session')
}
assert((await nextOnToday()) === 'D', 'next suggestion after free activity: still day D')

// --------------------------------------------------------------------------- 6. boxing on its own, stopped early
console.log('\n6. Boxing rounds on their own (A, shadow), stopped early')
{
  const m0 = (await S()).mg.boxing?.A
  const n0 = (await S()).workouts.length
  await goto(page, '/timer/A/boxing'); await sleep(400)
  await page.locator('.ctl .pp').click(); await sleep(300)
  await page.clock.fastForward('03:10'); await sleep(500)
  await page.locator('.ctl button.sm').click(); await sleep(300)
  await page.locator('button.mg-big-btn').click(); await sleep(300)
  const toast = (await page.locator('#toast').textContent().catch(() => '')).trim()
  log('toast:', toast)
  assert(/نفس المستوى/.test(toast), 'stopped early: the toast says same level next time')
  await sleep(300)
  const w = await lastWorkout()
  assert((await S()).workouts.length === n0 + 1 && w.mgFree === 'rounds', 'rounds outside a session saved as their own workout')
  log('rounds workout:', w.name, w.entries.map(e => e.id + ' ' + setsOf(e)).join(' '))
  const m1 = (await S()).mg.boxing?.A
  log('boxing level A:', JSON.stringify(m0 || 'default'), '→', JSON.stringify(m1))
  assert(!m1 || m1.rounds === (m0?.rounds ?? 3), 'stopped early: the same rounds next time')
}
assert((await nextOnToday()) === 'D', 'next suggestion after rounds on their own: still day D')

// --------------------------------------------------------------------------- 7. next suggestions
console.log('\n7. What each session prefills next time')
await toDay(4)
const after = { A: await peek('A'), B: await peek('B'), C: await peek('C') }
for (const k of ['A', 'B', 'C']) {
  log(k + ' after:', fmt(after[k]))
}
const owned = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
const up = w => owned.find(x => x > w)
// A: every set done at the top of its range
for (const id of ['0289', '0327', '0405']) {
  assert(after.A[id].w === up(START_KG), `A ${id}: all sets at the top → next dumbbell up (${START_KG} → ${after.A[id].w} kg)`)
}
assert(after.A['0970'].r === before.A['0970'].r + 1, `A 0970 (band pull-up): every rep → one more rep (${before.A['0970'].r} → ${after.A['0970'].r})`)
// B: first exercise complete, second one set of three, the rest untouched
{
  const [b1, b2, b3, b4] = bBefore.order
  assert(after.B[b1].w === up(START_KG), `B ${b1}: complete → ${after.B[b1].w} kg`)
  assert(after.B[b2].w === START_KG, `B ${b2}: one set of three → same ${START_KG} kg`)
  assert(after.B[b3].w === bBefore[b3].w && after.B[b3].r === bBefore[b3].r, `B ${b3}: not done → same as before`)
  assert(after.B[b4].r === bBefore[b4].r, `B ${b4}: not done → same as before`)
}
// C: the swapped-out exercise keeps its own plan; the routine still holds it
assert(!!after.C[swappedFrom] && !after.C[swappedTo], `C: the swap was for that session only (${swappedFrom} is back)`)
assert(after.C[swappedFrom].w === cBefore[swappedFrom].w && after.C[swappedFrom].r === cBefore[swappedFrom].r, `C ${swappedFrom}: not done → same as before`)
assert(after.C[addedTo].sets === cBefore[addedTo].sets, `C ${addedTo}: the added set was for that session only (${after.C[addedTo].sets} sets)`)
assert(after.C[addedTo].w === up(START_KG), `C ${addedTo}: every set clean (one extra too) → ${after.C[addedTo].w} kg`)
{
  const st = await S()
  const rt = st.routines.find(r => r.id === st.mg.routineIds.C)
  assert(rt.ex.some(e => e.id === swappedFrom) && !rt.ex.some(e => e.id === swappedTo), 'C routine unchanged by the swap')
}
await goto(page, '/timer/C/boxing'); await sleep(300)
log('C boxing timer next time:', (await page.locator('.what').textContent()).trim())

// --------------------------------------------------------------------------- 8. D completes the pass
console.log('\n8. Full session D (knee protection logged), then the rotation starts over')
await startSession('D')
await doAll()
await finish()
assert((await nextOnToday()) === 'A', 'after D the rotation starts again at day A')
await shot(page, 'sc-8-today-after-D')

// --------------------------------------------------------------------------- 9. early deload from pain
console.log('\n9. Pain of 4+ on the last two training days → early deload offered and applied')
await toDay(5)
{
  // ankle pain 5 logged on the days of C (day 2) and D (day 4), the last two training days
  for (const n of [2, 4]) {
    await page.clock.setSystemTime(day(n)); await goto(page, '/joints'); await sleep(300)
    await page.locator('.mg-chip, button', { hasText: 'الكاحل' }).first().click()
    await page.getByRole('button', { name: '5', exact: true }).first().click()
    await page.getByRole('button', { name: 'حفظ', exact: true }).first().click(); await sleep(300)
  }
  await toDay(5)
  assert(await page.getByText('علامة تخفيف مبكر').isVisible(), 'Today shows the early-deload sign')
  await shot(page, 'sc-9-deload-sign')
  await page.getByRole('button', { name: 'خفّف 7 أيام' }).click(); await sleep(400)
  assert((await S()).mg.deloadFrom === day(5).toISOString().slice(0, 10), 'the deload starts today')
  assert(await page.getByText('تخفيف مبكر لسبعة أيام', { exact: false }).isVisible(), 'Today says the early deload is on')
  const plan = await peek('A')
  log('A in the deload:', fmt(plan))
  assert(plan.order.every(id => plan[id].sets <= Math.ceil(after.A[id].sets / 2) + 0), 'session sets halved for the deload')
  await goto(page, '/timer/A/boxing'); await sleep(300)
  const what = (await page.locator('.what').textContent()).trim()
  log('A boxing in the deload:', what)
  assert(/2 × 2:00/.test(what), 'boxing drops to 2 rounds in the deload')
  await toDay(12)
  assert(!(await S()).active && !(await page.getByText('تخفيف مبكر لسبعة أيام').isVisible()), 'seven days later the deload is over')
}

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
assert(!overflow, 'no horizontal scroll at 390 px')
console.log('\nconsole errors:', errors.length ? errors : 'none')
await browser.close()
if (errors.length) process.exit(1)

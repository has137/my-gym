// Shared helpers for the My gym headless checks (README.md). Exercise media requests are answered
// with a blank placeholder, so no Gym visual picture is ever loaded into a page that gets
// screenshotted. Playwright is not a dependency of the project: install it beside these files.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

export const BASE = process.env.BASE || 'http://127.0.0.1:4173/'
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')

export async function open({ theme = 'light', blockMedia = true, time = null } = {}) {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'en-US', colorScheme: theme, serviceWorkers: 'block' })
  const page = await ctx.newPage()
  if (time) await page.clock.install({ time })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  if (blockMedia) {
    await page.route(/\/exercise-media\//, route => {
      const u = route.request().url()
      return u.endsWith('.mp4') ? route.fulfill({ status: 200, contentType: 'video/mp4', body: Buffer.alloc(0) }) : route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
    })
  }
  return { browser, ctx, page, errors }
}

export const state = page => page.evaluate(() => JSON.parse(localStorage.getItem('gym_state_v1') || '{}'))
export const setState = (page, s) => page.evaluate(v => localStorage.setItem('gym_state_v1', JSON.stringify(v)), s)
export const goto = (page, hash) => page.goto(BASE + '#' + hash, { waitUntil: 'networkidle' })
const SHOTS = new URL('./shots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })
export const shot = (page, name) => page.screenshot({ path: SHOTS + name + '.png', fullPage: false })
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT: ' + msg)
  console.log('  ok  ' + msg)
}

// First use: the seven questions (all no), the starting point (hang only, under 5 push-ups,
// ankle unstable), then Start. Leaves the page on Today with the programme built.
export async function firstRun(page) {
  await goto(page, '/home')
  await sleep(500)
  const groups = page.locator('.mg-yn')
  const n = await groups.count()
  for (let i = 0; i < n; i++) await groups.nth(i).locator('button').nth(1).click()
  await page.locator('button.mg-big-btn').click()
  await sleep(150)
  await page.locator('button.mg-big-btn').click()
  await sleep(150)
  const radios = page.locator('[role=radiogroup]')
  await radios.nth(0).locator('[role=radio]').nth(1).click()
  await radios.nth(1).locator('[role=radio]').nth(0).click()
  await radios.nth(2).locator('[role=radio]').nth(1).click()
  await page.locator('button.mg-big-btn').click()
  await sleep(600)
}

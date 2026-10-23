# My gym: headless checks

Drive the built app in Chromium at 390 px, in Arabic, and fail on any console error.

| Script | What it checks |
|---|---|
| `smoke.mjs [light\|dark]` | First use (readiness questions, starting point), then every My gym screen; screenshots in `shots/` |
| `scenarios.mjs` | Full session, partial session, swap, added set, leaving and resuming, boxing rounds in a session and on their own, free activity, the next suggestion after each, and an early deload |

Exercise media are answered with a blank placeholder, so no Gym visual picture is loaded or
screenshotted (NOTICE.md). Playwright is not a project dependency; it is installed here only.

```bash
cd frontend && VITE_STANDALONE=1 npx vite build
cd dist && python3 -m http.server 4173 --bind 127.0.0.1 &     # or any static server
cd ../../scripts/mygym-e2e
npm init -y >/dev/null && npm install playwright
npx playwright install chromium        # or set CHROMIUM=/path/to/chromium
node smoke.mjs light && node smoke.mjs dark && node scenarios.mjs
```

`BASE` changes the address (default `http://127.0.0.1:4173/`). `shots/`, `node_modules/` and the
`package*.json` npm writes here are not part of the repository (`.gitignore`).

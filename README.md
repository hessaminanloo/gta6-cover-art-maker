# gta6-cover-art-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/hessaminanloo/gta6-cover-art-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/hessaminanloo/gta6-cover-art-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Coast Cover Studio** — a fully offline web app that turns your own photos into GTA-style multi-panel cover art and exports it as a PNG, ready to post.

Drop in one photo or several, pick one of five poster layouts (Hero Trio, Quad Grid, Skyline Strip, Center Stage, Full Bleed + Inset), frame each panel by dragging and zooming, choose one of five sunset/neon colour grades (Sunset Melt, Neon Nights, Golden Hour, Miami Teal, Dusk Violet), write your caption and subtitle in bold poster lettering, and export at 1080×1080, 1080×1350 or 1920×1080. Two built-in sample scenes — a sunset boulevard and a dusk pier, both drawn procedurally for this app — are there if you just want to play.

Everything runs in the browser from static files: your photos are read on your own machine and never uploaded, and the lettering is drawn with the system font stack, so the app works with no network at all. All artwork is original — no Rockstar Games logos, artwork or fonts.

How it is put together: `app/` holds the static app (`index.html`, `style.css`, and ES modules under `app/src/` — `layouts.js`, `grades.js`, `state.js`, `render.js`, `main.js`). `main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-app.ts`.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser

# to build the hand-in dossier:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=1tc58k7p&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/hessaminanloo/gta6-cover-art-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/hessaminanloo/gta6-cover-art-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Coast — Cover Studio

A free offline web app that turns any photo into GTA-style cover art: a
multi-panel poster with bold display lettering and a Vice City sunset or neon
colour grade, exported as a PNG to share. Built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Any photo, several panels** — add your own photos (or try the samples) and
  fill up to four panels with one photo or several. Click a panel in the live
  preview to select it, drag to move its photo, scroll or use the slider to zoom.
- **Five layouts** — Hero + Three, Four Panels, Triptych, Full Bleed, and
  tilted Snapshots over a retro striped sun.
- **Five grades** — Vice Sunset, Neon Nights, Golden Hour, Miami Teal, Noir
  Nights, each with an adjustable strength.
- **Lettering** — an editable title in Anton with a sunset gradient fill and a
  neon script subtitle in Pacifico, plus an optional “made with” badge.
- **Export** — one click exports a PNG at 1080 × 1080, 1080 × 1350 or
  1920 × 1080, or all three sizes at once.

## Run it offline

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network
request: every script, font and sample image is a file under `app/`, and photos
are read on your own machine — never uploaded.

## Original art

Everything here is original: no game logos, wordmarks, official artwork or
fonts. The display type is Anton and Pacifico, both under the SIL Open Font
License, vendored with their licence texts under `app/fonts/`. The two sample
photos under `app/samples/` were made for make.fun with an image model and are
free to use.

## Files

- `app/index.html`, `app/style.css` — the editor page
- `app/src/state.js` — the cover's state (photos, panels, layout, grade, caption)
- `app/src/layouts.js` — panel geometry for the five layouts
- `app/src/grades.js` — the five colour grades
- `app/src/cover.js` — the cover renderer (panels, retro sun, grain, title block)
- `app/src/main.js` — the editor wiring: upload, drag/zoom, export
- `app/src/shots.js` — fixed `?shot=` scenes for the screenshots
- `main.ts` — the make.fun entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `screenshots/` — the cover and the editor, captured from the app itself

## License

MIT — see `LICENSE`.

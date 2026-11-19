// Neon Coast — Cover Studio, a gta6-cover-art-01 entry (Node 22, standard
// library only). The app is this directory's app/ folder: plain static files a
// desktop browser loads offline (app/index.html and its ES modules, the Anton
// and Pacifico fonts vendored under app/fonts/ with their OFL texts, no library
// and no network request). This program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library. The app
// turns any photo into a multi-panel sunset poster — five layouts, five colour
// grades, editable display lettering — and exports it as a PNG in the three
// post sizes. Its two sample photos (app/samples/) were made with an image
// model for this entry and are free to use. The screenshots in screenshots/
// were taken from the app itself; the covers are the PNGs the app exported,
// scaled down to fit the limits (see shots.json for the scenes).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

if (!existsSync(join(here, 'app'))) {
  throw new Error(`app/ is missing beside ${here}main.ts — nothing to hand in`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, more than 993 files in app/ or 48 MiB of
// app files in all, or a path under app/ over 1000 bytes. app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

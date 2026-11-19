// Wires the page: load photos, pick a layout and grade, edit the caption, drag
// and zoom each panel's photo in the preview, and export the cover as a PNG in
// the three post sizes. A `?shot=` query sets up a fixed scene for a screenshot
// instead (./shots.js). Photos are read on the user's machine and never uploaded.
import { drawCover } from './cover.js';
import { runShot } from './shots.js';
import { LAYOUTS, GRADES, SIZES, freshState, syncPanels, panelCount } from './state.js';
import { layoutPanels, panelAt } from './layouts.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const state = freshState();
// The editor marks the selected panel with a dashed outline; a cover scene
// (a screenshot of the exported cover) never does.
let previewSelection = true;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  syncPanels(state);
  drawCover(canvas, state, { showSelection: previewSelection });
  canvas.classList.toggle('wide', state.size === 'wide');
  canvas.classList.toggle('tall', state.size === 'portrait');
  refreshPanelControls();
}

function setStatus(text) {
  status.textContent = text;
}

/** Renders the cover at `sizeId` on an offscreen canvas and downloads it as a PNG. */
export async function exportCover(sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0];
  const off = document.createElement('canvas');
  const savedSize = state.size;
  state.size = size.id;
  drawCover(off, state, { showSelection: false });
  state.size = savedSize;
  redraw();
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  if (!blob) {
    setStatus('Export failed — the cover could not be written.');
    return null;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `neon-coast-cover-${size.w}x${size.h}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  setStatus(`Saved neon-coast-cover-${size.w}x${size.h}.png`);
  return { w: size.w, h: size.h, bytes: blob.size };
}

// --- photo library -----------------------------------------------------------

const thumbsEl = document.getElementById('thumbs');

function refreshThumbs() {
  thumbsEl.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb' + (state.panels[state.selected]?.photo === i ? ' active' : '');
    wrap.title = photo.name;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb-img';
    b.setAttribute('aria-label', `Use photo ${i + 1} in the selected panel`);
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = String(i + 1);
    b.append(img, n);
    b.addEventListener('click', () => {
      state.panels[state.selected].photo = i;
      redraw();
    });
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'x';
    x.textContent = '×';
    x.title = 'Remove this photo';
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      removePhoto(i);
    });
    wrap.append(b, x);
    thumbsEl.append(wrap);
  });
}

async function addPhotoFile(file) {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  state.photos.push({ img, name: file.name, url });
  // Point empty panels at the new photo so it shows up right away.
  state.panels.forEach((p) => {
    if (p.photo == null) p.photo = state.photos.length - 1;
  });
  refreshThumbs();
  redraw();
}

function removePhoto(index) {
  const [gone] = state.photos.splice(index, 1);
  if (gone) URL.revokeObjectURL(gone.url);
  state.panels.forEach((p) => {
    if (p.photo === index) p.photo = state.photos.length ? 0 : null;
    else if (p.photo > index) p.photo -= 1;
  });
  refreshThumbs();
  redraw();
}

async function loadSamples() {
  for (const name of ['pier', 'boulevard']) {
    if (state.photos.some((p) => p.name === name)) continue;
    const img = await loadImage(`samples/${name}.jpg`);
    state.photos.push({ img, name, url: `samples/${name}.jpg` });
  }
  state.panels.forEach((p, i) => { if (p.photo == null) p.photo = i % state.photos.length; });
  refreshThumbs();
  redraw();
}

document.getElementById('photo').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try { await addPhotoFile(file); } catch { setStatus(`Could not read ${file.name}`); }
  }
  e.target.value = '';
});
document.getElementById('samples').addEventListener('click', loadSamples);
document.getElementById('fillAll').addEventListener('click', () => {
  if (!state.photos.length) return;
  state.panels.forEach((p) => { p.photo = 0; });
  redraw();
});

// --- layout, grade and caption controls --------------------------------------

const layoutsEl = document.getElementById('layouts');
LAYOUTS.forEach((layout) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = layout.label;
  b.dataset.id = layout.id;
  b.addEventListener('click', () => {
    state.layout = layout.id;
    syncPanels(state);
    layoutsEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    redraw();
  });
  layoutsEl.append(b);
});

const gradesEl = document.getElementById('grades');
GRADES.forEach((grade) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'swatch';
  b.dataset.id = grade.id;
  b.textContent = grade.label;
  b.title = grade.label;
  b.style.background = gradeSwatch(grade.id);
  b.addEventListener('click', () => {
    state.grade = grade.id;
    gradesEl.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('active', x === b));
    redraw();
  });
  gradesEl.append(b);
});

/** A little sunset strip for each grade swatch. */
function gradeSwatch(id) {
  const stops = {
    sunset: '#1d0f38, #ff6b35, #ff2e88',
    neon: '#0b0620, #3d0a5e, #00f5d4',
    gold: '#241505, #e8a33d, #ffd166',
    teal: '#04263b, #0b5563, #ff5e78',
    noir: '#0d0d0f, #3d3d46, #ff2e88',
  };
  return `linear-gradient(135deg, ${stops[id]})`;
}

document.getElementById('gradeStrength').addEventListener('input', (e) => {
  state.gradeStrength = Number(e.target.value) / 100;
  redraw();
});
captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
document.getElementById('titleSize').addEventListener('input', (e) => {
  state.titleScale = Number(e.target.value) / 100;
  redraw();
});
document.getElementById('showBadge').addEventListener('change', (e) => {
  state.showBadge = e.target.checked;
  redraw();
});

// --- the selected panel ------------------------------------------------------

const panelPhotosEl = document.getElementById('panelPhotos');
const zoomInput = document.getElementById('zoom');
const panelHint = document.getElementById('panelHint');

function refreshPanelControls() {
  const panel = state.panels[state.selected];
  panelHint.textContent = state.photos.length
    ? `Panel ${state.selected + 1} of ${panelCount(state.layout)} — drag it to move the photo, scroll to zoom.`
    : 'Add a photo first, then click a panel in the preview to fill it.';
  panelPhotosEl.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `${i + 1} · ${photo.name}`;
    b.classList.toggle('active', panel?.photo === i);
    b.addEventListener('click', () => { panel.photo = i; redraw(); });
    panelPhotosEl.append(b);
  });
  if (!state.photos.length) {
    const none = document.createElement('span');
    none.className = 'hint';
    none.textContent = 'No photos yet.';
    panelPhotosEl.append(none);
  }
  zoomInput.value = String(Math.round((panel?.zoom ?? 1) * 100));
}

zoomInput.addEventListener('input', () => {
  const panel = state.panels[state.selected];
  panel.zoom = Number(zoomInput.value) / 100;
  redraw();
});
document.getElementById('resetPanel').addEventListener('click', () => {
  const panel = state.panels[state.selected];
  panel.zoom = 1;
  panel.dx = 0;
  panel.dy = 0;
  redraw();
});
document.getElementById('resetAll').addEventListener('click', () => {
  state.panels.forEach((p) => { p.zoom = 1; p.dx = 0; p.dy = 0; });
  redraw();
});

// Drag to pan and scroll to zoom the selected panel's photo, on the preview.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (canvas.width / rect.width);
  const py = (e.clientY - rect.top) * (canvas.height / rect.height);
  const hit = panelAt(state.layout, canvas.width, canvas.height, px, py);
  if (hit === -1) return;
  state.selected = hit;
  drag = { x: e.clientX, y: e.clientY, panel: state.panels[hit] };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const panels = layoutPanels(state.layout, canvas.width, canvas.height);
  const r = panels[state.selected];
  if (!r) return;
  drag.panel.dx += ((e.clientX - drag.x) / rect.width) * (canvas.width / r.w);
  drag.panel.dy += ((e.clientY - drag.y) / rect.height) * (canvas.height / r.h);
  drag.x = e.clientX;
  drag.y = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[state.selected];
  panel.zoom = Math.max(1, Math.min(2.5, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });

// --- export ------------------------------------------------------------------

const sizesEl = document.getElementById('sizes');
SIZES.forEach((size) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = size.label;
  b.dataset.id = size.id;
  b.addEventListener('click', () => {
    state.size = size.id;
    sizesEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    redraw();
  });
  sizesEl.append(b);
});

document.getElementById('export').addEventListener('click', () => exportCover(state.size));
document.getElementById('exportTop').addEventListener('click', () => exportCover(state.size));
document.getElementById('exportAll').addEventListener('click', async () => {
  for (const size of SIZES) {
    await exportCover(size.id);
    await new Promise((r) => setTimeout(r, 300));
  }
  setStatus('Saved all three sizes.');
});

// --- boot --------------------------------------------------------------------

function markActive() {
  layoutsEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.id === state.layout));
  gradesEl.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('active', x.dataset.id === state.grade));
  sizesEl.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.id === state.size));
}

markActive();
refreshThumbs();

// The fonts draw the lettering: wait for them, then paint once for real.
async function boot() {
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    // The canvas falls back to system fonts if a vendored font fails.
  }
  redraw();
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  if (shot === 'cover') previewSelection = false;
  runShot(shot, new URLSearchParams(location.search), async (scene) => {
    state.layout = scene.layout;
    state.grade = scene.grade;
    state.size = scene.size;
    state.caption = scene.caption;
    state.subtitle = scene.subtitle;
    state.photos = [];
    for (const name of scene.photos) {
      const img = await loadImage(`samples/${name}.jpg`);
      state.photos.push({ img, name, url: `samples/${name}.jpg` });
    }
    state.panels.forEach((p, i) => { p.photo = i % state.photos.length; });
    // Optional per-panel crops for the scene ("dx,dy;dx,dy;..."), as a user
    // would set them by dragging a panel: they pick a better framing.
    if (scene.crops) {
      scene.crops.split(';').forEach((pair, i) => {
        const [dx, dy] = pair.split(',').map(Number);
        const p = state.panels[i];
        if (p && Number.isFinite(dx) && Number.isFinite(dy)) { p.dx = dx; p.dy = dy; }
      });
    }
    markActive();
    refreshThumbs();
    captionInput.value = state.caption;
    subtitleInput.value = state.subtitle;
    redraw();
  });
} else {
  boot();
}

// Test hook for the maker's own checks: renders every size and reports its pixels.
window.__coverApp = {
  state,
  redraw,
  exportCover,
  async renderSizes() {
    const out = [];
    for (const size of SIZES) {
      const off = document.createElement('canvas');
      const saved = state.size;
      state.size = size.id;
      const { w, h } = drawCover(off, state, { showSelection: false });
      state.size = saved;
      out.push({ id: size.id, w, h, bytes: off.toDataURL('image/png').length });
    }
    redraw();
    return out;
  },
};

// Neon Coast Cover Studio — editor wiring.
//
// Everything happens on this machine: photos are read from the file
// picker into memory, the cover is drawn on the stage canvas, and the
// export is that canvas handed back as a PNG download. Nothing is
// uploaded anywhere; there is no server side at all.
//
// The page also answers two ?shot= scenes used to take the entry's
// screenshots: ?shot=cover draws one cover full-frame at its export
// size, and ?shot=editor opens the editor with the samples loaded.

import { LAYOUTS, layoutById } from './layouts.js';
import { GRADES } from './grades.js';
import { SIZES, state, resetPanels, placeNewPhoto, fillRemainingPanels } from './state.js';
import { drawCover } from './render.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');

function render() {
  const inShotCover = document.body.classList.contains('shot-cover');
  drawCover(stage, state, inShotCover ? -1 : state.selected);
}

function buildChips(el, items, activeId, onPick, decorate) {
  el.innerHTML = '';
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (item.id === activeId ? ' active' : '');
    if (decorate) decorate(b, item);
    const label = document.createElement('span');
    label.textContent = item.name;
    b.appendChild(label);
    b.addEventListener('click', () => onPick(item));
    el.appendChild(b);
  });
}

function buildAllChips() {
  buildChips($('layoutChips'), LAYOUTS, state.layoutId, (item) => {
    state.layoutId = item.id;
    resetPanels();
    syncZoom();
    buildAllChips();
    render();
  });
  buildChips($('gradeChips'), GRADES, state.gradeId, (item) => {
    state.gradeId = item.id;
    buildAllChips();
    render();
  }, (b, item) => {
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(135deg, ${item.top}, ${item.bottom})`;
    b.appendChild(sw);
  });
  buildChips($('sizeChips'), SIZES, state.sizeId, (item) => {
    state.sizeId = item.id;
    buildAllChips();
    render();
  });
}

function buildThumbs() {
  const box = $('thumbs');
  box.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'thumb';
    t.title = `${photo.label} — click to put it in the selected panel`;
    const im = document.createElement('img');
    im.src = photo.img.src;
    im.alt = photo.label;
    t.appendChild(im);
    t.addEventListener('click', () => {
      const panel = state.panels[state.selected];
      if (panel) {
        panel.photo = i;
        render();
      }
    });
    box.appendChild(t);
  });
}

function addPhoto(img, label) {
  const index = state.photos.length;
  state.photos.push({ img, label });
  placeNewPhoto(index);
  fillRemainingPanels();
  buildThumbs();
  render();
}

function loadImage(src, label) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      addPhoto(img, label);
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function loadSamples() {
  return Promise.all([
    loadImage('samples/boulevard.jpg', 'Sunset Boulevard (built-in sample)'),
    loadImage('samples/pier.jpg', 'Dusk Pier (built-in sample)'),
  ]);
}

function syncInputs() {
  $('captionInput').value = state.caption;
  $('subtitleInput').value = state.subtitle;
}

function syncZoom() {
  const panel = state.panels[state.selected];
  $('zoomRange').value = panel ? panel.zoom : 1;
}

$('fileInput').addEventListener('change', (event) => {
  [...event.target.files].forEach((file) => {
    loadImage(URL.createObjectURL(file), file.name);
  });
  event.target.value = '';
});

$('samplesBtn').addEventListener('click', () => {
  loadSamples();
});

$('captionInput').addEventListener('input', (event) => {
  state.caption = event.target.value;
  render();
});

$('subtitleInput').addEventListener('input', (event) => {
  state.subtitle = event.target.value;
  render();
});

$('zoomRange').addEventListener('input', (event) => {
  const panel = state.panels[state.selected];
  if (panel) {
    panel.zoom = parseFloat(event.target.value);
    render();
  }
});

$('exportBtn').addEventListener('click', () => {
  drawCover(stage, state, -1);
  stage.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-cover-${state.sizeId}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    render();
  }, 'image/png');
});

let drag = null;

stage.addEventListener('pointerdown', (event) => {
  const r = stage.getBoundingClientRect();
  const ux = (event.clientX - r.left) / r.width;
  const uy = (event.clientY - r.top) / r.height;
  const layout = layoutById(state.layoutId);
  let idx = -1;
  layout.panels.forEach((p, i) => {
    if (ux >= p.x && ux < p.x + p.w && uy >= p.y && uy < p.y + p.h) idx = i;
  });
  if (idx < 0) return;
  state.selected = idx;
  const panel = state.panels[idx];
  drag = {
    idx,
    startX: ux,
    startY: uy,
    cx: panel.cx,
    cy: panel.cy,
    w: layout.panels[idx].w,
    h: layout.panels[idx].h,
  };
  stage.setPointerCapture(event.pointerId);
  syncZoom();
  render();
});

stage.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const r = stage.getBoundingClientRect();
  const ux = (event.clientX - r.left) / r.width;
  const uy = (event.clientY - r.top) / r.height;
  const panel = state.panels[drag.idx];
  panel.cx = Math.min(1, Math.max(0, drag.cx - (ux - drag.startX) / drag.w));
  panel.cy = Math.min(1, Math.max(0, drag.cy - (uy - drag.startY) / drag.h));
  render();
});

stage.addEventListener('pointerup', () => {
  drag = null;
});

function applyParams() {
  const q = new URLSearchParams(location.search);
  if (q.get('layout')) state.layoutId = q.get('layout');
  if (q.get('grade')) state.gradeId = q.get('grade');
  if (q.get('size')) state.sizeId = q.get('size');
  if (q.get('caption') !== null) state.caption = q.get('caption');
  if (q.get('subtitle') !== null) state.subtitle = q.get('subtitle');
  return q.get('shot');
}

async function init() {
  const shot = applyParams();
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  buildAllChips();
  resetPanels();
  syncInputs();
  syncZoom();
  render();
  if (shot) {
    await loadSamples();
    render();
  }
  window.__shotReady = true;
}

window.neonCoast = { state, drawCover, loadSamples };

init();

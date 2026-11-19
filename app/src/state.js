// Shared editor state for Neon Coast Cover Studio: the photos loaded
// from the person's own machine, which photo sits in which panel, and
// how each panel's photo is framed (focus point and zoom).

import { layoutById } from './layouts.js';

export const SIZES = [
  { id: 'square', name: 'Square · 1080×1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait · 1080×1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide · 1920×1080', w: 1920, h: 1080 },
];

export function sizeById(id) {
  return SIZES.find((size) => size.id === id) || SIZES[0];
}

// A panel with photo -1 has no photo yet and is drawn as poster art.
export function blankPanel(photoIndex) {
  return { photo: photoIndex, cx: 0.5, cy: 0.5, zoom: 1 };
}

export const state = {
  photos: [], // [{ img, label }]
  layoutId: 'hero',
  gradeId: 'sunset',
  sizeId: 'wide',
  caption: 'NEON SHORE',
  subtitle: 'every tide has a price',
  panels: [],
  selected: 0,
};

export function resetPanels() {
  const layout = layoutById(state.layoutId);
  state.panels = layout.panels.map((_, i) =>
    blankPanel(state.photos.length ? i % state.photos.length : -1));
  state.selected = 0;
}

export function setLayout(id) {
  state.layoutId = id;
  resetPanels();
}

// When a photo arrives, give it to the first panel still showing
// poster art; if every panel has a photo, give it to the first panel
// whose photo is already used by an earlier panel, so a fresh photo
// always lands somewhere visible.
export function placeNewPhoto(photoIndex) {
  const empty = state.panels.find((panel) => panel.photo === -1);
  if (empty) {
    empty.photo = photoIndex;
    return;
  }
  const seen = new Set();
  for (const panel of state.panels) {
    if (seen.has(panel.photo)) {
      panel.photo = photoIndex;
      return;
    }
    seen.add(panel.photo);
  }
}

// Any panel still without a photo borrows one round-robin, so a
// layout with more panels than photos never shows an empty slot.
export function fillRemainingPanels() {
  if (!state.photos.length) return;
  state.panels.forEach((panel, i) => {
    if (panel.photo === -1) panel.photo = i % state.photos.length;
  });
}

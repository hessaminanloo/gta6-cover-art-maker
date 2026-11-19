// Panel geometry: where each panel of a layout sits inside the cover, as fractions
// of the cover's width and height, plus where the title block begins. Every layout
// reserves the bottom band for the title; panels fill the space above it.
import { panelCount } from './state.js';

const GUTTER = 0.008; // gap between panels, as a fraction of the cover width

/** Rectangles for every panel of `layout` at cover size `w` x `h`. */
export function layoutPanels(layout, w, h) {
  const titleTop = h * 0.78;
  const top = 0;
  const bottom = titleTop - h * GUTTER;
  const left = 0;
  const right = w;
  const g = w * GUTTER;
  const panels = [];

  if (layout === 'hero') {
    const split = w * 0.60;
    panels.push({ x: left, y: top, w: split - g / 2, h: bottom - top });
    const colX = split + g / 2;
    const colW = right - colX;
    const third = (bottom - top - 2 * g) / 3;
    for (let i = 0; i < 3; i++) {
      panels.push({ x: colX, y: top + i * (third + g), w: colW, h: third });
    }
  } else if (layout === 'grid') {
    const half = (right - left - g) / 2;
    const mid = (bottom - top - g) / 2;
    panels.push({ x: left, y: top, w: half, h: mid });
    panels.push({ x: left + half + g, y: top, w: half, h: mid });
    panels.push({ x: left, y: top + mid + g, w: half, h: bottom - top - mid - g });
    panels.push({ x: left + half + g, y: top + mid + g, w: half, h: bottom - top - mid - g });
  } else if (layout === 'triptych') {
    const third = (right - left - 2 * g) / 3;
    for (let i = 0; i < 3; i++) {
      panels.push({ x: left + i * (third + g), y: top, w: third, h: bottom - top });
    }
  } else if (layout === 'bleed') {
    panels.push({ x: left, y: top, w: right - left, h: bottom - top });
  } else if (layout === 'snapshots') {
    // Three tilted snapshots overlapping the sky; the tilt is drawn, not in the rect.
    const sw = w * 0.42;
    const sh = (bottom - top) * 0.62;
    panels.push({ x: w * 0.05, y: top + (bottom - top) * 0.05, w: sw, h: sh });
    panels.push({ x: w * 0.53, y: top + (bottom - top) * 0.02, w: sw, h: sh });
    panels.push({ x: w * 0.29, y: top + (bottom - top) * 0.34, w: sw, h: sh });
  }
  return panels.slice(0, panelCount(layout));
}

/** The title band: from `titleTop` to the foot of the cover. */
export function titleBand(w, h) {
  return { x: 0, y: h * 0.78, w, h: h * 0.22 };
}

/** Which panel, if any, holds the point (px, py) on a cover of size `w` x `h`. */
export function panelAt(layout, w, h, px, py) {
  const panels = layoutPanels(layout, w, h);
  for (let i = panels.length - 1; i >= 0; i--) {
    const r = panels[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

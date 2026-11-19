// Panel geometry: where each panel of a layout sits inside the cover, as
// rectangles in cover pixels, plus where the title band begins. Every layout
// keeps the bottom band free for the title; the panels fill the space above it.
import { panelCount } from './state.js';

// The gap between panels, as a share of the cover width.
const GAP = 0.008;

/** The rectangles of every panel of `layout` on a cover of `w` by `h`. */
export function layoutPanels(layout, w, h) {
  // An unknown layout id falls back to the hero geometry, never to nothing.
  if (layout !== 'hero' && layout !== 'grid' && layout !== 'triptych' && layout !== 'bleed' && layout !== 'snapshots') {
    layout = 'hero';
  }
  const titleTop = h * 0.78;
  const top = 0;
  const bottom = titleTop - h * GAP;
  const g = w * GAP;
  const out = [];

  if (layout === 'hero') {
    // One tall hero on the left, three stacked on the right.
    const split = w * 0.6;
    out.push({ x: 0, y: top, w: split - g / 2, h: bottom - top });
    const colX = split + g / 2;
    const colW = w - colX;
    const third = (bottom - top - 2 * g) / 3;
    for (let i = 0; i < 3; i++) {
      out.push({ x: colX, y: top + i * (third + g), w: colW, h: third });
    }
  } else if (layout === 'grid') {
    // Two by two, equal quarters.
    const half = (w - g) / 2;
    const mid = (bottom - top - g) / 2;
    out.push({ x: 0, y: top, w: half, h: mid });
    out.push({ x: half + g, y: top, w: half, h: mid });
    out.push({ x: 0, y: top + mid + g, w: half, h: bottom - top - mid - g });
    out.push({ x: half + g, y: top + mid + g, w: half, h: bottom - top - mid - g });
  } else if (layout === 'triptych') {
    // Three equal columns.
    const third = (w - 2 * g) / 3;
    for (let i = 0; i < 3; i++) {
      out.push({ x: i * (third + g), y: top, w: third, h: bottom - top });
    }
  } else if (layout === 'bleed') {
    // One photo edge to edge.
    out.push({ x: 0, y: top, w, h: bottom - top });
  } else if (layout === 'snapshots') {
    // Three overlapping prints under the sky; the tilt is drawn, not in the rect.
    const sw = w * 0.42;
    const sh = (bottom - top) * 0.62;
    out.push({ x: w * 0.05, y: top + (bottom - top) * 0.05, w: sw, h: sh });
    out.push({ x: w * 0.53, y: top + (bottom - top) * 0.02, w: sw, h: sh });
    out.push({ x: w * 0.29, y: top + (bottom - top) * 0.34, w: sw, h: sh });
  }
  return out.slice(0, panelCount(layout));
}

/** The title band: the bottom 22% of the cover, full width. */
export function titleBand(w, h) {
  return { x: 0, y: h * 0.78, w, h: h * 0.22 };
}

/** The index of the panel holding point (px, py), or -1 when there is none. */
export function panelAt(layout, w, h, px, py) {
  const panels = layoutPanels(layout, w, h);
  for (let i = panels.length - 1; i >= 0; i -= 1) {
    const r = panels[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

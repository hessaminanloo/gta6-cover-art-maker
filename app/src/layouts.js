// Panel layouts for Neon Coast Cover Studio.
//
// Every layout is a list of rectangles in unit space (0..1 on both
// axes), so the same composition can be drawn at any export size.
// Panels are painted in list order: in Full Bleed + Inset the small
// panel lands on top of the full-frame one, like a snapshot taped
// over a poster.

export const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero Trio',
    panels: [
      { x: 0, y: 0, w: 0.56, h: 1 },
      { x: 0.56, y: 0, w: 0.44, h: 0.5 },
      { x: 0.56, y: 0.5, w: 0.44, h: 0.5 },
    ],
  },
  {
    id: 'quad',
    name: 'Quad Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: 'strip',
    name: 'Skyline Strip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.54 },
      { x: 0, y: 0.54, w: 0.3333, h: 0.46 },
      { x: 0.3333, y: 0.54, w: 0.3334, h: 0.46 },
      { x: 0.6667, y: 0.54, w: 0.3333, h: 0.46 },
    ],
  },
  {
    id: 'stage',
    name: 'Center Stage',
    panels: [
      { x: 0.27, y: 0, w: 0.46, h: 1 },
      { x: 0, y: 0, w: 0.27, h: 0.5 },
      { x: 0, y: 0.5, w: 0.27, h: 0.5 },
      { x: 0.73, y: 0, w: 0.27, h: 0.5 },
      { x: 0.73, y: 0.5, w: 0.27, h: 0.5 },
    ],
  },
  {
    id: 'bleed',
    name: 'Full Bleed + Inset',
    panels: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 0.585, y: 0.56, w: 0.415, h: 0.44 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}

// The cover's state: which photos are loaded, how each panel is filled, the layout,
// the colour grade, the lettering and the export size. Photos live only in memory
// (object URLs from the user's machine), so nothing is ever uploaded.
export const LAYOUTS = [
  { id: 'hero', label: 'Hero + Three' },
  { id: 'grid', label: 'Four Panels' },
  { id: 'triptych', label: 'Triptych' },
  { id: 'bleed', label: 'Full Bleed' },
  { id: 'snapshots', label: 'Snapshots' },
];

export const GRADES = [
  { id: 'sunset', label: 'Vice Sunset' },
  { id: 'neon', label: 'Neon Nights' },
  { id: 'gold', label: 'Golden Hour' },
  { id: 'teal', label: 'Miami Teal' },
  { id: 'noir', label: 'Noir Nights' },
];

export const SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

/** One panel's photo placement: which photo, how far zoomed, how far panned. */
export function freshPanel(photoIndex) {
  return { photo: photoIndex, zoom: 1, dx: 0, dy: 0 };
}

/** The default cover: hero layout, sunset grade, no photos yet. */
export function freshState() {
  return {
    photos: [], // { img, name, url }
    layout: 'hero',
    grade: 'sunset',
    gradeStrength: 0.85,
    caption: 'Neon Shore',
    subtitle: 'chasing the sunset',
    titleScale: 1,
    showBadge: true,
    size: 'square',
    panels: [freshPanel(0), freshPanel(1), freshPanel(2), freshPanel(0)],
    selected: 0,
  };
}

/** How many panels the current layout shows (snapshots and bleed use fewer). */
export function panelCount(layout) {
  if (layout === 'bleed') return 1;
  if (layout === 'triptych') return 3;
  if (layout === 'snapshots') return 3;
  return 4; // hero and grid
}

/** Keep the panels array in step when the layout changes. */
export function syncPanels(state) {
  const n = panelCount(state.layout);
  while (state.panels.length < n) state.panels.push(freshPanel(state.panels.length % Math.max(1, state.photos.length)));
  state.panels.length = n;
  if (state.selected >= n) state.selected = 0;
}

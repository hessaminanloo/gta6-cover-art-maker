// The cover's state: which photos are loaded, how each panel is filled, the
// layout, the colour grade, the lettering and the export size. Photos live only
// in memory (object URLs from the user's own machine), so a photo is never
// uploaded anywhere.

/** The five panel layouts the editor offers. */
export const LAYOUTS = [
  { id: 'hero', label: 'Hero + Three' },
  { id: 'grid', label: 'Four Panels' },
  { id: 'triptych', label: 'Triptych' },
  { id: 'bleed', label: 'Full Bleed' },
  { id: 'snapshots', label: 'Snapshots' },
];

/** The five colour grades the editor offers. */
export const GRADES = [
  { id: 'sunset', label: 'Vice Sunset' },
  { id: 'neon', label: 'Neon Nights' },
  { id: 'gold', label: 'Golden Hour' },
  { id: 'teal', label: 'Miami Teal' },
  { id: 'noir', label: 'Noir Nights' },
];

/** The three post sizes the cover exports to. */
export const SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

/** A fresh placement for one panel: which photo, at what zoom and pan. */
export function freshPanel(photoIndex) {
  return { photo: photoIndex, zoom: 1, dx: 0, dy: 0 };
}

/** A fresh cover: hero layout, sunset grade, no photos loaded yet. */
export function freshState() {
  return {
    photos: [], // each { img, name, url }
    layout: 'hero',
    grade: 'sunset',
    gradeStrength: 0.85,
    caption: 'Neon Shore',
    subtitle: 'chasing the sunset',
    titleScale: 1,
    showBadge: true,
    size: 'square',
    // Panels start empty (null photo) so nothing points at a photo that does
    // not exist yet; the first loaded photo fills them.
    panels: [freshPanel(null), freshPanel(null), freshPanel(null), freshPanel(null)],
    selected: 0,
  };
}

/** How many panels a layout shows: bleed has one, triptych and snapshots three, the rest four. */
export function panelCount(layout) {
  switch (layout) {
    case 'bleed': return 1;
    case 'triptych':
    case 'snapshots': return 3;
    default: return 4;
  }
}

/** Grow or shrink the panels array so it matches the current layout. */
export function syncPanels(state) {
  const want = panelCount(state.layout);
  while (state.panels.length < want) {
    const fallback = state.photos.length ? state.panels.length % state.photos.length : 0;
    state.panels.push(freshPanel(fallback));
  }
  state.panels.length = want;
  if (state.selected >= want) state.selected = 0;
}

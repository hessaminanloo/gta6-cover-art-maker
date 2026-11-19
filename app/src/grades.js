// Colour grades: a sunset or neon wash laid over the photos, the sky behind the
// panels, and the colours of the title lettering. All original — nothing taken
// from any game.
export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    sky: ['#1d0f38', '#7b2d8b', '#ff6b35'],
    filter: 'saturate(1.28) contrast(1.08) brightness(1.02)',
    washTop: '#ff9a3d',
    washBottom: '#ff2e88',
    washAlpha: 0.30,
    title: ['#ffe259', '#ffa751', '#ff2e63'],
    titleStroke: '#2b0a3d',
    sub: '#7df9ff',
    glow: '#ff2e88',
  },
  neon: {
    label: 'Neon Nights',
    sky: ['#0b0620', '#1b0f3b', '#3d0a5e'],
    filter: 'saturate(1.45) contrast(1.14) brightness(1.0)',
    washTop: '#00f5d4',
    washBottom: '#ff2e88',
    washAlpha: 0.40,
    title: ['#00f5d4', '#ff2e88', '#fee440'],
    titleStroke: '#0b0620',
    sub: '#fee440',
    glow: '#00f5d4',
  },
  gold: {
    label: 'Golden Hour',
    sky: ['#241505', '#7a4a12', '#e8a33d'],
    filter: 'saturate(1.22) contrast(1.06) brightness(1.06) sepia(0.18)',
    washTop: '#ffd166',
    washBottom: '#ef8354',
    washAlpha: 0.26,
    title: ['#fff3b0', '#ffd166', '#ef8354'],
    titleStroke: '#241505',
    sub: '#fff3b0',
    glow: '#ffb347',
  },
  teal: {
    label: 'Miami Teal',
    sky: ['#04263b', '#0b5563', '#ff5e78'],
    filter: 'saturate(1.35) contrast(1.1) brightness(1.03)',
    washTop: '#2ec4b6',
    washBottom: '#ff5e78',
    washAlpha: 0.30,
    title: ['#caf0f8', '#2ec4b6', '#ff5e78'],
    titleStroke: '#04263b',
    sub: '#ff8fa3',
    glow: '#2ec4b6',
  },
  noir: {
    label: 'Noir Nights',
    sky: ['#0d0d0f', '#232326', '#3d3d46'],
    filter: 'grayscale(1) contrast(1.22) brightness(1.05)',
    washTop: '#ffffff',
    washBottom: '#ff2e88',
    washAlpha: 0.16,
    title: ['#ffffff', '#ffd6e8', '#ff2e88'],
    titleStroke: '#0d0d0f',
    sub: '#ff8fb8',
    glow: '#ff2e88',
  },
};

/** Looks a grade up by id, falling back to the sunset grade. */
export function gradeById(id) {
  return GRADES[id] ?? GRADES.sunset;
}

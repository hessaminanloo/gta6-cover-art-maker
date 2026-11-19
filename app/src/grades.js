// Colour grades for Neon Coast Cover Studio.
//
// A grade is a two-stop gradient laid over every panel (hot colour at
// the top of the frame melting into the second at the bottom), the
// saturation and contrast the photo itself is drawn with, and an ink
// colour the lettering borrows for its glow and subtitle.

export const GRADES = [
  { id: 'sunset', name: 'Sunset Melt', top: '#ff9a3d', bottom: '#ff2e88', ink: '#ffd76a', sat: 1.28, con: 1.06, lift: 0.42 },
  { id: 'neon', name: 'Neon Nights', top: '#12e6ff', bottom: '#b537f2', ink: '#5ff2ff', sat: 1.38, con: 1.10, lift: 0.46 },
  { id: 'golden', name: 'Golden Hour', top: '#ffe259', bottom: '#ff7b39', ink: '#ffe9a3', sat: 1.16, con: 1.03, lift: 0.38 },
  { id: 'miami', name: 'Miami Teal', top: '#0affd1', bottom: '#0077ff', ink: '#a3ffe9', sat: 1.22, con: 1.08, lift: 0.40 },
  { id: 'dusk', name: 'Dusk Violet', top: '#3d348b', bottom: '#f72585', ink: '#ffb3d9', sat: 1.32, con: 1.12, lift: 0.44 },
];

export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}

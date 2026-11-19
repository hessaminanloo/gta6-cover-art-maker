// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone, full frame. The cover scene draws with
// the app's own renderer, so the screenshot shows exactly what the app exports.
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, load) {
  // Wait for the vendored display fonts so the lettering draws as it really looks.
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    // If a font fails to load the canvas still draws with its fallback.
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const caption = query.get('caption') ?? 'Neon Shore';
  const subtitle = query.get('subtitle') ?? 'chasing the sunset';
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'square';
  const photos = (query.get('photos') ?? 'pier,boulevard').split(',');
  const crops = query.get('crops') ?? '';
  await load({ photos, caption, subtitle, layout, grade, size, crops });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

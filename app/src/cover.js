// Draws the cover onto a canvas: the sky, the photo panels with their grade, the
// retro sun, grain and vignette, and the title block with its display lettering.
// The same drawing serves the live preview and the exported PNG — the export just
// draws it bigger. Original art direction throughout: no game logos, artwork or fonts.
import { layoutPanels, titleBand } from './layouts.js';
import { gradeById } from './grades.js';
import { SIZES } from './state.js';

let grainTile = null;

/** A small tile of random grey noise, reused for the grain overlay. */
export function makeGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 110 + Math.floor(Math.random() * 90);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainTile = tile;
  return tile;
}

/** Draws one photo into a panel rect, cover-fit, with the panel's zoom and pan. */
export function drawPhotoInto(ctx, img, rect, panel, grade, strength) {
  if (!img) return false;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return false;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * (panel?.zoom ?? 1);
  const pw = iw * scale;
  const ph = ih * scale;
  // Clamp the pan so the photo always covers the panel — no empty gaps.
  const maxDx = Math.max(0, (pw - rect.w) / 2 / rect.w);
  const maxDy = Math.max(0, (ph - rect.h) / 2 / rect.h);
  const dx = Math.max(-maxDx, Math.min(maxDx, panel?.dx ?? 0));
  const dy = Math.max(-maxDy, Math.min(maxDy, panel?.dy ?? 0));
  const cx = rect.x + rect.w / 2 + dx * rect.w;
  const cy = rect.y + rect.h / 2 + dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = grade.filter;
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.filter = 'none';
  // Sunset / neon wash over the photo, stronger toward the foot.
  const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  wash.addColorStop(0, hexWithAlpha(grade.washTop, grade.washAlpha * 0.35 * strength));
  wash.addColorStop(1, hexWithAlpha(grade.washBottom, grade.washAlpha * strength));
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // A little depth at the foot of the photo.
  const shade = ctx.createLinearGradient(0, rect.y + rect.h * 0.6, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(10, 4, 24, 0)');
  shade.addColorStop(1, 'rgba(10, 4, 24, 0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  return true;
}

/** A panel with no photo yet: dark sky with a clear "add a photo" cue. */
export function drawEmptyPanel(ctx, rect) {
  ctx.save();
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#2a1a4d');
  g.addColorStop(1, '#120e1e');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = Math.max(1, rect.w * 0.004);
  ctx.setLineDash([rect.w * 0.02, rect.w * 0.015]);
  ctx.strokeRect(rect.x + rect.w * 0.04, rect.y + rect.h * 0.04, rect.w * 0.92, rect.h * 0.92);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `700 ${Math.max(12, rect.w * 0.055)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+ ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.restore();
}

/** The retro striped sun: a gradient disc with its lower half cut into bands. */
export function drawRetroSun(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, '#ffe259');
  g.addColorStop(0.55, '#ffa751');
  g.addColorStop(1, grade.washBottom);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.05;
  let thick = r * 0.045;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, thick);
    y += thick + r * 0.085;
    thick *= 1.45;
  }
  ctx.restore();
}

/** Film grain and a soft vignette over the whole cover. */
export function drawGrainAndVignette(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = ctx.createPattern(makeGrainTile(), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  v.addColorStop(0, 'rgba(8, 3, 20, 0)');
  v.addColorStop(1, 'rgba(8, 3, 20, 0.30)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** The title block: gradient band, big Anton title, Pacifico subtitle, badge. */
export function drawTitleBlock(ctx, state, w, h, grade) {
  const band = titleBand(w, h);
  const g = ctx.createLinearGradient(0, band.y, 0, h);
  g.addColorStop(0, 'rgba(16, 6, 34, 0)');
  g.addColorStop(0.35, 'rgba(16, 6, 34, 0.88)');
  g.addColorStop(1, 'rgba(10, 3, 22, 0.96)');
  ctx.fillStyle = g;
  ctx.fillRect(band.x, band.y, band.w, band.h);

  const title = (state.caption || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const strength = state.gradeStrength;

  if (sub) {
    const subSize = h * 0.042;
    ctx.save();
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = subSize * 0.7;
    ctx.fillStyle = grade.sub;
    ctx.fillText(sub, w / 2, band.y + band.h * 0.26);
    ctx.restore();
  }

  if (title) {
    let size = h * 0.115 * (state.titleScale ?? 1);
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(title).width > w * 0.92 && size > 14) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const ty = band.y + band.h * (sub ? 0.78 : 0.62);
    const grad = ctx.createLinearGradient(0, ty - size, 0, ty + size * 0.2);
    grade.title.forEach((stop, i) => grad.addColorStop(i / (grade.title.length - 1), stop));
    ctx.save();
    ctx.translate(w / 2, ty);
    ctx.transform(1, 0, -0.05, 1, 0, 0); // a slight poster slant
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = grade.titleStroke;
    ctx.lineWidth = Math.max(2, size * 0.16);
    ctx.strokeText(title, 0, 0);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillStyle = grad;
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }

  if (state.showBadge) {
    const badgeText = '★ MADE WITH NEON COAST';
    const bh = h * 0.032;
    const by = band.y + band.h * 0.10;
    ctx.save();
    ctx.font = `700 ${Math.max(9, bh * 0.42)}px system-ui, sans-serif`;
    // Size the pill to the text so the words never run past its ends.
    const bw = ctx.measureText(badgeText).width + bh * 1.4;
    const bx = w - bw - w * 0.02;
    ctx.translate(bx + bw / 2, by + bh / 2);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = '#1d0f38';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, 1);
    ctx.restore();
  }
  return band;
}

/** Draws the whole cover on `canvas` at the state's export size. */
export function drawCover(canvas, state, options = {}) {
  const size = SIZES.find((s) => s.id === state.size) ?? SIZES[0];
  const w = size.w;
  const h = size.h;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const strength = state.gradeStrength;

  // Sky behind everything: it shows through the gutters and behind the snapshots.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const panels = layoutPanels(state.layout, w, h);
  const tilts = [-0.05, 0.045, -0.02, 0.03];

  if (state.layout === 'snapshots') {
    drawRetroSun(ctx, w * 0.5, h * 0.26, w * 0.17, grade);
  }

  panels.forEach((rect, i) => {
    const panel = state.panels[i];
    const photo = panel && panel.photo != null ? state.photos[panel.photo] : null;
    const border = Math.max(3, w * 0.006);
    if (state.layout === 'snapshots') {
      // A tilted photo print: white frame, soft shadow, slight rotation.
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(tilts[i % tilts.length]);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = w * 0.02;
      ctx.shadowOffsetY = h * 0.008;
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(-rect.w / 2 - border, -rect.h / 2 - border, rect.w + border * 2, rect.h + border * 2);
      ctx.shadowColor = 'transparent';
      ctx.restore();
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(tilts[i % tilts.length]);
      ctx.beginPath();
      ctx.rect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
      ctx.clip();
      if (photo) {
        drawPhotoInto(ctx, photo.img, { x: -rect.w / 2, y: -rect.h / 2, w: rect.w, h: rect.h }, panel, grade, strength);
      } else {
        drawEmptyPanel(ctx, { x: -rect.w / 2, y: -rect.h / 2, w: rect.w, h: rect.h });
      }
      ctx.restore();
    } else {
      if (photo) {
        drawPhotoInto(ctx, photo.img, rect, panel, grade, strength);
      } else {
        drawEmptyPanel(ctx, rect);
      }
      ctx.save();
      ctx.strokeStyle = '#fdfbf7';
      ctx.lineWidth = border;
      ctx.strokeRect(rect.x + border / 2, rect.y + border / 2, rect.w - border, rect.h - border);
      ctx.restore();
    }
    if (options.showSelection && i === state.selected) {
      ctx.save();
      ctx.strokeStyle = '#ff2e88';
      ctx.lineWidth = Math.max(3, w * 0.005);
      ctx.setLineDash([w * 0.02, w * 0.012]);
      ctx.strokeRect(rect.x - w * 0.004, rect.y - w * 0.004, rect.w + w * 0.008, rect.h + w * 0.008);
      ctx.restore();
    }
  });

  drawGrainAndVignette(ctx, w, h);
  drawTitleBlock(ctx, state, w, h, grade);
  return { w, h };
}

/** '#rrggbb' with an alpha channel, as an rgba() string. */
export function hexWithAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
